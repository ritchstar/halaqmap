/**
 * FloatingPlatformActions — مجموعة أزرار عائمة (FAB)
 *
 * تفاعل اختياري: مشاركة · تقييم · تعليق · العودة للأعلى
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Star, MessageSquare, ChevronUp, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { PLATFORM_VOLUNTARY_ENGAGEMENT } from '@/config/platformVoluntaryEngagement';
import { RateEngagementModal, ShareEngagementModal } from '@/components/platformEngagement/PlatformEngagementModals';
import { useIsMobile } from '@/hooks/use-mobile';

export function FloatingPlatformActions() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<'share' | 'rate' | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fn = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  const actions = [
    {
      id: 'share',
      icon: Share2,
      labelAr: PLATFORM_VOLUNTARY_ENGAGEMENT.actions.share.label,
      color: 'border-teal-400/40 bg-teal-500/15 text-teal-300 hover:border-teal-400/70',
      onClick: () => {
        setModal('share');
        setOpen(false);
      },
    },
    {
      id: 'rate',
      icon: Star,
      labelAr: PLATFORM_VOLUNTARY_ENGAGEMENT.actions.rate.label,
      color: 'border-amber-400/40 bg-amber-500/15 text-amber-300 hover:border-amber-400/70',
      onClick: () => {
        setModal('rate');
        setOpen(false);
      },
    },
    {
      id: 'reviews',
      icon: MessageSquare,
      labelAr: PLATFORM_VOLUNTARY_ENGAGEMENT.actions.comment.label,
      color: 'border-violet-400/40 bg-violet-500/15 text-violet-300 hover:border-violet-400/70',
      onClick: () => {
        navigate(`${ROUTE_PATHS.PLATFORM_REVIEWS}?write=1`);
        setOpen(false);
      },
    },
  ] as const;

  if (isMobile) return null;

  return (
    <>
      <AnimatePresence>
        {modal === 'share' && <ShareEngagementModal onClose={closeModal} />}
        {modal === 'rate' && <RateEngagementModal onClose={closeModal} />}
      </AnimatePresence>

      <div className="fixed bottom-14 left-4 z-40 flex flex-col-reverse items-end gap-2 pb-[env(safe-area-inset-bottom,0px)] sm:bottom-[4.5rem] sm:left-6">
        <AnimatePresence>
          {open && actions.map((action, i) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.7 }}
              transition={{ duration: 0.2, delay: i * 0.06 }}
              onClick={action.onClick}
              dir="rtl"
              className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-[0.7rem] font-semibold shadow-lg backdrop-blur-md transition-all ${action.color}`}
            >
              <action.icon className="h-4 w-4" />
              {action.labelAr}
            </motion.button>
          ))}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'إغلاق قائمة التفاعل الاختياري' : PLATFORM_VOLUNTARY_ENGAGEMENT.fabHint}
          aria-expanded={open}
          title={PLATFORM_VOLUNTARY_ENGAGEMENT.fabHint}
          whileTap={{ scale: 0.92 }}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-xl backdrop-blur-md transition-all duration-300 ${
            open
              ? 'border border-rose-400/50 bg-rose-500/20 text-rose-300 shadow-rose-500/20'
              : 'border border-teal-400/40 bg-gradient-to-br from-teal-500/20 to-teal-800/40 text-teal-200 shadow-teal-500/20'
          }`}
        >
          <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
            {open ? <X className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {showScrollTop && !open && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="العودة إلى أعلى الصفحة"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-black/60 text-slate-400 backdrop-blur-md hover:text-white"
            >
              <ChevronUp className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
