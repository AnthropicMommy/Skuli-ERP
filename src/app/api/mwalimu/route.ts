import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { getCbcSubjects } from "@/lib/cbc";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const INDEPENDENT_SESSION_MAX_TOKENS = 8000;
const INDEPENDENT_SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

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

  // Session enforcement for independent students
  let activeSession = null;
  let sessionTokensRemaining = null;
  let sessionExpiresAt = null;

  if (isIndependent) {
    // Find or create active session
    activeSession = await prisma.mwalimuSession.findFirst({
      where: {
        studentId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!activeSession) {
      // Check if there's an expired session today — limit to 1 per day
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todaySession = await prisma.mwalimuSession.findFirst({
        where: {
          studentId,
          createdAt: { gte: todayStart },
        },
      });

      if (todaySession) {
        return NextResponse.json({
          error: "session_limit",
          message: "You've used your session for today. Come back tomorrow!",
          resetsAt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        }, { status: 429 });
      }

      // Create new session
      activeSession = await prisma.mwalimuSession.create({
        data: {
          studentId,
          maxTokens: INDEPENDENT_SESSION_MAX_TOKENS,
          expiresAt: new Date(Date.now() + INDEPENDENT_SESSION_DURATION_MS),
        },
      });
    }

    // Check if session is exhausted
    if (activeSession.tokensUsed >= activeSession.maxTokens) {
      return NextResponse.json({
        error: "session_exhausted",
        message: "Session token limit reached. Start a new session tomorrow!",
        tokensUsed: activeSession.tokensUsed,
        maxTokens: activeSession.maxTokens,
        expiresAt: activeSession.expiresAt.toISOString(),
      }, { status: 429 });
    }

    sessionTokensRemaining = activeSession.maxTokens - activeSession.tokensUsed;
    sessionExpiresAt = activeSession.expiresAt.toISOString();
  }

  const grade = "grade" in session ? Number(session.grade) : 4;
  const studentName = "name" in session ? session.name : "Student";

  // Determine grade level
  let gradeLevel = "Upper Primary";
  if (grade <= 3) gradeLevel = "Lower Primary";
  else if (grade <= 6) gradeLevel = "Upper Primary";
  else if (grade <= 9) gradeLevel = "Junior Secondary";
  else gradeLevel = "Senior Secondary";

  const subjects = getCbcSubjects(grade);
  const subjectList = subjects.map((s) => s.name).join(", ");

  // Fetch student profile for personalized prompts
  let profileContext = "";
  if (isIndependent) {
    try {
      const profile = await prisma.studentProfile.findUnique({
        where: { studentId },
      });
      if (profile) {
        const parsedSubjects = JSON.parse(profile.subjects);
        profileContext = `\n\nStudent profile:
- Grade: ${profile.grade}
- Subjects they need help with: ${parsedSubjects.join(", ")}
- Biggest challenge: ${profile.challenge}
- Main goal: ${profile.goal}
Tailor your responses to focus on their challenge areas and goal.`;
      }
    } catch {
      // Profile fetch failure is non-critical
    }
  }

  // Fetch relevant materials for RAG-lite (school students only)
  let materialContext = "";
  if (!isIndependent && subject && classId) {
    try {
      const materials = await prisma.material.findMany({
        where: {
          organizationId: schoolId,
          classId,
          subject,
        },
        take: 5,
        select: { title: true, description: true, type: true },
      });
      if (materials.length > 0) {
        materialContext = `\n\nAvailable study materials for this class/subject:\n${materials.map((m) => `- ${m.title} (${m.type})${m.description ? ": " + m.description : ""}`).join("\n")}\nUse these materials as reference when answering questions. If a student asks about a topic covered by these materials, guide them to review the relevant material.`;
      }
    } catch {
      // Material fetch failure is non-critical
    }
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

  // Load recent conversation history from DB
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
    } catch {
      // DB history load failure is non-critical
    }
  }

  // Merge: DB history takes precedence, client history as fallback
  const history = dbHistory.length > 0 ? dbHistory : conversationHistory.slice(-10);

  // Save user message to DB
  if (studentId) {
    try {
      await prisma.mwalimuMessage.create({
        data: {
          studentId,
          classId: classId || null,
          subject: subject || "general",
          role: "user",
          content: message,
        },
      });
    } catch {
      // Save failure is non-critical
    }
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Groq API error:", errorData);
      return NextResponse.json({ error: "AI service temporarily unavailable" }, { status: 503 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't understand that. Can you try again?";
    const tokensUsed = data.usage?.total_tokens || 0;

    // Save assistant response to DB
    if (studentId) {
      try {
        await prisma.mwalimuMessage.create({
          data: {
            studentId,
            classId: classId || null,
            subject: subject || "general",
            role: "assistant",
            content: reply,
          },
        });
      } catch {
        // Save failure is non-critical
      }
    }

    // Update session token usage for independent students
    if (isIndependent && activeSession) {
      try {
        const updatedSession = await prisma.mwalimuSession.update({
          where: { id: activeSession.id },
          data: { tokensUsed: { increment: tokensUsed } },
        });
        sessionTokensRemaining = updatedSession.maxTokens - updatedSession.tokensUsed;
      } catch {
        // Session update failure is non-critical
      }
    }

    return NextResponse.json({
      reply,
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
