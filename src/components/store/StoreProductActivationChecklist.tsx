/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * «ابدأ قيادة منتجك» — قائمة تفعيل مشتركة تظهر أعلى لوحة أي منتج مباشرة بعد
 * الدفع أو أول دخول، وتبقى ظاهرة حتى اكتمال الإعداد الحقيقي.
 *
 * مبدأ التصميم: هذا المكوّن لا يعرف شيئاً عن بيانات أي منتج. كل خطوة تصل إليه
 * ومعها `done: boolean` جاهزة — محسوبة في لوحة المنتج نفسها من بيانات حقيقية
 * (شعار مرفوع، رف محفوظ فعلياً، موقع مُبرز، ساعات مفعّلة...). لا يوجد هنا أي
 * تخزين محلي ولا علامة «إنجاز يدوية» يضغطها المشغّل — العرض بأكمله مشتق من
 * الحالة الحقيقية التي يمررها المنتج. بعد اكتمال كل الخطوات، يتحوّل المكوّن
 * (لا يختفي) إلى مدخل دائم لـ«دليل قيادة [اسم المنتج]» بأقسامه الأربعة الثابتة:
 * شغّل / سوّق / طوّر / اطلب مساعدة — بنفس الأسماء في كل منتج يستخدم هذا المكوّن.
 */
import { CheckCircle2, Circle, Compass, HelpCircle, Sparkles, TrendingUp, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StoreActivationStepView = {
  id: string;
  titleAr: string;
  actionLabelAr: string;
  onAction: () => void;
  done: boolean;
};

export type StoreDrivingGuideActions = {
  runAr: string;
  onRun: () => void;
  marketAr: string;
  onMarket: () => void;
  growAr: string;
  onGrow: () => void;
  onHelp: () => void;
};

export function StoreProductActivationChecklist({
  productNameAr,
  accent,
  steps,
  guide,
}: {
  productNameAr: string;
  accent: string;
  steps: StoreActivationStepView[];
  guide: StoreDrivingGuideActions;
}) {
  const doneCount = steps.filter((step) => step.done).length;
  const complete = steps.length > 0 && doneCount === steps.length;

  if (complete) {
    return (
      <section
        className="store-driving-guide-card mb-6 rounded-2xl border bg-white/95 p-4 sm:p-5"
        style={{ borderColor: `${accent}45` }}
        aria-label={`دليل قيادة ${productNameAr}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 shrink-0" style={{ color: accent }} aria-hidden />
            <p className="text-sm font-black" style={{ color: accent }}>
              دليل قيادة {productNameAr}
            </p>
          </div>
          <p className="text-xs text-[#849284]">نشاطك جاهز — أدر التشغيل والتسويق والتطوير من هنا.</p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          <GuideLinkButton icon={Wrench} labelAr={guide.runAr} onClick={guide.onRun} accent={accent} />
          <GuideLinkButton icon={TrendingUp} labelAr={guide.marketAr} onClick={guide.onMarket} accent={accent} />
          <GuideLinkButton icon={Sparkles} labelAr={guide.growAr} onClick={guide.onGrow} accent={accent} />
          <GuideLinkButton icon={HelpCircle} labelAr="اطلب مساعدة" onClick={guide.onHelp} accent={accent} />
        </div>
      </section>
    );
  }

  return (
    <section
      className="store-activation-checklist mb-6 rounded-2xl border bg-white/95 p-4 sm:p-5"
      style={{ borderColor: `${accent}45` }}
      aria-label="ابدأ قيادة منتجك"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black" style={{ color: accent }}>
          ابدأ قيادة منتجك
        </p>
        <p className="text-xs font-bold text-[#849284]">
          {doneCount} من {steps.length} مكتملة
        </p>
      </div>
      <p className="mt-1 text-xs leading-6 text-[#758374]">
        أكمل هذه الخطوات لتجهيز {productNameAr} فعلياً لاستقبال أول زبون. كل خطوة تُعلَّم تلقائياً عند إتمامها فعلياً.
      </p>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#eef0e3]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${steps.length ? (doneCount / steps.length) * 100 : 0}%`, backgroundColor: accent }}
        />
      </div>

      <ul className="mt-4 space-y-2">
        {steps.map((step) => (
          <li
            key={step.id}
            className={cn(
              'flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3',
              step.done ? 'border-transparent bg-[#f4f8f1]' : 'border-[#dfe4d6] bg-white',
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: accent }} aria-hidden />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-[#c3ccc0]" aria-hidden />
              )}
              <span className={cn('text-sm font-bold', step.done ? 'text-[#849284] line-through' : 'text-[#20352b]')}>
                {step.titleAr}
              </span>
            </div>
            {step.done ? (
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black" style={{ color: accent }}>
                تم
              </span>
            ) : (
              <button
                type="button"
                onClick={step.onAction}
                className="rounded-full px-3 py-1.5 text-xs font-black text-white"
                style={{ backgroundColor: accent }}
              >
                {step.actionLabelAr}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function GuideLinkButton({
  icon: Icon,
  labelAr,
  onClick,
  accent,
}: {
  icon: typeof Wrench;
  labelAr: string;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-xl border border-[#dfe4d6] bg-white px-3 py-2.5 text-xs font-black text-[#20352b] hover:bg-[#f7faf5]"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} aria-hidden />
      {labelAr}
    </button>
  );
}
