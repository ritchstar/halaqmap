import { useMemo } from 'react';
import {
  CITY_BEACONS,
  KSA_GRATICULE,
  KSA_OUTLINE_PATH,
  KSA_TACTICAL_BOUNDS,
  KSA_VIEWBOX,
  NEIGHBOUR_SEGMENTS,
  RIYADH_VIEW,
  SAUDI_REGIONS,
  SEA_LABELS,
  projectLngLatToView,
} from '@/modules/platform-radar/lib/saudiKingdomGeo';

/**
 * Tactical KSA Vector Backdrop
 *
 * Layered radar canvas — pure SVG so every coordinate aligns with the pulse
 * markers (they all share the same viewBox). Layers from back → front:
 *   1. Deep space gradient + radial vignette
 *   2. Parallel/meridian graticule (2° steps) with axis ticks
 *   3. Neighbour-country hint segments (faint borders)
 *   4. Saudi Arabia silhouette (filled, neon edge, drop shadow)
 *   5. Region capitals labelled in Arabic
 *   6. City beacons with golden night-glow
 *   7. Sea / body-of-water labels (rotated for legibility)
 *   8. Riyadh heartbeat — three pulsing concentric rings on the capital
 *   9. Rotating tactical scan sweep (12 s revolution)
 *  10. Compass rose (bottom-left)
 *  11. Corner brackets / HUD framing
 */
export function TacticalKingdomBackdrop({
  showCapitalHeartbeat = true,
}: {
  showCapitalHeartbeat?: boolean;
}) {
  const { width: VBW, height: VBH } = KSA_VIEWBOX;

  // Tactical sweep — a translucent fan emitted from Riyadh.
  const sweepRadius = Math.max(VBW, VBH) * 0.85;
  const sweep = useMemo(() => {
    const cx = RIYADH_VIEW.x;
    const cy = RIYADH_VIEW.y;
    // 28° fan — start angle 0, sweep clockwise.
    const startAngle = 0;
    const endAngle = 28;
    const a0 = (startAngle * Math.PI) / 180;
    const a1 = (endAngle * Math.PI) / 180;
    const p0 = { x: cx + sweepRadius * Math.cos(a0), y: cy + sweepRadius * Math.sin(a0) };
    const p1 = { x: cx + sweepRadius * Math.cos(a1), y: cy + sweepRadius * Math.sin(a1) };
    return `M${cx} ${cy} L${p0.x} ${p0.y} A${sweepRadius} ${sweepRadius} 0 0 1 ${p1.x} ${p1.y} Z`;
  }, [sweepRadius]);

  const compassCx = VBW * 0.062;
  const compassCy = VBH * 0.9;
  const compassR = Math.min(VBW, VBH) * 0.05;

  return (
    <svg
      aria-hidden
      className="tactical-kingdom-backdrop absolute inset-0 h-full w-full"
      viewBox={`0 0 ${VBW} ${VBH}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Deep tactical space — radial dark blue → black */}
        <radialGradient id="tk-space-gradient" cx="50%" cy="42%" r="78%">
          <stop offset="0%" stopColor="#0a1428" />
          <stop offset="55%" stopColor="#040814" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>

        {/* KSA fill — desert plate with subtle cool highlight */}
        <linearGradient id="tk-ksa-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(56,189,248,0.10)" />
          <stop offset="55%" stopColor="rgba(15,30,55,0.92)" />
          <stop offset="100%" stopColor="rgba(8,15,30,0.97)" />
        </linearGradient>

        {/* Neon cyan edge filter for the KSA silhouette */}
        <filter id="tk-neon-edge" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2.4" result="blur1" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gold sweep gradient — wedge fading to nothing */}
        <radialGradient id="tk-sweep-gradient" cx="0%" cy="0%" r="100%">
          <stop offset="0%" stopColor="rgba(251,191,36,0.40)" />
          <stop offset="55%" stopColor="rgba(251,191,36,0.12)" />
          <stop offset="100%" stopColor="rgba(251,191,36,0)" />
        </radialGradient>

        {/* City glow (radial soft amber) */}
        <radialGradient id="tk-city-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(254,243,199,0.95)" />
          <stop offset="40%" stopColor="rgba(251,191,36,0.55)" />
          <stop offset="100%" stopColor="rgba(251,191,36,0)" />
        </radialGradient>

        {/* Capital glow (cyan + amber double layer) */}
        <radialGradient id="tk-capital-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(186,230,253,0.95)" />
          <stop offset="35%" stopColor="rgba(56,189,248,0.55)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0)" />
        </radialGradient>
      </defs>

      {/* Layer 1: Deep space background */}
      <rect x="0" y="0" width={VBW} height={VBH} fill="url(#tk-space-gradient)" />

      {/* Layer 2: Graticule (2° spacing) */}
      <g
        stroke="rgba(56,189,248,0.085)"
        strokeWidth="0.6"
        vectorEffect="non-scaling-stroke"
      >
        {KSA_GRATICULE.meridians.map((m) => (
          <line key={`mer-${m.lng}`} x1={m.x} y1="0" x2={m.x} y2={VBH} />
        ))}
        {KSA_GRATICULE.parallels.map((p) => (
          <line key={`par-${p.lat}`} x1="0" y1={p.y} x2={VBW} y2={p.y} />
        ))}
      </g>

      {/* Axis labels (top + left) — extremely subtle */}
      <g fill="rgba(125,211,252,0.40)" fontSize="10" fontFamily="monospace">
        {KSA_GRATICULE.meridians.map((m) => (
          <text key={`mlbl-${m.lng}`} x={m.x + 2} y="11">
            {m.lng}°E
          </text>
        ))}
        {KSA_GRATICULE.parallels.map((p) => (
          <text key={`plbl-${p.lat}`} x="3" y={p.y - 2}>
            {p.lat}°N
          </text>
        ))}
      </g>

      {/* Layer 3: Neighbour country segments (very faint) */}
      <g
        fill="none"
        stroke="rgba(148,163,184,0.28)"
        strokeWidth="1.4"
        strokeDasharray="3 4"
        vectorEffect="non-scaling-stroke"
      >
        {NEIGHBOUR_SEGMENTS.map((seg) => (
          <path key={seg.id} d={seg.path} />
        ))}
      </g>

      <g fill="rgba(148,163,184,0.55)" fontSize="11" fontFamily="system-ui">
        {NEIGHBOUR_SEGMENTS.map((seg) => (
          <text
            key={`nlbl-${seg.id}`}
            x={seg.labelView.x}
            y={seg.labelView.y}
            textAnchor="middle"
            opacity="0.55"
          >
            {seg.labelAr}
          </text>
        ))}
      </g>

      {/* Layer 4: KSA silhouette */}
      <g filter="url(#tk-neon-edge)">
        <path
          d={KSA_OUTLINE_PATH}
          fill="url(#tk-ksa-fill)"
          stroke="rgba(56,189,248,0.78)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </g>
      {/* Inner highlight stroke (crisper, no blur) */}
      <path
        d={KSA_OUTLINE_PATH}
        fill="none"
        stroke="rgba(186,230,253,0.45)"
        strokeWidth="0.8"
        vectorEffect="non-scaling-stroke"
      />

      {/* Layer 5: Region names (white-ish, low opacity) */}
      <g
        fill="rgba(226,232,240,0.55)"
        fontSize="13"
        fontFamily="system-ui"
        fontWeight={500}
      >
        {SAUDI_REGIONS.map((r) => (
          <text
            key={`reg-${r.id}`}
            x={r.anchor.x}
            y={r.anchor.y - 12}
            textAnchor="middle"
            style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.65)', strokeWidth: 2 }}
          >
            {r.labelAr}
          </text>
        ))}
      </g>

      {/* Layer 6: City beacons */}
      <g>
        {CITY_BEACONS.map((c) => {
          const glowRadius =
            c.tier === 'capital' ? 28 : c.tier === 'major' ? 18 : 12;
          const dotRadius = c.tier === 'capital' ? 4 : c.tier === 'major' ? 2.8 : 2.2;
          const fillUrl = c.tier === 'capital' ? 'url(#tk-capital-glow)' : 'url(#tk-city-glow)';
          const fontSize = c.tier === 'capital' ? 14 : c.tier === 'major' ? 12 : 11;
          // Above: label sits above the glow. Below: drops it under the dot,
          // with a small extra offset so the baseline clears the glow halo.
          const labelY =
            c.labelPosition === 'below'
              ? c.view.y + glowRadius + fontSize + 2
              : c.view.y - (glowRadius + 2);
          return (
            <g key={`city-${c.nameAr}`}>
              <circle cx={c.view.x} cy={c.view.y} r={glowRadius} fill={fillUrl} />
              <circle
                cx={c.view.x}
                cy={c.view.y}
                r={dotRadius}
                fill={c.tier === 'capital' ? '#bae6fd' : '#fef3c7'}
              />
              <text
                x={c.view.x}
                y={labelY}
                textAnchor="middle"
                fontSize={fontSize}
                fontFamily="system-ui"
                fontWeight={c.tier === 'capital' ? 700 : c.tier === 'major' ? 600 : 500}
                fill={
                  c.tier === 'capital'
                    ? 'rgba(186,230,253,0.95)'
                    : c.tier === 'major'
                      ? 'rgba(254,243,199,0.95)'
                      : 'rgba(254,243,199,0.85)'
                }
                style={{
                  paintOrder: 'stroke',
                  stroke: 'rgba(0,0,0,0.78)',
                  strokeWidth: 2.5,
                }}
              >
                {c.nameAr}
              </text>
            </g>
          );
        })}
      </g>

      {/* Layer 7: Sea labels */}
      <g
        fill="rgba(125,211,252,0.55)"
        fontSize="14"
        fontFamily="system-ui"
        fontStyle="italic"
        letterSpacing="2"
      >
        {SEA_LABELS.map((s) => (
          <text
            key={s.id}
            x={s.view.x}
            y={s.view.y}
            textAnchor="middle"
            transform={`rotate(${s.rotation} ${s.view.x} ${s.view.y})`}
            style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.6)', strokeWidth: 1.5 }}
          >
            {s.labelAr}
          </text>
        ))}
      </g>

      {/* Layer 8: Riyadh heartbeat — pulsing concentric rings on the capital */}
      {showCapitalHeartbeat ? (
        <g className="tactical-riyadh-heartbeat" style={{ transformOrigin: `${RIYADH_VIEW.x}px ${RIYADH_VIEW.y}px` }}>
          {[0, 1, 2].map((idx) => (
            <circle
              key={`heart-${idx}`}
              cx={RIYADH_VIEW.x}
              cy={RIYADH_VIEW.y}
              r="6"
              fill="none"
              stroke="rgba(56,189,248,0.55)"
              strokeWidth="1.2"
              className="tactical-heartbeat-ring"
              style={{ animationDelay: `${idx * 1.0}s` }}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      ) : null}

      {/* Layer 9: Rotating tactical scan sweep — anchored at Riyadh */}
      <g
        className="tactical-sweep-rotor"
        style={{ transformOrigin: `${RIYADH_VIEW.x}px ${RIYADH_VIEW.y}px` }}
      >
        <path d={sweep} fill="url(#tk-sweep-gradient)" />
      </g>

      {/* Layer 10: Compass rose (bottom-left) */}
      <g transform={`translate(${compassCx} ${compassCy})`}>
        <circle r={compassR} fill="rgba(0,0,0,0.55)" stroke="rgba(56,189,248,0.35)" strokeWidth="1" />
        <circle r={compassR * 0.72} fill="none" stroke="rgba(56,189,248,0.18)" strokeWidth="0.5" />
        <g stroke="rgba(186,230,253,0.7)" strokeWidth="1.2" strokeLinecap="round">
          <line x1="0" y1={-compassR * 0.95} x2="0" y2={-compassR * 0.55} />
          <line x1="0" y1={compassR * 0.95} x2="0" y2={compassR * 0.55} />
          <line x1={-compassR * 0.95} y1="0" x2={-compassR * 0.55} y2="0" />
          <line x1={compassR * 0.95} y1="0" x2={compassR * 0.55} y2="0" />
        </g>
        <polygon
          points={`0,${-compassR * 1.0} -4,${-compassR * 0.7} 4,${-compassR * 0.7}`}
          fill="rgba(248,113,113,0.8)"
        />
        <text
          x="0"
          y={-compassR * 1.18}
          textAnchor="middle"
          fontSize="11"
          fontFamily="monospace"
          fill="rgba(186,230,253,0.8)"
          fontWeight={700}
        >
          N
        </text>
        <text
          x="0"
          y={compassR * 1.42}
          textAnchor="middle"
          fontSize="10"
          fontFamily="monospace"
          fill="rgba(148,163,184,0.7)"
        >
          S
        </text>
        <text
          x={-compassR * 1.25}
          y="3"
          textAnchor="middle"
          fontSize="10"
          fontFamily="monospace"
          fill="rgba(148,163,184,0.7)"
        >
          W
        </text>
        <text
          x={compassR * 1.25}
          y="3"
          textAnchor="middle"
          fontSize="10"
          fontFamily="monospace"
          fill="rgba(148,163,184,0.7)"
        >
          E
        </text>
      </g>

      {/* Layer 11: Corner brackets — HUD framing */}
      <g
        fill="none"
        stroke="rgba(56,189,248,0.55)"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      >
        {/* top-left */}
        <path d={`M0 28 L0 0 L28 0`} />
        {/* top-right */}
        <path d={`M${VBW - 28} 0 L${VBW} 0 L${VBW} 28`} />
        {/* bottom-left */}
        <path d={`M0 ${VBH - 28} L0 ${VBH} L28 ${VBH}`} />
        {/* bottom-right */}
        <path d={`M${VBW - 28} ${VBH} L${VBW} ${VBH} L${VBW} ${VBH - 28}`} />
      </g>

      {/* Edge vignette overlay for HUD readability */}
      <rect
        x="0"
        y="0"
        width={VBW}
        height={VBH}
        fill="url(#tk-vignette)"
        pointerEvents="none"
      />
      <defs>
        <radialGradient id="tk-vignette" cx="50%" cy="50%" r="78%">
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
        </radialGradient>
      </defs>

      {/* Bounds label (DEV cue — extremely faint) */}
      <text
        x={VBW - 8}
        y={VBH - 8}
        textAnchor="end"
        fontSize="9"
        fontFamily="monospace"
        fill="rgba(125,211,252,0.30)"
      >
        KSA · {KSA_TACTICAL_BOUNDS.minLat}°–{KSA_TACTICAL_BOUNDS.maxLat}°N ·{' '}
        {KSA_TACTICAL_BOUNDS.minLng}°–{KSA_TACTICAL_BOUNDS.maxLng}°E
      </text>

      {/* Reference projection point — used by parent for marker alignment */}
      <circle
        cx={projectLngLatToView(46.6753, 24.7136).x}
        cy={projectLngLatToView(46.6753, 24.7136).y}
        r="0.5"
        fill="rgba(255,255,255,0.01)"
      />
    </svg>
  );
}
