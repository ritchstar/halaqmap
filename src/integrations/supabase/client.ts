import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL?.trim() &&
    import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  );
}

/** عميل للمتصفح؛ يعيد null إذا لم تُضبط المتغيرات (لا يُرمى خطأ عند الاستيراد). */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!browserClient) {
    browserClient = createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!,
      {
        auth: {
          /** PKCE: رابط السحر يعيد ?code= — يجب استبداله بجلسة قبل أن يفسّر HashRouter المسار خطأً */
          flowType: 'pkce',
          detectSessionInUrl: true,
          persistSession: true,
        },
      }
    );
  }
  return browserClient;
}
