/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { hasPaymentSuccessGate } from '@/lib/moyasarPaymentReturn';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/**
 * صفحة تأكيد الاشتراك — لا تُعرض إلا بعد تحقق دفع ناجح في الجلسة.
 * رابط تتبع إحالات Google Ads:
 * https://www.halaqmap.com/partners/payment/success
 */
export default function PaymentSuccess() {
  useDocumentTitle('تم تأكيد الاشتراك | حلاق ماب');

  if (!hasPaymentSuccessGate()) {
    return <Navigate to={ROUTE_PATHS.PAYMENT} replace />;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12" dir="rtl">
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden />
        <h1 className="mt-4 text-2xl font-black text-foreground">تم تأكيد الاشتراك</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          اكتملت عملية الدفع بنجاح. يمكنك الآن الدخول إلى لوحة الصالون ومتابعة التفعيل.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button asChild className="w-full font-bold">
            <Link to={ROUTE_PATHS.BARBER_LOGIN}>دخول لوحة الصالون</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to={ROUTE_PATHS.BARBERS_LANDING}>العودة لمسار الشركاء</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
