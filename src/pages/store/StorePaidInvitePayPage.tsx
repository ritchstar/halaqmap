/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دفع بطاقة مناسبة — على www.halaqmap.com عبر ميسر.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { LEGAL_ECOMMERCE_STORE_NAME } from '@/config/partnerLegal';
import { STORE_PAID_INVITE_COPY } from '@/config/storeIssuedCardsCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { activatePaidInvite, fetchIssuedCardPublic } from '@/lib/storeIssuedCardsRemote';
import { getMoyasarGlobal, loadMoyasarFormScript, MOYASAR_APPLE_PAY_VALIDATE_URL } from '@/lib/moyasarFormLoader';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { toast } from '@/components/ui/sonner';

export default function StorePaidInvitePayPage() {
  useDocumentTitle('دفع بطاقة مناسبة — halaqmap');
  const { token = '' } = useParams<{ token: string }>();
  const [params] = useSearchParams();
  const hostRef = useRef<HTMLDivElement>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moyasarPublishableKey = useMemo(() => {
    const mode = String(import.meta.env.VITE_PAYMENT_ENV || 'test').trim().toLowerCase();
    const testKey = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_TEST_API_KEY || '').trim();
    const liveKey = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_LIVE_API_KEY || '').trim();
    const legacy = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_API_KEY || '').trim();
    if (mode === 'live') return liveKey || legacy;
    return testKey || legacy;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchIssuedCardPublic(token).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.status === 'live') {
        window.location.replace(`https://store.halaqmap.com/#/store/invites/v/${token}`);
        return;
      }
      if (result.status === 'pending_payment') {
        setReady(true);
        const fromApi = Number(result.priceHalalas);
        setAmount(Number.isFinite(fromApi) && fromApi > 0 ? fromApi : null);
      } else {
        setError('لا يوجد طلب نشر معلّق لهذه البطاقة.');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const paymentIdFromReturn = params.get('id') || params.get('payment_id') || '';

  useEffect(() => {
    if (!paymentIdFromReturn || !token) return;
    void activatePaidInvite(token, paymentIdFromReturn).then((result) => {
      if (!result.ok) {
        toast.error(typeof result.error === 'string' ? result.error : 'تعذر تفعيل البطاقة');
        return;
      }
      window.location.replace(`https://store.halaqmap.com/#/store/invites/v/${token}`);
    });
  }, [paymentIdFromReturn, token]);

  useEffect(() => {
    if (!ready || amount == null || !moyasarPublishableKey.startsWith('pk_')) return;
    let cancelled = false;
    void loadMoyasarFormScript().then(() => {
      if (cancelled || !hostRef.current) return;
      hostRef.current.innerHTML = '';
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
        element: hostRef.current,
        amount,
        currency: 'SAR',
        description: `halaqmap occasion card / ${token.slice(0, 8)}`,
        publishable_api_key: moyasarPublishableKey,
        callback_url: `${window.location.origin}/#${ROUTE_PATHS.STORE_OCCASION_CARD_PAY.replace(':token', token)}`,
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
          product: 'store_occasion_card',
          store_card_token: token,
        },
        on_completed: async (payment: unknown) => {
          const id =
            typeof payment === 'object' && payment != null && 'id' in payment
              ? String((payment as { id?: unknown }).id ?? '').trim()
              : '';
          if (!id) return;
          const result = await activatePaidInvite(token, id);
          if (!result.ok) {
            toast.error(typeof result.error === 'string' ? result.error : 'تعذر تفعيل البطاقة');
            return;
          }
          window.location.replace(`https://store.halaqmap.com/#/store/invites/v/${token}`);
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [ready, amount, moyasarPublishableKey, token]);

  return (
    <div dir="rtl" className="min-h-[100svh] bg-[#061018] text-[#f4efe4]">
      <main className="mx-auto max-w-lg px-4 py-12">
        <p className="text-sm font-bold text-[#e8c547]">halaqmap</p>
        <h1 className="mt-2 text-2xl font-extrabold">دفع نشر بطاقة المناسبة</h1>
        <p className="mt-3 text-sm leading-7 text-white/70">
          المبلغ يُحدَّد من القالب على الخادم، لا من المتصفح. بعد الدفع الناجح يصبح الرابط حيّاً ولا يُسترد.
        </p>
        {amount != null ? <p className="mt-4 text-lg font-black">{amount / 100} ر.س</p> : null}
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        <div ref={hostRef} className="mt-6 min-h-[220px]" />
        {!moyasarPublishableKey.startsWith('pk_') ? (
          <p className="mt-4 text-sm text-white/60">بوابة ميسر غير مهيأة في هذه البيئة.</p>
        ) : null}
        <Link to={ROUTE_PATHS.STORE_INVITES} className="mt-8 inline-block text-sm text-white/50 underline">
          {STORE_PAID_INVITE_COPY.titleAr}
        </Link>
      </main>
    </div>
  );
}
