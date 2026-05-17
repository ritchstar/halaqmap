import { cn } from '@/lib/utils';

type IconProps = { className?: string };

/** أيقونات أحادية اللون لوسائل الدفع المعتمدة في السعودية. */
export function MadaBadgeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 72 24"
      className={cn('h-5 w-auto', className)}
      aria-hidden
      fill="currentColor"
    >
      <rect x="0.5" y="0.5" width="71" height="23" rx="4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <text x="36" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif">
        mada
      </text>
    </svg>
  );
}

export function ApplePayBadgeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 56 24" className={cn('h-5 w-auto', className)} aria-hidden fill="currentColor">
      <path d="M14.2 5.1c-.7.8-1.8 1.4-2.9 1.3-.1-1.2.5-2.4 1.1-3.1.7-.9 1.9-1.5 2.8-1.6.1 1.3-.4 2.5-1 3.4zm-.9 1.6c-1.6-.1-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2 1 1.4 2.1 3 3.6 2.9 1.4-.1 2-.9 3.7-.9 1.7 0 2.2.9 3.7.9 1.5 0 2.5-1.3 3.5-2.7.6-.9 1.3-1.9 1.7-3.1-3.4-1.3-2.8-6.2.5-7.4-.9-1.1-2.3-1.9-3.6-1.9z" />
      <text x="22" y="16" fontSize="10.5" fontWeight="600" fontFamily="system-ui, sans-serif">
        Pay
      </text>
    </svg>
  );
}

export function VisaMastercardBadgeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 72 24" className={cn('h-5 w-auto', className)} aria-hidden>
      <circle cx="28" cy="12" r="8" fill="currentColor" opacity="0.85" />
      <circle cx="36" cy="12" r="8" fill="currentColor" opacity="0.45" />
      <text x="50" y="16" fontSize="9" fontWeight="700" fill="currentColor" fontFamily="system-ui, sans-serif">
        VISA
      </text>
    </svg>
  );
}

export function PaymentMethodBadgeRow({ className }: IconProps) {
  return (
    <div
      className={cn('flex flex-wrap items-center justify-center gap-4 opacity-70', className)}
      aria-label="وسائل الدفع: مدى، Apple Pay، Visa و Mastercard"
    >
      <MadaBadgeIcon />
      <ApplePayBadgeIcon />
      <VisaMastercardBadgeIcon />
    </div>
  );
}
