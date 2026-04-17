import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  Globe,
  Megaphone,
  MessageCircle,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/lib';
import { getSiteOrigin } from '@/config/siteOrigin';

const VALUE_PROPS = [
  {
    icon: Search,
    title: 'ظهورك أمام الباحث الجاهز للشراء',
    body: 'المنصة تستقبل مستخدمين يبحثون عن حلاق قريب فعلياً، وهذا يعني طلباً أقرب للتحويل مقارنة بالإعلان العام.',
  },
  {
    icon: Megaphone,
    title: 'بنر يعرض هوية محلك بوضوح',
    body: 'حجز البنر يعطي صالونك مساحة عرض قوية للهوية والخدمات والعروض مع قابلية تطوير المحتوى مع كل حملة.',
  },
  {
    icon: Users,
    title: 'قنوات تواصل مباشرة',
    body: 'المستخدم يصل لك عبر الاتصال أو الواتساب أو الخريطة بسرعة، بدون تعقيد في خطوات الوصول.',
  },
  {
    icon: TrendingUp,
    title: 'بنية نمو توسعية',
    body: 'الصفحة والحملات مصممة للتوسع الجغرافي وتوسيع عروضك الموسمية عند ارتفاع الطلب في منطقتك.',
  },
] as const;

const PROCESS_STEPS = [
  {
    title: 'أرسل طلب الانضمام',
    body: 'سجّل بيانات الصالون وحدد الباقة، ثم أرسل الطلب خلال دقائق عبر نموذج واضح ومباشر.',
    icon: Rocket,
  },
  {
    title: 'تجهيز البنر التسويقي',
    body: 'ننسّق عناصر العرض بما يناسب هوية نشاطك: اسم الصالون، العروض، نقاط القوة، وروابط التواصل.',
    icon: Sparkles,
  },
  {
    title: 'النشر والظهور على المنصة',
    body: 'بعد المراجعة، يدخل البنر في مسارات الظهور المناسبة ليبدأ استقبال طلبات التواصل من المهتمين.',
    icon: Globe,
  },
  {
    title: 'تحسين مستمر حسب الأداء',
    body: 'تحديث الرسائل والعروض موسميًا لضمان استمرار الجاذبية وزيادة فرص التواصل والحجز.',
    icon: CircleDollarSign,
  },
] as const;

const PLAN_CARDS = [
  {
    title: 'برونزية',
    subtitle: 'بداية ذكية للحضور الرقمي',
    points: ['ظهور أساسي على المنصة', 'روابط تواصل مباشرة', 'نقطة دخول مناسبة لبناء السمعة'],
  },
  {
    title: 'ذهبية',
    subtitle: 'تسويق أقوى ومجال إبراز أكبر',
    points: ['أولوية أفضل في العرض', 'بروز أوضح في النتائج', 'مرونة أعلى في إبراز العروض'],
  },
  {
    title: 'ماسية',
    subtitle: 'حضور احترافي لعلامة تتوسع',
    points: ['قوة ظهور أعلى للفروع النشطة', 'أفضل جاهزية للحملات الموسمية', 'مساحة أكبر لرسائل القيمة والجودة'],
  },
] as const;

export default function BarberGrowthLanding() {
  const siteOrigin = getSiteOrigin();
  const landingUrl = `${siteOrigin}/#${ROUTE_PATHS.BARBERS_LANDING}`;
  const partnerHeroImage = '/images/halaqmap-barber-onboarding.png';
  const whatsappText = encodeURIComponent(
    `مرحباً فريق حلاق ماب، أرغب في حجز بنر تسويقي للصالون والانضمام للحملة.\nرابط الصفحة: ${landingUrl}`
  );
  const whatsappHref = `https://wa.me/966559602685?text=${whatsappText}`;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 z-0">
          <motion.img
            src={partnerHeroImage}
            alt="حملة انضمام الحلاقين في حلاق ماب"
            className="h-full w-full object-cover"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#041322]/90 via-[#071b2f]/72 to-[#0b1522]/86" />
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(235,197,97,0.24),transparent_46%)]"
            animate={{ opacity: [0.55, 0.9, 0.55] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_16%_56%,rgba(87,199,255,0.18),transparent_42%)]"
            animate={{ opacity: [0.35, 0.65, 0.35] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="max-w-3xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/45 bg-black/35 px-4 py-2 text-sm font-semibold text-amber-100 backdrop-blur">
              <BadgeCheck className="h-4 w-4" />
              الخطاب الرسمي لانضمام صالونات الحلاقة إلى حلاق ماب
            </div>

            <h1 className="text-balance text-4xl font-extrabold leading-tight text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.55)] md:text-6xl">
              حان وقت ظهور صالونك على منصة تتوسع بذكاء
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-slate-100">
              إذا كنت صاحب محل حلاقة وتبحث عن قناة تسويق محترفة تعطيك وصولاً أسرع للعملاء القريبين،
              فهذه الصفحة صُممت لك: نوضح لماذا حجز البنر الآن قرار استثماري ذكي، وكيف تنضم في خطوات
              عملية، وما الفوائد المباشرة التي تجنيها من وجودك على حلاق ماب.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <NavLink to={ROUTE_PATHS.REGISTER}>
                <Button size="lg" className="gap-2 bg-primary text-primary-foreground shadow-[0_10px_30px_-8px_rgba(16,185,129,0.65)] text-base font-bold">
                  احجز بنرك الآن
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </NavLink>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="gap-2 border-white/45 bg-black/30 text-white hover:bg-white/10 text-base font-semibold">
                  تواصل واتساب فوراً
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </a>
              <a href="mailto:admin@halaqmap.com">
                <Button size="lg" variant="outline" className="border-white/45 bg-black/30 text-white hover:bg-white/10 text-base font-semibold">
                  تواصل عبر الإيميل
                </Button>
              </a>
            </div>

            <div className="grid gap-3 pt-2 text-sm md:grid-cols-3">
              <div className="rounded-xl border border-white/20 bg-black/35 p-3 backdrop-blur">
                <div className="mb-1 font-bold text-white">قرار سريع</div>
                <p className="leading-6 text-slate-100">
                  الرسالة التسويقية هنا مبنية لتساعدك على الحجز بثقة خلال زيارة واحدة.
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-black/35 p-3 backdrop-blur">
                <div className="mb-1 font-bold text-white">منهجية توسع</div>
                <p className="leading-6 text-slate-100">
                  نبدأ من الجاهزية المحلية ثم نتوسع جغرافياً مع جودة تجربة ثابتة.
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-black/35 p-3 backdrop-blur">
                <div className="mb-1 font-bold text-white">جاهزة للنشر الخارجي</div>
                <p className="leading-6 text-slate-100">
                  استخدم رابط الصفحة أو QR في الواتساب والبريد والمنشورات بسهولة.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">لماذا حجز البنر الآن؟</h2>
            <p className="mx-auto mt-3 max-w-3xl text-lg leading-8 text-muted-foreground">
              التسويق الذكي لا ينتظر ازدحام المنافسة. الحجز المبكر يعطيك أفضلية في بناء حضورك الرقمي
              قبل موجات التوسع القادمة.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {VALUE_PROPS.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="leading-7 text-muted-foreground">{item.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-card/40 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">كيف تنضم وتبدأ خلال وقت قصير؟</h2>
            <p className="mx-auto mt-3 max-w-3xl text-lg leading-8 text-muted-foreground">
              رحلة الانضمام مصممة لتكون سهلة وواضحة: من تعبئة الطلب إلى إطلاق بنرك في السوق المستهدف.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {PROCESS_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl border border-border bg-background p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent font-bold">
                      {index + 1}
                    </div>
                    <div className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="leading-7 text-muted-foreground">{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">خيارات باقات البنرات</h2>
            <p className="mx-auto mt-3 max-w-3xl text-lg leading-8 text-muted-foreground">
              اختر مستوى الحضور التسويقي المناسب لمرحلة صالونك الآن، ويمكنك الترقية لاحقاً مع توسع
              الطلب.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {PLAN_CARDS.map((plan) => (
              <div key={plan.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  باقة {plan.title}
                </div>
                <h3 className="mb-2 text-2xl font-bold text-foreground">{plan.subtitle}</h3>
                <ul className="space-y-2 text-muted-foreground">
                  {plan.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 leading-7">
                      <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <NavLink to={ROUTE_PATHS.REGISTER} className="mt-5 block">
                  <Button variant="outline" className="w-full">
                    اختر هذه الباقة
                  </Button>
                </NavLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl border border-border bg-gradient-to-l from-primary/10 via-background to-accent/10 p-7 md:p-10">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-foreground">ابدأ حملتك اليوم قبل ازدحام المنافسة</h2>
                <p className="mt-3 text-lg leading-8 text-muted-foreground">
                  فريق حلاق ماب جاهز لاستقبال طلبك وتفعيل أفضل صيغة عرض لصالونك حسب منطقتك ومرحلتك
                  التسويقية.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-4 w-4" />
                    خطوات واضحة وسريعة
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    رسالة تسويقية احترافية
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Rocket className="h-4 w-4" />
                    قابلية توسع للحملات المقبلة
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <NavLink to={ROUTE_PATHS.REGISTER}>
                  <Button size="lg" className="w-full min-w-48 font-bold">
                    سجل الآن كحلاق
                  </Button>
                </NavLink>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="w-full min-w-48">
                    تواصل واتساب
                  </Button>
                </a>
                <NavLink to={ROUTE_PATHS.SUBSCRIPTION_POLICY}>
                  <Button size="lg" variant="ghost" className="w-full min-w-48">
                    راجع سياسة الاشتراك
                  </Button>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
