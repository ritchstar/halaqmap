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
import { cn } from '@/lib/utils';

const HERO_NODES = STORE_ATLAS_CARDS.slice(0, 6);

function heroTargetKind(id: string): 'order' | 'screen' | 'ui' {
  if (id === 'lounge') return 'screen';
  if (id === 'produce' || id === 'grocers') return 'order';
  return 'ui';
}

function heroTargetPoint(
  kind: ReturnType<typeof heroTargetKind>,
  ui: AtlasSignalPoint,
  phone: DOMRect,
  host: DOMRect,
): AtlasSignalPoint {
  if (kind === 'order') return { x: ui.x, y: phone.bottom - host.top - 28 };
  if (kind === 'screen') return { x: ui.x, y: phone.top - host.top + 22 };
  return ui;
}

function pathThrough(points: AtlasSignalPoint[]): string {
  if (!points.length) return '';
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
}

function curveTo(from: AtlasSignalPoint, to: AtlasSignalPoint): string {
  const midY = (from.y + to.y) / 2;
  return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${from.x.toFixed(1)} ${midY.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

export function AtlasHero({ compact = false }: { compact?: boolean }) {
  const [focusId, setFocusId] = useState('produce');
  const [hoverId, setHoverId] = useState<string | null>(null);
  const focused = STORE_ATLAS_CARDS.find((card) => card.id === focusId) ?? STORE_ATLAS_CARDS[0];
  const signalId = hoverId ?? focusId;
  const skinRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const ambientId = compact ? 'atlas-hero-ambient-c' : 'atlas-hero-ambient';
  const [layout, setLayout] = useState<{
    w: number;
    h: number;
    nodes: Record<string, AtlasSignalPoint>;
    ui: AtlasSignalPoint;
    dest: AtlasSignalPoint;
    ambient: string;
    hover: string;
  } | null>(null);

  useLayoutEffect(() => {
    const host = skinRef.current;
    if (!host) return;

    const measure = () => {
      const box = host.getBoundingClientRect();
      if (box.width < 8 || box.height < 8) return;
      const nodes: Record<string, AtlasSignalPoint> = {};
      HERO_NODES.forEach((card) => {
        const chip = chipRefs.current[card.id];
        if (chip) nodes[card.id] = atlasSignalCenter(box, chip);
      });
      const phone = phoneRef.current;
      if (!phone) return;
      const phoneBox = phone.getBoundingClientRect();
      const ui = atlasSignalCenter(box, phone);
      const dest = heroTargetPoint(heroTargetKind(signalId), ui, phoneBox, box);
      const ambientPts = ['produce', 'grocers', 'kitchen']
        .map((id) => nodes[id])
        .filter(Boolean) as AtlasSignalPoint[];
      if (nodes.produce) ambientPts.push(heroTargetPoint('order', ui, phoneBox, box));
      const from = nodes[signalId];
      setLayout({
        w: box.width,
        h: box.height,
        nodes,
        ui,
        dest,
        ambient: pathThrough(ambientPts),
        hover: from ? curveTo(from, dest) : '',
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [signalId, compact, focusId]);

  useLayoutEffect(() => {
    return bindAtlasSignalPlayback(svgRef.current, skinRef.current);
  }, [layout?.w, compact]);

  return (
    <section className="store-atlas__section store-atlas__hero">
      <div className="store-atlas__shell grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="store-atlas__copy-veil">
          <h1 className={compact ? 'text-[2.15rem] font-extrabold leading-tight' : 'text-5xl font-extrabold leading-tight md:text-6xl'}>
            {STORE_ATLAS_COPY.heroTitleAr}
          </h1>
          <p className="store-atlas__body mt-4 max-w-xl text-[var(--atlas-muted)]">{STORE_ATLAS_COPY.heroLeadAr}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={ROUTE_PATHS.STORE_GENERAL_TRIAL} className="store-atlas__btn store-atlas__btn--gold">
              {STORE_ATLAS_COPY.heroPrimaryAr}
            </Link>
            <a href="#atlas-products" className="store-atlas__btn store-atlas__btn--ghost">
              {STORE_ATLAS_COPY.heroSecondaryAr}
            </a>
          </div>
        </div>
        <div
          ref={skinRef}
          className="store-atlas__constellation store-atlas__card store-atlas__skin store-atlas__skin--warm relative overflow-hidden p-5"
        >
          <img
            src={focused?.sectorImage}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15"
          />
          {layout ? (
            <svg
              ref={svgRef}
              className="store-atlas__signals"
              viewBox={`0 0 ${layout.w} ${layout.h}`}
              aria-hidden
            >
              <path
                d={layout.ambient}
                fill="none"
                stroke="rgb(13 148 136 / 0.28)"
                strokeWidth="1.2"
                strokeDasharray="5 9"
                strokeLinecap="round"
              />
              {hoverId && layout.hover ? (
                <path
                  className="store-atlas__signal-link is-on"
                  d={layout.hover}
                  fill="none"
                  stroke="var(--signal-color, #35c9bb)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ) : layout.ambient ? (
                <>
                  <path id={ambientId} d={layout.ambient} fill="none" stroke="none" />
                  <circle r="3.2" fill="#35c9bb" className="store-atlas__signal-bead">
                    <animateMotion dur="12s" repeatCount="indefinite">
                      <mpath href={`#${ambientId}`} />
                    </animateMotion>
                  </circle>
                </>
              ) : null}
              {hoverId ? (
                <circle
                  className="store-atlas__signal-ring is-on"
                  cx={layout.dest.x}
                  cy={layout.dest.y}
                  r="9"
                  fill="none"
                  stroke={heroTargetKind(signalId) === 'order' ? '#e8c547' : '#35c9bb'}
                  strokeWidth="1.2"
                />
              ) : null}
            </svg>
          ) : null}
          <div className="relative z-10">
            <div className="mb-3 flex flex-wrap gap-2">
              {HERO_NODES.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  ref={(el) => {
                    chipRefs.current[card.id] = el;
                  }}
                  onClick={() => setFocusId(card.id)}
                  onMouseEnter={() => {
                    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) setHoverId(card.id);
                  }}
                  onMouseLeave={() => setHoverId(null)}
                  onFocus={() => setHoverId(card.id)}
                  onBlur={() => setHoverId(null)}
                  className={cn('store-atlas__chip min-h-11 px-3 text-sm font-bold', signalId === card.id && 'is-on')}
                >
                  <span className="store-atlas__node" aria-hidden />
                  {card.nameAr}
                </button>
              ))}
            </div>
            {focused ? (
              <div ref={phoneRef} className="flex justify-center">
                <ProductUiPreview kind={focused.uiKind} compact={compact} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
