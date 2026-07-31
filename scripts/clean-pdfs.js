const pdf = require("pdf-parse");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const INPUT_DIR = "/workspaces/Skuli-ERP/teacher-co-ke-materials";
const OUTPUT_DIR = "/workspaces/Skuli-ERP/cleaned-materials";
const FREEEXAMS_DIR = "/workspaces/Skuli-ERP/freeexams-materials";

// Branding patterns to remove
const BRANDING_PATTERNS = [
  /teacher\.co\.ke/gi,
  /freeexams\.co\.ke/gi,
  /www\.\w+\.co\.ke/gi,
  /visit\s+our\s+website[^.]*\.?/gi,
  /subscribe\s+to\s+our[^.]*\.?/gi,
  /follow\s+us\s+on[^.]*\.?/gi,
  /join\s+our\s+(telegram|whatsapp)[^.]*\.?/gi,
  /downloaded\s+from\s+https?:\/\/[^.]*\.?/gi,
  /download\s+this\s+and\s+other[^.]*\.?/gi,
  /created\s+by\s+[^.]*teacher[^.]*\.?/gi,
  /prepared\s+by\s+[^.]*teacher[^.]*\.?/gi,
  /source:\s*teacher\.co\.ke/gi,
  /click\s+here\s+to[^.]*\.?/gi,
  /telegram\.me\/[^\s]+/gi,
  /wa\.me\/[^\s]+/gi,
  /t\.me\/[^\s]+/gi,
];

// Clean text by removing branding
function cleanText(text) {
  let cleaned = text;
  for (const pattern of BRANDING_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  cleaned = cleaned.replace(/[ \t]{2,}/g, " ");
  return cleaned.trim();
}

// Check if text is mostly branding (low content ratio)
function isMostlyBranding(text, cleanedText) {
  const originalLength = text.length;
  const cleanedLength = cleanedText.length;
  if (originalLength === 0) return true;
  const contentRatio = cleanedLength / originalLength;
  return contentRatio < 0.3; // Less than 30% content after cleaning
}

// Generate clean PDF from text
async function generateCleanPDF(text, output_path) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const PAGE_WIDTH = 595; // A4
  const PAGE_HEIGHT = 842;
  const MARGIN = 50;
  const LINE_HEIGHT = 14;
  const FONT_SIZE = 10;
  
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  
  const lines = text.split("\n");
  
  for (const line of lines) {
    // Check if we need a new page
    if (y < MARGIN + LINE_HEIGHT) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
    
    // Handle bold text (lines starting with special markers)
    const isBold = /^(\d+\.|[A-Z][A-Z\s]+:|SECTION|MARKING|ANSWERS|TOTAL)/.test(line);
    const currentFont = isBold ? boldFont : font;
    const fontSize = isBold ? FONT_SIZE + 1 : FONT_SIZE;
    
    // Word wrap
    const maxWidth = PAGE_WIDTH - 2 * MARGIN;
    const words = line.split(" ");
    let currentLine = "";
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = currentFont.widthOfTextAtSize(testLine, fontSize);
      
      if (textWidth > maxWidth && currentLine) {
        page.drawText(currentLine, {
          x: MARGIN,
          y,
          size: fontSize,
          font: currentFont,
          color: rgb(0, 0, 0),
        });
        y -= LINE_HEIGHT;
        
        if (y < MARGIN + LINE_HEIGHT) {
          page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
          y = PAGE_HEIGHT - MARGIN;
        }
        
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      page.drawText(currentLine, {
        x: MARGIN,
        y,
        size: fontSize,
        font: currentFont,
        color: rgb(0, 0, 0),
      });
      y -= LINE_HEIGHT;
    }
  }
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(output_path, pdfBytes);
}

// Process a single PDF
async function processPDF(inputPath, outputPath, label) {
  try {
    const buf = fs.readFileSync(inputPath);
    const data = await pdf(buf);
    const originalText = data.text || "";
    
    if (originalText.length < 50) {
      console.log(`  SKIP (too short): ${path.basename(inputPath)}`);
      return { status: "skipped", reason: "too_short" };
    }
    
    const cleanedText = cleanText(originalText);
    
    if (isMostlyBranding(originalText, cleanedText)) {
      console.log(`  SKIP (mostly branding): ${path.basename(inputPath)}`);
      return { status: "skipped", reason: "mostly_branding" };
    }
    
    // Check if this is a marking scheme or notes (text-heavy)
    const isTextHeavy = data.numpages <= 20 || cleanedText.length / data.numpages > 500;
    
    if (!isTextHeavy) {
      console.log(`  KEEP ORIGINAL (diagrams likely): ${path.basename(inputPath)}`);
      fs.copyFileSync(inputPath, outputPath);
      return { status: "original", reason: "has_diagrams" };
    }
    
    await generateCleanPDF(cleanedText, outputPath);
    console.log(`  CLEANED: ${path.basename(inputPath)} (${data.numpages} pages → clean PDF)`);
    return { status: "cleaned" };
    
  } catch (err) {
    console.log(`  ERROR: ${path.basename(inputPath)} - ${err.message}`);
    return { status: "error", error: err.message };
  }
}

// Detect grade from directory name
function detectGrade(dirName) {
  const gradeMap = {
    "grade-7": "7", "grade-8": "8", "grade-9": "9", "grade-10": "10",
    "grade-11": "11", "grade-12": "12", "kcse": "KCSE", "kjsea": "KJSEA",
  };
  return gradeMap[dirName] || dirName;
}

// Detect material type from filename
function detectType(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes("marking") || lower.includes("answers") || lower.includes("ms")) return "past_paper";
  if (lower.includes("scheme")) return "scheme";
  if (lower.includes("notes") || lower.includes("note")) return "notes";
  if (lower.includes("lesson")) return "lesson_plan";
  return "notes";
}

// Detect subject from filename
function detectSubject(filename) {
  const lower = filename.toLowerCase().replace(/[-_]/g, " ");
  const subjects = {
    "Mathematics": ["math", "maths", "algebra"],
    "English": ["english", "grammar"],
    "Kiswahili": ["kiswahili", "lugha", "fasihi"],
    "Agriculture": ["agriculture"],
    "Biology": ["biology"],
    "Chemistry": ["chemistry"],
    "Physics": ["physics"],
    "Geography": ["geography"],
    "History": ["history"],
    "CRE": ["cre", "religious"],
    "Computer Studies": ["computer", "ict"],
    "Business Studies": ["business"],
    "Home Science": ["home_science", "home science"],
    "Pre-Technical": ["pre-technical", "technical"],
    "Creative Arts": ["creative", "arts", "sports"],
    "Aviation": ["aviation"],
    "French": ["french"],
    "German": ["german"],
    "Arabic": ["arabic"],
    "Mandarin": ["mandarin"],
  };
  
  for (const [subject, patterns] of Object.entries(subjects)) {
    for (const pattern of patterns) {
      if (lower.includes(pattern)) return subject;
    }
  }
  return "General";
}

async function main() {
  console.log("=== PDF Cleaning Pipeline ===\n");
  
  // Create output directories
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  const metadata = [];
  
  // Process teacher.co.ke files (grade 7-12 only)
  const teacherDirs = ["grade-7", "grade-8", "grade-9", "grade-10", "kcse", "kjsea"];
  
  for (const dir of teacherDirs) {
    const inputDir = path.join(INPUT_DIR, dir);
    if (!fs.existsSync(inputDir)) continue;
    
    const outputDir = path.join(OUTPUT_DIR, dir);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    console.log(`\n--- Processing ${dir} ---`);
    const files = fs.readdirSync(inputDir).filter(f => f.endsWith(".pdf"));
    console.log(`  Found ${files.length} files`);
    
    for (const file of files) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);
      
      const result = await processPDF(inputPath, outputPath, dir);
      
      metadata.push({
        title: file.replace(/\.pdf$/i, "").replace(/[-_]/g, " "),
        grade: detectGrade(dir),
        subject: detectSubject(file),
        materialType: detectType(file),
        source: "teacher.co.ke",
        fileUrl: `/api/source-materials/file/${dir}/${encodeURIComponent(file)}`,
        fileSize: fs.existsSync(outputPath) ? fs.statSync(outputPath).size : 0,
        status: result.status,
      });
    }
  }
  
  // Process freeexams.co.ke files (only clean ones - curriculum designs)
  const freeexamsDirs = ["jss-designs", "cbc-designs"];
  
  for (const dir of freeexamsDirs) {
    const inputDir = path.join(FREEEXAMS_DIR, dir);
    if (!fs.existsSync(inputDir)) continue;
    
    const outputDir = path.join(OUTPUT_DIR, dir);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    console.log(`\n--- Processing ${dir} ---`);
    const files = fs.readdirSync(inputDir).filter(f => f.endsWith(".pdf"));
    console.log(`  Found ${files.length} files (keeping originals - already clean)`);
    
    for (const file of files) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);
      
      // These are clean KICD documents, keep as-is
      fs.copyFileSync(inputPath, outputPath);
      
      metadata.push({
        title: file.replace(/\.pdf$/i, "").replace(/[-_]/g, " "),
        grade: file.match(/Grade[_ ](\d+)/i)?.[1] || dir.replace("jss-", "").replace("cbc-", ""),
        subject: detectSubject(file),
        materialType: "curriculum_design",
        source: "freeexams.co.ke",
        fileUrl: `/api/source-materials/file/${dir}/${encodeURIComponent(file)}`,
        fileSize: fs.statSync(outputPath).size,
        status: "original",
      });
    }
  }
  
  // Save metadata
  const metadataPath = path.join(OUTPUT_DIR, "metadata.json");
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  
  console.log(`\n=== Done ===`);
  console.log(`Total files processed: ${metadata.length}`);
  console.log(`Metadata saved to: ${metadataPath}`);
  
  // Summary
  const byStatus = {};
  for (const m of metadata) {
    byStatus[m.status] = (byStatus[m.status] || 0) + 1;
  }
  console.log("\nBy Status:");
  for (const [status, count] of Object.entries(byStatus)) {
    console.log(`  ${status}: ${count}`);
  }
}

main();
