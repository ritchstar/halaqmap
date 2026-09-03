/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دفع اشتراك حلانا1 — 894 أو 1788 ر.س، وسم store_halana_live.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoyasarOfficialTrustChip } from '@/components/billing/MoyasarOfficialTrustChip';
import { LEGAL_ECOMMERCE_STORE_NAME } from '@/config/partnerLegal';
import {
  STORE_HALANA_LIVE,
  STORE_HALANA_LIVE_CHECKOUT_ENABLED,
  STORE_HALANA_LIVE_PRICE_12_HALALAS,
  STORE_HALANA_LIVE_PRICE_6_HALALAS,
  STORE_HALANA_LIVE_PRODUCT,
} from '@/config/storeHalanaLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  getMoyasarGlobal,
  loadMoyasarFormScript,
  MOYASAR_APPLE_PAY_VALIDATE_URL,
} from '@/lib/moyasarFormLoader';
import { persistMoyasarLastPaymentId } from '@/lib/moyasarPaymentReturn';
import {
  buildHalanaLiveCallbackUrl,
  isAllowedMoyasarInvoiceUrl,
  isHalanaLivePaymentReturn,
  readHalanaLiveReturnPaymentId,
  resolveHalanaLivePublishableKey,
  halanaLiveLivePaymentsEnabled,
} from '@/lib/storeHalanaLiveMoyasar';
import { activateHalanaLive, fetchHalanaLivePay, syncHalanaLive } from '@/lib/storeHalanaLiveRemote';
import { halanaLiveViewHref } from '@/lib/storeHostRedirect';
import { ROUTE_PATHS } from '@/lib/routePaths';

function payErrorAr(raw: unknown): string {
  const s = typeof raw === 'string' ? raw.trim() : '';
  if (!s || /^HTTP \d+/.test(s)) return 'تعذر التحقق من الدفع. أكمل من النموذج أدناه أو أعد المحاولة.';
  return s;
}

function priceLabel(halalas: number): string {
  if (halalas === STORE_HALANA_LIVE_PRICE_12_HALALAS) return '1788 ر.س لثلاثمئة وستين يوماً';
  if (halalas === STORE_HALANA_LIVE_PRICE_6_HALALAS) return '894 ر.س لمئة وثمانين يوماً';
  return '';
}

function invoiceDescription(halalas: number): string {
  return halalas === STORE_HALANA_LIVE_PRICE_12_HALALAS
    ? 'halaqmap — حلانا1 360 يوماً'
    : 'halaqmap — حلانا1 180 يوماً';
}

export default function StoreHalanaPayPage() {
  useDocumentTitle('دفع حلانا1 — halaqmap');
  const { token = '' } = useParams<{ token: string }>();
  const activateOnceRef = useRef(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState('loading');
  const [priceHalalas, setPriceHalalas] = useState(0);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [error, setError] = useState('');
  const [activating, setActivating] = useState(false);
  const [shopName, setShopName] = useState('');

  const publishableKey = useMemo(() => resolveHalanaLivePublishableKey(), []);
  const liveMoney = halanaLiveLivePaymentsEnabled();
  const amountOk =
    priceHalalas === STORE_HALANA_LIVE_PRICE_6_HALALAS
    || priceHalalas === STORE_HALANA_LIVE_PRICE_12_HALALAS;
  const payable = status === 'pending_payment' || status === 'pending_renewal';

  useEffect(() => {
    let cancelled = false;
    void fetchHalanaLivePay(token).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setStatus('missing');
        setError(String(result.error || ''));
        return;
      }
      setStatus(String(result.status || ''));
      setPriceHalalas(Number(result.priceHalalas || 0));
      setInvoiceUrl(String(result.invoiceUrl || ''));
      setShopName(String(result.shopName || ''));
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !payable || activateOnceRef.current) return;
    if (!isHalanaLivePaymentReturn()) return;
    const paymentId = readHalanaLiveReturnPaymentId();
    const hasInvoice = isAllowedMoyasarInvoiceUrl(invoiceUrl);
    if (!paymentId && !hasInvoice) return;
    let cancelled = false;
    setActivating(true);
    const run = paymentId ? activateHalanaLive(token, paymentId) : syncHalanaLive(token);
    void run.then((result) => {
      if (cancelled) return;
      const finishOk = () => {
        activateOnceRef.current = true;
        window.location.replace(halanaLiveViewHref(token));
      };
      if (result.ok) {
        finishOk();
        return;
      }
      if (paymentId && hasInvoice) {
        void syncHalanaLive(token).then((synced) => {
          if (cancelled) return;
          if (synced.ok) {
            finishOk();
            return;
          }
          setActivating(false);
          setError(payErrorAr(synced.error || result.error));
        });
        return;
      }
      setActivating(false);
      if (paymentId) setError(payErrorAr(result.error));
    });
    return () => {
      cancelled = true;
    };
  }, [token, payable, invoiceUrl]);

  const hostedInvoice = isAllowedMoyasarInvoiceUrl(invoiceUrl);

  useEffect(() => {
    if (
      !STORE_HALANA_LIVE_CHECKOUT_ENABLED ||
      !payable ||
      activating ||
      hostedInvoice ||
      !amountOk ||
      !publishableKey.startsWith('pk_')
    ) {
      return;
    }
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    host.innerHTML = '';
    void loadMoyasarFormScript()
      .then(() => {
        if (cancelled) return;
        const Moyasar = getMoyasarGlobal();
        if (!Moyasar?.init) {
          setError('تعذر تجهيز بوابة الدفع.');
          return;
        }
        const applePaySupported = (() => {
          try {
            const AP = (window as unknown as { ApplePaySession?: { canMakePayments?: () => boolean } }).ApplePaySession;
            return !!AP && typeof AP.canMakePayments === 'function' && AP.canMakePayments();
          } catch {
            return false;
          }
        })();
        Moyasar.init({
          element: host,
          amount: priceHalalas,
          currency: 'SAR',
          description: invoiceDescription(priceHalalas),
          publishable_api_key: publishableKey,
          callback_url: buildHalanaLiveCallbackUrl(token),
          supported_networks: ['visa', 'mastercard'],
          methods: applePaySupported ? ['creditcard', 'applepay'] : ['creditcard'],
          ...(applePaySupported
            ? {
                apple_pay: {
                  country: 'SA',
                  label: LEGAL_ECOMMERCE_STORE_NAME,
                  validate_merchant_url: MOYASAR_APPLE_PAY_VALIDATE_URL,
                },
              }
            : {}),
          language: 'ar',
          fixed_width: false,
          metadata: {
            product: STORE_HALANA_LIVE_PRODUCT,
            product_type: STORE_HALANA_LIVE_PRODUCT,
            store_halana_token: token,
          },
          on_completed: (payment: unknown) => {
            const id =
              typeof payment === 'object' && payment != null && 'id' in payment
                ? String((payment as { id?: unknown }).id ?? '').trim()
                : '';
            if (!id) return;
            persistMoyasarLastPaymentId(id);
            if (activateOnceRef.current) return;
            activateOnceRef.current = true;
            setActivating(true);
            void activateHalanaLive(token, id).then((result) => {
              if (result.ok) {
                window.location.replace(halanaLiveViewHref(token));
                return;
              }
              setActivating(false);
              activateOnceRef.current = false;
              setError(payErrorAr(result.error));
            });
          },
        });
      })
      .catch(() => {
        if (!cancelled) setError('تعذر تحميل بوابة الدفع.');
      });
    return () => {
      cancelled = true;
      if (hostRef.current) hostRef.current.innerHTML = '';
    };
  }, [status, activating, hostedInvoice, amountOk, publishableKey, token, payable, priceHalalas]);

  return (
    <div dir="rtl" className="min-h-[100svh] bg-[#061018] text-[#f4efe4]">
      <main className="mx-auto max-w-lg px-4 py-12">
        <p className="text-sm font-bold text-[#c45c7a]">halaqmap</p>
        <h1 className="mt-2 text-2xl font-extrabold">دفع حلانا1</h1>
        {!STORE_HALANA_LIVE_CHECKOUT_ENABLED ? (
          <p className="mt-3 text-sm leading-7 text-white/70">{STORE_HALANA_LIVE.checkoutClosedAr}</p>
        ) : null}
        {status === 'loading' ? <p className="mt-6 text-sm text-white/60">جاري تجهيز الدفع…</p> : null}
        {status === 'missing' ? <p className="mt-6 text-sm text-white/70">{error || 'الرابط غير موجود.'}</p> : null}
        {status === 'live' || status === 'issued' ? (
          <p className="mt-6 text-sm text-white/70">
            التشغيل حيّ.{' '}
            <a className="underline" href={halanaLiveViewHref(token)}>
              فتح المعرض
            </a>
          </p>
        ) : null}
        {payable && STORE_HALANA_LIVE_CHECKOUT_ENABLED ? (
          <>
            <p className="mt-3 text-sm leading-7 text-white/70">
              {shopName || STORE_HALANA_LIVE.titleAr} — {priceLabel(priceHalalas)}
            </p>
            {!liveMoney ? (
              <p className="mt-3 rounded-xl border border-[#c45c7a]/30 bg-[#c45c7a]/10 px-3 py-2 text-xs leading-6">
                هذه تجربة دفع تجريبية. لا يُخصم مبلغ حقيقي، وبطاقة الاختبار `4111 1111 1111 1111`.
              </p>
            ) : null}
            {activating ? <p className="mt-4 text-sm text-white/70">جاري تفعيل الصفحة بعد الدفع…</p> : null}
            {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
            {hostedInvoice && !activating ? (
              <a
                href={invoiceUrl}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#c45c7a] px-4 py-3 text-sm font-bold text-[#061018]"
              >
                إتمام الدفع عبر بوابة الدفع
              </a>
            ) : null}
            {!hostedInvoice && !publishableKey.startsWith('pk_') ? (
              <p className="mt-4 text-sm text-red-300">
                {liveMoney ? 'بوابة الدفع غير جاهزة حالياً.' : 'بوابة الدفع التجريبية غير جاهزة حالياً.'}
              </p>
            ) : null}
            {!hostedInvoice && publishableKey.startsWith('pk_') ? (
              <>
                <div className="mt-5">
                  <MoyasarOfficialTrustChip variant="banner" />
                </div>
                <div ref={hostRef} className="mt-4 min-h-[220px]" />
              </>
            ) : null}
          </>
        ) : null}
        <Link to={ROUTE_PATHS.STORE_HALANA} className="mt-8 inline-block text-sm text-white/50 underline">
          {STORE_HALANA_LIVE.titleAr}
        </Link>
      </main>
    </div>
  );
}
