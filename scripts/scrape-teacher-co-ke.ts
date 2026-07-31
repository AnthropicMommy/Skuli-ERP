import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const BASE = "https://teacher.co.ke";
const OUTPUT_DIR = "/workspaces/Skuli-ERP/teacher-co-ke-materials";

// Pages to scrape - each has direct download links
const PAGES = [
  // Grade 7-9 Notes
  { url: "/grade-7-notes/", grade: "grade-7", type: "notes" },
  { url: "/grade-8-notes/", grade: "grade-8", type: "notes" },
  // Grade 10 Notes
  { url: "/grade-10-notes/", grade: "grade-10", type: "notes" },
  // KJSEA Past Papers (Grade 9)
  { url: "/2025-kjsea-past-papers-with-marking-schemes/", grade: "kjsea", type: "past-papers" },
  { url: "/2024-kjsea-past-papers-with-marking-schemes/", grade: "kjsea", type: "past-papers" },
  // KCSE Past Papers
  { url: "/2025-kcse-past-papers-with-marking-schemes/", grade: "kcse", type: "past-papers" },
  { url: "/2024-kcse-past-papers-with-marking-schemes/", grade: "kcse", type: "past-papers" },
  // Grade 7-9 Exams
  { url: "/2026-grade-7-assessments-end-term-2/", grade: "grade-7", type: "exams" },
  { url: "/2026-grade-8-assessments-end-term-2/", grade: "grade-8", type: "exams" },
  { url: "/2026-grade-9-assessments-end-term-2/", grade: "grade-9", type: "exams" },
  { url: "/2026-grade-10-assessments-end-term-2/", grade: "grade-10", type: "exams" },
  // Grade 7-9 Schemes
  { url: "/2025-grade-7-schemes-of-work/", grade: "grade-7", type: "schemes" },
  { url: "/2025-grade-8-schemes-of-work-2/", grade: "grade-8", type: "schemes" },
  { url: "/2025-grade-8-schemes-of-work/", grade: "grade-9", type: "schemes" },
  // Grade 10 Schemes
  { url: "/download-free-grade-10-cbc-schemes-of-work-term-1-2-3/", grade: "grade-10", type: "schemes" },
  // Grade 1-3 Materials
  { url: "/grade-1-3-materials-2/", grade: "grade-1-3", type: "materials" },
  // Upper Primary
  { url: "/upper-primary-materials/", grade: "upper-primary", type: "materials" },
  // Form 1-4
  { url: "/form-1-4-materials-2/", grade: "form-1-4", type: "materials" },
];

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  return res.text();
}

function extractDownloadLinks(html: string): { url: string; title: string }[] {
  const links: { url: string; title: string }[] = [];
  
  // Match links to PDF, DOCX, PPTX files
  const regex = /href="([^"]*\.(pdf|docx?|pptx?))"[^>]*>([^<]*)/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    let fileUrl = match[1];
    const title = match[3].trim() || match[1].split("/").pop() || "unknown";
    
    // Make absolute URL
    if (fileUrl.startsWith("/")) {
      fileUrl = BASE + fileUrl;
    } else if (!fileUrl.startsWith("http")) {
      fileUrl = BASE + "/" + fileUrl;
    }
    
    // Skip tiny images or non-file links
    if (fileUrl.includes("wp-content/uploads")) {
      links.push({ url: fileUrl, title });
    }
  }
  
  return links;
}

async function downloadFile(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    
    if (!res.ok) {
      console.log(`  FAILED (${res.status}): ${url}`);
      return false;
    }
    
    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(destPath, buffer);
    return true;
  } catch (err) {
    console.log(`  ERROR: ${url} - ${err}`);
    return false;
  }
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s\-_.()]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 150);
}

async function scrapePage(page: { url: string; grade: string; type: string }) {
  const fullUrl = page.url.startsWith("http") ? page.url : BASE + page.url;
  console.log(`\nFetching: ${fullUrl}`);
  
  try {
    const html = await fetchPage(fullUrl);
    const links = extractDownloadLinks(html);
    console.log(`  Found ${links.length} download links`);
    
    const dir = join(OUTPUT_DIR, page.grade);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    
    let downloaded = 0;
    for (const link of links) {
      const ext = link.url.split(".").pop()?.toLowerCase() || "pdf";
      const filename = sanitizeFilename(link.title) + "." + ext;
      const destPath = join(dir, filename);
      
      if (existsSync(destPath)) {
        continue; // Skip already downloaded
      }
      
      process.stdout.write(`  Downloading: ${filename.substring(0, 60)}... `);
      const ok = await downloadFile(link.url, destPath);
      if (ok) {
        console.log("OK");
        downloaded++;
      }
      
      // Small delay to be polite
      await new Promise((r) => setTimeout(r, 200));
    }
    
    console.log(`  Downloaded ${downloaded} new files`);
    return downloaded;
  } catch (err) {
    console.log(`  ERROR fetching page: ${err}`);
    return 0;
  }
}

async function main() {
  console.log("=== Teacher.co.ke Material Scraper ===\n");
  console.log(`Output: ${OUTPUT_DIR}\n`);
  
  let totalFiles = 0;
  
  for (const page of PAGES) {
    const count = await scrapePage(page);
    totalFiles += count;
  }
  
  console.log(`\n=== Done: ${totalFiles} files downloaded ===`);
}

main();
