import { useCallback, useState } from 'react';
import { BadgeCheck, Check, Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';
import {
  LEGAL_ECOMMERCE_INQUIRY_COPY_HINT_AR,
  LEGAL_ECOMMERCE_INQUIRY_URL,
  LEGAL_ECOMMERCE_VERIFIED_BADGE_AR,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
  LEGAL_SBC_LOGO_SRC,
  LEGAL_UNIFIED_NUMBER_LABEL_AR,
} from '@/config/partnerLegal';

type Variant = 'light' | 'dark' | 'landing';

type EcommerceVerifiedFooterBadgeProps = {
  variant?: Variant;
  className?: string;
};

/**
 * شارة توثيق التجارة الإلكترونية — شعار المركز السعودي للأعمال + رابط الاستعلام + رقم موحّد قابل للنسخ.
 */
export function EcommerceVerifiedFooterBadge({
  variant = 'light',
  className,
}: EcommerceVerifiedFooterBadgeProps) {
  const [copied, setCopied] = useState(false);

  const copyUnifiedNumber = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(LEGAL_NATIONAL_UNIFIED_NUMBER);
      setCopied(true);
      toast.success('تم نسخ الرقم الوطني الموحد');
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error('تعذّر النسخ — انسخ الرقم يدوياً');
    }
  }, []);

  const shellClass =
    variant === 'dark'
      ? 'border-white/15 bg-white/[0.06]'
      : variant === 'landing'
        ? 'border-white/12 bg-white/[0.05]'
        : 'border-border/60 bg-background/80';

  const labelClass =
    variant === 'light' ? 'text-muted-foreground' : 'text-white/72';

  const numberClass =
    variant === 'light' ? 'text-foreground' : 'text-white/92';

  const hintClass =
    variant === 'light' ? 'text-muted-foreground/90' : 'text-white/58';

  const copyBtnClass =
    variant === 'light'
      ? 'border-border/70 bg-muted/50 text-foreground hover:bg-muted'
      : 'border-white/20 bg-white/10 text-white/90 hover:bg-white/15';

  const verifiedBadgeClass =
    variant === 'light'
      ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800'
      : 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100';

  return (
    <div
      className={cn(
        'mx-auto w-full max-w-md rounded-xl border px-4 py-4 sm:px-5 sm:py-5',
        shellClass,
        className,
      )}
      aria-label="توثيق التجارة الإلكترونية — متجر موثّق"
    >
      <div className="flex flex-col items-center gap-3">
        <a
          href={LEGAL_ECOMMERCE_INQUIRY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex flex-col items-center gap-2 rounded-lg outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-emerald-400/60"
          title="الاستعلام عن متجر إلكتروني موثّق — المركز السعودي للأعمال"
        >
          <span className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 shadow-sm ring-1 ring-black/5">
            <img
              src={LEGAL_SBC_LOGO_SRC}
              alt="المركز السعودي للأعمال — Saudi Business Center"
              width={266}
              height={80}
              className="h-10 w-auto max-w-[min(100%,240px)] object-contain sm:h-11"
              loading="lazy"
              decoding="async"
            />
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide',
              verifiedBadgeClass,
            )}
          >
            <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {LEGAL_ECOMMERCE_VERIFIED_BADGE_AR}
            <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
          </span>
        </a>

        <div className="w-full space-y-2 text-center">
          <p className={cn('text-xs leading-relaxed sm:text-sm', labelClass)}>
            {LEGAL_UNIFIED_NUMBER_LABEL_AR}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <code
              dir="ltr"
              className={cn(
                'rounded-md border border-dashed px-3 py-1.5 font-mono text-sm font-semibold tracking-wide sm:text-base',
                variant === 'light'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-emerald-400/35 bg-emerald-500/10',
                numberClass,
              )}
            >
              {LEGAL_NATIONAL_UNIFIED_NUMBER}
            </code>
            <button
              type="button"
              onClick={() => void copyUnifiedNumber()}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 sm:text-sm',
                copyBtnClass,
              )}
              aria-label="نسخ الرقم الوطني الموحد"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  تم النسخ
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                  نسخ
                </>
              )}
            </button>
          </div>
          <p className={cn('text-[0.68rem] leading-relaxed sm:text-xs', hintClass)}>
            {LEGAL_ECOMMERCE_INQUIRY_COPY_HINT_AR}
          </p>
        </div>
      </div>
    </div>
  );
}
