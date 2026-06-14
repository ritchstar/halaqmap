import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MAX_PDF_BYTES = 8 * 1024 * 1024;
const MAX_RENDER_WIDTH = 1680;
const MAX_TEXT_CHARS = 14_000;
const MAX_RENDER_PAGES = 2;

export type KhazenPdfPrepareResult = {
  pageCount: number;
  extractedText: string;
  imageBase64: string;
  imageMime: 'image/jpeg';
  renderedPages: number;
};

function isPdfFile(file: File): boolean {
  const t = (file.type || '').toLowerCase();
  return t === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

async function extractPdfText(doc: PDFDocumentProxy): Promise<string> {
  const chunks: string[] = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item && typeof item.str === 'string' ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (pageText) chunks.push(pageText);
  }
  return chunks.join('\n\n').slice(0, MAX_TEXT_CHARS);
}

async function renderPageToJpegBase64(
  doc: PDFDocumentProxy,
  pageNumber: number,
): Promise<{ base64: string; mime: 'image/jpeg' }> {
  const page = await doc.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(2.2, MAX_RENDER_WIDTH / Math.max(baseViewport.width, 1));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('تعذّر تجهيز معاينة PDF');

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  const base64 = dataUrl.split(',')[1];
  if (!base64) throw new Error('تعذّر تحويل PDF إلى صورة');
  return { base64, mime: 'image/jpeg' };
}

/** يستخرج النص ويُحوّل أول صفحة (أو صفحتين مدمجتين) لصورة JPEG لتحليل خازن. */
export async function preparePdfInvoiceForKhazen(file: File): Promise<KhazenPdfPrepareResult> {
  if (!isPdfFile(file)) {
    throw new Error('الملف ليس PDF');
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error('حجم PDF كبير — الحد 8 ميجابايت');
  }

  const buf = await file.arrayBuffer();
  const doc = await getDocument({ data: buf, useSystemFonts: true }).promise;
  const extractedText = await extractPdfText(doc);

  const pagesToRender = Math.min(doc.numPages, MAX_RENDER_PAGES);
  if (pagesToRender <= 0) {
    throw new Error('PDF فارغ');
  }

  if (pagesToRender === 1) {
    const img = await renderPageToJpegBase64(doc, 1);
    return {
      pageCount: doc.numPages,
      extractedText,
      imageBase64: img.base64,
      imageMime: img.mime,
      renderedPages: 1,
    };
  }

  const [p1, p2] = await Promise.all([
    renderPageToJpegBase64(doc, 1),
    renderPageToJpegBase64(doc, 2),
  ]);

  const img1 = await loadJpegFromBase64(p1.base64);
  const img2 = await loadJpegFromBase64(p2.base64);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(img1.width, img2.width);
  canvas.height = img1.height + img2.height + 24;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('تعذّر دمج صفحات PDF');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img1, 0, 0);
  ctx.drawImage(img2, 0, img1.height + 24);

  const merged = canvas.toDataURL('image/jpeg', 0.88).split(',')[1];
  if (!merged) throw new Error('تعذّر دمج صفحات PDF');

  const approxBytes = Math.ceil((merged.length * 3) / 4);
  if (approxBytes > 4 * 1024 * 1024) {
    return {
      pageCount: doc.numPages,
      extractedText,
      imageBase64: p1.base64,
      imageMime: 'image/jpeg',
      renderedPages: 1,
    };
  }

  return {
    pageCount: doc.numPages,
    extractedText,
    imageBase64: merged,
    imageMime: 'image/jpeg',
    renderedPages: 2,
  };
}

function loadJpegFromBase64(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('pdf_page_image_failed'));
    img.src = `data:image/jpeg;base64,${base64}`;
  });
}

export function buildKhazenPdfUserMessage(input: {
  userText: string;
  extractedText: string;
  pageCount: number;
  renderedPages: number;
}): string {
  const parts: string[] = [];
  const trimmed = input.userText.trim();
  if (trimmed) parts.push(trimmed);

  if (input.extractedText.trim()) {
    parts.push(
      `[نص مستخرج من PDF — ${input.pageCount} صفحة]\n${input.extractedText.trim()}`,
    );
  } else {
    parts.push(
      `[PDF بصيغة مسح/صورة — ${input.pageCount} صفحة — تم إرفاق ${input.renderedPages} صفحة كصورة للتحليل]`,
    );
  }

  return parts.join('\n\n');
}

export { isPdfFile, MAX_PDF_BYTES };
