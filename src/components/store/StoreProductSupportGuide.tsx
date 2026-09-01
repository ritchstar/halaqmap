/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  STORE_PRODUCT_SUPPORT_SHELL,
  type StoreProductSupportGuide,
  type StoreProductSupportTabId,
} from '@/config/storeProductSupport';
import { cn } from '@/lib/utils';

export function StoreProductSupportGuideView({ guide }: { guide: StoreProductSupportGuide }) {
  const [tab, setTab] = useState<StoreProductSupportTabId>(guide.tabs[0]?.id || 'activate');
  const current = guide.tabs.find((item) => item.id === tab) || guide.tabs[0];

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-bold" style={{ color: guide.accent }}>
        {guide.kickerAr}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold leading-tight">{guide.titleAr}</h1>
      <p className="mt-4 text-base leading-8 text-white/78">{guide.leadAr}</p>
      <Link to={guide.landingPath} className="mt-4 inline-flex text-sm font-bold" style={{ color: guide.accent }}>
        {STORE_PRODUCT_SUPPORT_SHELL.backAr}
      </Link>

      <div className="store-studio-switch mt-8 flex gap-2 overflow-x-auto pb-2" aria-label={STORE_PRODUCT_SUPPORT_SHELL.tabsLabelAr}>
        {guide.tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-bold',
              item.id === tab ? 'text-[#061018]' : 'border border-white/20 text-white/80',
            )}
            style={item.id === tab ? { backgroundColor: guide.accent } : undefined}
          >
            {item.titleAr}
          </button>
        ))}
      </div>

      {current ? (
        <div className="mt-6 space-y-6">
          {current.sections.map((section) => (
            <section key={section.headingAr} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h2 className="text-lg font-extrabold">{section.headingAr}</h2>
              {section.bodyAr.map((line) => (
                <p key={line} className="mt-2 text-sm leading-7 text-white/75">
                  {line}
                </p>
              ))}
              {section.itemsAr?.length ? (
                <ul className="mt-2 list-disc space-y-1 pr-5 text-sm leading-7 text-white/75">
                  {section.itemsAr.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      ) : null}
    </article>
  );
}
