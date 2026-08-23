/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { ExternalLink, Send } from 'lucide-react';
import {
  AMBASSADOR_TELEGRAM_GROUP_CTA_AR,
  AMBASSADOR_TELEGRAM_GROUP_HANDLE,
  AMBASSADOR_TELEGRAM_GROUP_HINT_AR,
  AMBASSADOR_TELEGRAM_GROUP_NAME_AR,
  AMBASSADOR_TELEGRAM_GROUP_URL,
} from '@/config/ambassadorCommunity';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  compact?: boolean;
};

export function AmbassadorTelegramGroupBanner({ className, compact = false }: Props) {
  return (
    <a
      href={AMBASSADOR_TELEGRAM_GROUP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group relative flex w-full flex-col gap-3 overflow-hidden rounded-2xl border border-[#2AABEE]/45 bg-gradient-to-l from-[#229ED9]/25 via-[#1a8bc4]/15 to-[#0f172a] shadow-[0_0_0_1px_rgba(42,171,238,0.12),0_12px_40px_-16px_rgba(34,158,217,0.55)] transition hover:border-[#2AABEE]/70 hover:from-[#229ED9]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2AABEE]/60 sm:flex-row sm:items-center',
        compact ? 'px-3.5 py-3' : 'px-4 py-4 sm:px-5 sm:py-5',
        className,
      )}
      aria-label={`${AMBASSADOR_TELEGRAM_GROUP_CTA_AR} — ${AMBASSADOR_TELEGRAM_GROUP_NAME_AR}`}
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-xl bg-[#229ED9] text-white shadow-lg shadow-[#229ED9]/35',
            compact ? 'h-11 w-11' : 'h-14 w-14',
          )}
          aria-hidden
        >
          <Send
            className={
              compact
                ? 'h-5 w-5 -translate-x-0.5 translate-y-0.5'
                : 'h-6 w-6 -translate-x-0.5 translate-y-0.5'
            }
          />
        </span>

        <span className="min-w-0 flex-1 text-right">
          <span className="mb-0.5 block text-[11px] font-semibold text-[#7dd3fc]">المجموعة التسويقية</span>
          <span
            className={cn(
              'block font-black leading-snug text-white',
              compact ? 'text-base' : 'text-lg sm:text-xl',
            )}
          >
            {AMBASSADOR_TELEGRAM_GROUP_NAME_AR}
          </span>
          {!compact ? (
            <span className="mt-1 block text-xs leading-relaxed text-slate-300">
              {AMBASSADOR_TELEGRAM_GROUP_HINT_AR}
            </span>
          ) : null}
          <span
            className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-black/25 px-2 py-0.5 font-mono text-[11px] text-[#bae6fd]"
            dir="ltr"
          >
            t.me/{AMBASSADOR_TELEGRAM_GROUP_HANDLE}
          </span>
        </span>
      </span>

      <span
        className={cn(
          'inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#229ED9] font-bold text-white transition group-hover:bg-[#1b8fc7] sm:w-auto sm:shrink-0',
          compact ? 'px-3 py-2.5 text-xs' : 'px-4 py-3 text-sm',
        )}
      >
        {AMBASSADOR_TELEGRAM_GROUP_CTA_AR}
        <ExternalLink className="h-3.5 w-3.5 opacity-90" aria-hidden />
      </span>
    </a>
  );
}
