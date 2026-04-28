import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  Copy,
  Headphones,
  LayoutDashboard,
  MapPin,
  MapPinned,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { NavLink } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ROUTE_PATHS } from '@/lib';
import { getSiteOrigin } from '@/config/siteOrigin';
import { IMAGES } from '@/assets/images';
import {
  PARTNER_LANDING_BEFORE_AFTER,
  PARTNER_LANDING_BENEFITS_SECTION,
  PARTNER_LANDING_CTA_SECTION,
  PARTNER_LANDING_HERO,
  PARTNER_LANDING_HERO_HIGHLIGHTS,
  PARTNER_LANDING_HOW_SECTION,
  PARTNER_LANDING_PLAN_CARDS,
  PARTNER_LANDING_PLANS_SECTION,
  PARTNER_LANDING_PROCESS_STEPS,
  PARTNER_LANDING_QR_PROMO,
  PARTNER_LANDING_QUALITY_SEALS,
  PARTNER_LANDING_SOCIAL_MOMENTUM,
  PARTNER_LANDING_SOCIAL_PROOF,
  PARTNER_LANDING_TESTIMONIALS_SECTION,
  PARTNER_LANDING_WHY_SECTION,
} from '@/lib/partnerMarketingCopy';
import { generatePartnerSupportThreadToken } from '@/lib/partnerSupportChat';

function PartnerSupportStudioLink({ variant = 'hero' }: { variant?: 'hero' | 'footer' }) {
  const to = useMemo(() => `${ROUTE_PATHS.PARTNER_SUPPORT}?t=${generatePartnerSupportThreadToken()}`, []);
  if (variant === 'footer') {
    return (
      <NavLink to={to}>
        <Button size="lg" variant="outline" className="w-full min-w-48 gap-2 border-border">
          استوديو دعم الشركاء
          <Headphones className="h-4 w-4" />
        </Button>
      </NavLink>
    );
  }
  return (
    <NavLink to={to}>
      <Button
        size="lg"
        variant="outline"
        className="gap-2 border-white/45 bg-black/30 text-white hover:bg-white/10 text-base font-semibold"
      >
        استوديو دعم الشركاء
        <Headphones className="h-4 w-4" />
      </Button>
    </NavLink>
  );
}

const BENEFIT_ICONS = [MapPin, Building2, Star, Wallet, TrendingUp] as const;
const STEP_ICONS = [ClipboardList, Shield, MapPinned, LayoutDashboard] as const;
const MOMENTUM_ICONS = [CalendarDays, Clock3, Activity] as const;
/** صور رمزية للشهادات (توضيحية — ليست صور عملاء حقيقيين) */
const TESTIMONIAL_PORTRAITS = [IMAGES.BARBER_WORK_2, IMAGES.BARBER_WORK_6, IMAGES.BARBER_WORK_8] as const;
/** صور مصغّرة بجانب أختام الجودة */
const SEAL_MICRO_IMAGES = [IMAGES.BARBER_TOOLS_3, IMAGES.BARBER_INTERIOR_2, IMAGES.BARBER_CHAIR_5] as const;

const sectionReveal = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const heroCardItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const QR_BLUE = '#003893';
const QR_RED = '#C8102E';
const QR_BG = '#EFF4FB';

export default function BarberGrowthLanding() {
  const siteOrigin = getSiteOrigin();
  const landingUrl = `${siteOrigin}/#${ROUTE_PATHS.BARBERS_LANDING}`;
  const [copied, setCopied] = useState(false);
  const copyLandingUrl = useCallback(() => {
    void navigator.clipboard.writeText(landingUrl).then(
      () => {
        setCopied(true);
        toast.success('تم نسخ رابط مسار الشركاء');
        window.setTimeout(() => setCopied(false), 2200);
      },
      () => toast.error('تعذّر النسخ من المتصفح')
    );
  }, [landingUrl]);
  const partnerHeroImage = '/images/halaqmap-barber-onboarding.png';
  const whatsappText = encodeURIComponent(
    `مرحباً فريق حلاق ماب، أبغى أفعل ظهور صالوني على الخريطة.\nرابط الصفحة: ${landingUrl}`
  );
  const whatsappHref = `https://wa.me/966559602685?text=${whatsappText}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 z-0">
          <motion.img
            src={partnerHeroImage}
            alt="صالون حلاق — حلاق ماب"
            className="h-full w-full object-cover"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#041322]/92 via-[#071b2f]/78 to-[#0b1522]/88" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(16,185,129,0.2),transparent_45%)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mx-auto max-w-3xl space-y-6 text-center md:text-right"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-black/40 px-4 py-2 text-sm font-semibold text-emerald-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              {PARTNER_LANDING_HERO.badge}
            </div>
            <h1 className="text-balance text-4xl font-extrabold leading-tight text-white drop-shadow-md md:text-5xl lg:text-6xl">
              {PARTNER_LANDING_HERO.title}
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-100 md:mx-0">{PARTNER_LANDING_HERO.lead}</p>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
              <NavLink to={ROUTE_PATHS.REGISTER}>
                <Button
                  size="lg"
                  className="w-full gap-2 bg-primary text-primary-foreground shadow-lg text-base font-bold sm:w-auto"
                >
                  {PARTNER_LANDING_CTA_SECTION.primaryCta}
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </NavLink>
              <NavLink to={ROUTE_PATHS.REGISTER}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full border border-white/25 bg-white/95 text-foreground font-bold shadow-md hover:bg-white sm:w-auto"
                >
                  {PARTNER_LANDING_CTA_SECTION.secondaryCta}
                </Button>
              </NavLink>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 border-white/45 bg-black/35 text-white hover:bg-white/10 sm:w-auto"
                >
                  واتساب مباشر
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </a>
              <PartnerSupportStudioLink />
            </div>
            <motion.div
              className="grid gap-3 pt-4 sm:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {PARTNER_LANDING_HERO_HIGHLIGHTS.map((card) => (
                <motion.div
                  key={card.title}
                  variants={heroCardItem}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="rounded-xl border border-white/20 bg-black/40 p-4 text-right backdrop-blur"
                >
                  <div className="mb-1 font-bold text-white">{card.title}</div>
                  <p className="text-sm leading-6 text-slate-100">{card.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* QR — أبيض / أحمر / أزرق (شعبي) */}
      <section
        className="relative border-y-4 border-[#C8102E] py-10 md:py-12"
        style={{ backgroundColor: QR_BG }}
        aria-labelledby="partner-qr-heading"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: QR_BLUE }} />
        <div className="container relative mx-auto px-4">
          <motion.div
            className="mx-auto max-w-5xl overflow-hidden rounded-2xl border-[3px] bg-white shadow-xl"
            style={{ borderColor: QR_BLUE }}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${QR_RED} 0%, ${QR_BLUE} 100%)` }} />
            <div className="flex flex-col-reverse items-center gap-8 p-6 md:flex-row md:flex-row-reverse md:items-center md:justify-between md:gap-10 md:p-9">
              <div className="w-full max-w-lg flex-1 space-y-4 text-right">
                <p className="text-xs font-bold tracking-wide" style={{ color: QR_RED }}>
                  {PARTNER_LANDING_QR_PROMO.kicker}
                </p>
                <h2
                  id="partner-qr-heading"
                  className="text-2xl font-black leading-snug md:text-3xl"
                  style={{ color: QR_BLUE }}
                >
                  {PARTNER_LANDING_QR_PROMO.title}
                </h2>
                <ol className="list-none space-y-3">
                  {PARTNER_LANDING_QR_PROMO.steps.map((line, i) => (
                    <li key={line} className="flex items-start justify-end gap-3 text-sm leading-relaxed text-slate-800 md:text-base">
                      <span>{line}</span>
                      <span
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: QR_BLUE }}
                      >
                        {i + 1}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="text-xs text-slate-600">{PARTNER_LANDING_QR_PROMO.hint}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 border-2 font-semibold"
                  style={{ borderColor: QR_RED, color: QR_RED }}
                  onClick={copyLandingUrl}
                >
                  <Copy className="h-4 w-4" />
                  {copied ? 'تم النسخ' : 'نسخ الرابط'}
                </Button>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-3 rounded-xl border-2 border-[#C8102E]/35 bg-white p-4 shadow-inner">
                <div className="rounded-lg bg-white p-2 ring-2 ring-[#003893]/35 ring-offset-2 ring-offset-white">
                  <QRCode
                    value={landingUrl}
                    size={176}
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    fgColor={QR_BLUE}
                    bgColor="#ffffff"
                    level="M"
                  />
                </div>
                <p className="max-w-[14rem] break-all text-center text-[10px] leading-tight text-slate-500" dir="ltr">
                  {landingUrl}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social proof + زخم زمني + seals */}
      <motion.section
        className="border-b border-border bg-gradient-to-b from-primary/8 to-background py-10"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        variants={sectionReveal}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
            <div className="text-center md:text-right">
              <div className="inline-flex items-center gap-2">
                <motion.span
                  className="relative flex h-2.5 w-2.5"
                  animate={{ scale: [1, 1.25, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </motion.span>
                <span className="text-xs font-medium text-primary">نشاط حيّ</span>
              </div>
              <motion.p
                className="mt-2 text-3xl font-black text-primary md:text-4xl"
                initial={{ opacity: 0.85 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {PARTNER_LANDING_SOCIAL_PROOF.statHeadline}
              </motion.p>
              <p className="mt-2 max-w-xl text-muted-foreground">{PARTNER_LANDING_SOCIAL_PROOF.statDetail}</p>
              <p className="mt-1 text-xs text-muted-foreground/80">{PARTNER_LANDING_SOCIAL_PROOF.note}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:justify-end">
              {PARTNER_LANDING_QUALITY_SEALS.map((s, i) => (
                <motion.span
                  key={s.title}
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card py-1.5 ps-1.5 pe-4 text-sm font-semibold text-foreground shadow-sm"
                >
                  <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
                    <img src={SEAL_MICRO_IMAGES[i]} alt="" className="h-full w-full object-cover" />
                  </span>
                  <Shield className="h-4 w-4 text-primary" />
                  {s.title}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-primary/15 bg-card/60 p-5 shadow-sm backdrop-blur-sm md:p-6">
            <p className="text-center text-sm font-bold text-foreground md:text-right">
              {PARTNER_LANDING_SOCIAL_PROOF.momentumTitle}
            </p>
            <p className="mt-1 text-center text-xs text-muted-foreground md:text-right">
              {PARTNER_LANDING_SOCIAL_PROOF.momentumLead}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {PARTNER_LANDING_SOCIAL_MOMENTUM.map((m, i) => {
                const Icon = MOMENTUM_ICONS[i] ?? Sparkles;
                return (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.35 }}
                    whileHover={{ y: -2 }}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border/80 bg-background/80 p-4 text-center md:items-end md:text-right"
                  >
                    <div className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-bold text-foreground">{m.label}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{m.body}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* لماذا حلاق ماب */}
      <section id="why" className="py-14 md:py-18">
        <div className="container mx-auto max-w-3xl px-4 text-center md:text-right">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">{PARTNER_LANDING_WHY_SECTION.title}</h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">{PARTNER_LANDING_WHY_SECTION.lead}</p>
        </div>
      </section>

      {/* ماذا تستفيد */}
      <section id="benefits" className="border-y border-border bg-muted/25 py-14 md:py-18">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center md:text-right">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">{PARTNER_LANDING_BENEFITS_SECTION.title}</h2>
            <p className="mt-3 text-lg text-muted-foreground">{PARTNER_LANDING_BENEFITS_SECTION.lead}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PARTNER_LANDING_BENEFITS_SECTION.items.map((item, index) => {
              const Icon = BENEFIT_ICONS[index] ?? Sparkles;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                >
                  <Card className="h-full border-primary/15 shadow-sm transition-shadow duration-200 hover:-translate-y-1 hover:shadow-md">
                    <CardContent className="flex flex-col gap-3 p-5 text-right">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                      <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* قبل / بعد */}
      <motion.section
        className="py-14 md:py-18"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        variants={sectionReveal}
      >
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center md:text-right">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">{PARTNER_LANDING_BEFORE_AFTER.title}</h2>
            <p className="mt-3 text-lg text-muted-foreground">{PARTNER_LANDING_BEFORE_AFTER.subtitle}</p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <Card className="border-destructive/20 bg-destructive/[0.03]">
              <CardContent className="space-y-4 p-6 text-right">
                <div className="flex items-center justify-end gap-2 text-destructive">
                  <h3 className="text-xl font-bold">{PARTNER_LANDING_BEFORE_AFTER.before.label}</h3>
                  <X className="h-6 w-6 shrink-0" />
                </div>
                <ul className="space-y-3">
                  {PARTNER_LANDING_BEFORE_AFTER.before.bullets.map((line) => (
                    <li key={line} className="flex items-start justify-end gap-2 text-muted-foreground">
                      <span className="leading-7">{line}</span>
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <Card className="border-primary/30 bg-primary/[0.04]">
              <CardContent className="space-y-4 p-6 text-right">
                <div className="flex items-center justify-end gap-2 text-primary">
                  <h3 className="text-xl font-bold">{PARTNER_LANDING_BEFORE_AFTER.after.label}</h3>
                  <Check className="h-6 w-6 shrink-0" />
                </div>
                <ul className="space-y-3">
                  {PARTNER_LANDING_BEFORE_AFTER.after.bullets.map((line) => (
                    <li key={line} className="flex items-start justify-end gap-2 text-muted-foreground">
                      <span className="leading-7">{line}</span>
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* خريطة + صور صالونات */}
      <section className="border-y border-border bg-muted/20 py-14 md:py-18">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="order-2 text-center lg:order-1 lg:text-right">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                <MapPin className="h-4 w-4" />
                خريطة الحي
              </div>
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">ظهورك حيث يبحث الزبون</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                الزبون ما يدور في كتالوج طويل — يدور على خريطة: وين الصالون؟ قد إيش يبعد؟ كيف أوصله؟ حلاق ماب تجمع
                هالأسئلة في شاشة واحدة.
              </p>
              <ul className="mt-5 space-y-2 text-right text-sm text-muted-foreground">
                <li className="flex items-center justify-end gap-2">
                  <span>بحث بالموقع والحي</span>
                  <Users className="h-4 w-4 text-primary" />
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>مسافة واضحة قبل ما يتحرك</span>
                  <MapPinned className="h-4 w-4 text-primary" />
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-accent/10 p-1 shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-[#0a1628]">
                  <motion.img
                    src={IMAGES.SCREENSHOT4144_49}
                    alt="لقطة من تطبيق حلاق ماب — خريطة وصالونات"
                    className="h-full w-full object-cover object-top opacity-95"
                    initial={{ scale: 1.04 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061223]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 right-4 left-4 flex flex-wrap items-center justify-end gap-2">
                    <span className="rounded-lg bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                      صالونات قريبة منك
                    </span>
                    <span className="rounded-lg bg-emerald-600/90 px-3 py-1.5 text-xs font-bold text-white">
                      حيّك على الخريطة
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3">
            {[IMAGES.BARBER_INTERIOR_1, IMAGES.BARBER_SHOP_3, IMAGES.BARBER_WORK_4].map((src, idx) => (
              <motion.img
                key={src}
                src={src}
                alt={idx === 0 ? 'داخل صالون' : idx === 1 ? 'صالون حلاقة' : 'حلاق يقدّم الخدمة'}
                className={`h-40 w-full rounded-2xl object-cover shadow-md transition-shadow duration-300 hover:shadow-lg md:h-48 ${idx === 2 ? 'col-span-2 md:col-span-1' : ''}`}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* كيف يعمل */}
      <section className="py-14 md:py-18">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center md:text-right">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">{PARTNER_LANDING_HOW_SECTION.title}</h2>
            <p className="mt-3 text-lg text-muted-foreground">{PARTNER_LANDING_HOW_SECTION.lead}</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {PARTNER_LANDING_PROCESS_STEPS.map((step, index) => {
              const Icon = STEP_ICONS[index] ?? Sparkles;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -3, boxShadow: '0 12px 28px -8px rgba(0,0,0,0.12)' }}
                  className="rounded-2xl border border-border bg-card p-6 text-right shadow-sm transition-shadow"
                >
                  <div className="mb-4 flex items-center justify-end gap-3">
                    <div className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/25 text-sm font-bold text-accent-foreground">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="leading-7 text-muted-foreground">{step.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* آراء الحلاقين + صور رمزية */}
      <motion.section
        className="border-y border-border bg-muted/15 py-14 md:py-18"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-50px' }}
        variants={sectionReveal}
      >
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center md:text-right">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">{PARTNER_LANDING_TESTIMONIALS_SECTION.title}</h2>
            <p className="mt-3 text-lg text-muted-foreground">{PARTNER_LANDING_TESTIMONIALS_SECTION.lead}</p>
            <p className="mt-2 text-xs text-muted-foreground/80">الصور بجانب الاقتباسات رمزية للتوضيح — ليست صور عملاء حقيقيين.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {PARTNER_LANDING_TESTIMONIALS_SECTION.stories.map((story, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full border-primary/10 shadow-sm transition-shadow duration-300 hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-4 p-6 text-right">
                    <div className="flex items-start justify-end gap-4">
                      <div className="min-w-0 flex-1 space-y-3">
                        <p className="text-base font-medium leading-7 text-foreground">&ldquo;{story.quote}&rdquo;</p>
                        <p className="text-xs text-muted-foreground">{story.attribution}</p>
                      </div>
                      <Avatar className="h-14 w-14 shrink-0 ring-2 ring-primary/25 ring-offset-2 ring-offset-background">
                        <AvatarImage src={TESTIMONIAL_PORTRAITS[i]} alt="" className="object-cover" />
                        <AvatarFallback className="bg-primary/15 text-lg font-bold text-primary">
                          {story.initial}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-end">
            {PARTNER_LANDING_QUALITY_SEALS.map((s, i) => (
              <motion.div
                key={s.title}
                whileHover={{ scale: 1.02 }}
                className="flex max-w-xs items-start gap-3 rounded-xl border border-border bg-background/80 p-4 text-right text-sm shadow-sm"
              >
                <span className="relative mt-0.5 h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/15">
                  <img src={SEAL_MICRO_IMAGES[i]} alt="" className="h-full w-full object-cover" />
                </span>
                <div>
                  <p className="font-bold text-foreground">{s.title}</p>
                  <p className="mt-1 text-muted-foreground">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* الباقات */}
      <section className="py-14 md:py-18">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center md:text-right">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">{PARTNER_LANDING_PLANS_SECTION.title}</h2>
            <p className="mt-3 text-lg text-muted-foreground">{PARTNER_LANDING_PLANS_SECTION.lead}</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {PARTNER_LANDING_PLAN_CARDS.map((plan) => (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
              <Card className="flex h-full flex-col border-primary/10 text-right shadow-sm transition-shadow duration-300 hover:shadow-lg">
                <CardContent className="flex flex-1 flex-col p-6">
                  <div className="mb-3 inline-flex self-end rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    باقة {plan.title}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{plan.subtitle}</h3>
                  <ul className="mt-4 flex-1 space-y-2 text-muted-foreground">
                    {plan.points.map((point) => (
                      <li key={point} className="flex items-start justify-end gap-2 leading-7">
                        <span>{point}</span>
                        <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                      </li>
                    ))}
                  </ul>
                  <NavLink to={ROUTE_PATHS.REGISTER} className="mt-6 block">
                    <Button variant="outline" className="w-full font-semibold">
                      أبغى هالباقة
                    </Button>
                  </NavLink>
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ابدأ الآن — CTA */}
      <section id="start" className="pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-background to-accent/10 p-8 shadow-lg md:p-12"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-3xl border border-primary/0"
              animate={{
                borderColor: ['rgba(16,185,129,0)', 'rgba(16,185,129,0.35)', 'rgba(16,185,129,0)'],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative z-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div className="text-center md:text-right">
                <h2 className="text-3xl font-extrabold text-foreground md:text-4xl">{PARTNER_LANDING_CTA_SECTION.title}</h2>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">{PARTNER_LANDING_CTA_SECTION.lead}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground md:justify-end">
                  {PARTNER_LANDING_CTA_SECTION.chips.map((chip) => (
                    <span key={chip} className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-3 py-1">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex w-full max-w-sm flex-col gap-3 mx-auto md:mx-0">
                <NavLink to={ROUTE_PATHS.REGISTER}>
                  <Button size="lg" className="w-full font-bold shadow-md">
                    {PARTNER_LANDING_CTA_SECTION.primaryCta}
                  </Button>
                </NavLink>
                <NavLink to={ROUTE_PATHS.REGISTER}>
                  <Button size="lg" variant="secondary" className="w-full font-bold">
                    {PARTNER_LANDING_CTA_SECTION.secondaryCta}
                  </Button>
                </NavLink>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="w-full">
                    واتساب فريق حلاق ماب
                  </Button>
                </a>
                <PartnerSupportStudioLink variant="footer" />
                <NavLink to={ROUTE_PATHS.PARTNER_WHY}>
                  <Button size="lg" variant="ghost" className="w-full text-muted-foreground">
                    تبي تفاصيل أكثر؟ لماذا تنضم
                  </Button>
                </NavLink>
                <NavLink to={ROUTE_PATHS.SUBSCRIPTION_POLICY}>
                  <Button size="lg" variant="link" className="w-full text-primary">
                    سياسة الاشتراك
                  </Button>
                </NavLink>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
