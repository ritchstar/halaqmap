import { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { extractHttpUrlFromQrPayload } from '@/lib/regulatoryQrPreviewUtils';
import { logAdminRegulatoryQrPreviewRemote } from '@/lib/adminRegulatoryPreviewLogRemote';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationOrderId: string;
  rawQrPayload: string;
};

/**
 * معاينة لحظية لرابط مستخرج من حقل التحقق — الرابط يُعاد فقط في ذاكرة الجلسة (React) حتى إغلاق النافذة.
 */
export function RegulatoryQrLivePreviewDialog({
  open,
  onOpenChange,
  registrationOrderId,
  rawQrPayload,
}: Props) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [logError, setLogError] = useState<string | null>(null);
  const loggedForOpenCycleRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setResolvedUrl(null);
      setLogError(null);
      loggedForOpenCycleRef.current = false;
      return;
    }
    setResolvedUrl(extractHttpUrlFromQrPayload(rawQrPayload));
  }, [open, rawQrPayload]);

  useEffect(() => {
    if (!open || loggedForOpenCycleRef.current) return;
    loggedForOpenCycleRef.current = true;
    void (async () => {
      const r = await logAdminRegulatoryQrPreviewRemote({ registrationOrderId });
      if (!r.ok) setLogError(r.error);
    })();
  }, [open, registrationOrderId]);

  const handleClose = (next: boolean) => {
    if (!next) {
      setResolvedUrl(null);
      setLogError(null);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0" dir="rtl">
        <div className="border-b border-border px-6 py-4">
          <DialogHeader>
            <DialogTitle>معاينة الرمز النظامي (عرض مباشر)</DialogTitle>
            <DialogDescription>
              يُحمَّل المحتوى في هذه النافذة فقط؛ عند الإغلاق يُزال من ذاكرة المتصفح للجلسة الحالية دون حفظ على
              خوادم المنصة.
            </DialogDescription>
          </DialogHeader>
        </div>
        {logError ? (
          <div className="px-6 py-3">
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{logError}</AlertDescription>
            </Alert>
          </div>
        ) : null}
        <div className="min-h-[50vh] w-full bg-muted/30">
          {resolvedUrl ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background/80 px-4 py-2">
                <p className="text-xs text-muted-foreground">
                  إن لم يظهر المحتوى، قد تمنع الجهة الرسمية العرض داخل الإطار — استخدم «فتح في نافذة جديدة».
                </p>
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <a href={resolvedUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    فتح في نافذة جديدة
                  </a>
                </Button>
              </div>
              <iframe
                key={resolvedUrl}
                title="معاينة نظامية"
                src={resolvedUrl}
                className="h-[min(72vh,640px)] w-full border-0 bg-background"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                referrerPolicy="no-referrer"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
                لم يُستخرج رابط <span dir="ltr">http/https</span> صريح من النص المُدخل. افتح تطبيق أو منصة الجهة
                الرسمية يدوياً والصق الرمز هناك للتحقق، أو اطلب من مقدّم الطلب إرسال رابط يُفتح في المتصفح.
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="border-t border-border px-6 py-4 sm:justify-start">
          <Button type="button" variant="secondary" onClick={() => handleClose(false)}>
            إغلاق ومسح المعاينة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
