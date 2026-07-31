import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface GradingQuestion {
  section: string;
  number: number;
  question: string;
  options?: string[];
  correctAnswer: string;
  marks: number;
  studentAnswer: string;
}

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("No Gemini key");
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
    }),
  });
  if (!res.ok) throw new Error("Gemini error");
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGroq(prompt: string): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("No Groq key");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });
  if (!res.ok) throw new Error("Groq error");
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function gradeWithAI(prompt: string): Promise<string> {
  const providers = [];
  if (GEMINI_API_KEY) providers.push(callGemini);
  if (GROQ_API_KEY) providers.push(callGroq);
  for (const fn of providers) {
    try { return await fn(prompt); } catch {}
  }
  throw new Error("No AI providers available");
}

export async function POST(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifyToken(token);
  if (!session) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { paperTitle, totalMarks, questions } = await req.json() as {
    paperTitle: string;
    totalMarks: number;
    questions: GradingQuestion[];
  };

  if (!questions?.length) return NextResponse.json({ error: "No questions to grade" }, { status: 400 });

  // Quick exact-match scoring first
  let autoScore = 0;
  for (const q of questions) {
    if (q.studentAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
      autoScore += q.marks;
    }
  }

  // Build AI grading prompt for subjective feedback
  const questionList = questions.map((q) =>
    `Q${q.number} (${q.marks}m): ${q.question}\nCorrect: ${q.correctAnswer}\nStudent: ${q.studentAnswer || "(no answer)"}`
  ).join("\n\n");

  const prompt = `You are a Kenyan CBC exam grader. Grade this student's test answers.

Paper: ${paperTitle}
Total Marks: ${totalMarks}

Questions, correct answers, and student answers:
${questionList}

For each question, evaluate the student's answer:
- If exact match or clearly correct: full marks
- If partially correct: give partial marks based on quality
- If wrong or empty: 0 marks

Respond in this EXACT JSON format only (no other text):
{"score": <number>, "feedback": "<one paragraph summary of strengths and areas to improve>"}`;

  try {
    const aiResponse = await gradeWithAI(prompt);
    // Try to parse JSON from AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        score: Math.min(parsed.score || autoScore, totalMarks),
        total: totalMarks,
        feedback: parsed.feedback || "Good effort! Review the answer key for detailed feedback.",
      });
    }
  } catch {}

  // Fallback to auto-grading
  return NextResponse.json({
    score: autoScore,
    total: totalMarks,
    feedback: `Auto-graded: ${autoScore}/${totalMarks}. ${autoScore >= totalMarks * 0.7 ? "Well done!" : "Review the material and try again."}`,
  });
}
