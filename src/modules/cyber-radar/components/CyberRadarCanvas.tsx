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
import { KSA_OUTLINE_PATH, KSA_VIEWBOX, RIYADH_VIEW } from '@/modules/platform-radar/lib/saudiKingdomGeo';
import { PulseMapCompassOrnament } from '@/modules/pulse-map/components/PulseMapCompassOrnament';
import { PulseMapKingdomSweep } from '@/modules/pulse-map/components/PulseMapKingdomSweep';
import { EXTERNAL_SOURCES, projectExternalSource } from '../lib/cyberGeo';
import type { CyberEvent, CyberEventKind } from '../types';

/** Max viewBox-unit distance to consider a pulse originating from a ring source. */
const RING_PROXIMITY_SQ = 16 * 16; // 16 units

type Props = {
  pulses: ReadonlyArray<CyberEvent>;
  narrator?: string | null;
  className?: string;
  showOrnaments?: boolean;
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
  const hasVolume = typeof pulse.volume === 'number' && pulse.volume > 1;
  const volumeLabel =
    hasVolume && pulse.volume !== undefined
      ? pulse.volume >= 1000
        ? `×${(pulse.volume / 1000).toFixed(1)}k`
        : `×${pulse.volume}`
      : null;

  return (
    <g>
      {/* Expanding glow halo */}
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
      {/* Outer ring */}
      <circle
        cx={pulse.source.x}
        cy={pulse.source.y}
        r={radius * 1.6}
        fill="none"
        stroke={palette.ring}
        strokeWidth={1.5}
      />
      {/* Core dot */}
      <circle cx={pulse.source.x} cy={pulse.source.y} r={radius * 0.7} fill={palette.dot} />
      {/* Volume badge */}
      {volumeLabel ? (
        <text
          x={pulse.source.x}
          y={pulse.source.y - radius * 2.2}
          textAnchor="middle"
          fontSize="8.5"
          fontFamily="system-ui, sans-serif"
          fontWeight="bold"
          fill={palette.dot}
          style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.85)', strokeWidth: 2.5 }}
        >
          {volumeLabel}
        </text>
      ) : null}
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
    <g opacity={0.95}>
      <path d={pathD} fill="none" stroke={palette.glow} strokeWidth={2.8} opacity={0.18}>
        <animate attributeName="opacity" values="0.12;0.24;0.12" dur="3.4s" repeatCount="indefinite" />
      </path>
      <path d={pathD} fill="none" stroke={palette.ring} strokeWidth={1.7} strokeDasharray="4 6">
        <animate attributeName="stroke-dashoffset" values="0;-30" dur="2.4s" repeatCount="indefinite" />
      </path>
      <circle r={3.4} fill={palette.dot}>
        <animateMotion dur="2.8s" repeatCount="indefinite" path={pathD} />
      </circle>
      <circle r={2.2} fill={palette.dot} opacity={0.72}>
        <animateMotion dur="3.25s" begin="0.55s" repeatCount="indefinite" path={pathD} />
      </circle>
    </g>
  );
}

export function CyberRadarCanvas({ pulses, narrator, className, showOrnaments = true }: Props) {
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

  // Determine which external sources are actively threatening (a threat pulse
  // is close to the ring node that represents that source).
  const threatenedSourceIds = useMemo(() => {
    const active = pulses.filter(
      (p) => p.kind === 'threat_attack' || p.kind === 'threat_probe',
    );
    if (active.length === 0) return new Set<string>();
    const threatened = new Set<string>();
    for (const pulse of active) {
      for (const src of externalLabels) {
        const dx = pulse.source.x - src.x;
        const dy = pulse.source.y - src.y;
        if (dx * dx + dy * dy <= RING_PROXIMITY_SQ) {
          threatened.add(src.id);
        }
      }
    }
    return threatened;
  }, [pulses, externalLabels]);

  const hasActiveAttack = pulses.some((p) => p.kind === 'threat_attack');

  return (
    <div className={`relative h-full w-full overflow-hidden bg-black ${className ?? ''}`}>
      <div
        className="relative mx-auto h-full"
        style={{ aspectRatio: `${KSA_VIEWBOX.width} / ${KSA_VIEWBOX.height}`, maxWidth: '100%' }}
      >
        {/* Layer 1 — KSA tactical backdrop */}
        <div className="absolute inset-0">
          <TacticalKingdomBackdrop
            showTacticalSweep={!showOrnaments}
            showCompassRose={!showOrnaments}
          />
        </div>

        {/* Overlay SVG — ring labels + vectors + pulses share the same viewBox */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          {showOrnaments ? (
            <PulseMapKingdomSweep
              cx={RIYADH_VIEW.x}
              cy={RIYADH_VIEW.y}
              variant="cyber"
              clipPaths={[KSA_OUTLINE_PATH]}
            />
          ) : null}

          {/* Layer 2 — external source ring */}
          <g>
            {externalLabels.map((s) => {
              const threatened = threatenedSourceIds.has(s.id);
              const nodeColor = threatened
                ? 'rgba(248,113,113,0.90)'
                : 'rgba(148,163,184,0.55)';
              const glowColor = threatened
                ? 'rgba(248,113,113,0.25)'
                : 'rgba(148,163,184,0.18)';
              const textColor = threatened
                ? 'rgba(252,165,165,0.95)'
                : 'rgba(148,163,184,0.65)';
              return (
                <g key={s.id}>
                  {/* Threat pulse ring on active attacker */}
                  {threatened && (
                    <circle cx={s.x} cy={s.y} r={12} fill="rgba(248,113,113,0.12)">
                      <animate
                        attributeName="r"
                        values="6;18;6"
                        dur="1.6s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.8;0.1;0.8"
                        dur="1.6s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  <circle cx={s.x} cy={s.y} r={5} fill={glowColor} />
                  <circle cx={s.x} cy={s.y} r={2} fill={nodeColor} />
                  <text
                    x={s.x}
                    y={s.y - 10}
                    textAnchor="middle"
                    fontSize="11"
                    fontFamily="system-ui"
                    fill={textColor}
                    fontWeight={threatened ? 'bold' : 'normal'}
                    style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.7)', strokeWidth: 2 }}
                  >
                    {s.labelAr}
                    {threatened ? ' ⚠' : ''}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Active attack warning ring around KSA center */}
          {hasActiveAttack && (
            <g opacity={0.35}>
              <circle
                cx={KSA_VIEWBOX.width / 2}
                cy={KSA_VIEWBOX.height / 2}
                r={60}
                fill="none"
                stroke="rgba(248,113,113,0.6)"
                strokeWidth={1}
                strokeDasharray="4 8"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;-36"
                  dur="1.8s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          )}

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

        {showOrnaments ? (
          <PulseMapCompassOrnament
            variant="cyber"
            className="absolute right-2 top-2 z-20 sm:right-3 sm:top-3"
          />
        ) : null}

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
