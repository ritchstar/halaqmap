import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, BookOpen, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/lib';
import { PARTNER_WHY_PAGE } from '@/lib/partnerMarketingCopy';

export default function PartnerWhyPage() {
  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
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
                  سياسة الاشتراك
                </Button>
              </NavLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
