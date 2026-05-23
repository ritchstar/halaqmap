/** Super-Intelligence Feed — Executive Strategic Mode doctrine & knowledge injection */

export const SUPER_INTELLIGENCE_FEED_TITLE_AR = 'Super-Intelligence Feed';
export const SUPER_INTELLIGENCE_FEED_SUBTITLE_AR =
  'Executive Strategic Mode · Hive Mind · Prosecutor Gate · Performance Delta';

export const SUPER_INTELLIGENCE_PROTOCOL_STEPS = [
  'knowledge_injection',
  'consult_prosecutor_pre_commit',
  'crisis_failure_simulation',
  'prosecutor_gate',
  'double_blind_peer_review',
  'performance_delta',
  'ready_or_blocked',
] as const;

export type SuperIntelligenceProtocolStep = (typeof SUPER_INTELLIGENCE_PROTOCOL_STEPS)[number];

export const SUPER_INTELLIGENCE_PROTOCOL_LABELS_AR: Record<SuperIntelligenceProtocolStep, string> = {
  knowledge_injection: 'Knowledge Injection',
  consult_prosecutor_pre_commit: 'Prosecutor Pre-Commit',
  crisis_failure_simulation: 'Crisis Failure Simulation',
  prosecutor_gate: "Prosecutor's Gate",
  double_blind_peer_review: 'Double-Blind Peer Review',
  performance_delta: 'Performance Delta',
  ready_or_blocked: 'Ready / Blocked',
};

/** Official knowledge bases injected into agent system prompts (read-only). */
export const KNOWLEDGE_INJECTION_SOURCES = [
  {
    domain: 'ZATCA / Compliance',
    refs: [
      'ZATCA e-invoicing Phase 2 guidelines (Fatoorah)',
      'src/config/partnerLegal.ts · registration compliance audit',
    ],
  },
  {
    domain: 'Vercel / Supabase Architecture',
    refs: [
      'Vercel serverless: isolate secrets server-side; no VITE_ for service_role',
      'Supabase RLS deny-by-default; service_role only in api/*',
      'PUBLIC_API_ALLOWED_ORIGINS in production CORS',
    ],
  },
  {
    domain: 'DevOps / Uptime',
    refs: [
      'docs/crisis-playbook.md — P0: Uptime → Data Integrity → RLS',
      'Platform Radar inspector pulses → preventive OPS reports',
      'Engineering Wing Handshake — ops_controller_enabled gate',
    ],
  },
] as const;

export const PERFORMANCE_BOTTLENECK_TRIGGERS = [
  'performance',
  'bottleneck',
  'latency',
  'slow',
  'uptime',
  'bundle',
  'cache',
  'scale',
  'throughput',
  'timeout',
  'degradation',
  'أداء',
  'بطء',
  'زمن',
] as const;

export const SUPER_INTELLIGENCE_DOCTRINE: string[] = [
  'Executive Strategic Mode — abandon basic heuristics; advanced reasoning only.',
  'Technical Consultant MUST consult Public Prosecutor before any code commit.',
  'Performance bottlenecks MUST trigger Crisis Advisor failure simulation.',
  "Prosecutor's Gate — no Ready without double-blind TC ↔ Prosecutor peer review.",
  'Every closure outputs Performance Delta: Radar intelligence + Registration Compliance.',
  'Demonstrate: A) Maximum Uptime Impact B) Zero-Trust Security C) Long-term Maintainability.',
];

export function detectPerformanceBottleneck(text: string): boolean {
  const lower = text.toLowerCase();
  return PERFORMANCE_BOTTLENECK_TRIGGERS.some((t) => lower.includes(t.toLowerCase()));
}

export function buildKnowledgeInjectionBlock(): string {
  return KNOWLEDGE_INJECTION_SOURCES.map(
    (s) => `### ${s.domain}\n${s.refs.map((r) => `- ${r}`).join('\n')}`,
  ).join('\n\n');
}
