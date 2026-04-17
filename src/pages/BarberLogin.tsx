import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, LogIn, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTE_PATHS } from '@/lib';
import { IMAGES } from '@/assets/images';
import { barberPortalLoginRemote } from '@/lib/barberPortalLoginRemote';
import { toast } from 'sonner';

export default function BarberLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await barberPortalLoginRemote({ email, password });
      if (!result.ok) {
        toast.error(result.error || 'فشل تسجيل الدخول');
        setIsLoading(false);
        return;
      }
      localStorage.setItem(
        'barberAuth',
        JSON.stringify({
          ...result.session,
          loggedIn: true,
        }),
      );
      toast.success(`مرحباً ${result.session.name}`);
      navigate(ROUTE_PATHS.BARBER_DASHBOARD);
    } catch {
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-[100dvh] min-h-screen items-center justify-center bg-background p-4 pb-[env(safe-area-inset-bottom)] pt-[max(1rem,env(safe-area-inset-top))]"
      dir="rtl"
    >
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${IMAGES.BARBER_INTERIOR_1})`,
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
        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent"
            >
              <Scissors className="h-10 w-10 text-primary-foreground" />
            </motion.div>
            <img
              src={IMAGES.HALAQMAP_LOGO_20260409_073322_83}
              alt="حلاق ماب"
              className="mx-auto mb-3 h-10 w-auto object-contain"
            />
            <h1 className="mb-2 text-2xl font-bold">لوحة تحكم حلاق ماب</h1>
            <p className="text-muted-foreground">سجّل الدخول ببريدك المسجّل لدينا ورمز الدخول الذي زوّدتك به الإدارة</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">
                البريد الإلكتروني
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="البريد المعتمد في طلب الاشتراك"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pr-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">
                رمز الدخول
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="رمز البوابة من الإدارة (ليس أي كلمة مرور)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="h-12 w-full text-lg font-semibold">
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="ml-2 h-5 w-5 rounded-full border-2 border-primary-foreground border-t-transparent"
                  />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <LogIn className="ml-2 h-5 w-5" />
                  تسجيل الدخول
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-muted/30 p-4">
            <p className="text-center text-xs text-muted-foreground">
              يتحقق الخادم من بريدك في جدول الحلاقين النشطين ومطابقة رمز الدخول مع إعداد المنصة (
              <span dir="ltr">BARBER_PORTAL_PASSWORD</span> على Vercel). لا يُقبل دخول بدون بريد مسجّل.
            </p>
          </div>

          <div className="mt-6 text-center">
            <button type="button" onClick={() => navigate(ROUTE_PATHS.HOME)} className="text-sm text-primary hover:underline">
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
