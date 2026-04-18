import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Scissors, Smile, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PARTNER_DIGITAL_ASSISTANT, partnerAssistantHintForPath } from '@/lib/partnerMarketingCopy';

export function PartnerDigitalBarberAssistant() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const routeHint = useMemo(() => partnerAssistantHintForPath(pathname), [pathname]);

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[60] flex flex-col items-start sm:bottom-6 sm:left-6">
      <AnimatePresence>
        {open ? (
          <motion.aside
            id="partner-barber-assistant"
            key="panel"
            role="dialog"
            aria-label={PARTNER_DIGITAL_ASSISTANT.name}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="pointer-events-auto mb-3 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-emerald-400/35 bg-[#071426]/95 text-right shadow-[0_20px_50px_-12px_rgba(0,0,0,0.55)] backdrop-blur-md"
            dir="rtl"
          >
            <div className="flex items-start justify-between gap-2 border-b border-white/10 bg-gradient-to-l from-emerald-500/15 to-transparent px-4 py-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-lg ring-2 ring-white/20">
                  <Smile className="h-6 w-6" strokeWidth={2.25} aria-hidden />
                  <motion.span
                    className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#071426] ring-2 ring-emerald-400/60"
                    animate={{ rotate: [-6, 6, -6] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    aria-hidden
                  >
                    <Scissors className="h-3.5 w-3.5 text-emerald-200" />
                  </motion.span>
                  <motion.span
                    className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/95 text-[#071426] ring-2 ring-amber-200/80"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    aria-hidden
                  >
                    <MapPin className="h-3 w-3" strokeWidth={2.5} />
                  </motion.span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-emerald-200/90">{PARTNER_DIGITAL_ASSISTANT.role}</p>
                  <p className="truncate text-sm font-bold text-white">{PARTNER_DIGITAL_ASSISTANT.name}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-slate-300 hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 px-4 py-3 text-sm leading-6 text-slate-100">
              <p className="font-semibold text-amber-100/95">{PARTNER_DIGITAL_ASSISTANT.greeting}</p>
              <p className="text-slate-200/95">{PARTNER_DIGITAL_ASSISTANT.welcome}</p>
              <p className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs leading-5 text-emerald-100/90">
                {routeHint}
              </p>
              <div>
                <p className="mb-1.5 text-xs font-semibold text-slate-300">نصائح سريعة</p>
                <ul className="list-disc space-y-1 pr-4 text-xs text-slate-300 marker:text-emerald-400/80">
                  {PARTNER_DIGITAL_ASSISTANT.tips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/40 bg-gradient-to-br from-[#0a1f33] to-[#071426] text-white shadow-[0_12px_40px_-8px_rgba(16,185,129,0.45)] ring-2 ring-emerald-500/25 transition hover:ring-emerald-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061223]"
        aria-expanded={open}
        aria-controls="partner-barber-assistant"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        <span className="sr-only">{open ? 'إغلاق المساعد' : 'فتح مساعد حلاق ماب'}</span>
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600">
          <Smile className="h-6 w-6" strokeWidth={2.25} aria-hidden />
          <motion.span
            className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#071426] ring-2 ring-white/25"
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          >
            <Scissors className="h-3 w-3 text-emerald-200" />
          </motion.span>
          <motion.span
            className="absolute -top-0.5 -left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[#071426]"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          >
            <MapPin className="h-2.5 w-2.5" strokeWidth={2.5} />
          </motion.span>
        </span>
      </motion.button>
    </div>
  );
}
