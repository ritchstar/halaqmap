import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Presentation, Sparkles } from 'lucide-react';
import { PLATFORM_STORY_HIGHLIGHTS } from '@/config/platformStorySlides';
import { ROUTE_PATHS } from '@/lib';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  variant?: 'default' | 'compact';
};

export function PlatformStoryHighlights({ className, variant = 'default' }: Props) {
  const compact = variant === 'compact';

  return (
    <section className={cn('relative', className)} dir="rtl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            قصة المنصة
          </div>
          <h2 className={cn('font-black text-foreground', compact ? 'text-2xl' : 'text-3xl md:text-4xl')}>
            من الاستعلام إلى التواصل المباشر
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            ملخص سريع لعقيدة حلاق ماب — فلاتر خدمة وثقة للزائر، وحرية تشغيل للشريك.
          </p>
        </div>
        <Link
          to={ROUTE_PATHS.PLATFORM_DISCOVER}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-teal-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition hover:scale-[1.02]"
        >
          <Presentation className="h-4 w-4" />
          عرض الشرائح التفاعلي
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PLATFORM_STORY_HIGHLIGHTS.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm"
          >
            <h3 className="mb-2 text-base font-bold text-foreground">{item.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
