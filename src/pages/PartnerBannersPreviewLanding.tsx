import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Gem, Radar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/lib';
import {
  PARTNER_BANNERS_PREVIEW_CTA,
  PARTNER_BANNERS_PREVIEW_DIAMOND_GALLERY_MAX,
  PARTNER_BANNERS_PREVIEW_GOLD_GALLERY_MAX,
  PARTNER_BANNERS_PREVIEW_TIERS,
} from '@/config/partnerBannersPreviewCopy';
import { cn } from '@/lib/utils';

const SHELL_BG = '#0b0f19';

const tierShell: Record<
  (typeof PARTNER_BANNERS_PREVIEW_TIERS)[number]['accent'],
  { ring: string; glow: string; badge: string; cta: string }
> = {
  bronze: {
    ring: 'ring-amber-500/30',
    glow: 'from-amber-600/15 via-transparent to-transparent',
    badge: 'border-amber-400/35 bg-amber-500/10 text-amber-100',
    cta: 'bg-gradient-to-l from-amber-700 to-amber-500 hover:from-amber-600 hover:to-amber-400 text-slate-950',
  },
  gold: {
    ring: 'ring-yellow-400/35',
    glow: 'from-yellow-400/20 via-amber-500/5 to-transparent',
    badge: 'border-yellow-300/40 bg-yellow-500/10 text-yellow-50',
    cta: 'bg-gradient-to-l from-yellow-600 to-amber-400 hover:from-yellow-500 hover:to-amber-300 text-slate-950',
  },
  diamond: {
    ring: 'ring-cyan-400/50',
    glow: 'from-cyan-400/28 via-slate-400/8 to-indigo-950/35',
    badge: 'border-cyan-300/45 bg-cyan-500/10 text-cyan-50',
    cta: 'diamond-cta w-full',
  },
};

/**
 * معاينة البنرات والواجهات — مسار مخفي للعملاء التجاريين فقط (بدون روابط من الرئيسية).
 */
export default function PartnerBannersPreviewLanding() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'حلاق ماب — معاينة البنرات والواجهات (أعمال)';
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
    <motion.div
      className="min-h-screen text-slate-100"
      style={{ backgroundColor: SHELL_BG }}
      dir="rtl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(34,211,238,0.12),transparent_55%),radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(30,58,138,0.2),transparent_50%)]"
      />

      <header className="relative z-10 border-b border-white/10 bg-[#0b0f19]/90 backdrop-blur-md">
        <motion.div
          className="container mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5"
          initial={reduceMotion ? false : { y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <motion.div
            className="flex items-center gap-3"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10">
              <Radar className="h-5 w-5 text-cyan-300" aria-hidden />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-cyan-200/80">مسار الأعمال · داخلي</p>
              <h1 className="text-lg font-extrabold tracking-tight text-white md:text-xl">
                معاينة البنرات وواجهة الرادار
              </h1>
            </div>
          </motion.div>
          <p className="max-w-md text-xs leading-relaxed text-slate-400">
            عرض تجاري لقدرات الظهور عبر <strong className="text-cyan-200/90">نظام الرصد الذكي</strong> و
            <strong className="text-cyan-200/90"> واجهة الرادار</strong> — دون روابط من واجهة المستهلك العامة.
          </p>
        </motion.div>
      </header>

      <main className="relative z-10 container mx-auto max-w-6xl px-4 py-10 md:py-14">
        <motion.section
          className="mb-10 text-center md:text-right"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-emerald-200/90">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            حدود المعرض المعتمدة: ذهبي {PARTNER_BANNERS_PREVIEW_GOLD_GALLERY_MAX} · ماسي{' '}
            {PARTNER_BANNERS_PREVIEW_DIAMOND_GALLERY_MAX}
          </p>
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">
            ثلاث فئات — ثلاث هويات بصرية على واجهة الرادار
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400 md:mx-0 md:text-base">
            كل فئة تمنح صالونك طبقة ظهور مختلفة للعملاء الذين يبحثون عبر نظام الرصد الذكي. اختر الفئة
            المناسبة ثم أكمل طلب الانضمام.
          </p>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-3 lg:items-center lg:gap-8">
          {PARTNER_BANNERS_PREVIEW_TIERS.map((tier, index) => {
            const styles = tierShell[tier.accent];
            const isDiamond = tier.accent === 'diamond';

            return (
              <motion.div
                key={tier.id}
                className={cn('relative flex flex-col', isDiamond && 'z-20 lg:scale-[1.06]')}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.1, duration: 0.5 }}
              >
                {isDiamond ? <div aria-hidden className="diamond-pricing-aura" /> : null}

                <article
                  className={cn(
                    'relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/10',
                    'bg-white/[0.04] backdrop-blur-xl',
                    'ring-1 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.65)]',
                    styles.ring,
                    isDiamond ? 'diamond-card-shell p-7 pt-10' : 'p-6',
                  )}
                >
                  <motion.div
                    aria-hidden
                    className={cn(
                      'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90',
                      styles.glow,
                    )}
                  />

                  {isDiamond && tier.premiumRibbon ? (
                    <span className="diamond-premium-badge">
                      <Gem className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
                      {tier.premiumRibbon}
                    </span>
                  ) : null}

                  <div className="relative z-10 flex flex-1 flex-col text-right">
                    <motion.div
                      className="mb-4"
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      {isDiamond ? (
                        <span className="diamond-sheen-wrap border border-cyan-300/40 bg-slate-900/50">
                          <span className="diamond-metallic-title relative z-[1] inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-extrabold">
                            <span aria-hidden>{tier.badge}</span>
                            {tier.name}
                          </span>
                        </span>
                      ) : (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold',
                            styles.badge,
                          )}
                        >
                          <span aria-hidden>{tier.badge}</span>
                          {tier.name}
                        </span>
                      )}
                    </motion.div>

                    <ul
                      className={cn(
                        'flex-1 space-y-3 text-sm leading-relaxed',
                        isDiamond ? 'text-slate-200' : 'text-slate-300',
                      )}
                    >
                      {tier.highlights.map((line) => (
                        <li key={line} className="flex items-start justify-end gap-2.5">
                          <span className={isDiamond ? 'text-[13px]' : undefined}>{line}</span>
                          {isDiamond ? (
                            <Gem className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300/95" aria-hidden />
                          ) : (
                            <span
                              className={cn(
                                'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                                tier.accent === 'gold' ? 'bg-yellow-400' : 'bg-amber-500',
                              )}
                              aria-hidden
                            />
                          )}
                        </li>
                      ))}
                    </ul>

                    {tier.accent === 'diamond' && 'videoNote' in tier ? (
                      <p className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-950/30 p-3 text-[11px] leading-relaxed text-cyan-100/85">
                        {tier.videoNote}
                      </p>
                    ) : null}

                    <NavLink to={ROUTE_PATHS.REGISTER} className="mt-6 block">
                      <Button
                        type="button"
                        className={cn(
                          'h-auto min-h-12 whitespace-normal py-3 text-sm font-bold shadow-lg transition-transform active:scale-[0.98]',
                          styles.cta,
                        )}
                      >
                        {PARTNER_BANNERS_PREVIEW_CTA}
                      </Button>
                    </NavLink>
                  </div>
                </article>
              </motion.div>
            );
          })}
        </div>

        <motion.footer
          className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center text-xs leading-relaxed text-slate-500 md:text-right"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>
            هذه الصفحة للعرض التجاري على العملاء التجاريين فقط — لا تظهر في الصفحة الرئيسية للمستهلك. حدود
            معرض الصور (ذهبي {PARTNER_BANNERS_PREVIEW_GOLD_GALLERY_MAX} / ماسي{' '}
            {PARTNER_BANNERS_PREVIEW_DIAMOND_GALLERY_MAX}) مُطبَّقة في النظام ولا تُعدَّل من هذه الواجهة.
          </p>
        </motion.footer>
      </main>
    </motion.div>
  );
}
