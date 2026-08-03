import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { getCbcSubjects } from "@/lib/cbc";
import { callAI } from "@/lib/ai-providers";

const INDEPENDENT_SESSION_MAX_TOKENS = 100000;
const INDEPENDENT_SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const MAX_REVISION_WRONG_QUESTIONS = 10;

export async function POST(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const studentId = "studentId" in session ? session.studentId : null;
    const schoolId = "schoolId" in session ? session.schoolId : null;
    if (!studentId || !schoolId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const isIndependent = "isIndependent" in session && session.isIndependent === true;

    const { message, subject, classId, conversationHistory = [], revisionId } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

    let activeSession = null;
    let sessionTokensRemaining = null;
    let sessionExpiresAt = null;

    if (isIndependent) {
      try {
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
      } catch (sessionErr) {
        console.error("Session lookup failed:", sessionErr);
      }
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
          profileContext = `\n\nStudent profile:\n- Grade: ${profile.grade}\n- Subjects: ${parsedSubjects.join(", ")}\n- Challenge: ${profile.challenge}\n- Goal: ${profile.goal}`;
        }
      } catch {}
    }

    let materialContext = "";
    if (!isIndependent && subject && classId) {
      try {
        const materials = await prisma.material.findMany({
          where: { organizationId: schoolId, classId, subject },
          take: 5,
          select: { title: true, type: true },
        });
        if (materials.length > 0) {
          materialContext = `\n\nAvailable materials:\n${materials.map((m) => `- ${m.title} (${m.type})`).join("\n")}`;
        }
      } catch {}
    }

    // Load test revision context — cap at 10 wrong questions, compact format
    let revisionContext = "";
    let revisionTotalWrong = 0;
    if (revisionId && revisionId.trim()) {
      try {
        const revision = await prisma.testRevision.findFirst({
          where: { id: revisionId, studentId },
        });
        if (revision) {
          const q = revision.questions as Record<string, unknown>[];
          const allQs = Array.isArray(q) ? q : [];
          const wrongQs = allQs.filter((item: Record<string, unknown>) => !item.correct);
          revisionTotalWrong = wrongQs.length;
          const wrongQsForPrompt = wrongQs.slice(0, MAX_REVISION_WRONG_QUESTIONS);

          const wrongQuestionsText = wrongQsForPrompt
            .map((item: Record<string, unknown>, i: number) =>
              `${i + 1}. Q: ${item.question}\nStudent's answer: ${item.studentAnswer || "(no answer)"}\nCorrect: ${item.correctAnswer || item.answer || ""}`
            )
            .join("\n\n");

          const capNote = revisionTotalWrong > MAX_REVISION_WRONG_QUESTIONS
            ? `\n(Revisions covers your top ${MAX_REVISION_WRONG_QUESTIONS} missed questions out of ${revisionTotalWrong} total.)`
            : "";

          revisionContext = `\n\nREVISION MODE — "${revision.title}" (${revision.subject}, Grade ${revision.grade})
Score: ${revision.score}/${revision.totalMarks} (${revision.percentage}%)
${wrongQuestionsText}${capNote}

Walk the student through each wrong question step by step. Be encouraging.`;
        }
      } catch (err) {
        console.error("Failed to load revision context:", err);
      }
    }

    const systemPrompt = `You are Mwalimu, an AI learning assistant for Kenyan CBC students.

Student: ${studentName}, Grade ${grade} (${gradeLevel})${classId ? ` (Class ID: ${classId})` : ""}
Available subjects: ${subjectList}
${subject ? `Current subject: ${subject}` : ""}
${profileContext}${materialContext}${revisionContext}

Rules:
- Explain concepts simply, appropriate for the grade level
- Generate practice questions and quizzes
- Help with homework step-by-step
- Encourage and motivate students
- Switch between English and Kiswahili when asked
- Lower Primary (1-3): very simple language. Upper Primary (4-6): detailed. Junior Secondary (7-9): teen-friendly. Senior Secondary (10-12): academic.
- Reference Kenyan context (shillings, local examples)
- Grade 6: mention KPSEA. Grade 9: pathway selection. Grade 12: KCSE.
- Plain text only — no markdown, asterisks, or hashtags. Use dashes (-) for lists.
- Keep responses concise. Stay on subject.`;

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
      } catch (msgErr) {
        console.error("Failed to save user message:", msgErr);
      }
    }

    try {
      const messages = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ];

      const { reply, tokensUsed, model } = await callAI(messages);

      if (studentId) {
        try {
          await prisma.mwalimuMessage.create({
            data: { studentId, classId: classId || null, subject: subject || "general", role: "assistant", content: reply },
          });
        } catch (msgErr) {
          console.error("Failed to save assistant message:", msgErr);
        }
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
      const detail = error instanceof Error ? error.message : String(error);
      console.error("Mwalimu AI call failed:", detail);
      return NextResponse.json({ error: "AI service unavailable. Please try again.", detail }, { status: 500 });
    }
  } catch (outerError) {
    const detail = outerError instanceof Error ? outerError.message : String(outerError);
    console.error("Mwalimu critical error:", detail);
    return NextResponse.json({ error: "Something went wrong", detail }, { status: 500 });
  }
}
