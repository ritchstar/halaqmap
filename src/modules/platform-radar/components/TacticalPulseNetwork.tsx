import { useMemo } from 'react';
import { projectKsaToPercent } from '@/modules/platform-radar/lib/saudiKingdomProjection';

type Node = { id: string; left: number; top: number };

type Props = {
  nodes: Node[];
  maxDistance?: number;
  maxLinksPerNode?: number;
};

function dist(a: Node, b: Node): number {
  const dx = a.left - b.left;
  const dy = a.top - b.top;
  return Math.hypot(dx, dy);
}

export function TacticalPulseNetwork({ nodes, maxDistance = 14, maxLinksPerNode = 2 }: Props) {
  const segments = useMemo(() => {
    const links: Array<{ key: string; x1: number; y1: number; x2: number; y2: number }> = [];
    const used = new Map<string, number>();

    for (const node of nodes) {
      const neighbors = nodes
        .filter((n) => n.id !== node.id)
        .map((n) => ({ n, d: dist(node, n) }))
        .filter(({ d }) => d <= maxDistance)
        .sort((a, b) => a.d - b.d)
        .slice(0, maxLinksPerNode);

      for (const { n } of neighbors) {
        const pairKey = [node.id, n.id].sort().join(':');
        if ((used.get(pairKey) ?? 0) >= 1) continue;
        used.set(pairKey, 1);
        links.push({
          key: pairKey,
          x1: node.left,
          y1: node.top,
          x2: n.left,
          y2: n.top,
        });
      }
    }

    return links;
  }, [nodes, maxDistance, maxLinksPerNode]);

  if (segments.length === 0) return null;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[15] h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="tactical-pulse-link" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(251,191,36,0)" />
          <stop offset="50%" stopColor="rgba(251,191,36,0.45)" />
          <stop offset="100%" stopColor="rgba(251,191,36,0)" />
        </linearGradient>
      </defs>
      {segments.map((s) => (
        <line
          key={s.key}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke="url(#tactical-pulse-link)"
          strokeWidth="0.12"
          vectorEffect="non-scaling-stroke"
          opacity="0.55"
        />
      ))}
    </svg>
  );
}

export function pulseNodesFromPlaced(
  placed: Array<{ id: string; lat: number; lng: number }>,
): Node[] {
  return placed.map((p) => {
    const pos = projectKsaToPercent(p.lat, p.lng);
    return { id: p.id, left: pos.left, top: pos.top };
  });
}
