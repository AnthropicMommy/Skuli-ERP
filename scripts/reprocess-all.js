const pdf = require("pdf-parse");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const INPUT_DIR = "/workspaces/Skuli-ERP/teacher-co-ke-materials";
const FREEEXAMS_DIR = "/workspaces/Skuli-ERP/freeexams-materials";
const OUTPUT_DIR = "/workspaces/Skuli-ERP/cleaned-materials";

const BRANDING = [/teacher\.co\.ke/gi, /freeexams\.co\.ke/gi, /www\.\w+\.co\.ke/gi, /visit\s+our\s+website[^.]*\.?/gi, /downloaded\s+from\s+https?:\/\/[^.]*\.?/gi, /download\s+this\s+and\s+other[^.]*\.?/gi, /telegram\.me\/[^\s]+/gi, /wa\.me\/[^\s]+/gi, /t\.me\/[^\s]+/gi];

function sanitize(t) {
  let c = t;
  const R = [[/\u2713/g,"[x]"],[/\u2714/g,"[x]"],[/\u2192/g,"->"],[/\u2190/g,"<-"],[/\u2193/g,"v"],[/\u2191/g,"^"],[/\u25AA/g,"-"],[/\u25CF/g,"*"],[/\u25CB/g,"*"],[/\u2264/g,"<="],[/\u2265/g,">="],[/\u2260/g,"!="],[/\u2248/g,"~"],[/\u00D7/g,"x"],[/\u00F7/g,"/"],[/\u2212/g,"-"],[/\u2013/g,"-"],[/\u2014/g,"-"],[/\u2022/g,"*"],[/\u2026/g,"..."],[/\u2019/g,"'"],[/\u2018/g,"'"],[/\u201C/g,'"'],[/\u201D/g,'"'],[/\u00A0/g," "],[/\u27A2/g,"->"],[/\u2669/g,"note"],[/\u266A/g,"note"],[/\u2663/g,"club"],[/\u2665/g,"heart"],[/\u2660/g,"spade"],[/\u2070/g,"0"],[/\u00B9/g,"1"],[/\u00B2/g,"2"],[/\u00B3/g,"3"],[/\u2074/g,"4"],[/\u2075/g,"5"],[/\u2076/g,"6"],[/\u2077/g,"7"],[/\u2078/g,"8"],[/\u2079/g,"9"],[/\u2080/g,"0"],[/\u2081/g,"1"],[/\u2082/g,"2"],[/\u2083/g,"3"],[/\u2084/g,"4"],[/\u2085/g,"5"],[/\u2086/g,"6"],[/\u2087/g,"7"],[/\u2088/g,"8"],[/\u2089/g,"9"],[/\uF040/g,"*"],[/\uF0B7/g,"*"],[/\uF0D8/g,"*"],[/\uF0FC/g,"*"],[/\uF076/g,"*"],[/\uF0A7/g,"*"],[/\uF08E/g,"*"],[/\uF0AE/g,"*"],[/\uF02D/g,"*"],[/\uF05B/g,"*"],[/\uF0A3/g,"*"],[/\uF03D/g,"="],[/\uF0B4/g,"*"],[/\uD470/g,"A"],[/\uD443/g,"P"],[/\uD7CF/g,"9"],[/\uD7CE/g,"8"]];
  for (const [p,r] of R) c = c.replace(p, r);
  c = c.replace(/[^\x00-\x7F]/g, "?");
  for (const b of BRANDING) c = c.replace(b, "");
  return c.replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
}

async function genPDF(text, out) {
  const doc = await PDFDocument.create();
  const f = await doc.embedFont(StandardFonts.Helvetica);
  const bf = await doc.embedFont(StandardFonts.HelveticaBold);
  const PW=595,PH=842,M=50,LH=14,FS=10;
  let pg = doc.addPage([PW,PH]), y = PH-M;
  for (const line of text.split("\n")) {
    if (y<M+LH) { pg=doc.addPage([PW,PH]); y=PH-M; }
    const bold = /^(\d+\.|[A-Z][A-Z\s]+:|SECTION|MARKING|ANSWERS|TOTAL)/.test(line);
    const font = bold?bf:f, fs2 = bold?FS+1:FS;
    let cl = "";
    for (const w of line.split(" ")) {
      const t = cl ? cl+" "+w : w;
      if (font.widthOfTextAtSize(t,fs2) > PW-2*M && cl) {
        pg.drawText(cl, {x:M,y,size:fs2,font,color:rgb(0,0,0)});
        y-=LH; if(y<M+LH){pg=doc.addPage([PW,PH]);y=PH-M;} cl=w;
      } else cl=t;
    }
    if(cl){pg.drawText(cl,{x:M,y,size:fs2,font,color:rgb(0,0,0)});y-=LH;}
  }
  fs.writeFileSync(out, await doc.save());
}

function detectGrade(d){return{"grade-7":"7","grade-8":"8","grade-9":"9","grade-10":"10","kcse":"KCSE","kjsea":"KJSEA"}[d]||d;}
function detectType(fn){const l=fn.toLowerCase();if(l.includes("marking")||l.includes("answers")||l.includes("-ms-")||l.includes("_ms_"))return"past_paper";if(l.includes("scheme"))return"scheme";if(l.includes("confidential"))return"exam_paper";return"notes";}
function detectSubject(fn){const l=fn.toLowerCase().replace(/[-_]/g," ");const s={"Mathematics":["math","maths"],"English":["english"],"Kiswahili":["kiswahili","swahili"],"Agriculture":["agriculture"],"Biology":["biology"],"Chemistry":["chemistry"],"Physics":["physics"],"Geography":["geography"],"History":["history"],"CRE":["cre","religious"],"Computer Studies":["computer","ict"],"Business Studies":["business"],"Home Science":["home science","homescience"],"Pre-Technical":["pre-technical","pretechnical"],"Creative Arts":["creative","arts"],"Aviation":["aviation"],"French":["french"],"German":["german"],"Arabic":["arabic"],"Mandarin":["mandarin"],"Fine Arts":["fine arts"],"Music":["music"],"Physical Education":["physical education"],"Sports":["sports"],"Literature":["literature"]};for(const[sub,ps]of Object.entries(s))for(const p of ps)if(l.includes(p))return sub;return"General";}

async function main() {
  console.log("=== Full Reprocess ===\n");
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, {recursive:true});
  
  const all = [];
  let stats = {cleaned:0,kept:0,skipped:0};
  
  // Teacher.co.ke
  for (const dir of ["grade-7","grade-8","grade-9","grade-10","kcse","kjsea"]) {
    const inD = path.join(INPUT_DIR,dir);
    if(!fs.existsSync(inD))continue;
    const outD = path.join(OUTPUT_DIR,dir);
    if(!fs.existsSync(outD))fs.mkdirSync(outD,{recursive:true});
    const files = fs.readdirSync(inD).filter(f=>f.endsWith(".pdf"));
    console.log(`\n--- ${dir} (${files.length}) ---`);
    for (const file of files) {
      try {
        const buf = fs.readFileSync(path.join(inD,file));
        const data = await pdf(buf);
        const text = data.text||"";
        if(text.length<50){stats.skipped++;continue;}
        const cleaned = sanitize(text);
        if(cleaned.length/text.length<0.3){stats.skipped++;continue;}
        const out = path.join(outD,file);
        if(data.numpages>20 && cleaned.length/data.numpages<500){
          fs.copyFileSync(path.join(inD,file),out);stats.kept++;
        } else {
          await genPDF(cleaned,out);stats.cleaned++;
        }
        all.push({title:file.replace(/\.pdf$/i,"").replace(/[-_]/g," "),grade:detectGrade(dir),subject:detectSubject(file),materialType:detectType(file),source:"teacher.co.ke",fileUrl:`/api/source-materials/file/${dir}/${encodeURIComponent(file)}`,fileSize:fs.statSync(out).size,pages:data.numpages});
      } catch(e) { stats.skipped++; }
    }
  }
  
  // FreeExams curriculum designs (already clean)
  for (const dir of ["jss-designs","cbc-designs"]) {
    const inD = path.join(FREEEXAMS_DIR,dir);
    if(!fs.existsSync(inD))continue;
    const outD = path.join(OUTPUT_DIR,dir);
    if(!fs.existsSync(outD))fs.mkdirSync(outD,{recursive:true});
    const files = fs.readdirSync(inD).filter(f=>f.endsWith(".pdf"));
    console.log(`\n--- ${dir} (${files.length}, keeping originals) ---`);
    for (const file of files) {
      const out = path.join(outD,file);
      fs.copyFileSync(path.join(inD,file),out);
      const gradeMatch = file.match(/Grade[_ ](\d+)/i);
      all.push({title:file.replace(/\.pdf$/i,"").replace(/[-_]/g," "),grade:gradeMatch?gradeMatch[1]:"7",subject:detectSubject(file),materialType:"curriculum_design",source:"freeexams.co.ke",fileUrl:`/api/source-materials/file/${dir}/${encodeURIComponent(file)}`,fileSize:fs.statSync(out).size,pages:0});
    }
  }
  
  fs.writeFileSync(path.join(OUTPUT_DIR,"metadata.json"),JSON.stringify(all,null,2));
  console.log(`\n=== Done: ${stats.cleaned} cleaned, ${stats.kept} kept, ${stats.skipped} skipped ===`);
  console.log(`Total metadata: ${all.length}`);
  
  const byGrade={},byType={},bySubject={},bySource={};
  for(const m of all){byGrade[m.grade]=(byGrade[m.grade]||0)+1;byType[m.materialType]=(byType[m.materialType]||0)+1;bySubject[m.subject]=(bySubject[m.subject]||0)+1;bySource[m.source]=(bySource[m.source]||0)+1;}
  console.log("\nBy Grade:",byGrade);
  console.log("By Type:",byType);
  console.log("By Source:",bySource);
}

main();
