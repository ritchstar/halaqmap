/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * كتالوج عمولة منتجات المتجر ودخول اللوحة برابط سري.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import {
  STORE_AFFILIATE_COPY,
  STORE_AFFILIATE_LINES,
  affiliateNetSar,
  type StoreAffiliateLineId,
} from '@/config/storeAffiliateLive';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import { ROUTE_PATHS } from '@/lib/routePaths';
import {
  fetchStoreAffiliateMe,
  logoutStoreAffiliate,
  redeemStoreAffiliateMagic,
  sendStoreAffiliateMagic,
  type StoreAffiliateMarketer,
} from '@/lib/storeAffiliateRemote';

function lineTitle(lineId: string): string {
  const labels = STORE_AFFILIATE_COPY.lineLabelAr;
  if (lineId in labels) return labels[lineId as StoreAffiliateLineId];
  return lineId;
}

export function AffiliateStoreLane({ hideCatalog = false }: { hideCatalog?: boolean }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marketer, setMarketer] = useState<StoreAffiliateMarketer | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const magic = readHashQueryParam('magic');
      if (magic) {
        const redeemed = await redeemStoreAffiliateMagic(magic);
        if (cancelled) return;
        if (redeemed.ok && redeemed.marketer && typeof redeemed.marketer === 'object') {
          setMarketer(redeemed.marketer as StoreAffiliateMarketer);
          toast.success('تم فتح اللوحة.');
        } else {
          toast.error(typeof redeemed.error === 'string' ? redeemed.error : 'الرابط منتهٍ أو مستهلك.');
        }
        navigate(ROUTE_PATHS.STORE_AFFILIATES_DESK, { replace: true });
        setLoading(false);
        return;
      }
      const me = await fetchStoreAffiliateMe();
      if (cancelled) return;
      if (me.ok && me.marketer && typeof me.marketer === 'object') {
        setMarketer(me.marketer as StoreAffiliateMarketer);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error('أدخل إيميلاً صالحاً لإرسال رابط الدخول.');
      return;
    }
    setBusy(true);
    const result = await sendStoreAffiliateMagic(value);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error || 'تعذر إرسال الرابط.');
      return;
    }
    toast.success(STORE_AFFILIATE_COPY.storeLoginSentAr);
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('نُسخ الرابط.');
    } catch {
      toast.error('انسخ الرابط يدوياً.');
    }
  }

  async function onLogout() {
    setBusy(true);
    await logoutStoreAffiliate();
    setMarketer(null);
    setBusy(false);
    toast.message('خرجت من اللوحة.');
  }

  if (loading) {
    return <p className="text-sm text-slate-400">جاري التحميل…</p>;
  }

  if (marketer) {
    const links = [
      { id: 'wedding' as const, href: marketer.links.wedding },
      { id: 'event' as const, href: marketer.links.event },
      { id: 'lounge' as const, href: marketer.links.lounge },
      { id: 'grocers' as const, href: marketer.links.grocers },
    ];
    return (
      <div className="space-y-6">
        <p className="text-sm leading-8 text-slate-300">{STORE_AFFILIATE_COPY.storeLeadAr}</p>
        <p className="rounded-2xl border border-amber-300/25 bg-amber-400/5 px-4 py-3 text-sm leading-7 text-amber-100">
          {STORE_AFFILIATE_COPY.storeOngoingAr}
        </p>
        <section className="rounded-2xl border border-teal-400/25 bg-teal-500/5 p-5">
          <p className="text-base font-extrabold text-white">{STORE_AFFILIATE_COPY.deskTitleAr}</p>
          <p className="mt-2 text-sm text-slate-300">{marketer.displayName}</p>
          <p className="mt-1 text-sm text-teal-200" dir="ltr">
            {marketer.code}
          </p>
          <p className="mt-3 text-sm font-bold text-white">
            {STORE_AFFILIATE_COPY.commissionLabelAr}: {marketer.commissionSar} ر.س
          </p>
        </section>
        <section className="space-y-3">
          <p className="text-base font-extrabold text-white">{STORE_AFFILIATE_COPY.deskLinksTitleAr}</p>
          {links.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-bold text-white">{STORE_AFFILIATE_COPY.deskLinkAr[item.id]}</p>
                <p className="mt-1 truncate text-xs text-slate-400" dir="ltr">
                  {item.href}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void copyLink(item.href)}
                className="rounded-xl border border-teal-400/40 px-3 py-2 text-xs font-bold text-teal-100 hover:bg-teal-500/10"
              >
                نسخ الرابط
              </button>
            </div>
          ))}
        </section>
        <section className="space-y-3">
          <p className="text-base font-extrabold text-white">{STORE_AFFILIATE_COPY.deskLedgerTitleAr}</p>
          {marketer.ledger.length === 0 ? (
            <p className="text-sm leading-7 text-slate-400">{STORE_AFFILIATE_COPY.deskEmptyAr}</p>
          ) : (
            <ul className="space-y-2">
              {marketer.ledger.map((row) => (
                <li key={row.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                  <p className="font-bold text-white">{lineTitle(row.lineId)}</p>
                  <p className="mt-1 text-slate-300">
                    {STORE_AFFILIATE_COPY.commissionLabelAr}: {row.commissionSar} ر.س
                    {' · '}
                    {STORE_AFFILIATE_COPY.netLabelAr}: {row.netSar} ر.س
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onLogout()}
          className="w-full rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-slate-200 hover:border-teal-400/40 disabled:opacity-60"
        >
          {STORE_AFFILIATE_COPY.deskLogoutAr}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm leading-8 text-slate-300">{STORE_AFFILIATE_COPY.storeLeadAr}</p>
      <p className="rounded-2xl border border-amber-300/25 bg-amber-400/5 px-4 py-3 text-sm leading-7 text-amber-100">
        {STORE_AFFILIATE_COPY.deskGateAr}
      </p>
      {hideCatalog ? null : (
      <ul className="space-y-3">
        {STORE_AFFILIATE_LINES.map((line) => (
          <li
            key={line.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5"
          >
            <p className="text-base font-extrabold text-white">
              {line.titleAr}
              <span className="mr-2 text-sm font-bold text-teal-200/80">{line.packAr}</span>
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              {STORE_AFFILIATE_COPY.priceLabelAr}: {line.priceSar} ر.س
              {' · '}
              {STORE_AFFILIATE_COPY.commissionLabelAr}: {line.commissionSar} ر.س
              {' · '}
              {STORE_AFFILIATE_COPY.netLabelAr}: {affiliateNetSar(line.priceSar, line.commissionSar)} ر.س
            </p>
          </li>
        ))}
      </ul>
      )}
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="space-y-3 rounded-2xl border border-teal-400/25 bg-teal-500/5 p-5"
      >
        <p className="text-base font-extrabold text-white">{STORE_AFFILIATE_COPY.storeLoginTitleAr}</p>
        <p className="text-sm leading-7 text-slate-300">{STORE_AFFILIATE_COPY.storeLoginLeadAr}</p>
        <label className="block text-sm text-slate-200">
          الإيميل
          <input
            className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-base text-[#f4efe4]"
            dir="ltr"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={STORE_AFFILIATE_COPY.storeLoginPlaceholderAr}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-black hover:bg-teal-400 disabled:opacity-60"
        >
          {STORE_AFFILIATE_COPY.storeLoginCtaAr}
        </button>
        <p className="text-xs leading-6 text-slate-500">{STORE_AFFILIATE_COPY.storeLoginHintAr}</p>
      </form>
    </div>
  );
}
