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

function hashSeed(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function TacticalPulseNetwork({ nodes, maxDistance = 14, maxLinksPerNode = 2 }: Props) {
  const segments = useMemo(() => {
    const links: Array<{ key: string; x1: number; y1: number; x2: number; y2: number; kind: 'local' | 'long' }> = [];
    const used = new Map<string, number>();
    const longMin = maxDistance * 1.45;
    const longMax = Math.max(28, maxDistance * 3.1);

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
          kind: 'local',
        });
      }

      const longCandidates = nodes
        .filter((n) => n.id !== node.id)
        .map((n) => ({ n, d: dist(node, n) }))
        .filter(({ d }) => d >= longMin && d <= longMax)
        .sort((a, b) => {
          const ah = hashSeed(`${node.id}:${a.n.id}`);
          const bh = hashSeed(`${node.id}:${b.n.id}`);
          return ah - bh;
        });

      const longPick = longCandidates[0];
      if (longPick) {
        const pairKey = [node.id, longPick.n.id].sort().join(':');
        if ((used.get(pairKey) ?? 0) < 1) {
          used.set(pairKey, 1);
          links.push({
            key: `long:${pairKey}`,
            x1: node.left,
            y1: node.top,
            x2: longPick.n.left,
            y2: longPick.n.top,
            kind: 'long',
          });
        }
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
        <linearGradient id="tactical-pulse-link-local" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(251,191,36,0)" />
          <stop offset="50%" stopColor="rgba(251,191,36,0.45)" />
          <stop offset="100%" stopColor="rgba(251,191,36,0)" />
        </linearGradient>
        <linearGradient id="tactical-pulse-link-long" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(56,189,248,0)" />
          <stop offset="50%" stopColor="rgba(56,189,248,0.34)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0)" />
        </linearGradient>
      </defs>
      {segments.map((s) => (
        <line
          key={s.key}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke={s.kind === 'long' ? 'url(#tactical-pulse-link-long)' : 'url(#tactical-pulse-link-local)'}
          strokeWidth={s.kind === 'long' ? '0.16' : '0.12'}
          vectorEffect="non-scaling-stroke"
          opacity={s.kind === 'long' ? '0.48' : '0.55'}
          strokeDasharray={s.kind === 'long' ? '0.7 0.5' : undefined}
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
