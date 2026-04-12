import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Shield, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ROUTE_PATHS } from '@/lib';
import { IMAGES } from '@/assets/images';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { getAdminAllowedEmail } from '@/config/adminAuth';
import { toast } from '@/components/ui/sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const adminEmail = getAdminAllowedEmail();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const client = getSupabaseClient();
    if (!client) return;
    void client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email?.toLowerCase() === adminEmail) {
        navigate(ROUTE_PATHS.ADMIN_DASHBOARD, { replace: true });
      }
    });
  }, [adminEmail, navigate]);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      toast.error('لم يُضبط Supabase. أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في البيئة.');
      return;
    }
    const client = getSupabaseClient();
    if (!client) {
      toast.error('تعذر تهيئة عميل Supabase.');
      return;
    }

    setIsSending(true);
    const redirectTo = `${window.location.origin}/`;

    const { error } = await client.auth.signInWithOtp({
      email: adminEmail,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    setIsSending(false);

    if (error) {
      toast.error(error.message || 'تعذر إرسال الرابط. تحقق من إعدادات Auth في Supabase.');
      return;
    }

    setSent(true);
    toast.success('تم إرسال رابط الدخول إلى بريد الإدارة المعتمد.');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url(${IMAGES.DASHBOARD_BG_7})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">لوحة تحكم الإدارة</h1>
            <p className="text-muted-foreground">دخول آمن برابط يُرسل إلى البريد المعتمد فقط</p>
          </div>

          {!isSupabaseConfigured() ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
              يجب ضبط متغيرات البيئة <span dir="ltr">VITE_SUPABASE_URL</span> و{' '}
              <span dir="ltr">VITE_SUPABASE_ANON_KEY</span> (محلياً أو على Vercel) لتفعيل رابط الدخول.
            </div>
          ) : sent ? (
            <div className="space-y-4 text-center">
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed">
                <p className="font-semibold text-foreground mb-2">تحقق من صندوق الوارد</p>
                <p className="text-muted-foreground">
                  أرسلنا رابطاً لمرة واحدة إلى{' '}
                  <span className="font-mono text-foreground" dir="ltr">
                    {adminEmail}
                  </span>
                  . اضغط الرابط في البريد لفتح لوحة الإدارة.
                </p>
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={() => setSent(false)}>
                إعادة إرسال الرابط
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSendMagicLink} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base">البريد المعتمد للإدارة</Label>
                <div className="relative flex items-center gap-2 rounded-md border border-input bg-muted/40 px-3 py-3 text-sm">
                  <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
                  <span className="font-mono break-all" dir="ltr">
                    {adminEmail}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  لتغيير البريد لاحقاً، عيّن المتغير <span dir="ltr">VITE_ADMIN_EMAIL</span> في البيئة ثم أعد البناء.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSending}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                {isSending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full ml-2"
                    />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 ml-2" />
                    إرسال رابط الدخول إلى البريد
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg text-xs text-muted-foreground leading-relaxed">
            في لوحة Supabase → Authentication → URL configuration أضف عنوان الموقع (مثل{' '}
            <span dir="ltr">https://halaqmap.com</span> و <span dir="ltr">http://127.0.0.1:5173</span>) ضمن{' '}
            <strong>Redirect URLs</strong> حتى يعمل الرابط المرسل بالبريد.
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate(ROUTE_PATHS.HOME)}
              className="text-sm text-primary hover:underline"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
