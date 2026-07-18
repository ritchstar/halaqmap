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
 * يغلّف مربع تعبئة الطلب/التجربة بدعم واتساب:
 * شريط أعلى النموذج على الجوال، بطاقة لاصقة بجانبه على الشاشات العريضة، وزر عائم أثناء التمرير.
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
    <div className={cn('relative', className)}>
      {/* شريط مختصر فوق النموذج — جوال/تابلت صغير */}
      <div
        className={cn(
          'mb-3 flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 lg:hidden',
          isDark
            ? 'border-emerald-400/20 bg-emerald-500/[0.07]'
            : 'border-emerald-300/60 bg-emerald-50',
        )}
      >
        <div className="min-w-0 text-right">
          <p
            className={cn(
              'text-xs font-bold',
              isDark ? 'text-emerald-200' : 'text-emerald-900',
            )}
          >
            دعم فني واتساب
          </p>
          <p className={cn('text-[0.65rem]', isDark ? 'text-slate-400' : 'text-slate-600')}>
            لمساندتك إن لزم أثناء التعبئة
          </p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-[0.7rem] font-bold text-white"
        >
          <SiWhatsapp className="h-3.5 w-3.5" aria-hidden />
          تواصل
        </a>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_13.5rem] lg:items-start lg:gap-4">
        <div className="min-w-0">{children}</div>

        {/* بطاقة بجانب مربع التعبئة — سطح المكتب */}
        <aside
          className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
          aria-label="الدعم الفني عبر واتساب"
        >
          <div
            className={cn(
              'rounded-2xl border p-4 shadow-lg',
              isDark
                ? 'border-emerald-400/25 bg-emerald-500/[0.08] text-slate-100'
                : 'border-emerald-300/70 bg-emerald-50 text-slate-900 shadow-emerald-900/5',
            )}
          >
            <div
              className={cn(
                'mb-3 flex h-10 w-10 items-center justify-center rounded-xl',
                isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700',
              )}
            >
              <SiWhatsapp className="h-5 w-5" aria-hidden />
            </div>
            <p className={cn('text-sm font-black', isDark ? 'text-white' : 'text-slate-900')}>
              {TITLE[context]}
            </p>
            <p
              className={cn(
                'mt-1.5 text-[0.7rem] leading-relaxed',
                isDark ? 'text-slate-400' : 'text-slate-600',
              )}
            >
              هل احتجت مساعدة لإكمال الخطوات؟ راسل الدعم الفني عبر واتساب وسنساندك خطوة بخطوة.
            </p>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(37,211,102,0.28)] transition hover:bg-[#1ebe57] active:scale-[0.98]"
            >
              <SiWhatsapp className="h-4 w-4 shrink-0" aria-hidden />
              دعم واتساب
            </a>
          </div>
        </aside>
      </div>

      {/* زر عائم أثناء التمرير في النموذج الطويل */}
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
