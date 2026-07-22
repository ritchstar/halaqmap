import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import { confirmBronzeTrialEmailRemote } from '@/lib/bronzeTrialApplyRemote';

/** يقرأ رمز التأكيد من HashRouter أو من ?c= قبل # (بعض عملاء البريد ينقلون الاستعلام). */
function readConfirmToken(searchParams: URLSearchParams): string {
  const fromRr = (searchParams.get('c') || searchParams.get('token') || '').trim();
  if (fromRr) return decodeTokenOnce(fromRr);

  if (typeof window === 'undefined') return '';

  try {
    const q = new URLSearchParams(window.location.search);
    const fromSearch = (q.get('c') || q.get('token') || '').trim();
    if (fromSearch) return decodeTokenOnce(fromSearch);
  } catch {
    /* ignore */
  }

  try {
    const hash = String(window.location.hash || '');
    const qi = hash.indexOf('?');
    if (qi >= 0) {
      const hp = new URLSearchParams(hash.slice(qi + 1));
      const fromHash = (hp.get('c') || hp.get('token') || '').trim();
      if (fromHash) return decodeTokenOnce(fromHash);
    }
  } catch {
    /* ignore */
  }

  return '';
}

function decodeTokenOnce(raw: string): string {
  const t = raw.trim();
  if (!t.includes('%')) return t;
  try {
    return decodeURIComponent(t).trim();
  } catch {
    return t;
  }
}

export default function BronzeTrialConfirmLanding() {
  const [params] = useSearchParams();
  const token = readConfirmToken(params);
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
            : res.error === 'confirm_update_failed'
              ? 'تعذّر حفظ التأكيد في النظام. تواصل مع الدعم أو أعد فتح الرابط.'
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
