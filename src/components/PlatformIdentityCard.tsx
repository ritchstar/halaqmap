/**
 * PlatformIdentityCard — بطاقة هوية المنصة
 * تصميم مُحكَم: نص سلس · نقاط واضحة · جمالية متناسقة مع ستايل المنصة
 */

import { CheckCircle2, XCircle, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  compact?: boolean;
  className?: string;
};

const IS_POINTS = [
  'مزوّد حلول تقنية (Technical Solutions Provider)',
  'بائع رخص إدراج رقمية مسبقة الدفع',
  'مشغّل نظام رصد جغرافي ذكي للبحث',
  'طرف تقني بين الصالون والعميل',
];

const IS_NOT_POINTS = [
  'وسيط تجاري أو وكيل حجز بعمولة',
  'مزوّد خدمة بدنية (حلاقة أو قص)',
  'طرف في التعاقد بين الصالون والعميل',
  'مسؤول عن جودة أو أسعار الصالون',
];

const PROOF_POINTS = [
  { icon: '🛒', text: 'المنتج: رخصة نفاذ رقمية مسبقة الدفع (برونزي · ذهبي · ماسي) — لا عقد خدمة حلاقة' },
  { icon: '💰', text: 'لا عمولة على القص — الصالون يحدد أسعاره بالكامل' },
  { icon: '🤝', text: 'العلاقة مع العميل مباشرة بين الصالون والزبون — المنصة طرف تقني فقط' },
  { icon: '🔍', text: 'البحث مجاني للمستخدمين — الإيرادات من بيع المنتجات الرقمية B2B' },
];

export function PlatformIdentityCard({ compact, className }: Props) {
  return (
    <div
      dir="rtl"
      className={cn(
        'overflow-hidden rounded-2xl border border-teal-400/20 bg-gradient-to-b from-[#050f1a] to-[#020912]',
        'shadow-[0_0_30px_rgba(20,184,166,0.08)] ring-1 ring-teal-400/10',
        className,
      )}
    >
      {/* Top accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />

      {/* ── Header ─────────────────────────────────────── */}
      <div className="px-5 pb-3 pt-5">
        {/* Badge */}
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1">
          <Shield className="h-3.5 w-3.5 text-teal-400" />
          <span className="text-[0.65rem] font-black tracking-widest text-teal-300 uppercase">
            مزوّد حلول تقنية — لا وسيط تجاري
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-black leading-snug text-white md:text-2xl">
          حلاق ماب — ما هي وما ليست
        </h2>

        {/* Brief summary */}
        <p className="mt-2 text-sm leading-relaxed text-slate-400 md:text-[0.9rem]">
          المنصة تبيع <strong className="text-teal-300">رخصة إدراج رقمية</strong> تُمكِّن الصالون من الظهور عند الطلب —
          لا تحجز نيابةً عن أحد ولا تأخذ عمولة على الخدمة.
        </p>
      </div>

      {/* ── Comparison grid ─────────────────────────────── */}
      <div className="grid gap-3 px-5 md:grid-cols-2">

        {/* IS */}
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/8 p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-black text-emerald-300">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            ما هي المنصة
          </h4>
          <ul className="space-y-2">
            {IS_POINTS.map((line) => (
              <li key={line} className="flex items-start gap-2 text-[0.78rem] leading-snug text-slate-300">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        {/* IS NOT */}
        <div className="rounded-xl border border-rose-400/20 bg-rose-500/6 p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-black text-rose-300">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20">
              <XCircle className="h-3.5 w-3.5 text-rose-400" />
            </div>
            ما ليست المنصة
          </h4>
          <ul className="space-y-2">
            {IS_NOT_POINTS.map((line) => (
              <li key={line} className="flex items-start gap-2 text-[0.78rem] leading-snug text-slate-400">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Proof points (non-compact only) ──────────────── */}
      {!compact && (
        <div className="mx-5 mb-5 mt-3 rounded-xl border border-white/8 bg-white/[0.025] p-4">
          <h4 className="mb-3 flex items-center gap-2 text-[0.8rem] font-black text-slate-300">
            <Zap className="h-3.5 w-3.5 text-teal-400" />
            باختصار — الثوابت الأربعة
          </h4>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {PROOF_POINTS.map((p) => (
              <div key={p.icon} className="flex items-start gap-2.5">
                <span className="mt-0.5 text-base leading-none">{p.icon}</span>
                <p className="text-[0.73rem] leading-relaxed text-slate-400">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-teal-400/20 to-transparent" />
    </div>
  );
}
