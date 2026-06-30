import { Link } from 'react-router-dom';
import { FileText, Receipt, Scale, Store } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/lib';
import { SUBSCRIPTION_POLICY_TIERS } from '@/config/subscriptionPolicyTiers';
import {
  DIGITAL_SHIFT_MONTHLY_ADDON_SAR,
  DIGITAL_SHIFT_PRODUCT_NAME_AR,
} from '@/config/subscriptionPricing';
import {
  MOYASAR_COMPLAINT_RESPONSE_DAYS_AR,
  MOYASAR_DIGITAL_DELIVERY_AR,
  MOYASAR_MERCHANT_IDENTITY_LINES_AR,
  MOYASAR_PRODUCT_SUMMARY_AR,
  PRICING_POLICY_PATH,
  REFUND_POLICY_PATH,
} from '@/config/moyasarMerchantCompliance';

/**
 * إفصاح التاجر للبوابات الإلكترونية (ميسر · SAB) — يُعرض قبل إتمام الدفع.
 */
export function PaymentMerchantCompliancePanel() {
  return (
    <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-background">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Store className="h-5 w-5 text-primary" />
          هوية التاجر · الأسعار · السياسات
        </CardTitle>
        <CardDescription className="leading-relaxed">
          معلومات مطلوبة لبوابات الدفع الإلكتروني قبل إتمام الشراء — شفافية الأسعار مقابل الخدمة
          الرقمية المقدمة.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 text-sm leading-relaxed">
        <div className="rounded-lg border border-border/80 bg-muted/30 p-4">
          <p className="font-semibold text-foreground">هوية التاجر</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {MOYASAR_MERCHANT_IDENTITY_LINES_AR.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-3 text-muted-foreground">{MOYASAR_PRODUCT_SUMMARY_AR}</p>
          <p className="mt-2 text-muted-foreground">
            <strong className="text-foreground">مدة التسليم:</strong> {MOYASAR_DIGITAL_DELIVERY_AR}
          </p>
          <p className="mt-1 text-muted-foreground">
            <strong className="text-foreground">الرد على الشكاوى:</strong> خلال{' '}
            {MOYASAR_COMPLAINT_RESPONSE_DAYS_AR} عبر {MOYASAR_MERCHANT_IDENTITY_LINES_AR[2].replace('البريد: ', '')}
          </p>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 font-semibold text-foreground">
            <Receipt className="h-4 w-4 text-primary" />
            الأسعار مقابل الخدمة (لكل حزمة · 30 يوم نفاذ)
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[320px] text-right text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">الحزمة</th>
                  <th className="px-3 py-2 font-semibold">السعر (ر.س)</th>
                  <th className="px-3 py-2 font-semibold">ما الذي تحصل عليه</th>
                </tr>
              </thead>
              <tbody>
                {SUBSCRIPTION_POLICY_TIERS.map((tier) => (
                  <tr key={tier.tier} className="border-t border-border/60">
                    <td className="px-3 py-2 font-medium">{tier.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap" dir="ltr">
                      {tier.priceSar} SAR
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      رخصة نفاذ رقمية — ظهور عند الطلب ضمن نظام الاستجابة الذكية + أدوات الملف حسب
                      المستوى
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-border/60">
                  <td className="px-3 py-2 font-medium">إضافة اختيارية (ماسي)</td>
                  <td className="px-3 py-2 whitespace-nowrap" dir="ltr">
                    +{DIGITAL_SHIFT_MONTHLY_ADDON_SAR} SAR
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{DIGITAL_SHIFT_PRODUCT_NAME_AR}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            الأسعار قبل ضريبة القيمة المضافة إن وُجدت — يُعرض الإجمالي في ملخص الطلب أعلاه. لا تجديد
            تلقائي.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={ROUTE_PATHS.TERMS_OF_SERVICE}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
          >
            <Scale className="h-3.5 w-3.5" />
            شروط وأحكام الاستخدام
          </Link>
          <Link
            to={REFUND_POLICY_PATH}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
          >
            <FileText className="h-3.5 w-3.5" />
            سياسة الاسترجاع والاسترداد
          </Link>
          <Link
            to={PRICING_POLICY_PATH}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
          >
            <Receipt className="h-3.5 w-3.5" />
            تفاصيل الباقات والأسعار
          </Link>
          <Link
            to={ROUTE_PATHS.SUBSCRIPTION_POLICY}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
          >
            سياسة رخصة النفاذ الرقمية
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
