/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دفع دعوة الزواج التفاعلية — 899 ر.س، وسم store_wedding_live.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoyasarOfficialTrustChip } from '@/components/billing/MoyasarOfficialTrustChip';
import { LEGAL_ECOMMERCE_STORE_NAME } from '@/config/partnerLegal';
import {
  STORE_WEDDING_LIVE,
  STORE_WEDDING_LIVE_CHECKOUT_ENABLED,
  STORE_WEDDING_LIVE_PRICE_HALALAS,
  STORE_WEDDING_LIVE_PRICE_SAR,
  STORE_WEDDING_LIVE_PRODUCT,
} from '@/config/storeWeddingLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  getMoyasarGlobal,
  loadMoyasarFormScript,
  MOYASAR_APPLE_PAY_VALIDATE_URL,
} from '@/lib/moyasarFormLoader';
import { persistMoyasarLastPaymentId } from '@/lib/moyasarPaymentReturn';
import {
  buildWeddingLiveCallbackUrl,
  isAllowedMoyasarInvoiceUrl,
  isWeddingLivePaymentReturn,
  readWeddingLiveReturnPaymentId,
  resolveWeddingLivePublishableKey,
  weddingLiveLivePaymentsEnabled,
} from '@/lib/storeWeddingLiveMoyasar';
import { activateWeddingLive, fetchWeddingLivePay, syncWeddingLive } from '@/lib/storeWeddingLiveRemote';
import { weddingLiveViewHref } from '@/lib/storeHostRedirect';
import { ROUTE_PATHS } from '@/lib/routePaths';

function payErrorAr(raw: unknown): string {
  const s = typeof raw === 'string' ? raw.trim() : '';
  if (!s || /^HTTP \d+/.test(s)) return 'تعذر التحقق من الدفع. أكمل من النموذج أدناه أو أعد المحاولة.';
  return s;
}

export default function StoreWeddingPayPage() {
  useDocumentTitle('دفع أفراحي1 — halaqmap');
  const { token = '' } = useParams<{ token: string }>();
  const activateOnceRef = useRef(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState('loading');
  const [priceHalalas, setPriceHalalas] = useState(0);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [error, setError] = useState('');
  const [activating, setActivating] = useState(false);
  const [hostName, setHostName] = useState('');

  const publishableKey = useMemo(() => resolveWeddingLivePublishableKey(), []);
  const liveMoney = weddingLiveLivePaymentsEnabled();
  const amountOk = priceHalalas === STORE_WEDDING_LIVE_PRICE_HALALAS;

  useEffect(() => {
    let cancelled = false;
    void fetchWeddingLivePay(token).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setStatus('missing');
        setError(String(result.error || ''));
        return;
      }
      setStatus(String(result.status || ''));
      setPriceHalalas(Number(result.priceHalalas || 0));
      setInvoiceUrl(String(result.invoiceUrl || ''));
      setHostName(String(result.hostName || ''));
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || status !== 'pending_payment' || activateOnceRef.current) return;
    if (!isWeddingLivePaymentReturn()) return;
    const paymentId = readWeddingLiveReturnPaymentId();
    const hasInvoice = isAllowedMoyasarInvoiceUrl(invoiceUrl);
    if (!paymentId && !hasInvoice) return;
    let cancelled = false;
    setActivating(true);
    const run = paymentId ? activateWeddingLive(token, paymentId) : syncWeddingLive(token);
    void run.then((result) => {
      if (cancelled) return;
      const finishOk = () => {
        activateOnceRef.current = true;
        window.location.replace(weddingLiveViewHref(token));
      };
      if (result.ok) {
        finishOk();
        return;
      }
      if (paymentId && hasInvoice) {
        void syncWeddingLive(token).then((synced) => {
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
  }, [token, status, invoiceUrl]);

  const hostedInvoice = isAllowedMoyasarInvoiceUrl(invoiceUrl);

  useEffect(() => {
    if (
      !STORE_WEDDING_LIVE_CHECKOUT_ENABLED ||
      status !== 'pending_payment' ||
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
          amount: STORE_WEDDING_LIVE_PRICE_HALALAS,
          currency: 'SAR',
          description: 'halaqmap — أفراحي1',
          publishable_api_key: publishableKey,
          callback_url: buildWeddingLiveCallbackUrl(token),
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
            product: STORE_WEDDING_LIVE_PRODUCT,
            product_type: STORE_WEDDING_LIVE_PRODUCT,
            store_wedding_token: token,
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
            void activateWeddingLive(token, id).then((result) => {
              if (result.ok) {
                window.location.replace(weddingLiveViewHref(token));
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
  }, [status, activating, hostedInvoice, amountOk, publishableKey, token]);

  return (
    <div dir="rtl" className="min-h-[100svh] bg-[#061018] text-[#f4efe4]">
      <main className="mx-auto max-w-lg px-4 py-12">
        <p className="text-sm font-bold text-[#e8c547]">halaqmap</p>
        <h1 className="mt-2 text-2xl font-extrabold">دفع أفراحي1</h1>
        {!STORE_WEDDING_LIVE_CHECKOUT_ENABLED ? (
          <p className="mt-3 text-sm leading-7 text-white/70">بوابة الدفع غير مفتوحة لهذه الدعوة بعد.</p>
        ) : null}
        {status === 'loading' ? <p className="mt-6 text-sm text-white/60">جاري تجهيز الدفع…</p> : null}
        {status === 'missing' ? <p className="mt-6 text-sm text-white/70">{error || 'الرابط غير موجود.'}</p> : null}
        {status === 'live' ? (
          <p className="mt-6 text-sm text-white/70">
            الدعوة حيّة.{' '}
            <a className="underline" href={weddingLiveViewHref(token)}>
              فتح شاشة القاعة
            </a>
          </p>
        ) : null}
        {status === 'pending_payment' && STORE_WEDDING_LIVE_CHECKOUT_ENABLED ? (
          <>
            <p className="mt-3 text-sm leading-7 text-white/70">
              {hostName || STORE_WEDDING_LIVE.titleAr} — {STORE_WEDDING_LIVE_PRICE_SAR} ر.س
            </p>
            {!liveMoney ? (
              <p className="mt-3 rounded-xl border border-[#e8c547]/30 bg-[#e8c547]/10 px-3 py-2 text-xs leading-6">
                هذه تجربة دفع تجريبية. لا يُخصم مبلغ حقيقي، وبطاقة الاختبار `4111 1111 1111 1111`.
              </p>
            ) : null}
            {activating ? <p className="mt-4 text-sm text-white/70">جاري تفعيل الدعوة بعد الدفع…</p> : null}
            {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
            {hostedInvoice && !activating ? (
              <a
                href={invoiceUrl}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#e8c547] px-4 py-3 text-sm font-bold text-[#061018]"
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
        <Link to={ROUTE_PATHS.STORE_WEDDING} className="mt-8 inline-block text-sm text-white/50 underline">
          {STORE_WEDDING_LIVE.titleAr}
        </Link>
      </main>
    </div>
  );
}
