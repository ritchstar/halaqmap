import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  CircleDollarSign,
  Clock3,
  Compass,
  Globe,
  Headphones,
  HelpCircle,
  Megaphone,
  MessageCircle,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/lib';
import { getSiteOrigin } from '@/config/siteOrigin';
import {
  PARTNER_LANDING_CTA_SECTION,
  PARTNER_LANDING_EARLY_MOVER_SECTION,
  PARTNER_LANDING_HERO,
  PARTNER_LANDING_HERO_HIGHLIGHTS,
  PARTNER_LANDING_HOW_SECTION,
  PARTNER_LANDING_NARRATIVE_SECTION,
  PARTNER_LANDING_PILLARS_SECTION,
  PARTNER_LANDING_PLAN_CARDS,
  PARTNER_LANDING_PLANS_SECTION,
  PARTNER_LANDING_PROCESS_STEPS,
  PARTNER_LANDING_VALUE_PROPS,
  PARTNER_LANDING_WHY_SECTION,
} from '@/lib/partnerMarketingCopy';
import { generatePartnerSupportThreadToken } from '@/lib/partnerSupportChat';

function PartnerSupportStudioLink({
  variant = 'hero',
}: {
  variant?: 'hero' | 'footer';
}) {
  const to = useMemo(() => `${ROUTE_PATHS.PARTNER_SUPPORT}?t=${generatePartnerSupportThreadToken()}`, []);
  if (variant === 'footer') {
    return (
      <NavLink to={to}>
        <Button size="lg" variant="outline" className="w-full min-w-48 gap-2">
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

const VALUE_PROP_ICONS = [Search, Megaphone, Users, TrendingUp] as const;
const VALUE_PROPS = PARTNER_LANDING_VALUE_PROPS.map((item, index) => ({
  title: item.title,
  body: item.body,
  icon: VALUE_PROP_ICONS[index],
}));

const PROCESS_ICONS = [Rocket, Sparkles, Globe, CircleDollarSign] as const;
const PROCESS_STEPS = PARTNER_LANDING_PROCESS_STEPS.map((step, index) => ({
  title: step.title,
  body: step.body,
  icon: PROCESS_ICONS[index],
}));

const PLAN_CARDS = [...PARTNER_LANDING_PLAN_CARDS];

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
              {PARTNER_LANDING_HERO.badge}
            </div>

            <h1 className="text-balance text-4xl font-extrabold leading-tight text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.55)] md:text-6xl">
              {PARTNER_LANDING_HERO.title}
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-slate-100">{PARTNER_LANDING_HERO.lead}</p>

            <div className="flex flex-wrap items-center gap-3">
              <NavLink to={ROUTE_PATHS.PARTNER_WHY}>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/45 bg-black/30 text-white hover:bg-white/10 text-base font-semibold"
                >
                  لماذا تنضم؟
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </NavLink>
              <NavLink to={ROUTE_PATHS.PARTNER_STORY}>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/45 bg-black/30 text-white hover:bg-white/10 text-base font-semibold"
                >
                  القصة والمسار
                  <BookOpen className="h-4 w-4" />
                </Button>
              </NavLink>
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
              <PartnerSupportStudioLink />
            </div>

            <div className="grid gap-3 pt-2 text-sm md:grid-cols-3">
              {PARTNER_LANDING_HERO_HIGHLIGHTS.map((card) => (
                <div key={card.title} className="rounded-xl border border-white/20 bg-black/35 p-3 backdrop-blur">
                  <div className="mb-1 font-bold text-white">{card.title}</div>
                  <p className="leading-6 text-slate-100">{card.body}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">{PARTNER_LANDING_WHY_SECTION.title}</h2>
            <p className="mx-auto mt-3 max-w-3xl text-lg leading-8 text-muted-foreground">
              {PARTNER_LANDING_WHY_SECTION.lead}
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

      <section className="border-y border-border bg-muted/20 py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">{PARTNER_LANDING_NARRATIVE_SECTION.title}</h2>
            <p className="mx-auto mt-3 max-w-3xl text-lg leading-8 text-muted-foreground">
              {PARTNER_LANDING_NARRATIVE_SECTION.lead}
            </p>
          </div>
          <div className="space-y-6 text-lg leading-8 text-muted-foreground">
            {PARTNER_LANDING_NARRATIVE_SECTION.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">{PARTNER_LANDING_PILLARS_SECTION.title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
              {PARTNER_LANDING_PILLARS_SECTION.subtitle}
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {PARTNER_LANDING_PILLARS_SECTION.pillars.map((pillar, index) => {
              const Icon = index === 0 ? Target : index === 1 ? Compass : Sparkles;
              return (
                <motion.div
                  key={pillar.word}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-card p-6"
                >
                  <div className="mb-3 inline-flex rounded-xl bg-primary/15 p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-2xl font-extrabold text-primary">{pillar.word}</h3>
                  <p className="leading-7 text-muted-foreground">{pillar.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-card/40 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">{PARTNER_LANDING_HOW_SECTION.title}</h2>
            <p className="mx-auto mt-3 max-w-3xl text-lg leading-8 text-muted-foreground">{PARTNER_LANDING_HOW_SECTION.lead}</p>
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
        <div className="container mx-auto max-w-4xl px-4">
          <div className="rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/5 via-background to-primary/5 p-8 md:p-10">
            <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">{PARTNER_LANDING_EARLY_MOVER_SECTION.title}</h2>
            <p className="mx-auto mt-4 max-w-3xl text-center text-lg leading-8 text-muted-foreground">
              {PARTNER_LANDING_EARLY_MOVER_SECTION.lead}
            </p>
            <ul className="mx-auto mt-8 max-w-3xl space-y-4 text-muted-foreground">
              {PARTNER_LANDING_EARLY_MOVER_SECTION.bullets.map((line) => (
                <li key={line} className="flex gap-3 leading-7">
                  <Sparkles className="mt-1 h-5 w-5 shrink-0 text-accent" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <NavLink to={ROUTE_PATHS.PARTNER_WHY}>
                <Button variant="outline" size="lg" className="font-semibold">
                  اقرأ المزيد: لماذا تنضم؟
                </Button>
              </NavLink>
              <NavLink to={ROUTE_PATHS.REGISTER}>
                <Button size="lg" className="font-bold">
                  ابدأ الطلب الآن
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">{PARTNER_LANDING_PLANS_SECTION.title}</h2>
            <p className="mx-auto mt-3 max-w-3xl text-lg leading-8 text-muted-foreground">{PARTNER_LANDING_PLANS_SECTION.lead}</p>
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
                <h2 className="text-3xl font-extrabold text-foreground">{PARTNER_LANDING_CTA_SECTION.title}</h2>
                <p className="mt-3 text-lg leading-8 text-muted-foreground">{PARTNER_LANDING_CTA_SECTION.lead}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-4 w-4" />
                    {PARTNER_LANDING_CTA_SECTION.chips[0]}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    {PARTNER_LANDING_CTA_SECTION.chips[1]}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Rocket className="h-4 w-4" />
                    {PARTNER_LANDING_CTA_SECTION.chips[2]}
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
                <PartnerSupportStudioLink variant="footer" />
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
