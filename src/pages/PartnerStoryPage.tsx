import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, BookOpen, Layers, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/lib';
import { PARTNER_STORY_PAGE } from '@/lib/partnerMarketingCopy';
import { PlatformIdentityCard } from '@/components/PlatformIdentityCard';
import { PartnerLandingFaqAccordion } from '@/components/partner/PartnerLandingFaqAccordion';

export default function PartnerStoryPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background md:pb-20" dir="rtl">
      <section className="border-b border-border bg-gradient-to-b from-accent/10 via-background to-background py-14 md:py-18">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent-foreground">
              <Layers className="h-4 w-4" />
              {PARTNER_STORY_PAGE.heroBadge}
            </div>
            <h1 className="text-balance text-3xl font-extrabold leading-tight text-foreground md:text-5xl">
              {PARTNER_STORY_PAGE.heroTitle}
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground md:text-xl">{PARTNER_STORY_PAGE.heroLead}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <NavLink to={ROUTE_PATHS.REGISTER}>
                <Button size="lg" className="gap-2 font-bold">
                  {PARTNER_STORY_PAGE.ctaPrimary}
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </NavLink>
              <NavLink to={ROUTE_PATHS.SUBSCRIPTION_POLICY}>
                <Button size="lg" variant="outline">
                  {PARTNER_STORY_PAGE.ctaSecondary}
                </Button>
              </NavLink>
              <NavLink to={ROUTE_PATHS.PARTNER_WHY}>
                <Button size="lg" variant="secondary">
                  لماذا تنضم؟
                </Button>
              </NavLink>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto max-w-3xl px-4 pt-10">
        <PlatformIdentityCard />
      </div>

      <div className="container mx-auto max-w-3xl space-y-6 px-4 py-12">
        {PARTNER_STORY_PAGE.chapters.map((ch, index) => (
          <motion.div
            key={ch.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: index * 0.04 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                  <Sparkles className="h-5 w-5 shrink-0 text-accent" />
                  {ch.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-8 text-muted-foreground md:text-lg">{ch.body}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <div className="space-y-4 pt-2">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
            {PARTNER_STORY_PAGE.comparison.title}
          </h2>
          <p className="text-center text-muted-foreground">{PARTNER_STORY_PAGE.comparison.lead}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {PARTNER_STORY_PAGE.comparison.rows.map((row) => (
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

        <PartnerLandingFaqAccordion
          kicker={PARTNER_STORY_PAGE.faq.kicker}
          lead={PARTNER_STORY_PAGE.faq.lead}
          items={PARTNER_STORY_PAGE.faq.items}
          className="pt-4"
        />

        <Card className="border-primary/25 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-lg font-semibold leading-relaxed text-foreground md:text-xl">
              {PARTNER_STORY_PAGE.signature}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <NavLink to={ROUTE_PATHS.REGISTER}>
                <Button size="lg" className="font-bold">
                  {PARTNER_STORY_PAGE.ctaPrimary}
                </Button>
              </NavLink>
              <NavLink to={ROUTE_PATHS.SUBSCRIPTION_POLICY}>
                <Button size="lg" variant="outline">
                  {PARTNER_STORY_PAGE.ctaSecondary}
                </Button>
              </NavLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
