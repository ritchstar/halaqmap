/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لقطة تطبيقية من نشاط المتجر إلى صفحة الزبون — نص ورمز QR في HTML فقط.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { StoreInViewMount } from '@/components/store/StoreInViewMount';
import { buildAbsoluteHashRoute } from '@/config/siteOrigin';
import { cn } from '@/lib/utils';

export type GuestMiniSnapshotLayout = 'shelf-prep' | 'qr-packaging' | 'order-desk' | 'delivery-pickup';

export type StoreOpsGuestMiniSnapshotProps = {
  id: GuestMiniSnapshotLayout;
  idPrefix: string;
  hookClassName: string;
  seriesTitleAr: string;
  hookAr: string;
  sceneImageSrc: string;
  sceneAltAr: string;
  accent?: string;
  guestPathPrefix?: string;
  qrToken?: string | null;
  qrHref?: string | null;
  boardTitleAr?: string;
  boardQrCaptionAr?: string;
  phonePreviewHref?: string | null;
  phonePreviewLabelAr?: string;
  deskPreviewHref?: string | null;
  deskPreviewLabelAr?: string;
  shopNoteAr?: string;
  deskNoteAr?: string;
  pickupCaptionAr?: string;
  deliveryCaptionAr?: string;
  className?: string;
};

function guestShopPath(prefix: string, token: string): string {
  const normalized = prefix.endsWith('/') ? prefix : `${prefix}/`;
  return `${normalized}${encodeURIComponent(token.trim())}`;
}

function resolveQrValue(props: StoreOpsGuestMiniSnapshotProps): string | null {
  if (props.qrHref?.trim()) return props.qrHref.trim();
  if (props.qrToken?.trim()) {
    const prefix = props.guestPathPrefix?.trim() || '/g/';
    return buildAbsoluteHashRoute(guestShopPath(prefix, props.qrToken.trim()));
  }
  return null;
}

export function StoreOpsGuestMiniSnapshot(props: StoreOpsGuestMiniSnapshotProps) {
  const {
    id,
    idPrefix,
    hookClassName,
    seriesTitleAr,
    hookAr,
    sceneImageSrc,
    sceneAltAr,
    accent = '#8fbf7a',
    boardTitleAr = 'اطلب من صفحتنا',
    boardQrCaptionAr = 'امسح الرمز واختر مقاضيك',
    phonePreviewLabelAr = 'معاينة صفحة الزبون',
    deskPreviewLabelAr = 'معاينة لوحة الكاشير',
    shopNoteAr = 'صفحة جار الحي — نشاطك الخاص، وليست سوقاً مشتركاً.',
    deskNoteAr = 'لوحة الكاشير — السلة والطلبات وملخص التوصيل اليدوي.',
    pickupCaptionAr = 'استلام من المحل',
    deliveryCaptionAr = 'توصيل داخل النطاق',
    className,
  } = props;

  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const qrValue = useMemo(() => resolveQrValue(props), [props]);

  useEffect(() => {
    if (revealed) return undefined;
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setRevealed(true);
      },
      { rootMargin: '80px 0px', threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [revealed]);

  const phonePath = useMemo(() => {
    if (props.phonePreviewHref?.trim()) {
      const trimmed = props.phonePreviewHref.trim();
      const hashIdx = trimmed.indexOf('#');
      if (hashIdx >= 0) return trimmed.slice(hashIdx + 1) || '/';
      if (trimmed.startsWith('/')) return trimmed;
    }
    if (props.qrToken?.trim()) {
      const prefix = props.guestPathPrefix?.trim() || '/g/';
      return guestShopPath(prefix, props.qrToken.trim());
    }
    return null;
  }, [props.guestPathPrefix, props.phonePreviewHref, props.qrToken]);

  const deskPath = useMemo(() => {
    if (props.deskPreviewHref?.trim()) {
      const trimmed = props.deskPreviewHref.trim();
      const hashIdx = trimmed.indexOf('#');
      if (hashIdx >= 0) return trimmed.slice(hashIdx + 1) || '/';
      if (trimmed.startsWith('/')) return trimmed;
    }
    if (props.qrToken?.trim()) {
      const prefix = props.guestPathPrefix?.trim() || '/g/';
      return `${guestShopPath(prefix, props.qrToken.trim())}/desk`;
    }
    return null;
  }, [props.deskPreviewHref, props.guestPathPrefix, props.qrToken]);

  const iframePath = id === 'order-desk' ? deskPath : phonePath;
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!iframePath || typeof window === 'undefined') return;
    setIframeSrc(`${window.location.origin}${window.location.pathname}#${iframePath}`);
  }, [iframePath]);

  return (
    <section
      ref={sectionRef}
      id={`${idPrefix}-${id}`}
      className={cn(
        'store-ops-guest-mini scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6',
        revealed && 'store-ops-guest-mini--revealed',
        className,
      )}
      aria-labelledby={`${idPrefix}-${id}-title`}
    >
      <p className="text-xs font-bold tracking-wide" style={{ color: accent }}>
        {seriesTitleAr}
      </p>
      <h3 id={`${idPrefix}-${id}-title`} className={cn(hookClassName, 'mt-2 font-extrabold text-[#e8c547]')}>
        {hookAr}
      </h3>

      <div className="mt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-6">
        <div className={cn(id === 'delivery-pickup' && 'lg:col-span-2')}>
          {id === 'delivery-pickup' ? (
            <div className="store-ops-guest-mini__dual-pack grid gap-4 sm:grid-cols-2">
              <figure className="store-ops-guest-mini__pack overflow-hidden rounded-2xl border border-white/10">
                <img src={sceneImageSrc} alt={sceneAltAr} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                <figcaption className="px-4 py-3 text-center text-sm font-extrabold text-[#f4efe4]">{pickupCaptionAr}</figcaption>
              </figure>
              <figure className="store-ops-guest-mini__pack overflow-hidden rounded-2xl border border-white/10">
                <img src={sceneImageSrc} alt="" className="aspect-[4/3] w-full object-cover opacity-90" loading="lazy" aria-hidden />
                <figcaption className="px-4 py-3 text-center text-sm font-extrabold text-[#f4efe4]">{deliveryCaptionAr}</figcaption>
              </figure>
            </div>
          ) : (
            <StoreInViewMount minHeightClass="min-h-[11rem]">
              <div
                className={cn(
                  'store-ops-guest-mini__scene overflow-hidden rounded-2xl border border-white/10',
                  id === 'qr-packaging' && 'store-ops-guest-mini__scene--qr',
                )}
              >
                <img
                  src={sceneImageSrc}
                  alt={sceneAltAr}
                  className="aspect-[16/10] h-auto w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                {id === 'qr-packaging' ? (
                  <div className="store-ops-guest-mini__card" aria-label={boardTitleAr}>
                    <div className="store-ops-guest-mini__card-inner">
                      <p className="store-ops-guest-mini__card-title">{boardTitleAr}</p>
                      <div className="store-ops-guest-mini__qr-pad">
                        {qrValue ? (
                          <QRCode value={qrValue} size={72} bgColor="#ffffff" fgColor="#061018" level="M" />
                        ) : (
                          <div className="store-ops-field-snapshot__qr-placeholder" aria-hidden />
                        )}
                      </div>
                      <p className="store-ops-guest-mini__card-caption">{boardQrCaptionAr}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </StoreInViewMount>
          )}
        </div>

        {id !== 'delivery-pickup' && iframePath ? (
          <div className="mt-5 flex flex-col items-center gap-3 lg:mt-0 md:flex-row md:items-start md:gap-5">
            <div className="store-ops-field-snapshot__phone-shell shrink-0">
              <StoreInViewMount minHeightClass="min-h-[14rem]">
                {iframeSrc ? (
                  <iframe
                    title={id === 'order-desk' ? deskPreviewLabelAr : phonePreviewLabelAr}
                    src={iframeSrc}
                    className="store-ops-field-snapshot__phone-frame hidden md:block"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="store-ops-field-snapshot__phone-fallback hidden md:block" aria-hidden />
                )}
              </StoreInViewMount>
              <div className="store-ops-field-snapshot__phone-fallback md:hidden" aria-hidden />
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm leading-7 text-white/65">{id === 'order-desk' ? deskNoteAr : shopNoteAr}</p>
              <Link
                to={iframePath}
                className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 text-sm font-bold"
                style={{ borderColor: `${accent}66`, color: accent }}
              >
                {id === 'order-desk' ? deskPreviewLabelAr : phonePreviewLabelAr}
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
