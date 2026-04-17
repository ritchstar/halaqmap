import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  Globe,
  Megaphone,
  MessageCircle,
  QrCode,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/lib';
import { IMAGES } from '@/assets/images';
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

const FAQ_ITEMS = [
  {
    q: 'هل الصفحة مناسبة للإرسال عبر واتساب والإيميل؟',
    a: 'نعم. تم تصميمها كصفحة تحويل مباشرة برسائل تسويقية واضحة، وروابط انضمام فورية، ورمز QR لتسهيل النشر خارج المنصة.',
  },
  {
    q: 'هل يمكن توسيعها لاحقاً لحملات مناطق جديدة؟',
    a: 'بكل تأكيد. هيكل الصفحة مبني بأقسام مرنة وقوائم محتوى قابلة للتحديث السريع دون إعادة بناء التجربة من الصفر.',
  },
  {
    q: 'كيف تقنع الحلاق بسرعة الحجز؟',
    a: 'الرسالة تركّز على العائد العملي: ظهور أمام عميل قريب، تواصل مباشر، وسرعة بدء الحملة مع وضوح خطوات الانضمام.',
  },
  {
    q: 'هل أحتاج فريق تسويق داخلي لكي أستفيد؟',
    a: 'لا. الصفحة تبسّط العرض التسويقي بحيث يستطيع صاحب الصالون اتخاذ القرار فوراً والتسجيل مباشرة.',
  },
] as const;

export default function BarberGrowthLanding() {
  const siteOrigin = getSiteOrigin();
  const landingUrl = `${siteOrigin}/#${ROUTE_PATHS.BARBERS_LANDING}`;
  const registerUrl = `${siteOrigin}/#${ROUTE_PATHS.REGISTER}`;
  const whatsappText = encodeURIComponent(
    `مرحباً فريق حلاق ماب، أرغب في حجز بنر تسويقي للصالون والانضمام للحملة.\nرابط الصفحة: ${landingUrl}`
  );
  const whatsappHref = `https://wa.me/966559602685?text=${whatsappText}`;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.HALAQMAP_BARBER_BANNER_1_41}
            alt="حملة انضمام الحلاقين في حلاق ماب"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-background/40 via-background/65 to-background/92" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(212,175,55,0.18),transparent_42%)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="max-w-3xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <BadgeCheck className="h-4 w-4" />
              الخطاب الرسمي لانضمام صالونات الحلاقة إلى حلاق ماب
            </div>

            <h1 className="text-balance text-4xl font-extrabold leading-tight text-foreground md:text-6xl">
              حان وقت ظهور صالونك على منصة تتوسع بذكاء
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              إذا كنت صاحب محل حلاقة وتبحث عن قناة تسويق محترفة تعطيك وصولاً أسرع للعملاء القريبين،
              فهذه الصفحة صُممت لك: نوضح لماذا حجز البنر الآن قرار استثماري ذكي، وكيف تنضم في خطوات
              عملية، وما الفوائد المباشرة التي تجنيها من وجودك على حلاق ماب.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <NavLink to={ROUTE_PATHS.REGISTER}>
                <Button size="lg" className="gap-2 text-base font-bold">
                  احجز بنرك الآن
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </NavLink>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="gap-2 text-base font-semibold">
                  تواصل واتساب فوراً
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </a>
              <a href="mailto:admin@halaqmap.com">
                <Button size="lg" variant="outline" className="text-base font-semibold">
                  تواصل عبر الإيميل
                </Button>
              </a>
            </div>

            <div className="grid gap-3 pt-2 text-sm md:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-background/80 p-3 backdrop-blur">
                <div className="mb-1 font-bold text-foreground">قرار سريع</div>
                <p className="leading-6 text-muted-foreground">
                  الرسالة التسويقية هنا مبنية لتساعدك على الحجز بثقة خلال زيارة واحدة.
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/80 p-3 backdrop-blur">
                <div className="mb-1 font-bold text-foreground">منهجية توسع</div>
                <p className="leading-6 text-muted-foreground">
                  نبدأ من الجاهزية المحلية ثم نتوسع جغرافياً مع جودة تجربة ثابتة.
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/80 p-3 backdrop-blur">
                <div className="mb-1 font-bold text-foreground">جاهزة للنشر الخارجي</div>
                <p className="leading-6 text-muted-foreground">
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

      <section className="bg-card/40 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="rounded-3xl border border-border bg-background p-6 md:p-8">
              <h2 className="text-3xl font-bold text-foreground">مواد التسويق الخارجي الجاهزة</h2>
              <p className="mt-3 text-lg leading-8 text-muted-foreground">
                أرسل هذه الصفحة مباشرة للحلاقين عبر الواتساب والإيميلات والمنشورات التسويقية، فهي مبنية
                لتشرح القيمة وتدفع لاتخاذ قرار الانضمام سريعاً.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-2 flex items-center gap-2 text-foreground font-semibold">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    رسالة واتساب جاهزة
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    انضم الآن إلى حملة حلاق ماب واحجز بنرك التسويقي قبل موجة التوسع القادمة.
                    صفحة التفاصيل: {landingUrl}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-2 flex items-center gap-2 text-foreground font-semibold">
                    <Store className="h-4 w-4 text-primary" />
                    رابط تسجيل مباشر
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{registerUrl}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-primary/25 bg-gradient-to-b from-primary/10 to-background p-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-primary">
                <QrCode className="h-3.5 w-3.5" />
                QR للتسويق الميداني
              </div>
              <h3 className="text-xl font-bold text-foreground">امسح الكود للوصول للصفحة</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                مناسب للمنشورات المطبوعة، بنرات المعارض، وبطاقات العروض داخل المناطق التجارية.
              </p>

              <div className="mt-5 flex justify-center rounded-2xl bg-white p-4 shadow-sm">
                <QRCode value={landingUrl} size={180} />
              </div>

              <a
                href={landingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block break-all text-center text-xs text-muted-foreground underline"
              >
                {landingUrl}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">أسئلة أصحاب الصالونات المتكررة</h2>
          </div>
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-2 text-lg font-bold text-foreground">{item.q}</h3>
                <p className="leading-7 text-muted-foreground">{item.a}</p>
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
