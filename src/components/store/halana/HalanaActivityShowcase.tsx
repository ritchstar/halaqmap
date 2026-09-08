/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * واجهة النشاط الحيّة — صفحة العميلة في حلانا1 (مرحلة 1).
 */
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Play, X } from 'lucide-react';
import {
  STORE_HALANA_ATMOSPHERE,
  STORE_HALANA_DEFAULT_POLICY_AR,
  STORE_HALANA_LIVE_ACCENT,
  STORE_HALANA_LIVE_COPY,
} from '@/config/storeHalanaLive';
import { STORE_HALANA_ACTIVITY_COPY } from '@/config/storeHalanaActivity';
import { StoreDirectPayPublicMount } from '@/components/store/StoreDirectPayGuest';
import { StoreShopLogoMark } from '@/components/store/StoreShopLogoMark';
import { splitHalanaYoutubeLines } from '@/lib/storeHalanaShare';
import {
  HALANA_OCCASIONS,
  loadHalanaActivityDraft,
  matchesHalanaOccasion,
  parseReadyLine,
  saveHalanaActivityDraft,
  type HalanaOccasionId,
} from '@/lib/storeHalanaActivityDraft';
import { youtubeEmbedSrc } from '@/lib/storeWeddingLiveLab';
import { normalizeHalanaGalleryKind, type HalanaGalleryKind } from '@/lib/storeHalanaGalleryKind';
import { cn } from '@/lib/utils';

type GalleryItem = { id: string; caption: string; src: string; itemKind?: HalanaGalleryKind };

type ShowcasePayload = {
  shopName: string;
  logoSrc: string;
  promoTitleAr: string;
  promoAr: string;
  flavorsAr: string;
  policyAr: string;
  quotesAr: string;
  gallery: GalleryItem[];
  readyLines: string;
  youtubeUrls: string;
  acceptingOrders?: boolean;
};

function sortGalleryFeaturedFirst(items: GalleryItem[]): GalleryItem[] {
  return [...items].sort((left, right) => {
    const leftFeatured = normalizeHalanaGalleryKind(left.itemKind) === 'featured' ? 0 : 1;
    const rightFeatured = normalizeHalanaGalleryKind(right.itemKind) === 'featured' ? 0 : 1;
    return leftFeatured - rightFeatured;
  });
}

type TabId = keyof typeof STORE_HALANA_ACTIVITY_COPY.tabs;

function splitLines(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function filterGallery(items: GalleryItem[], occasion: HalanaOccasionId): GalleryItem[] {
  return items.filter((item) => matchesHalanaOccasion(`${item.caption} ${item.src}`, occasion));
}

function WorkThumb({ item, onOpen }: { item: GalleryItem; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="halana-activity-work group text-right">
      <div className="halana-activity-work__media">
        <img src={item.src} alt={item.caption || STORE_HALANA_LIVE_COPY.galleryTitleAr} loading="lazy" />
      </div>
      {item.caption ? <p className="halana-activity-work__caption">{item.caption}</p> : null}
    </button>
  );
}

function WorkSheet({
  item,
  token,
  preview = false,
  ordersOpen = true,
  onClose,
}: {
  item: GalleryItem;
  token: string;
  preview?: boolean;
  ordersOpen?: boolean;
  onClose: () => void;
}) {
  const activity = STORE_HALANA_ACTIVITY_COPY;
  const orderHref = `/h/${encodeURIComponent(token)}/order`;

  function startInspired() {
    saveHalanaActivityDraft(token, {
      refWorkId: item.id,
      refWorkCaption: item.caption,
      refWorkSrc: item.src,
      sweetType: item.caption || '',
    });
  }

  return (
    <div className="halana-activity-sheet" role="dialog" aria-modal="true">
      <button type="button" className="halana-activity-sheet__backdrop" aria-label={activity.workSheetCloseAr} onClick={onClose} />
      <div className="halana-activity-sheet__panel">
        <button type="button" className="halana-activity-sheet__close" onClick={onClose} aria-label={activity.workSheetCloseAr}>
          <X className="h-5 w-5" />
        </button>
        <div className="halana-activity-sheet__media">
          <img src={item.src} alt={item.caption || activity.worksTitleAr} />
        </div>
        <div className="halana-activity-sheet__body">
          <h2 className="halana-title-sm">{item.caption || activity.worksTitleAr}</h2>
          <p className="mt-2 text-sm leading-7 text-white/70">{activity.workSheetIncludesAr}</p>
          <p className="mt-3 text-sm leading-7 text-[#ffe8c4]/85">{STORE_HALANA_LIVE_COPY.refDisclaimerAr}</p>
          {ordersOpen ? (
            preview ? (
              <span className="halana-activity-primary mt-6 flex min-h-[3rem] items-center justify-center rounded-full px-5 text-sm font-extrabold">
                {activity.orderInspiredAr}
              </span>
            ) : (
              <Link
                to={orderHref}
                onClick={startInspired}
                className="halana-activity-primary mt-6 flex min-h-[3rem] items-center justify-center rounded-full px-5 text-sm font-extrabold"
              >
                {activity.orderInspiredAr}
              </Link>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

function HalanaVideoTile({ url, title }: { url: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const embed = youtubeEmbedSrc(url, { loop: false, autoplay: true });
  const activity = STORE_HALANA_ACTIVITY_COPY;

  if (!embed) return null;

  return (
    <div className="halana-activity-video">
      {playing ? (
        <iframe
          title={title}
          src={embed}
          className="aspect-video w-full rounded-2xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="halana-activity-video__poster">
          <span className="halana-activity-video__play">
            <Play className="h-6 w-6" aria-hidden />
            {activity.videoPlayAr}
          </span>
        </button>
      )}
    </div>
  );
}

function TabPanel({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <section className="halana-activity-panel">
      <h2 className="halana-title-sm">{title}</h2>
      {lead ? <p className="halana-activity-panel__lead">{lead}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function HalanaActivityShowcase({
  token,
  payload,
  preview = false,
  acceptingOrders = true,
}: {
  token: string;
  payload: ShowcasePayload;
  preview?: boolean;
  acceptingOrders?: boolean;
}) {
  const copy = STORE_HALANA_LIVE_COPY;
  const activity = STORE_HALANA_ACTIVITY_COPY;
  const orderHref = `/h/${encodeURIComponent(token)}/order`;
  const ordersOpen = acceptingOrders !== false;

  const [tab, setTab] = useState<TabId>('home');
  const [occasion, setOccasion] = useState<HalanaOccasionId>(() => loadHalanaActivityDraft(token).occasion);
  const [activeWork, setActiveWork] = useState<GalleryItem | null>(null);

  const promo = splitLines(payload.promoAr);
  const flavors = splitLines(payload.flavorsAr);
  const quotes = splitLines(payload.quotesAr);
  const ready = splitLines(payload.readyLines);
  const works = useMemo(() => sortGalleryFeaturedFirst(payload.gallery), [payload.gallery]);
  const filteredWorks = useMemo(() => filterGallery(works, occasion), [works, occasion]);
  const featured = filteredWorks.slice(0, 3);
  const draft = loadHalanaActivityDraft(token);

  const youtube = splitHalanaYoutubeLines(payload.youtubeUrls);
  const clips = youtube.clips.slice(0, 3);

  const leadLine = payload.promoTitleAr || promo[0] || copy.showcaseLeadAr;
  const coverSrc = works[0]?.src || STORE_HALANA_ATMOSPHERE.cake;

  function pickOccasion(id: HalanaOccasionId) {
    setOccasion(id);
    saveHalanaActivityDraft(token, { occasion: id });
    if (id !== 'all') setTab('home');
  }

  const stickyLabel = draft.refWorkId ? activity.stickyInspiredAr : activity.stickyOrderAr;

  return (
    <div className="halana-activity">
      <header className="halana-activity-header">
        <div className="halana-activity-header__cover">
          <img src={coverSrc} alt="" className="halana-activity-header__cover-img" />
          <div className="halana-activity-header__veil" />
        </div>
        <div className="halana-activity-header__body">
          <div className="flex items-start gap-3">
            <StoreShopLogoMark src={payload.logoSrc} />
            <div className="min-w-0 flex-1">
              <p className={cn('halana-activity-status', !ordersOpen && 'halana-activity-status--paused')}>
                {ordersOpen ? activity.statusOpenAr : activity.statusPausedAr}
              </p>
              <h1 className="halana-title mt-1 text-2xl sm:text-3xl">{payload.shopName || copy.titleAr}</h1>
              <p className="halana-activity-header__lead">{leadLine}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {ordersOpen ? (
              preview ? (
                <span className="halana-activity-primary min-h-[2.75rem] flex-1 rounded-full px-4 py-2.5 text-center text-sm font-extrabold sm:flex-none sm:px-6">
                  {activity.startOrderAr}
                </span>
              ) : (
                <Link
                  to={orderHref}
                  className="halana-activity-primary min-h-[2.75rem] flex-1 rounded-full px-4 py-2.5 text-center text-sm font-extrabold sm:flex-none sm:px-6"
                >
                  {activity.startOrderAr}
                </Link>
              )
            ) : (
              <span className="halana-activity-secondary min-h-[2.75rem] flex-1 rounded-full px-4 py-2.5 text-center text-sm font-bold sm:flex-none sm:px-6 opacity-90">
                {activity.statusPausedAr}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setTab('works');
                document.getElementById('halana-activity-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="halana-activity-secondary min-h-[2.75rem] flex-1 rounded-full px-4 py-2.5 text-sm font-bold sm:flex-none sm:px-6"
            >
              {activity.browseWorksAr}
            </button>
          </div>
        </div>
      </header>

      {ready[0] ? (
        <div className="halana-activity-live-banner" role="status">
          {activity.liveReadyBannerAr(ready[0])}
        </div>
      ) : null}

      <div className="halana-activity-trust" aria-label="ضمانات الطلب">
        {activity.trustStrip.map((line) => (
          <span key={line} className="halana-activity-trust__chip">
            {line}
          </span>
        ))}
      </div>

      <section className="halana-activity-explorer">
        <h2 className="halana-activity-explorer__title">{activity.explorerTitleAr}</h2>
        <div className="halana-activity-explorer__row">
          {HALANA_OCCASIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => pickOccasion(item.id)}
              className={cn('halana-activity-occasion', occasion === item.id && 'halana-activity-occasion--active')}
            >
              {item.labelAr}
            </button>
          ))}
        </div>
      </section>

      <nav id="halana-activity-tabs" className="halana-activity-tabs" aria-label="أقسام الصفحة">
        {(Object.keys(activity.tabs) as TabId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn('halana-activity-tabs__btn', tab === id && 'halana-activity-tabs__btn--active')}
            aria-current={tab === id ? 'page' : undefined}
          >
            {activity.tabs[id]}
          </button>
        ))}
      </nav>

      <div className="halana-activity-content halana-shell mx-auto max-w-3xl px-4 pb-28 pt-6">
        {tab === 'home' ? (
          <div className="space-y-8">
            <TabPanel title={activity.featuredTitleAr} lead={activity.featuredLeadAr}>
              {featured.length > 0 ? (
                <div className="halana-activity-grid halana-activity-grid--featured">
                  {featured.map((item) => (
                    <WorkThumb key={item.id} item={item} onOpen={() => setActiveWork(item)} />
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-white/60">{copy.galleryEmptyAr}</p>
              )}
            </TabPanel>
            {promo.length > 0 ? (
              <div className="halana-activity-surface rounded-2xl p-4">
                {promo.map((line) => (
                  <p key={line} className="text-base leading-8 text-[#fff6e6]/90">
                    {line}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === 'ready' ? (
          <TabPanel title={activity.readyTitleAr} lead={activity.readyLeadAr}>
            {ready.length > 0 ? (
              <ul className="space-y-3">
                {ready.map((line) => {
                  const parsed = parseReadyLine(line);
                  return (
                    <li key={line} className="halana-activity-ready-card">
                      <div>
                        <p className="font-extrabold text-[#ffe8c4]">{parsed.title}</p>
                        {parsed.detail ? <p className="mt-1 text-sm leading-7 text-white/75">{parsed.detail}</p> : null}
                        <p className="mt-2 text-xs font-bold text-[#f3c48a]/90">{activity.readyPricingAr}</p>
                      </div>
                      {ordersOpen ? (
                        preview ? (
                          <span className="halana-activity-primary mt-3 inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-full px-4 text-sm font-extrabold">
                            {activity.orderThisAr}
                          </span>
                        ) : (
                          <Link
                            to={orderHref}
                            onClick={() =>
                              saveHalanaActivityDraft(token, {
                                sweetType: parsed.title,
                                refWorkCaption: parsed.detail,
                              })
                            }
                            className="halana-activity-primary mt-3 inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-full px-4 text-sm font-extrabold"
                          >
                            {activity.orderThisAr}
                          </Link>
                        )
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm leading-7 text-white/60">{copy.galleryEmptyAr}</p>
            )}
          </TabPanel>
        ) : null}

        {tab === 'works' ? (
          <TabPanel title={activity.worksTitleAr} lead={activity.worksLeadAr}>
            {filteredWorks.length > 0 ? (
              <div className="halana-activity-grid">
                {filteredWorks.map((item) => (
                  <WorkThumb key={item.id} item={item} onOpen={() => setActiveWork(item)} />
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-white/60">{copy.galleryEmptyAr}</p>
            )}
          </TabPanel>
        ) : null}

        {tab === 'about' ? (
          <div className="space-y-8">
            {quotes.length > 0 ? (
              <TabPanel title={copy.quotesTitleAr}>
                <ul className="space-y-3">
                  {quotes.slice(0, 3).map((line) => (
                    <li key={line} className="halana-quote rounded-2xl px-5 py-4 text-base leading-8">
                      {line}
                    </li>
                  ))}
                </ul>
              </TabPanel>
            ) : null}
            {flavors.length > 0 ? (
              <TabPanel title={activity.flavorsPreviewAr} lead={activity.flavorsOrderHintAr}>
                <div className="flex flex-wrap gap-2">
                  {flavors.map((line) => (
                    <span key={line} className="halana-flavor-chip">
                      {line}
                    </span>
                  ))}
                </div>
                {ordersOpen ? (
                  preview ? (
                    <span className="halana-activity-secondary mt-4 inline-flex min-h-[2.75rem] items-center rounded-full px-5 text-sm font-bold">
                      {activity.startOrderAr}
                    </span>
                  ) : (
                    <Link
                      to={orderHref}
                      className="halana-activity-secondary mt-4 inline-flex min-h-[2.75rem] items-center rounded-full px-5 text-sm font-bold"
                    >
                      {activity.startOrderAr}
                    </Link>
                  )
                ) : null}
              </TabPanel>
            ) : null}
            {clips.length > 0 ? (
              <TabPanel title={activity.videoTitleAr}>
                <div className="space-y-4">
                  {clips.map((url) => (
                    <HalanaVideoTile key={url} url={url} title={copy.youtubeTitleAr} />
                  ))}
                </div>
              </TabPanel>
            ) : null}
            <TabPanel title={activity.policySummaryTitleAr}>
              <ol className="halana-activity-surface list-decimal space-y-2 rounded-2xl p-5 ps-8 text-sm leading-8">
                {activity.policySummary.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-bold text-[#f3c48a]">{activity.policyFullAr}</summary>
                <p className="halana-activity-surface mt-3 rounded-2xl p-4 text-sm leading-8 text-white/85">
                  {payload.policyAr || STORE_HALANA_DEFAULT_POLICY_AR}
                </p>
              </details>
            </TabPanel>
            <TabPanel title={copy.payInstructionsTitleAr}>
              <StoreDirectPayPublicMount product="store_halana_live" token={token} accent={STORE_HALANA_LIVE_ACCENT} />
            </TabPanel>
          </div>
        ) : null}
      </div>

      {ordersOpen ? (
        <div className="halana-activity-sticky">
          {preview ? (
            <span className="halana-activity-primary flex min-h-[3rem] flex-1 items-center justify-center rounded-full px-4 text-sm font-extrabold">
              {stickyLabel}
            </span>
          ) : (
            <Link
              to={orderHref}
              className="halana-activity-primary flex min-h-[3rem] flex-1 items-center justify-center rounded-full px-4 text-sm font-extrabold"
            >
              {stickyLabel}
            </Link>
          )}
        </div>
      ) : null}

      {activeWork ? (
        <WorkSheet
          item={activeWork}
          token={token}
          preview={preview}
          ordersOpen={ordersOpen}
          onClose={() => setActiveWork(null)}
        />
      ) : null}
    </div>
  );
}
