import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const GRADE_LEVELS: Record<number, string> = {
  1: "Lower Primary (Grade 1-3)", 2: "Lower Primary (Grade 1-3)", 3: "Lower Primary (Grade 1-3)",
  4: "Upper Primary (Grade 4-6)", 5: "Upper Primary (Grade 4-6)", 6: "Upper Primary (Grade 4-6)",
  7: "Junior Secondary (Grade 7-9)", 8: "Junior Secondary (Grade 7-9)", 9: "Junior Secondary (Grade 7-9)",
  10: "Senior Secondary (Grade 10-12)", 11: "Senior Secondary (Grade 10-12)", 12: "Senior Secondary (Grade 10-12)",
};

interface PaperCombo {
  grade: number;
  subject: string;
  term: string;
  assessmentType: string;
}

const PAPERS: PaperCombo[] = [
  // Lower Primary
  { grade: 1, subject: "Literacy Activities", term: "Term 1", assessmentType: "End-Term" },
  { grade: 1, subject: "Environmental Activities", term: "Term 2", assessmentType: "Mid-Term" },
  { grade: 3, subject: "Literacy Activities", term: "Term 3", assessmentType: "End-Term" },
  { grade: 3, subject: "Environmental Activities", term: "Term 1", assessmentType: "Opener" },
  // Upper Primary
  { grade: 4, subject: "English", term: "Term 1", assessmentType: "End-Term" },
  { grade: 4, subject: "Mathematics", term: "Term 2", assessmentType: "Mid-Term" },
  { grade: 4, subject: "Social Studies", term: "Term 1", assessmentType: "End-Term" },
  { grade: 6, subject: "Science & Technology", term: "Term 3", assessmentType: "KPSEA" },
  { grade: 6, subject: "Mathematics", term: "Term 1", assessmentType: "Opener" },
  { grade: 6, subject: "English", term: "Term 2", assessmentType: "Mid-Term" },
  // Junior Secondary
  { grade: 7, subject: "Integrated Science", term: "Term 1", assessmentType: "End-Term" },
  { grade: 7, subject: "Mathematics", term: "Term 2", assessmentType: "End-Term" },
  { grade: 9, subject: "Computer Studies", term: "Term 3", assessmentType: "KJSEA" },
  { grade: 9, subject: "Mathematics", term: "Term 1", assessmentType: "End-Term" },
  // Senior Secondary
  { grade: 10, subject: "Physics", term: "Term 1", assessmentType: "End-Term" },
  { grade: 10, subject: "Mathematics", term: "Term 2", assessmentType: "Mid-Term" },
  { grade: 12, subject: "Mathematics", term: "Term 3", assessmentType: "KCSE" },
];

function buildPrompt(combo: PaperCombo): string {
  const level = GRADE_LEVELS[combo.grade];
  return `You are a CBC (Competency-Based Curriculum) exam writer for Kenyan schools.
Generate a complete exam paper with the following specifications:

Grade: ${combo.grade} (${level})
Subject: ${combo.subject}
Term: ${combo.term}
Assessment Type: ${combo.assessmentType}

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
  "title": "Grade ${combo.grade} ${combo.subject} - ${combo.term} ${combo.assessmentType}",
  "grade": "${combo.grade}",
  "subject": "${combo.subject}",
  "term": "${combo.term}",
  "assessmentType": "${combo.assessmentType}",
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
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generatePaper(combo: PaperCombo, attempt = 1): Promise<boolean> {
  const prompt = buildPrompt(combo);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (response.status === 429) {
      if (attempt < 4) {
        const wait = attempt * 15000; // 15s, 30s, 45s
        console.log(`rate limited, waiting ${wait / 1000}s (attempt ${attempt + 1})...`);
        await sleep(wait);
        return generatePaper(combo, attempt + 1);
      }
      console.error(`  Groq error: 429 Too Many Requests (exhausted retries)`);
      return false;
    }

    if (!response.ok) {
      console.error(`  Groq error: ${response.status} ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let paper;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      paper = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("  Failed to parse JSON from response");
      return false;
    }

    await prisma.revisionPaper.create({
      data: {
        title: paper.title || `Grade ${combo.grade} ${combo.subject} - ${combo.term} ${combo.assessmentType}`,
        grade: String(combo.grade),
        subject: combo.subject,
        term: combo.term,
        assessmentType: combo.assessmentType,
        year: 2026,
        content: JSON.stringify(paper),
        fileUrl: "",
      },
    });

    return true;
  } catch (error) {
    console.error("  Error:", error);
    return false;
  }
}

async function main() {
  if (!GROQ_API_KEY) {
    console.error("GROQ_API_KEY not set in environment");
    process.exit(1);
  }

  const existing = await prisma.revisionPaper.count();
  if (existing > 0) {
    console.log(`Found ${existing} existing papers. Clearing...`);
    await prisma.revisionPaper.deleteMany();
  }

  console.log(`Seeding ${PAPERS.length} revision papers...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < PAPERS.length; i++) {
    const combo = PAPERS[i];
    const label = `Grade ${combo.grade} ${combo.subject} (${combo.term} ${combo.assessmentType})`;
    process.stdout.write(`[${i + 1}/${PAPERS.length}] ${label}... `);

    const ok = await generatePaper(combo);
    if (ok) {
      console.log("OK");
      success++;
    } else {
      console.log("FAILED");
      failed++;
    }

    // Delay between calls to avoid rate limiting
    if (i < PAPERS.length - 1) {
      await sleep(8000);
    }
  }

  console.log(`\nDone: ${success} succeeded, ${failed} failed`);
  await prisma.$disconnect();
}

main();
