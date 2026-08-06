/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { AlertCircle } from 'lucide-react';
import {
  DIGITAL_SHIFT_MONTHLY_ADDON_SAR,
  DIGITAL_SHIFT_PRODUCT_NAME_AR,
  DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR,
} from '@/config/subscriptionPricing';
import { listingLicenseDaysForQuantity } from '@/config/listingLicenseQuantity';

export type PaymentLicenseTotalPanelProps = {
  tierLabel: string;
  /** سعر الحزمة الواحدة (شامل إضافة المناوب إن وُجدت) */
  unitSar: number;
  quantity: number;
  digitalShiftAddon: boolean;
  breakdown: { subtotal: number; vat: number; total: number };
  vatEnabled: boolean;
  vatPercent: number;
  /**
   * المبلغ الفعلي المُرسل للبوابة (وحدة داخلية) — للمطابقة فقط، لا يُعرض للعميل.
   */
  chargedHalalas: number;
};

function formatSar(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

/**
 * لوحة حسبة الرخصة — بارزة ومقروءة بالريال فقط (التسعير الداخلي لا يُعرض للعميل).
 */
export function PaymentLicenseTotalPanel({
  tierLabel,
  unitSar,
  quantity,
  digitalShiftAddon,
  breakdown,
  vatEnabled,
  vatPercent,
  chargedHalalas,
}: PaymentLicenseTotalPanelProps) {
  const days = listingLicenseDaysForQuantity(quantity);
  const expectedHalalas = Math.max(100, Math.round(breakdown.total * 100));
  const integrityOk = expectedHalalas === chargedHalalas;
  const chargedSar = chargedHalalas / 100;
  const baseUnitWithoutAddon = digitalShiftAddon
    ? unitSar - DIGITAL_SHIFT_MONTHLY_ADDON_SAR
    : unitSar;

  return (
    <div className="space-y-4 rounded-xl border-2 border-primary/45 bg-gradient-to-b from-primary/12 via-background to-background p-4 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-primary sm:text-sm">الحسبة</p>
        <h3 className="mt-1 text-xl font-black text-foreground sm:text-2xl">{tierLabel}</h3>
        <p className="mt-1 text-base text-foreground/90 sm:text-lg">
          حزمة إدراج برمجية — {days} يوماً نفاذاً ({quantity} × 30 يوماً)
        </p>
      </div>

      <dl className="space-y-2.5 text-base text-foreground sm:text-lg">
        <div className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2">
          <dt className="font-medium">سعر الحزمة الواحدة</dt>
          <dd className="font-bold tabular-nums">
            {formatSar(unitSar)} <span className="text-sm font-semibold sm:text-base">ر.س</span>
          </dd>
        </div>
        {digitalShiftAddon ? (
          <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm leading-relaxed sm:text-base">
            <p className="font-semibold text-primary">
              {DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR} · {DIGITAL_SHIFT_PRODUCT_NAME_AR}
            </p>
            <p className="mt-1 text-foreground/90">
              أساس الحزمة {formatSar(baseUnitWithoutAddon)} ر.س + إضافة{' '}
              {DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س = {formatSar(unitSar)} ر.س للحزمة
            </p>
          </div>
        ) : null}
        <div className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2">
          <dt className="font-medium">عدد الحزم</dt>
          <dd className="font-bold tabular-nums">{quantity}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2">
          <dt className="font-medium">
            قيمة الرخصة ({formatSar(unitSar)} × {quantity})
          </dt>
          <dd className="font-bold tabular-nums">
            {formatSar(breakdown.subtotal)}{' '}
            <span className="text-sm font-semibold sm:text-base">ر.س</span>
          </dd>
        </div>
        {vatEnabled && breakdown.vat > 0 ? (
          <div className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2">
            <dt className="font-medium">ضريبة القيمة المضافة ({vatPercent}%)</dt>
            <dd className="font-bold tabular-nums">
              {formatSar(breakdown.vat)}{' '}
              <span className="text-sm font-semibold sm:text-base">ر.س</span>
            </dd>
          </div>
        ) : (
          <p className="text-sm font-medium text-foreground/80 sm:text-base">
            دون ضريبة قيمة مضافة على هذا الطلب حالياً
          </p>
        )}
      </dl>

      <div className="rounded-xl border-2 border-primary/50 bg-primary/15 px-4 py-4 text-center sm:px-6 sm:py-5">
        <p className="text-sm font-bold text-primary sm:text-base">المبلغ المستحق للدفع الآن</p>
        <p className="mt-1 text-4xl font-black tabular-nums tracking-tight text-foreground sm:text-5xl">
          {formatSar(breakdown.total)}
          <span className="mr-2 text-xl font-bold sm:text-2xl">ر.س</span>
        </p>
        {integrityOk ? (
          <p className="mt-2 text-sm font-semibold text-foreground/90 sm:text-base">
            يُخصم عبر البوابة: {formatSar(chargedSar)} ر.س
          </p>
        ) : null}
      </div>

      {!integrityOk ? (
        <div
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            تعذّر مطابقة الحسبة مع مبلغ البوابة. أعد تحميل الصفحة قبل الدفع. (معروض{' '}
            {formatSar(breakdown.total)} ر.س · مُمرَّر {formatSar(chargedSar)} ر.س)
          </p>
        </div>
      ) : (
        <p className="text-center text-sm font-medium text-emerald-800 dark:text-emerald-300 sm:text-base">
          تم التحقق: المبلغ المعروض يطابق ما ستخصمه بوابة الدفع
        </p>
      )}
    </div>
  );
}
