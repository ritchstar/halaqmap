/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useState } from 'react';
import { ExternalLink, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  breakOutFinancialPathToBrowser,
  buildAbsoluteAppHashUrl,
  isPartnerAppShell,
  openInExternalBrowser,
} from '@/lib/partnerAppShell';

type Props = {
  /** مسار Hash مع الاستعلام — مثال: /partners/payment?tier=gold */
  pathWithSearch: string;
};

/**
 * داخل PWA/TWA: يوجّه الدفع والشراء إلى المتصفح الخارجي ويعرض بديلاً إن بقي المستخدم في الغلاف.
 */
export function PartnerExternalCheckoutGate({ pathWithSearch }: Props) {
  const [shell, setShell] = useState(false);
  const [brokeOut, setBrokeOut] = useState(false);

  useEffect(() => {
    const inShell = isPartnerAppShell();
    setShell(inShell);
    if (!inShell) return;
    const ok = breakOutFinancialPathToBrowser(pathWithSearch);
    setBrokeOut(ok);
  }, [pathWithSearch]);

  if (!shell) return null;

  const absolute = buildAbsoluteAppHashUrl(pathWithSearch);

  return (
    <Alert className="mb-4 border-amber-400/40 bg-amber-500/10 text-amber-950 dark:text-amber-50">
      <Smartphone className="h-4 w-4" />
      <AlertTitle className="font-bold">أكمل الدفع في المتصفح</AlertTitle>
      <AlertDescription className="mt-2 space-y-3 text-sm leading-relaxed">
        <p>
          من تطبيق الصالون تُفتح عمليات شراء الرخص والدفع في المتصفح الخارجي — لحماية حسابك وتجنّب
          عمولات المتاجر.
        </p>
        {brokeOut ? (
          <p className="text-xs opacity-90">تم فتح المتصفح. إن لم يظهر، استخدم الزر أدناه.</p>
        ) : null}
        <Button
          type="button"
          size="sm"
          className="gap-2 bg-amber-600 hover:bg-amber-700"
          onClick={() => openInExternalBrowser(absolute)}
        >
          <ExternalLink className="h-4 w-4" />
          فتح صفحة الدفع في المتصفح
        </Button>
      </AlertDescription>
    </Alert>
  );
}
