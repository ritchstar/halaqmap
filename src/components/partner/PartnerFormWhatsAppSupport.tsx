import type { ReactNode } from 'react';
import { SiWhatsapp } from 'react-icons/si';
import { PARTNER_SUPPORT_PHONE_E164 } from '@/config/partnerLegal';
import { cn } from '@/lib/utils';

export type PartnerFormWhatsAppContext = 'register' | 'bronze-trial';

type Props = {
  context: PartnerFormWhatsAppContext;
  /** dark = صفحة التسجيل الداكنة · light = صفحة التجربة */
  variant?: 'dark' | 'light';
  children: ReactNode;
  className?: string;
};

const PREFILL: Record<PartnerFormWhatsAppContext, string> = {
  register:
    'مرحباً دعم حلاق ماب، أحتاج مساعدة لإكمال تعبئة طلب التسجيل واختيار الباقة على المنصة.',
  'bronze-trial':
    'مرحباً دعم حلاق ماب، أحتاج مساعدة لإكمال طلب التجربة المجانية (برونزي).',
};

const TITLE: Record<PartnerFormWhatsAppContext, string> = {
  register: 'مساندة أثناء تعبئة الطلب',
  'bronze-trial': 'مساندة أثناء طلب التجربة',
};

function buildWhatsAppHref(context: PartnerFormWhatsAppContext): string {
  const text = encodeURIComponent(PREFILL[context]);
  return `https://wa.me/${PARTNER_SUPPORT_PHONE_E164}?text=${text}`;
}

/**
 * يغلّف مربع التعبئة بدعم واتساب دون تقليص عرض النموذج:
 * شريط أفقي مضغوط أعلى النموذج + زر عائم على الجوال أثناء التمرير.
 */
export function PartnerFormWhatsAppSupport({
  context,
  variant = 'dark',
  children,
  className,
}: Props) {
  const href = buildWhatsAppHref(context);
  const isDark = variant === 'dark';

  return (
    <div className={cn('relative w-full', className)}>
      <div
        className={cn(
          'mb-3 flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 sm:px-4',
          isDark
            ? 'border-emerald-400/20 bg-emerald-500/[0.07]'
            : 'border-emerald-300/60 bg-emerald-50',
        )}
        aria-label="الدعم الفني عبر واتساب"
      >
        <div className="min-w-0 text-right">
          <p
            className={cn(
              'text-xs font-bold sm:text-sm',
              isDark ? 'text-emerald-200' : 'text-emerald-900',
            )}
          >
            {TITLE[context]}
          </p>
          <p
            className={cn(
              'mt-0.5 text-[0.65rem] leading-snug sm:text-xs',
              isDark ? 'text-slate-400' : 'text-slate-600',
            )}
          >
            تحتاج مساعدة لإكمال الخطوات؟ راسل الدعم عبر واتساب.
          </p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-[0.7rem] font-bold text-white shadow-[0_6px_16px_rgba(37,211,102,0.28)] transition hover:bg-[#1ebe57] active:scale-[0.98] sm:px-3.5 sm:text-xs"
        >
          <SiWhatsapp className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
          دعم واتساب
        </a>
      </div>

      <div className="min-w-0 w-full">{children}</div>

      {/* زر عائم أثناء التمرير في النموذج الطويل — جوال/تابلت */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-[55] inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_28px_rgba(37,211,102,0.35)] transition hover:bg-[#1ebe57] active:scale-[0.97] lg:hidden"
        aria-label="الدعم الفني عبر واتساب"
      >
        <SiWhatsapp className="h-5 w-5 shrink-0" aria-hidden />
        دعم فني
      </a>
    </div>
  );
}
