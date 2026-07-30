import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { getCbcSubjects } from "@/lib/cbc";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifyToken(token);
  if (!session) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const studentId = "studentId" in session ? session.studentId : null;
  const schoolId = "schoolId" in session ? session.schoolId : null;
  if (!studentId || !schoolId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const { message, subject, classId, conversationHistory = [] } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const grade = "grade" in session ? Number(session.grade) : 4;
  const studentName = "name" in session ? session.name : "Student";
  const subjects = getCbcSubjects(grade);
  const subjectList = subjects.map((s) => s.name).join(", ");

  // Fetch relevant materials for RAG-lite
  let materialContext = "";
  if (subject && classId) {
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

  const systemPrompt = `You are Mwalimu, an AI learning assistant for Kenyan primary school students following the Competency-Based Curriculum (CBC).

Student: ${studentName}, Grade ${grade}${classId ? ` (Class ID: ${classId})` : ""}
Available subjects: ${subjectList}
${subject ? `Current subject: ${subject}` : ""}
${materialContext}

Your role:
- Explain concepts simply, appropriate for the grade level
- Generate practice questions and quizzes
- Help with homework step-by-step
- Encourage and motivate students
- Switch between English and Kiswahili when asked
- For lower grades (1-3), use very simple language and examples
- For upper grades (4-6), use more detailed explanations
- Reference Kenyan context (shillings, local examples, Kenyan culture)

Always be encouraging and patient. Use emojis适度 to keep it friendly.
Keep responses concise — students have short attention spans.
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

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Mwalimu error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
