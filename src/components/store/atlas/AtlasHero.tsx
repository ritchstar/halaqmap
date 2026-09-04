/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductUiPreview } from '@/components/store/atlas/ProductUiPreview';
import {
  atlasSignalCenter,
  bindAtlasSignalPlayback,
  type AtlasSignalPoint,
} from '@/components/store/atlas/atlasSignalPlayback';
import { STORE_ATLAS_CARDS, STORE_ATLAS_COPY } from '@/config/storeAtlasTokens';
import { ROUTE_PATHS } from '@/lib/routePaths';

const HERO_FOCUS = STORE_ATLAS_CARDS[0];

function pathThrough(points: AtlasSignalPoint[]): string {
  if (points.length < 2) return '';
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
}

export function AtlasHero({ compact = false }: { compact?: boolean }) {
  const skinRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const laneRef = useRef<HTMLParagraphElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const ambientId = compact ? 'atlas-hero-ambient-c' : 'atlas-hero-ambient';
  const [layout, setLayout] = useState<{ w: number; h: number; ambient: string } | null>(null);

  useLayoutEffect(() => {
    const host = skinRef.current;
    if (!host) return;

    const measure = () => {
      const box = host.getBoundingClientRect();
      if (box.width < 8 || box.height < 8) return;
      const lane = laneRef.current;
      const phone = phoneRef.current;
      if (!lane || !phone) return;
      const laneBox = lane.getBoundingClientRect();
      const phoneBox = phone.getBoundingClientRect();
      const ui = atlasSignalCenter(box, phone);
      const points: AtlasSignalPoint[] = [
        { x: laneBox.left + laneBox.width * 0.12 - box.left, y: laneBox.bottom - box.top },
        { x: ui.x, y: phoneBox.top - box.top + 22 },
        { x: ui.x, y: phoneBox.bottom - box.top - 28 },
      ];
      setLayout({ w: box.width, h: box.height, ambient: pathThrough(points) });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [compact]);

  useLayoutEffect(() => {
    return bindAtlasSignalPlayback(svgRef.current, skinRef.current);
  }, [layout?.ambient, compact]);

  return (
    <section className="store-atlas__section store-atlas__hero">
      <div className="store-atlas__shell grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="store-atlas__copy-veil">
          <p className="store-atlas__hero-kicker">{STORE_ATLAS_COPY.heroKickerAr}</p>
          <h1 className="store-atlas__hero-title mt-2">
            <span className="store-atlas__hero-brand">{STORE_ATLAS_COPY.heroTitleAr}</span>
            <span className="store-atlas__hero-claim">{STORE_ATLAS_COPY.heroClaimAr}</span>
          </h1>
          <p className="store-atlas__hero-lead mt-4 text-[var(--atlas-muted)]">{STORE_ATLAS_COPY.heroLeadAr}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#atlas-products" className="store-atlas__btn store-atlas__btn--primary">
              {STORE_ATLAS_COPY.heroPrimaryAr}
            </a>
            <Link to={ROUTE_PATHS.STORE_REQUEST} className="store-atlas__btn store-atlas__btn--ghost">
              {STORE_ATLAS_COPY.heroSecondaryAr}
            </Link>
          </div>
        </div>
        <div
          ref={skinRef}
          className="store-atlas__constellation store-atlas__card store-atlas__skin store-atlas__skin--warm relative overflow-hidden p-5"
        >
          {layout?.ambient ? (
            <svg
              ref={svgRef}
              className="store-atlas__signals"
              viewBox={`0 0 ${layout.w} ${layout.h}`}
              aria-hidden
            >
              <path
                id={ambientId}
                d={layout.ambient}
                fill="none"
                stroke="var(--signal-color, #35c9bb)"
                strokeOpacity="0.45"
                strokeWidth="1.2"
                strokeDasharray="5 9"
                strokeLinecap="round"
              />
              <circle r="3.2" fill="var(--signal-color, #35c9bb)" className="store-atlas__signal-bead">
                <animateMotion dur="12s" repeatCount="indefinite">
                  <mpath href={`#${ambientId}`} />
                </animateMotion>
              </circle>
            </svg>
          ) : null}
          <div className="relative z-10">
            <p ref={laneRef} className="store-atlas__hero-lane">
              {STORE_ATLAS_COPY.heroSectorsAr}
            </p>
            <div className="store-atlas__product-shell">
              <img
                src={HERO_FOCUS.sectorImage}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14]"
              />
              <div ref={phoneRef} className="relative flex justify-center px-3 py-4">
                <ProductUiPreview kind={HERO_FOCUS.uiKind} compact={compact} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
