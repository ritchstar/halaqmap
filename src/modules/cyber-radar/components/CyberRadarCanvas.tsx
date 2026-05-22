/**
 * CyberRadarCanvas — the visual heart of the cyber operations theater.
 *
 * Layers (back → front):
 *   1. Tactical KSA backdrop (reused from platform-radar)
 *   2. External-source ring with country-cluster labels around KSA
 *   3. Inbound trace vectors (animated beams: external source → KSA)
 *   4. Cyber pulses (registration / visit / threat / defence)
 *   5. Top narrator banner
 */

import { useMemo } from 'react';
import { TacticalKingdomBackdrop } from '@/modules/platform-radar/components/TacticalKingdomBackdrop';
import { KSA_VIEWBOX } from '@/modules/platform-radar/lib/saudiKingdomGeo';
import { EXTERNAL_SOURCES, projectExternalSource } from '../lib/cyberGeo';
import type { CyberEvent, CyberEventKind } from '../types';

type Props = {
  pulses: ReadonlyArray<CyberEvent>;
  narrator?: string | null;
  className?: string;
};

const PULSE_PALETTE: Record<CyberEventKind, { glow: string; dot: string; ring: string }> = {
  visit_internal: {
    glow: 'rgba(34,211,238,0.40)', // cyan
    dot: '#67e8f9',
    ring: 'rgba(34,211,238,0.55)',
  },
  visit_external: {
    glow: 'rgba(96,165,250,0.40)', // blue
    dot: '#bfdbfe',
    ring: 'rgba(96,165,250,0.55)',
  },
  registration: {
    glow: 'rgba(74,222,128,0.45)', // emerald
    dot: '#bbf7d0',
    ring: 'rgba(74,222,128,0.6)',
  },
  login_success: {
    glow: 'rgba(217,249,157,0.50)', // lime
    dot: '#ecfccb',
    ring: 'rgba(217,249,157,0.7)',
  },
  threat_probe: {
    glow: 'rgba(251,146,60,0.55)', // amber
    dot: '#fed7aa',
    ring: 'rgba(251,146,60,0.75)',
  },
  threat_attack: {
    glow: 'rgba(248,113,113,0.65)', // red
    dot: '#fecaca',
    ring: 'rgba(248,113,113,0.85)',
  },
  defence_action: {
    glow: 'rgba(192,132,252,0.55)', // violet
    dot: '#e9d5ff',
    ring: 'rgba(192,132,252,0.75)',
  },
};

function CyberPulseDot({ pulse }: { pulse: CyberEvent }) {
  const palette = PULSE_PALETTE[pulse.kind];
  const radius = pulse.severity === 'critical' ? 10 : pulse.severity === 'elevated' ? 8 : 6;
  return (
    <g>
      <circle cx={pulse.source.x} cy={pulse.source.y} r={radius * 3.5} fill={palette.glow}>
        <animate
          attributeName="r"
          values={`${radius * 1.8};${radius * 4.5};${radius * 1.8}`}
          dur="2.4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.85;0.15;0.85"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx={pulse.source.x}
        cy={pulse.source.y}
        r={radius * 1.6}
        fill="none"
        stroke={palette.ring}
        strokeWidth={1.5}
      />
      <circle cx={pulse.source.x} cy={pulse.source.y} r={radius * 0.7} fill={palette.dot} />
    </g>
  );
}

function TraceVector({ pulse }: { pulse: CyberEvent }) {
  if (!pulse.target) return null;
  const palette = PULSE_PALETTE[pulse.kind];
  const { source, target } = pulse;
  // Slight curve so multiple vectors from the same compass direction don't
  // overlap — random-but-stable jitter by pulse id.
  const jitter = (parseInt(pulse.id.slice(-3), 36) % 100) - 50;
  const midX = (source.x + target.x) / 2 + jitter * 0.6;
  const midY = (source.y + target.y) / 2 + jitter * 0.4;
  const pathD = `M${source.x.toFixed(1)} ${source.y.toFixed(1)} Q${midX.toFixed(1)} ${midY.toFixed(1)} ${target.x.toFixed(1)} ${target.y.toFixed(1)}`;
  return (
    <g opacity={0.85}>
      <path d={pathD} fill="none" stroke={palette.ring} strokeWidth={1.2} strokeDasharray="4 6">
        <animate attributeName="stroke-dashoffset" values="0;-30" dur="1.2s" repeatCount="indefinite" />
      </path>
      <circle r={3} fill={palette.dot}>
        <animateMotion dur="1.6s" repeatCount="indefinite" path={pathD} />
      </circle>
    </g>
  );
}

export function CyberRadarCanvas({ pulses, narrator, className }: Props) {
  const viewBox = `0 0 ${KSA_VIEWBOX.width} ${KSA_VIEWBOX.height}`;

  // External source ring labels — calculated once, the labels themselves are
  // static so this never re-renders without prop change.
  const externalLabels = useMemo(
    () =>
      EXTERNAL_SOURCES.map((s) => {
        const pt = projectExternalSource(s.id);
        return { id: s.id, labelAr: s.labelAr, ...pt };
      }),
    [],
  );

  return (
    <div className={`relative h-full w-full overflow-hidden bg-black ${className ?? ''}`}>
      <div
        className="relative mx-auto h-full"
        style={{ aspectRatio: `${KSA_VIEWBOX.width} / ${KSA_VIEWBOX.height}`, maxWidth: '100%' }}
      >
        {/* Layer 1 — KSA tactical backdrop */}
        <div className="absolute inset-0">
          <TacticalKingdomBackdrop />
        </div>

        {/* Overlay SVG — ring labels + vectors + pulses share the same viewBox */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Layer 2 — external source ring */}
          <g>
            {externalLabels.map((s) => (
              <g key={s.id}>
                <circle cx={s.x} cy={s.y} r={5} fill="rgba(148,163,184,0.18)" />
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={2}
                  fill="rgba(148,163,184,0.55)"
                />
                <text
                  x={s.x}
                  y={s.y - 10}
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="system-ui"
                  fill="rgba(148,163,184,0.65)"
                  style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.7)', strokeWidth: 2 }}
                >
                  {s.labelAr}
                </text>
              </g>
            ))}
          </g>

          {/* Layer 3 — trace vectors (threats & defence) */}
          <g>
            {pulses
              .filter((p) => p.target)
              .map((p) => (
                <TraceVector key={`vec-${p.id}`} pulse={p} />
              ))}
          </g>

          {/* Layer 4 — pulse dots */}
          <g>
            {pulses.map((p) => (
              <CyberPulseDot key={p.id} pulse={p} />
            ))}
          </g>
        </svg>

        {/* Layer 5 — narrator banner (HTML, not SVG, so it can wrap RTL) */}
        {narrator ? (
          <div
            dir="rtl"
            className="pointer-events-none absolute left-1/2 top-4 z-30 max-w-[90%] -translate-x-1/2 rounded-full border border-amber-400/40 bg-black/72 px-4 py-1.5 text-[clamp(0.78rem,1.4vw,0.95rem)] font-medium text-amber-100 backdrop-blur-md"
          >
            {narrator}
          </div>
        ) : null}
      </div>
    </div>
  );
}
