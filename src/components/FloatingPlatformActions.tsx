/**
 * FloatingPlatformActions — مجموعة أزرار عائمة (FAB)
 *
 * موضوعة أسفل يمين الشاشة (fixed).
 * تتضمن: مشاركة المنصة · التقييم · الآراء · العودة للأعلى
 * تصميم: زجاجي داكن مضيء، توسّع عند النقر، انيميشن ناعم.
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Star, MessageSquare, ChevronUp,
  Copy, Check, X, Zap
} from 'lucide-react';
import { SiWhatsapp, SiX } from 'react-icons/si';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';

// ─── Share modal ─────────────────────────────────────────────────────────
function ShareModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.origin + '/#' + ROUTE_PATHS.HOME;
  const text = 'حلاق ماب — اعثر على أقرب حلاق إليك لحظياً عبر الرادار الجغرافي 📍✂️';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silent */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="fixed bottom-28 left-4 right-4 z-50 mx-auto max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-[#030d1a]/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl sm:left-auto sm:right-6 sm:w-72"
      dir="rtl"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">شارك حلاق ماب</h3>
        <button type="button" onClick={onClose} aria-label="إغلاق" className="rounded-full p-1 text-slate-500 hover:text-slate-300">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4 flex gap-3">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-green-400/30 bg-green-500/10 px-3 py-3 text-green-300 transition-all hover:border-green-400/60 hover:bg-green-500/20"
        >
          <SiWhatsapp className="h-5 w-5" />
          <span className="text-[0.65rem] font-semibold">واتساب</span>
        </a>
        {/* X/Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-3 text-slate-300 transition-all hover:border-white/40 hover:bg-white/10"
        >
          <SiX className="h-5 w-5" />
          <span className="text-[0.65rem] font-semibold">تويتر</span>
        </a>
        {/* Copy */}
        <button
          type="button"
          onClick={copyLink}
          aria-label={copied ? 'تم نسخ الرابط' : 'نسخ الرابط'}
          className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-teal-400/30 bg-teal-500/10 px-3 py-3 text-teal-300 transition-all hover:border-teal-400/60"
        >
          {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
          <span className="text-[0.65rem] font-semibold">{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
        </button>
      </div>

      <div className="truncate rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-[0.6rem] font-mono text-slate-500">
        {url}
      </div>
    </motion.div>
  );
}

// ─── Rating modal ─────────────────────────────────────────────────────────
const RATING_LABELS = ['', 'سيئ', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'];

function RatingModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (stars === 0) return;
    try {
      const existing = JSON.parse(localStorage.getItem('hm_ratings') ?? '[]') as number[];
      existing.push(stars);
      localStorage.setItem('hm_ratings', JSON.stringify(existing));
    } catch { /* silent */ }
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      navigate(ROUTE_PATHS.PLATFORM_REVIEWS);
    }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="fixed bottom-28 left-4 right-4 z-50 mx-auto max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-[#030d1a]/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:left-auto sm:right-6 sm:w-72"
      dir="rtl"
    >
      <button type="button" onClick={onClose} aria-label="إغلاق" className="absolute left-3 top-3 rounded-full p-1 text-slate-500 hover:text-slate-300">
        <X className="h-4 w-4" />
      </button>

      {submitted ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="text-4xl">🎉</div>
          <div className="text-sm font-bold text-emerald-300">شكراً على تقييمك!</div>
          <div className="text-xs text-slate-400">رأيك يساعدنا على التحسين</div>
        </div>
      ) : (
        <>
          <h3 className="mb-4 text-center text-sm font-bold text-white">كيف تقيّم تجربتك؟</h3>
          <div className="mb-3 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                aria-label={`${s} من 5 نجوم`}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setStars(s)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    s <= (hover || stars)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>
          {(hover || stars) > 0 && (
            <p className="mb-4 text-center text-xs font-semibold text-amber-300">
              {RATING_LABELS[hover || stars]}
            </p>
          )}
          <button
            onClick={submit}
            disabled={stars === 0}
            className="w-full rounded-xl bg-gradient-to-l from-teal-500 to-teal-700 py-2.5 text-sm font-bold text-white transition-all hover:from-teal-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            أرسل تقييمك
          </button>
          <button
            onClick={() => navigate(ROUTE_PATHS.PLATFORM_REVIEWS)}
            className="mt-2 w-full text-center text-[0.7rem] text-slate-500 hover:text-slate-300"
          >
            اقرأ آراء المستخدمين ←
          </button>
        </>
      )}
    </motion.div>
  );
}

// ─── Main FAB ─────────────────────────────────────────────────────────────
export function FloatingPlatformActions() {
  const navigate = useNavigate();
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
      labelAr: 'شارك المنصة',
      color: 'border-teal-400/40 bg-teal-500/15 text-teal-300 hover:border-teal-400/70',
      onClick: () => { setModal('share'); setOpen(false); },
    },
    {
      id: 'rate',
      icon: Star,
      labelAr: 'قيّم المنصة',
      color: 'border-amber-400/40 bg-amber-500/15 text-amber-300 hover:border-amber-400/70',
      onClick: () => { setModal('rate'); setOpen(false); },
    },
    {
      id: 'reviews',
      icon: MessageSquare,
      labelAr: 'آراء المستخدمين',
      color: 'border-violet-400/40 bg-violet-500/15 text-violet-300 hover:border-violet-400/70',
      onClick: () => { navigate(ROUTE_PATHS.PLATFORM_REVIEWS); setOpen(false); },
    },
  ] as const;

  return (
    <>
      {/* Modals */}
      <AnimatePresence>
        {modal === 'share' && <ShareModal onClose={closeModal} />}
        {modal === 'rate' && <RatingModal onClose={closeModal} />}
      </AnimatePresence>

      {/* FAB cluster */}
      <div className="fixed bottom-6 left-4 z-40 flex flex-col-reverse items-end gap-2 sm:bottom-8 sm:left-6">

        {/* Sub-actions */}
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

        {/* Main toggle button */}
        <motion.button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'إغلاق قائمة الإجراءات' : 'فتح قائمة الإجراءات السريعة'}
          aria-expanded={open}
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

        {/* Scroll to top (separate) */}
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
