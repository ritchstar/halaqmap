/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { MouseEvent, PointerEvent } from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOYASAR_OFFICIAL_SITE_AR_URL,
  MOYASAR_TRUST_CHIP_ARIA_AR,
  MOYASAR_TRUST_CHIP_CTA_AR,
  MOYASAR_TRUST_CHIP_HINT_AR,
  MOYASAR_TRUST_CHIP_TITLE_AR,
} from '@/config/moyasarPublicTrust';

type Props = {
  className?: string;
  /** compact: بجوار خيار الدفع · banner: فوق نموذج البطاقة */
  variant?: 'compact' | 'banner';
};

/** مصغّر بصري مستوحى من هوية ميسر الداكنة — ليس شعاراً رسمياً محمّلاً من موقعهم */
function MoyasarMiniPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-11 w-[3.35rem] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#12141a] shadow-inner',
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(125,180,255,0.22),transparent_55%)]" />
      <svg viewBox="0 0 40 28" className="relative h-7 w-9" fill="none">
        <path
          d="M8 18c2.2-6.5 5.2-10 8.4-10 2.4 0 3.8 2.2 5.2 5.4C23.4 9.4 25.2 8 27.4 8c3 0 5.2 3.2 6.6 10"
          stroke="#d4b896"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M10 20c1.6-4.2 3.6-6.4 5.8-6.4 1.6 0 2.6 1.5 3.6 3.6 1.2-2.5 2.5-3.6 4.1-3.6 2.1 0 3.7 2.2 4.7 6.4"
          stroke="#9ec0ff"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}

/**
 * شارة اطمئنان: تعرّف العميل على ميسر عبر موقعها الرسمي في تبويب مستقل
 * دون مغادرة مسار الدفع (يمكنه العودة لنفس الصفحة).
 */
export function MoyasarOfficialTrustChip({ className, variant = 'compact' }: Props) {
  /** يمنع تبديل اختيار الراديو دون تعطيل فتح الرابط */
  const stopLabelToggle = (e: MouseEvent | PointerEvent) => {
    e.stopPropagation();
  };

  if (variant === 'banner') {
    return (
      <a
        href={MOYASAR_OFFICIAL_SITE_AR_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={MOYASAR_TRUST_CHIP_ARIA_AR}
        onClick={stopLabelToggle}
        onPointerDown={stopLabelToggle}
        className={cn(
          'group flex items-start gap-3 rounded-xl border border-sky-400/25 bg-gradient-to-l from-[#0f141c] via-[#121820] to-sky-950/30 p-3 no-underline transition-colors hover:border-sky-300/45 hover:bg-sky-950/20 sm:items-center sm:p-3.5',
          className,
        )}
      >
        <MoyasarMiniPreview className="h-12 w-16 sm:h-14 sm:w-[4.5rem]" />
        <div className="min-w-0 flex-1 text-right">
          <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-sky-100 sm:text-base">
            <ShieldCheck className="h-4 w-4 shrink-0 text-sky-300" aria-hidden />
            {MOYASAR_TRUST_CHIP_TITLE_AR}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">{MOYASAR_TRUST_CHIP_HINT_AR}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-sky-300 group-hover:text-sky-200">
            {MOYASAR_TRUST_CHIP_CTA_AR}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </a>
    );
  }

  return (
    <a
      href={MOYASAR_OFFICIAL_SITE_AR_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={MOYASAR_TRUST_CHIP_ARIA_AR}
      title={MOYASAR_TRUST_CHIP_HINT_AR}
      onClick={stopLabelToggle}
      onPointerDown={stopLabelToggle}
      className={cn(
        'group flex max-w-[9.5rem] shrink-0 flex-col items-center gap-1 rounded-xl border border-sky-400/30 bg-[#12141a] px-2 py-2 text-center no-underline shadow-sm transition-all hover:border-sky-300/55 hover:bg-[#171b24] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 sm:max-w-[10.5rem]',
        className,
      )}
    >
      <MoyasarMiniPreview />
      <span className="text-[0.7rem] font-bold leading-tight text-sky-100 sm:text-xs">
        {MOYASAR_TRUST_CHIP_TITLE_AR}
      </span>
      <span className="inline-flex items-center gap-0.5 text-[0.65rem] font-semibold text-sky-300/95 group-hover:text-sky-200">
        {MOYASAR_TRUST_CHIP_CTA_AR}
        <ExternalLink className="h-3 w-3" aria-hidden />
      </span>
    </a>
  );
}
