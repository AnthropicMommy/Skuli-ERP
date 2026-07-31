import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join, extname, basename } from "path";

const TEACHER_DIR = "/workspaces/Skuli-ERP/teacher-co-ke-materials";
const FREEEXAMS_DIR = "/workspaces/Skuli-ERP/freeexams-materials";
const OUTPUT = "/workspaces/Skuli-ERP/prisma/seed-source-materials.json";

// Subject mapping from filename patterns
const SUBJECT_MAP: Record<string, string[]> = {
  "Mathematics": ["math", "mathematics", "maths", "algebra", "geometry", "calculus"],
  "English": ["english", "grammar", "composition", "literature"],
  "Kiswahili": ["kiswahili", "lugha", "fasihi", "insha"],
  "Science & Technology": ["science", "biology", "chemistry", "physics", "integrated_science"],
  "Social Studies": ["social_studies", "history", "geography", "civics"],
  "Religious Education": ["cre", "ire", "hre", "religious", "bible"],
  "Agriculture": ["agriculture", "agriculture_and_nutrition"],
  "Computer Studies": ["computer", "ict"],
  "Home Science": ["home_science"],
  "Pre-Technical": ["pre-technical", "technical"],
  "Creative Arts": ["creative_arts", "art", "music", "sports"],
  "Business Studies": ["business"],
  "French": ["french"],
  "German": ["german"],
  "Arabic": ["arabic"],
  "Mandarin": ["mandarin"],
  "Indigenous Languages": ["indigenous"],
};

// Grade mapping from directory names
const GRADE_MAP: Record<string, string> = {
  "pp1": "PP1",
  "pp2": "PP2",
  "grade-1": "1",
  "grade-1-3": "1",
  "grade-2": "2",
  "grade-3": "3",
  "grade-4": "4",
  "grade-5": "5",
  "grade-6": "6",
  "grade-7": "7",
  "grade-8": "8",
  "grade-9": "9",
  "grade-10": "10",
  "grade-11": "11",
  "grade-12": "12",
  "upper-primary": "4",
  "kcse": "KCSE",
  "kjsea": "KJSEA",
  "kcse-past-papers": "KCSE",
  "kjsea-past-papers": "KJSEA",
  "form-1-4": "10",
  // FreeExams categories
  "jss-designs": "7",
  "cbc-designs": "4",
  "jss-notes": "7",
  "cbc-notes": "4",
  "cbc-lessons": "4",
  "university": "university",
  "tvet": "tvet",
  "pp1-schemes": "PP1",
  "pp2-schemes": "PP2",
  "grade1-schemes": "1",
  "grade2-schemes": "2",
  "grade3-schemes": "3",
  "grade4-schemes": "4",
  "grade5-schemes": "5",
  "grade6-schemes": "6",
  "grade7-schemes": "7",
  "grade8-schemes": "8",
  "sec-schemes": "10",
  "cbc-maths": "4",
  "cbc-english": "4",
  "cbc-kiswahili": "4",
  "cbc-science": "4",
  "cbc-social": "4",
  "kcpe-maths": "6",
  "kcpe-english": "6",
  "kcpe-kiswahili": "6",
  "kcpe-science": "6",
  "kcpe-social": "6",
  "kcpe-2023": "6",
  "kcse-maths": "KCSE",
  "kcse-english": "KCSE",
  "kcse-kiswahili": "KCSE",
  "kcse-biology": "KCSE",
  "kcse-chemistry": "KCSE",
  "kcse-physics": "KCSE",
  "kcse-geography": "KCSE",
  "kcse-history": "KCSE",
  "kcse-2023": "KCSE",
};

// Material type detection
function detectType(filename: string, dirName: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes("past_paper") || lower.includes("exam") || lower.includes("assessment")) return "past_paper";
  if (lower.includes("scheme")) return "scheme";
  if (lower.includes("lesson_plan") || lower.includes("lesson")) return "lesson_plan";
  if (lower.includes("curriculum_design") || lower.includes("design")) return "curriculum_design";
  if (lower.includes("notes") || lower.includes("note")) return "notes";
  return "notes";
}

// Subject detection from filename
function detectSubject(filename: string): string {
  const lower = filename.toLowerCase().replace(/[-_]/g, "_");
  for (const [subject, patterns] of Object.entries(SUBJECT_MAP)) {
    for (const pattern of patterns) {
      if (lower.includes(pattern)) return subject;
    }
  }
  return "General";
}

// Title cleanup
function cleanTitle(filename: string): string {
  return filename
    .replace(/\.(pdf|docx?|pptx?)$/i, "")
    .replace(/_/g, " ")
    .replace(/amp;/g, "&")
    .replace(/8211/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

interface SourceMaterial {
  title: string;
  description: string;
  subject: string;
  grade: string;
  materialType: string;
  source: string;
  sourceUrl: string;
  fileUrl: string;
  fileSize: number;
  fileExtension: string;
}

function scanDirectory(dir: string, source: string, dirName: string): SourceMaterial[] {
  const materials: SourceMaterial[] = [];
  try {
    const files = readdirSync(dir);
    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      if (!stat.isFile()) continue;
      
      const ext = extname(file).toLowerCase();
      if (![".pdf", ".docx", ".doc", ".pptx", ".ppt"].includes(ext)) continue;
      
      const grade = GRADE_MAP[dirName] || dirName;
      const title = cleanTitle(file);
      const subject = detectSubject(file);
      const materialType = detectType(file, dirName);
      
      materials.push({
        title,
        description: `${source} - ${dirName} - ${materialType}`,
        subject,
        grade,
        materialType,
        source,
        sourceUrl: "",
        fileUrl: `/api/source-materials/file/${dirName}/${encodeURIComponent(file)}`,
        fileSize: stat.size,
        fileExtension: ext.replace(".", ""),
      });
    }
  } catch (err) {
    console.error(`Error scanning ${dir}: ${err}`);
  }
  return materials;
}

function main() {
  console.log("Scanning downloaded materials...\n");
  const allMaterials: SourceMaterial[] = [];
  
  // Scan teacher.co.ke
  console.log("=== Teacher.co.ke ===");
  const teacherDirs = readdirSync(TEACHER_DIR);
  for (const dir of teacherDirs) {
    const dirPath = join(TEACHER_DIR, dir);
    const stat = statSync(dirPath);
    if (!stat.isDirectory()) continue;
    const materials = scanDirectory(dirPath, "teacher.co.ke", dir);
    console.log(`  ${dir}: ${materials.length} files`);
    allMaterials.push(...materials);
  }
  
  // Scan freeexams.co.ke
  console.log("\n=== FreeExams.co.ke ===");
  const freeDirs = readdirSync(FREEEXAMS_DIR);
  for (const dir of freeDirs) {
    const dirPath = join(FREEEXAMS_DIR, dir);
    const stat = statSync(dirPath);
    if (!stat.isDirectory()) continue;
    const materials = scanDirectory(dirPath, "freeexams.co.ke", dir);
    console.log(`  ${dir}: ${materials.length} files`);
    allMaterials.push(...materials);
  }
  
  console.log(`\n=== Total: ${allMaterials.length} materials ===`);
  
  // Summary by grade
  const byGrade: Record<string, number> = {};
  for (const m of allMaterials) {
    byGrade[m.grade] = (byGrade[m.grade] || 0) + 1;
  }
  console.log("\nBy Grade:");
  for (const [grade, count] of Object.entries(byGrade).sort()) {
    console.log(`  ${grade}: ${count}`);
  }
  
  // Summary by type
  const byType: Record<string, number> = {};
  for (const m of allMaterials) {
    byType[m.materialType] = (byType[m.materialType] || 0) + 1;
  }
  console.log("\nBy Type:");
  for (const [type, count] of Object.entries(byType).sort()) {
    console.log(`  ${type}: ${count}`);
  }
  
  // Summary by subject
  const bySubject: Record<string, number> = {};
  for (const m of allMaterials) {
    bySubject[m.subject] = (bySubject[m.subject] || 0) + 1;
  }
  console.log("\nBy Subject:");
  for (const [subject, count] of Object.entries(bySubject).sort()) {
    console.log(`  ${subject}: ${count}`);
  }
  
  // Save to JSON
  writeFileSync(OUTPUT, JSON.stringify(allMaterials, null, 2));
  console.log(`\nSaved to ${OUTPUT}`);
}

main();
