import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import { confirmBronzeTrialEmailRemote } from '@/lib/bronzeTrialApplyRemote';

export default function BronzeTrialConfirmLanding() {
  const [params] = useSearchParams();
  const token = (params.get('c') || params.get('token') || '').trim();
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('رابط التأكيد غير مكتمل.');
      return;
    }
    let cancelled = false;
    void (async () => {
      const res = await confirmBronzeTrialEmailRemote(token);
      if (cancelled) return;
      if (!res.ok) {
        setState('error');
        setMessage(
          res.error === 'token_expired'
            ? 'انتهت صلاحية رابط التأكيد — اطلب إعادة الإرسال من الدعم.'
            : 'تعذّر تأكيد البريد. قد يكون الرابط مستخدماً أو غير صالح.',
        );
        return;
      }
      setState('ok');
      setMessage(res.messageAr);
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="container mx-auto max-w-xl px-4 py-16">
      {state === 'loading' ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          جاري تأكيد البريد…
        </div>
      ) : null}
      {state === 'ok' ? (
        <Alert className="border-emerald-600/40 bg-emerald-500/10">
          <AlertTitle>تم التأكيد</AlertTitle>
          <AlertDescription className="space-y-3 text-sm leading-relaxed">
            <p>{message}</p>
            <p>
              هذا ليس تسجيلاً رسمياً. عند الموافقة يصلك كود التجربة على بريدك، ثم تكمل من صفحة التسجيل.
            </p>
            <Button asChild>
              <Link to={ROUTE_PATHS.REGISTER}>صفحة التسجيل الرسمية</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      {state === 'error' ? (
        <Alert variant="destructive">
          <AlertTitle>فشل التأكيد</AlertTitle>
          <AlertDescription className="space-y-3 text-sm">
            <p>{message}</p>
            <Button asChild variant="outline">
              <Link to={ROUTE_PATHS.BRONZE_TRIAL_APPLY}>العودة لطلب التجربة</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
