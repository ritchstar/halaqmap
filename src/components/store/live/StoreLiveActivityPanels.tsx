/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { ReactNode } from 'react';
import { liveActivityCopy, type LiveActivityKind } from '@/config/storeLiveActivity';
import { matchesLiveActivityOccasion } from '@/lib/storeLiveActivityDraft';
import { cn } from '@/lib/utils';

export type LiveActivityShelfPreview = {
  catalogId: string;
  nameAr: string;
  price: number;
  photoSrc?: string;
  inStock: boolean;
  featured?: boolean;
};

function priceLine(item: LiveActivityShelfPreview, kind: LiveActivityKind): string {
  if (kind === 'produce' && String(item.catalogId).includes('kg')) {
    return `${item.price} ر.س/ك`;
  }
  return `${item.price} ر.س`;
}

export function StoreLiveActivityHomeTab({
  kind,
  accent,
  titleAr,
  leadAr,
  occasion,
  shelf,
  todayName,
  onBrowseOrder,
}: {
  kind: LiveActivityKind;
  accent: string;
  titleAr: string;
  leadAr: string;
  occasion: string;
  shelf: LiveActivityShelfPreview[];
  todayName?: string;
  onBrowseOrder: () => void;
}) {
  const visible = shelf.filter((item) => item.inStock);
  const filtered = visible.filter((item) => matchesLiveActivityOccasion(kind, item.nameAr, occasion));
  const featured = filtered.filter((item) => item.featured).slice(0, 6);
  const list = featured.length > 0 ? featured : filtered.slice(0, 6);

  return (
    <section className="halana-activity-panel">
      <h2 className="halana-title-sm">{titleAr}</h2>
      <p className="halana-activity-panel__lead">{leadAr}</p>
      {todayName ? (
        <p className="mt-3 rounded-2xl border px-4 py-3 text-sm font-bold" style={{ borderColor: `${accent}55`, color: accent }}>
          {liveActivityCopy(kind).liveBannerTodayAr(todayName)}
        </p>
      ) : null}
      {list.length > 0 ? (
        <div className="halana-activity-grid halana-activity-grid--featured mt-4">
          {list.map((item) => (
            <button key={item.catalogId} type="button" onClick={onBrowseOrder} className="halana-activity-work text-right">
              <div className="halana-activity-work__media">
                {item.photoSrc ? (
                  <img src={item.photoSrc} alt={item.nameAr} loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center px-2 text-center text-sm font-bold text-white/80">{item.nameAr}</div>
                )}
              </div>
              <p className="halana-activity-work__caption">{item.nameAr}</p>
              <p className="px-1 pb-2 text-xs font-black" style={{ color: accent }}>
                {priceLine(item, kind)}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-7 text-white/60">لا توجد مختارات مطابقة — جرّب «عرض الكل» أو انتقل إلى تبويب الطلب.</p>
      )}
      <button type="button" onClick={onBrowseOrder} className="halana-activity-secondary mt-4 min-h-[2.75rem] w-full rounded-full px-4 text-sm font-bold">
        {liveActivityCopy(kind).startOrderAr}
      </button>
    </section>
  );
}

export function StoreLiveActivityAboutTab({
  titleAr,
  blurbAr,
  customFields,
  policySummary,
  policyFullAr,
  policyBodyAr,
  hoursBanner,
  directPay,
}: {
  titleAr: string;
  blurbAr: string;
  customFields: string[];
  policySummary: readonly string[];
  policyFullAr: string;
  policyBodyAr?: string;
  hoursBanner?: ReactNode;
  directPay?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <section className="halana-activity-panel">
        <h2 className="halana-title-sm">{titleAr}</h2>
        {blurbAr ? <p className="halana-activity-panel__lead">{blurbAr}</p> : null}
        {customFields.length > 0 ? (
          <ul className="halana-activity-surface mt-4 space-y-2 rounded-2xl p-4 text-sm leading-8">
            {customFields.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
      </section>
      {hoursBanner}
      <section className="halana-activity-panel">
        <h2 className="halana-title-sm">سياسة الطلب باختصار</h2>
        <ol className="halana-activity-surface list-decimal space-y-2 rounded-2xl p-5 ps-8 text-sm leading-8">
          {policySummary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
        {policyBodyAr ? (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-bold text-[#f3c48a]">{policyFullAr}</summary>
            <p className="halana-activity-surface mt-3 rounded-2xl p-4 text-sm leading-8 text-white/85">{policyBodyAr}</p>
          </details>
        ) : null}
      </section>
      {directPay ? <section className="halana-activity-panel">{directPay}</section> : null}
    </div>
  );
}

export function StoreLiveActivityOrderTab({ titleAr, children }: { titleAr: string; children: ReactNode }) {
  return (
    <section className="halana-activity-panel">
      <h2 className="halana-title-sm">{titleAr}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
