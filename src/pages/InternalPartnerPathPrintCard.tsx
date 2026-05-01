import { useEffect } from 'react';
import { PartnerPathQrPrintCard } from '@/components/partner/PartnerPathQrPrintCard';

/**
 * صفحة داخلية غير مرتبطة من الرئيسية أو مسار الشركاء — يُشار إليها يدوياً لفريق التسويق/الإدارة فقط.
 * الرابط مضبوط في ROUTE_PATHS.INTERNAL_PARTNER_PATH_PRINT_CARD (لا تُضفّ له روابط في القوائم).
 */
export default function InternalPartnerPathPrintCard() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'حلاق ماب — بطاقة مسار الشركاء (داخلي)';
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => {
      document.title = prevTitle;
      meta.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-muted/50 py-8 px-4" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-6">
        <p className="text-center text-xs text-muted-foreground">
          للاستخدام الداخلي فقط — لا تُضاف هذه الصفحة إلى قوائم الموقع أو مسار الشركاء العام.
        </p>
        <PartnerPathQrPrintCard />
      </div>
    </div>
  );
}
