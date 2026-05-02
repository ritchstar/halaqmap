import { useEffect, useMemo, useRef, useState } from 'react';
import { SubscriptionInvoiceSlip } from '@/components/billing/SubscriptionInvoiceSlip';
import { buildBankTransferSixMonthPreview, buildMonthlySubscriptionPreview } from '@/lib/subscriptionInvoicePreviewData';
import { downloadElementAsPdf } from '@/lib/downloadInvoicePreviewPdf';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/**
 * صفحة داخلية — نماذج فواتير PDF للمعاينة (تحويل 6 أشهر + شهري).
 * لا تُضاف لها روابط عامة؛ يُشار إليها يدوياً للإدارة/التصميم.
 */
export default function InvoicePreviewSamples() {
  const bankRef = useRef<HTMLDivElement>(null);
  const monthlyRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<'bank' | 'monthly' | null>(null);

  const issueDate = useMemo(() => new Date(), []);
  const bankPayload = useMemo(() => buildBankTransferSixMonthPreview(issueDate), [issueDate]);
  const monthlyPayload = useMemo(() => buildMonthlySubscriptionPreview(issueDate), [issueDate]);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'حلاق ماب — معاينة فواتير اشتراك (داخلي)';
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => {
      document.title = prevTitle;
      meta.remove();
    };
  }, []);

  const dl = async (which: 'bank' | 'monthly') => {
    const el = which === 'bank' ? bankRef.current : monthlyRef.current;
    if (!el) return;
    setBusy(which);
    try {
      const stamp = issueDate.toISOString().slice(0, 10);
      const name =
        which === 'bank'
          ? `halaqmap-invoice-preview-bank-6m-${stamp}.pdf`
          : `halaqmap-invoice-preview-monthly-${stamp}.pdf`;
      await downloadElementAsPdf(el, name);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-6">
        <p className="text-center text-xs text-slate-500">
          للاستخدام الداخلي فقط — فواتير معاينة (PDF). أرسل الملفّين يدوياً إلى البريد المطلوب بعد التنزيل.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <Button
            type="button"
            onClick={() => void dl('bank')}
            disabled={busy !== null}
            className="min-w-[220px]"
          >
            {busy === 'bank' ? (
              <>
                <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                جاري إنشاء PDF…
              </>
            ) : (
              'تنزيل PDF — تحويل بنكي (6 أشهر)'
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void dl('monthly')}
            disabled={busy !== null}
            className="min-w-[220px]"
          >
            {busy === 'monthly' ? (
              <>
                <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                جاري إنشاء PDF…
              </>
            ) : (
              'تنزيل PDF — اشتراك شهري'
            )}
          </Button>
        </div>

        <div className="space-y-10 rounded-xl border border-dashed border-slate-300 bg-white/60 p-6">
          <div className="space-y-2">
            <h2 className="text-center text-sm font-semibold text-slate-700">معاينة على الشاشة — تحويل بنكي</h2>
            <div className="flex justify-center overflow-x-auto">
              <SubscriptionInvoiceSlip ref={bankRef} payload={bankPayload} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-center text-sm font-semibold text-slate-700">معاينة على الشاشة — اشتراك شهري</h2>
            <div className="flex justify-center overflow-x-auto">
              <SubscriptionInvoiceSlip ref={monthlyRef} payload={monthlyPayload} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
