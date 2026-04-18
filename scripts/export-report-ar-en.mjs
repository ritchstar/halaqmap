import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import MarkdownIt from "markdown-it";
import puppeteer from "puppeteer-core";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

const ROOT = process.cwd();
const INPUT_MD = path.join(ROOT, "PROJECT_FULL_REPORT_AR_EN.md");
const OUTPUT_DOCX = path.join(ROOT, "PROJECT_FULL_REPORT_AR_EN.docx");
const OUTPUT_PDF = path.join(ROOT, "PROJECT_FULL_REPORT_AR_EN.pdf");
const TEMP_HTML = path.join(ROOT, "PROJECT_FULL_REPORT_AR_EN.print.html");

const EDGE_PATHS = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

function detectHeading(line) {
  const match = /^(#{1,6})\s+(.*)$/.exec(line);
  if (!match) return null;
  return { level: match[1].length, text: match[2].trim() };
}

function isArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

function toDocxHeadingLevel(level) {
  const map = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
  };
  return map[level] ?? HeadingLevel.HEADING_2;
}

async function buildDocx(markdown) {
  const lines = markdown.split(/\r?\n/);
  const children = [];

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      children.push(new Paragraph({ text: "" }));
      continue;
    }

    const heading = detectHeading(line);
    if (heading) {
      children.push(
        new Paragraph({
          heading: toDocxHeadingLevel(heading.level),
          bidirectional: isArabic(heading.text),
          children: [
            new TextRun({
              text: heading.text,
              bold: true,
            }),
          ],
        }),
      );
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const bulletText = line.replace(/^\s*[-*]\s+/, "").trim();
      children.push(
        new Paragraph({
          bidirectional: isArabic(bulletText),
          bullet: { level: 0 },
          children: [new TextRun({ text: bulletText })],
        }),
      );
      continue;
    }

    const clean = line
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1");
    children.push(
      new Paragraph({
        bidirectional: isArabic(clean),
        children: [new TextRun({ text: clean })],
      }),
    );
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });
  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(OUTPUT_DOCX, buffer);
}

async function buildPdf(markdown) {
  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
  const htmlBody = md.render(markdown);
  const html = `<!doctype html>
<html lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Halaqmap Report</title>
  <style>
    @page { size: A4; margin: 18mm; }
    body {
      font-family: "Segoe UI", "Arial", "Tahoma", sans-serif;
      color: #111;
      line-height: 1.55;
      font-size: 12px;
    }
    h1, h2, h3, h4, h5, h6 { margin: 18px 0 10px; line-height: 1.35; }
    h1 { font-size: 22px; }
    h2 { font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    h3 { font-size: 15px; }
    p, li { margin: 6px 0; }
    code {
      background: #f4f4f4;
      border-radius: 4px;
      padding: 2px 5px;
      font-family: "Consolas", "Courier New", monospace;
      font-size: 11px;
    }
    pre {
      background: #f4f4f4;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 10px;
      overflow: auto;
    }
    hr { border: none; border-top: 1px solid #ddd; margin: 14px 0; }
  </style>
</head>
<body>${htmlBody}</body>
</html>`;

  await fs.writeFile(TEMP_HTML, html, "utf8");

  let executablePath = null;
  for (const p of EDGE_PATHS) {
    try {
      await fs.access(p);
      executablePath = p;
      break;
    } catch {
      // keep searching
    }
  }
  if (!executablePath) {
    throw new Error("Microsoft Edge executable not found for PDF export.");
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(`file:///${TEMP_HTML.replaceAll("\\", "/")}`, {
      waitUntil: "networkidle0",
    });
    await page.pdf({
      path: OUTPUT_PDF,
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "10mm", bottom: "12mm", left: "10mm" },
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  const markdown = await fs.readFile(INPUT_MD, "utf8");
  await buildDocx(markdown);
  await buildPdf(markdown);
  console.log(`DOCX: ${OUTPUT_DOCX}`);
  console.log(`PDF: ${OUTPUT_PDF}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

