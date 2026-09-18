/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مدرسة الشطرنج الاحترافية — منتج تعليمي رقمي مستقل (175 ر.س، وصول دائم).
 * صفحة هبوط تسويقية + تسجيل حقيقي (اسم + بريد) يرسل بريد تأكيد فعلياً.
 * المرحلة ١ فقط: التسجيل وتأكيد البريد. الدفع (Moyasar الفعلي) والصفحة
 * الخاصة الدائمة تُبنيان في المرحلتين التاليتين على هذا الأساس — لا خطوة
 * لاحقة تُعرض هنا كأنها جاهزة قبل أن تكون كذلك فعلياً.
 */
import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  BookOpen,
  Brain,
  CheckCircle2,
  Compass,
  Crown,
  Gauge,
  GraduationCap,
  Infinity as InfinityIcon,
  Lightbulb,
  Puzzle,
  Repeat,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { ROUTE_PATHS } from '@/lib';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  chessSchoolRegisterErrorAr,
  submitChessSchoolRegistrationRemote,
} from '@/lib/chessSchoolRegisterRemote';

const CURRICULUM_TRACKS = [
  {
    icon: Compass,
    titleAr: 'الافتتاحيات ومبادئها',
    bodyAr:
      'السيطرة على المركز، تطوير القطع بأسرع طريقة آمنة، تأمين الملك بالتبييت في الوقت الصحيح، وتجنّب أخطاء الافتتاح الشائعة — مبنية على المبدأ لا على الحفظ الأعمى، لتصمد أمام أي رد فعل من الخصم.',
  },
  {
    icon: Puzzle,
    titleAr: 'التكتيك ودوافعه',
    bodyAr:
      'التثبيت (Pin)، الشوكة (Fork)، التعرية (Skewer)، الهجوم المكشوف (Discovered Attack)، التضحية الاستدراجية (Deflection/Decoy)، والتضييق (Zwischenzug) — تمارين متدرجة الصعوبة لبناء «عين تكتيكية» تلتقط الفرص تلقائياً أثناء اللعب.',
  },
  {
    icon: Target,
    titleAr: 'الاستراتيجية وبنية البيدق',
    bodyAr:
      'تقييم المراكز بعيداً عن الحسابات المباشرة: البيدق المعزول والمضاعف والمتراجع، الأحجار الضعيفة، الفيل الجيد مقابل الفيل السيئ، فتح الأعمدة لصالح القلاع، وتحويل الأفضلية الصغيرة إلى فوز واضح.',
  },
  {
    icon: Trophy,
    titleAr: 'النهايات الحاسمة',
    bodyAr:
      'نهايات الملك والبيدق (بما فيها قاعدة المربع وحق التقدم/Opposition)، نهايات القلعة الأساسية (وضعية لوسيك)، وتحويل التقدم المادي البسيط إلى نقطة كاملة — أكثر جزء مُهمَل في تعلّم معظم اللاعبين، وأكثرها تأثيراً على النتيجة.',
  },
  {
    icon: Brain,
    titleAr: 'الحساب والتصوّر الذهني',
    bodyAr:
      'منهجية حساب المتغيرات (Candidate Moves) بدل التخمين، التحقق من الفروض قبل التنفيذ، وتفادي «الرؤية النفقية» تحت ضغط الوقت — المهارة التي تفصل بين اللاعب الجيد واللاعب القوي.',
  },
  {
    icon: Gauge,
    titleAr: 'إدارة الوقت والنفسية أثناء اللعب',
    bodyAr:
      'متى تفكّر طويلاً ومتى تُسرع، كيف تتعافى بعد خطأ بدل الانهيار، وكيف تلعب موقفاً غير مألوف بثقة بدل التسرّع — مهارات عملية تُطبَّق مباشرة في اللعب الحقيقي، لا نظرية مجردة.',
  },
];

const TOOLS = [
  {
    icon: Swords,
    titleAr: 'تدريب حقيقي ضد محرك Stockfish',
    bodyAr:
      'نفس محرك الشطرنج العالمي المستخدم في ساحة اللعب المجانية بالمنصة — بمستويات تحدٍّ حقيقية تتصاعد معك، لا خصماً وهمياً يخسر عمداً.',
  },
  {
    icon: Lightbulb,
    titleAr: 'تلميحات وتراجع أثناء التدريب',
    bodyAr:
      'اطلب رأي المحرك في أي موقف لتتعلّم لماذا هذه النقلة أفضل، وتراجع لتجرّب بديلاً آخر — التعلّم من المحاولة، لا الحفظ.',
  },
  {
    icon: Repeat,
    titleAr: 'مراجعة النقلات خطوة بخطوة',
    bodyAr:
      'أعد بناء أي لحظة من مبارياتك ولحظات تدريبك لترى أين كانت نقطة التحوّل فعلياً — أداة مراجعة حقيقية، لا مجرد سجل نصي.',
  },
  {
    icon: BookOpen,
    titleAr: 'محتوى نصي احترافي لكل موضوع',
    bodyAr:
      'شرح مكتوب بعناية لكل فكرة تكتيكية واستراتيجية ونهاية — بأمثلة توضيحية ونقاط قابلة للتطبيق فوراً على الرقعة، لا فقرات عامة.',
  },
];

const FAQ = [
  {
    qAr: 'هل الاشتراك لمرة واحدة أم اشتراك شهري متكرر؟',
    aAr: 'دفعة واحدة فقط (175 ر.س) مقابل وصول دائم لصفحتك الخاصة ومحتواها — بلا رسوم متكررة.',
  },
  {
    qAr: 'متى تُفعَّل خطوة الدفع؟',
    aAr:
      'التسجيل وتأكيد البريد مُفعَّلان الآن بالكامل. خطوة الدفع الإلكتروني الفعلي قيد التفعيل حالياً — بعد تأكيد بريدك سنرسل لك رابطها على نفس البريد فور جاهزيتها خلال أيام قليلة، دون أي إجراء إضافي منك.',
  },
  {
    qAr: 'هل هذا مناسب للمبتدئين تماماً أم يحتاج خبرة سابقة؟',
    aAr:
      'المنهج يبدأ من المبادئ الصحيحة ويتصاعد إلى مستوى احترافي جاد؛ يناسب من يعرف حركة القطع ويريد بناء أساس متين، وكذلك من يملك خبرة ويريد تنظيم معرفته ورفع مستواه بجدية.',
  },
  {
    qAr: 'هل أحتاج تثبيت أي برنامج؟',
    aAr: 'لا — كل شيء يعمل من المتصفح مباشرة، على الجوال أو الحاسوب، بلا تثبيت.',
  },
];

export default function ChessSchoolLandingPage() {
  useDocumentTitle('مدرسة الشطرنج الاحترافية — تعلّم بجدية، والعب بثقة | خريطة الحل');

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
    const result = await submitChessSchoolRegistrationRemote({
      fullName: trimmedName,
      email: trimmedEmail,
      website: honeypot,
    });
    setLoading(false);
    if (!result.ok) {
      toast.error(chessSchoolRegisterErrorAr(result.error));
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
    <div dir="rtl" className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-14 md:py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <Crown className="h-4 w-4" />
              مدرسة الشطرنج الاحترافية — منتج تعليمي رقمي مستقل
            </div>
            <h1 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
              تعلّم الشطرنج باحترافية حقيقية، خطوة بخطوة
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              منهج تعليمي متكامل (افتتاحيات، تكتيك، استراتيجية، نهايات، حساب، وإدارة وقت) مع تدريب حقيقي ضد محرك
              Stockfish، وصفحة خاصة بك تعود إليها متى شئت — <strong className="text-foreground">دفعة واحدة، وصول دائم</strong>.
            </p>
            <div className="mx-auto mt-7 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-2xl border-2 border-primary bg-primary/10 px-6 py-3 text-2xl font-black text-primary">
                175 ر.س
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
            <h2 className="text-2xl font-extrabold text-foreground md:text-3xl">منهج شامل بمستوى احترافي</h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              ست محاور تغطي ما يحتاجه أي لاعب جاد فعلاً — لا مجرد نصائح عامة متفرقة.
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
            <h2 className="text-2xl font-extrabold text-foreground md:text-3xl">أدوات تدريب حقيقية، لا واجهات فارغة</h2>
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
              { n: '٣', t: 'أكمل الاشتراك (175 ر.س — دفعة واحدة)', icon: Sparkles },
              { n: '٤', t: 'تصلك صفحتك الخاصة الدائمة للتعلّم والتطبيق', icon: Crown },
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
                    <Label htmlFor="school-full-name">الاسم الكامل</Label>
                    <Input
                      id="school-full-name"
                      type="text"
                      autoComplete="name"
                      placeholder="اسمك الكامل"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school-email">البريد الإلكتروني الرسمي</Label>
                    <Input
                      id="school-email"
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
                    id="school-terms"
                    checked={agreeTerms}
                    onCheckedChange={(v) => setAgreeTerms(v === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="school-terms" className="cursor-pointer text-sm font-normal leading-relaxed">
                    أوافق على استخدام اسمي وبريدي لتفعيل حساب مدرسة الشطرنج الاحترافية والتواصل بخصوص خطوة
                    الاشتراك (175 ر.س)، وأقرّ بأن هذا التسجيل لا يُنشئ حساباً مفعَّلاً قبل تأكيد البريد.
                  </Label>
                </div>

                <div className="sr-only" aria-hidden="true">
                  <Label htmlFor="school-website">Website</Label>
                  <Input
                    id="school-website"
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
                  <Link to={ROUTE_PATHS.CHESS_ARENA}>
                    <Button type="button" variant="outline" size="lg">
                      جرّب ساحة الشطرنج المجانية أولاً
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
  );
}
