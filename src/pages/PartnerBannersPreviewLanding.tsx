import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/lib';
import {
  PARTNER_BANNERS_PREVIEW_CTA,
  PARTNER_BANNERS_PREVIEW_DIAMOND_GALLERY_MAX,
  PARTNER_BANNERS_PREVIEW_GOLD_GALLERY_MAX,
  PARTNER_BANNERS_PREVIEW_TIERS,
} from '@/config/partnerBannersPreviewCopy';
import { BannersPreviewAmbient } from '@/components/partner/banners-preview/BannersPreviewAmbient';
import { EndUserBarberBannerSim } from '@/components/partner/banners-preview/EndUserBarberBannerSim';
import { cn } from '@/lib/utils';

export default function PartnerBannersPreviewLanding() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'حلاق ماب — نماذج البنرات (معاينة تفاعلية)';
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => {
      document.title = prevTitle;
      meta.remove();
    };
  }, []);

  return (
    <div className="relative min-h-screen text-slate-100" dir="rtl">
      <BannersPreviewAmbient />

      <header className="relative z-10 border-b border-white/10 bg-[#0b0f19]/85 backdrop-blur-md">
        <div className="container mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10">
              <Radar className="h-5 w-5 text-cyan-300" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold text-cyan-200/80">مسار الأعمال · شفافية بصرية</p>
              <h1 className="text-lg font-extrabold text-white md:text-xl">نماذج البنرات — كما يراها العميل</h1>
            </div>
          </div>
          <p className="max-w-lg text-xs leading-relaxed text-slate-400">
            محاكاة تلقائية لرحلة المستخدم النهائي على <strong className="text-cyan-200/90">واجهة الرادار</strong>{' '}
            ضمن <strong className="text-cyan-200/90">نظام الرصد الذكي</strong> — معرض صور، تواصل، وفتح الموقع.
          </p>
        </div>
      </header>

      <main className="relative z-10 container mx-auto max-w-6xl space-y-16 px-4 py-10 md:py-14">
        {PARTNER_BANNERS_PREVIEW_TIERS.map((tier, index) => {
          const isDiamond = tier.id === 'diamond';
          return (
            <motion.section
              key={tier.id}
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: index * 0.06 }}
              className={cn(
                'grid items-center gap-8 lg:grid-cols-2 lg:gap-12',
                isDiamond && 'relative lg:z-10',
              )}
            >
              {isDiamond ? <div aria-hidden className="diamond-pricing-aura -inset-4 hidden lg:block" /> : null}

              <div className={cn('order-2 lg:order-1', index % 2 === 1 && 'lg:order-2')}>
                <EndUserBarberBannerSim tier={tier} startDelayMs={index * 1400} />
              </div>

              <div className={cn('order-1 space-y-5 lg:order-2', index % 2 === 1 && 'lg:order-1')}>
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

                {isDiamond && (
                  <p className="rounded-xl border border-cyan-400/20 bg-cyan-950/25 p-3 text-xs leading-relaxed text-cyan-100/85">
                    بنر الفيديو الماسي يُحمَّل كسولاً داخل الملف الداخلي فقط (WebM، حتى 10 ثوانٍ، صامت) — صفر تأثير
                    على سرعة تصفح العملاء على المنصة.
                  </p>
                )}

                <p className="text-[11px] text-slate-500">
                  حد المعرض في النظام: ذهبي {PARTNER_BANNERS_PREVIEW_GOLD_GALLERY_MAX} صورة · ماسي{' '}
                  {PARTNER_BANNERS_PREVIEW_DIAMOND_GALLERY_MAX} صورة.
                </p>

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
              </div>
            </motion.section>
          );
        })}
      </main>

      <footer className="relative z-10 border-t border-white/10 px-4 py-6 text-center text-[11px] text-slate-500">
        صفحة داخلية لمسار الخدمات البرمجية للمنصة — غير مرتبطة بواجهة المستهلك العامة.
      </footer>
    </div>
  );
}
