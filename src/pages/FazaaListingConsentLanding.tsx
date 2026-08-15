/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * صفحة موافقة الشريك عبر رابط البريد الرسمي — إبراز فزعة العام.
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FAZAA_LISTING_CONSENT_COPY } from '@/config/fazaaListingConsentCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  fetchFazaaListingConsentPreview,
  submitFazaaListingConsent,
  type FazaaListingConsentPreview,
} from '@/lib/fazaaListingConsentRemote';

function readConsentToken(searchParams: URLSearchParams): string {
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

function errorMessage(code: string): string {
  if (code === 'expired') return FAZAA_LISTING_CONSENT_COPY.expired;
  if (code === 'used' || code === 'not_found') return FAZAA_LISTING_CONSENT_COPY.used;
  if (code === 'missing_token') return FAZAA_LISTING_CONSENT_COPY.missing;
  if (code === 'consent_required') return 'يلزم التأشير بالموافقة قبل الإرسال.';
  return 'تعذّر إكمال الطلب. أعد فتح الرابط من الرسالة الرسمية.';
}

export default function FazaaListingConsentLanding() {
  useDocumentTitle(FAZAA_LISTING_CONSENT_COPY.documentTitle);
  const [params] = useSearchParams();
  const token = readConsentToken(params);
  const [preview, setPreview] = useState<FazaaListingConsentPreview | null>(null);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'done' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      setPhase('error');
      setMessage(FAZAA_LISTING_CONSENT_COPY.missing);
      return;
    }
    let cancelled = false;
    void (async () => {
      const res = await fetchFazaaListingConsentPreview(token);
      if (cancelled) return;
      if (!res.ok) {
        setPhase('error');
        setMessage(errorMessage(res.error));
        return;
      }
      if (res.preview.status !== 'pending') {
        setPhase('error');
        setMessage(errorMessage(res.preview.status));
        return;
      }
      setPreview(res.preview);
      setPhase('ready');
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const onSubmit = async (action: 'accept' | 'decline') => {
    if (action === 'accept' && !accepted) {
      setMessage(errorMessage('consent_required'));
      return;
    }
    setBusy(true);
    const res = await submitFazaaListingConsent({
      token,
      action,
      accepted: action === 'accept' ? accepted : false,
    });
    setBusy(false);
    if (!res.ok) {
      setPhase('error');
      setMessage(errorMessage(res.error));
      return;
    }
    setPhase('done');
    setMessage(action === 'accept' ? FAZAA_LISTING_CONSENT_COPY.successAccept : FAZAA_LISTING_CONSENT_COPY.successDecline);
  };

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-4 py-12">
      <p className="mb-3 text-xs font-black tracking-wide text-teal-300">{FAZAA_LISTING_CONSENT_COPY.badge}</p>
      <h1 className="text-2xl font-black leading-snug text-slate-50 md:text-3xl">{FAZAA_LISTING_CONSENT_COPY.title}</h1>
      <p className="mt-3 text-base leading-8 text-slate-300">{FAZAA_LISTING_CONSENT_COPY.lead}</p>

      {phase === 'loading' ? (
        <p className="mt-8 flex items-center gap-2 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          جاري فتح الدعوة…
        </p>
      ) : null}

      {phase === 'error' || phase === 'done' ? (
        <Alert className="mt-8 border-teal-400/30 bg-teal-500/10">
          <AlertTitle>{phase === 'done' ? 'تم التسجيل' : 'تعذّر المتابعة'}</AlertTitle>
          <AlertDescription className="leading-7">{message}</AlertDescription>
        </Alert>
      ) : null}

      {phase === 'ready' && preview ? (
        <div className="mt-8 space-y-6">
          <section className="rounded-2xl border border-teal-400/25 bg-[#041018] p-5">
            <h2 className="text-lg font-black text-white">{FAZAA_LISTING_CONSENT_COPY.whatTitle}</h2>
            <p className="mt-2 text-sm text-teal-100">
              {preview.salonName} · {preview.areaLabelAr} · {preview.cityNameAr}
            </p>
            {preview.bannerPreviewUrl ? (
              <img
                src={preview.bannerPreviewUrl}
                alt=""
                width={1200}
                height={630}
                className="mt-4 h-auto w-full rounded-xl object-cover"
              />
            ) : (
              <p className="mt-3 text-sm text-amber-200">لا توجد صورة غلاف معتمدة بعد — تُستخدم عند توفرها بعد الموافقة.</p>
            )}
            <ul className="mt-4 list-disc space-y-2 pr-5 text-sm leading-7 text-slate-200">
              {FAZAA_LISTING_CONSENT_COPY.whatItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="flex items-center gap-2 text-lg font-black text-white">
              <ShieldCheck className="h-5 w-5 text-teal-300" />
              {FAZAA_LISTING_CONSENT_COPY.clausesTitle}
            </h2>
            <ol className="mt-4 list-decimal space-y-3 pr-5 text-sm leading-7 text-slate-200">
              {preview.clauses.map((clause) => (
                <li key={clause}>{clause}</li>
              ))}
            </ol>
            <label className="mt-5 flex items-start gap-3 text-sm leading-7 text-slate-100">
              <Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} className="mt-1" />
              <span>{FAZAA_LISTING_CONSENT_COPY.checkbox}</span>
            </label>
            {message ? <p className="mt-3 text-sm text-amber-200">{message}</p> : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button type="button" disabled={busy} onClick={() => void onSubmit('accept')}>
                {FAZAA_LISTING_CONSENT_COPY.acceptCta}
              </Button>
              <Button type="button" variant="outline" disabled={busy} onClick={() => void onSubmit('decline')}>
                {FAZAA_LISTING_CONSENT_COPY.declineCta}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
