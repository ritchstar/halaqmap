/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * كتالوج عمولة منتجات المتجر ودخول اللوحة برابط سري.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { StoreProductLinkIconGrid } from '@/components/store/StoreProductLinkIconGrid';
import {
  STORE_AFFILIATE_COPY,
  STORE_AFFILIATE_LINES,
  affiliateNetSar,
  type StoreAffiliateLineId,
} from '@/config/storeAffiliateLive';
import {
  STORE_PRODUCT_TRIAL_COPY,
  STORE_PRODUCT_TRIAL_KEYS,
  STORE_PRODUCT_TRIAL_PRODUCTS,
  STORE_PRODUCT_TRIAL_QUOTA,
  isGiftTrialProduct,
  type StoreProductTrialKey,
} from '@/config/storeProductTrial';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import { ROUTE_PATHS } from '@/lib/routePaths';
import {
  fetchStoreAffiliateMe,
  listStoreAffiliateTrials,
  logoutStoreAffiliate,
  redeemStoreAffiliateMagic,
  requestStoreAffiliateTrial,
  sendStoreAffiliateMagic,
  type StoreAffiliateMarketer,
  type StoreAffiliateTrialRow,
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
  const [trials, setTrials] = useState<StoreAffiliateTrialRow[]>([]);
  const [trialUsed, setTrialUsed] = useState<Record<string, number>>({});
  const [trialEmails, setTrialEmails] = useState<Record<StoreProductTrialKey, string>>({
    wedding: '',
    event: '',
    lounge: '',
    grocers: '',
    restaurant: '',
    cafe: '',
    produce: '',
  });

  async function loadTrials() {
    const listed = await listStoreAffiliateTrials();
    if (!listed.ok) return;
    setTrials(Array.isArray(listed.rows) ? (listed.rows as StoreAffiliateTrialRow[]) : []);
    setTrialUsed(listed.used && typeof listed.used === 'object' ? (listed.used as Record<string, number>) : {});
  }

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
          void loadTrials();
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
        void loadTrials();
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
      toast.success(STORE_AFFILIATE_COPY.deskLinkCopiedAr);
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

  async function submitTrial(productKey: StoreProductTrialKey) {
    const email = trialEmails[productKey].trim();
    setBusy(true);
    const result = await requestStoreAffiliateTrial(productKey, email);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error || 'تعذر إرسال الطلب.');
      return;
    }
    toast.success(STORE_PRODUCT_TRIAL_COPY.sentAr);
    setTrialEmails((prev) => ({ ...prev, [productKey]: '' }));
    void loadTrials();
  }

  if (loading) {
    return <p className="text-sm text-slate-400">جاري التحميل…</p>;
  }

  if (marketer) {
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
        <section className="space-y-3 rounded-2xl border border-[#e8c547]/25 bg-[#07141c] px-4 py-5">
          <p className="text-center text-base font-extrabold text-white">{STORE_AFFILIATE_COPY.deskLinksTitleAr}</p>
          <p className="text-center text-sm leading-7 text-slate-400">{STORE_AFFILIATE_COPY.deskLinksHintAr}</p>
          <StoreProductLinkIconGrid
            links={{
              wedding: marketer.links.wedding,
              event: marketer.links.event,
              lounge: marketer.links.lounge,
              grocers: marketer.links.grocers,
              restaurant: marketer.links.restaurant,
              cafe: marketer.links.cafe,
              kitchen: marketer.links.kitchen || '',
              produce: marketer.links.produce || '',
            }}
            onPick={(href) => void copyLink(href)}
          />
        </section>
        <section className="space-y-4 rounded-2xl border border-amber-300/25 bg-amber-400/5 p-5">
          <p className="text-base font-extrabold text-white">{STORE_PRODUCT_TRIAL_COPY.marketerTitleAr}</p>
          <p className="text-sm leading-7 text-slate-300">{STORE_PRODUCT_TRIAL_COPY.marketerLeadAr}</p>
          <p className="text-sm leading-7 text-amber-100">{STORE_PRODUCT_TRIAL_COPY.firstVisitAr}</p>
          {STORE_PRODUCT_TRIAL_KEYS.map((key) => {
            const product = STORE_PRODUCT_TRIAL_PRODUCTS[key];
            const used = trialUsed[key] || 0;
            const remaining = Math.max(0, STORE_PRODUCT_TRIAL_QUOTA - used);
            return (
              <div key={key} className="rounded-2xl border border-white/10 bg-[#07141c] p-4">
                <p className="font-extrabold text-white">{product.titleAr}</p>
                <p className="mt-1 text-xs text-teal-200">
                  {used} من {STORE_PRODUCT_TRIAL_QUOTA} · المتبقي {remaining}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-400">{product.howToAr}</p>
                {isGiftTrialProduct(key) ? (
                  <p className="mt-2 text-sm leading-7 text-amber-100/90">{STORE_PRODUCT_TRIAL_COPY.giftCourtesyAr}</p>
                ) : null}
                <label className="mt-3 block text-sm">
                  إيميل المستفيد
                  <input
                    className="mt-1 h-11 w-full rounded-md border border-white/15 bg-[#061018] px-3"
                    dir="ltr"
                    type="email"
                    value={trialEmails[key]}
                    onChange={(event) => setTrialEmails((prev) => ({ ...prev, [key]: event.target.value }))}
                  />
                </label>
                <button
                  type="button"
                  disabled={busy || remaining <= 0}
                  onClick={() => void submitTrial(key)}
                  className="mt-3 w-full rounded-xl bg-teal-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-60"
                >
                  طلب نموذج تجريبي
                </button>
              </div>
            );
          })}
          {trials.length > 0 ? (
            <ul className="space-y-2">
              {trials.map((row) => (
                <li key={row.id} className="rounded-xl border border-white/10 px-3 py-2 text-sm">
                  <span className="font-bold text-white">
                    {STORE_PRODUCT_TRIAL_PRODUCTS[row.product_key as StoreProductTrialKey]?.titleAr || row.product_key}
                  </span>
                  {' · '}
                  <span className="text-slate-300">
                    {STORE_PRODUCT_TRIAL_COPY.statusAr[row.status as keyof typeof STORE_PRODUCT_TRIAL_COPY.statusAr] ||
                      row.status}
                  </span>
                  <span className="mt-1 block text-slate-400" dir="ltr">
                    {row.beneficiary_email}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
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
