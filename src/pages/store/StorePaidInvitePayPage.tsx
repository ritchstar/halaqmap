/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دفع بطاقة مناسبة عبر ميسر — مبلغ الطبقة من الخادم، وسم مستقل عن رخصة النفاذ.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoyasarOfficialTrustChip } from '@/components/billing/MoyasarOfficialTrustChip';
import { LEGAL_ECOMMERCE_STORE_NAME } from '@/config/partnerLegal';
import {
  STORE_OCCASION_CARD_PRODUCT,
  STORE_PAID_INVITE_CHECKOUT_ENABLED,
  STORE_PAID_INVITE_COPY,
  templateById,
  type StorePaidInviteTier,
} from '@/config/storeIssuedCardsCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  getMoyasarGlobal,
  loadMoyasarFormScript,
  MOYASAR_APPLE_PAY_VALIDATE_URL,
} from '@/lib/moyasarFormLoader';
import { persistMoyasarLastPaymentId } from '@/lib/moyasarPaymentReturn';
import {
  buildOccasionCardCallbackUrl,
  occasionCardLivePaymentsEnabled,
  occasionCardMoyasarDescription,
  OCCASION_CARD_TIER_LABEL_AR,
  readOccasionCardReturnPaymentId,
  resolveOccasionCardPublishableKey,
} from '@/lib/occasionCardMoyasar';
import { activatePaidInvite, fetchIssuedCardPublic } from '@/lib/storeIssuedCardsRemote';
import { occasionCardViewHref } from '@/lib/storeHostRedirect';
import { ROUTE_PATHS } from '@/lib/routePaths';

function tierFromHalalas(amount: number): StorePaidInviteTier | null {
  if (amount === 1200) return 'quick';
  if (amount === 2900) return 'featured';
  if (amount === 5900) return 'luxury';
  return null;
}

export default function StorePaidInvitePayPage() {
  useDocumentTitle('دفع بطاقة مناسبة — halaqmap');
  const { token = '' } = useParams<{ token: string }>();
  const activateOnceRef = useRef(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState('loading');
  const [priceHalalas, setPriceHalalas] = useState(0);
  const [templateId, setTemplateId] = useState('');
  const [error, setError] = useState('');
  const [activating, setActivating] = useState(false);

  const publishableKey = useMemo(() => resolveOccasionCardPublishableKey(), []);
  const liveMoney = occasionCardLivePaymentsEnabled();
  const tier = tierFromHalalas(priceHalalas);
  const template = templateById(templateId);

  useEffect(() => {
    let cancelled = false;
    void fetchIssuedCardPublic(token).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setStatus('missing');
        setError(result.error);
        return;
      }
      setStatus(result.status);
      setPriceHalalas(Number(result.priceHalalas || 0));
      setTemplateId(String(result.templateId || ''));
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || status !== 'pending_payment' || activateOnceRef.current) return;
    const paymentId = readOccasionCardReturnPaymentId();
    if (!paymentId) return;
    activateOnceRef.current = true;
    let cancelled = false;
    setActivating(true);
    void activatePaidInvite(token, paymentId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        window.location.replace(occasionCardViewHref(token));
        return;
      }
      setActivating(false);
      setError(typeof result.error === 'string' ? result.error : 'تعذر تفعيل البطاقة بعد الدفع');
    });
    return () => {
      cancelled = true;
    };
  }, [token, status]);

  useEffect(() => {
    if (
      !STORE_PAID_INVITE_CHECKOUT_ENABLED ||
      status !== 'pending_payment' ||
      activating ||
      !tier ||
      !publishableKey.startsWith('pk_') ||
      readOccasionCardReturnPaymentId()
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
            const AP = (window as unknown as { ApplePaySession?: { canMakePayments?: () => boolean } })
              .ApplePaySession;
            return !!AP && typeof AP.canMakePayments === 'function' && AP.canMakePayments();
          } catch {
            return false;
          }
        })();
        Moyasar.init({
          element: host,
          amount: priceHalalas,
          currency: 'SAR',
          description: occasionCardMoyasarDescription(tier),
          publishable_api_key: publishableKey,
          callback_url: buildOccasionCardCallbackUrl(token),
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
            product: STORE_OCCASION_CARD_PRODUCT,
            product_type: STORE_OCCASION_CARD_PRODUCT,
            tier,
            store_card_token: token,
            template_id: templateId,
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
            void activatePaidInvite(token, id).then((result) => {
              if (result.ok) {
                window.location.replace(occasionCardViewHref(token));
                return;
              }
              setActivating(false);
              setError(typeof result.error === 'string' ? result.error : 'تعذر تفعيل البطاقة بعد الدفع');
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
  }, [status, activating, tier, publishableKey, priceHalalas, token, templateId]);

  const priceSar = priceHalalas > 0 ? (priceHalalas / 100).toFixed(2) : '';

  return (
    <div dir="rtl" className="min-h-[100svh] bg-[#061018] text-[#f4efe4]">
      <main className="mx-auto max-w-lg px-4 py-12">
        <p className="text-sm font-bold text-[#e8c547]">halaqmap</p>
        <h1 className="mt-2 text-2xl font-extrabold">دفع نشر بطاقة المناسبة</h1>
        {!STORE_PAID_INVITE_CHECKOUT_ENABLED ? (
          <p className="mt-3 text-sm leading-7 text-white/70">{STORE_PAID_INVITE_COPY.checkoutClosedAr}</p>
        ) : null}
        {status === 'loading' ? <p className="mt-6 text-sm text-white/60">جاري تجهيز الدفع…</p> : null}
        {status === 'missing' ? <p className="mt-6 text-sm text-white/70">{error || 'الرابط غير موجود.'}</p> : null}
        {status === 'live' ? (
          <p className="mt-6 text-sm text-white/70">
            البطاقة حيّة.{' '}
            <a className="underline" href={occasionCardViewHref(token)}>
              فتح البطاقة
            </a>
          </p>
        ) : null}
        {status === 'pending_payment' && STORE_PAID_INVITE_CHECKOUT_ENABLED ? (
          <>
            <p className="mt-3 text-sm leading-7 text-white/70">
              {template?.titleAr || 'بطاقة مناسبة'}
              {tier ? ` — طبقة ${OCCASION_CARD_TIER_LABEL_AR[tier]}` : ''}
              {priceSar ? ` — ${priceSar} ر.س` : ''}
            </p>
            {!liveMoney ? (
              <p className="mt-3 rounded-xl border border-[#e8c547]/30 bg-[#e8c547]/10 px-3 py-2 text-xs leading-6 text-[#f4efe4]">
                {STORE_PAID_INVITE_COPY.testCheckoutHintAr}
              </p>
            ) : null}
            {activating ? <p className="mt-4 text-sm text-white/70">جاري تفعيل البطاقة بعد الدفع…</p> : null}
            {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
            {!publishableKey.startsWith('pk_') ? (
              <p className="mt-4 text-sm text-red-300">مفتاح ميسر التجريبي غير مهيأ لهذه البطاقة.</p>
            ) : (
              <>
                <div className="mt-5">
                  <MoyasarOfficialTrustChip variant="banner" />
                </div>
                <div ref={hostRef} className="mt-4 min-h-[220px]" />
              </>
            )}
          </>
        ) : null}
        <Link to={ROUTE_PATHS.STORE_INVITES} className="mt-8 inline-block text-sm text-white/50 underline">
          {STORE_PAID_INVITE_COPY.titleAr}
        </Link>
      </main>
    </div>
  );
}
