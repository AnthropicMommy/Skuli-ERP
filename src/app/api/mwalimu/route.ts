import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { getCbcSubjects } from "@/lib/cbc";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const INDEPENDENT_SESSION_MAX_TOKENS = 100000;
const INDEPENDENT_SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const INDEPENDENT_DAILY_SESSIONS = 999;

// Model chain: Gemini 2.0 Flash first, then Groq Llama 3.3 70B fallback
interface ModelProvider {
  name: string;
  call: (messages: { role: string; content: string }[]) => Promise<{ reply: string; tokensUsed: number }>;
}

async function callGemini(messages: { role: string; content: string }[]): Promise<{ reply: string; tokensUsed: number }> {
  if (!GEMINI_API_KEY) throw new Error("No Gemini API key");

  const systemMsg = messages.find((m) => m.role === "system");
  const userMsgs = messages.filter((m) => m.role !== "system");

  const contents = userMsgs.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error: ${res.status} ${err.substring(0, 200)}`);
  }

  const data = await res.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) throw new Error("Empty Gemini response");

  const tokensUsed = data.usageMetadata?.totalTokenCount || 0;
  return { reply, tokensUsed };
}

async function callGroq(messages: { role: string; content: string }[]): Promise<{ reply: string; tokensUsed: number }> {
  if (!GROQ_API_KEY) throw new Error("No Groq API key");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error: ${res.status} ${err.substring(0, 200)}`);
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content;
  if (!reply) throw new Error("Empty Groq response");

  const tokensUsed = data.usage?.total_tokens || 0;
  return { reply, tokensUsed };
}

async function callWithFallback(messages: { role: string; content: string }[]): Promise<{ reply: string; tokensUsed: number; model: string }> {
  const providers: { name: string; fn: typeof callGemini }[] = [];

  if (GEMINI_API_KEY) providers.push({ name: "gemini-2.0-flash", fn: callGemini });
  if (GROQ_API_KEY) providers.push({ name: "llama-3.3-70b", fn: callGroq });

  if (providers.length === 0) throw new Error("No AI providers configured");

  let lastError: Error | null = null;
  for (const provider of providers) {
    try {
      const result = await provider.fn(messages);
      return { ...result, model: provider.name };
    } catch (err) {
      lastError = err as Error;
      console.error(`Provider ${provider.name} failed:`, (err as Error).message);
    }
  }

  throw lastError || new Error("All AI providers failed");
}

export async function POST(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifyToken(token);
  if (!session) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const studentId = "studentId" in session ? session.studentId : null;
  const schoolId = "schoolId" in session ? session.schoolId : null;
  if (!studentId || !schoolId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const isIndependent = "isIndependent" in session && session.isIndependent === true;

  const { message, subject, classId, conversationHistory = [] } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  let activeSession = null;
  let sessionTokensRemaining = null;
  let sessionExpiresAt = null;

  if (isIndependent) {
    activeSession = await prisma.mwalimuSession.findFirst({
      where: { studentId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!activeSession) {
      activeSession = await prisma.mwalimuSession.create({
        data: {
          studentId,
          maxTokens: INDEPENDENT_SESSION_MAX_TOKENS,
          expiresAt: new Date(Date.now() + INDEPENDENT_SESSION_DURATION_MS),
        },
      });
    }

    if (activeSession.tokensUsed >= activeSession.maxTokens) {
      activeSession = await prisma.mwalimuSession.update({
        where: { id: activeSession.id },
        data: {
          maxTokens: activeSession.maxTokens + INDEPENDENT_SESSION_MAX_TOKENS,
          expiresAt: new Date(Date.now() + INDEPENDENT_SESSION_DURATION_MS),
        },
      });
    }

    sessionTokensRemaining = activeSession.maxTokens - activeSession.tokensUsed;
    sessionExpiresAt = activeSession.expiresAt.toISOString();
  }

  const grade = "grade" in session ? Number(session.grade) : 4;
  const studentName = "name" in session ? session.name : "Student";

  let gradeLevel = "Upper Primary";
  if (grade <= 3) gradeLevel = "Lower Primary";
  else if (grade <= 6) gradeLevel = "Upper Primary";
  else if (grade <= 9) gradeLevel = "Junior Secondary";
  else gradeLevel = "Senior Secondary";

  const subjects = getCbcSubjects(grade);
  const subjectList = subjects.map((s) => s.name).join(", ");

  let profileContext = "";
  if (isIndependent) {
    try {
      const profile = await prisma.studentProfile.findUnique({ where: { studentId } });
      if (profile) {
        const parsedSubjects = JSON.parse(profile.subjects);
        profileContext = `\n\nStudent profile:\n- Grade: ${profile.grade}\n- Subjects they need help with: ${parsedSubjects.join(", ")}\n- Biggest challenge: ${profile.challenge}\n- Main goal: ${profile.goal}\nTailor your responses to focus on their challenge areas and goal.`;
      }
    } catch {}
  }

  let materialContext = "";
  if (!isIndependent && subject && classId) {
    try {
      const materials = await prisma.material.findMany({
        where: { organizationId: schoolId, classId, subject },
        take: 5,
        select: { title: true, description: true, type: true },
      });
      if (materials.length > 0) {
        materialContext = `\n\nAvailable study materials for this class/subject:\n${materials.map((m) => `- ${m.title} (${m.type})${m.description ? ": " + m.description : ""}`).join("\n")}\nUse these materials as reference when answering questions.`;
      }
    } catch {}
  }

  const systemPrompt = `You are Mwalimu, an AI learning assistant for Kenyan students following the Competency-Based Curriculum (CBC).

Student: ${studentName}, Grade ${grade} (${gradeLevel})${classId ? ` (Class ID: ${classId})` : ""}
Available subjects: ${subjectList}
${subject ? `Current subject: ${subject}` : ""}
${profileContext}${materialContext}

Your role:
- Explain concepts simply, appropriate for the grade level
- Generate practice questions and quizzes
- Help with homework step-by-step
- Encourage and motivate students
- Switch between English and Kiswahili when asked
- For Lower Primary (Grades 1-3), use very simple language and examples
- For Upper Primary (Grades 4-6), use more detailed explanations
- For Junior Secondary (Grades 7-9), use age-appropriate teen language
- For Senior Secondary (Grades 10-12), use more academic and detailed explanations
- Reference Kenyan context (shillings, local examples, Kenyan culture)
- Research topics thoroughly when asked
- Help solve hard equations step-by-step
- Suggest practice problems to reinforce learning
- For Grade 6 students, mention KPSEA preparation when relevant
- For Grade 9 students, mention pathway selection when relevant
- For Grade 12 students, mention KCSE preparation when relevant

Formatting rules (IMPORTANT):
- Do NOT use markdown formatting like asterisks (*), underscores, or hashtags
- Write in plain text only
- Use bullet points with dashes (-) or numbers (1., 2., 3.) for lists
- Use line breaks to separate ideas
- Keep it clean and easy to read on a phone screen

Always be encouraging and patient. Keep responses concise — students have short attention spans.
If a student asks about a topic not in their curriculum, gently redirect them.
Stay on subject. Do not engage in off-topic conversation.`;

  let dbHistory: { role: string; content: string }[] = [];
  if (studentId) {
    try {
      const recent = await prisma.mwalimuMessage.findMany({
        where: { studentId, subject: subject || undefined },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { role: true, content: true },
      });
      dbHistory = recent.reverse().map((m) => ({ role: m.role, content: m.content }));
    } catch {}
  }

  const history = dbHistory.length > 0 ? dbHistory : conversationHistory.slice(-10);

  if (studentId) {
    try {
      await prisma.mwalimuMessage.create({
        data: { studentId, classId: classId || null, subject: subject || "general", role: "user", content: message },
      });
    } catch {}
  }

  try {
    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ];

    const { reply, tokensUsed, model } = await callWithFallback(messages);

    if (studentId) {
      try {
        await prisma.mwalimuMessage.create({
          data: { studentId, classId: classId || null, subject: subject || "general", role: "assistant", content: reply },
        });
      } catch {}
    }

    if (isIndependent && activeSession) {
      try {
        const updatedSession = await prisma.mwalimuSession.update({
          where: { id: activeSession.id },
          data: { tokensUsed: { increment: tokensUsed } },
        });
        sessionTokensRemaining = updatedSession.maxTokens - updatedSession.tokensUsed;
      } catch {}
    }

    return NextResponse.json({
      reply,
      model,
      ...(isIndependent && {
        session: {
          tokensUsed: (activeSession?.tokensUsed || 0) + tokensUsed,
          maxTokens: activeSession?.maxTokens || INDEPENDENT_SESSION_MAX_TOKENS,
          tokensRemaining: sessionTokensRemaining,
          expiresAt: sessionExpiresAt,
        },
      }),
    });
  } catch (error) {
    console.error("Mwalimu error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
