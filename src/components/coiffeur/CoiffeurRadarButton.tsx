/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * دائرة استعلام كوافير ماب — نفس منطق رادار الرئيسية، بطابع شامبانيا / وردي فاخر.
 * لا تكتب إحداثيات في مخزن موقع حلاق ماب للرجال.
 */
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export type CoiffeurRadarPhase = 'idle' | 'searching' | 'found' | 'denied';

type Props = {
  phase?: CoiffeurRadarPhase;
  onClick?: () => void;
  idleTitle?: string;
  idleHint?: string;
};

const THEME = {
  idle: {
    ring: 'rgba(232,180,162,',
    border: 'rgba(244,212,192,0.45)',
    glow: 'rgba(232,180,162,0.32)',
    bg: 'radial-gradient(circle at 42% 38%, #3a1824 0%, #1c0c14 48%, #12070c 100%)',
    icon: '#f4d4c0',
    text: 'text-[#f7efe8]',
    sub: 'text-[#e8b4a2]/75',
    dot: 'bg-[#f4d4c0]',
  },
  searching: {
    ring: 'rgba(232,180,162,',
    border: 'rgba(244,212,192,0.62)',
    glow: 'rgba(232,180,162,0.46)',
    bg: 'radial-gradient(circle at 42% 38%, #4a1d2c 0%, #1c0c14 48%, #12070c 100%)',
    icon: '#f4d4c0',
    text: 'text-rose-50',
    sub: 'text-[#e8b4a2]/80',
    dot: 'bg-[#f4d4c0]',
  },
  found: {
    ring: 'rgba(244,212,192,',
    border: 'rgba(244,212,192,0.58)',
    glow: 'rgba(201,139,150,0.38)',
    bg: 'radial-gradient(circle at 42% 38%, #3a1824 0%, #1c0c14 48%, #12070c 100%)',
    icon: '#f4d4c0',
    text: 'text-[#f7efe8]',
    sub: 'text-[#e8b4a2]/80',
    dot: 'bg-[#f4d4c0]',
  },
  denied: {
    ring: 'rgba(244,212,192,',
    border: 'rgba(201,139,150,0.50)',
    glow: 'rgba(201,139,150,0.28)',
    bg: 'radial-gradient(circle at 42% 38%, #2a1218 0%, #1c0c14 48%, #12070c 100%)',
    icon: '#e8b4a2',
    text: 'text-rose-100',
    sub: 'text-[#c98b96]/80',
    dot: 'bg-[#c98b96]',
  },
} as const;

function SearchingRing() {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-full">
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const r = 90;
        const x = 110 + r * Math.cos(angle);
        const y = 110 + r * Math.sin(angle);
        return (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-[#f4d4c0]"
            style={{ left: x - 4, top: y - 4 }}
            animate={{ opacity: [0.15, 1, 0.15], scale: [0.6, 1.2, 0.6] }}
            transition={{ duration: 1.6, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}

export function CoiffeurRadarButton({
  phase = 'idle',
  onClick,
  idleTitle = 'ابدئي الآن',
  idleHint = 'ابحثي عن الصالونات',
}: Props) {
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const theme = THEME[phase];
  const SIZE = isMobile ? 156 : 220;
  const isSearching = phase === 'searching';
  const isFound = phase === 'found';
  const isDenied = phase === 'denied';
  const isIdle = phase === 'idle';

  return (
    <div className="flex w-full max-w-full flex-col items-center gap-3 overflow-visible select-none md:gap-4" dir="rtl">
      <div className="relative shrink-0 overflow-visible" style={{ width: SIZE, height: SIZE }}>
        <AnimatePresence>
          {(isIdle || isSearching) && !isMobile && !reduceMotion ? (
            <>
              <motion.div
                key="ring1"
                className="pointer-events-none absolute inset-0 rounded-full border"
                style={{ borderColor: `${theme.ring}0.28)` }}
                animate={{ scale: [1, 1.45], opacity: [0.55, 0] }}
                transition={{ duration: isSearching ? 1.4 : 2.8, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                key="ring2"
                className="pointer-events-none absolute inset-0 rounded-full border"
                style={{ borderColor: `${theme.ring}0.16)` }}
                animate={{ scale: [1, 1.7], opacity: [0.35, 0] }}
                transition={{
                  duration: isSearching ? 1.4 : 2.8,
                  delay: isSearching ? 0.35 : 0.7,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            </>
          ) : null}
        </AnimatePresence>

        {isFound ? (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-full border-2"
            style={{ borderColor: 'rgba(244,212,192,0.55)' }}
            animate={reduceMotion ? undefined : { scale: [1, 1.35], opacity: [0.8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          />
        ) : null}

        {isSearching && !isMobile && !reduceMotion ? <SearchingRing /> : null}

        <motion.button
          type="button"
          onClick={onClick}
          disabled={isSearching}
          whileHover={!isSearching && !reduceMotion ? { scale: 1.04 } : undefined}
          whileTap={!isSearching && !reduceMotion ? { scale: 0.96 } : undefined}
          className="relative z-10 flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-full border cursor-pointer touch-manipulation focus:outline-none"
          style={{
            background: theme.bg,
            borderColor: theme.border,
            boxShadow: `0 0 28px 6px ${theme.glow}`,
          }}
          aria-label={idleTitle}
          aria-busy={isSearching}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle at 42% 35%, ${theme.ring}0.14) 0%, transparent 65%)` }}
          />
          <div
            className="pointer-events-none absolute inset-3 rounded-full border"
            style={{ borderColor: `${theme.ring}0.18)` }}
          />

          <div className="relative z-10 mb-4 flex items-center justify-center">
            {isFound ? (
              <div className={`flex items-center justify-center rounded-full border-2 border-[#f4d4c0]/50 bg-[#e8b4a2]/15 ${isMobile ? 'h-[60px] w-[60px]' : 'h-[72px] w-[72px]'}`}>
                <svg viewBox="0 0 28 28" width="38" height="38" fill="none" aria-hidden>
                  <path d="M5 14 L11 20 L23 8" stroke="#f4d4c0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ) : isDenied ? (
              <div className={`flex items-center justify-center rounded-full border-2 border-[#c98b96]/50 bg-[#c98b96]/15 ${isMobile ? 'h-[60px] w-[60px]' : 'h-[72px] w-[72px]'}`}>
                <svg viewBox="0 0 28 28" width="38" height="38" fill="none" aria-hidden>
                  <line x1="7" y1="7" x2="21" y2="21" stroke="#e8b4a2" strokeWidth="3" strokeLinecap="round" />
                  <line x1="21" y1="7" x2="7" y2="21" stroke="#e8b4a2" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            ) : (
              <motion.div
                animate={
                  isSearching && !reduceMotion
                    ? { rotate: [-10, 10, -10], scale: [1, 1.08, 1] }
                    : { rotate: 0, scale: 1 }
                }
                transition={
                  isSearching
                    ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.4 }
                }
              >
                <Sparkles
                  style={{ color: theme.icon, width: isMobile ? 52 : 64, height: isMobile ? 52 : 64 }}
                  strokeWidth={1.25}
                />
              </motion.div>
            )}
          </div>

          <div className="relative z-10 flex flex-col items-center gap-1.5 px-4">
            <p className={`${isMobile ? 'text-[0.92rem]' : 'text-[1.02rem]'} font-black leading-tight ${theme.text}`}>
              {isFound ? 'تم تحديد موقعك' : isSearching ? 'يجري الاستعلام…' : isDenied ? 'تعذّر الاستعلام' : idleTitle}
            </p>
            {isIdle ? (
              <p className={`${isMobile ? 'text-[0.58rem]' : 'text-[0.62rem]'} font-semibold ${theme.sub}`}>
                {idleHint}
              </p>
            ) : null}
            {isSearching ? (
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${theme.dot}`}
                    animate={reduceMotion ? undefined : { opacity: [0.25, 1, 0.25], scale: [0.7, 1.2, 0.7] }}
                    transition={{ duration: 1.1, delay: i * 0.18, repeat: Infinity }}
                  />
                ))}
              </div>
            ) : null}
            {isFound ? (
              <p className={`text-[0.62rem] font-semibold ${theme.sub}`}>النتائج بالأسفل</p>
            ) : null}
            {isDenied ? (
              <p className={`text-[0.62rem] font-semibold ${theme.sub}`}>اضغطي للمحاولة مجدداً</p>
            ) : null}
          </div>
        </motion.button>
      </div>

      {!isMobile && !reduceMotion ? (
        <motion.div
          className="h-px w-32 bg-gradient-to-l from-transparent via-[#f4d4c0]/35 to-transparent"
          animate={{ scaleX: [0.2, 1, 0.2], opacity: [0.2, 0.55, 0.2] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : null}
      <p className="max-w-[19rem] text-center text-[0.72rem] leading-5 text-rose-100/45">
        الاستعلام يستخدم إذن الموقع لعرض الأقرب في نطاقك.
      </p>
    </div>
  );
}
