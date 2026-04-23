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

/**
 * عند رفع `dist/` على استضافة ثابتة (cPanel) بينما دوال `/api/*` منشورة على Vercel،
 * المسار النسبي `/api/...` يصيب الاستضافة الثابتة فتُرجع 404 — عيّن عند البناء:
 * `VITE_REGISTRATION_API_ORIGIN=https://your-app.vercel.app` (بدون شرطة أخيرة).
 */
function registrationApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

function absoluteOrRelativeApiUrl(path: string): string {
  const origin = registrationApiOrigin();
  if (!origin) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${clean}`;
}

function registrationUploadEndpoint(): string {
  const explicit = import.meta.env.VITE_REGISTRATION_UPLOAD_URL?.trim();
  if (explicit) return explicit;
  return absoluteOrRelativeApiUrl('/api/register-upload-file');
}

function registrationSignedUploadEndpoint(): string {
  const explicit = import.meta.env.VITE_REGISTRATION_SIGNED_URL?.trim();
  if (explicit) return explicit;
  return absoluteOrRelativeApiUrl('/api/register-signed-upload');
}

function getBrowserSupabaseAnonKey(): string {
  return String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
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
  file: File,
  intentToken: string | null
): Promise<
  | { ok: true; url: string }
  | { ok: false; fallback: true }
  | { ok: false; fallback: false; error: string }
> {
  const anon = getBrowserSupabaseAnonKey();
  if (!intentToken?.trim() && !anon) {
    return {
      ok: false,
      fallback: false,
      error:
        'VITE_SUPABASE_ANON_KEY غير موجود في build الواجهة (الإنتاج)، ولا يوجد توقيع نية تسجيل. أضف VITE_SUPABASE_ANON_KEY أو فعّل REGISTRATION_INTENT_SECRET على السيرفر مع mint.',
    };
  }

  const endpoint = registrationSignedUploadEndpoint();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-order-id': orderId,
    'x-storage-subpath': storageSubpath,
  };
  if (anon) headers['x-supabase-anon'] = anon;
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  if (intentToken?.trim()) headers['x-registration-intent'] = intentToken.trim();

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers,
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
      const parts = [parsed.error, parsed.hint].filter(Boolean);
      const base =
        (parts.length ? parts.join('\n') : '') ||
        parsed.error ||
        `فشل إنشاء رابط الرفع الموقّع (${res.status}).`;
      const tail =
        rawText && rawText.length < 800 && !parsed.error ? `\n${rawText}` : '';
      return { ok: false, fallback: false, error: `${base}${tail}` };
    }
    return {
      ok: false,
      fallback: false,
      error: parsed.error || `رفض السيرفر (${res.status}).`,
    };
  }

  let mint: { path?: string; token?: string; signedUrl?: string };
  try {
    mint = (await res.json()) as { path?: string; token?: string; signedUrl?: string };
  } catch {
    return {
      ok: false,
      fallback: false,
      error: 'استجابة غير صالحة من سيرفر الرفع الموقّع (JSON غير متوقع).',
    };
  }
  if (!mint.path || (!mint.token && !mint.signedUrl)) {
    return {
      ok: false,
      fallback: false,
      error: 'استجابة غير صالحة من سيرفر الرفع الموقّع (لا يوجد path/token/signedUrl).',
    };
  }

  if (mint.signedUrl) {
    const put = await putFileViaSignedUploadUrl(mint.signedUrl, file);
    if (!put.ok) {
      const msg = ('message' in put ? put.message : '').toLowerCase();
      if (msg.includes('403') || msg.includes('forbidden')) {
        return { ok: false, fallback: true };
      }
      return { ok: false, fallback: false, error: 'message' in put ? put.message : 'signed upload failed' };
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
  file: File,
  intentToken: string | null
): Promise<
  | { ok: true; url: string }
  | { ok: false; fallback: true }
  | { ok: false; fallback: false; error: string }
> {
  const anon = getBrowserSupabaseAnonKey();
  if (!intentToken?.trim() && !anon) {
    return {
      ok: false,
      fallback: false,
      error:
        'VITE_SUPABASE_ANON_KEY غير موجود في build الواجهة (الإنتاج)، ولا يوجد توقيع نية تسجيل. أضف VITE_SUPABASE_ANON_KEY أو فعّل REGISTRATION_INTENT_SECRET على السيرفر مع mint.',
    };
  }

  const endpoint = registrationUploadEndpoint();
  const headers: Record<string, string> = {
    'Content-Type': 'application/octet-stream',
    'x-file-content-type': file.type || 'application/octet-stream',
    'x-order-id': orderId,
    'x-storage-subpath': storageSubpath,
  };
  if (anon) headers['x-supabase-anon'] = anon;
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  if (intentToken?.trim()) headers['x-registration-intent'] = intentToken.trim();

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers,
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
  file: File,
  intentToken: string | null
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (shouldAttemptServerUpload() && !getBrowserSupabaseAnonKey() && !intentToken?.trim()) {
    return {
      ok: false,
      error:
        'تعذّر رفع المرفقات: مفتاح anon الخاص بالواجهة غير مضمّن في الإنتاج (VITE_SUPABASE_ANON_KEY)، ولا يوجد توقيع نية تسجيل. أضف VITE_SUPABASE_ANON_KEY أو فعّل REGISTRATION_INTENT_SECRET على السيرفر.',
    };
  }

  if (file.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      error: `حجم الملف يتجاوز الحد المسموح (${MAX_FILE_BYTES / 1024 / 1024} ميجابايت): ${file.name}`,
    };
  }
  const storageSubpath = `${subfolder}/${crypto.randomUUID()}_${safeFileSegment(file.name)}`;
  const path = `${orderId}/${storageSubpath}`;

  if (shouldAttemptServerUpload()) {
    const signed = await trySignedUrlUpload(client, orderId, storageSubpath, file, intentToken);
    if (signed.ok === true) {
      return { ok: true, url: signed.url };
    }
    /* إذا فشل المسار الموقّع برسالة تشخيصية واضحة (401/5xx/JSON غير صالح) لا نكمل إلى رفع ثانٍ لنفس الملف — ذلك كان يسبب رسائل مزدوجة مضللة في الواجهة. */
    if (signed.fallback === false) {
      return { ok: false, error: signed.error };
    }

    const server = await tryServerUpload(orderId, storageSubpath, file, intentToken);
    if (server.ok === true) {
      return { ok: true, url: server.url };
    }
    if (server.fallback === false) {
      return { ok: false, error: server.error };
    }

    if (!allowAnonDirectStorageUpload()) {
      const splitDeployHint =
        import.meta.env.PROD &&
        !registrationApiOrigin() &&
        !import.meta.env.VITE_REGISTRATION_SIGNED_URL?.trim() &&
        !import.meta.env.VITE_REGISTRATION_UPLOAD_URL?.trim()
          ? '\n\nتنبيه شائع: إذا كانت الواجهة على cPanel/استضافة ثابتة والدوال على Vercel فقط، فالمسار `/api/...` لا يصل إلى Vercel. أضف عند بناء الإنتاج `VITE_REGISTRATION_API_ORIGIN=https://مشروعك.vercel.app` ثم أعد `npm run build` وارفع `dist/` من جديد.'
          : '';
      return {
        ok: false,
        error:
          'تعذّر رفع الملفات عبر السيرفر (المسار الموقّع غير متاح، والمسار البديل غير جاهز). تحقق من: (1) حاوية `registration-uploads` في Supabase وسياساتها، (2) تطابق `VITE_SUPABASE_ANON_KEY` في الواجهة مع `SUPABASE_ANON_KEY` أو `VITE_SUPABASE_ANON_KEY` على Vercel، (3) سجلات الدالتين `register-signed-upload` و `register-upload-file`.' +
          splitDeployHint,
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
    shopExterior: File;
    shopInterior: File;
    bannerImages: File[];
    receipt: File | null;
  },
  options?: { intentToken?: string | null }
): Promise<{ ok: true; urls: RegistrationAttachmentUrls } | { ok: false; error: string }> {
  if (!REGISTRATION_STORAGE_ORDER_ID_RE.test(orderId)) {
    return {
      ok: false,
      error: `رمز الطلب لا يطابق نمط التخزين المطلوب: ${orderId}`,
    };
  }

  const intentToken = options?.intentToken ?? null;

  const ex = await uploadOne(client, orderId, 'shop', files.shopExterior, intentToken);
  if (ex.ok === false) return { ok: false, error: ex.error };

  const inn = await uploadOne(client, orderId, 'shop', files.shopInterior, intentToken);
  if (inn.ok === false) return { ok: false, error: inn.error };

  const banners: string[] = [];
  for (const f of files.bannerImages) {
    const b = await uploadOne(client, orderId, 'banners', f, intentToken);
    if (b.ok === false) return { ok: false, error: b.error };
    banners.push(b.url);
  }

  let receipt: string | undefined;
  if (files.receipt) {
    const rec = await uploadOne(client, orderId, 'receipt', files.receipt, intentToken);
    if (rec.ok === false) return { ok: false, error: rec.error };
    receipt = rec.url;
  }

  return {
    ok: true,
    urls: {
      shopExterior: ex.url,
      shopInterior: inn.url,
      banners,
      receipt,
    },
  };
}
