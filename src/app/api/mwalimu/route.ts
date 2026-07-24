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

  const { message, subject, conversationHistory = [] } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const grade = "grade" in session ? Number(session.grade) : 4;
  const studentName = "name" in session ? session.name : "Student";
  const subjects = getCbcSubjects(grade);
  const subjectList = subjects.map((s) => s.name).join(", ");

  const systemPrompt = `You are Mwalimu, an AI learning assistant for Kenyan primary school students following the Competency-Based Curriculum (CBC).

Student: ${studentName}, Grade ${grade}
Available subjects: ${subjectList}
${subject ? `Current subject: ${subject}` : ""}

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
If a student asks about a topic not in their curriculum, gently redirect them.`;

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
          ...conversationHistory.slice(-10),
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

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Mwalimu error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
