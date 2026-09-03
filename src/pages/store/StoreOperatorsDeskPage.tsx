/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { StoreVisitorShell } from '@/components/store/StoreChrome';
import {
  STORE_OPERATOR_PRODUCTS,
  STORE_OPERATORS_DESK_COPY,
  STORE_OPERATORS_STORE_HOME,
  type StoreOperatorProductId,
} from '@/config/storeOperatorsDesk';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';
import {
  fetchStoreOperatorMe,
  logoutStoreOperator,
  sendStoreOperatorCode,
  verifyStoreOperatorCode,
  type StoreOperatorTile,
} from '@/lib/storeOperatorsRemote';
import { readStoreOperatorsSession } from '@/lib/storeOperatorsSession';

function productVisual(productId: string) {
  return STORE_OPERATOR_PRODUCTS[productId as StoreOperatorProductId] || {
    titleAr: '',
    markAr: 'خ',
    accent: '#e8c547',
    openAr: 'افتح اللوحة',
  };
}

export default function StoreOperatorsDeskPage() {
  useDocumentTitle(STORE_OPERATORS_DESK_COPY.documentTitle);
  const [step, setStep] = useState<'email' | 'code' | 'tiles'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [tiles, setTiles] = useState<StoreOperatorTile[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    if (!readStoreOperatorsSession()) return;
    let cancelled = false;
    setBusy(true);
    void fetchStoreOperatorMe().then((result) => {
      if (cancelled) return;
      setBusy(false);
      if (!result.ok) {
        setStep('email');
        return;
      }
      setTiles(result.tiles || []);
      setStep('tiles');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSend(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const result = await sendStoreOperatorCode(email);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error || 'تعذر إرسال الرمز.');
      return;
    }
    toast.message(result.message || STORE_OPERATORS_DESK_COPY.sentAr);
    setStep('code');
  }

  async function onVerify(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const result = await verifyStoreOperatorCode(email, code);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error || 'الرمز غير صالح.');
      return;
    }
    setTiles(result.tiles || []);
    setCode('');
    setStep('tiles');
  }

  async function onLogout() {
    setBusy(true);
    await logoutStoreOperator();
    setBusy(false);
    setTiles([]);
    setCode('');
    setStep('email');
  }

  return (
    <StoreVisitorShell>
      <header className="border-b border-white/10 bg-[#061018]/90">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-[0.7rem] font-bold tracking-wide text-[#e8c547]">{STORE_OPERATORS_DESK_COPY.kickerAr}</p>
            <h1 className="text-lg font-extrabold text-[#f4efe4]">{STORE_OPERATORS_DESK_COPY.titleAr}</h1>
          </div>
          {step === 'tiles' ? (
            <button
              type="button"
              onClick={() => void onLogout()}
              disabled={busy}
              className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-[#e8c547]"
            >
              {STORE_OPERATORS_DESK_COPY.logoutAr}
            </button>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {step !== 'tiles' ? (
          <p className="text-sm leading-7 text-white/70">{STORE_OPERATORS_DESK_COPY.leadAr}</p>
        ) : null}

        {step === 'email' ? (
          <form onSubmit={(event) => void onSend(event)} className="space-y-4 rounded-2xl border border-white/10 bg-[#0f0f14]/95 p-6">
            <label className="block text-sm text-[#f4efe4]">
              {STORE_OPERATORS_DESK_COPY.emailLabelAr}
              <input
                className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-base text-[#f4efe4]"
                dir="ltr"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={180}
                required
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-xl bg-[#e8c547] text-base font-extrabold text-[#061018] disabled:opacity-60"
            >
              {STORE_OPERATORS_DESK_COPY.sendCodeAr}
            </button>
          </form>
        ) : null}

        {step === 'code' ? (
          <form onSubmit={(event) => void onVerify(event)} className="space-y-4 rounded-2xl border border-white/10 bg-[#0f0f14]/95 p-6">
            <p className="text-sm leading-7 text-white/70">{STORE_OPERATORS_DESK_COPY.sentAr}</p>
            <label className="block text-sm text-[#f4efe4]">
              {STORE_OPERATORS_DESK_COPY.codeLabelAr}
              <input
                className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-center text-2xl tracking-[0.4em] text-[#f4efe4]"
                dir="ltr"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
              />
              <span className="mt-1 block text-xs text-white/50">{STORE_OPERATORS_DESK_COPY.codeHintAr}</span>
            </label>
            <button
              type="submit"
              disabled={busy || code.length !== 6}
              className="h-12 w-full rounded-xl bg-[#e8c547] text-base font-extrabold text-[#061018] disabled:opacity-60"
            >
              {STORE_OPERATORS_DESK_COPY.verifyAr}
            </button>
            <button
              type="button"
              onClick={() => {
                setCode('');
                setStep('email');
              }}
              className="w-full text-sm text-white/60 hover:text-[#e8c547]"
            >
              {STORE_OPERATORS_DESK_COPY.emailLabelAr}
            </button>
          </form>
        ) : null}

        {step === 'tiles' ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#f4efe4]">{STORE_OPERATORS_DESK_COPY.tilesTitleAr}</h2>
              <p className="mt-2 text-sm leading-7 text-white/70">{STORE_OPERATORS_DESK_COPY.tilesLeadAr}</p>
            </div>
            {tiles.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-[#0f0f14]/95 p-5 text-sm leading-7 text-white/70">
                {STORE_OPERATORS_DESK_COPY.emptyAr}
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {tiles.map((tile) => {
                  const visual = productVisual(tile.productId);
                  return (
                    <li key={tile.id}>
                      {tile.operable ? (
                        <Link
                          to={tile.deskPath}
                          className="flex h-full items-center gap-3 rounded-2xl border border-white/10 bg-[#0f0f14]/95 p-4 hover:border-white/30"
                        >
                          <span
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-[#061018]"
                            style={{ background: visual.accent }}
                          >
                            {visual.markAr}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-extrabold text-[#f4efe4]">{tile.titleAr}</span>
                            <span className="mt-0.5 block truncate text-xs text-white/60">{tile.nameAr}</span>
                            <span className="mt-1 block text-xs font-bold" style={{ color: visual.accent }}>
                              {visual.openAr}
                            </span>
                          </span>
                        </Link>
                      ) : (
                        <div className="flex h-full items-center gap-3 rounded-2xl border border-white/10 bg-[#0f0f14]/60 p-4 opacity-70">
                          <span
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-[#061018]"
                            style={{ background: visual.accent }}
                          >
                            {visual.markAr}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-extrabold text-[#f4efe4]">{tile.titleAr}</span>
                            <span className="mt-0.5 block truncate text-xs text-white/60">{tile.nameAr}</span>
                            <span className="mt-1 block text-xs text-white/50">{STORE_OPERATORS_DESK_COPY.expiredAr}</span>
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              to={STORE_OPERATORS_STORE_HOME}
              className="flex items-center gap-3 rounded-2xl border border-[#e8c547]/40 bg-[#e8c547]/10 p-4 hover:border-[#e8c547]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8c547] text-lg font-black text-[#061018]">
                خ
              </span>
              <span>
                <span className="block text-sm font-extrabold text-[#e8c547]">{STORE_OPERATORS_DESK_COPY.storeHomeAr}</span>
                <span className="mt-0.5 block text-xs text-white/70">{STORE_OPERATORS_DESK_COPY.storeHomeLeadAr}</span>
              </span>
            </Link>
          </section>
        ) : null}
      </main>
      <footer className="border-t border-white/10 px-4 py-6 text-center text-xs text-white/45">
        <Link to={ROUTE_PATHS.STORE_LANDING} className="hover:text-[#e8c547]">
          {STORE_OPERATORS_DESK_COPY.storeHomeAr}
        </Link>
      </footer>
    </StoreVisitorShell>
  );
}
