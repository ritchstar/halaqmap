import { forwardRef } from 'react';
import type { SubscriptionInvoicePreviewPayload } from '@/lib/subscriptionInvoicePreviewData';
import { INVOICE_PRODUCT_DESCRIPTION_EN } from '@/config/softwareLicenseTerminology';

const brandTeal = '#0d9488';

type Props = {
  payload: SubscriptionInvoicePreviewPayload;
};

export const SubscriptionInvoiceSlip = forwardRef<HTMLDivElement, Props>(function SubscriptionInvoiceSlipInner(
  { payload },
  ref
) {
  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div
      ref={ref}
      className="relative box-border w-[800px] overflow-hidden bg-white p-10 text-slate-900 shadow-sm"
      dir="rtl"
      style={{ fontFamily: 'Tajawal, "IBM Plex Sans Arabic", Tahoma, sans-serif' }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
        aria-hidden
      >
        <div
          className="select-none text-[120px] font-black leading-none text-slate-400/10"
          style={{ transform: 'rotate(-28deg)' }}
        >
          {payload.watermarkAr} · {payload.watermarkEn}
        </div>
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex items-start justify-between gap-6 border-b-4 pb-5" style={{ borderColor: brandTeal }}>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: brandTeal }}>
              حلاق ماب
            </h1>
            <p className="text-sm font-medium text-slate-600 dir-ltr text-left">Halaq Map</p>
            <p className="pt-2 text-lg font-semibold text-slate-800">فاتورة تفعيل الحزمة البرمجية</p>
            <p className="text-xs text-slate-500 dir-ltr text-left leading-relaxed">{INVOICE_PRODUCT_DESCRIPTION_EN}</p>
          </div>
          <div className="min-w-[200px] space-y-1 rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">رقم الفاتورة</span>
              <span className="font-mono text-xs dir-ltr" dir="ltr">
                {payload.invoiceNo}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">تاريخ الإصدار</span>
              <span className="dir-ltr text-left font-mono text-xs" dir="ltr">
                {payload.issueIso}
              </span>
            </div>
            <div className="text-xs text-slate-600">{payload.issueArLong}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-lg border border-slate-200 p-4">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">العميل / Bill to</h2>
            <p className="text-base font-semibold text-slate-900">{payload.billTo.nameAr}</p>
            <p className="text-sm text-slate-600 dir-ltr text-left">{payload.billTo.nameEn}</p>
            <p className="mt-2 text-sm text-slate-700">{payload.billTo.districtAr}</p>
            <p className="text-xs text-slate-600">{payload.billTo.cityCountryAr}</p>
            <p className="text-xs text-slate-500 dir-ltr text-left">{payload.billTo.cityCountryEn}</p>
            <p className="mt-2 text-xs text-slate-500">البريد / Email</p>
            <p className="font-mono text-sm dir-ltr text-left" dir="ltr">
              {payload.billTo.email}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 border-t-4 border-t-amber-700 p-4">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">تصنيف الفاتورة</h2>
            <p className="text-sm font-semibold text-slate-900">{payload.invoiceTypeAr}</p>
            <p className="mt-1 text-xs text-slate-600 dir-ltr text-left leading-relaxed">{payload.invoiceTypeEn}</p>
          </div>
        </div>

        {(payload.coverageNoteAr || payload.servicePeriodStartIso) && (
          <div className="rounded-md bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
            {payload.coverageNoteAr && (
              <>
                <p>{payload.coverageNoteAr}</p>
                {payload.coverageNoteEn && (
                  <p className="mt-1 dir-ltr text-left text-slate-600" dir="ltr">
                    {payload.coverageNoteEn}
                  </p>
                )}
              </>
            )}
            {payload.servicePeriodStartIso && (
              <>
                <p className="mt-2 font-semibold text-slate-800">دورة الفوترة / Billing period</p>
                <p dir="ltr" className="dir-ltr font-mono text-left">
                  {payload.servicePeriodStartIso} → {payload.servicePeriodEndIso}
                </p>
                {payload.nextRenewalNoteAr && <p className="mt-1">{payload.nextRenewalNoteAr}</p>}
                {payload.nextRenewalNoteEn && (
                  <p className="mt-1 dir-ltr text-left text-slate-600" dir="ltr">
                    {payload.nextRenewalNoteEn}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="border-b border-slate-200 px-3 py-2 text-right font-semibold">البند</th>
                <th className="border-b border-slate-200 px-2 py-2 text-center font-semibold">الكمية</th>
                <th className="border-b border-slate-200 px-2 py-2 text-center font-semibold">سعر الوحدة (ر.س)</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold dir-ltr">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payload.lines.map((line, i) => (
                <tr key={i} className="align-top">
                  <td className="border-b border-slate-100 px-3 py-3">
                    <div className="font-medium text-slate-900">{line.descriptionAr}</div>
                    <div className="mt-1 text-xs leading-snug text-slate-600 dir-ltr text-left" dir="ltr">
                      {line.descriptionEn}
                    </div>
                  </td>
                  <td className="border-b border-slate-100 px-2 py-3 text-center font-mono">{line.quantity}</td>
                  <td className="border-b border-slate-100 px-2 py-3 text-center font-mono">{fmt(line.unitSar)}</td>
                  <td className="border-b border-slate-100 px-3 py-3 text-left font-mono dir-ltr">{fmt(line.lineTotalSar)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full max-w-sm space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex justify-between text-sm text-slate-600">
              <span>المجموع الفرعي / Subtotal</span>
              <span className="font-mono dir-ltr" dir="ltr">
                {fmt(payload.subtotalSar)} SAR
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
              <span>الإجمالي / Total</span>
              <span className="font-mono dir-ltr" dir="ltr">
                {fmt(payload.totalSar)} SAR
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-600">
          {payload.notesAr.map((n, i) => (
            <p key={`ar-${i}`}>{n}</p>
          ))}
          {payload.notesEn.map((n, i) => (
            <p key={`en-${i}`} className="dir-ltr text-left leading-relaxed" dir="ltr">
              {n}
            </p>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-[11px] text-slate-500">
          <span>© {payload.issueDate.getFullYear()} Halaq Map — حلاق ماب</span>
          <span className="dir-ltr" dir="ltr">
            halaqmap.com
          </span>
        </div>
      </div>
    </div>
  );
});

SubscriptionInvoiceSlip.displayName = 'SubscriptionInvoiceSlip';
