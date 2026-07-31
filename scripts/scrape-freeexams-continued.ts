import { writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const BASE = "https://freeexams.co.ke";
const OUTPUT_DIR = "/workspaces/Skuli-ERP/freeexams-materials";

// Remaining pages - focus on teaching notes and lesson plans
const PAGES = [
  { url: "/free-jss-teaching-notes/", type: "jss-notes", label: "JSS Teaching Notes" },
  { url: "/free-cbc-lesson-plans/", type: "cbc-lessons", label: "CBC Lesson Plans" },
  { url: "/free-cbc-teaching-notes/", type: "cbc-notes", label: "CBC Teaching Notes" },
  // Individual subject pages for CBC exams
  { url: "/free-cbc-exams/maths-exams/", type: "cbc-maths", label: "CBC Maths Exams" },
  { url: "/free-cbc-exams/english-exams/", type: "cbc-english", label: "CBC English Exams" },
  { url: "/free-cbc-exams/kiswahili-exams/", type: "cbc-kiswahili", label: "CBC Kiswahili Exams" },
  { url: "/free-cbc-exams/science-exams/", type: "cbc-science", label: "CBC Science Exams" },
  { url: "/free-cbc-exams/social-studies-exams/", type: "cbc-social", label: "CBC Social Studies Exams" },
  // KCPE subject pages
  { url: "/free-kcpe-exams/kcpe-mathematics/", type: "kcpe-maths", label: "KCPE Maths" },
  { url: "/free-kcpe-exams/kcpe-english/", type: "kcpe-english", label: "KCPE English" },
  { url: "/free-kcpe-exams/kcpe-kiswahili/", type: "kcpe-kiswahili", label: "KCPE Kiswahili" },
  { url: "/free-kcpe-exams/kcpe-science/", type: "kcpe-science", label: "KCPE Science" },
  { url: "/free-kcpe-exams/kcpe-social-studies/", type: "kcpe-social", label: "KCPE Social Studies" },
  { url: "/free-kcpe-exams/kcpe-2023-exams/", type: "kcpe-2023", label: "KCPE 2023" },
  // KCSE subject pages
  { url: "/free-ksce-exams/kcse-mathematics/", type: "kcse-maths", label: "KCSE Maths" },
  { url: "/free-ksce-exams/kcse-english/", type: "kcse-english", label: "KCSE English" },
  { url: "/free-ksce-exams/kcse-kiswahili/", type: "kcse-kiswahili", label: "KCSE Kiswahili" },
  { url: "/free-ksce-exams/kcse-biology/", type: "kcse-biology", label: "KCSE Biology" },
  { url: "/free-ksce-exams/kcse-chemistry/", type: "kcse-chemistry", label: "KCSE Chemistry" },
  { url: "/free-ksce-exams/kcse-physics/", type: "kcse-physics", label: "KCSE Physics" },
  { url: "/free-ksce-exams/kcse-geography/", type: "kcse-geography", label: "KCSE Geography" },
  { url: "/free-ksce-exams/kcse-history/", type: "kcse-history", label: "KCSE History" },
  { url: "/free-ksce-exams/kcse-2023-exams/", type: "kcse-2023", label: "KCSE 2023" },
  // Schemes - individual grades
  { url: "/free-pp1-schemes-of-work/", type: "pp1-schemes", label: "PP1 Schemes" },
  { url: "/free-pp2-schemes-of-work/", type: "pp2-schemes", label: "PP2 Schemes" },
  { url: "/free-cbc-grade-1-schemes-of-work/", type: "grade1-schemes", label: "Grade 1 Schemes" },
  { url: "/free-cbc-grade-2-schemes-of-work/", type: "grade2-schemes", label: "Grade 2 Schemes" },
  { url: "/free-cbc-schemes-of-work-for-grade-3/", type: "grade3-schemes", label: "Grade 3 Schemes" },
  { url: "/free-cbc-schemes-of-work-for-grade-4/", type: "grade4-schemes", label: "Grade 4 Schemes" },
  { url: "/free-cbc-schemes-of-work-for-grade-5/", type: "grade5-schemes", label: "Grade 5 Schemes" },
  { url: "/free-cbc-schemes-of-work-for-grade-6/", type: "grade6-schemes", label: "Grade 6 Schemes" },
  { url: "/free-standard-7-schemes-of-work/", type: "grade7-schemes", label: "Grade 7 Schemes" },
  { url: "/free-standard-8-schemes-of-work/", type: "grade8-schemes", label: "Grade 8 Schemes" },
  { url: "/free-secondary-school-schemes-of-work/", type: "sec-schemes", label: "Secondary Schemes" },
  // TVET
  { url: "/free-tvet-exams/", type: "tvet", label: "TVET Exams" },
  // University
  { url: "/free-university-exams/", type: "university", label: "University Exams" },
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
  // Match href links to PDFs, DOCX, PPTX
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

function extractSubPages(html: string): string[] {
  const subPages: string[] = [];
  const regex = /href="([^"]*(?:freeexams\.co\.ke)[^"]*)"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    let url = match[1];
    if (url.includes("freeexams.co.ke") && !subPages.includes(url)) {
      subPages.push(url);
    }
  }
  return subPages;
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
    
    let links = extractDownloadLinks(html);
    
    // If no direct links, try sub-pages
    if (links.length === 0) {
      const subPages = extractSubPages(html);
      const filteredSubs = subPages.filter(s => s.includes(page.type.replace("-", "_").toLowerCase()));
      if (filteredSubs.length > 0) {
        console.log(`  Trying ${Math.min(filteredSubs.length, 3)} filtered sub-pages...`);
        for (const subUrl of filteredSubs.slice(0, 3)) {
          const subHtml = await fetchPage(subUrl);
          const subLinks = extractDownloadLinks(subHtml);
          links.push(...subLinks);
          await new Promise((r) => setTimeout(r, 200));
        }
      }
    }
    
    console.log(`  Found ${links.length} download links`);
    if (links.length === 0) return 0;
    
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
      await new Promise((r) => setTimeout(r, 150));
    }
    console.log(`  Downloaded ${downloaded} new files`);
    return downloaded;
  } catch (err) { console.log(`  ERROR: ${err}`); return 0; }
}

async function main() {
  console.log("=== FreeExams.co.ke Continued Scraper ===\n");
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
