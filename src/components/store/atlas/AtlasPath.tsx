/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مسار أطلس الحلول: العرض ← الطلب ← التشغيل ← الولاء
 */
import { useLayoutEffect, useRef, useState } from 'react';
import {
  atlasSignalCenter,
  bindAtlasSignalPlayback,
  type AtlasSignalPoint,
} from '@/components/store/atlas/atlasSignalPlayback';
import { STORE_ATLAS_COPY, STORE_ATLAS_JOURNEY } from '@/config/storeAtlasTokens';

function journeyPath(points: AtlasSignalPoint[]): string {
  if (points.length < 2) return '';
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
}

export function AtlasPath({ compact = false }: { compact?: boolean }) {
  const last = STORE_ATLAS_JOURNEY.length - 1;
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [layout, setLayout] = useState<{ w: number; h: number; nodes: AtlasSignalPoint[]; d: string } | null>(null);

  useLayoutEffect(() => {
    const host = boxRef.current;
    if (!host) return;

    const measure = () => {
      const box = host.getBoundingClientRect();
      if (box.width < 8 || box.height < 8) return;
      const dots = [...host.querySelectorAll<HTMLElement>('[data-journey-node]')].filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && el.offsetParent !== null;
      });
      const nodes = dots.map((el) => atlasSignalCenter(box, el));
      setLayout({ w: box.width, h: box.height, nodes, d: journeyPath(nodes) });
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
    return bindAtlasSignalPlayback(svgRef.current, boxRef.current);
  }, [layout?.d, compact]);

  const pathId = compact ? 'atlas-journey-path-c' : 'atlas-journey-path';

  return (
    <section id="atlas-journey" className="store-atlas__section">
      <div className="store-atlas__shell">
        <h2 className="store-atlas__section-title">{STORE_ATLAS_COPY.journeyTitleAr}</h2>
        <p className="store-atlas__body mt-3 max-w-2xl text-[var(--atlas-muted)]">{STORE_ATLAS_COPY.journeyLeadAr}</p>
        <p className="store-atlas__meta mt-2 text-[var(--atlas-muted)]">{STORE_ATLAS_COPY.signalCaptionAr}</p>
        <div
          ref={boxRef}
          className="store-atlas__constellation store-atlas__card store-atlas__skin store-atlas__skin--cool relative mt-8 overflow-hidden px-4 py-8"
        >
          {layout?.d ? (
            <svg ref={svgRef} className="store-atlas__signals" viewBox={`0 0 ${layout.w} ${layout.h}`} aria-hidden>
              <defs>
                <linearGradient
                  id={compact ? 'atlas-journey-grad-c' : 'atlas-journey-grad'}
                  gradientUnits="userSpaceOnUse"
                  x1={layout.nodes[0]?.x ?? 0}
                  y1={layout.nodes[0]?.y ?? 0}
                  x2={layout.nodes[layout.nodes.length - 1]?.x ?? 0}
                  y2={layout.nodes[layout.nodes.length - 1]?.y ?? 0}
                >
                  <stop offset="0%" stopColor="#0D9488" />
                  <stop offset="55%" stopColor="#43B8C5" />
                  <stop offset="100%" stopColor="#E8C547" />
                </linearGradient>
              </defs>
              <path
                d={layout.d}
                fill="none"
                stroke="rgb(13 148 136 / 0.35)"
                strokeWidth="1.4"
                strokeDasharray="7 8"
                strokeLinecap="round"
              />
              <path
                id={pathId}
                d={layout.d}
                fill="none"
                stroke={`url(#${compact ? 'atlas-journey-grad-c' : 'atlas-journey-grad'})`}
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.45"
              />
              <circle r="4" className="store-atlas__signal-bead" fill="#35c9bb">
                <animateMotion dur="10s" repeatCount="indefinite">
                  <mpath href={`#${pathId}`} />
                </animateMotion>
              </circle>
            </svg>
          ) : null}
          <ol className={compact ? 'relative z-10 space-y-5' : 'relative z-10 space-y-5 md:hidden'}>
            {STORE_ATLAS_JOURNEY.map((step, index) => (
              <li key={`v-${step.id}`} className="relative ms-3 border-s border-[var(--atlas-teal)]/60 ps-5">
                <span
                  data-journey-node={step.id}
                  className="store-atlas__path-dot absolute -start-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--atlas-teal)]"
                />
                <p className="store-atlas__meta font-extrabold text-[var(--atlas-teal)]">{index + 1}</p>
                <p className="text-xl font-extrabold">{step.titleAr}</p>
              </li>
            ))}
          </ol>
          {compact ? null : (
            <ol className="relative z-10 hidden grid-cols-4 gap-0 md:grid">
              {STORE_ATLAS_JOURNEY.map((step, index) => (
                <li key={`h-${step.id}`} className="text-center">
                  <div className="mb-3 flex items-center">
                    <span
                      className={
                        index === 0
                          ? 'store-atlas__path-line store-atlas__path-line--ghost'
                          : 'store-atlas__path-line'
                      }
                    />
                    <span
                      data-journey-node={step.id}
                      className="store-atlas__path-dot h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--atlas-teal)]"
                    />
                    <span
                      className={
                        index === last
                          ? 'store-atlas__path-line store-atlas__path-line--ghost'
                          : 'store-atlas__path-line'
                      }
                    />
                  </div>
                  <p className="store-atlas__meta font-extrabold text-[var(--atlas-teal)]">{index + 1}</p>
                  <p className="mt-1 text-xl font-extrabold">{step.titleAr}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
