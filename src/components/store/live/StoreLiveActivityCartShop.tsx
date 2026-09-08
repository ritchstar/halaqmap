/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * غلاف واجهة النشاط لمنتجات الحي — سلة وطلب.
 */
import { useMemo, useState, type ReactNode } from 'react';
import { liveActivityCopy, type LiveActivityKind } from '@/config/storeLiveActivity';
import { loadLiveActivityDraft, saveLiveActivityDraft } from '@/lib/storeLiveActivityDraft';
import { isShopClosedNow, type StoreShopHoursState } from '@/lib/storeShopHours';
import { resolveShopHeaderCover, resolveShopHeaderCoverStyle } from '@/lib/storeShopBackground';
import { StoreLiveActivityShell } from '@/components/store/live/StoreLiveActivityShell';
import {
  StoreLiveActivityAboutTab,
  StoreLiveActivityHomeTab,
  StoreLiveActivityOrderTab,
  type LiveActivityShelfPreview,
} from '@/components/store/live/StoreLiveActivityPanels';

type HostLike = StoreShopHoursState & {
  shopName: string;
  logoSrc: string;
  blurbAr: string;
  customFields: string[];
  flashAr: string;
  acceptingOrders?: boolean;
  shopHeaderBg?: string;
};

export function StoreLiveActivityCartShop({
  kind,
  token,
  host,
  shelf,
  closed,
  acceptingOrders = true,
  todayName,
  coverSrc,
  hoursBanner,
  directPay,
  children,
}: {
  kind: Exclude<LiveActivityKind, 'halana'>;
  token: string;
  host: HostLike;
  shelf: LiveActivityShelfPreview[];
  closed?: boolean;
  acceptingOrders?: boolean;
  todayName?: string;
  coverSrc?: string;
  hoursBanner?: ReactNode;
  directPay?: ReactNode;
  children: ReactNode;
}) {
  const copy = liveActivityCopy(kind);
  const [tab, setTab] = useState('home');
  const [occasion, setOccasion] = useState(() => loadLiveActivityDraft(kind, token).occasion);

  const tabs = useMemo(
    () => [
      { id: 'home', labelAr: copy.tabs.home },
      { id: 'order', labelAr: copy.tabs.order },
      { id: 'about', labelAr: copy.tabs.about },
    ],
    [copy.tabs.about, copy.tabs.home, copy.tabs.order],
  );

  const isClosed = closed ?? isShopClosedNow(host);
  const statusAr = !acceptingOrders ? copy.statusPausedAr : isClosed ? copy.statusClosedAr : copy.statusOpenAr;
  const statusTone = !acceptingOrders ? 'paused' : isClosed ? 'closed' : 'open';
  const liveBannerLine = host.flashAr.trim()
    ? copy.liveBannerFlashAr(host.flashAr.trim())
    : todayName
      ? copy.liveBannerTodayAr(todayName)
      : '';

  const leadLine = host.blurbAr.trim().split('\n')[0]?.slice(0, 120) || copy.homeFeaturedLeadAr;

  function goOrder() {
    setTab('order');
    window.setTimeout(() => {
      document.getElementById(copy.checkoutId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function pickOccasion(id: string) {
    setOccasion(id);
    saveLiveActivityDraft(kind, token, { occasion: id });
  }

  const heroPhoto = resolveShopHeaderCover(host.shopHeaderBg || '', coverSrc || shelf.find((item) => item.photoSrc)?.photoSrc || '') || '';
  const headerCoverStyle = resolveShopHeaderCoverStyle(host.shopHeaderBg || '');

  return (
    <StoreLiveActivityShell
      coverSrc={heroPhoto || undefined}
      headerCoverStyle={headerCoverStyle}
      logoSrc={host.logoSrc}
      shopName={host.shopName}
      leadLine={leadLine}
      statusAr={statusAr}
      statusTone={statusTone}
      secondaryCta={{ label: copy.browseAr, onClick: goOrder }}
      primaryAction={{ label: copy.startOrderAr, onClick: goOrder }}
      liveBannerLine={liveBannerLine || undefined}
      trustStrip={copy.trustStrip}
      explorerTitleAr={copy.explorerTitleAr}
      occasions={copy.occasions}
      occasion={occasion}
      onOccasionChange={pickOccasion}
      tabs={tabs}
      tab={tab}
      onTabChange={setTab}
      stickyLabel={copy.stickyOrderAr}
      stickyOnClick={goOrder}
      accent={copy.accent}
      sector={kind}
    >
      {tab === 'home' ? (
        <StoreLiveActivityHomeTab
          kind={kind}
          accent={copy.accent}
          titleAr={copy.homeFeaturedTitleAr}
          leadAr={copy.homeFeaturedLeadAr}
          occasion={occasion}
          shelf={shelf}
          todayName={todayName}
          onBrowseOrder={goOrder}
        />
      ) : null}
      {tab === 'order' ? <StoreLiveActivityOrderTab titleAr={copy.orderTabTitleAr}>{children}</StoreLiveActivityOrderTab> : null}
      {tab === 'about' ? (
        <StoreLiveActivityAboutTab
          titleAr={copy.aboutTitleAr}
          blurbAr={host.blurbAr}
          customFields={host.customFields.filter((line) => line.trim()).slice(0, 5)}
          policySummary={copy.policySummary}
          policyFullAr={copy.policyFullAr}
          hoursBanner={hoursBanner}
          directPay={directPay}
        />
      ) : null}
    </StoreLiveActivityShell>
  );
}
