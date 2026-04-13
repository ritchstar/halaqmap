import type { SupabaseClient } from '@supabase/supabase-js';
import type { RegistrationAttachmentUrls } from '@/lib/index';

export const REGISTRATION_UPLOADS_BUCKET = 'registration-uploads';

/** يجب أن يطابق سياسة المجلد الأول في 17_registration_uploads_storage.sql */
export const REGISTRATION_STORAGE_ORDER_ID_RE = /^HM-\d{8}-[A-Z0-9]{6}$/;

const MAX_FILE_BYTES = 12 * 1024 * 1024;

/** كتلة LTR معزولة — لا تُدمج داخل جمل عربية حتى لا يختل ترتيب الكلمات في واجهة RTL. */
const LRI = '\u2066';
const PDI = '\u2069';

function ltrBlock(lines: string[]): string {
  return `${LRI}${lines.join('\n')}${PDI}`;
}

/** عربي واضح ثم تعليمات تقنية معزولة اتجاهياً. */
export function registrationUploadErrorForToast(serverMessage: string): string {
  const m = serverMessage.toLowerCase();

  if (m.includes('bucket not found') || m.includes('bucket does not exist')) {
    return (
      'تعذّر رفع الملفات إلى السيرفر.\n' +
      'سبب محتمل: حاوية تخزين مرفقات التسجيل غير مُنشأة في المشروع.\n\n' +
      'اتبع الخطوات التالية من لوحة تحكم Supabase لديك:\n' +
      ltrBlock([
        'Step 1 — Open SQL Editor',
        'Step 2 — Paste and run the full file from your repo:',
        '  supabase/REGISTRATION_PUBLIC_FULL_SETUP.sql',
        '  (creates bucket registration-uploads + policies)',
      ])
    );
  }
  if (
    m.includes('new row violates row-level security') ||
    m.includes('row-level security') ||
    m.includes('rls') ||
    m.includes('permission denied')
  ) {
    return (
      'تعذّر رفع الملفات إلى السيرفر.\n' +
      'رفض الخادم الرفع بسبب سياسات الأمان على التخزين.\n\n' +
      'اتبع الخطوات التالية من لوحة تحكم Supabase لديك:\n' +
      ltrBlock([
        'Step 1 — SQL Editor: paste and run ONE of:',
        '  supabase/REGISTRATION_PUBLIC_FULL_SETUP.sql',
        '  OR supabase/migrations/17_registration_uploads_storage.sql',
        'Step 2 — If scripts already ran: open Storage, then Policies',
        '  Confirm INSERT is allowed for role anon on bucket registration-uploads',
      ])
    );
  }
  return (
    'تعذّر رفع الملفات إلى السيرفر.\n\n' +
    ltrBlock([`Server message: ${serverMessage}`])
  );
}


function safeFileSegment(name: string): string {
  const base = name.replace(/[^\w.\u0600-\u06FF-]/g, '_').slice(0, 120);
  return base || 'file';
}

async function uploadOne(
  client: SupabaseClient,
  orderId: string,
  subfolder: string,
  file: File
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (file.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      error: `حجم الملف يتجاوز الحد المسموح (${MAX_FILE_BYTES / 1024 / 1024} ميجابايت): ${file.name}`,
    };
  }
  const path = `${orderId}/${subfolder}/${crypto.randomUUID()}_${safeFileSegment(file.name)}`;
  const { error } = await client.storage.from(REGISTRATION_UPLOADS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  const { data } = client.storage.from(REGISTRATION_UPLOADS_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export async function uploadRegistrationAttachments(
  client: SupabaseClient,
  orderId: string,
  files: {
    commercialRegistry: File;
    municipalLicense: File;
    healthCertificates: File[];
    shopExterior: File;
    shopInterior: File;
    bannerImages: File[];
    receipt: File | null;
  }
): Promise<{ ok: true; urls: RegistrationAttachmentUrls } | { ok: false; error: string }> {
  if (!REGISTRATION_STORAGE_ORDER_ID_RE.test(orderId)) {
    return {
      ok: false,
      error: `رمز الطلب لا يطابق نمط التخزين المطلوب: ${orderId}`,
    };
  }

  const cr = await uploadOne(client, orderId, 'documents', files.commercialRegistry);
  if (!cr.ok) return cr;

  const ml = await uploadOne(client, orderId, 'documents', files.municipalLicense);
  if (!ml.ok) return ml;

  const healthCertificates: string[] = [];
  for (const f of files.healthCertificates) {
    const h = await uploadOne(client, orderId, 'health', f);
    if (!h.ok) return h;
    healthCertificates.push(h.url);
  }

  const ex = await uploadOne(client, orderId, 'shop', files.shopExterior);
  if (!ex.ok) return ex;

  const inn = await uploadOne(client, orderId, 'shop', files.shopInterior);
  if (!inn.ok) return inn;

  const banners: string[] = [];
  for (const f of files.bannerImages) {
    const b = await uploadOne(client, orderId, 'banners', f);
    if (!b.ok) return b;
    banners.push(b.url);
  }

  let receipt: string | undefined;
  if (files.receipt) {
    const rec = await uploadOne(client, orderId, 'receipt', files.receipt);
    if (!rec.ok) return rec;
    receipt = rec.url;
  }

  return {
    ok: true,
    urls: {
      commercialRegistry: cr.url,
      municipalLicense: ml.url,
      healthCertificates,
      shopExterior: ex.url,
      shopInterior: inn.url,
      banners,
      receipt,
    },
  };
}
