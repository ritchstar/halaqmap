/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دفع تموينات الحي — 599 أو 899 ر.س، وسم store_grocers_live.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoyasarOfficialTrustChip } from '@/components/billing/MoyasarOfficialTrustChip';
import { LEGAL_ECOMMERCE_STORE_NAME } from '@/config/partnerLegal';
import {
  STORE_GROCERS_CHAT_ADDON_12_HALALAS,
  STORE_GROCERS_CHAT_ADDON_6_HALALAS,
  STORE_GROCERS_LIVE,
  STORE_GROCERS_LIVE_CHECKOUT_ENABLED,
  STORE_GROCERS_LIVE_PRICE_12_HALALAS,
  STORE_GROCERS_LIVE_PRICE_6_HALALAS,
  STORE_GROCERS_LIVE_PRODUCT,
} from '@/config/storeGrocersLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  getMoyasarGlobal,
  loadMoyasarFormScript,
  MOYASAR_APPLE_PAY_VALIDATE_URL,
} from '@/lib/moyasarFormLoader';
import { persistMoyasarLastPaymentId } from '@/lib/moyasarPaymentReturn';
import {
  buildGrocersLiveCallbackUrl,
  grocersLiveLivePaymentsEnabled,
  isAllowedMoyasarInvoiceUrl,
  isGrocersLivePaymentReturn,
  readGrocersLiveReturnPaymentId,
  resolveGrocersLivePublishableKey,
} from '@/lib/storeGrocersLiveMoyasar';
import { activateGrocersLive, fetchGrocersLivePay, syncGrocersLive } from '@/lib/storeGrocersLiveRemote';
import { grocersLiveViewHref } from '@/lib/storeHostRedirect';
import { ROUTE_PATHS } from '@/lib/routePaths';

function payErrorAr(raw: unknown): string {
  const s = typeof raw === 'string' ? raw.trim() : '';
  if (!s || /^HTTP \d+/.test(s)) return 'تعذر التحقق من الدفع. أكمل من النموذج أدناه أو أعد المحاولة.';
  return s;
}

const PRICE_6_CHAT = STORE_GROCERS_LIVE_PRICE_6_HALALAS + STORE_GROCERS_CHAT_ADDON_6_HALALAS;
const PRICE_12_CHAT = STORE_GROCERS_LIVE_PRICE_12_HALALAS + STORE_GROCERS_CHAT_ADDON_12_HALALAS;

function hasChatAddon(halalas: number): boolean {
  return halalas === PRICE_6_CHAT || halalas === PRICE_12_CHAT;
}

function priceLabel(halalas: number): string {
  if (halalas === STORE_GROCERS_LIVE_PRICE_12_HALALAS) return '899 ر.س لاثني عشر شهراً';
  if (halalas === STORE_GROCERS_LIVE_PRICE_6_HALALAS) return '599 ر.س لستة أشهر';
  if (halalas === PRICE_12_CHAT) return '899 ر.س لاثني عشر شهراً + صندوق محادثة';
  if (halalas === PRICE_6_CHAT) return '599 ر.س لستة أشهر + صندوق محادثة';
  return '';
}

function invoiceDescription(halalas: number): string {
  const year = halalas === STORE_GROCERS_LIVE_PRICE_12_HALALAS || halalas === PRICE_12_CHAT;
  const base = year ? 'halaqmap — تمويناتا1 12 شهراً' : 'halaqmap — تمويناتا1 6 أشهر';
  return hasChatAddon(halalas) ? `${base} + صندوق محادثة` : base;
}

export default function StoreGrocersPayPage() {
  useDocumentTitle('دفع تمويناتا1 — halaqmap');
  const { token = '' } = useParams<{ token: string }>();
  const activateOnceRef = useRef(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState('loading');
  const [priceHalalas, setPriceHalalas] = useState(0);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [error, setError] = useState('');
  const [activating, setActivating] = useState(false);
  const [shopName, setShopName] = useState('');

  const publishableKey = useMemo(() => resolveGrocersLivePublishableKey(), []);
  const liveMoney = grocersLiveLivePaymentsEnabled();
  const amountOk =
    priceHalalas === STORE_GROCERS_LIVE_PRICE_6_HALALAS
    || priceHalalas === STORE_GROCERS_LIVE_PRICE_12_HALALAS
    || priceHalalas === PRICE_6_CHAT
    || priceHalalas === PRICE_12_CHAT;
  const payable = status === 'pending_payment' || status === 'pending_renewal';

  useEffect(() => {
    let cancelled = false;
    void fetchGrocersLivePay(token).then((result) => {
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
    if (!isGrocersLivePaymentReturn()) return;
    const paymentId = readGrocersLiveReturnPaymentId();
    const hasInvoice = isAllowedMoyasarInvoiceUrl(invoiceUrl);
    if (!paymentId && !hasInvoice) return;
    let cancelled = false;
    setActivating(true);
    const run = paymentId ? activateGrocersLive(token, paymentId) : syncGrocersLive(token);
    void run.then((result) => {
      if (cancelled) return;
      const finishOk = () => {
        activateOnceRef.current = true;
        window.location.replace(grocersLiveViewHref(token));
      };
      if (result.ok) {
        finishOk();
        return;
      }
      if (paymentId && hasInvoice) {
        void syncGrocersLive(token).then((synced) => {
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
      !STORE_GROCERS_LIVE_CHECKOUT_ENABLED ||
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
          setError('تعذر تهيئة مكتبة ميسر.');
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
          callback_url: buildGrocersLiveCallbackUrl(token),
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
            product: STORE_GROCERS_LIVE_PRODUCT,
            product_type: STORE_GROCERS_LIVE_PRODUCT,
            store_grocers_token: token,
            store_grocers_chat: hasChatAddon(priceHalalas) ? '1' : '0',
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
            void activateGrocersLive(token, id).then((result) => {
              if (result.ok) {
                window.location.replace(grocersLiveViewHref(token));
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
        if (!cancelled) setError('تعذر تحميل سكربت ميسر من CDN.');
      });
    return () => {
      cancelled = true;
      if (hostRef.current) hostRef.current.innerHTML = '';
    };
  }, [status, activating, hostedInvoice, amountOk, publishableKey, token, payable, priceHalalas]);

  return (
    <div dir="rtl" className="min-h-[100svh] bg-[#061018] text-[#f4efe4]">
      <main className="mx-auto max-w-lg px-4 py-12">
        <p className="text-sm font-bold text-[#8fbf7a]">halaqmap</p>
        <h1 className="mt-2 text-2xl font-extrabold">دفع تمويناتا1</h1>
        {!STORE_GROCERS_LIVE_CHECKOUT_ENABLED ? (
          <p className="mt-3 text-sm leading-7 text-white/70">بوابة الدفع غير مفتوحة لهذا المنتج بعد.</p>
        ) : null}
        {status === 'loading' ? <p className="mt-6 text-sm text-white/60">جاري تجهيز الدفع…</p> : null}
        {status === 'missing' ? <p className="mt-6 text-sm text-white/70">{error || 'الرابط غير موجود.'}</p> : null}
        {status === 'live' ? (
          <p className="mt-6 text-sm text-white/70">
            التشغيل حيّ.{' '}
            <a className="underline" href={grocersLiveViewHref(token)}>
              فتح متجر التموينات
            </a>
          </p>
        ) : null}
        {payable && STORE_GROCERS_LIVE_CHECKOUT_ENABLED ? (
          <>
            <p className="mt-3 text-sm leading-7 text-white/70">
              {shopName || STORE_GROCERS_LIVE.titleAr} — {priceLabel(priceHalalas)}
            </p>
            {!liveMoney ? (
              <p className="mt-3 rounded-xl border border-[#8fbf7a]/30 bg-[#8fbf7a]/10 px-3 py-2 text-xs leading-6">
                التحصيل الآن في البيئة التجريبية لميسر. لا خصم حقيقي، وبطاقة الاختبار `4111 1111 1111 1111`.
              </p>
            ) : null}
            {activating ? <p className="mt-4 text-sm text-white/70">جاري تفعيل المتجر بعد الدفع…</p> : null}
            {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
            {hostedInvoice && !activating ? (
              <a
                href={invoiceUrl}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#8fbf7a] px-4 py-3 text-sm font-bold text-[#061018]"
              >
                إتمام الدفع عبر فاتورة ميسر
              </a>
            ) : null}
            {!hostedInvoice && !publishableKey.startsWith('pk_') ? (
              <p className="mt-4 text-sm text-red-300">
                {liveMoney ? 'مفتاح ميسر الحيّ غير مهيأ لهذا المنتج.' : 'مفتاح ميسر التجريبي غير مهيأ لهذا المنتج.'}
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
        <Link to={ROUTE_PATHS.STORE_GROCERS} className="mt-8 inline-block text-sm text-white/50 underline">
          {STORE_GROCERS_LIVE.titleAr}
        </Link>
      </main>
    </div>
  );
}
