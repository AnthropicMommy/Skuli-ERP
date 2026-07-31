import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const GRADE_LEVELS: Record<number, string> = {
  1: "Lower Primary (Grade 1-3)", 2: "Lower Primary (Grade 1-3)", 3: "Lower Primary (Grade 1-3)",
  4: "Upper Primary (Grade 4-6)", 5: "Upper Primary (Grade 4-6)", 6: "Upper Primary (Grade 4-6)",
  7: "Junior Secondary (Grade 7-9)", 8: "Junior Secondary (Grade 7-9)", 9: "Junior Secondary (Grade 7-9)",
  10: "Senior Secondary (Grade 10-12)", 11: "Senior Secondary (Grade 10-12)", 12: "Senior Secondary (Grade 10-12)",
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { grade, subject, term, assessmentType, questionCount = 25 } = await req.json();

  if (!grade || !subject || !term || !assessmentType) {
    return NextResponse.json({ error: "Grade, subject, term, and assessment type are required" }, { status: 400 });
  }

  const gradeNum = Number(grade);
  const level = GRADE_LEVELS[gradeNum] || "Upper Primary (Grade 4-6)";

  const systemPrompt = `You are a CBC (Competency-Based Curriculum) exam writer for Kenyan schools.
Generate a complete exam paper with the following specifications:

Grade: ${grade} (${level})
Subject: ${subject}
Term: ${term}
Assessment Type: ${assessmentType}

The paper must follow CBC format:
- Section A: Multiple Choice (10 questions, 1 mark each = 10 marks)
- Section B: Short Answer (5 questions, 3 marks each = 15 marks)
- Section C: Long Answer / Practical (3 questions, 5 marks each = 15 marks)
- Total: 40 marks

Rules:
- Questions must be age-appropriate for the grade level
- Use Kenyan context (shillings, local places, Kenyan culture)
- Questions should test understanding, not memorization
- For Lower Primary: very simple language, basic concepts
- For Upper Primary: moderate complexity, applied knowledge
- For Junior Secondary: analytical thinking, deeper concepts
- For Senior Secondary: advanced, critical thinking

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "title": "Grade ${grade} ${subject} - ${term} ${assessmentType}",
  "grade": "${grade}",
  "subject": "${subject}",
  "term": "${term}",
  "assessmentType": "${assessmentType}",
  "totalMarks": 40,
  "sections": [
    {
      "name": "Section A - Multiple Choice",
      "marks": 10,
      "questions": [
        {
          "number": 1,
          "question": "...",
          "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
          "answer": "A",
          "marks": 1
        }
      ]
    },
    {
      "name": "Section B - Short Answer",
      "marks": 15,
      "questions": [
        {
          "number": 11,
          "question": "...",
          "answer": "...",
          "marks": 3
        }
      ]
    },
    {
      "name": "Section C - Long Answer",
      "marks": 15,
      "questions": [
        {
          "number": 16,
          "question": "...",
          "answer": "...",
          "marks": 5
        }
      ]
    }
  ]
}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq error:", errorText);
      return NextResponse.json({ error: "Failed to generate paper" }, { status: 503 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response (handle potential markdown wrapping)
    let paper;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      paper = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: "Failed to parse generated paper" }, { status: 500 });
    }

    // Save to database
    const saved = await prisma.revisionPaper.create({
      data: {
        title: paper.title,
        grade: String(grade),
        subject,
        term,
        assessmentType,
        year: new Date().getFullYear(),
        content: JSON.stringify(paper),
        fileUrl: "",
      },
    });

    return NextResponse.json({ paper, paperId: saved.id }, { status: 201 });
  } catch (error) {
    console.error("Paper generation error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
