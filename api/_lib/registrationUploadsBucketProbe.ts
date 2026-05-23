import type { SupabaseClient } from '@supabase/supabase-js';

export type RegistrationUploadsBucketProbe = {
  ok: boolean;
  error?: string;
};

/**
 * فحص سريع لوجود/إتاحة حاوية مرفقات التسجيل على Storage.
 * لا يُرجع أسرار — فقط رسالة خطأ عامة من Supabase عند الفشل.
 */
export async function probeRegistrationUploadsBucket(
  supabase: SupabaseClient,
  bucketId: string
): Promise<RegistrationUploadsBucketProbe> {
  const { error } = await supabase.storage.from(bucketId).list('', { limit: 1 });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export function registrationUploadsBucketFailureHint(params: {
  bucketId: string;
  errorMessage: string;
}): string | undefined {
  const msg = params.errorMessage.toLowerCase();
  const looksMissing =
    msg.includes('bucket') && (msg.includes('not found') || msg.includes('does not exist'));
  const looksNotFound = msg.includes('not found') || msg.includes('404');
  if (!looksMissing && !looksNotFound) return undefined;

  return [
    `Supabase Storage bucket "${params.bucketId}" is missing or unreachable for service_role.`,
    'Fix: Supabase → SQL Editor → run `supabase/migrations/17_registration_uploads_storage.sql` (or `supabase/REGISTRATION_PUBLIC_FULL_SETUP.sql`).',
    'Then verify Storage → Buckets contains `registration-uploads`.',
  ].join(' ');
}
