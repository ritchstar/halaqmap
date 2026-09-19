/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مدرسة البلوت — منتج تعليمي رقمي مستقل (199 ر.س، وصول دائم).
 * صفحة هبوط تسويقية + تسجيل حقيقي (اسم + بريد) يرسل بريد تأكيد فعلياً.
 * المرحلة ١: التسجيل وتأكيد البريد. الدفع (Moyasar الفعلي) والصفحة الخاصة
 * الدائمة مبنيان بالفعل على هذا الأساس — لا خطوة تُعرض هنا كأنها جاهزة قبل
 * أن تكون كذلك فعلياً. مدرسة قرار وتدريب شخصية، لا تطبيق بلوت جماعي: بلا
 * وعود احتراف أو فوز، وبلا مباريات عامة أو جوائز أو رهانات في هذه المرحلة.
 */
import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  BookOpen,
  Calculator,
  CheckCircle2,
  Crown,
  Gauge,
  GraduationCap,
  Infinity as InfinityIcon,
  Layers,
  ListOrdered,
  Megaphone,
  Shield,
  Sparkles,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BalootSchoolMotifBackground } from '@/components/baloot/BalootSchoolMotifBackground';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { ROUTE_PATHS } from '@/lib';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  balootSchoolRegisterErrorAr,
  submitBalootSchoolRegistrationRemote,
} from '@/lib/balootSchoolRegisterRemote';

const CURRICULUM_TRACKS = [
  {
    icon: ListOrdered,
    titleAr: 'ترتيب الورق والحكم',
    bodyAr:
      'ترتيب أوراق الحكم (٧-٨-كوز-شايب-١٠-آص-٩-جاك) وترتيب الأوراق العادية (٧-٨-٩-جاك-كوز-شايب-١٠-آص) — لماذا يختلف الترتيبان جذرياً، ولماذا الجاك والتسعة هما أقوى ورقتين في الحكم لا الآص.',
  },
  {
    icon: Calculator,
    titleAr: 'الحسبة الكاملة',
    bodyAr:
      'قيمة كل ورقة بالنقاط في الحكم مقابل العادي (١٥٢ نقطة إجمالاً في كل شوط)، ومتى تُحتسب مكافآت السرى والبلوت والكبّوت — كل رقم هنا مبني مباشرة على محرك القواعد الثابت نفسه المستخدم في ساحة اللعب، لا أرقام منفصلة قد تتعارض معه.',
  },
  {
    icon: Layers,
    titleAr: 'قرارات المزايدة',
    bodyAr:
      'متى تُعلن الحكم ومتى تُمرّر بناءً على قوة يدك الفعلية وطول البذلة، ومتى يستحق الإعلان المجازفة — أساس القرار قبل أي تكتيك أثناء اللعب.',
  },
  {
    icon: Target,
    titleAr: 'قرارات اللعب أثناء الشوط',
    bodyAr:
      'متى تقود بورقة قوية ومتى تحتفظ بها، متى تلحق بأرخص ورقة كافية بدل الإسراف، ومتى تحكم في مقابل التخلص من ورقة ضعيفة — قراءة الموقف لا الحفظ.',
  },
  {
    icon: Megaphone,
    titleAr: 'الإعلانات (السرى والبلوت)',
    bodyAr:
      'شروط سرى الثلاث والأربع والخمس فأكثر ونقاطها، وشرط بلوت (الشايب والكوز من الحكم معاً) — كيف تتعرّف عليها في يدك فوراً بدل أن تفوتك دون أن تلاحظ.',
  },
  {
    icon: Gauge,
    titleAr: 'مواقف تدريبية وأدوات مرجعية',
    bodyAr:
      'الحاسبة، النشرة المرجعية، وقاموس مصطلحات البلوت (حكم، سرى، بلوت، كبّوت، كبس) — أدوات تعود إليها أثناء اللعب الفعلي لا نظرية منفصلة عنه.',
  },
];

const TOOLS = [
  {
    icon: Calculator,
    titleAr: 'حاسبة نقاط تفاعلية',
    bodyAr:
      'اختر البذلة الحكم وشاهد ترتيب كل الأوراق ونقاطها فوراً — نفس القيم المستخدمة حرفياً في محرك ساحة بلوت المجانية بالمنصة، لا جدول منفصل قد يختلف عنه.',
  },
  {
    icon: BookOpen,
    titleAr: 'نشرة مرجعية قابلة للعودة إليها',
    bodyAr:
      'كل قاعدة ومكافأة وحدّ نقاط في صفحة واحدة منظّمة — تراجع إليها في أي وقت قبل أو أثناء اللعب.',
  },
  {
    icon: Layers,
    titleAr: 'قاموس مصطلحات البلوت',
    bodyAr:
      'شرح مباشر لكل مصطلح شائع تسمعه على الطاولة (حكم، صن، دبل، ريدبل، سرى، بلوت، كبّوت، كبس) — يُحدَّث مع كل مرحلة قادمة.',
  },
  {
    icon: Shield,
    titleAr: 'شرح، لا تعليمات فوز مضمونة',
    bodyAr:
      'كل محتوى هنا يشرح لماذا القرار صحيح إحصائياً واستراتيجياً — لا وعود باحتراف أو فوز مضمون، ولا مباريات عامة أو جوائز أو رهانات في هذه المرحلة.',
  },
];

const FAQ = [
  {
    qAr: 'هل هذه مدرسة قرار وتدريب، أم تطبيق لعب جماعي؟',
    aAr:
      'مدرسة قرار وتدريب شخصية بالكامل — تشرح القواعد والحسبة وقرارات اللعب الصحيحة. لعب البلوت الحقيقي (فريق حقيقي ٢ ضد ٢ ضد الذكاء الاصطناعي) متاح مجاناً في ساحة بلوت المنفصلة.',
  },
  {
    qAr: 'هل الاشتراك لمرة واحدة أم اشتراك شهري متكرر؟',
    aAr: 'دفعة واحدة فقط (199 ر.س) مقابل وصول دائم لصفحتك الخاصة ومحتواها — بلا رسوم متكررة.',
  },
  {
    qAr: 'متى تُفعَّل خطوة الدفع؟',
    aAr:
      'التسجيل وتأكيد البريد ثم الدفع الإلكتروني الفعلي (199 ر.س، بوابة دفع آمنة) مُفعَّلون الآن بالكامل. بعد تأكيد بريدك تنتقل مباشرة لصفحة الدفع الحقيقية، وبعد الدفع تُفتح صفحتك الخاصة الدائمة فوراً.',
  },
  {
    qAr: 'هل أرقام النقاط هنا نفسها المستخدمة في اللعب الفعلي؟',
    aAr:
      'نعم — الحاسبة والجداول هنا مبنية على نفس محرك قواعد البلوت الثابت المستخدم في ساحة اللعب المجانية بالمنصة، فلا يوجد مصدران مختلفان للأرقام.',
  },
  {
    qAr: 'هل يعد المحتوى بالفوز أو الاحتراف؟',
    aAr: 'لا — المحتوى يشرح القرار الصحيح ومنطقه، ولا يَعِد بنتيجة مضمونة. لا مباريات عامة أو جوائز أو رهانات في هذه المرحلة.',
  },
];

export default function BalootSchoolLandingPage() {
  useDocumentTitle('مدرسة البلوت — تعلّم القواعد والحسبة وقرارات اللعب | خريطة الحل');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [justRegisteredEmail, setJustRegisteredEmail] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    if (trimmedName.length < 2) {
      toast.error('أدخل اسمك الكامل.');
      return;
    }
    if (!trimmedEmail) {
      toast.error('أدخل بريدك الإلكتروني الرسمي.');
      return;
    }
    if (!agreeTerms) {
      toast.error('يجب الموافقة على المتابعة لإتمام التسجيل.');
      return;
    }
    setLoading(true);
    const result = await submitBalootSchoolRegistrationRemote({
      fullName: trimmedName,
      email: trimmedEmail,
      website: honeypot,
    });
    setLoading(false);
    if (!result.ok) {
      toast.error(balootSchoolRegisterErrorAr(result.error));
      return;
    }
    if (!result.confirmEmailSent) {
      toast.error('تعذّر إرسال رسالة التأكيد الآن — حاول مجدداً بعد قليل.');
      return;
    }
    setJustRegisteredEmail(trimmedEmail);
    toast.success(
      result.alreadyRegistered
        ? 'لديك تسجيل سابق بهذا البريد — أعدنا إرسال رسالة التأكيد.'
        : 'تم التسجيل! تحقق من بريدك لتأكيده وتفعيل حسابك.',
    );
    setFullName('');
    setEmail('');
    setAgreeTerms(false);
  };

  return (
    <div dir="rtl" className="relative min-h-screen overflow-hidden bg-background">
      <BalootSchoolMotifBackground />
      <div className="relative z-10">
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-14 md:py-20">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <div className="mb-4 flex justify-center">
                <span className="flex h-24 w-24 items-center justify-center rounded-2xl border border-primary/25 bg-black/25 text-5xl shadow-[0_8px_24px_rgba(0,0,0,0.35)] md:h-28 md:w-28">
                  ♠
                </span>
              </div>
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                <Crown className="h-4 w-4" />
                مدرسة البلوت — منتج تعليمي رقمي مستقل
              </div>
              <h1 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
                تعلّم قواعد البلوت وحسبته وقراراته، خطوة بخطوة
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                منهج واضح (ترتيب الورق، الحسبة الكاملة، المزايدة، قرارات اللعب، الإعلانات) مبني على محرك قواعد ثابت
                واحد يشاركه اللعب الفعلي، مع صفحة خاصة بك تعود إليها متى شئت —{' '}
                <strong className="text-foreground">دفعة واحدة، وصول دائم</strong>.
              </p>
              <div className="mx-auto mt-7 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-2xl border-2 border-primary bg-primary/10 px-6 py-3 text-2xl font-black text-primary">
                  199 ر.س
                  <span className="text-sm font-bold text-muted-foreground">/ دفعة واحدة</span>
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <InfinityIcon className="h-4 w-4 text-primary" /> وصول دائم — لا اشتراك متكرر
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary" /> صفحتك الخاصة تعود إليها متى شئت
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-primary" /> بلا تثبيت — من المتصفح مباشرة
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto max-w-5xl space-y-12 px-4 py-12">
          {/* منهج المدرسة */}
          <section>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-extrabold text-foreground md:text-3xl">منهج أساسي واضح، مبني على قاعدة واحدة</h2>
              <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
                ست محاور تبدأ من القواعد وتنتهي بقرارات لعب حقيقية — لا مجرد نصائح عامة متفرقة.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {CURRICULUM_TRACKS.map((track) => (
                <Card key={track.titleAr} className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <track.icon className="h-4.5 w-4.5" />
                      </span>
                      {track.titleAr}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-relaxed text-muted-foreground">{track.bodyAr}</CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* أدوات حقيقية */}
          <section>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-extrabold text-foreground md:text-3xl">أدوات مرجعية حقيقية، لا واجهات فارغة</h2>
              <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
                كل أداة في صفحتك الخاصة تعمل فعلياً — بلا محتوى تجميلي معطّل.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {TOOLS.map((tool) => (
                <Card key={tool.titleAr} className="h-full border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <tool.icon className="h-4.5 w-4.5" />
                      </span>
                      {tool.titleAr}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-relaxed text-muted-foreground">{tool.bodyAr}</CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* كيف تعمل المدرسة */}
          <section>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-extrabold text-foreground md:text-3xl">كيف تبدأ؟</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-4">
              {[
                { n: '١', t: 'سجّل باسمك وبريدك الرسمي', icon: GraduationCap },
                { n: '٢', t: 'أكّد بريدك من الرسالة التي نرسلها فوراً', icon: CheckCircle2 },
                { n: '٣', t: 'أكمل الاشتراك (199 ر.س — دفعة واحدة)', icon: Sparkles },
                { n: '٤', t: 'تصلك صفحتك الخاصة الدائمة فوراً للتعلّم والتطبيق', icon: Crown },
              ].map((step) => (
                <Card key={step.n} className="text-center">
                  <CardContent className="flex flex-col items-center gap-2 pt-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-black text-primary-foreground">
                      {step.n}
                    </span>
                    <step.icon className="h-5 w-5 text-primary" />
                    <p className="text-sm font-semibold leading-relaxed text-foreground">{step.t}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* نموذج التسجيل */}
          <section id="register">
            <Card className="border-primary/25 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  سجّل الآن — الخطوة الأولى فقط
                </CardTitle>
                <CardDescription>
                  أدخل اسمك وبريدك الإلكتروني الرسمي. سنرسل لك فوراً رسالة تأكيد حقيقية — اضغط رابطها لتفعيل حسابك.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {justRegisteredEmail ? (
                  <Alert className="mb-5 border-emerald-600/40 bg-emerald-500/10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <AlertTitle>تحقق من بريدك</AlertTitle>
                    <AlertDescription className="text-sm leading-relaxed">
                      أرسلنا رسالة تأكيد إلى <strong dir="ltr">{justRegisteredEmail}</strong>. افتح الرسالة واضغط رابط
                      التأكيد لتفعيل حسابك (صالح ٤٨ ساعة).
                    </AlertDescription>
                  </Alert>
                ) : null}

                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="baloot-school-full-name">الاسم الكامل</Label>
                      <Input
                        id="baloot-school-full-name"
                        type="text"
                        autoComplete="name"
                        placeholder="اسمك الكامل"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="baloot-school-email">البريد الإلكتروني الرسمي</Label>
                      <Input
                        id="baloot-school-email"
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
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                    <Checkbox
                      id="baloot-school-terms"
                      checked={agreeTerms}
                      onCheckedChange={(v) => setAgreeTerms(v === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="baloot-school-terms" className="cursor-pointer text-sm font-normal leading-relaxed">
                      أوافق على استخدام اسمي وبريدي لتفعيل حساب مدرسة البلوت والتواصل بخصوص خطوة الاشتراك (199 ر.س)،
                      وأقرّ بأن هذا التسجيل لا يُنشئ حساباً مفعَّلاً قبل تأكيد البريد.
                    </Label>
                  </div>

                  <div className="sr-only" aria-hidden="true">
                    <Label htmlFor="baloot-school-website">Website</Label>
                    <Input
                      id="baloot-school-website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" size="lg" disabled={loading || !agreeTerms}>
                      {loading ? 'جاري الإرسال…' : 'سجّل وأرسل رسالة التأكيد'}
                    </Button>
                    <Link to={ROUTE_PATHS.BALOOT_ARENA}>
                      <Button type="button" variant="outline" size="lg">
                        جرّب ساحة بلوت المجانية أولاً
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </section>

          {/* الأسئلة الشائعة */}
          <section>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-extrabold text-foreground md:text-3xl">أسئلة شائعة</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {FAQ.map((item) => (
                <Card key={item.qAr}>
                  <CardHeader>
                    <CardTitle className="text-base">{item.qAr}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-relaxed text-muted-foreground">{item.aAr}</CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
