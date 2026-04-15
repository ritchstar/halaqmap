import type { SupabaseClient } from '@supabase/supabase-js';
import type { RegistrationAttachmentUrls } from '@/lib/index';

export const REGISTRATION_UPLOADS_BUCKET = 'registration-uploads';

/** تنسيق رقم الطلب في مسارات التخزين (الواجهة) — مستقل عن سياسة RLS المبسّطة على الحاوية */
export const REGISTRATION_STORAGE_ORDER_ID_RE = /^HM-\d{8}-[A-Z0-9]{6}$/;

/** حد رفع المرفقات (PDF/صور) — رفعّه مع دوال Vercel وحدود الاستضافة */
const MAX_FILE_BYTES = 20 * 1024 * 1024;

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
        'SQL Editor — paste and run:',
        '  supabase/REGISTRATION_PUBLIC_FULL_SETUP.sql',
      ])
    );
  }
  if (
    m.includes('new row violates row-level security') ||
    m.includes('row-level security') ||
    m.includes('rls') ||
    m.includes('permission denied') ||
    m.includes('403') ||
    m.includes('forbidden') ||
    m.includes('postgrest')
  ) {
    return (
      'تعذّر رفع الملفات إلى السيرفر.\n' +
      'رفض الخادم الرفع بسبب سياسات الأمان على التخزين.\n\n' +
      'اتبع الخطوات التالية من لوحة تحكم Supabase لديك:\n' +
      ltrBlock([
        'SQL Editor — run (creates bucket + simple anon INSERT policy):',
        '  supabase/REGISTRATION_PUBLIC_FULL_SETUP.sql',
        'Or replace only the INSERT policy:',
        '  supabase/migrations/21_registration_storage_path_policy_fix.sql',
        'Check: Storage → Policies → INSERT allowed for anon on registration-uploads',
        'Vercel: SUPABASE_SERVICE_ROLE_KEY + GET /api/register-signed-upload و /api/register-upload-file (ready: true)',
        'الإنتاج: الرفع عبر السيرفر فقط — لا يعتمد على سياسات anon إن وُجدت الدوال.',
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

function registrationUploadEndpoint(): string {
  const explicit = import.meta.env.VITE_REGISTRATION_UPLOAD_URL?.trim();
  if (explicit) return explicit;
  return '/api/register-upload-file';
}

function registrationSignedUploadEndpoint(): string {
  const explicit = import.meta.env.VITE_REGISTRATION_SIGNED_URL?.trim();
  if (explicit) return explicit;
  return '/api/register-signed-upload';
}

function shouldAttemptServerUpload(): boolean {
  if (import.meta.env.VITE_REGISTRATION_UPLOAD_URL?.trim()) return true;
  if (import.meta.env.VITE_REGISTRATION_SIGNED_URL?.trim()) return true;
  return import.meta.env.PROD;
}

/** في الإنتاج: لا نستخدم storage.upload بمفتاح anon (403/RLS). التطوير المحلي: مسموح للتجربة. */
function allowAnonDirectStorageUpload(): boolean {
  if (import.meta.env.VITE_REGISTRATION_ALLOW_ANON_UPLOAD === 'true') return true;
  return import.meta.env.DEV;
}

/**
 * نفس تنسيق @supabase/storage-js uploadToSignedUrl — بدون تمرير ترويسة Authorization.
 */
async function putFileViaSignedUploadUrl(signedUrl: string, file: File): Promise<{ ok: true } | { ok: false; message: string }> {
  const body = new FormData();
  body.append('cacheControl', '3600');
  body.append('', file);
  try {
    const res = await fetch(signedUrl, { method: 'PUT', body });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return {
        ok: false,
        message: t || `HTTP ${res.status} ${res.statusText}`,
      };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: msg };
  }
}

/**
 * السيرفر يُصدِر token/signedUrl بمفتاح الخدمة؛ الرفع إلى Storage بدون JWT anon على الطلب.
 */
async function trySignedUrlUpload(
  client: SupabaseClient,
  orderId: string,
  storageSubpath: string,
  file: File
): Promise<
  | { ok: true; url: string }
  | { ok: false; fallback: true }
  | { ok: false; fallback: false; error: string }
> {
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!anon) return { ok: false, fallback: true };

  const endpoint = registrationSignedUploadEndpoint();
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-order-id': orderId,
        'x-storage-subpath': storageSubpath,
        'x-supabase-anon': anon,
      },
    });
  } catch {
    return { ok: false, fallback: true };
  }

  if (res.status === 503) return { ok: false, fallback: true };
  if (res.status === 404) return { ok: false, fallback: true };

  if (!res.ok) {
    const rawText = await res.text();
    let parsed: { error?: string; hint?: string } = {};
    try {
      parsed = JSON.parse(rawText) as { error?: string; hint?: string };
    } catch {
      /* ignore */
    }
    if (res.status === 401) {
      const parts = [parsed.error, parsed.hint].filter(Boolean);
      return {
        ok: false,
        fallback: false,
        error:
          (parts.length ? parts.join('\n') : '') ||
          'رفض السيرفر التحقق (401). تأكّد من تطابق مفتاح anon على Vercel مع Supabase.',
      };
    }
    if (res.status >= 500) {
      return { ok: false, fallback: true };
    }
    return {
      ok: false,
      fallback: false,
      error: parsed.error || `رفض السيرفر (${res.status}).`,
    };
  }

  const mint = (await res.json()) as { path?: string; token?: string; signedUrl?: string };
  if (!mint.path || (!mint.token && !mint.signedUrl)) {
    return { ok: false, fallback: true };
  }

  if (mint.signedUrl) {
    const put = await putFileViaSignedUploadUrl(mint.signedUrl, file);
    if (!put.ok) {
      const msg = put.message.toLowerCase();
      if (msg.includes('403') || msg.includes('forbidden')) {
        return { ok: false, fallback: true };
      }
      return { ok: false, fallback: false, error: put.message };
    }
  } else {
    const bucket = client.storage.from(REGISTRATION_UPLOADS_BUCKET);
    const uploadToSignedUrl = (
      bucket as unknown as {
        uploadToSignedUrl: (
          path: string,
          token: string,
          body: File,
          opts?: { contentType?: string; cacheControl?: string }
        ) => Promise<{ data: { path: string } | null; error: { message: string } | null }>;
      }
    ).uploadToSignedUrl.bind(bucket);

    const { error: upErr } = await uploadToSignedUrl(mint.path, mint.token!, file, {
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
    });

    if (upErr) {
      return { ok: false, fallback: false, error: upErr.message };
    }
  }

  const { data: pub } = client.storage.from(REGISTRATION_UPLOADS_BUCKET).getPublicUrl(mint.path);
  return { ok: true, url: pub.publicUrl };
}

/**
 * رفع عبر دالة Vercel بمفتاح الخدمة (لا يعتمد على سياسات تخزين anon).
 * fallback: true فقط عند 503 (غير مهيأ) أو 404 (لا يوجد مسار) أو فشل شبكة — حتى لا نخفي أخطاء 401/5xx
 * برسالة RLS مضللة بعد الرجوع للرفع المباشر من المتصفح.
 */
async function tryServerUpload(
  orderId: string,
  storageSubpath: string,
  file: File
): Promise<
  | { ok: true; url: string }
  | { ok: false; fallback: true }
  | { ok: false; fallback: false; error: string }
> {
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!anon) return { ok: false, fallback: true };

  const endpoint = registrationUploadEndpoint();
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-file-content-type': file.type || 'application/octet-stream',
        'x-order-id': orderId,
        'x-storage-subpath': storageSubpath,
        'x-supabase-anon': anon,
      },
      body: file,
    });
  } catch {
    return { ok: false, fallback: true };
  }

  if (res.status === 503) return { ok: false, fallback: true };

  if (res.ok) {
    const data = (await res.json()) as { publicUrl?: string };
    if (data.publicUrl) return { ok: true, url: data.publicUrl };
    return {
      ok: false,
      fallback: false,
      error:
        'استجابة غير متوقعة من سيرفر الرفع (لا يوجد publicUrl). راجِع نشر Vercel ومسار api/register-upload-file.',
    };
  }

  const rawText = await res.text();
  let parsed: { error?: string; hint?: string } = {};
  try {
    parsed = JSON.parse(rawText) as { error?: string; hint?: string };
  } catch {
    /* ليست JSON */
  }

  if (res.status === 404) return { ok: false, fallback: true };

  if (res.status === 400) {
    return { ok: false, fallback: false, error: parsed.error || 'طلب غير صالح' };
  }

  if (res.status === 413) {
    return {
      ok: false,
      fallback: false,
      error:
        parsed.error ||
        `حجم الملف يتجاوز الحد المسموح (${MAX_FILE_BYTES / 1024 / 1024} ميجابايت): ${file.name}`,
    };
  }

  if (res.status === 401) {
    const parts = [parsed.error, parsed.hint].filter(Boolean);
    return {
      ok: false,
      fallback: false,
      error:
        (parts.length ? parts.join('\n') : '') ||
        'رفض السيرفر التحقق (401). على Vercel أضِف SUPABASE_ANON_KEY بنفس قيمة مفتاح anon من Supabase، أو تأكّد أن VITE_SUPABASE_ANON_KEY مطابق تماماً (بدون مسافات زائدة).',
    };
  }

  if (res.status >= 500) {
    const base =
      parsed.error ||
      `فشل رفع الملف عبر السيرفر (${res.status}). راجِع سجلات الدالة في Vercel وحاوية registration-uploads.`;
    return {
      ok: false,
      fallback: false,
      error: rawText && rawText.length < 400 && !parsed.error ? `${base}\n${rawText}` : base,
    };
  }

  return {
    ok: false,
    fallback: false,
    error: parsed.error || `رفض السيرفر الطلب (${res.status}).`,
  };
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
  const storageSubpath = `${subfolder}/${crypto.randomUUID()}_${safeFileSegment(file.name)}`;
  const path = `${orderId}/${storageSubpath}`;

  if (shouldAttemptServerUpload()) {
    const signed = await trySignedUrlUpload(client, orderId, storageSubpath, file);
    if (signed.ok === true) {
      return { ok: true, url: signed.url };
    }
    if (signed.fallback === false) {
      return { ok: false, error: signed.error };
    }

    const server = await tryServerUpload(orderId, storageSubpath, file);
    if (server.ok === true) {
      return { ok: true, url: server.url };
    }
    if (server.fallback === false) {
      return { ok: false, error: server.error };
    }

    if (!allowAnonDirectStorageUpload()) {
      return {
        ok: false,
        error:
          'تعذّر رفع الملفات عبر السيرفر. في Vercel: عيّن SUPABASE_SERVICE_ROLE_KEY و VITE_SUPABASE_ANON_KEY (أو SUPABASE_ANON_KEY) ثم أعد النشر. تحقق: GET /api/register-signed-upload و GET /api/register-upload-file يجب أن يعرضا ready: true.',
      };
    }
  }

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
  if (cr.ok === false) return { ok: false, error: cr.error };

  const ml = await uploadOne(client, orderId, 'documents', files.municipalLicense);
  if (ml.ok === false) return { ok: false, error: ml.error };

  const healthCertificates: string[] = [];
  for (const f of files.healthCertificates) {
    const h = await uploadOne(client, orderId, 'health', f);
    if (h.ok === false) return { ok: false, error: h.error };
    healthCertificates.push(h.url);
  }

  const ex = await uploadOne(client, orderId, 'shop', files.shopExterior);
  if (ex.ok === false) return { ok: false, error: ex.error };

  const inn = await uploadOne(client, orderId, 'shop', files.shopInterior);
  if (inn.ok === false) return { ok: false, error: inn.error };

  const banners: string[] = [];
  for (const f of files.bannerImages) {
    const b = await uploadOne(client, orderId, 'banners', f);
    if (b.ok === false) return { ok: false, error: b.error };
    banners.push(b.url);
  }

  let receipt: string | undefined;
  if (files.receipt) {
    const rec = await uploadOne(client, orderId, 'receipt', files.receipt);
    if (rec.ok === false) return { ok: false, error: rec.error };
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
