import { motion } from 'framer-motion';
import { FileText, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  PLATFORM_DIGITAL_PRODUCT_INTRO_BADGE,
  PLATFORM_DIGITAL_PRODUCT_INTRO_PARAGRAPHS,
  PLATFORM_DIGITAL_PRODUCT_INTRO_TITLE,
} from '@/config/platformGrowthNarrative';

/**
 * القسم التعريفي بالمنتج الرقمي — الصفحة الرئيسية (Landing).
 * مرجع مختصر للامتثال التجاري ونموذج B2C/B2B.
 */
export function PlatformDigitalProductIntroSection() {
  return (
    <section
      className="container mx-auto px-3 sm:px-4 -mt-2 pb-4 sm:pb-8"
      aria-labelledby="platform-digital-product-intro-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="max-w-4xl mx-auto rounded-2xl border border-emerald-600/20 bg-gradient-to-br from-emerald-500/[0.07] via-background to-amber-500/[0.05] p-6 sm:p-8 shadow-sm ring-1 ring-amber-500/10"
      >
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 mb-4">
          <Badge className="gap-1.5 border-0 bg-gradient-to-r from-emerald-700 to-emerald-600 text-emerald-50 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            {PLATFORM_DIGITAL_PRODUCT_INTRO_BADGE}
          </Badge>
        </div>

        <div className="flex items-center justify-center sm:justify-end gap-2 mb-5">
          <FileText className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden />
          <h2
            id="platform-digital-product-intro-title"
            className="text-lg sm:text-xl font-bold text-foreground text-center sm:text-right leading-snug"
          >
            {PLATFORM_DIGITAL_PRODUCT_INTRO_TITLE}
          </h2>
        </div>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-foreground/90 text-center sm:text-right">
          {PLATFORM_DIGITAL_PRODUCT_INTRO_PARAGRAPHS.map((paragraph, index) => (
            <p key={index} className="text-pretty">
              {paragraph}
            </p>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
