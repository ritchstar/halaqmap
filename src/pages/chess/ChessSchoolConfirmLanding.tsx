/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تأكيد بريد تسجيل مدرسة الشطرنج الاحترافية — يقرأ رمز التأكيد من رابط الرسالة،
 * يتحقق منه فعلياً عبر /api/chess-school-confirm-email (لا نجاح وهمي على الواجهة).
 */
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Crown, Loader2, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/lib';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { chessSchoolConfirmErrorAr, confirmChessSchoolEmailRemote } from '@/lib/chessSchoolRegisterRemote';

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

export default function ChessSchoolConfirmLanding() {
  useDocumentTitle('تأكيد البريد — مدرسة الشطرنج الاحترافية');
  const [params] = useSearchParams();
  const token = readConfirmToken(params);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [fullName, setFullName] = useState('');
  const [registrationId, setRegistrationId] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage(chessSchoolConfirmErrorAr('missing_token'));
      return;
    }
    let cancelled = false;
    void (async () => {
      const res = await confirmChessSchoolEmailRemote(token);
      if (cancelled) return;
      if (!res.ok) {
        setState('error');
        setMessage(chessSchoolConfirmErrorAr(res.error));
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
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="container mx-auto max-w-xl px-4 py-16">
        <div className="mb-8 flex items-center justify-center gap-2 text-primary">
          <Crown className="h-6 w-6" />
          <span className="text-sm font-bold">مدرسة الشطرنج الاحترافية</span>
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
                    <Link to={ROUTE_PATHS.CHESS_SCHOOL_PAY.replace(':rid', encodeURIComponent(registrationId))}>
                      ادفع الآن (175 ر.س)
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="ghost">
                  <Link to={ROUTE_PATHS.CHESS_ARENA}>جرّب ساحة الشطرنج المجانية الآن</Link>
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
                <Link to={ROUTE_PATHS.CHESS_SCHOOL_LANDING}>العودة لصفحة التسجيل</Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}
      </div>
    </div>
  );
}
