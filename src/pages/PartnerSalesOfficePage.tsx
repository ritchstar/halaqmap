import { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, Mail, MapPinned, Megaphone, Phone, Sparkles, Store, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib';
import { SalesOfficeSaudiStyleChat } from '@/components/SalesOfficeSaudiStyleChat';
import { PlatformOfficialFooterStrip } from '@/components/PlatformOfficialFooterStrip';
import { AppBuildStamp } from '@/components/AppBuildStamp';
import { PARTNER_LAYOUT_FOOTER_LINE } from '@/lib/partnerMarketingCopy';

const MOMENTUM_STRIPS = [
  'المنصة لا تستهدف حيًا واحدًا، بل انتشارًا متدرجًا على جميع مناطق المملكة.',
  'كل حلاق جاهز اليوم داخل المنصة يقترب أكثر من أول موجة استخدام واسعة للمستهلك.',
  'الجاهزية المبكرة للحلاقين تعني استقبال الطلب بثبات عند اتساع الظهور للمستخدمين.',
  'كل موضع يُبنى اليوم داخل المنصة يمكن أن يتحول لاحقًا إلى أفضلية تنافسية يصعب تعويضها.',
  'القيمة ليست في الوجود الرقمي فقط، بل في الاستعداد المهني قبل دخول الطلب على نطاق أوسع.',
  'المستثمر الذكي يقرأ الجاهزية المبكرة كفرصة تموضع لا كتكلفة عابرة.',
] as const;

const INVESTMENT_CARDS = [
  {
    icon: Megaphone,
    title: 'انتشار على مستوى المملكة',
    body: 'الرؤية ليست محلية ضيقة، بل حضور ممتد من المدن الكبرى إلى بقية المناطق مع توسع الوعي والاستخدام.',
    tone: 'amber',
  },
  {
    icon: Users,
    title: 'المستخدم قادم إلى السوق الجاهز',
    body: 'تركيزنا أن يصل المستخدم إلى صالونات مجهزة داخل المنصة، لا إلى صفحات صامتة تنتظر لاحقًا.',
    tone: 'emerald',
  },
  {
    icon: Store,
    title: 'الاستعداد قبل الزحام',
    body: 'انضمام الحلاق مبكرًا يمنحه موضعًا أفضل عند تسارع الطلب وارتفاع أهمية الظهور الجغرافي.',
    tone: 'cyan',
  },
  {
    icon: TrendingUp,
    title: 'نافذة استثمار قصيرة المدى',
    body: 'خلال وقت قصير يمكن أن يتحول الوجود في المنصة من تجهيز تشغيلي إلى مكسب تسويقي مباشر.',
    tone: 'amber',
  },
  {
    icon: MapPinned,
    title: 'جاهزية الاستقبال في المدن',
    body: 'كل مدينة يدخلها الطلب تحتاج حلاقين مفعّلين، وهذا ما يجعل الجاهزية الآن ذات قيمة أعلى لاحقًا.',
    tone: 'cyan',
  },
  {
    icon: Compass,
    title: 'اتجاه واضح لا ضجيج فيه',
    body: 'المسار بسيط: تجهيز الحلاقين أولًا، ثم توسيع وصول المستخدمين، ثم التقاط الطلب عند لحظة النضج.',
    tone: 'emerald',
  },
  {
    icon: TrendingUp,
    title: 'أفضلية السبق المبكر',
    body: 'الدخول المبكر يرفع فرصة التثبيت الذهني والتموضع المهني قبل ازدحام السوق داخل المنصة.',
    tone: 'amber',
  },
  {
    icon: Store,
    title: 'وجودك داخل المنصة يصنع فرقًا',
    body: 'وجود الصالون داخل المنصة لا يبقى حضورًا شكليًا، بل يدعم الظهور والاستقبال والجاهزية أمام الطلب القادم.',
    tone: 'emerald',
  },
  {
    icon: MapPinned,
    title: 'قيمة كل موقع ترتفع',
    body: 'كلما اتسعت قاعدة المستخدمين أصبحت أفضلية الموقع والجاهزية داخل المدينة أكثر أثرًا وربحية.',
    tone: 'cyan',
  },
  {
    icon: Users,
    title: 'الدخول قبل تشكل العادة',
    body: 'حين تبدأ عادات المستخدمين بالتكوّن يكون الحاضرون مبكرًا أقرب للاستفادة من التحول من البحث إلى الطلب.',
    tone: 'amber',
  },
  {
    icon: Megaphone,
    title: 'تسويق صامت لكن فعّال',
    body: 'الظهور عند الطلب يخلق تسويقًا عمليًا لا يحتاج ضجيجًا يوميًا بقدر ما يحتاج جاهزية صحيحة ومستمرة.',
    tone: 'cyan',
  },
  {
    icon: Compass,
    title: 'قراءة ممتازة للوقت',
    body: 'التحرك في هذه المرحلة يعكس قراءة استثمارية ناضجة: تجهيز الأصل قبل أن يزداد الطلب على المساحة نفسها.',
    tone: 'emerald',
  },
] as const;

const toneClassMap = {
  amber: {
    card: 'border-amber-200 bg-[linear-gradient(155deg,rgba(251,243,219,0.95),rgba(255,255,255,0.98))] shadow-[0_18px_38px_rgba(245,158,11,0.10)]',
    icon: 'border-amber-200 bg-amber-50 text-amber-700',
    accent: 'text-amber-700',
  },
  emerald: {
    card: 'border-emerald-200 bg-[linear-gradient(155deg,rgba(236,253,245,0.95),rgba(255,255,255,0.98))] shadow-[0_18px_38px_rgba(16,185,129,0.10)]',
    icon: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    accent: 'text-emerald-700',
  },
  cyan: {
    card: 'border-cyan-200 bg-[linear-gradient(155deg,rgba(236,254,255,0.95),rgba(255,255,255,0.98))] shadow-[0_18px_38px_rgba(34,211,238,0.10)]',
    icon: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    accent: 'text-cyan-700',
  },
} as const;

export default function PartnerSalesOfficePage() {
  const topAnchorRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const prevRestoration = window.history.scrollRestoration;
    const resetScroll = () => {
      topAnchorRef.current?.scrollIntoView({ block: 'start', inline: 'nearest' });
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    window.history.scrollRestoration = 'manual';
    resetScroll();

    const raf1 = window.requestAnimationFrame(() => {
      resetScroll();
      window.requestAnimationFrame(resetScroll);
    });
    const intervalId = window.setInterval(resetScroll, 120);
    const timeout1 = window.setTimeout(resetScroll, 120);
    const timeout2 = window.setTimeout(resetScroll, 360);
    const timeout3 = window.setTimeout(() => window.clearInterval(intervalId), 1100);
    const handlePageShow = () => resetScroll();
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.cancelAnimationFrame(raf1);
      window.clearInterval(intervalId);
      window.clearTimeout(timeout1);
      window.clearTimeout(timeout2);
      window.clearTimeout(timeout3);
      window.removeEventListener('pageshow', handlePageShow);
      window.history.scrollRestoration = prevRestoration;
    };
  }, []);

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#fffdf8_0%,#f7fbff_42%,#f6faf8_100%)] text-slate-900"
    >
      <div ref={topAnchorRef} className="absolute top-0 h-px w-px" aria-hidden />
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#fffdf8_0%,#f7fbff_42%,#f6faf8_100%)]" />
        <div className="absolute right-[8%] top-[8%] h-[26rem] w-[26rem] rounded-full bg-emerald-400/10 blur-[120px]" />
        <div className="absolute left-[10%] top-[18%] h-[22rem] w-[22rem] rounded-full bg-amber-300/14 blur-[110px]" />
        <div className="absolute bottom-[8%] right-[25%] h-[18rem] w-[18rem] rounded-full bg-cyan-300/12 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.9) 1px, transparent 1px)',
            backgroundSize: '38px 38px',
          }}
        />
      </div>

      <section className="relative min-h-screen overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-5 md:px-5 md:pb-14 md:pt-7">
          <Link
            to={ROUTE_PATHS.BARBERS_LANDING}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition-colors hover:border-amber-200 hover:text-amber-800"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة لصفحة الشركاء
          </Link>
          <SalesOfficeSaudiStyleChat />

          <section className="mt-8 space-y-5 pb-10">
            <div className="flex flex-wrap gap-3">
              {MOMENTUM_STRIPS.map((strip, index) => (
                <motion.div
                  key={strip}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * index, duration: 0.35 }}
                  className="inline-flex max-w-full items-start gap-2 rounded-[1.1rem] border border-white/80 bg-white/90 px-4 py-2.5 text-sm font-semibold leading-6 text-slate-700 shadow-[0_14px_28px_rgba(148,163,184,0.10)] backdrop-blur"
                >
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span className="min-w-0 whitespace-normal break-words">{strip}</span>
                </motion.div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {INVESTMENT_CARDS.map((card, index) => {
                const tone = toneClassMap[card.tone];
                return (
                  <motion.article
                    key={card.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * index, duration: 0.4 }}
                    className={`rounded-[1.6rem] border p-5 backdrop-blur ${tone.card}`}
                  >
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${tone.icon}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <p className={`text-[0.72rem] font-black tracking-[0.18em] ${tone.accent}`}>
                      فرصة واعدة
                    </p>
                    <h2 className="mt-2 text-lg font-black text-slate-950">{card.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{card.body}</p>
                  </motion.article>
                );
              })}
            </div>

            <div className="rounded-[1.8rem] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_44px_rgba(148,163,184,0.12)] backdrop-blur md:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[0.72rem] font-black tracking-[0.18em] text-amber-700">ابدأ الآن</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">اختر مسارك وابدأ حضورك داخل المنصة</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    إذا وجدت أن هذا المسار يناسب صالونك، فهذه الروابط تنقلك مباشرة إلى التسجيل
                    أو استعراض الباقات أو التواصل مع الفريق.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to={ROUTE_PATHS.REGISTER}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-amber-500 to-amber-700 px-5 py-3 text-sm font-black text-black shadow-[0_10px_24px_rgba(245,158,11,0.18)] transition-all hover:from-amber-400"
                  >
                    انضم الآن
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                  <Link
                    to={ROUTE_PATHS.PARTNERS_BANNERS_PREVIEW}
                    className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50/90 px-5 py-3 text-sm font-bold text-cyan-800 transition-colors hover:border-cyan-300 hover:text-cyan-950"
                  >
                    مركز الباقات
                  </Link>
                  <Link
                    to={ROUTE_PATHS.PARTNER_WHY}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-5 py-3 text-sm font-bold text-emerald-800 transition-colors hover:border-emerald-300 hover:text-emerald-950"
                  >
                    لماذا تنضم؟
                  </Link>
                  <Link
                    to={ROUTE_PATHS.BARBERS_LANDING}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
                  >
                    العودة للمسار التسويقي
                  </Link>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-slate-200 pt-5 text-sm text-slate-600">
                <a href="tel:+966559602685" className="inline-flex items-center gap-2 font-medium transition-colors hover:text-amber-800">
                  <Phone className="h-4 w-4 text-amber-600" />
                  <span dir="ltr">+966559602685</span>
                </a>
                <a href="mailto:admin@halaqmap.com" className="inline-flex items-center gap-2 font-medium transition-colors hover:text-amber-800">
                  <Mail className="h-4 w-4 text-amber-600" />
                  <span>admin@halaqmap.com</span>
                </a>
                <Link to={ROUTE_PATHS.PARTNER_SUPPORT} className="font-bold text-cyan-800 transition-colors hover:text-cyan-950">
                  الدعم الفني (واتساب)
                </Link>
              </div>
            </div>
          </section>

          <footer className="border-t border-slate-200 pt-8 pb-6">
            <div className="space-y-4">
              <p className="text-center text-sm leading-relaxed text-slate-600">{PARTNER_LAYOUT_FOOTER_LINE}</p>
              <PlatformOfficialFooterStrip />
              <AppBuildStamp className="pt-1" />
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
