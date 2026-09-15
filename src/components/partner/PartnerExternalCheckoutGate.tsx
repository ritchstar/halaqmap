/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useState } from 'react';
import { Copy, ExternalLink, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  buildAbsoluteAppHashUrl,
  isPartnerAppShell,
  openInExternalBrowser,
  wasExternalBreakoutAttempted,
} from '@/lib/partnerAppShell';
import { toast } from 'sonner';

type Props = {
  /** مسار Hash مع الاستعلام — مثال: /partners/payment?tier=gold */
  pathWithSearch: string;
};

/**
 * داخل PWA/TWA: يوجّه الدفع إلى المتصفح الخارجي بزر صريح فقط — بدون فتح تلقائي
 * عند التحميل (كان يُسبب حلقة إعادة تحميل لا نهائية في غلاف أندرويد).
 */
export function PartnerExternalCheckoutGate({ pathWithSearch }: Props) {
  const [shell, setShell] = useState(false);
  const [openedOnce, setOpenedOnce] = useState(false);

  const absolute = buildAbsoluteAppHashUrl(pathWithSearch);

  useEffect(() => {
    setShell(isPartnerAppShell());
    setOpenedOnce(wasExternalBreakoutAttempted(absolute));
  }, [absolute]);

  if (!shell) return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(absolute);
      toast.success('تم نسخ رابط الدفع');
    } catch {
      toast.error('تعذّر النسخ. انسخ الرابط يدوياً من شريط العنوان بعد فتح المتصفح.');
    }
  };

  const handleOpen = () => {
    const ok = openInExternalBrowser(absolute);
    setOpenedOnce(true);
    if (!ok) {
      toast.message('لم يُفتح المتصفح تلقائياً', {
        description: 'انسخ الرابط وافتحه في Chrome أو Safari.',
      });
    }
  };

  return (
    <Alert className="mb-4 border-amber-400/70 bg-amber-500/25 text-white shadow-md ring-1 ring-amber-400/35">
      <Smartphone className="h-4 w-4 text-amber-100" />
      <AlertTitle className="font-bold text-white">أكمل الدفع في المتصفح</AlertTitle>
      <AlertDescription className="mt-2 space-y-3 text-sm leading-relaxed text-amber-50">
        <p>
          من تطبيق الصالون تُفتح عمليات شراء الرخص والدفع في المتصفح الخارجي — لحماية حسابك
          وتجنّب عمولات المتاجر.
        </p>
        {openedOnce ? (
          <p className="text-xs text-amber-100/95">
            إن لم يظهر المتصفح، انسخ الرابط أدناه وافتحه في Chrome أو Safari.
          </p>
        ) : null}
        <p
          dir="ltr"
          className="break-all rounded-md border border-amber-400/40 bg-black/25 px-2 py-1.5 text-[11px] text-amber-50/95"
        >
          {absolute}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            className="gap-2 bg-amber-600 text-white hover:bg-amber-700"
            onClick={handleOpen}
          >
            <ExternalLink className="h-4 w-4" />
            فتح صفحة الدفع في المتصفح
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2 border-amber-300/70 bg-white/10 text-white hover:bg-white/20"
            onClick={() => void copyLink()}
          >
            <Copy className="h-4 w-4" />
            نسخ الرابط
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
