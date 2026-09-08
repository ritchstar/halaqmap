/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * معرض حلانا1 وصفحة الطلب ولوحة المتخصصة. غير معلنة. لا تُستورد إعداداتها من App.
 */
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { STORE_HALANA_LIVE_COPY } from '@/config/storeHalanaLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { StoreLiveStoreLink } from '@/components/store/StoreLiveStoreLink';
import { HalanaActivityOrderFlow } from '@/components/store/halana/HalanaActivityOrderFlow';
import { HalanaActivityShowcase } from '@/components/store/halana/HalanaActivityShowcase';
import { HalanaDeskStudio, type HalanaDeskPayload } from '@/components/store/halana/HalanaDeskStudio';
import { PlatformContinuousDevelopmentNotice } from '@/components/platform/PlatformContinuousDevelopmentNotice';
import { fetchHalanaPublic } from '@/lib/storeHalanaLiveRemote';
import { normalizeHalanaGalleryKind } from '@/lib/storeHalanaGalleryKind';
import { parseShopLogoSrc } from '@/lib/storeShopLogo';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { resolveStoreLivePageStyle, sectorIdentityCssVars, storeSectorIdentity } from '@/lib/storeSectorIdentity';

type PayPublic = { bankTransfer: boolean; cashOnPickup: boolean; networkOnPickup: boolean };
type HalanaPayDesk = {
  bankName: string;
  beneficiaryName: string;
  iban: string;
  cashRemainder: boolean;
  networkRemainder: boolean;
};

type Payload = HalanaDeskPayload & {
  payPublic: PayPublic;
};

const EMPTY_PAY_PUBLIC: PayPublic = { bankTransfer: false, cashOnPickup: false, networkOnPickup: false };
const EMPTY_PAY_DESK: HalanaPayDesk = {
  bankName: '',
  beneficiaryName: '',
  iban: '',
  cashRemainder: false,
  networkRemainder: false,
};

const HALANA_SPARKS = [
  { top: '7%', right: '8%', size: 5, delay: '0s', duration: '8s' },
  { top: '14%', right: '78%', size: 3, delay: '1.2s', duration: '11s' },
  { top: '28%', right: '18%', size: 4, delay: '2.1s', duration: '9s' },
  { top: '36%', right: '62%', size: 6, delay: '0.6s', duration: '12s' },
  { top: '48%', right: '10%', size: 3, delay: '3s', duration: '10s' },
  { top: '58%', right: '84%', size: 5, delay: '1.8s', duration: '8.5s' },
  { top: '72%', right: '22%', size: 4, delay: '2.6s', duration: '13s' },
  { top: '81%', right: '70%', size: 3, delay: '0.4s', duration: '9.4s' },
  { top: '88%', right: '40%', size: 5, delay: '1.5s', duration: '11.5s' },
] as const;

const HALANA_PETALS = [
  { top: '12%', right: '42%', delay: '0s' },
  { top: '40%', right: '88%', delay: '3s' },
  { top: '66%', right: '8%', delay: '5s' },
  { top: '84%', right: '54%', delay: '2s' },
] as const;

function HalanaSparkLayer() {
  return (
    <div className="halana-spark-layer" aria-hidden>
      {HALANA_SPARKS.map((spark, index) => (
        <span
          key={`spark-${index}`}
          className="halana-spark"
          style={{
            top: spark.top,
            right: spark.right,
            width: spark.size,
            height: spark.size,
            animationDelay: spark.delay,
            animationDuration: spark.duration,
          }}
        />
      ))}
      {HALANA_PETALS.map((petal, index) => (
        <span
          key={`petal-${index}`}
          className="halana-petal"
          style={{ top: petal.top, right: petal.right, animationDelay: petal.delay }}
        />
      ))}
    </div>
  );
}

export default function StoreHalanaShopPage() {
  const copy = STORE_HALANA_LIVE_COPY;
  useDocumentTitle(copy.documentTitle);
  const location = useLocation();
  const desk = location.pathname.endsWith('/desk');
  const order = location.pathname.endsWith('/order');
  const { token = '' } = useParams<{ token: string }>();
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetchHalanaPublic(token, desk ? 'desk' : 'shop');
    if (!res.ok || !res.payload || typeof res.payload !== 'object') {
      setError(res.error || 'تعذر فتح النسخة.');
      setPayload(null);
      return;
    }
    const raw = res.payload as Payload;
    setError('');
    setPayload({
      ...raw,
      shopToken: String(raw.shopToken || '').trim(),
      shopUrl: String(raw.shopUrl || '').trim(),
      orderUrl: String(raw.orderUrl || '').trim(),
      logoSrc: parseShopLogoSrc(raw.logoSrc, ''),
      gallery: Array.isArray(raw.gallery)
        ? raw.gallery.map((item) => ({
            ...item,
            itemKind: normalizeHalanaGalleryKind(item.itemKind),
          }))
        : [],
      promoTitleAr: raw.promoTitleAr || '',
      promoAr: raw.promoAr || '',
      youtubeUrls: raw.youtubeUrls || '',
      acceptingOrders: raw.acceptingOrders !== false,
      occasionsVisible: Array.isArray(raw.occasionsVisible) ? raw.occasionsVisible : undefined,
      payPublic: raw.payPublic || EMPTY_PAY_PUBLIC,
      payDesk: raw.payDesk || EMPTY_PAY_DESK,
    });
  }

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    void load();
  }, [token, desk, order]);

  if (error && !payload) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-[#14080c] px-6 text-center text-[#f4efe4]" dir="rtl">
        <p>{error}</p>
        {error.includes('انتهت مدة التشغيل') ? (
          <Link className="text-[#c45c7a] underline" to={`${ROUTE_PATHS.STORE_HALANA}?renew=${encodeURIComponent(token)}`}>
            إعادة الشراء على نفس الصفحة
          </Link>
        ) : null}
      </div>
    );
  }
  if (!payload) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#14080c] text-[#f4efe4]/70" dir="rtl">
        يجري فتح حلانا1…
      </div>
    );
  }

  if (desk) {
    const halanaSector = storeSectorIdentity('halana');
    return (
      <div
        dir="rtl"
        className="halana-desk-page store-live-workspace store-live-sector--halana min-h-svh"
        style={sectorIdentityCssVars(halanaSector)}
      >
        <div className="mx-auto max-w-6xl px-3 pt-2 sm:px-4">
          <PlatformContinuousDevelopmentNotice variant="desk" />
        </div>
        <HalanaDeskStudio token={token} payload={payload} onSaved={() => void load()} />
      </div>
    );
  }

  const halanaStorefrontStyle = resolveStoreLivePageStyle({ sector: 'halana', surface: 'storefront' });

  return (
    <div
      dir="rtl"
      className="halana-page store-live-storefront store-live-sector--halana min-h-svh text-[#f4efe4]"
      style={halanaStorefrontStyle}
    >
      <div className="mx-auto max-w-3xl px-3 pt-2 sm:px-4">
        <PlatformContinuousDevelopmentNotice variant="shop" />
      </div>
      <HalanaSparkLayer />
      {order ? (
        <HalanaActivityOrderFlow token={token} payload={payload} busy={busy} setBusy={setBusy} />
      ) : (
        <HalanaActivityShowcase token={token} payload={payload} acceptingOrders={payload.acceptingOrders !== false} />
      )}
      <StoreLiveStoreLink />
    </div>
  );
}
