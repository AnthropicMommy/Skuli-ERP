const pdf = require("pdf-parse");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const INPUT_DIR = "/workspaces/Skuli-ERP/teacher-co-ke-materials";
const OUTPUT_DIR = "/workspaces/Skuli-ERP/cleaned-materials";

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

// Unicode to ASCII replacement map
const UNICODE_MAP = {
  "✓": "[x]", "✔": "[x]", "✗": "[ ]", "✘": "[ ]",
  "→": "->", "←": "<-", "↑": "^", "↓": "v",
  "▪": "-", "▫": "-", "●": "*", "○": "*",
  "◆": "*", "◇": "*", "★": "*", "☆": "*",
  "≤": "<=", "≥": ">=", "≠": "!=", "≈": "~",
  "×": "x", "÷": "/", "±": "+/-",
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
  "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
  "𝑎": "a", "𝑏": "b", "𝑐": "c", "𝑑": "d", "𝑒": "e",
  "ƒ": "f", "𝑔": "g", "ℎ": "h", "𝑖": "i", "𝑗": "j",
  "𝑘": "k", "𝑙": "l", "𝑚": "m", "𝑛": "n", "𝑜": "o",
  "𝑝": "p", "𝑞": "q", "𝑟": "r", "𝑠": "s", "𝑡": "t",
  "𝑢": "u", "𝑣": "v", "𝑤": "w", "𝑥": "x", "𝑦": "y", "𝑧": "z",
  "π": "pi", "θ": "theta", "α": "alpha", "β": "beta", "γ": "gamma",
  "δ": "delta", "ε": "epsilon", "σ": "sigma", "ω": "omega",
  "−": "-", "–": "-", "—": "-",
  "\u2022": "*", "\u2026": "...",
  "\u2019": "'", "\u2018": "'",
  "\u201c": '"', "\u201d": '"',
  "\u00a0": " ",
  // Math symbols
  "≤": "<=", "≥": ">=", "≠": "!=", "≈": "~",
  "∞": "infinity", "√": "sqrt",
  // Brackets
  "「": "[", "」": "]", "『": "[", "』": "]",
  // Fractions
  "½": "1/2", "⅓": "1/3", "⅔": "2/3", "¼": "1/4", "¾": "3/4",
  // Arrows
  "⇒": "=>", "⇔": "<=>", "⇑": "^", "⇓": "v",
  // Special
  "°": "deg", "′": "'", "″": '"',
  // Box drawing
  "┌": "+", "┐": "+", "└": "+", "┘": "+",
  "─": "-", "│": "|", "├": "+", "┤": "+",
  "┬": "+", "┴": "+", "┼": "+",
  // Music
  "♩": "note", "♪": "note", "♫": "note", "♬": "note",
  // Shapes
  "♠": "spade", "♣": "club", "♥": "heart", "♦": "diamond",
  // Misc
  "⚽": "ball", "🏀": "ball", "🏈": "ball",
  "✓": "[x]", "✔": "[x]", "✗": "[ ]", "✘": "[ ]",
  // More special chars
  "": "*", "": "*", "": "*", "": "*", "": "*",
  "": "*", "": "*", "": "*", "": "*", "": "*",
  "": "*", "": "*", "": "*", "": "*", "": "*",
  "": "*", "": "*", "": "*", "": "*", "": "*",
  "": "*", "": "*", "": "*", "": "*", "": "*",
  "": "*", "": "*", "": "*", "": "*", "": "*",
  "": "*", "": "*", "": "*", "": "*",
  // Georgian/Armenian/etc that appear in math
  "푎": "a", "푉": "V", "푃": "P",
};

// Clean text by removing branding and replacing Unicode
function cleanText(text) {
  let cleaned = text;
  
  // Replace Unicode characters
  for (const [unicode, ascii] of Object.entries(UNICODE_MAP)) {
    cleaned = cleaned.split(unicode).join(ascii);
  }
  
  // Remove any remaining non-ASCII characters (except common ones)
  cleaned = cleaned.replace(/[^\x00-\x7F]/g, (char) => {
    // Keep common characters
    if ("áéíóúñüàèìòùâêîôûäëïöüÿç".includes(char.toLowerCase())) {
      return char;
    }
    return "?";
  });
  
  // Remove branding patterns
  for (const pattern of BRANDING_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  cleaned = cleaned.replace(/[ \t]{2,}/g, " ");
  
  return cleaned.trim();
}

// Check if text is mostly branding
function isMostlyBranding(text, cleanedText) {
  const originalLength = text.length;
  const cleanedLength = cleanedText.length;
  if (originalLength === 0) return true;
  const contentRatio = cleanedLength / originalLength;
  return contentRatio < 0.3;
}

// Generate clean PDF from text
async function generateCleanPDF(text, output_path) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const PAGE_WIDTH = 595;
  const PAGE_HEIGHT = 842;
  const MARGIN = 50;
  const LINE_HEIGHT = 14;
  const FONT_SIZE = 10;
  
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  
  const lines = text.split("\n");
  
  for (const line of lines) {
    if (y < MARGIN + LINE_HEIGHT) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
    
    const isBold = /^(\d+\.|[A-Z][A-Z\s]+:|SECTION|MARKING|ANSWERS|TOTAL)/.test(line);
    const currentFont = isBold ? boldFont : font;
    const fontSize = isBold ? FONT_SIZE + 1 : FONT_SIZE;
    
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

// Process files that failed with Unicode errors
async function main() {
  console.log("=== Re-processing failed files with Unicode handling ===\n");
  
  const metadata = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, "metadata.json"), "utf8"));
  let reprocessed = 0;
  
  for (const item of metadata) {
    if (item.status !== "error") continue;
    
    // Find the source file
    const sourceDir = item.source === "teacher.co.ke" ? INPUT_DIR : FREEEXAMS_DIR;
    const dirName = item.fileUrl.split("/")[3];
    const fileName = decodeURIComponent(item.fileUrl.split("/").pop());
    
    const inputPath = path.join(sourceDir, dirName, fileName);
    const outputPath = path.join(OUTPUT_DIR, dirName, fileName);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`  SKIP (not found): ${fileName}`);
      continue;
    }
    
    try {
      const buf = fs.readFileSync(inputPath);
      const data = await pdf(buf);
      const originalText = data.text || "";
      
      if (originalText.length < 50) {
        console.log(`  SKIP (too short): ${fileName}`);
        continue;
      }
      
      const cleanedText = cleanText(originalText);
      
      if (isMostlyBranding(originalText, cleanedText)) {
        console.log(`  SKIP (mostly branding): ${fileName}`);
        continue;
      }
      
      await generateCleanPDF(cleanedText, outputPath);
      console.log(`  CLEANED: ${fileName}`);
      
      // Update metadata
      item.status = "cleaned";
      item.fileSize = fs.statSync(outputPath).size;
      reprocessed++;
      
    } catch (err) {
      console.log(`  ERROR: ${fileName} - ${err.message}`);
    }
  }
  
  // Save updated metadata
  fs.writeFileSync(path.join(OUTPUT_DIR, "metadata.json"), JSON.stringify(metadata, null, 2));
  
  console.log(`\n=== Done: ${reprocessed} files reprocessed ===`);
}

main();
