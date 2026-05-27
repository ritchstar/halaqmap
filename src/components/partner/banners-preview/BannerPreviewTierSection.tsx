import { motion, useReducedMotion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  PARTNER_BANNERS_PREVIEW_CTA,
  PARTNER_BANNERS_PREVIEW_DIAMOND_GALLERY_MAX,
  PARTNER_BANNERS_PREVIEW_GOLD_GALLERY_MAX,
  type BannerPreviewTierConfig,
} from '@/config/partnerBannersPreviewCopy';
import { ROUTE_PATHS } from '@/lib';
import { cn } from '@/lib/utils';
import { EndUserBarberBannerSim } from '@/components/partner/banners-preview/EndUserBarberBannerSim';

type Props = {
  tier: BannerPreviewTierConfig;
  index: number;
  showCta?: boolean;
  className?: string;
};

/** قسم معاينة باقة واحدة: محاكاة + شروحات تسويقية (مصدر موحّد للصفحة الكاملة وقسم الهبوط). */
export function BannerPreviewTierSection({
  tier,
  index,
  showCta = true,
  className,
}: Props) {
  const reduceMotion = useReducedMotion();
  const isDiamond = tier.id === 'diamond';

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.06 }}
      className={cn('grid items-center gap-8 lg:grid-cols-2 lg:gap-12', className)}
    >
      <div
        className={cn(
          'relative z-[1] order-2 lg:order-1',
          index % 2 === 1 && 'lg:order-2',
        )}
      >
        <EndUserBarberBannerSim tier={tier} startDelayMs={index * 1400} />
      </div>

      <div
        className={cn(
          'relative z-[2] order-1 space-y-5 lg:order-2',
          index % 2 === 1 && 'lg:order-1',
        )}
      >
        <div>
          <span className="mb-2 inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-slate-200">
            {tier.badge} {tier.name}
          </span>
          <h2 className="text-xl font-extrabold leading-snug text-white md:text-2xl">{tier.marketingTitle}</h2>
        </div>

        <div className="space-y-4 text-sm leading-8 text-slate-300">
          {tier.marketingParagraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        {isDiamond ? (
          <p className="rounded-xl border border-cyan-400/20 bg-cyan-950/25 p-3 text-xs leading-relaxed text-cyan-100/85">
            بنر الفيديو الماسي يُحمَّل كسولاً داخل الملف الداخلي فقط (`WebM`، حتى 10 ثوانٍ، صامت) — صفر تأثير
            على سرعة تصفح العملاء على المنصة.
          </p>
        ) : null}

        <p className="text-[11px] text-slate-500">
          حد المعرض في النظام: ذهبي {PARTNER_BANNERS_PREVIEW_GOLD_GALLERY_MAX} صورة · ماسي{' '}
          {PARTNER_BANNERS_PREVIEW_DIAMOND_GALLERY_MAX} صورة.
        </p>

        {showCta ? (
          <NavLink to={ROUTE_PATHS.REGISTER}>
            <Button
              type="button"
              className={cn(
                'h-auto min-h-12 w-full whitespace-normal py-3 text-sm font-bold sm:w-auto sm:min-w-[280px]',
                isDiamond ? 'diamond-cta' : 'bg-primary hover:bg-primary/90',
              )}
            >
              {PARTNER_BANNERS_PREVIEW_CTA}
            </Button>
          </NavLink>
        ) : null}
      </div>
    </motion.section>
  );
}
