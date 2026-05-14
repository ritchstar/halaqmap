/**
 * العقد الرقمي الموحّد — مسار الشركاء (حلاق ماب).
 * يتضمن بنية المواد + المادة (8) التعهد الرقمي، وتوليد PDF بدعم العربية (reshape + bidi + خط عربي).
 */
import { Buffer } from 'node:buffer';
import PDFDocument from 'pdfkit';
import bidiFactory from 'bidi-js';
import reshaper from 'arabic-persian-reshaper';

const DEFAULT_AR_FONT_URL =
  'https://raw.githubusercontent.com/googlefonts/noto-naskh-arabic/main/fonts/ttf/NotoNaskhArabic-Regular.ttf';

const bidi = bidiFactory();

async function tryLoadArabicFont(): Promise<Buffer | null> {
  const url = (process.env.PARTNER_CONTRACT_ARABIC_FONT_URL || DEFAULT_AR_FONT_URL).trim();
  if (!url) return null;
  try {
    const r = await fetch(url, { redirect: 'follow' });
    if (!r.ok) return null;
    return Buffer.from(await r.arrayBuffer());
  } catch {
    return null;
  }
}

/** نصوص معروضة في PDF — اتجاه RTL بعد reshape + خوارزمية يونيكود ثنائية الاتجاه */
function processAr(text: string): string {
  const reshaped = reshaper.ArabicShaper.convertArabic(text);
  const embeddingLevels = bidi.getEmbeddingLevels(reshaped, 'rtl');
  return bidi.getReorderedString(reshaped, embeddingLevels);
}

export const PARTNER_UNIFIED_CONTRACT = {
  title: 'مسودة العقد الرقمي الموحد',
  subtitle: 'إطار استخدام «مسار الشركاء» وخدمات الظهور الرقمي على منصة حلاق ماب',
  sections: [
    {
      id: 1,
      title: 'المادة (1) — الطرفان وبيانات التعاقد',
      content:
        'الطرف الأول: مؤسسة أحمد بن عبدالله بن سراء التجارية، سجلها الوطني الموحد: 7054117093. الطرف الثاني (الشريك): صاحب الصلاحية التجارية والنظامية لممارسة النشاط التجاري، وتعتبر بياناته المدخلة في مسار الشركاء صحيحة ومحدثة.',
    },
    {
      id: 2,
      title: 'المادة (2) — التعريفات',
      content:
        'مسار الشركاء: المسار الرقمي الموحد للتعريف بالخدمة وإتمام الاشتراك والدفع. الخدمة الرقمية: خدمات البرمجيات والاستضافة والواجهات للظهور على منصة حلاق ماب.',
    },
    {
      id: 3,
      title: 'المادة (3) — طبيعة الخدمة وحدود المسؤولية',
      content:
        'يقتصر دور المنصة على توفير البنية التحتية الرقمية والربط التقني عبر الخريطة والواجهات المتاحة. الشريك هو المسؤول الحصري والكامل عن دقة المواعيد المحددة وجودة الخدمات والالتزام بالاشتراطات النظامية والصحية.',
    },
    {
      id: 4,
      title: 'المادة (4) — الالتزامات المالية والاشتراكات',
      content:
        'يلتزم الشريك بدفع رسوم الباقة المحددة المتفق عليها (150، 200، 300 ريال) بشكل دوري عبر بوابات الدفع الإلكترونية المعتمدة (ميسر). جميع المدفوعات غير قابلة للاسترداد بعد تفعيل الباقة والظهور.',
    },
    {
      id: 5,
      title: 'المادة (5) — حماية البيانات الشخصية والسرية',
      content:
        'يلتزم الطرفان التزاماً تاماً بنظام حماية البيانات الشخصية الصادر في المملكة العربية السعودية تحت إشراف (سدايا). تتعهد المنصة بمعالجة وتخزين بيانات المستفيدين وحجوزاتهم داخل مراكز بيانات سحابية محلية آمنة داخل حدود المملكة (AWS الرياض/جدة).',
    },
    {
      id: 6,
      title: 'المادة (6) — الملكية الفكرية',
      content:
        "يقر الشريك بأن كافة حقوق الملكية الفكرية، الكود المصدري (Source Code)، الواجهات، التصاميم، والعلامة التجارية لـ 'حلاق ماب' هي ملكية حصرية ومطلقة لـ مؤسسة أحمد بن عبدالله بن سراء التجارية.",
    },
    {
      id: 7,
      title: 'المادة (7) — القانون الواجب التطبيق وفض النزاعات',
      content:
        'يخضع هذا العقد ويفسر وفقاً للأنظمة واللوائح المعمول بها في المملكة العربية السعودية، وفي حال تعذر الحل الودي يتم اللجوء إلى الجهة القضائية المختصة بمدينة الرياض.',
    },
    {
      id: 8,
      title: 'المادة (8) — الحجية القانونية والتوقيع الرقمي (بند التعهد الجديد)',
      content:
        'يقر ويعلن الشريك بصورة قاطعة لا تقبل الجهالة بأن قيامه بالتأشير الإلكتروني بالموافقة على التعهد القانوني أثناء خطوات التسجيل في مسار الشركاء، يعد بمثابة توقيع إلكتروني رسمي وموافقة نهائية ملزمة على كافة شروط وأحكام هذا العقد، وله كامل الحجية القانونية والنظامية بموجب نظام التعاملات الإلكترونية السعودي.',
    },
  ],
} as const;

export type PartnerUnifiedContractPdfPartnerData = {
  name: string;
  cr: string;
  package: string;
  date: string;
};

/** حقول البريد/الإدارة — نفس الشكل السابق لتوافق partnerContractNotify */
export type PartnerUnifiedContractFields = {
  establishmentName: string;
  commercialRegistration: string | null;
  packageTypeAr: string;
  contractDateDisplay: string;
  registrationOrderId?: string | null;
};

export async function buildPartnerUnifiedContractPdf(
  partnerData: PartnerUnifiedContractPdfPartnerData
): Promise<Buffer> {
  const fontBuf = await tryLoadArabicFont();

  return await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, autoFirstPage: true });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err: Error) => reject(err));

    const textWidth = doc.page.width - 100;

    if (fontBuf) {
      doc.registerFont('PartnerContractAr', fontBuf);
      doc.font('PartnerContractAr');
    } else {
      doc.font('Helvetica').fontSize(9);
      doc.text(
        processAr(
          '(تنبيه تقني: تعذّر تحميل خط عربي؛ قد تظهر الحروف بشكل غير مثالي. عيّن PARTNER_CONTRACT_ARABIC_FONT_URL إلى ملف TTF عربي موثوق.)'
        ),
        { align: 'right', width: textWidth }
      );
      doc.moveDown(0.5);
    }

    const writeAr = (size: number, line: string, opts?: { moveDown?: number }) => {
      doc.fontSize(size).text(processAr(line), { align: 'right', width: textWidth });
      doc.moveDown(opts?.moveDown ?? 0.35);
    };

    writeAr(18, PARTNER_UNIFIED_CONTRACT.title);
    writeAr(12, PARTNER_UNIFIED_CONTRACT.subtitle, { moveDown: 0.6 });
    writeAr(
      10,
      `اسم المنشأة: ${partnerData.name} | سجل تجاري: ${partnerData.cr}`
    );
    writeAr(10, `الباقة المشتركة: ${partnerData.package} | تاريخ الموافقة والتفعيل: ${partnerData.date}`, {
      moveDown: 0.8,
    });

    for (const sec of PARTNER_UNIFIED_CONTRACT.sections) {
      writeAr(12, sec.title);
      writeAr(10, sec.content, { moveDown: 0.55 });
    }

    doc.end();
  });
}
