import { readFileSync, readdirSync } from "fs";
import { join } from "path";

// Simple PDF text extraction using pdf-parse
async function extractText(filePath: string): Promise<string> {
  const pdfParse = require("pdf-parse");
  const buffer = readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text || "";
}

// Sample PDFs from each source
const SAMPLES = [
  { path: "/workspaces/Skuli-ERP/teacher-co-ke-materials/grade-7", label: "Teacher.co.ke Grade 7", count: 2 },
  { path: "/workspaces/Skuli-ERP/teacher-co-ke-materials/grade-10", label: "Teacher.co.ke Grade 10", count: 2 },
  { path: "/workspaces/Skuli-ERP/teacher-co-ke-materials/kcse", label: "Teacher.co.ke KCSE", count: 2 },
  { path: "/workspaces/Skuli-ERP/freeexams-materials/jss-designs", label: "FreeExams JSS Designs", count: 2 },
  { path: "/workspaces/Skuli-ERP/freeexams-materials/jss-notes", label: "FreeExams JSS Notes", count: 2 },
];

async function analyzePDF(filePath: string, label: string) {
  try {
    const text = await extractText(filePath);
    
    console.log(`\n${"=".repeat(60)}`);
    console.log(`FILE: ${filePath.split("/").pop()}`);
    console.log(`SOURCE: ${label}`);
    console.log(`TEXT LENGTH: ${text.length} chars`);
    
    // Check for branding patterns
    const brandingPatterns = [
      { pattern: /teacher\.co\.ke/gi, name: "teacher.co.ke" },
      { pattern: /freeexams\.co\.ke/gi, name: "freeexams.co.ke" },
      { pattern: /www\.\w+\.co\.ke/gi, name: "website URL" },
      { pattern: /visit\s+our\s+website/gi, name: "visit our website" },
      { pattern: /subscribe/gi, name: "subscribe" },
      { pattern: /follow\s+us/gi, name: "follow us" },
      { pattern: /copyright/gi, name: "copyright" },
      { pattern: /all\s+rights\s+reserved/gi, name: "all rights reserved" },
      { pattern: /downloaded\s+from/gi, name: "downloaded from" },
      { pattern: /click\s+here/gi, name: "click here" },
      { pattern: /join\s+our/gi, name: "join our" },
      { pattern: /telegram/gi, name: "telegram" },
      { pattern: /whatsapp/gi, name: "whatsapp" },
      { pattern: /created\s+by/gi, name: "created by" },
      { pattern: /prepared\s+by/gi, name: "prepared by" },
    ];
    
    const foundBranding: string[] = [];
    for (const { pattern, name } of brandingPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        foundBranding.push(`${name}: ${matches.length} occurrences`);
      }
    }
    
    if (foundBranding.length > 0) {
      console.log("\nBRANDING/WATERMARKS FOUND:");
      for (const b of foundBranding) console.log(`  - ${b}`);
    } else {
      console.log("\nNO BRANDING PATTERNS DETECTED");
    }
    
    // Show first 800 chars
    console.log("\nFIRST 800 CHARS:");
    console.log(text.substring(0, 800));
    
    // Show last 500 chars
    console.log("\nLAST 500 CHARS:");
    console.log(text.substring(Math.max(0, text.length - 500)));
    
  } catch (err) {
    console.log(`ERROR reading ${filePath}: ${err}`);
  }
}

async function main() {
  console.log("=== PDF Branding Analysis ===\n");
  
  for (const sample of SAMPLES) {
    try {
      const files = readdirSync(sample.path).filter(f => f.endsWith(".pdf"));
      if (files.length === 0) continue;
      
      for (const file of files.slice(0, sample.count)) {
        await analyzePDF(join(sample.path, file), sample.label);
      }
    } catch (err) {
      console.log(`Error processing ${sample.label}: ${err}`);
    }
  }
}

main();
