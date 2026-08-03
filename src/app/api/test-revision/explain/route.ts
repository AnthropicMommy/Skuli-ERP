import { NextResponse } from "next/server";
import { callAI } from "@/lib/ai-providers";

export async function POST(req: Request) {
  try {
    const { question, studentAnswer, correctAnswer, subject, grade } = await req.json();

    if (!question || !correctAnswer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const messages = [
      {
        role: "system",
        content: `You are Mwalimu, a CBC learning assistant for Kenyan students. Explain why the correct answer is right in a way a Grade ${grade || 4} student can understand. Be encouraging. Keep it concise (2-4 sentences). Plain text only — no markdown.`,
      },
      {
        role: "user",
        content: `Subject: ${subject || "General"}
Question: ${question}
Student's answer: ${studentAnswer || "(no answer)"}
Correct answer: ${correctAnswer}

Why is "${correctAnswer}" the correct answer? Explain simply.`,
      },
    ];

    const { reply } = await callAI(messages);
    return NextResponse.json({ explanation: reply });
  } catch (error) {
    console.error("Explanation failed:", error);
    return NextResponse.json({ explanation: "Try asking Mwalimu about this question for a detailed explanation." });
  }
}
