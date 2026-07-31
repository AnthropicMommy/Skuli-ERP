import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

const BASE = "https://freeexams.co.ke";
const OUTPUT_DIR = "/workspaces/Skuli-ERP/freeexams-materials";

// Pages to scrape - organized by exam type and year
const PAGES = [
  // KCSE Past Papers (2023-2024)
  { url: "/free-ksce-exams/", type: "kcse", label: "KCSE Papers" },
  { url: "/free-cbc-exams/", type: "cbc", label: "CBC Exams" },
  { url: "/free-kcpe-exams/", type: "kcpe", label: "KCPE Papers" },
  { url: "/free-tvet-exams/", type: "tvet", label: "TVET Exams" },
  { url: "/free-university-exams/", type: "university", label: "University Exams" },
  // Schemes
  { url: "/free-pp1-schemes-of-work/", type: "pp1", label: "PP1 Schemes" },
  { url: "/free-pp2-schemes-of-work/", type: "pp2", label: "PP2 Schemes" },
  { url: "/free-cbc-grade-1-schemes-of-work/", type: "grade-1", label: "Grade 1 Schemes" },
  { url: "/free-cbc-grade-2-schemes-of-work/", type: "grade-2", label: "Grade 2 Schemes" },
  { url: "/free-cbc-schemes-of-work-for-grade-3/", type: "grade-3", label: "Grade 3 Schemes" },
  { url: "/free-cbc-schemes-of-work-for-grade-4/", type: "grade-4", label: "Grade 4 Schemes" },
  { url: "/free-cbc-schemes-of-work-for-grade-5/", type: "grade-5", label: "Grade 5 Schemes" },
  { url: "/free-cbc-schemes-of-work-for-grade-6/", type: "grade-6", label: "Grade 6 Schemes" },
  { url: "/free-standard-7-schemes-of-work/", type: "grade-7", label: "Grade 7 Schemes" },
  { url: "/free-standard-8-schemes-of-work/", type: "grade-8", label: "Grade 8 Schemes" },
  { url: "/free-secondary-school-schemes-of-work/", type: "secondary", label: "Secondary Schemes" },
  // CBC
  { url: "/free-jss-curriculum-designs/", type: "jss-designs", label: "JSS Curriculum Designs" },
  { url: "/free-cbc-curriculum-designs/", type: "cbc-designs", label: "CBC Curriculum Designs" },
  { url: "/free-jss-teaching-notes/", type: "jss-notes", label: "JSS Teaching Notes" },
  { url: "/free-cbc-lesson-plans/", type: "cbc-lessons", label: "CBC Lesson Plans" },
  { url: "/free-cbc-teaching-notes/", type: "cbc-notes", label: "CBC Teaching Notes" },
];

async function fetchPage(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    return res.text();
  } catch { return ""; }
}

function extractDownloadLinks(html: string): { url: string; title: string }[] {
  const links: { url: string; title: string }[] = [];
  // Match href links to PDFs, DOCX, PPTX, and also Google Drive/other download links
  const regex = /href="([^"]*\.(pdf|docx?|pptx?))"[^>]*>([^<]*)/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    let fileUrl = match[1];
    const title = match[3].trim() || match[1].split("/").pop() || "unknown";
    if (fileUrl.startsWith("/")) fileUrl = BASE + fileUrl;
    else if (!fileUrl.startsWith("http")) fileUrl = BASE + "/" + fileUrl;
    if (fileUrl.includes("wp-content/uploads") || fileUrl.includes("drive.google.com")) {
      links.push({ url: fileUrl, title });
    }
  }
  return links;
}

async function downloadFile(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      redirect: "follow",
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

async function scrapePage(page: { url: string; type: string; label: string }) {
  const fullUrl = page.url.startsWith("http") ? page.url : BASE + page.url;
  console.log(`\nFetching: ${page.label} (${fullUrl})`);
  try {
    const html = await fetchPage(fullUrl);
    if (!html) { console.log("  Empty response"); return 0; }
    const links = extractDownloadLinks(html);
    console.log(`  Found ${links.length} download links`);
    if (links.length === 0) {
      // Try to find sub-pages with download links
      const subPageRegex = /href="([^"]*(?:free-|exam|kcse|kcpe|cbc|scheme|notes)[^"]*)"/gi;
      let subMatch;
      const subPages: string[] = [];
      while ((subMatch = subPageRegex.exec(html)) !== null) {
        let subUrl = subMatch[1];
        if (subUrl.startsWith("/")) subUrl = BASE + subUrl;
        if (subUrl.includes("freeexams.co.ke") && !subPages.includes(subUrl)) {
          subPages.push(subUrl);
        }
      }
      console.log(`  Found ${subPages.length} sub-pages`);
      let total = 0;
      for (const subUrl of subPages.slice(0, 5)) { // Limit sub-pages
        const subHtml = await fetchPage(subUrl);
        const subLinks = extractDownloadLinks(subHtml);
        for (const link of subLinks) {
          const dir = join(OUTPUT_DIR, page.type);
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          const ext = link.url.split(".").pop()?.toLowerCase() || "pdf";
          const filename = sanitizeFilename(link.title) + "." + ext;
          const destPath = join(dir, filename);
          if (existsSync(destPath)) continue;
          process.stdout.write(`  ${filename.substring(0, 60)}... `);
          const ok = await downloadFile(link.url, destPath);
          if (ok) { console.log("OK"); total++; }
          await new Promise((r) => setTimeout(r, 200));
        }
      }
      console.log(`  Downloaded ${total} files from sub-pages`);
      return total;
    }
    const dir = join(OUTPUT_DIR, page.type);
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
      await new Promise((r) => setTimeout(r, 200));
    }
    console.log(`  Downloaded ${downloaded} new files`);
    return downloaded;
  } catch (err) { console.log(`  ERROR: ${err}`); return 0; }
}

async function main() {
  console.log("=== FreeExams.co.ke Scraper ===\n");
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
  let total = 0;
  for (const page of PAGES) {
    const count = await scrapePage(page);
    total += count;
  }
  console.log(`\n=== Done: ${total} new files ===`);
  console.log("\n=== Total Files by Category ===");
  for (const dir of readdirSync(OUTPUT_DIR)) {
    const count = readdirSync(join(OUTPUT_DIR, dir)).length;
    if (count > 0) console.log(`  ${dir}: ${count} files`);
  }
}

main();
