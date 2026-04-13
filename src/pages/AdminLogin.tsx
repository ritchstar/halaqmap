import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTE_PATHS } from '@/lib';
import { IMAGES } from '@/assets/images';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { getAdminAllowedEmail, getAdminDashboardPath } from '@/config/adminAuth';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import { toast } from '@/components/ui/sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(getAdminAllowedEmail());
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const client = getSupabaseClient();
    if (!client) return;
    void client.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user?.email) return;
      void resolveAdminAccess(session.user.email).then((access) => {
        if (access.allowed) navigate(getAdminDashboardPath(), { replace: true });
      });
    });
  }, [navigate]);

  const handlePasswordSignIn = async (e: React.FormEvent) => {
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
    if (!password.trim()) {
      toast.error('أدخل كلمة المرور.');
      return;
    }

    setSubmitting(true);
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });
    setSubmitting(false);

    if (error || !data.session?.user?.email) {
      toast.error(error?.message || 'فشل تسجيل الدخول. تحقق من البريد وكلمة المرور في Supabase Auth.');
      return;
    }

    const access = await resolveAdminAccess(data.session.user.email);
    if (!access.allowed) {
      await client.auth.signOut();
      toast.error('هذا الحساب غير مصرح له بالوصول إلى لوحة الإدارة.');
      return;
    }

    toast.success('تم تسجيل الدخول.');
    navigate(getAdminDashboardPath(), { replace: true });
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
            <p className="text-muted-foreground">دخول بكلمة مرور عبر Supabase Auth — لا يوجد رابط لهذه الصفحة في المنصة العامة</p>
          </div>

          {!isSupabaseConfigured() ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
              يجب ضبط متغيرات البيئة <span dir="ltr">VITE_SUPABASE_URL</span> و{' '}
              <span dir="ltr">VITE_SUPABASE_ANON_KEY</span> (محلياً أو على الاستضافة).
            </div>
          ) : (
            <form onSubmit={(e) => void handlePasswordSignIn(e)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="admin-email">البريد الإداري</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    dir="ltr"
                    className="pr-10 font-mono text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  أنشئ المستخدم في Supabase → Authentication → Users ثم امنحه صلاحيات من لوحة الإدارة.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                {submitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full ml-2"
                    />
                    جاري الدخول...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg text-xs text-muted-foreground leading-relaxed space-y-2">
            <p>
              مسار الدخول يُحدَّد من <span dir="ltr">VITE_ADMIN_PORTAL_BASE</span> (مثال:{' '}
              <span dir="ltr">/x7k-m9q2</span>) ثم <span dir="ltr">…/in</span> للدخول و<span dir="ltr">…/ctrl</span> للوحة؛
              لا تضع رابط الإدارة في القوائم أو التذييل.
            </p>
            <p className="text-amber-800 dark:text-amber-200">
              لا تخزّن كلمة المرور في متغيرات Vite؛ أدخلها هنا فقط. الحماية: كلمة مرور قوية + سياسات RLS في قاعدة البيانات.
            </p>
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
