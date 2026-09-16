/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useState } from 'react';
import { Copy, ExternalLink, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
 * داخل PWA/TWA: يطلب إذن المستخدم ثم يفتح منصة حلاق ماب في المتصفح الخارجي.
 */
export function PartnerExternalCheckoutGate({ pathWithSearch }: Props) {
  const [shell, setShell] = useState(false);
  const [openedOnce, setOpenedOnce] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const absolute = buildAbsoluteAppHashUrl(pathWithSearch);

  useEffect(() => {
    setShell(isPartnerAppShell());
    setOpenedOnce(wasExternalBreakoutAttempted(absolute));
  }, [absolute]);

  if (!shell) return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(absolute);
      toast.success('تم نسخ رابط شراء حزم النفاذ');
    } catch {
      toast.error('تعذّر النسخ. انسخ الرابط يدوياً من شريط العنوان بعد فتح المتصفح.');
    }
  };

  const openBrowserAfterConsent = () => {
    const ok = openInExternalBrowser(absolute);
    setOpenedOnce(true);
    setConfirmOpen(false);
    if (!ok) {
      toast.message('تعذّر فتح المتصفح تلقائياً', {
        description: 'اضغط «نسخ الرابط» ثم الصقه في Chrome أو Safari لإتمام الشراء.',
      });
    } else {
      toast.success('جاري فتح المتصفح لإتمام الشراء');
    }
  };

  return (
    <>
      <Alert className="mb-4 border-amber-400/70 bg-amber-500/25 text-white shadow-md ring-1 ring-amber-400/35">
        <Smartphone className="h-4 w-4 text-amber-100" />
        <AlertTitle className="font-bold text-white">صفحة شراء حزم نفاذ</AlertTitle>
        <AlertDescription className="mt-2 space-y-3 text-sm leading-relaxed text-amber-50">
          <p>سيتم توجيهك الى منصة حلاق ماب لاتمام الدفع</p>
          <p className="text-xs text-amber-100/95">
            الشراء يكتمل في المتصفح الخارجي فقط. اضغط الزر ليُطلب منك السماح بفتح المتصفح.
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
              onClick={() => setConfirmOpen(true)}
            >
              <ExternalLink className="h-4 w-4" />
              فتح المتصفح لإتمام الشراء
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

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="border-amber-500/40 bg-[#0b1520] text-white" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>السماح بفتح المتصفح؟</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-7 text-white/75">
              هل تسمح بفتح المتصفح لإتمام عملية الشراء على منصة حلاق ماب؟ لن يكتمل الدفع داخل تطبيق
              الصالون.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 text-white hover:bg-amber-700"
              onClick={(event) => {
                event.preventDefault();
                openBrowserAfterConsent();
              }}
            >
              نعم، افتح المتصفح
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
