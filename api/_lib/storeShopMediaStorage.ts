/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نقل شعار المتجر وخلفيات الصفحة/الهيدر من base64 داخل payload إلى ملف حقيقي
 * في Supabase Storage (سطل store-shop-media)، ليُخزَّن رابط صغير بدل نص ضخم.
 * هذا يمنع إعادة إرسال بيانات الصورة كاملة مع كل استطلاع (polling)، ويتيح
 * للمتصفح تخزين الصورة مؤقتاً بنفسه (HTTP cache) — عكس تخزينها داخل JSON.
 *
 * يُستدعى من مسار الحفظ (saveHost) في كل منتج فقط، بعد أن يكون
 * parseShopLogoSrc / sanitizeShopBackground قد تحقق من صحة القيمة الواردة.
 * فشل الرفع (شبكة، صلاحيات...) لا يُسقط عملية الحفظ — تبقى القيمة كـ base64
 * كما كانت، فقط بلا الاستفادة من هذا التحسين لتلك المحاولة.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export const STORE_SHOP_MEDIA_BUCKET = 'store-shop-media';

const DATA_IMAGE_RE = /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/]+=?=?)$/;

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

/**
 * إن كانت القيمة صورة base64 صالحة، تُرفع إلى التخزين ويُعاد رابطها العام.
 * غير ذلك (فارغة، أو رابط https موجود مسبقاً، أو تنسيق غير معروف) تُعاد كما هي.
 */
export async function persistShopImageIfBase64(
  supabase: SupabaseClient,
  scopeKey: string,
  field: string,
  value: string,
): Promise<string> {
  if (!value || !value.startsWith('data:image/')) return value;
  const match = DATA_IMAGE_RE.exec(value.replace(/\s+/g, ''));
  if (!match) return value;
  const ext = match[1] === 'png' ? 'png' : 'jpg';
  const contentType = match[1] === 'png' ? 'image/png' : 'image/jpeg';
  let bytes: Buffer;
  try {
    bytes = Buffer.from(match[2], 'base64');
  } catch {
    return value;
  }
  if (bytes.byteLength === 0) return value;
  const safeScope = scopeKey.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'shop';
  const path = `${safeScope}/${field}-${Date.now()}-${randomSuffix()}.${ext}`;
  try {
    const { error } = await supabase.storage.from(STORE_SHOP_MEDIA_BUCKET).upload(path, bytes, {
      contentType,
      upsert: false,
      cacheControl: '31536000',
    });
    if (error) return value;
    const { data } = supabase.storage.from(STORE_SHOP_MEDIA_BUCKET).getPublicUrl(path);
    return data?.publicUrl || value;
  } catch {
    return value;
  }
}
