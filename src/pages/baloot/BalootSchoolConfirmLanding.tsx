/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تأكيد بريد تسجيل مدرسة البلوت — يقرأ رمز التأكيد من رابط الرسالة، يتحقق
 * منه فعلياً عبر /api/baloot-school-confirm-email (لا نجاح وهمي على الواجهة).
 * مطابقة بنيوياً لـ ChessSchoolConfirmLanding.tsx.
 */
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Crown, Loader2, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { BalootSchoolMotifBackground } from '@/components/baloot/BalootSchoolMotifBackground';
import { ROUTE_PATHS } from '@/lib';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { balootSchoolConfirmErrorAr, confirmBalootSchoolEmailRemote } from '@/lib/balootSchoolRegisterRemote';

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

export default function BalootSchoolConfirmLanding() {
  useDocumentTitle('تأكيد البريد — مدرسة البلوت');
  const [params] = useSearchParams();
  const token = readConfirmToken(params);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [fullName, setFullName] = useState('');
  const [registrationId, setRegistrationId] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage(balootSchoolConfirmErrorAr('missing_token'));
      return;
    }
    let cancelled = false;
    void (async () => {
      const res = await confirmBalootSchoolEmailRemote(token);
      if (cancelled) return;
      if (!res.ok) {
        setState('error');
        setMessage(balootSchoolConfirmErrorAr(res.error));
        return;
      }
      setState('ok');
      setMessage(res.messageAr);
      setFullName(res.fullName);
      setRegistrationId(res.registrationId);
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div dir="rtl" className="relative min-h-screen overflow-hidden bg-background">
      <BalootSchoolMotifBackground />
      <div className="relative z-10 container mx-auto max-w-xl px-4 py-16">
        <div className="mb-8 flex items-center justify-center gap-2 text-primary">
          <Crown className="h-6 w-6" />
          <span className="text-sm font-bold">مدرسة البلوت</span>
        </div>

        {state === 'loading' ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            جاري تأكيد بريدك…
          </div>
        ) : null}

        {state === 'ok' ? (
          <Alert className="border-emerald-600/40 bg-emerald-500/10">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertTitle>{fullName ? `أهلاً بك، ${fullName}!` : 'تم التأكيد'}</AlertTitle>
            <AlertDescription className="space-y-3 text-sm leading-relaxed">
              <p>{message}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {registrationId ? (
                  <Button asChild>
                    <Link to={ROUTE_PATHS.BALOOT_SCHOOL_PAY.replace(':rid', encodeURIComponent(registrationId))}>
                      ادفع الآن (199 ر.س)
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="ghost">
                  <Link to={ROUTE_PATHS.BALOOT_ARENA}>جرّب ساحة بلوت المجانية الآن</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        {state === 'error' ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>فشل التأكيد</AlertTitle>
            <AlertDescription className="space-y-3 text-sm">
              <p>{message}</p>
              <Button asChild variant="outline">
                <Link to={ROUTE_PATHS.BALOOT_SCHOOL_LANDING}>العودة لصفحة التسجيل</Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}
      </div>
    </div>
  );
}
