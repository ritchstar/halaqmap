import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Bell, Mail, MapPin, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ROUTE_PATHS } from '@/lib';
import { submitBarberInterestSignup } from '@/lib/interestSignupRemote';
import { toast } from '@/components/ui/sonner';

export default function PartnerInterestLanding() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error('يرجى إدخال البريد الإلكتروني.');
      return;
    }
    if (!consent) {
      toast.error('يرجى الموافقة على متابعة التحديثات لتتمكن من الإرسال.');
      return;
    }
    setLoading(true);
    const result = await submitBarberInterestSignup({
      email: trimmed,
      consentFollowUpdates: true,
      website: honeypot,
    });
    setLoading(false);
    if (result.ok === false) {
      toast.error(result.error || 'تعذّر الإرسال. حاول لاحقاً.');
      return;
    }
    if (result.alreadyRegistered) {
      toast.success('بريدك مسجّل مسبقاً — شكراً لاهتمامك.');
    } else {
      toast.success('تم التسجيل — سنرسل لك الجديد عند توفر تحديثات رسمية.');
    }
    setEmail('');
    setConsent(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              حلاق ماب — مرحلة ما قبل الإطلاق الرسمي
            </div>
            <h1 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
              سجّل اهتمامك كحلّاق
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              هذه الصفحة لـ<strong className="text-foreground"> التوعية وتجميع البريد فقط</strong>. لا تُعدّ طلب اشتراك رسمياً
              ولا تُكمِل إجراءات التسجيل الكاملة في المنصة. عند اكتمال الإجراءات الحكومية والتشغيلية سنُبلغك
              بكل جديد عبر البريد الذي تُدخله — بشرط الموافقة الصريحة أدناه.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto max-w-3xl space-y-8 px-4 py-10">
        <Alert variant="default" className="border-amber-500/40 bg-amber-50/80 text-amber-950 dark:bg-amber-950/20 dark:text-amber-50">
          <Shield className="h-4 w-4" />
          <AlertTitle>تنبيه قانوني وتشغيلي</AlertTitle>
          <AlertDescription className="leading-relaxed">
            استقبال طلبات الاشتراك الكاملة يتطلّب اكتمال الإجراءات الرسمية للكيان (مثل السجل التجاري والربط
            البنكي وغيرها). هذه الصفحة تقتصر على <strong>جمع عنوان بريد</strong> لإرسال <strong>تحديثات إعلامية</strong>{' '}
            بعد الحصول على الموافقات اللازمة، وفق{' '}
            <NavLink to={ROUTE_PATHS.PARTNER_PRIVACY} className="font-semibold text-primary underline underline-offset-2">
              سياسة خصوصية الشركاء
            </NavLink>
            .
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                ما هي حلاق ماب؟
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              منصة ذكية تربط المستخدم بالحلّاق الأقرب لموقعه عبر الخريطة والفلترة، مع مسار واضح للشركاء
              (الباقات، لوحة التحكم، التواصل). ننمو بخطى مدروسة مع الحفاظ على الثقة والوضوح.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-primary" />
                ماذا يحدث بعد التسجيل؟
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              نخزّن بريدك بشكل آمن على الخادم (قاعدة بيانات محمية، دون إتاحة القراءة للعامة)، ونستخدمه لاحقاً
              لإرسال <strong>أخبار رسمية</strong> عن الإطلاق، الشروط، والمزايا — دون إرسال بريد دعائي عشوائي خارج
              سياق المنصة.
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/25 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              سجّل اهتمامك
            </CardTitle>
            <CardDescription>
              أدخل بريدك الإلكتروني ووافق على المتابعة. الإرسال يتم عبر اتصال مشفّر (HTTPS) إلى خادم المنصة فقط.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="interest-email">البريد الإلكتروني</Label>
                <Input
                  id="interest-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  dir="ltr"
                  className="text-left"
                />
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <Checkbox
                  id="interest-consent"
                  checked={consent}
                  onCheckedChange={(v) => setConsent(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="interest-consent" className="cursor-pointer text-sm leading-relaxed font-normal">
                  <strong className="text-foreground">أرغب في متابعة كل جديد</strong> المتعلق بحلاق ماب
                  (إطلاق رسمي، تحديثات للشركاء، وإشعارات مهمة)، وأقرّ بأنني قرأت ملخص{' '}
                  <NavLink to={ROUTE_PATHS.PARTNER_PRIVACY} className="text-primary underline underline-offset-2">
                    سياسة خصوصية الشركاء
                  </NavLink>
                  .
                </Label>
              </div>

              <div className="sr-only" aria-hidden="true">
                <Label htmlFor="interest-website">Website</Label>
                <Input
                  id="interest-website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" size="lg" disabled={loading || !consent}>
                  {loading ? 'جاري الإرسال…' : 'إرسال'}
                </Button>
                <NavLink to={ROUTE_PATHS.BARBERS_LANDING}>
                  <Button type="button" variant="outline" size="lg">
                    العودة لصفحة الشركاء
                  </Button>
                </NavLink>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
