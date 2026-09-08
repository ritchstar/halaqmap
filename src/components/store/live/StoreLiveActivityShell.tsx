/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * غلاف واجهة النشاط الحيّة — مشترك بين حلانا1 ومنتجات الحي.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { StoreShopLogoMark } from '@/components/store/StoreShopLogoMark';
import { resolveShopHeaderCoverStyle } from '@/lib/storeShopBackground';
import { cn } from '@/lib/utils';

export type LiveActivityShellTab = { id: string; labelAr: string };

export type LiveActivityShellOccasion = { id: string; labelAr: string };

export function StoreLiveActivityShell({
  coverSrc,
  headerCoverStyle,
  logoSrc,
  shopName,
  leadLine,
  statusAr,
  statusTone = 'open',
  primaryCta,
  primaryAction,
  secondaryCta,
  liveBannerLine,
  trustStrip,
  explorerTitleAr,
  occasions,
  occasion,
  onOccasionChange,
  tabs,
  tab,
  onTabChange,
  stickyLabel,
  stickyHref,
  stickyOnClick,
  children,
  overlay,
}: {
  coverSrc?: string;
  headerCoverStyle?: CSSProperties;
  logoSrc: string;
  shopName: string;
  leadLine: string;
  statusAr: string;
  statusTone?: 'open' | 'closed' | 'paused';
  primaryCta?: { label: string; href: string };
  primaryAction?: { label: string; onClick: () => void };
  secondaryCta?: { label: string; onClick: () => void };
  liveBannerLine?: string;
  trustStrip: readonly string[];
  explorerTitleAr: string;
  occasions: readonly LiveActivityShellOccasion[];
  occasion: string;
  onOccasionChange: (id: string) => void;
  tabs: readonly LiveActivityShellTab[];
  tab: string;
  onTabChange: (id: string) => void;
  stickyLabel: string;
  stickyHref?: string;
  stickyOnClick?: () => void;
  children: ReactNode;
  overlay?: ReactNode;
}) {
  const statusClass =
    statusTone === 'closed'
      ? 'halana-activity-status halana-activity-status--closed'
      : statusTone === 'paused'
        ? 'halana-activity-status halana-activity-status--paused'
        : 'halana-activity-status';

  const stickyInner = stickyHref ? (
    <Link to={stickyHref} className="halana-activity-primary flex min-h-[3rem] flex-1 items-center justify-center rounded-full px-4 text-sm font-extrabold">
      {stickyLabel}
    </Link>
  ) : (
    <button
      type="button"
      onClick={stickyOnClick}
      className="halana-activity-primary flex min-h-[3rem] flex-1 items-center justify-center rounded-full px-4 text-sm font-extrabold"
    >
      {stickyLabel}
    </button>
  );

  return (
    <div className="halana-activity">
      <header className="halana-activity-header">
        {coverSrc ? (
          <div className="halana-activity-header__cover">
            <img src={coverSrc} alt="" className="halana-activity-header__cover-img" />
            <div className="halana-activity-header__veil" />
          </div>
        ) : headerCoverStyle ? (
          <div className="halana-activity-header__cover" style={headerCoverStyle}>
            <div className="halana-activity-header__veil" />
          </div>
        ) : null}
        <div className={cn('halana-activity-header__body', !coverSrc && 'pt-4')}>
          <div className="flex items-start gap-3">
            <StoreShopLogoMark src={logoSrc} />
            <div className="min-w-0 flex-1">
              <p className={statusClass}>{statusAr}</p>
              <h1 className="halana-title mt-1 text-2xl sm:text-3xl">{shopName}</h1>
              {leadLine ? <p className="halana-activity-header__lead">{leadLine}</p> : null}
            </div>
          </div>
          {primaryCta || primaryAction || secondaryCta ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {primaryCta ? (
                <Link
                  to={primaryCta.href}
                  className="halana-activity-primary min-h-[2.75rem] flex-1 rounded-full px-4 py-2.5 text-center text-sm font-extrabold sm:flex-none sm:px-6"
                >
                  {primaryCta.label}
                </Link>
              ) : null}
              {primaryAction ? (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  className="halana-activity-primary min-h-[2.75rem] flex-1 rounded-full px-4 py-2.5 text-sm font-extrabold sm:flex-none sm:px-6"
                >
                  {primaryAction.label}
                </button>
              ) : null}
              {secondaryCta ? (
                <button
                  type="button"
                  onClick={secondaryCta.onClick}
                  className="halana-activity-secondary min-h-[2.75rem] flex-1 rounded-full px-4 py-2.5 text-sm font-bold sm:flex-none sm:px-6"
                >
                  {secondaryCta.label}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      {liveBannerLine ? (
        <div className="halana-activity-live-banner" role="status">
          {liveBannerLine}
        </div>
      ) : null}

      <div className="halana-activity-trust" aria-label="ضمانات الطلب">
        {trustStrip.map((line) => (
          <span key={line} className="halana-activity-trust__chip">
            {line}
          </span>
        ))}
      </div>

      {occasions.length > 1 ? (
        <section className="halana-activity-explorer">
          <h2 className="halana-activity-explorer__title">{explorerTitleAr}</h2>
          <div className="halana-activity-explorer__row">
            {occasions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onOccasionChange(item.id)}
                className={cn('halana-activity-occasion', occasion === item.id && 'halana-activity-occasion--active')}
              >
                {item.labelAr}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <nav id="live-activity-tabs" className="halana-activity-tabs" aria-label="أقسام الصفحة" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={cn('halana-activity-tabs__btn', tab === item.id && 'halana-activity-tabs__btn--active')}
            aria-current={tab === item.id ? 'page' : undefined}
          >
            {item.labelAr}
          </button>
        ))}
      </nav>

      <div className="halana-activity-content halana-shell mx-auto max-w-3xl px-4 pb-28 pt-6">{children}</div>

      <div className="halana-activity-sticky">{stickyInner}</div>

      {overlay}
    </div>
  );
}
