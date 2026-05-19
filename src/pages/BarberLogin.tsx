import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTE_PATHS } from '@/lib';
import { partnerSalonDisplayName } from '@/config/partnerDashboardBrand';
import { HalaqmapBrandMark } from '@/components/HalaqmapBrandMark';
import { PLATFORM_PARTNER_DASHBOARD_TAGLINE } from '@/config/platformSmartTracking';
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
        const errorMessage = 'error' in result ? result.error : 'فشل تسجيل الدخول';
        if ('code' in result && result.code === 'TIER_BRONZE_NO_DASHBOARD') {
          toast.error(errorMessage || 'الباقة البرونزية لا تشمل لوحة التحكم الإلكترونية.');
        } else {
          toast.error(errorMessage || 'فشل تسجيل الدخول');
        }
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
      toast.success(`مرحباً ${partnerSalonDisplayName(result.session)}`);
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
            <HalaqmapBrandMark className="mx-auto mb-4 h-20 w-20 rounded-[1.35rem] ring-2 ring-primary/40 ring-offset-4 ring-offset-card shadow-xl" />
            <h1 className="mb-2 text-2xl font-bold">لوحة تحكم حلاق ماب</h1>
            <p className="text-sm text-primary font-medium mb-3 leading-relaxed">{PLATFORM_PARTNER_DASHBOARD_TAGLINE}</p>
            <p className="text-muted-foreground">
              أدخل <strong>البريد المعتمد</strong> في حزمتك البرمجية. في خانة الرمز استخدم إما الرقم السري الذي زوّدك به{' '}
              <strong>فريق الدعم</strong>، أو <strong>كلمة المرور</strong> التي وصلتك على البريد بعد تفعيل حسابك.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              هذه اللوحة مخصّصة لباقتي <strong>الذهبي</strong> و<strong>الماسي</strong> فقط. إذا كنت على الباقة البرونزية يمكنك{' '}
              <Link to={ROUTE_PATHS.SUBSCRIPTION_POLICY} className="font-medium text-primary underline-offset-2 hover:underline">
                الاطلاع على الترقية
              </Link>
              .
            </p>
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
                  placeholder="البريد المعتمد في طلب الحزمة البرمجية"
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
                  placeholder="الرمز من فريق الدعم أو كلمة المرور من بريدك"
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
