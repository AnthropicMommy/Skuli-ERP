import { writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const BASE = "https://teacher.co.ke";
const OUTPUT_DIR = "/workspaces/Skuli-ERP/teacher-co-ke-materials";

// Remaining pages to scrape
const PAGES = [
  // KCSE Past Papers (already have some)
  { url: "/2025-kcse-past-papers-with-marking-schemes/", grade: "kcse", type: "past-papers" },
  { url: "/2024-kcse-past-papers-with-marking-schemes/", grade: "kcse", type: "past-papers" },
  // More Grade 7-9 exams
  { url: "/2026-grade-7-assessments-end-term-2/", grade: "grade-7", type: "exams" },
  { url: "/2026-grade-8-assessments-end-term-2/", grade: "grade-8", type: "exams" },
  { url: "/2026-grade-9-assessments-end-term-2/", grade: "grade-9", type: "exams" },
  { url: "/2026-grade-10-assessments-end-term-2/", grade: "grade-10", type: "exams" },
  // More notes
  { url: "/grade-7-notes/", grade: "grade-7", type: "notes" },
  { url: "/grade-8-notes/", grade: "grade-8", type: "notes" },
  { url: "/grade-10-notes/", grade: "grade-10", type: "notes" },
  // KJSEA
  { url: "/2025-kjsea-past-papers-with-marking-schemes/", grade: "kjsea", type: "past-papers" },
  // Grade 1-3
  { url: "/grade-1-3-materials-2/", grade: "grade-1-3", type: "materials" },
  // Upper Primary
  { url: "/upper-primary-materials/", grade: "upper-primary", type: "materials" },
  // Form 1-4
  { url: "/form-1-4-materials-2/", grade: "form-1-4", type: "materials" },
];

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  });
  return res.text();
}

function extractDownloadLinks(html: string): { url: string; title: string }[] {
  const links: { url: string; title: string }[] = [];
  const regex = /href="([^"]*\.(pdf|docx?|pptx?))"[^>]*>([^<]*)/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    let fileUrl = match[1];
    const title = match[3].trim() || match[1].split("/").pop() || "unknown";
    if (fileUrl.startsWith("/")) fileUrl = BASE + fileUrl;
    else if (!fileUrl.startsWith("http")) fileUrl = BASE + "/" + fileUrl;
    if (fileUrl.includes("wp-content/uploads")) {
      links.push({ url: fileUrl, title });
    }
  }
  return links;
}

async function downloadFile(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(destPath, buffer);
    return true;
  } catch { return false; }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9\s\-_.()]/g, "").replace(/\s+/g, "_").substring(0, 150);
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
      if (existsSync(destPath)) continue;
      process.stdout.write(`  ${filename.substring(0, 60)}... `);
      const ok = await downloadFile(link.url, destPath);
      if (ok) { console.log("OK"); downloaded++; }
      await new Promise((r) => setTimeout(r, 150));
    }
    console.log(`  Downloaded ${downloaded} new files`);
    return downloaded;
  } catch (err) { console.log(`  ERROR: ${err}`); return 0; }
}

async function main() {
  console.log("=== Teacher.co.ke Continued Scraper ===\n");
  let total = 0;
  for (const page of PAGES) {
    const count = await scrapePage(page);
    total += count;
  }
  console.log(`\n=== Done: ${total} new files ===`);
  
  // Summary
  console.log("\n=== Total Files by Grade ===");
  for (const dir of readdirSync(OUTPUT_DIR)) {
    const count = readdirSync(join(OUTPUT_DIR, dir)).length;
    if (count > 0) console.log(`  ${dir}: ${count} files`);
  }
}

main();
