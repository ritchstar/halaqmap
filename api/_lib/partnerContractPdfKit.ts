/**
 * توليد PDF للعقد الموحّد (مسار الخدمات البرمجية للمنصة) باستخدام pdfkit.
 * يُحمَّل خط عربي من URL (افتراضي: Noto Naskh Arabic من مستودع الخطوط العام).
 */
import { Buffer } from 'node:buffer';
import PDFDocument from 'pdfkit';
import { loadPartnerContractArabicFont } from './partnerContractArabicFont.js';

function wrapLine(line: string, maxChars: number): string[] {
  const s = line.trimEnd();
  if (s.length <= maxChars) return [s];
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    out.push(s.slice(i, i + maxChars));
    i += maxChars;
  }
  return out;
}

async function tryLoadArabicFont(): Promise<Buffer | null> {
  return loadPartnerContractArabicFont();
}

/** يُنشئ PDF من نص عربي (أسطر) مع محاذاة يمين وعرض ثابت */
export async function generatePartnerUnifiedContractPdfBuffer(plainText: string): Promise<Buffer> {
  const fontBuf = await tryLoadArabicFont();

  return await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: 'A4',
      margin: 48,
      autoFirstPage: true,
    });
    doc.on('data', (d) => chunks.push(d as Buffer));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    if (!fontBuf) {
      reject(new Error('arabic_font_unavailable'));
      return;
    }

    doc.registerFont('NotoNaskhArabic', fontBuf);
    doc.font('NotoNaskhArabic').fontSize(10);

    const textWidth = doc.page.width - 96;
    const lines = plainText.replace(/\r\n/g, '\n').split('\n');
    const maxCharsPerLine = 72;

    for (const raw of lines) {
      const wrapped = wrapLine(raw, maxCharsPerLine);
      for (const w of wrapped) {
        if (doc.y > doc.page.height - 72) doc.addPage();
        doc.text(w || ' ', { align: 'right', width: textWidth });
      }
    }

    doc.end();
  });
}
