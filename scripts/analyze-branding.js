const pdf = require("pdf-parse");
const fs = require("fs");
const path = require("path");

const SAMPLES = [
  { dir: "teacher-co-ke-materials/grade-7", label: "Teacher.co.ke Grade 7", count: 3 },
  { dir: "teacher-co-ke-materials/grade-10", label: "Teacher.co.ke Grade 10", count: 3 },
  { dir: "teacher-co-ke-materials/kcse", label: "Teacher.co.ke KCSE", count: 2 },
  { dir: "freeexams-materials/jss-designs", label: "FreeExams JSS Designs", count: 2 },
  { dir: "freeexams-materials/jss-notes", label: "FreeExams JSS Notes", count: 2 },
  { dir: "freeexams-materials/cbc-designs", label: "FreeExams CBC Designs", count: 2 },
];

const BRANDING_PATTERNS = [
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
  { pattern: /source:/gi, name: "source:" },
  { pattern: /www\.\w+\.com/gi, name: ".com website" },
];

async function analyzeFile(filePath, label) {
  try {
    const buf = fs.readFileSync(filePath);
    const data = await pdf(buf);
    const text = data.text || "";
    
    console.log(`\n${"=".repeat(60)}`);
    console.log(`FILE: ${path.basename(filePath)}`);
    console.log(`SOURCE: ${label}`);
    console.log(`PAGES: ${data.numpages}`);
    console.log(`TEXT LENGTH: ${text.length} chars`);
    
    const found = [];
    for (const { pattern, name } of BRANDING_PATTERNS) {
      const matches = text.match(pattern);
      if (matches) {
        found.push(`${name}: ${matches.length}x`);
      }
    }
    
    if (found.length > 0) {
      console.log("\nBRANDING FOUND:");
      for (const f of found) console.log(`  - ${f}`);
    } else {
      console.log("\nCLEAN - No branding detected");
    }
    
    // Show first 600 chars
    console.log("\nPREVIEW (first 600 chars):");
    console.log(text.substring(0, 600));
    
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
  }
}

async function main() {
  console.log("=== PDF Branding Analysis ===\n");
  
  for (const sample of SAMPLES) {
    const dir = path.join("/workspaces/Skuli-ERP", sample.dir);
    try {
      const files = fs.readdirSync(dir).filter(f => f.endsWith(".pdf")).slice(0, sample.count);
      for (const file of files) {
        await analyzeFile(path.join(dir, file), sample.label);
      }
    } catch (err) {
      console.log(`Error reading ${sample.dir}: ${err.message}`);
    }
  }
}

main();
