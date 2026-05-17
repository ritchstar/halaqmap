import { useEffect, useMemo, useRef, useState } from 'react';
import { SubscriptionInvoiceSlip } from '@/components/billing/SubscriptionInvoiceSlip';
import { buildMonthlySubscriptionPreview } from '@/lib/subscriptionInvoicePreviewData';
import { downloadElementAsPdf } from '@/lib/downloadInvoicePreviewPdf';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/** صفحة داخلية — نموذج فاتورة PDF للمعاينة (ترخيص رقمي 30 يوم). */
export default function InvoicePreviewSamples() {
  const monthlyRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const issueDate = useMemo(() => new Date(), []);
  const monthlyPayload = useMemo(() => buildMonthlySubscriptionPreview(issueDate), [issueDate]);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'حلاق ماب — معاينة فواتير تراخيص إدراج (داخلي)';
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => {
      document.title = prevTitle;
      meta.remove();
    };
  }, []);

  const dl = async () => {
    const el = monthlyRef.current;
    if (!el) return;
    setBusy(true);
    try {
      const stamp = issueDate.toISOString().slice(0, 10);
      await downloadElementAsPdf(el, `halaqmap-invoice-preview-monthly-${stamp}.pdf`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-6">
        <p className="text-center text-xs text-slate-500">
          للاستخدام الداخلي فقط — فاتورة معاينة (PDF).
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <Button type="button" onClick={() => void dl()} disabled={busy} className="min-w-[220px]">
            {busy ? (
              <>
                <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                جاري إنشاء PDF…
              </>
            ) : (
              'تنزيل PDF — ترخيص رقمي 30 يوم'
            )}
          </Button>
        </div>
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6">
          <h2 className="mb-4 text-center text-sm font-semibold text-slate-700">معاينة — ترخيص رقمي 30 يوم</h2>
          <div className="flex justify-center overflow-x-auto">
            <SubscriptionInvoiceSlip ref={monthlyRef} payload={monthlyPayload} />
          </div>
        </div>
      </div>
    </div>
  );
}