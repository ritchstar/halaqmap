import { SiYoutube } from 'react-icons/si';
import { PARTNER_REGISTRATION_FORM_YOUTUBE_GUIDE } from '@/config/partnerRegistrationYoutubeGuide';
import { cn } from '@/lib/utils';

type Variant = 'header' | 'form';

/**
 * رابط خارجي لفيديو شرح التعبئة — لا يمس حقول النموذج ولا مسار الإرسال.
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
        'group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border font-bold transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020912]',
        'active:scale-[0.98]',
        isHeader
          ? 'max-w-[min(52vw,15.5rem)] border-red-400/45 bg-red-600/25 px-2 py-1.5 text-[0.62rem] text-red-50 shadow-[0_0_18px_rgba(239,68,68,0.45)] sm:max-w-none sm:px-2.5 sm:text-[0.68rem]'
          : 'w-full justify-center border-red-400/50 bg-gradient-to-l from-red-600/35 via-red-500/20 to-red-600/35 px-3 py-2.5 text-xs text-red-50 shadow-[0_0_28px_rgba(239,68,68,0.4)] sm:text-sm',
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-red-400/20 to-transparent"
      />
      <span
        aria-hidden
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-lg bg-[#FF0000] text-white shadow-[0_0_12px_rgba(255,0,0,0.75)]',
          isHeader ? 'h-6 w-6' : 'h-8 w-8',
        )}
      >
        <SiYoutube className={isHeader ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
      </span>
      <span className="relative min-w-0 text-right leading-snug">
        <span className="block truncate drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]">{labelAr}</span>
        <span className="mt-0.5 block text-[0.55rem] font-semibold text-red-200/90 sm:text-[0.6rem]">
          {onYoutubeAr}
        </span>
      </span>
    </a>
  );
}
