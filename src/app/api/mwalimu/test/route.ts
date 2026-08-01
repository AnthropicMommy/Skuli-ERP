import { NextResponse } from "next/server";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { callAI } from "@/lib/ai-providers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const grade = "grade" in session ? Number(session.grade) : 4;
    const { subject, topic, questionCount = 10, difficulty = "medium" } = await req.json();

    if (!subject) return NextResponse.json({ error: "Subject is required" }, { status: 400 });

    let gradeLevel = "Upper Primary";
    if (grade <= 3) gradeLevel = "Lower Primary";
    else if (grade <= 6) gradeLevel = "Upper Primary";
    else if (grade <= 9) gradeLevel = "Junior Secondary";
    else gradeLevel = "Senior Secondary";

    // Fetch teacher.co.ke materials as reference for generating high-quality questions
    let referenceMaterials = "";
    try {
      const teacherMaterials = await prisma.sourceMaterial.findMany({
        where: { 
          source: "teacher.co.ke",
          subject: subject,
          grade: String(grade),
          materialType: { not: "curriculum_design" },
        },
        take: 3,
        select: { title: true, description: true, materialType: true },
      });
      if (teacherMaterials.length > 0) {
        referenceMaterials = `\n\nReference materials (teacher notes - use for question style/difficulty):\n${teacherMaterials.map((m) => `- ${m.title} (${m.materialType}): ${m.description || "no description"}`).join("\n")}`;
      }
    } catch {}

    const prompt = `Generate a ${difficulty} Grade ${grade} ${subject} CBC test: ${questionCount} questions${topic ? ` on ${topic}` : ""}.${referenceMaterials}

Return ONLY this JSON:
{"title":"test title","questions":[{"number":1,"question":"text","options":["A. opt1","B. opt2","C. opt3","D. opt4"],"answer":"B. opt2","marks":1,"explanation":"why"}]}

Mix MCQ (4 options, 1 mark) and short answer (options null, 2-3 marks). Kenyan context.`;

    const { reply } = await callAI([
      { role: "system", content: "CBC exam expert. Return ONLY valid JSON. No markdown, no code blocks, no extra text." },
      { role: "user", content: prompt },
    ]);

    // Parse the JSON response
    let cleaned = reply.trim();
    // Remove markdown code blocks
    cleaned = cleaned.replace(/```(?:json)?\n?/g, "").replace(/```\n?/g, "").trim();
    // Extract JSON between first { and last }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    let test;
    try {
      test = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("JSON parse failed:", cleaned.substring(0, 300));
      // Attempt: find "questions" array and reconstruct
      const qMatch = cleaned.match(/"questions"\s*:\s*\[([\s\S]*)\]\s*\}/);
      if (qMatch) {
        try {
          test = JSON.parse(`{"questions":[${qMatch[1]}]}`);
        } catch {
          throw new Error("AI returned invalid format — try again");
        }
      } else {
        throw new Error("AI returned invalid format — try again");
      }
    }

    // Ensure proper structure
    const questions = (test.questions || []).map((q: Record<string, unknown>, i: number) => ({
      number: i + 1,
      question: q.question || "",
      options: q.options || null,
      answer: q.answer || "",
      marks: q.marks || 1,
      explanation: q.explanation || "",
    }));

    const totalMarks = questions.reduce((sum: number, q: { marks: number }) => sum + q.marks, 0);

    return NextResponse.json({
      title: test.title || `${subject} Test — Grade ${grade}`,
      subject,
      grade: String(grade),
      difficulty,
      totalMarks,
      questionCount: questions.length,
      questions,
    });
  } catch (error) {
    console.error("Test generation error:", error);
      return NextResponse.json({ error: "Failed to generate test. Please try again.", detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
    return NextResponse.json({ error: "Failed to generate test. Please try again." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { questions, studentAnswers, subject, grade } = await req.json();

    if (!questions || !studentAnswers) {
      return NextResponse.json({ error: "Questions and answers required" }, { status: 400 });
    }

    const gradeNum = grade ? Number(grade) : ("grade" in session ? Number(session.grade) : 4);
    let gradeLevel = "Upper Primary";
    if (gradeNum <= 3) gradeLevel = "Lower Primary";
    else if (gradeNum <= 6) gradeLevel = "Upper Primary";
    else if (gradeNum <= 9) gradeLevel = "Junior Secondary";
    else gradeLevel = "Senior Secondary";

    const questionsForGrading = questions.map((q: Record<string, unknown>, i: number) => {
      const key = `q-${i}`;
      return {
        number: i + 1,
        question: q.question,
        options: q.options,
        correctAnswer: q.answer,
        marks: q.marks,
        studentAnswer: studentAnswers[key] || "",
      };
    });

    const prompt = `Grade this Grade ${gradeNum} (${gradeLevel}) ${subject} CBC test. MCQ: exact match. Short answer: be lenient if understanding is shown.

Return ONLY JSON:
{"score":N,"totalMarks":N,"percentage":N,"feedback":"encouraging","questions":[{"number":1,"correct":true,"marksEarned":1,"marksPossible":1,"feedback":"why"}]}

${JSON.stringify(questionsForGrading)}`;

    const { reply } = await callAI([
      { role: "system", content: "You are a CBC curriculum teacher and examiner. Grade fairly and provide encouraging feedback. Return ONLY valid JSON." },
      { role: "user", content: prompt },
    ]);

    let cleaned = reply.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse grading response");
      }
    }

    // Save graded test as revision paper for later reattempt
    try {
      await prisma.revisionPaper.create({
        data: {
          title: `${subject} AI Test - Grade ${gradeNum} ${gradeLevel}`,
          grade: String(gradeNum),
          subject: subject,
          term: "Term 1", // Default, could be enhanced
          assessmentType: "AI Generated Test",
          year: new Date().getFullYear(),
          content: JSON.stringify({
            questions: questionsForGrading,
            studentAnswers,
            result: result,
            timestamp: new Date().toISOString()
          }),
          fileUrl: "", // placeholder; we store the full content in the 'content' field
        },
      });
    } catch (saveError) {
      console.error("Failed to save revision paper:", saveError);
      // Don't fail the request if saving revision paper fails
    }

    return NextResponse.json({
      score: result.score,
      totalMarks: result.totalMarks,
      percentage: result.percentage,
      feedback: result.feedback,
      questions: result.questions,
    });
  } catch (error) {
    console.error("Test grading error:", error);
      return NextResponse.json({ error: "Failed to grade test. Please try again.", detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
      return NextResponse.json({ error: "Failed to grade test. Please try again.", detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
