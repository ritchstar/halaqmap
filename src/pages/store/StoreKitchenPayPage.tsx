/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دفع طبختنا1 — 300 أو 600 ر.س، وسم store_kitchen_live.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoyasarOfficialTrustChip } from '@/components/billing/MoyasarOfficialTrustChip';
import { LEGAL_ECOMMERCE_STORE_NAME } from '@/config/partnerLegal';
import {
  STORE_KITCHEN_LIVE,
  STORE_KITCHEN_LIVE_CHECKOUT_ENABLED,
  STORE_KITCHEN_LIVE_PRICE_12_HALALAS,
  STORE_KITCHEN_LIVE_PRICE_6_HALALAS,
  STORE_KITCHEN_LIVE_PRODUCT,
} from '@/config/storeKitchenLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  getMoyasarGlobal,
  loadMoyasarFormScript,
  MOYASAR_APPLE_PAY_VALIDATE_URL,
} from '@/lib/moyasarFormLoader';
import { persistMoyasarLastPaymentId } from '@/lib/moyasarPaymentReturn';
import {
  buildKitchenLiveCallbackUrl,
  isAllowedMoyasarInvoiceUrl,
  isKitchenLivePaymentReturn,
  readKitchenLiveReturnPaymentId,
  resolveKitchenLivePublishableKey,
  kitchenLiveLivePaymentsEnabled,
} from '@/lib/storeKitchenLiveMoyasar';
import { activateKitchenLive, fetchKitchenLivePay, syncKitchenLive } from '@/lib/storeKitchenLiveRemote';
import { kitchenLiveViewHref } from '@/lib/storeHostRedirect';
import { ROUTE_PATHS } from '@/lib/routePaths';

function payErrorAr(raw: unknown): string {
  const s = typeof raw === 'string' ? raw.trim() : '';
  if (!s || /^HTTP \d+/.test(s)) return 'تعذر التحقق من الدفع. أكمل من النموذج أدناه أو أعد المحاولة.';
  return s;
}

function priceLabel(halalas: number): string {
  if (halalas === STORE_KITCHEN_LIVE_PRICE_12_HALALAS) return '600 ر.س لثلاثمئة وستين يوماً';
  if (halalas === STORE_KITCHEN_LIVE_PRICE_6_HALALAS) return '300 ر.س لمئة وثمانين يوماً';
  return '';
}

function invoiceDescription(halalas: number): string {
  return halalas === STORE_KITCHEN_LIVE_PRICE_12_HALALAS
    ? 'halaqmap — طبختنا1 360 يوماً'
    : 'halaqmap — طبختنا1 180 يوماً';
}

export default function StoreKitchenPayPage() {
  useDocumentTitle('دفع طبختنا1 — halaqmap');
  const { token = '' } = useParams<{ token: string }>();
  const activateOnceRef = useRef(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState('loading');
  const [priceHalalas, setPriceHalalas] = useState(0);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [error, setError] = useState('');
  const [activating, setActivating] = useState(false);
  const [shopName, setShopName] = useState('');

  const publishableKey = useMemo(() => resolveKitchenLivePublishableKey(), []);
  const liveMoney = kitchenLiveLivePaymentsEnabled();
  const amountOk =
    priceHalalas === STORE_KITCHEN_LIVE_PRICE_6_HALALAS
    || priceHalalas === STORE_KITCHEN_LIVE_PRICE_12_HALALAS;
  const payable = status === 'pending_payment' || status === 'pending_renewal';

  useEffect(() => {
    let cancelled = false;
    void fetchKitchenLivePay(token).then((result) => {
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
    if (!isKitchenLivePaymentReturn()) return;
    const paymentId = readKitchenLiveReturnPaymentId();
    const hasInvoice = isAllowedMoyasarInvoiceUrl(invoiceUrl);
    if (!paymentId && !hasInvoice) return;
    let cancelled = false;
    setActivating(true);
    const run = paymentId ? activateKitchenLive(token, paymentId) : syncKitchenLive(token);
    void run.then((result) => {
      if (cancelled) return;
      const finishOk = () => {
        activateOnceRef.current = true;
        window.location.replace(kitchenLiveViewHref(token));
      };
      if (result.ok) {
        finishOk();
        return;
      }
      if (paymentId && hasInvoice) {
        void syncKitchenLive(token).then((synced) => {
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
      !STORE_KITCHEN_LIVE_CHECKOUT_ENABLED ||
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
          callback_url: buildKitchenLiveCallbackUrl(token),
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
            product: STORE_KITCHEN_LIVE_PRODUCT,
            product_type: STORE_KITCHEN_LIVE_PRODUCT,
            store_kitchen_token: token,
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
            void activateKitchenLive(token, id).then((result) => {
              if (result.ok) {
                window.location.replace(kitchenLiveViewHref(token));
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
        <p className="text-sm font-bold text-[#b45a3c]">halaqmap</p>
        <h1 className="mt-2 text-2xl font-extrabold">دفع طبختنا1</h1>
        {!STORE_KITCHEN_LIVE_CHECKOUT_ENABLED ? (
          <p className="mt-3 text-sm leading-7 text-white/70">{STORE_KITCHEN_LIVE.checkoutClosedAr}</p>
        ) : null}
        {status === 'loading' ? <p className="mt-6 text-sm text-white/60">جاري تجهيز الدفع…</p> : null}
        {status === 'missing' ? <p className="mt-6 text-sm text-white/70">{error || 'الرابط غير موجود.'}</p> : null}
        {status === 'live' ? (
          <p className="mt-6 text-sm text-white/70">
            التشغيل حيّ.{' '}
            <a className="underline" href={kitchenLiveViewHref(token)}>
              فتح صفحة النشاط
            </a>
          </p>
        ) : null}
        {payable && STORE_KITCHEN_LIVE_CHECKOUT_ENABLED ? (
          <>
            <p className="mt-3 text-sm leading-7 text-white/70">
              {shopName || STORE_KITCHEN_LIVE.titleAr} — {priceLabel(priceHalalas)}
            </p>
            {!liveMoney ? (
              <p className="mt-3 rounded-xl border border-[#b45a3c]/30 bg-[#b45a3c]/10 px-3 py-2 text-xs leading-6">
                هذه تجربة دفع تجريبية. لا يُخصم مبلغ حقيقي، وبطاقة الاختبار `4111 1111 1111 1111`.
              </p>
            ) : null}
            {activating ? <p className="mt-4 text-sm text-white/70">جاري تفعيل الصفحة بعد الدفع…</p> : null}
            {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
            {hostedInvoice && !activating ? (
              <a
                href={invoiceUrl}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#b45a3c] px-4 py-3 text-sm font-bold text-[#061018]"
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
        <Link to={ROUTE_PATHS.STORE_KITCHEN} className="mt-8 inline-block text-sm text-white/50 underline">
          {STORE_KITCHEN_LIVE.titleAr}
        </Link>
      </main>
    </div>
  );
}
