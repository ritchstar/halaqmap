import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react';
import { usePlatformVatSettings } from '@/hooks/usePlatformVatSettings';
import { calcVatBreakdown } from '@/lib/platformVatSettings';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib';
import { IMAGES } from '@/assets/images';
import { resolvePaymentGateway } from '@/config/paymentGateway';
import {
  clampListingLicenseQuantity,
  computeListingLicenseTotalSar,
  isDigitalShiftAddonAllowed,
  parseDigitalShiftAddonParam,
} from '@/config/listingLicenseQuantity';
import {
  DIGITAL_SHIFT_MONTHLY_ADDON_SAR,
  DIGITAL_SHIFT_PRODUCT_NAME_AR,
  DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR,
  DIAMOND_PRODUCT_SMART_LABEL_AR,
  DIAMOND_PRODUCT_STANDARD_LABEL_AR,
  TIER_MONTHLY_SAR,
} from '@/config/subscriptionPricing';
import { fetchPublicPaymentPageConfig, type PublicPaymentPageConfig } from '@/lib/publicPaymentPageConfigRemote';
import { getUnifiedPaymentProvider } from '@/lib/payment/providers';
import { verifyMoyasarPaymentRemote } from '@/lib/moyasarPaymentVerifyRemote';
import {
  buildSabShopperResultUrl,
  createSabCheckoutRemote,
  verifySabPaymentRemote,
} from '@/lib/sabPaymentRemote';
import { fetchActivationCertificateByMoyasarPaymentId } from '@/lib/digitalActivationCertificateRemote';
import { pollMoyasarPaymentFulfillmentRemote } from '@/lib/moyasarPaymentFulfillmentSyncRemote';
import { loadSabPaymentWidgetScript, mountSabPaymentForm, setSabWidgetLocaleAr } from '@/lib/sabFormLoader';
import { PaymentSuccessPanel } from '@/components/billing/PaymentSuccessPanel';
import { PaymentMerchantCompliancePanel } from '@/components/billing/PaymentMerchantCompliancePanel';
import { MadaBadgeIcon, VisaMastercardBadgeIcon } from '@/components/billing/PaymentMethodBadgeIcons';
import { REFUND_POLICY_PATH } from '@/config/moyasarMerchantCompliance';
import { REGISTRATION_STORAGE_ORDER_ID_RE } from '@/lib/registrationFileUploads';
import { PlatformTlsTrustBadge } from '@/components/PlatformTlsTrustBadge';
import { PlatformTrustStrip } from '@/components/PlatformTrustStrip';
import { paymentActivateNowCtaAr, TERM_ACTIVATE_NOW_AR } from '@/config/softwareLicenseTerminology';
import {
  SOFTWARE_PRODUCT_PURCHASE_ACK_AR,
  SOFTWARE_PRODUCT_PURCHASE_ACK_SHORT_AR,
} from '@/config/legalActivityScope';
import type { DigitalActivationCertificateView } from '@/config/geospatialLicenseDoctrine';
import { getMoyasarGlobal, loadMoyasarFormScript } from '@/lib/moyasarFormLoader';
import {
  WALLET_TOPUP_VAT_PERCENT,
  netCreditHalalasFromCharged,
  repliesFromHalalas,
  walletTopupPackageBySku,
} from '@/config/digitalShiftWalletTopup';
import { pollWalletTopupFulfillRemote, type WalletTopupFulfillResult } from '@/lib/walletTopupFulfillRemote';
import {
  buildMoyasarCallbackUrl,
  buildWalletTopupCallbackUrl,
  clearMoyasarCheckoutContext,
  clearMoyasarPaidReceipt,
  expectedHalalasFromReturnSearchParams,
  formatMoyasarFailureReturnMessage,
  mergeMoyasarReturnSearchParams,
  moyasarReturnNeedsHydration,
  persistMoyasarLastPaymentId,
  persistMoyasarPaidReceipt,
  persistMoyasarPaymentContext,
  readHashOrTopLevelSearchParams,
  readMoyasarFailureReturn,
  readMoyasarLastPaymentId,
  readMoyasarPaidReceipt,
} from '@/lib/moyasarPaymentReturn';
import { healIfStaleBuild } from '@/lib/platformBuildSync';
import { toast } from 'sonner';

export default function Payment() {
  const navigate = useNavigate();
  const vatSettings = usePlatformVatSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const tierRaw = (searchParams.get('tier') ?? '').trim().toLowerCase();
  const tier: SubscriptionTier =
    tierRaw === SubscriptionTier.GOLD
      ? SubscriptionTier.GOLD
      : tierRaw === SubscriptionTier.DIAMOND
        ? SubscriptionTier.DIAMOND
        : SubscriptionTier.BRONZE;
  const licenseQuantity = useMemo(
    () => clampListingLicenseQuantity(searchParams.get('qty')),
    [searchParams],
  );
  const digitalShiftAddonSelected = useMemo(
    () => isDigitalShiftAddonAllowed(tier, parseDigitalShiftAddonParam(searchParams.get('aiAddon'))),
    [tier, searchParams],
  );
  const listingPricingOptions = useMemo(
    () => (digitalShiftAddonSelected ? { digitalShiftAddon: true as const } : undefined),
    [digitalShiftAddonSelected],
  );
  const requestIdParam = searchParams.get('requestId') ?? '';
  /** مطابق لطلب التسجيل (HM-...) — يُمرَّر في metadata.request_id للـ webhook؛ يُفضّل عدم تركه فارغاً */
  const requestId = useMemo(() => requestIdParam.trim(), [requestIdParam]);
  /** يُمرَّر في metadata.linked_barber_id بعد اعتماد الإدارة أو عبر الرابط ?linkedBarberId= */
  const linkedBarberId = useMemo(() => searchParams.get('linkedBarberId')?.trim() ?? '', [searchParams]);
  const barberName = useMemo(() => searchParams.get('barberName')?.trim() ?? '', [searchParams]);
  /** purpose: 'new' (شراء أول لعميل جديد) | 'recharge' (شحن رخصة) | 'wallet_topup' (شحن محفظة المناوب) */
  const purchasePurpose = useMemo(() => {
    const p = searchParams.get('purpose')?.trim().toLowerCase();
    if (p === 'wallet_topup') return 'wallet_topup';
    return p === 'recharge' ? 'recharge' : 'new';
  }, [searchParams]);
  const isWalletTopup = purchasePurpose === 'wallet_topup';
  const walletSku = useMemo(
    () => (searchParams.get('walletSku') ?? '').trim().toLowerCase(),
    [searchParams],
  );
  const walletPkg = useMemo(() => walletTopupPackageBySku(walletSku), [walletSku]);
  const buyerEmail = useMemo(() => searchParams.get('buyerEmail')?.trim() ?? '', [searchParams]);

  /** بعد عودة ميسر: ادمج tier/requestId من sessionStorage قبل التحقق من الخادم. */
  const [moyasarReturnHydrated, setMoyasarReturnHydrated] = useState(
    () => typeof window === 'undefined' || !moyasarReturnNeedsHydration(readHashOrTopLevelSearchParams()),
  );
  const moyasarReturnHydratingRef = useRef(false);
  /** يمنع إعادة تشغيل تأثير التحقق على كل تبدّل حالة (loading↔error): مرة واحدة لكل (دفعة + محاولة). */
  const moyasarVerifyRunKeyRef = useRef<string>('');

  useLayoutEffect(() => {
    const paymentId = searchParams.get('id')?.trim();
    if (!paymentId) {
      setMoyasarReturnHydrated(true);
      return;
    }
    if ((searchParams.get('gateway') ?? '').trim().toLowerCase() === 'sab') {
      setMoyasarReturnHydrated(true);
      return;
    }
    if (!moyasarReturnNeedsHydration(searchParams)) {
      setMoyasarReturnHydrated(true);
      return;
    }
    if (moyasarReturnHydratingRef.current) return;
    moyasarReturnHydratingRef.current = true;

    const merged = mergeMoyasarReturnSearchParams(searchParams);
    setSearchParams(merged, { replace: true });
    setMoyasarReturnHydrated(true);
  }, [searchParams, setSearchParams]);

  /** شراء أول يتطلب requestId صالحاً من مسار التسجيل — يمنع الدفع المباشر بلا طلب */
  const registrationRequestReady = useMemo(() => {
    if (purchasePurpose !== 'new') return true;
    return REGISTRATION_STORAGE_ORDER_ID_RE.test(requestId);
  }, [purchasePurpose, requestId]);
  const [pubPayConfig, setPubPayConfig] = useState<PublicPaymentPageConfig | null>(null);

  useEffect(() => {
    void fetchPublicPaymentPageConfig().then(setPubPayConfig);
  }, []);

  const enableMoyasarCard = pubPayConfig === null || !pubPayConfig.ok || pubPayConfig.enableMoyasarCard !== false;
  const enableSabGateway = Boolean(pubPayConfig?.ok && pubPayConfig.enableSabGateway);

  const availablePaymentChannels = useMemo(() => {
    const channels: Array<'moyasar' | 'sab'> = [];
    if (enableMoyasarCard) channels.push('moyasar');
    if (enableSabGateway) channels.push('sab');
    return channels;
  }, [enableMoyasarCard, enableSabGateway]);

  const preferredPaymentChannel = useMemo((): 'moyasar' | 'sab' => {
    const pref = pubPayConfig?.ok && pubPayConfig.preferredGateway === 'SAB' ? 'sab' : 'moyasar';
    if (pref === 'sab' && enableSabGateway) return 'sab';
    if (pref === 'moyasar' && enableMoyasarCard) return 'moyasar';
    return availablePaymentChannels[0] ?? 'moyasar';
  }, [pubPayConfig, enableMoyasarCard, enableSabGateway, availablePaymentChannels]);

  const [paymentMethod, setPaymentMethod] = useState<'moyasar' | 'sab'>(() =>
    resolvePaymentGateway() === 'SAB' ? 'sab' : 'moyasar',
  );

  useEffect(() => {
    if (pubPayConfig === null) return;
    setPaymentMethod((current) =>
      availablePaymentChannels.includes(current) ? current : preferredPaymentChannel,
    );
  }, [pubPayConfig, availablePaymentChannels, preferredPaymentChannel]);

  const activeGateway = paymentMethod === 'sab' ? 'SAB' : 'MOYASAR';
  const paymentProvider = useMemo(() => getUnifiedPaymentProvider(activeGateway), [activeGateway]);
  const showMoyasarCheckout = enableMoyasarCard && paymentMethod === 'moyasar';
  const showSabCheckout = enableSabGateway && paymentMethod === 'sab';
  const preferredGatewayCode = pubPayConfig?.ok ? pubPayConfig.preferredGateway : resolvePaymentGateway();
  /** إقرار بقراءة شروط ميسر كبوابة دفع — مطلوب قبل متابعة الدفع عبر ميسر (المادة الخامسة من الشروط). */
  const [moyasarTermsAccepted, setMoyasarTermsAccepted] = useState(false);
  const [softwareProductAcknowledged, setSoftwareProductAcknowledged] = useState(false);
  /** بعد العودة من ميسر بـ ?id= — التحقق من الخادم */
  const [moyasarReturnVerify, setMoyasarReturnVerify] = useState<
    'idle' | 'loading' | 'paid' | 'unpaid' | 'error'
  >('idle');
  const [moyasarVerifyMessage, setMoyasarVerifyMessage] = useState<string | null>(null);
  const [moyasarVerifyNonce, setMoyasarVerifyNonce] = useState(0);
  /** يُعرض مع تنبيه النجاح بعد التحقق من ميسر عند paid */
  const [moyasarPaidAmountFormat, setMoyasarPaidAmountFormat] = useState<string | null>(null);
  const [activationCertificate, setActivationCertificate] = useState<DigitalActivationCertificateView | null>(null);
  const [activationCertificateLoading, setActivationCertificateLoading] = useState(false);
  const [activationCertificateError, setActivationCertificateError] = useState<string | null>(null);
  /** نتيجة شحن المحفظة بعد الدفع (purpose === 'wallet_topup') */
  const [walletTopupResult, setWalletTopupResult] = useState<
    Extract<WalletTopupFulfillResult, { ok: true }> | null
  >(null);
  const [walletTopupLoading, setWalletTopupLoading] = useState(false);
  const [walletTopupError, setWalletTopupError] = useState<string | null>(null);
  const moyasarHostRef = useRef<HTMLDivElement>(null);
  const [moyasarFormError, setMoyasarFormError] = useState<string | null>(null);
  const [sabTermsAccepted, setSabTermsAccepted] = useState(false);
  const [sabReturnVerify, setSabReturnVerify] = useState<'idle' | 'loading' | 'paid' | 'unpaid' | 'error'>('idle');
  const [sabVerifyMessage, setSabVerifyMessage] = useState<string | null>(null);
  const [sabPaidAmountFormat, setSabPaidAmountFormat] = useState<string | null>(null);
  const sabHostRef = useRef<HTMLDivElement>(null);
  const [sabFormError, setSabFormError] = useState<string | null>(null);
  const [sabCheckoutLoading, setSabCheckoutLoading] = useState(false);

  const moyasarPublishableKey = useMemo(() => {
    // Production key source (frontend env):
    // - VITE_PAYMENT_ENV=live
    // - VITE_MOYSAR_PUBLISHABLE_LIVE_API_KEY=pk_live_...
    // Sandbox:
    // - VITE_PAYMENT_ENV=test
    // - VITE_MOYSAR_PUBLISHABLE_TEST_API_KEY=pk_test_...
    const mode = String(import.meta.env.VITE_PAYMENT_ENV || 'test').trim().toLowerCase();
    const testKey = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_TEST_API_KEY || '').trim();
    const liveKey = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_LIVE_API_KEY || '').trim();
    const legacy = String(import.meta.env.VITE_MOYSAR_PUBLISHABLE_API_KEY || '').trim();
    if (mode === 'live') return liveKey || legacy;
    return testKey || legacy;
  }, []);
  const moyasarKeyOk = moyasarPublishableKey.startsWith('pk_');

  // Subscription prices
  const prices = {
    [SubscriptionTier.BRONZE]: 100,
    [SubscriptionTier.GOLD]: 150,
    [SubscriptionTier.DIAMOND]: 200,
  };

  const tierNames = {
    [SubscriptionTier.BRONZE]: 'برونزي',
    [SubscriptionTier.GOLD]: 'ذهبي',
    [SubscriptionTier.DIAMOND]: 'ماسي',
  };

  const tierColors = {
    [SubscriptionTier.BRONZE]: 'from-amber-700 to-amber-900',
    [SubscriptionTier.GOLD]: 'from-accent to-yellow-600',
    [SubscriptionTier.DIAMOND]: 'from-primary to-cyan-600',
  };

  const price = computeListingLicenseTotalSar(tier, licenseQuantity, listingPricingOptions);
  const tierName = tierNames[tier];
  const tierColor = tierColors[tier];
  const tierDisplayLabel =
    tier === SubscriptionTier.DIAMOND && digitalShiftAddonSelected
      ? DIAMOND_PRODUCT_SMART_LABEL_AR
      : tier === SubscriptionTier.DIAMOND
        ? DIAMOND_PRODUCT_STANDARD_LABEL_AR
        : `باقة ${tierName}`;

  const licenseBreakdown = useMemo(
    () => calcVatBreakdown(price, vatSettings),
    [price, vatSettings],
  );

  /** قيمة حزمة الرخصة الرقمية بالهللات (ميسر تستخدم أصغر وحدة نقدية). */
  const monthlyAmountHalalas = useMemo(
    () => Math.max(100, Math.round(licenseBreakdown.total * 100)),
    [licenseBreakdown.total],
  );
  const unifiedPaymentInit = useMemo(
    () =>
      paymentProvider.buildInitPayload({
        tier,
        amountHalalas: monthlyAmountHalalas,
        licenseQuantity,
        digitalShiftAddonSelected,
        barberName,
        requestId,
        linkedBarberId,
      }),
    [
      paymentProvider,
      tier,
      monthlyAmountHalalas,
      licenseQuantity,
      digitalShiftAddonSelected,
      barberName,
      requestId,
      linkedBarberId,
    ],
  );

  /** مبلغ شحن المحفظة (هللات) — المدفوع فعلياً = الأساسي + ضريبة 15% فوقه. */
  const walletChargedHalalas = walletPkg?.chargedHalalas ?? 0;
  const walletCreditedHalalas = useMemo(
    () => (walletPkg ? netCreditHalalasFromCharged(walletPkg.chargedHalalas) : 0),
    [walletPkg],
  );
  const walletVatHalalas = walletChargedHalalas - walletCreditedHalalas;

  /** المبلغ/الوصف/الميتاداتا الفعّالة — تتبدّل بين رخصة الإدراج وشحن المحفظة. */
  const effectiveAmountHalalas = isWalletTopup ? walletChargedHalalas : monthlyAmountHalalas;
  const effectiveDescription = isWalletTopup
    ? `Halaqmap Digital Shift Wallet Top-up (${walletPkg?.sku ?? 'wallet_topup'})`
    : unifiedPaymentInit.description;
  const effectiveMetadata = useMemo<Record<string, unknown>>(() => {
    if (!isWalletTopup) return unifiedPaymentInit.metadata;
    return {
      payment_gateway: 'MOYASAR',
      product: 'wallet_topup',
      product_type: 'wallet_topup',
      product_type_ar: 'شحن محفظة المناوب الرقمي',
      wallet_sku: walletPkg?.sku ?? '',
      expected_amount_halalas: walletChargedHalalas,
      expected_currency: 'SAR',
      linked_barber_id: linkedBarberId || '',
      buyer_email: buyerEmail || '',
    };
  }, [isWalletTopup, unifiedPaymentInit.metadata, walletPkg, walletChargedHalalas, linkedBarberId, buyerEmail]);

  const paymentGatewayFromUrl = (searchParams.get('gateway') ?? '').trim().toLowerCase();
  const paymentIdFromUrl = searchParams.get('id')?.trim() || '';
  const sabResourcePathFromUrl = searchParams.get('resourcePath')?.trim() || '';
  /** معرّف العودة من ميسر — من الرابط فقط لتجنب إعادة التحقق بعد إزالة id */
  const moyasarPaymentIdFromUrl =
    paymentIdFromUrl && paymentGatewayFromUrl !== 'sab' ? paymentIdFromUrl : '';
  const sabPaymentIdFromUrl =
    paymentIdFromUrl && paymentGatewayFromUrl === 'sab' ? paymentIdFromUrl : '';

  const loadPaidActivationCertificate = useCallback(async (paymentId: string) => {
    const normalized = paymentId.trim();
    if (!normalized) return;
    setActivationCertificateLoading(true);
    setActivationCertificateError(null);
    setActivationCertificate(null);

    const pollResult = await pollMoyasarPaymentFulfillmentRemote(normalized, {
      maxAttempts: 22,
    });
    if (pollResult.ok && pollResult.certificate) {
      setActivationCertificate(pollResult.certificate);
      setActivationCertificateLoading(false);
      return;
    }

    const certResult = await fetchActivationCertificateByMoyasarPaymentId(normalized, {
      retries: 4,
      retryDelayMs: 1500,
    });
    setActivationCertificateLoading(false);
    if (certResult.ok) {
      setActivationCertificate(certResult.certificate);
      return;
    }

    const errCode = pollResult.ok === false ? pollResult.error : certResult.error;
    setActivationCertificateError(
      errCode === 'sync_timeout' || errCode === 'network'
        ? 'تأخر الاتصال بخادم التفعيل. اضغط «إعادة محاولة إصدار الشهادة» أو انتظر دقيقة ثم أعد التحميل.'
        : errCode === 'payment_not_paid'
          ? 'الدفع ما زال قيد التأكيد لدى ميسر. انتظر ثوانٍ ثم أعد المحاولة.'
          : errCode === 'moyasar_disabled'
            ? 'خادم التفعيل غير مهيأ (مفاتيح ميسر). تواصل مع الدعم.'
            : 'جاري إصدار شهادة التفعيل أو تعذّر إتمامها. أعد المحاولة — إن استمرت المشكلة راجع بريدك أو تواصل مع الدعم.',
    );
  }, []);

  const loadWalletTopupFulfillment = useCallback(async (paymentId: string) => {
    const normalized = paymentId.trim();
    if (!normalized) return;
    setWalletTopupLoading(true);
    setWalletTopupError(null);
    setWalletTopupResult(null);

    const result = await pollWalletTopupFulfillRemote(normalized, { maxAttempts: 14 });
    setWalletTopupLoading(false);
    if (result.ok) {
      setWalletTopupResult(result);
      return;
    }
    setWalletTopupError(
      result.error === 'payment_not_paid'
        ? 'الدفع ما زال قيد التأكيد لدى ميسر. انتظر ثوانٍ ثم أعد المحاولة.'
        : result.error === 'wallet_topup_barber_unresolved'
          ? 'تعذّر ربط الدفعة بحساب الحلاق. تواصل مع الدعم مع رقم العملية.'
          : result.error === 'wallet_topup_amount_mismatch'
            ? 'قيمة الدفعة لا تطابق باقة شحن معتمدة.'
            : 'تعذّر شحن الرصيد تلقائياً. أعد المحاولة — إن استمرت المشكلة تواصل مع الدعم.',
    );
  }, []);

  useEffect(() => {
    if (!moyasarReturnHydrated) return;
    const failure = readMoyasarFailureReturn(searchParams);
    if (!failure) return;

    const storedId = readMoyasarLastPaymentId();
    if (storedId) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('status');
          next.delete('message');
          if (!next.get('id')?.trim()) next.set('id', storedId);
          return next;
        },
        { replace: true },
      );
      setMoyasarVerifyNonce((n) => n + 1);
      return;
    }

    const userMessage = formatMoyasarFailureReturnMessage(failure.message);
    setMoyasarReturnVerify('error');
    setMoyasarVerifyMessage(userMessage);
    toast.error('فشل الدفع عبر ميسر', { description: userMessage });

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('status');
        next.delete('message');
        return next;
      },
      { replace: true },
    );
  }, [moyasarReturnHydrated, searchParams, setSearchParams]);

  useEffect(() => {
    if (!moyasarReturnHydrated) return;
    if (moyasarPaymentIdFromUrl) return;
    if (moyasarReturnVerify !== 'idle') return;
    const receiptId = readMoyasarPaidReceipt(requestId);
    if (!receiptId) return;
    setMoyasarReturnVerify('paid');
    if (isWalletTopup) {
      void loadWalletTopupFulfillment(receiptId);
    } else {
      void loadPaidActivationCertificate(receiptId);
    }
  }, [
    moyasarReturnHydrated,
    moyasarPaymentIdFromUrl,
    moyasarReturnVerify,
    requestId,
    loadPaidActivationCertificate,
    isWalletTopup,
    loadWalletTopupFulfillment,
  ]);

  useEffect(() => {
    if (!moyasarPaymentIdFromUrl || !moyasarReturnHydrated) return;
    if (moyasarReturnVerify === 'paid' && readMoyasarPaidReceipt(requestId) === moyasarPaymentIdFromUrl) {
      return;
    }
    // تحقق مرة واحدة لكل (دفعة + محاولة): يمنع دوران loading↔error اللانهائي.
    const verifyRunKey = `${moyasarPaymentIdFromUrl}#${moyasarVerifyNonce}`;
    if (moyasarVerifyRunKeyRef.current === verifyRunKey) return;
    moyasarVerifyRunKeyRef.current = verifyRunKey;

    let cancelled = false;
    setMoyasarReturnVerify('loading');
    setMoyasarVerifyMessage(null);
    setMoyasarPaidAmountFormat(null);

    const returnParams = mergeMoyasarReturnSearchParams(searchParams);
    const expectedAmountHalalas = isWalletTopup
      ? walletChargedHalalas
      : expectedHalalasFromReturnSearchParams(returnParams, vatSettings);

    const runVerify = (expected?: number) =>
      verifyMoyasarPaymentRemote(moyasarPaymentIdFromUrl, {
        ...(expected != null ? { expectedAmountHalalas: expected } : {}),
        expectedCurrency: 'SAR',
      });

    void runVerify(expectedAmountHalalas).then(async (initialResult) => {
      if (cancelled) return;
      const verifiedPaymentId = moyasarPaymentIdFromUrl;
      let result = initialResult;

      if (!result.ok && result.error === 'amount_mismatch') {
        const relaxed = await runVerify();
        if (!cancelled && relaxed.ok) result = relaxed;
      }

      if (!result.ok) {
        // فشل شبكي («Failed to fetch») قد يكون سببه حزمة قديمة يخدمها الـ SW —
        // نحاول شفاءً ذاتياً مرّة واحدة (محمي بحارس ضد الحلقات). إن اكتُشف تعارض
        // إصدار ستُعاد الصفحة على الأحدث ثم يُعاد التحقق تلقائياً.
        if (result.error === 'network') {
          const healed = await healIfStaleBuild();
          if (healed || cancelled) return;
        }
        setMoyasarReturnVerify('error');
        if (result.error === 'moyasar_disabled') {
          setMoyasarVerifyMessage(
            'التحقق من الدفع غير مفعّل على الخادم. أضف MOYSAR_SECRET_TEST_API_KEY على Vercel ثم أعد المحاولة.',
          );
          toast.message('تنبيه', { description: 'خادم التحقق من ميسر غير مهيأ بعد.' });
        } else if (result.error === 'amount_mismatch') {
          setMoyasarVerifyMessage(
            'المبلغ المدفوع لا يطابق قيمة الحزمة المعروضة. إن كان الدفع ناجحاً في لوحة ميسر، انتظر دقائق أو تواصل مع الدعم.',
          );
          toast.error('تباين في المبلغ');
        } else if (result.error === 'moyasar_error') {
          setMoyasarVerifyMessage(
            result.message ||
              'تعذر جلب حالة الدفع من ميسر. تحقق من تطابق مفتاح السر (sk_test_) مع المفتاح العام (pk_test_) على Vercel.',
          );
          toast.error('فشل التحقق من الدفع');
        } else if (result.error === 'Forbidden') {
          setMoyasarVerifyMessage(
            result.hint ||
              'الخادم رفض الطلب (CORS). أضف نطاقك إلى PUBLIC_API_ALLOWED_ORIGINS على Vercel.',
          );
          toast.error('فشل التحقق من الدفع');
        } else if (result.error === 'invalid_response' || result.error === 'upstream_timeout' || result.error === 'upstream_network') {
          setMoyasarVerifyMessage(
            result.hint ||
              'خادم التحقق لم يُرجع استجابة صالحة. قد يكون الاتصال بميسر بطيئاً — أعد المحاولة بعد دقيقة.',
          );
          toast.error('فشل التحقق من الدفع');
        } else {
          setMoyasarVerifyMessage(result.hint || result.message || result.error || 'تعذر التحقق من الدفع');
          toast.error('فشل التحقق من الدفع');
        }
        return;
      }

      if (result.paid) {
        persistMoyasarPaidReceipt(verifiedPaymentId, requestId);
        persistMoyasarLastPaymentId(verifiedPaymentId);
        clearMoyasarCheckoutContext();
        setMoyasarReturnVerify('paid');
        setMoyasarVerifyMessage(null);
        setMoyasarPaidAmountFormat(result.amount_format != null ? String(result.amount_format) : null);
        if (isWalletTopup) {
          await loadWalletTopupFulfillment(verifiedPaymentId);
        } else {
          await loadPaidActivationCertificate(verifiedPaymentId);
        }
        if (cancelled) return;
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.delete('id');
            return next;
          },
          { replace: true },
        );
      } else {
        setMoyasarReturnVerify('unpaid');
        const statusLabel = String(result.status || 'غير مكتمل');
        const statusHint =
          statusLabel === 'failed'
            ? 'فشلت العملية في ميسر. تأكد من إدخال بطاقة الاختبار 4111… وأكمل شاشة 3DS بزر Submit.'
            : statusLabel === 'initiated' || statusLabel === 'authorized'
              ? 'العملية ما زالت قيد المعالجة في ميسر. انتظر دقيقة ثم أعد فتح رابط العودة أو راجع لوحة ميسر.'
              : 'إن كانت العملية قيد 3DS أكمل الخطوات ثم أعد فتح الرابط.';
        setMoyasarVerifyMessage(`حالة الدفع من ميسر: ${statusLabel}. ${statusHint}`);
        toast.message('الدفع غير مكتمل', { description: 'راجع حالة العملية في لوحة ميسر.' });
      }
    });

    return () => {
      cancelled = true;
      // اسمح بإعادة التشغيل عند تغيّر اعتماديّة فعلية (كاستقرار إعدادات الضريبة)
      // بدل البقاء عالقاً على تشغيل أُلغي.
      if (moyasarVerifyRunKeyRef.current === verifyRunKey) {
        moyasarVerifyRunKeyRef.current = '';
      }
    };
    // ملاحظة: moyasarReturnVerify مقصود استبعاده من الاعتماديّات — ضبطه على
    // 'loading' في بداية التأثير كان يُلغي التشغيل الجاري ثم يمنع إعادته (حارس
    // الـ ref) فيبقى معلّقاً. حارس الـ ref + الـ nonce يضمنان تشغيلاً واحداً/إعادة.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    moyasarPaymentIdFromUrl,
    moyasarReturnHydrated,
    searchParams,
    vatSettings,
    setSearchParams,
    moyasarVerifyNonce,
    requestId,
    loadPaidActivationCertificate,
    isWalletTopup,
    walletChargedHalalas,
    loadWalletTopupFulfillment,
  ]);

  useEffect(() => {
    if (!sabPaymentIdFromUrl) return;
    let cancelled = false;
    setSabReturnVerify('loading');
    setSabVerifyMessage(null);
    setSabPaidAmountFormat(null);

    void verifySabPaymentRemote(sabPaymentIdFromUrl, {
      resourcePath: sabResourcePathFromUrl || undefined,
      expectedAmountHalalas: monthlyAmountHalalas,
      expectedCurrency: 'SAR',
    }).then(async (result) => {
      if (cancelled) return;
      const verifiedPaymentId = sabPaymentIdFromUrl;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('id');
          next.delete('resourcePath');
          next.delete('gateway');
          return next;
        },
        { replace: true },
      );

      if (!result.ok) {
        setSabReturnVerify('error');
        if (result.error === 'sab_disabled') {
          setSabVerifyMessage(
            'التحقق من دفع SAB غير مفعّل على الخادم. أضف مفاتيح OPPWA على Vercel ثم أعد المحاولة.',
          );
          toast.message('تنبيه', { description: 'خادم التحقق من بنك الأول غير مهيأ بعد.' });
        } else if (result.error === 'amount_mismatch') {
          setSabVerifyMessage('المبلغ لا يطابق قيمة حزمة الرخصة الرقمية للباقة المعروضة.');
          toast.error('تباين في المبلغ');
        } else {
          setSabVerifyMessage(result.hint || result.message || result.error || 'تعذر التحقق من الدفع');
          toast.error('فشل التحقق من الدفع');
        }
        return;
      }

      if (result.paid && paymentProvider.isSuccessStatus(result.status || 'paid')) {
        setSabReturnVerify('paid');
        setSabVerifyMessage(null);
        setSabPaidAmountFormat(result.amount_format != null ? String(result.amount_format) : null);
        setActivationCertificate(null);
        setActivationCertificateError(null);
        setActivationCertificateLoading(true);
        const pollResult = await pollMoyasarPaymentFulfillmentRemote(verifiedPaymentId, {
          maxAttempts: 22,
        });
        if (cancelled) return;
        setActivationCertificateLoading(false);
        if (pollResult.ok && pollResult.certificate) {
          setActivationCertificate(pollResult.certificate);
        } else {
          const certResult = await fetchActivationCertificateByMoyasarPaymentId(verifiedPaymentId, {
            retries: 4,
            retryDelayMs: 1500,
          });
          if (cancelled) return;
          if (certResult.ok) {
            setActivationCertificate(certResult.certificate);
          } else {
            setActivationCertificateError(
              'تعذّر إصدار شهادة التفعيل تلقائياً. أعد المحاولة أو راجع بريدك بعد دقائق.',
            );
          }
        }
      } else {
        setSabReturnVerify('unpaid');
        setSabVerifyMessage(
          `حالة الدفع من بنك الأول: ${result.status || 'غير مكتمل'}${result.resultDescription ? ` — ${result.resultDescription}` : ''}.`,
        );
        toast.message('الدفع غير مكتمل', { description: 'أكمل خطوات 3DS إن وُجدت ثم أعد المحاولة.' });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    sabPaymentIdFromUrl,
    sabResourcePathFromUrl,
    monthlyAmountHalalas,
    paymentProvider,
    setSearchParams,
  ]);

  /** تهيئة نموذج ميسر داخل الصفحة بعد الإقرار بالشروط. */
  useEffect(() => {
    if (!showMoyasarCheckout) return;
    if (
      paymentMethod !== 'moyasar' ||
      !moyasarTermsAccepted ||
      !softwareProductAcknowledged ||
      !moyasarKeyOk ||
      !registrationRequestReady ||
      (isWalletTopup && (!walletPkg || effectiveAmountHalalas < 100))
    ) {
      setMoyasarFormError(null);
      if (moyasarHostRef.current) moyasarHostRef.current.innerHTML = '';
      return;
    }

    const el = moyasarHostRef.current;
    if (!el) return;

    let cancelled = false;
    setMoyasarFormError(null);

    const explicit = String(import.meta.env.VITE_MOYSAR_CALLBACK_URL || '').trim();
    const callbackUrl = isWalletTopup
      ? buildWalletTopupCallbackUrl(
          {
            walletSku: walletPkg?.sku ?? '',
            linkedBarberId: linkedBarberId || undefined,
            barberName: barberName || undefined,
          },
          explicit || undefined,
        )
      : buildMoyasarCallbackUrl(
          {
            tier,
            licenseQuantity,
            digitalShiftAddonSelected,
            requestId,
            linkedBarberId,
          },
          explicit || undefined,
        );

    clearMoyasarPaidReceipt();
    persistMoyasarPaymentContext({
      tier: isWalletTopup ? '' : tier,
      qty: isWalletTopup ? 0 : licenseQuantity,
      requestId,
      ...(isWalletTopup ? { walletSku: walletPkg?.sku ?? '' } : {}),
      linkedBarberId: linkedBarberId || undefined,
      aiAddon: digitalShiftAddonSelected,
      barberName: barberName || undefined,
      purpose: purchasePurpose,
    });

    void loadMoyasarFormScript()
      .then(() => {
        if (cancelled) return;
        const host = moyasarHostRef.current;
        if (!host) return;
        host.innerHTML = '';
        const Moyasar = getMoyasarGlobal();
        if (!Moyasar?.init) {
          setMoyasarFormError('تعذر تهيئة مكتبة ميسر.');
          return;
        }
        try {
          Moyasar.init({
            element: host,
            amount: effectiveAmountHalalas,
            currency: 'SAR',
            description: effectiveDescription,
            publishable_api_key: moyasarPublishableKey,
            callback_url: callbackUrl,
            supported_networks: ['visa', 'mastercard'],
            methods: ['creditcard'],
            language: 'ar',
            fixed_width: false,
            metadata: effectiveMetadata,
            on_completed: async (payment: unknown) => {
              const id =
                typeof payment === 'object' && payment != null && 'id' in payment
                  ? String((payment as { id?: unknown }).id ?? '').trim()
                  : '';
              if (id) persistMoyasarLastPaymentId(id);
            },
            on_failure: (msg: unknown) => {
              const raw = typeof msg === 'string' ? msg : 'فشل الدفع عبر ميسر.';
              const userMessage = formatMoyasarFailureReturnMessage(raw);
              setMoyasarReturnVerify('error');
              setMoyasarVerifyMessage(userMessage);
              toast.error('فشل الدفع عبر ميسر', { description: userMessage });
            },
          });
        } catch (e) {
          setMoyasarFormError(e instanceof Error ? e.message : 'تعذر تشغيل نموذج ميسر');
        }
      })
      .catch(() => {
        if (!cancelled) setMoyasarFormError('تعذر تحميل سكربت ميسر من CDN.');
      });

    return () => {
      cancelled = true;
      if (moyasarHostRef.current) moyasarHostRef.current.innerHTML = '';
    };
  }, [
    paymentMethod,
    moyasarTermsAccepted,
    softwareProductAcknowledged,
    moyasarKeyOk,
    monthlyAmountHalalas,
    tier,
    licenseQuantity,
    digitalShiftAddonSelected,
    requestId,
    linkedBarberId,
    barberName,
    purchasePurpose,
    registrationRequestReady,
    showMoyasarCheckout,
    moyasarPublishableKey,
    unifiedPaymentInit.description,
    unifiedPaymentInit.metadata,
    isWalletTopup,
    walletPkg,
    effectiveAmountHalalas,
    effectiveDescription,
    effectiveMetadata,
  ]);

  /** تهيئة ودجت OPPWA لبنك الأول (SAB) بعد الإقرارات. */
  useEffect(() => {
    if (!showSabCheckout) return;
    if (
      paymentMethod !== 'sab' ||
      !sabTermsAccepted ||
      !softwareProductAcknowledged ||
      !registrationRequestReady
    ) {
      setSabFormError(null);
      if (sabHostRef.current) sabHostRef.current.innerHTML = '';
      return;
    }

    const host = sabHostRef.current;
    if (!host) return;

    let cancelled = false;
    setSabFormError(null);
    setSabCheckoutLoading(true);

    const shopperResultUrl = buildSabShopperResultUrl(ROUTE_PATHS.PAYMENT, {
      tier,
      qty: String(licenseQuantity),
      ...(digitalShiftAddonSelected ? { aiAddon: '1' } : {}),
      requestId,
      ...(linkedBarberId ? { linkedBarberId } : {}),
      ...(barberName ? { barberName } : {}),
      purpose: purchasePurpose,
    });

    void createSabCheckoutRemote({
      tier,
      amountHalalas: monthlyAmountHalalas,
      licenseQuantity,
      digitalShiftAddonSelected,
      barberName: barberName || 'عميل حلاق ماب',
      requestId,
      linkedBarberId,
      shopperResultUrl,
    })
      .then(async (checkout) => {
        if (cancelled) return;
        setSabCheckoutLoading(false);
        if (!checkout.ok) {
          if (checkout.error === 'sab_disabled') {
            setSabFormError('بوابة SAB غير مهيأة على الخادم. أضف مفاتيح OPPWA في Vercel.');
          } else {
            setSabFormError(checkout.hint || checkout.detail || checkout.error || 'تعذر إنشاء جلسة الدفع.');
          }
          return;
        }

        setSabWidgetLocaleAr();
        try {
          await loadSabPaymentWidgetScript(checkout.widgetScriptUrl);
        } catch {
          if (!cancelled) setSabFormError('تعذر تحميل ودجت الدفع من بوابة بنك الأول.');
          return;
        }

        if (cancelled || !sabHostRef.current) return;
        mountSabPaymentForm(sabHostRef.current, checkout.shopperResultUrl);
      })
      .catch(() => {
        if (!cancelled) {
          setSabCheckoutLoading(false);
          setSabFormError('تعذر الاتصال بخادم إنشاء جلسة الدفع.');
        }
      });

    return () => {
      cancelled = true;
      if (sabHostRef.current) sabHostRef.current.innerHTML = '';
    };
  }, [
    paymentMethod,
    sabTermsAccepted,
    softwareProductAcknowledged,
    registrationRequestReady,
    showSabCheckout,
    tier,
    monthlyAmountHalalas,
    licenseQuantity,
    digitalShiftAddonSelected,
    barberName,
    requestId,
    linkedBarberId,
    purchasePurpose,
  ]);

  const paymentReturnLoading = moyasarReturnVerify === 'loading' || sabReturnVerify === 'loading';
  const paymentReturnPaid = moyasarReturnVerify === 'paid' || sabReturnVerify === 'paid';
  const paymentReturnUnpaid =
    moyasarReturnVerify === 'unpaid' || sabReturnVerify === 'unpaid';
  const paymentReturnError = moyasarReturnVerify === 'error' || sabReturnVerify === 'error';
  const paymentReturnMessage = sabVerifyMessage || moyasarVerifyMessage;
  const paymentPaidAmountFormat = sabPaidAmountFormat || moyasarPaidAmountFormat;
  const paymentReturnGatewayLabel =
    sabReturnVerify === 'paid' || sabReturnVerify === 'loading' || sabReturnVerify === 'unpaid' || sabReturnVerify === 'error'
      ? 'بنك الأول'
      : 'ميسر';

  return (
    <div className="min-h-screen overflow-x-hidden bg-background" dir="rtl">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(13,148,136,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(212,175,55,0.1),transparent_50%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6"
            >
              <CreditCard className="w-10 h-10 text-primary" />
            </motion.div>

            {/* شارة تمييز الغرض */}
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold ${
              isWalletTopup
                ? 'border-primary/40 bg-primary/10 text-primary'
                : purchasePurpose === 'recharge'
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-400/40 bg-amber-500/10 text-amber-300'
            }`}>
              {isWalletTopup
                ? '🌙 شحن رصيد المناوب الرقمي'
                : purchasePurpose === 'recharge'
                  ? '🔄 شحن حزمة جديدة لحسابك المسجَّل'
                  : '🆕 شراؤك الأول — تأكيد البيانات والدفع'
              }
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-snug">
              {isWalletTopup
                ? 'شحن محفظة المناوب الرقمي'
                : purchasePurpose === 'recharge'
                  ? 'شحن حزمة رخصة نفاذ جديدة'
                  : 'شراء حزمة رخصة نفاذ — نظام الاستجابة الذكية'
              }
            </h1>
            <p className="text-lg text-muted-foreground">
              {isWalletTopup
                ? 'أضِف رصيد ردود للمناوب الآلي — يعمل فوراً بعد تأكيد الدفع، دون تجديد تلقائي'
                : purchasePurpose === 'recharge'
                  ? 'إضافة حزمة جديدة لحسابك — بياناتك محفوظة، لن نطلبها مجدداً'
                  : 'منصة حلاق ماب — اختر طريقة السداد المناسبة لإتمام شراء حزمة رخصة النفاذ'
              }
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {paymentReturnLoading && (
            <Alert className="mb-6 border-primary/30 bg-primary/5">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <AlertDescription>جاري التحقق من عملية الدفع مع {paymentReturnGatewayLabel}…</AlertDescription>
            </Alert>
          )}

          {purchasePurpose === 'new' && !registrationRequestReady && (
            <Alert className="mb-6 border-amber-500/40 bg-amber-500/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm leading-relaxed space-y-2">
                <p>
                  لا يمكن إتمام <strong>الشراء الأول</strong> من هذه الصفحة مباشرة دون رقم طلب تسجيل صالح (
                  <span dir="ltr">HM-…</span>).
                </p>
                <p>
                  أكمل{' '}
                  <Link to={ROUTE_PATHS.REGISTER} className="font-semibold text-primary underline-offset-2 hover:underline">
                    نموذج التسجيل
                  </Link>{' '}
                  أولاً — ثم انتقل للدفع من صفحة نجاح التسجيل.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {paymentReturnPaid && isWalletTopup && (
            <div className="mb-6">
              <Card className="border-emerald-500/40 bg-emerald-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                    تم استلام الدفع — شحن محفظة المناوب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {walletTopupLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري شحن الرصيد وتأكيده…
                    </div>
                  ) : walletTopupResult ? (
                    <div className="space-y-2">
                      <p className="text-base font-bold text-foreground">
                        {walletTopupResult.alreadyCredited ? 'الرصيد محدَّث بالفعل ✅' : 'تم شحن الرصيد بنجاح ✅'}
                      </p>
                      <div className="grid gap-1 text-muted-foreground">
                        {walletTopupResult.creditedHalalas > 0 ? (
                          <p>
                            المُضاف الآن:{' '}
                            <strong className="text-foreground">
                              {(walletTopupResult.creditedHalalas / 100).toFixed(2)} ر.س
                            </strong>{' '}
                            (صافي بعد ضريبة {WALLET_TOPUP_VAT_PERCENT}%)
                          </p>
                        ) : null}
                        <p>
                          الرصيد الحالي:{' '}
                          <strong className="text-foreground">
                            {(walletTopupResult.balanceHalalas / 100).toFixed(2)} ر.س
                          </strong>{' '}
                          ≈ <strong className="text-foreground">{walletTopupResult.repliesRemaining}</strong> رد آلي
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        عاد الرصيد للوحة تحكمك — يمكنك متابعة تشغيل المناوب فوراً.
                      </p>
                    </div>
                  ) : walletTopupError ? (
                    <Alert className="border-amber-600/40 bg-amber-500/10">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="space-y-3">
                        <p>{walletTopupError}</p>
                        {(readMoyasarPaidReceipt(requestId) || readMoyasarLastPaymentId()) ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const pid =
                                readMoyasarPaidReceipt(requestId) || readMoyasarLastPaymentId() || '';
                              if (pid) void loadWalletTopupFulfillment(pid);
                            }}
                          >
                            إعادة محاولة شحن الرصيد
                          </Button>
                        ) : null}
                      </AlertDescription>
                    </Alert>
                  ) : null}
                  {paymentPaidAmountFormat ? (
                    <p className="text-xs font-medium text-muted-foreground" dir="ltr">
                      المبلغ المؤكد من {paymentReturnGatewayLabel}: {paymentPaidAmountFormat}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          )}

          {paymentReturnPaid && !isWalletTopup && (
            <div className="mb-6 space-y-4">
              <PaymentSuccessPanel
                barberName={barberName}
                certificate={activationCertificate}
                loading={activationCertificateLoading}
                failed={Boolean(activationCertificateError) && !activationCertificateLoading && !activationCertificate}
              />
              {activationCertificateError && !activationCertificateLoading && !activationCertificate ? (
                <Alert className="border-amber-600/40 bg-amber-500/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="space-y-3 text-sm">
                    <p>{activationCertificateError}</p>
                    {(readMoyasarPaidReceipt(requestId) || readMoyasarLastPaymentId()) ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const pid =
                            readMoyasarPaidReceipt(requestId) || readMoyasarLastPaymentId() || '';
                          if (pid) void loadPaidActivationCertificate(pid);
                        }}
                      >
                        إعادة محاولة إصدار الشهادة
                      </Button>
                    ) : null}
                  </AlertDescription>
                </Alert>
              ) : null}
              {paymentPaidAmountFormat ? (
                <p className="text-xs font-medium text-muted-foreground" dir="ltr">
                  المبلغ المؤكد من {paymentReturnGatewayLabel}: {paymentPaidAmountFormat}
                </p>
              ) : null}
            </div>
          )}

          {(paymentReturnUnpaid || paymentReturnError) && paymentReturnMessage && (
            <Alert
              className={`mb-6 ${
                paymentReturnUnpaid
                  ? 'border-amber-600/40 bg-amber-500/10'
                  : 'border-destructive/40 bg-destructive/10'
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-3 text-sm leading-relaxed">
                <p>{paymentReturnMessage}</p>
                {moyasarPaymentIdFromUrl && paymentReturnUnpaid ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMoyasarReturnVerify('loading');
                      setMoyasarVerifyMessage(null);
                      setMoyasarVerifyNonce((n) => n + 1);
                    }}
                  >
                    إعادة التحقق من ميسر
                  </Button>
                ) : null}
                {paymentReturnUnpaid || paymentReturnError ? (
                  <p className="text-xs text-muted-foreground">
                    إن ظهرت العملية <strong className="text-foreground">مدفوعة</strong> في لوحة ميسر، انسخ
                    معرّف الدفع (UUID) من تفاصيل العملية وأضفه للرابط:{' '}
                    <span dir="ltr" className="font-mono">
                      &amp;id=...
                    </span>
                  </p>
                ) : null}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subscription / Wallet Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isWalletTopup ? 'ملخص شحن محفظة المناوب الرقمي' : 'ملخص حزمة رخصة النفاذ الرقمية'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isWalletTopup ? (
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center text-white text-2xl">
                          🌙
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{walletPkg?.labelAr ?? 'باقة شحن المحفظة'}</h3>
                          <p className="text-sm text-muted-foreground">
                            شحن رصيد ردود المناوب الآلي (كل رد ≈ 1.50 ر.س)
                          </p>
                          <p className="mt-1 text-xs font-medium text-primary">
                            يُضاف الأساسي كاملاً للرصيد · ضريبة {WALLET_TOPUP_VAT_PERCENT}% فوق السعر
                          </p>
                        </div>
                      </div>
                      <div className="text-left space-y-1">
                        <p className="text-xs text-muted-foreground">
                          يُضاف للرصيد: {(walletCreditedHalalas / 100).toFixed(2)} ر.س
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ضريبة القيمة المضافة ({WALLET_TOPUP_VAT_PERCENT}%): {(walletVatHalalas / 100).toFixed(2)} ر.س
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {(walletChargedHalalas / 100).toFixed(2)} ر.س
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ≈ {repliesFromHalalas(walletCreditedHalalas)} رد آلي
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tierColor} flex items-center justify-center text-white font-bold`}>
                          {tierName === 'برونزي' && '🥉'}
                          {tierName === 'ذهبي' && '🥇'}
                          {tierName === 'ماسي' && '💎'}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{tierDisplayLabel}</h3>
                          <p className="text-sm text-muted-foreground">حزمة إدراج برمجية (30 يوماً)</p>
                          {digitalShiftAddonSelected ? (
                            <p className="mt-1 text-xs font-medium text-primary">
                              {DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR} · {DIGITAL_SHIFT_PRODUCT_NAME_AR} (
                              {DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س × {licenseQuantity} بطاقة)
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-left space-y-1">
                        {vatSettings.enabled && licenseBreakdown.vat > 0 ? (
                          <>
                            <p className="text-xs text-muted-foreground">
                              قيمة حزمة الرخصة الرقمية الموحد ({licenseQuantity} بطاقة): {licenseBreakdown.subtotal} ر.س
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ضريبة القيمة المضافة ({vatSettings.ratePercent}%): {licenseBreakdown.vat} ر.س
                            </p>
                            <p className="text-2xl font-bold text-primary">{licenseBreakdown.total} ر.س</p>
                            <p className="text-xs text-muted-foreground">إجمالي قيمة حزمة الرخصة</p>
                          </>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-primary">{price} ر.س</p>
                            <p className="text-xs text-muted-foreground">لحزمة الرخصة (دون ضريبة قيمة مضافة)</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <PaymentMerchantCompliancePanel />

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>اختر طريقة الدفع</CardTitle>
                  <CardDescription>جميع المعاملات آمنة ومشفرة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value: 'moyasar' | 'sab') => {
                      setPaymentMethod(value);
                      if (value !== 'moyasar') setMoyasarTermsAccepted(false);
                      if (value !== 'sab') setSabTermsAccepted(false);
                    }}
                  >
                    {enableMoyasarCard ? (
                      <label
                        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === 'moyasar'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="moyasar" id="moyasar" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">ميسر (Moyasar)</h3>
                            {preferredGatewayCode === 'MOYASAR' && availablePaymentChannels.length > 1 ? (
                              <Badge variant="secondary" className="text-xs">افتراضي</Badge>
                            ) : availablePaymentChannels.length === 1 ? (
                              <Badge variant="secondary" className="text-xs">موصى به</Badge>
                            ) : null}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            بوابة دفع سعودية آمنة — دعم جميع البطاقات (مدى، فيزا، ماستركارد)
                          </p>
                          <div
                            className="mt-2 flex flex-wrap items-center gap-3 text-muted-foreground"
                            aria-label="وسائل الدفع: مدى، فيزا، ماستركارد"
                          >
                            <MadaBadgeIcon className="h-6 opacity-80" />
                            <VisaMastercardBadgeIcon className="h-6 opacity-80" />
                          </div>
                        </div>
                      </label>
                    ) : null}

                    {enableSabGateway ? (
                      <label
                        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === 'sab'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="sab" id="sab" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">بنك الأول — دفع بالبطاقة (SAB)</h3>
                            {preferredGatewayCode === 'SAB' && availablePaymentChannels.length > 1 ? (
                              <Badge variant="secondary" className="text-xs">افتراضي</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">SAB</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            مسار البطاقة عبر بنك الأول — يُكمل بعد ربط البوابة والتحقق من الـ webhook.
                          </p>
                        </div>
                      </label>
                    ) : null}
                  </RadioGroup>

                  {pubPayConfig?.ok === false && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm leading-relaxed">
                        تعذّر تحميل إعدادات الدفع من الخادم ({pubPayConfig.error || 'خطأ'}). تُعرض ميسر
                        افتراضياً. تحقق من متغيرات Supabase على Vercel ثم أعد تحميل الصفحة.
                      </AlertDescription>
                    </Alert>
                  )}

                  {availablePaymentChannels.length === 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm leading-relaxed">
                        لا توجد قناة دفع مفعّلة حالياً. فعّل ميسر أو مسار SAB من{' '}
                        <strong>لوحة إدارة المنصة → بوابات الدفع</strong>.
                      </AlertDescription>
                    </Alert>
                  )}

                  {pubPayConfig?.ok && (
                    <p className="text-xs text-muted-foreground">
                      وضع الدفع المعروض للمنصة:{' '}
                      <strong>{pubPayConfig.displayPaymentMode === 'live' ? 'إنتاج' : 'اختبار'}</strong>
                    </p>
                  )}

                  {paymentMethod === 'moyasar' && showMoyasarCheckout && (
                    <div className="space-y-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                      <p className="text-sm font-medium text-primary">
                        الخطوة التالية: فعّل الإقرارات أدناه لعرض نموذج الدفع الآمن من ميسر.
                      </p>
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription className="space-y-2 text-sm leading-relaxed">
                          <p>
                            الدفع عبر <strong>ميسر (شركة مُيسر المالية)</strong> يخضع لـ{' '}
                            <a
                              href="https://moyasar.com/ar/resources/terms/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-primary underline-offset-2 hover:underline"
                            >
                              الشروط والأحكام الرسمية للتاجر
                            </a>{' '}
                            وللوائح التقنية في{' '}
                            <a
                              href="https://docs.mysr.dev/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-primary underline-offset-2 hover:underline"
                            >
                              وثائق التكامل (mysr.dev)
                            </a>
                            . يلتزم التاجر بـ SSL، والتحقق من الدفع في الخادم، وعدم تخزين بيانات البطاقة،
                            وإظهار هوية التاجر وسياسة الاسترداد للعميل — راجع{' '}
                            <Link to={ROUTE_PATHS.TERMS_OF_SERVICE} className="font-medium text-primary underline-offset-2 hover:underline">
                              شروط الاستخدام
                            </Link>
                            ،{' '}
                            <Link to={REFUND_POLICY_PATH} className="font-medium text-primary underline-offset-2 hover:underline">
                              سياسة الاسترجاع والاسترداد
                            </Link>
                            ، و{' '}
                            <Link to={ROUTE_PATHS.SUBSCRIPTION_POLICY} className="font-medium text-primary underline-offset-2 hover:underline">
                              سياسة رخصة النفاذ الرقمية
                            </Link>
                            .
                          </p>
                        </AlertDescription>
                      </Alert>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="software-product-ack"
                          checked={softwareProductAcknowledged}
                          onCheckedChange={(c) => setSoftwareProductAcknowledged(c === true)}
                          className="mt-1"
                        />
                        <Label htmlFor="software-product-ack" className="cursor-pointer text-sm font-normal leading-relaxed">
                          <span className="font-semibold text-foreground">{SOFTWARE_PRODUCT_PURCHASE_ACK_SHORT_AR}</span>
                          {' — '}
                          {SOFTWARE_PRODUCT_PURCHASE_ACK_AR.replace(/\*\*/g, '')}
                        </Label>
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="moyasar-merchant-terms"
                          checked={moyasarTermsAccepted}
                          onCheckedChange={(c) => setMoyasarTermsAccepted(c === true)}
                          className="mt-1"
                        />
                        <Label htmlFor="moyasar-merchant-terms" className="cursor-pointer text-sm font-normal leading-relaxed">
                          <span className="font-semibold text-foreground">أقر</span> بأنني اطلعت على{' '}
                          <Link to={ROUTE_PATHS.TERMS_OF_SERVICE} className="font-medium text-primary underline-offset-2 hover:underline">
                            شروط وأحكام الاستخدام
                          </Link>
                          ، و{' '}
                          <Link to={REFUND_POLICY_PATH} className="font-medium text-primary underline-offset-2 hover:underline">
                            سياسة الاسترجاع والاسترداد
                          </Link>
                          ، وشروط بوابة الدفع لشركة مُيسر المالية، وأوافق على المتابعة.
                        </Label>
                      </div>

                      {!moyasarKeyOk && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            لإظهار نموذج الدفع أضف{' '}
                            <code className="rounded bg-muted px-1">VITE_MOYSAR_PUBLISHABLE_TEST_API_KEY</code> (أو{' '}
                            <code className="rounded bg-muted px-1">VITE_MOYSAR_PUBLISHABLE_LIVE_API_KEY</code> في الإنتاج)
                            في Vercel — مفتاح يبدأ بـ <span dir="ltr">pk_test_</span> أو <span dir="ltr">pk_live_</span> — ثم
                            أعد نشر الواجهة.
                          </AlertDescription>
                        </Alert>
                      )}

                      {moyasarKeyOk && (!softwareProductAcknowledged || !moyasarTermsAccepted) && (
                        <p className="text-sm text-muted-foreground">فعّل الإقرارات أعلاه لعرض نموذج ميسر.</p>
                      )}

                      {moyasarKeyOk && softwareProductAcknowledged && moyasarTermsAccepted && registrationRequestReady && (
                        <Card className="border-primary/20">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{paymentActivateNowCtaAr(price)}</CardTitle>
                            <CardDescription>
                              {TERM_ACTIVATE_NOW_AR} — منتج رقمي فوري. المبلغ بالهللة وفق الباقة والضريبة. بعد إتمام
                              العملية يعيد ميسر التوجيه مع <span dir="ltr">?id=</span> ثم يُتحقق من الخادم تلقائياً.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {moyasarFormError && (
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{moyasarFormError}</AlertDescription>
                              </Alert>
                            )}
                            <div
                              ref={moyasarHostRef}
                              className="min-h-[280px] w-full max-w-full overflow-x-auto rounded-md border border-border bg-background p-2"
                              dir="ltr"
                            />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              إن لم يظهر النموذج، تأكد من أن الموقع يعمل على <strong>HTTPS</strong> في الإنتاج (مطلوب
                              للمفاتيح الحية)، وأن النطاق مسجّل في لوحة ميسر.
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              تُدخَل بيانات البطاقة داخل نموذج ميسر نفسه وتُعالَج عبر مزوّد الدفع وفق شروطه
                              وسياساته؛ لا يحتفظ موقع حلاق ماب ببيانات البطاقة الكاملة.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}


                  {showSabCheckout && registrationRequestReady && (
                    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription className="space-y-2 text-sm leading-relaxed">
                          <p>
                            الدفع عبر <strong>بنك الأول (SAB)</strong> يتم عبر بوابة OPPWA المعتمدة. تُعالَج بيانات
                            البطاقة داخل ودجت البنك ولا يحتفظ موقع حلاق ماب ببيانات البطاقة الكاملة.
                          </p>
                        </AlertDescription>
                      </Alert>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="sab-software-product-ack"
                          checked={softwareProductAcknowledged}
                          onCheckedChange={(c) => setSoftwareProductAcknowledged(c === true)}
                          className="mt-1"
                        />
                        <Label htmlFor="sab-software-product-ack" className="cursor-pointer text-sm font-normal leading-relaxed">
                          <span className="font-semibold text-foreground">{SOFTWARE_PRODUCT_PURCHASE_ACK_SHORT_AR}</span>
                          {' — '}
                          {SOFTWARE_PRODUCT_PURCHASE_ACK_AR.replace(/\*\*/g, '')}
                        </Label>
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="sab-merchant-terms"
                          checked={sabTermsAccepted}
                          onCheckedChange={(c) => setSabTermsAccepted(c === true)}
                          className="mt-1"
                        />
                        <Label htmlFor="sab-merchant-terms" className="cursor-pointer text-sm font-normal leading-relaxed">
                          <span className="font-semibold text-foreground">أقر</span> بأنني أوافق على متابعة الدفع عبر
                          بوابة بنك الأول وفق شروط التاجر والبنك المعتمدة.
                        </Label>
                      </div>

                      {(!softwareProductAcknowledged || !sabTermsAccepted) && (
                        <p className="text-sm text-muted-foreground">فعّل الإقرارات أعلاه لعرض نموذج بنك الأول.</p>
                      )}

                      {softwareProductAcknowledged && sabTermsAccepted && (
                        <Card className="border-primary/20">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{paymentActivateNowCtaAr(price)}</CardTitle>
                            <CardDescription>
                              {TERM_ACTIVATE_NOW_AR} — بعد إتمام العملية يعيد البنك التوجيه مع{' '}
                              <span dir="ltr">?gateway=sab&amp;id=</span> ثم يُتحقق من الخادم تلقائياً.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {sabCheckoutLoading && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                جاري تجهيز جلسة الدفع…
                              </div>
                            )}
                            {sabFormError && (
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{sabFormError}</AlertDescription>
                              </Alert>
                            )}
                            <div
                              ref={sabHostRef}
                              className="min-h-[280px] w-full max-w-full overflow-x-auto rounded-md border border-border bg-background p-2"
                              dir="ltr"
                            />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              يتطلب الإنتاج <strong>HTTPS</strong> وتسجيل النطاق لدى البنك. webhook الخادم:{' '}
                              <span dir="ltr">/api/sab-webhook</span>
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Security Badge */}
              <Card>
                <CardContent className="space-y-4 p-4">
                  <PlatformTrustStrip variant="strip" />
                  <PlatformTlsTrustBadge variant="card" />
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">هل تحتاج مساعدة؟</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    فريق الدعم متاح للإجابة على استفساراتك
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">📧</span>
                      <span dir="ltr">admin@halaqmap.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">📱</span>
                      <span dir="ltr">0559602685</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">معلومات الدفع</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>حزمة رخصة مسبقة الدفع — دون تجديد تلقائي أو خصم دوري</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>صلاحية الإدراج محددة بمدة حزمة الرخصة المشتراة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>فاتورة رسمية بعد كل دفعة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>دعم فني على مدار الساعة</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
