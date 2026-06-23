import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronDown, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/lib';
import { PARTNER_WHY_PAGE } from '@/lib/partnerMarketingCopy';
import { PlatformIdentityCard } from '@/components/PlatformIdentityCard';
import { LegalObserverChat } from '@/components/LegalObserverChat';

export default function PartnerWhyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background md:pb-20" dir="rtl">
      <section className="border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-14 md:py-18">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <MapPin className="h-4 w-4" />
              {PARTNER_WHY_PAGE.heroBadge}
            </div>
            <h1 className="text-balance text-3xl font-extrabold leading-tight text-foreground md:text-5xl">
              {PARTNER_WHY_PAGE.heroTitle}
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground md:text-xl">{PARTNER_WHY_PAGE.heroLead}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <NavLink to={ROUTE_PATHS.REGISTER}>
                <Button size="lg" className="gap-2 font-bold">
                  {PARTNER_WHY_PAGE.ctaPrimary}
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </NavLink>
              <NavLink to={ROUTE_PATHS.BARBERS_LANDING}>
                <Button size="lg" variant="outline">
                  {PARTNER_WHY_PAGE.ctaSecondary}
                </Button>
              </NavLink>
              <NavLink to={ROUTE_PATHS.PARTNER_STORY}>
                <Button size="lg" variant="secondary" className="gap-2">
                  القصة والمسار
                  <BookOpen className="h-4 w-4" />
                </Button>
              </NavLink>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto max-w-3xl px-4 pt-8">
        <LegalObserverChat page="لماذا تنضم" />
      </div>

      <div className="container mx-auto max-w-3xl px-4 pt-6">
        <PlatformIdentityCard />
      </div>

      <div className="container mx-auto max-w-3xl space-y-6 px-4 py-12">
        {PARTNER_WHY_PAGE.sections.map((sec, index) => (
          <motion.div
            key={`${index}-${sec.title}`}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: index * 0.04 }}
          >
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-xl leading-snug md:text-2xl">{sec.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-8 text-muted-foreground md:text-lg">{sec.body}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <div className="space-y-4">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
            {PARTNER_WHY_PAGE.comparison.title}
          </h2>
          <p className="text-center text-muted-foreground">{PARTNER_WHY_PAGE.comparison.lead}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {PARTNER_WHY_PAGE.comparison.rows.map((row) => (
              <Card key={row.channel} className="border-primary/15">
                <CardContent className="pt-6">
                  <p className="font-bold text-foreground">{row.channel}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{row.intent}</p>
                  <p className="mt-2 text-xs font-semibold text-primary">{row.cost}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">{PARTNER_WHY_PAGE.faq.kicker}</h2>
          <p className="text-center text-muted-foreground">{PARTNER_WHY_PAGE.faq.lead}</p>
          <div className="flex flex-col gap-3">
            {PARTNER_WHY_PAGE.faq.items.map((item, i) => (
              <div key={item.q} className="overflow-hidden rounded-xl border border-border/80 bg-card">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-right text-sm font-semibold text-foreground"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {item.q}
                  <ChevronDown className={`h-4 w-4 shrink-0 text-primary transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="border-t border-border/60 px-5 py-4 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-primary/25 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-8 pb-8">
            <p className="text-center text-lg font-semibold leading-relaxed text-foreground md:text-xl">
              {PARTNER_WHY_PAGE.closingQuote}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <NavLink to={ROUTE_PATHS.REGISTER}>
                <Button size="lg" className="font-bold">
                  {PARTNER_WHY_PAGE.ctaPrimary}
                </Button>
              </NavLink>
              <NavLink to={ROUTE_PATHS.SUBSCRIPTION_POLICY}>
                <Button size="lg" variant="outline">
                  سياسة رخصة النفاذ الرقمية
                </Button>
              </NavLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
