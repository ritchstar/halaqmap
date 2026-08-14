/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * زر بحث كوافير ماب — نفس منطق «استعلم الآن» في الرئيسية، بطابع نسائي فاخر.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  label: string;
  shortLabel?: string;
  busy?: boolean;
  size?: 'header' | 'hero';
  className?: string;
  onClick?: () => void;
};

export function CoiffeurSearchButton({
  label,
  shortLabel,
  busy = false,
  size = 'hero',
  onClick,
  className,
}: Props) {
  const reduceMotion = useReducedMotion();
  const compact = size === 'header';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={busy}
      whileHover={reduceMotion ? undefined : { scale: 1.03 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      className={cn(
        'group relative overflow-hidden font-black text-[#2a1218] disabled:opacity-80',
        'border border-[#f7efe8]/35 bg-gradient-to-l from-[#f7efe8] via-[#f4d4c0] to-[#c98b96]',
        compact
          ? 'rounded-xl px-4 py-2.5 text-[0.94rem] shadow-[0_0_20px_rgba(232,180,162,0.38)] hover:shadow-[0_0_32px_rgba(244,212,192,0.55)]'
          : 'w-full rounded-2xl px-6 py-4 text-base shadow-[0_0_32px_rgba(232,180,162,0.42)] hover:shadow-[0_0_42px_rgba(244,212,192,0.58)] sm:w-auto sm:min-w-[16rem]',
        className,
      )}
    >
      {!reduceMotion ? (
        <motion.div
          className="absolute inset-0 bg-gradient-to-l from-transparent via-white/40 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'linear', repeatDelay: 1.1 }}
        />
      ) : null}
      <span className="relative flex items-center justify-center gap-1.5">
        <Search className={compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
        {shortLabel ? (
          <>
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{shortLabel}</span>
          </>
        ) : (
          label
        )}
      </span>
    </motion.button>
  );
}

export const COIFFEUR_VISITOR_CANVAS_CLASS =
  'relative min-h-svh overflow-x-clip bg-[linear-gradient(165deg,#14080e_0%,#1c0c14_45%,#12070c_100%)] text-[#f7efe8]';
