/**
 * PlatformVoluntaryEngagementStrip — عرض اختياري أمام المستخدم
 * تقييم · تعليق · مشاركة — دون إلزام
 */

import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageSquare, Share2, Star, HeartHandshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { cn } from '@/lib/utils';
import { PLATFORM_VOLUNTARY_ENGAGEMENT } from '@/config/platformVoluntaryEngagement';
import { RateEngagementModal, ShareEngagementModal } from '@/components/platformEngagement/PlatformEngagementModals';

const SESSION_DISMISS_KEY = 'hm_voluntary_strip_dismissed_session';

type ModalKind = 'rate' | 'share' | null;

export function PlatformVoluntaryEngagementStrip({
  variant = 'card',
  className,
}: {
  variant?: 'card' | 'compact';
  className?: string;
}) {
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalKind>(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_DISMISS_KEY, '1');
    } catch {
      /* silent */
    }
    setDismissed(true);
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  if (dismissed) return null;

  const copy = PLATFORM_VOLUNTARY_ENGAGEMENT;

  const actions = [
    {
      id: 'rate',
      icon: Star,
      label: copy.actions.rate.label,
      hint: copy.actions.rate.hint,
      color: 'border-amber-400/30 bg-amber-500/10 text-amber-100 hover:border-amber-400/55',
      onClick: () => setModal('rate'),
    },
    {
      id: 'comment',
      icon: MessageSquare,
      label: copy.actions.comment.label,
      hint: copy.actions.comment.hint,
      color: 'border-violet-400/30 bg-violet-500/10 text-violet-100 hover:border-violet-400/55',
      onClick: () => navigate(`${ROUTE_PATHS.PLATFORM_REVIEWS}?write=1`),
    },
    {
      id: 'share',
      icon: Share2,
      label: copy.actions.share.label,
      hint: copy.actions.share.hint,
      color: 'border-teal-400/30 bg-teal-500/10 text-teal-100 hover:border-teal-400/55',
      onClick: () => setModal('share'),
    },
  ] as const;

  return (
    <>
      <AnimatePresence>
        {modal === 'share' && <ShareEngagementModal onClose={closeModal} />}
        {modal === 'rate' && <RateEngagementModal onClose={closeModal} />}
      </AnimatePresence>

      <section
        dir="rtl"
        aria-label="تفاعل اختياري مع المنصة"
        className={cn(
          'relative overflow-hidden rounded-2xl border border-teal-400/20',
          'bg-gradient-to-br from-[#0a1525]/90 via-[#060d1a]/95 to-[#020912]/90',
          variant === 'compact' ? 'px-4 py-4' : 'px-5 py-6 sm:px-6',
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(20,184,166,0.08),transparent)]" />

        <div className="relative">
          <div className={cn('flex gap-3', variant === 'compact' ? 'flex-col sm:flex-row sm:items-start' : 'flex-col')}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-400/25 bg-teal-500/10 text-teal-300">
              <HeartHandshake className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-0.5 text-[0.62rem] font-bold text-emerald-300">
                  {copy.badge}
                </span>
                <h2
                  className={cn(
                    'font-black text-white',
                    variant === 'compact' ? 'text-sm' : 'text-base sm:text-lg',
                  )}
                >
                  {copy.title}
                </h2>
              </div>
              <p
                className={cn(
                  'leading-relaxed text-slate-400',
                  variant === 'compact' ? 'text-[0.72rem]' : 'text-sm',
                )}
              >
                {copy.lead}
              </p>
            </div>
          </div>

          <div
            className={cn(
              'mt-4 grid gap-2',
              variant === 'compact' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-3',
            )}
          >
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={action.onClick}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-center transition-all',
                  action.color,
                )}
              >
                <action.icon className="h-5 w-5 opacity-90" aria-hidden />
                <span className="text-[0.78rem] font-bold">{action.label}</span>
                <span className="text-[0.62rem] opacity-70">{action.hint}</span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[0.65rem] text-slate-500">{copy.footnote}</p>
            <button
              type="button"
              onClick={dismiss}
              className="text-[0.65rem] font-semibold text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
            >
              {copy.skip}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
