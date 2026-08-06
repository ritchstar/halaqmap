/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Shield } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ROUTE_PATHS } from '@/lib';
import { REFUND_POLICY_PATH } from '@/config/moyasarMerchantCompliance';
import {
  PAYMENT_CHECKOUT_ACK_DETAILS_TRIGGER_AR,
  PAYMENT_CHECKOUT_ACK_LEAD_AR,
  PAYMENT_CHECKOUT_ACK_SHORT_AR,
  PAYMENT_CHECKOUT_SOFTWARE_ACK_PLAIN_AR,
} from '@/config/paymentCheckoutCommitments';
import { SOFTWARE_PRODUCT_PURCHASE_ACK_SHORT_AR } from '@/config/legalActivityScope';

type Gateway = 'moyasar' | 'sab';

type Props = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  gateway: Gateway;
  /** معرّف فريد لحقول النموذج عند وجود أكثر من مسار */
  idPrefix?: string;
};

/**
 * تأشيرة دفع واحدة تضبط أعلام الإقرار الخلفية (منتج برمجي + شروط البوابة).
 */
export function PaymentCheckoutAcknowledgment({
  checked,
  onCheckedChange,
  gateway,
  idPrefix = 'checkout',
}: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const checkboxId = `${idPrefix}-ack`;

  return (
    <div className="space-y-4 rounded-xl border border-primary/35 bg-primary/8 p-4 sm:p-5">
      <p className="text-base font-semibold leading-relaxed text-foreground sm:text-lg">
        {PAYMENT_CHECKOUT_ACK_LEAD_AR}
      </p>

      <Alert className="border-primary/25 bg-background/80">
        <Shield className="h-4 w-4" />
        <AlertDescription className="space-y-2 text-base leading-relaxed text-foreground">
          {gateway === 'moyasar' ? (
            <p>
              الدفع عبر <strong>ميسر</strong> يخضع لـ{' '}
              <a
                href="https://moyasar.com/ar/resources/terms/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                شروط التاجر الرسمية
              </a>
              . بالموافقة تُقرّ بالاطلاع على السياسات أدناه.
            </p>
          ) : (
            <p>
              الدفع عبر <strong>بنك الأول (SAB)</strong> يتم عبر بوابة OPPWA المعتمدة. تُعالَج بيانات
              البطاقة داخل ودجت البنك ولا يحتفظ موقع حلاق ماب ببيانات البطاقة الكاملة.
            </p>
          )}
        </AlertDescription>
      </Alert>

      <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-background/90 p-3 sm:p-4">
        <Checkbox
          id={checkboxId}
          checked={checked}
          onCheckedChange={(c) => onCheckedChange(c === true)}
          className="mt-1 h-5 w-5"
        />
        <Label
          htmlFor={checkboxId}
          className="cursor-pointer text-base font-semibold leading-relaxed text-foreground sm:text-lg"
        >
          {PAYMENT_CHECKOUT_ACK_SHORT_AR}
        </Label>
      </div>

      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <CollapsibleTrigger
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5 text-right text-sm font-semibold text-foreground transition-colors hover:bg-muted/70 sm:text-base"
        >
          <span>{PAYMENT_CHECKOUT_ACK_DETAILS_TRIGGER_AR}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-primary transition-transform ${detailsOpen ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3 rounded-lg border border-border/60 bg-background/70 p-3 text-sm leading-relaxed text-foreground sm:text-base sm:leading-relaxed">
          <p>
            <span className="font-bold">{SOFTWARE_PRODUCT_PURCHASE_ACK_SHORT_AR}</span>
            {' — '}
            {PAYMENT_CHECKOUT_SOFTWARE_ACK_PLAIN_AR}
          </p>
          <p>
            أقرّ بأنني اطلعت على{' '}
            <Link
              to={ROUTE_PATHS.TERMS_OF_SERVICE}
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              شروط وأحكام الاستخدام
            </Link>
            ، و{' '}
            <Link
              to={REFUND_POLICY_PATH}
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              سياسة الاسترجاع والاسترداد
            </Link>
            ، و{' '}
            <Link
              to={ROUTE_PATHS.SUBSCRIPTION_POLICY}
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              رخصة النفاذ الرقمية
            </Link>
            {gateway === 'moyasar'
              ? '، وشروط بوابة الدفع لشركة مُيسر المالية، وأوافق على المتابعة.'
              : '، وشروط التاجر وبوابة بنك الأول المعتمدة، وأوافق على المتابعة.'}
          </p>
        </CollapsibleContent>
      </Collapsible>

      {!checked ? (
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200 sm:text-base">
          فعّل التأشيرة أعلاه لعرض نموذج الدفع.
        </p>
      ) : null}
    </div>
  );
}
