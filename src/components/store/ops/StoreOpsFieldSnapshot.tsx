/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لقطة تطبيقية — بيع ميداني إلى صفحة الزبون. النص والرمز في HTML فقط.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { StoreInViewMount } from '@/components/store/StoreInViewMount';
import { buildAbsoluteHashRoute } from '@/config/siteOrigin';
import { cn } from '@/lib/utils';

export type StoreOpsFieldSnapshotProps = {
  titleAr: string;
  hookAr: string;
  supportAr: string;
  sceneImageSrc: string;
  sceneAltAr: string;
  boardTitleAr: string;
  boardQrCaptionAr: string;
  boardOptionsAr: string;
  /** بادئة مسار صفحة الزبون — `/k/` لطبختنا1 و`/v/` لخضارنا1 */
  guestPathPrefix?: string;
  /** رمز صفحة الزبون — يُستخدم لبناء QR حقيقي */
  qrToken?: string | null;
  /** رابط QR مطلق يتجاوز qrToken */
  qrHref?: string | null;
  /** في المعاينة فقط عند غياب الرابط */
  qrPlaceholderAr?: string;
  phonePreviewHref?: string | null;
  phonePreviewLabelAr?: string;
  activityTypeAr?: string;
  accent?: string;
  className?: string;
};

function guestShopPath(prefix: string, token: string): string {
  const normalized = prefix.endsWith('/') ? prefix : `${prefix}/`;
  return `${normalized}${encodeURIComponent(token.trim())}`;
}

function resolveQrValue(props: StoreOpsFieldSnapshotProps): string | null {
  if (props.qrHref?.trim()) return props.qrHref.trim();
  if (props.qrToken?.trim()) {
    const prefix = props.guestPathPrefix?.trim() || '/v/';
    return buildAbsoluteHashRoute(guestShopPath(prefix, props.qrToken.trim()));
  }
  return null;
}

export function StoreOpsFieldSnapshot(props: StoreOpsFieldSnapshotProps) {
  const {
    titleAr,
    hookAr,
    supportAr,
    sceneImageSrc,
    sceneAltAr,
    boardTitleAr,
    boardQrCaptionAr,
    boardOptionsAr,
    qrPlaceholderAr = 'يُفعّل الرمز بعد اكتمال التفعيل',
    phonePreviewHref,
    phonePreviewLabelAr = 'افتح صفحة العرض التجريبية',
    activityTypeAr,
    accent = '#3d8b4a',
    className,
  } = props;

  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const qrValue = useMemo(() => resolveQrValue(props), [props.qrHref, props.qrToken]);

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
    if (phonePreviewHref?.trim()) {
      const trimmed = phonePreviewHref.trim();
      const hashIdx = trimmed.indexOf('#');
      if (hashIdx >= 0) return trimmed.slice(hashIdx + 1) || '/';
      if (trimmed.startsWith('/')) return trimmed;
    }
    if (props.qrToken?.trim()) {
      const prefix = props.guestPathPrefix?.trim() || '/v/';
      return guestShopPath(prefix, props.qrToken.trim());
    }
    return null;
  }, [phonePreviewHref, props.guestPathPrefix, props.qrToken]);

  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!phonePath || typeof window === 'undefined') return;
    setIframeSrc(`${window.location.origin}${window.location.pathname}#${phonePath}`);
  }, [phonePath]);

  return (
    <section
      ref={sectionRef}
      id="produce-ops-field-snapshot"
      className={cn(
        'store-ops-field-snapshot scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6',
        revealed && 'store-ops-field-snapshot--revealed',
        className,
      )}
      aria-labelledby="store-ops-field-snapshot-title"
    >
      <p className="text-xs font-bold tracking-wide" style={{ color: accent }}>
        {activityTypeAr || 'لقطة تطبيقية'}
      </p>
      <h2 id="store-ops-field-snapshot-title" className="produce-ops-step-title mt-2 font-extrabold text-[#f4efe4]">
        {titleAr}
      </h2>

      <div className="mt-5 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-6">
        <div className="order-2 mt-5 lg:order-1 lg:mt-0">
          <p className="produce-ops-central-hook font-extrabold text-[#e8c547]">{hookAr}</p>
          <p className="produce-ops-central-support mt-3 font-bold leading-8 text-white/88">{supportAr}</p>
        </div>

        <div className="order-1 lg:order-2">
          <StoreInViewMount minHeightClass="min-h-[12rem]">
            <div className="store-ops-field-snapshot__scene overflow-hidden rounded-2xl border border-white/10">
              <img
                src={sceneImageSrc}
                alt={sceneAltAr}
                className="store-ops-field-snapshot__photo aspect-[16/9] h-auto w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="store-ops-field-snapshot__board" aria-label={boardTitleAr}>
                <div className="store-ops-field-snapshot__board-inner">
                  <p className="store-ops-field-snapshot__board-title">{boardTitleAr}</p>
                  <div className="store-ops-field-snapshot__qr-pad">
                    {qrValue ? (
                      <QRCode value={qrValue} size={88} bgColor="#ffffff" fgColor="#061018" level="M" />
                    ) : (
                      <div className="store-ops-field-snapshot__qr-placeholder" aria-hidden />
                    )}
                  </div>
                  <p className="store-ops-field-snapshot__board-caption">{boardQrCaptionAr}</p>
                  <p className="store-ops-field-snapshot__board-options">{boardOptionsAr}</p>
                  {!qrValue ? (
                    <p className="store-ops-field-snapshot__board-placeholder-note">{qrPlaceholderAr}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </StoreInViewMount>
        </div>
      </div>

      {phonePath ? (
        <div className="mt-5 flex flex-col items-center gap-3 md:flex-row md:items-start md:gap-5">
          <div className="store-ops-field-snapshot__phone-shell shrink-0">
            <StoreInViewMount minHeightClass="min-h-[14rem]">
              {iframeSrc ? (
                <iframe
                  title={phonePreviewLabelAr}
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
            <p className="text-sm leading-7 text-white/65">واجهة صفحة زبائن النشاط — ليست سوقاً مشتركاً.</p>
            <Link
              to={phonePath}
              className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 text-sm font-bold"
              style={{ borderColor: `${accent}66`, color: accent }}
            >
              {phonePreviewLabelAr}
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
