/**
 * نوافذ تفاعل اختياري: تقييم · مشاركة
 * (التعليق يوجّه لصفحة الآراء حيث النموذج اختياري أيضاً)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, X, Star } from 'lucide-react';
import { SiWhatsapp, SiX } from 'react-icons/si';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { PLATFORM_VOLUNTARY_ENGAGEMENT } from '@/config/platformVoluntaryEngagement';

export function ShareEngagementModal({ onClose }: { onClose: () => void }) {
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
      role="dialog"
      aria-labelledby="share-engagement-title"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 id="share-engagement-title" className="text-sm font-bold text-white">
          {PLATFORM_VOLUNTARY_ENGAGEMENT.actions.share.label}
        </h3>
        <button type="button" onClick={onClose} aria-label="إغلاق" className="rounded-full p-1 text-slate-500 hover:text-slate-300">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mb-3 text-[0.7rem] leading-relaxed text-slate-400">{PLATFORM_VOLUNTARY_ENGAGEMENT.lead}</p>

      <div className="mb-4 flex gap-3">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-green-400/30 bg-green-500/10 px-3 py-3 text-green-300 transition-all hover:border-green-400/60 hover:bg-green-500/20"
        >
          <SiWhatsapp className="h-5 w-5" />
          <span className="text-[0.65rem] font-semibold">واتساب</span>
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-3 text-slate-300 transition-all hover:border-white/40 hover:bg-white/10"
        >
          <SiX className="h-5 w-5" />
          <span className="text-[0.65rem] font-semibold">تويتر</span>
        </a>
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

const RATING_LABELS = ['', 'سيئ', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'];

export function RateEngagementModal({ onClose }: { onClose: () => void }) {
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
    } catch {
      /* silent */
    }
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      navigate(`${ROUTE_PATHS.PLATFORM_REVIEWS}?thanks=1`);
    }, 1600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="fixed bottom-28 left-4 right-4 z-50 mx-auto max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-[#030d1a]/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:left-auto sm:right-6 sm:w-72"
      dir="rtl"
      role="dialog"
      aria-labelledby="rate-engagement-title"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="إغلاق"
        className="absolute left-3 top-3 rounded-full p-1 text-slate-500 hover:text-slate-300"
      >
        <X className="h-4 w-4" />
      </button>

      {submitted ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="text-4xl">🎉</div>
          <div className="text-sm font-bold text-emerald-300">شكراً — تقييمك اختياري ونقدّره</div>
        </div>
      ) : (
        <>
          <h3 id="rate-engagement-title" className="mb-1 text-center text-sm font-bold text-white">
            {PLATFORM_VOLUNTARY_ENGAGEMENT.actions.rate.label}
          </h3>
          <p className="mb-4 text-center text-[0.68rem] leading-relaxed text-slate-400">
            {PLATFORM_VOLUNTARY_ENGAGEMENT.lead}
          </p>
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
                    s <= (hover || stars) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>
          {(hover || stars) > 0 && (
            <p className="mb-4 text-center text-xs font-semibold text-amber-300">{RATING_LABELS[hover || stars]}</p>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={stars === 0}
            className="w-full rounded-xl bg-gradient-to-l from-teal-500 to-teal-700 py-2.5 text-sm font-bold text-white transition-all hover:from-teal-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            إرسال التقييم (اختياري)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-xl border border-white/10 py-2 text-center text-[0.72rem] font-semibold text-slate-400 hover:border-white/20 hover:text-slate-200"
          >
            {PLATFORM_VOLUNTARY_ENGAGEMENT.skip}
          </button>
        </>
      )}
    </motion.div>
  );
}
