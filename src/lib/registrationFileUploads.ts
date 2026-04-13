import type { SupabaseClient } from '@supabase/supabase-js';
import type { RegistrationAttachmentUrls } from '@/lib/index';

export const REGISTRATION_UPLOADS_BUCKET = 'registration-uploads';

const MAX_FILE_BYTES = 12 * 1024 * 1024;

/** عزل اتجاه النص: يمنع اختلال ترتيب الكلمات العربية عند وجود مقاطع لاتينية داخل الرسالة. */
const LRI = '\u2066';
const PDI = '\u2069';

/** رسالة واحدة جاهزة للعرض في التنبيه (بدون دمج جملتين قد يفسد ترتيبها في واجهة RTL). */
export function registrationUploadErrorForToast(serverMessage: string): string {
  const m = serverMessage.toLowerCase();
  const migration = `${LRI}17_registration_uploads_storage.sql${PDI}`;
  const bucket = `${LRI}${REGISTRATION_UPLOADS_BUCKET}${PDI}`;

  if (m.includes('bucket not found') || m.includes('bucket does not exist')) {
    return (
      `تعذّر رفع الملفات إلى السيرفر: حاوية التخزين ${bucket} غير موجودة في مشروع Supabase. ` +
      `افتح SQL Editor ونفّذ محتوى الملف ${migration} من مجلد ${LRI}supabase/migrations${PDI} في المشروع، أو أنشئ الحاوية يدوياً بنفس الاسم مع سياسات الرفع للتسجيل.`
    );
  }
  if (
    m.includes('new row violates row-level security') ||
    m.includes('row-level security') ||
    m.includes('rls') ||
    m.includes('permission denied')
  ) {
    return (
      `تعذّر رفع الملفات إلى السيرفر: رفض الخادم الرفع بسبب سياسات الأمان على التخزين. ` +
      `نفّذ في SQL Editor محتوى الملف ${migration} كاملاً (ينشئ الحاوية ${bucket} وسياسات الإدراج والقراءة). إن كان الترحيل منفّذا مسبقاً، راجع تبويب Storage ثم Policies للتأكد من وجود سياسة إدراج لدور ${LRI}anon${PDI}.`
    );
  }
  return `تعذّر رفع الملفات إلى السيرفر. ${LRI}${serverMessage}${PDI}`;
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
