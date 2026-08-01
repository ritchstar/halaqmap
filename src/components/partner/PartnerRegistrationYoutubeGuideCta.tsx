/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { SiYoutube } from 'react-icons/si';
import { PARTNER_REGISTRATION_FORM_YOUTUBE_GUIDE } from '@/config/partnerRegistrationYoutubeGuide';
import { cn } from '@/lib/utils';

type Variant = 'header' | 'form';

/**
 * رابط خارجي لفيديو شرح التعبئة — لا يمس حقول النموذج ولا مسار الإرسال.
 * التلوين متناسق مع شريط الدليل/واتساب: خلفية داكنة + حدّ خفيف (بدون تعبئة حمراء صارخة).
 */
export function PartnerRegistrationYoutubeGuideCta({
  variant = 'form',
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const { url, labelAr, onYoutubeAr } = PARTNER_REGISTRATION_FORM_YOUTUBE_GUIDE;
  const isHeader = variant === 'header';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${labelAr} — ${onYoutubeAr}`}
      aria-label={`${labelAr} — ${onYoutubeAr}`}
      className={cn(
        'group inline-flex items-center gap-2.5 rounded-xl border font-bold transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020912]',
        'active:scale-[0.98]',
        isHeader
          ? 'max-w-[min(52vw,15.5rem)] border-rose-400/25 bg-rose-500/[0.08] px-2 py-1.5 text-[0.62rem] text-rose-100/95 hover:bg-rose-500/[0.12] sm:max-w-none sm:px-2.5 sm:text-[0.68rem]'
          : 'w-full justify-between border-rose-400/22 bg-rose-500/[0.07] px-3 py-2.5 text-xs text-rose-100/95 hover:bg-rose-500/[0.11] sm:px-4 sm:text-sm',
        className,
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden
          className={cn(
            'flex shrink-0 items-center justify-center rounded-lg border border-rose-400/35 bg-rose-500/20 text-rose-100',
            isHeader ? 'h-6 w-6' : 'h-8 w-8',
          )}
        >
          <SiYoutube className={cn(isHeader ? 'h-3.5 w-3.5' : 'h-4 w-4', 'text-[#e11d48]/90')} />
        </span>
        <span className="min-w-0 text-right leading-snug">
          <span className="block truncate font-bold text-rose-100/95">{labelAr}</span>
          <span className="mt-0.5 block text-[0.55rem] font-semibold text-slate-400 sm:text-[0.65rem]">
            {onYoutubeAr}
          </span>
        </span>
      </span>
      {!isHeader ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-400/30 bg-rose-500/15 px-2.5 py-1.5 text-[0.65rem] font-bold text-rose-100/90 sm:text-xs">
          مشاهدة
        </span>
      ) : null}
    </a>
  );
}
