import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileWarning, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib';
import { IMAGES } from '@/assets/images';
import { formatBarberMemberNumber } from '@/lib/barberMemberNumber';
import { toast } from 'sonner';

type BarberAuthLs = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  subscription?: string;
  memberNumber?: number | null;
  loggedIn?: boolean;
};

function tierLabelAr(tier: string | undefined): string {
  if (tier === SubscriptionTier.GOLD) return 'ذهبي';
  if (tier === SubscriptionTier.DIAMOND) return 'ماسي';
  if (tier === SubscriptionTier.BRONZE) return 'برونزي';
  return tier || '—';
}

export default function BarberAccountDeletionRequest() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<BarberAuthLs | null>(null);
  const [ready, setReady] = useState(false);
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('barberAuth');
      if (!raw) {
        setAuth(null);
        setReady(true);
        return;
      }
      setAuth(JSON.parse(raw) as BarberAuthLs);
    } catch {
      setAuth(null);
    } finally {
      setReady(true);
    }
  }, []);

  const tier = auth?.subscription;
  const isBronze = tier === SubscriptionTier.BRONZE;

  const mailtoHref = useMemo(() => {
    if (!auth?.id || !auth?.email || !auth?.name) return '';
    const subject = encodeURIComponent('طلب حذف حساب شريك — باقة برونزية');
    const bodyLines = [
      'السلام عليكم ورحمة الله وبركاته،',
      '',
      'أطلب حذف حسابي كشريك في منصة حلاق ماب وفق النموذج المعتمد للباقة البرونزية:',
      '',
      `— اسم الصالون: ${auth.name}`,
      `— البريد المعتمد: ${auth.email}`,
      `— رقم الهاتف: ${auth.phone || '—'}`,
      `— رقم العضوية: ${formatBarberMemberNumber(auth.memberNumber ?? null) || '—'}`,
      `— معرف الحساب: ${auth.id}`,
      `— الباقة الحالية: ${tierLabelAr(tier)}`,
      '',
      'سبب الطلب / ملاحظات:',
      reason.trim() || '—',
      '',
      'أقر بأن المعلومات أعلاه صحيحة بقدر علمي، وأطلب معالجة الطلب من الإدارة.',
      '',
      'وتفضلوا بقبول فائق الاحترام،',
    ];
    return `mailto:admin@halaqmap.com?subject=${subject}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
  }, [auth, reason, tier]);

  const openMailto = () => {
    if (!mailtoHref) {
      toast.error('تعذر تجهيز الرسالة. تأكد من تسجيل الدخول.');
      return;
    }
    if (!reason.trim()) {
      toast.error('يرجى كتابة سبب الطلب أو ملاحظة مختصرة.');
      return;
    }
    if (!confirmed) {
      toast.error('يجب تأشير الإقرار قبل إرسال الطلب.');
      return;
    }
    window.location.href = mailtoHref;
  };

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (!auth?.id || !auth.email) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12" dir="rtl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileWarning className="h-5 w-5 text-muted-foreground" />
              تسجيل الدخول مطلوب
            </CardTitle>
            <CardDescription>
              لإرسال طلب حذف الحساب للإدارة يجب تسجيل الدخول إلى لوحة تحكم الصالون أولاً.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to={ROUTE_PATHS.BARBER_LOGIN}>تسجيل الدخول</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={ROUTE_PATHS.HOME}>الرئيسية</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isBronze) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12" dir="rtl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">مسار آخر للباقة الحالية</CardTitle>
            <CardDescription>
              للباقة {tierLabelAr(tier)} يتوفر طلب حذف الحساب مباشرة من لوحة التحكم (أيقونة حذف الحساب بجانب تسجيل
              الخروج). هذا النموذج مخصص للباقة البرونزية وفق سياسة المنصة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link to={ROUTE_PATHS.BARBER_DASHBOARD}>العودة إلى لوحة التحكم</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-[100dvh] min-h-screen items-start justify-center bg-background p-4 pb-[env(safe-area-inset-bottom)] pt-[max(1.5rem,env(safe-area-inset-top))]"
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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="border-border/80 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">نموذج طلب حذف الحساب (برونزي)</CardTitle>
            <CardDescription className="leading-relaxed">
              يحق لك طلب حذف بيانات ظهورك كشريك وفق سياسة الخصوصية. عبّئ الحقول ثم أرسل الطلب إلى الإدارة عبر بريدك
              المعتمد (يفتح تطبيق البريد على جهازك).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Alert>
              <AlertDescription className="text-sm leading-relaxed">
                لا يُنفَّذ الحذف تلقائياً من هذا النموذج؛ تُعالَج الطلبات يدوياً بعد التحقق من الهوية والالتزامات.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>اسم الصالون</Label>
              <Input readOnly value={auth.name || ''} />
            </div>
            <div className="space-y-2">
              <Label>البريد المعتمد</Label>
              <Input readOnly type="email" value={auth.email} dir="ltr" className="text-left" />
            </div>
            <div className="space-y-2">
              <Label>رقم العضوية</Label>
              <Input readOnly value={formatBarberMemberNumber(auth.memberNumber ?? null) || '—'} dir="ltr" className="text-left" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="del-reason">سبب الطلب أو ملاحظات *</Label>
              <Textarea
                id="del-reason"
                rows={4}
                placeholder="مثال: إغلاق المحل، أو عدم الرغبة في الاستمرار على المنصة…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="del-confirm"
                checked={confirmed}
                onCheckedChange={(c) => setConfirmed(c === true)}
                className="mt-0.5"
              />
              <Label htmlFor="del-confirm" className="cursor-pointer text-sm font-normal leading-relaxed">
                <span className="font-semibold">أقر</span> بأن المعلومات أعلاه صحيحة بقدر علمي، وأطلب حذف حسابي من
                الإدارة، وأفهم أن المعالجة تتم بعد المراجعة.
              </Label>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button type="button" variant="destructive" onClick={openMailto} className="w-full sm:w-auto">
                تجهيز وإرسال الطلب بالبريد
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(ROUTE_PATHS.BARBER_DASHBOARD)}>
                إلغاء والعودة للوحة التحكم
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
