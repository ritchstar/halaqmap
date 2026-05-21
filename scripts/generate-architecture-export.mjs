import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'docs', 'export');

const GROUPS = {
  'GROUP-01-CORE-CONFIG': {
    title: 'Core Config & Auth',
    files: [
      'src/config/adminAuth.ts',
      'src/config/engineeringCouncil.ts',
      'src/config/superIntelligenceFeed.ts',
      'src/config/publicProsecutorGovernance.ts',
      'src/config/corporateProductCompliance.ts',
      'src/lib/adminPermissions.ts',
    ],
  },
  'GROUP-02-AI-STAFF-REGISTRY': {
    title: 'AI Staff Registry & Types',
    files: [
      'src/modules/ai-staff/registry.ts',
      'src/modules/ai-staff/types.ts',
      'src/modules/ai-staff/index.ts',
    ],
  },
  'GROUP-03-ENGINEERING-SUPER-INTELLIGENCE': {
    title: 'Engineering Wing + Super-Intelligence (Backend)',
    files: [
      'api/_lib/agentCouncilMessaging.ts',
      'api/_lib/engineeringCouncilProtocol.ts',
      'api/_lib/superIntelligenceProtocol.ts',
      'api/_lib/performanceDelta.ts',
      'api/_lib/engineeringWingHandshake.ts',
      'api/_lib/cursorExecutionBridge.ts',
      'api/_lib/technicalConsultantLab.ts',
      'api/admin-engineering-council.ts',
      'api/admin-engineering-handshake.ts',
      'api/admin-super-intelligence-feed.ts',
      'api/admin-technical-consultant-lab-chat.ts',
    ],
  },
  'GROUP-04-PUBLIC-PROSECUTOR': {
    title: 'Public Prosecutor & Crisis Advisor',
    files: [
      'api/_lib/publicProsecutorLab.ts',
      'api/_lib/systemCrisisAdvisorLab.ts',
      'api/admin-public-prosecutor-lab-chat.ts',
      'api/admin-public-prosecutor-dashboard.ts',
      'src/lib/publicProsecutorLabRemote.ts',
      'src/lib/publicProsecutorDashboardRemote.ts',
    ],
  },
  'GROUP-05-COMPLIANCE-REGISTRATION': {
    title: 'Professional Commitment & Registration Compliance',
    files: [
      'api/_lib/registrationCompliance.ts',
      'api/register-submission.ts',
      'src/components/b2b/ComplianceCheckbox.tsx',
      'src/components/b2b/ComplianceManifestoContent.tsx',
      'src/components/admin/CorporateProductComplianceCard.tsx',
    ],
  },
  'GROUP-06-OPS-RADAR': {
    title: 'Ops Controller, Radar & Intelligence',
    files: [
      'api/ops-controller.ts',
      'api/ops-intelligence-report.ts',
      'api/_lib/opsIntelligenceReport.ts',
      'api/_lib/platformRadarBroadcastServer.ts',
      'api/admin-radar-pulses.ts',
      'src/lib/opsControllerRemote.ts',
      'src/lib/engineeringCouncilRemote.ts',
      'src/lib/engineeringHandshakeRemote.ts',
      'src/lib/superIntelligenceFeedRemote.ts',
    ],
  },
  'GROUP-07-AI-STAFF-UI': {
    title: 'AI Staff & Founder UI Panels',
    files: [
      'src/modules/ai-staff/components/AiStaffControlRoom.tsx',
      'src/modules/ai-staff/components/AiStaffAgentWorkspace.tsx',
      'src/modules/ai-staff/components/EngineeringCouncilPanel.tsx',
      'src/modules/ai-staff/components/EngineeringPendingApprovalsPanel.tsx',
      'src/modules/ai-staff/components/SuperIntelligenceFeedPanel.tsx',
      'src/modules/ai-staff/components/FounderSystemStatusPanel.tsx',
      'src/modules/ai-staff/components/PublicProsecutorDashboard.tsx',
      'src/components/admin/TechnicalConsultantLabChat.tsx',
      'src/components/admin/PublicProsecutorLabChat.tsx',
      'src/components/admin/SystemCrisisAdvisorLabChat.tsx',
      'src/components/admin/PublicProsecutorInterjectBanner.tsx',
    ],
  },
  'GROUP-08-SUPABASE-MIGRATIONS-ENGINEERING': {
    title: 'Supabase Migrations — Engineering & Handshake',
    files: [
      'supabase/migrations/85_platform_engineering_council.sql',
      'supabase/migrations/86_platform_engineering_handshake.sql',
      'supabase/migrations/84_platform_radar_broadcast_resilience.sql',
      'supabase/migrations/81_platform_ops_controller_reports.sql',
    ],
  },
};

function walk(dir, base = dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'dist' || name === '.git') continue;
      out.push(...walk(p, base));
    } else {
      out.push(relative(base, p).replace(/\\/g, '/'));
    }
  }
  return out.sort();
}

function fence(path, content) {
  const ext = path.split('.').pop() || '';
  const lang =
    ext === 'tsx' ? 'tsx' : ext === 'ts' ? 'typescript' : ext === 'sql' ? 'sql' : ext === 'json' ? 'json' : '';
  return [`### \`${path}\``, '', '```' + lang, content.replace(/\r\n/g, '\n'), '```', ''].join('\n');
}

function readSafe(path) {
  const full = join(ROOT, path);
  if (!existsSync(full)) return `// MISSING: ${path}\n`;
  return readFileSync(full, 'utf8');
}

let commit = 'unknown';
let commitMsg = '';
try {
  commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  commitMsg = execSync('git log -1 --format=%s', { encoding: 'utf8' }).trim();
} catch {
  // ignore
}

mkdirSync(OUT_DIR, { recursive: true });

const trees = {
  src: walk(join(ROOT, 'src'), join(ROOT, 'src')).map((p) => `src/${p}`),
  api: walk(join(ROOT, 'api'), join(ROOT, 'api')).map((p) => `api/${p}`),
  supabase: walk(join(ROOT, 'supabase'), join(ROOT, 'supabase')).map((p) => `supabase/${p}`),
};

const treeMd = [
  '# File Tree — Export Snapshot',
  '',
  `Generated: ${new Date().toISOString()}`,
  `Commit: \`${commit}\` — ${commitMsg}`,
  '',
  '## src/ (' + trees.src.length + ' files)',
  '```',
  trees.src.join('\n'),
  '```',
  '',
  '## api/ (' + trees.api.length + ' files)',
  '```',
  trees.api.join('\n'),
  '```',
  '',
  '## supabase/ (' + trees.supabase.length + ' files)',
  '```',
  trees.supabase.join('\n'),
  '```',
  '',
].join('\n');

writeFileSync(join(OUT_DIR, 'FILE-TREE.md'), treeMd, 'utf8');

const groupIndex = [];

for (const [id, group] of Object.entries(GROUPS)) {
  const parts = [
    `# ${group.title}`,
    '',
    `> Export group \`${id}\` · Commit \`${commit}\``,
    '',
  ];
  for (const file of group.files) {
    parts.push(fence(file, readSafe(file)));
  }
  const outPath = join(OUT_DIR, `${id}.md`);
  writeFileSync(outPath, parts.join('\n'), 'utf8');
  groupIndex.push({ id, title: group.title, path: `docs/export/${id}.md`, files: group.files.length });
}

const architecture = [
  '# HalaqMap — Architecture Export & Audit',
  '',
  '> **Founder Export & Audit** — snapshot of platform source at commit `' + commit + '`.',
  '> ' + commitMsg,
  '',
  '---',
  '',
  '## 1. Audit Summary',
  '',
  '| Domain | Status | Latest capability |',
  '|--------|--------|-------------------|',
  '| **Autonomous Engineering Wing** | ✅ Active | Council bus, draft branch, Founder approval gate |',
  '| **Super-Intelligence Feed** | ✅ Active | Prosecutor gate, crisis simulation, peer review, performance delta |',
  '| **Public Prosecutor** | ✅ Active | Radar sync, compliance audit, crisis interject, working papers |',
  '| **Professional Commitment** | ✅ Enforced | `professionalCommitmentAccepted` + timestamp on registration |',
  '| **Engineering Handshake** | ✅ Active | Supabase/Vercel/GitHub ping → Ops Controller gate |',
  '',
  '### Key migrations (must run on Supabase)',
  '- `85_platform_engineering_council.sql` — council messages + engineering executions',
  '- `86_platform_engineering_handshake.sql` — founder handshake + ops_controller_enabled',
  '',
  '### Architecture flow (Engineering + Super-Intelligence)',
  '',
  '```',
  'Founder / Admin',
  '    │',
  '    ├─ SuperIntelligenceFeedPanel ──GET──► /api/admin-super-intelligence-feed',
  '    ├─ FounderSystemStatusPanel ──POST──► /api/admin-engineering-handshake',
  '    ├─ EngineeringCouncilPanel ──POST──► /api/admin-engineering-council',
  '    │       │',
  '    │       └─ runSelfDevelopmentProtocol()',
  '    │              ├─ generatePlanMarkdown()',
  '    │              └─ runSuperIntelligencePipeline()',
  '    │                     ├─ consultCrisisAdvisorForPlan() [if bottleneck]',
  '    │                     ├─ runProsecutorGate() [blocking]',
  '    │                     ├─ runDoubleBlindPeerReview()',
  '    │                     └─ computePerformanceDelta()',
  '    │',
  '    └─ PublicProsecutorDashboard ──► audit/repair registration compliance',
  '```',
  '',
  '---',
  '',
  '## 2. Repository Scale',
  '',
  '| Path | Files |',
  '|------|-------|',
  '| `src/` | ' + trees.src.length + ' |',
  '| `api/` | ' + trees.api.length + ' |',
  '| `supabase/` | ' + trees.supabase.length + ' |',
  '',
  'Full tree: [`docs/export/FILE-TREE.md`](docs/export/FILE-TREE.md)',
  '',
  '---',
  '',
  '## 3. Logical Groups (Full Source Concatenation)',
  '',
  'Each group contains **complete file contents** — no deletions, ready for copy/review.',
  '',
  ...groupIndex.map(
    (g) =>
      `- **[${g.title}](${g.path})** — \`${g.id}\` · ${g.files} files`,
  ),
  '',
  '---',
  '',
  '## 4. Compliance Checklist (Professional Commitment)',
  '',
  '- [x] `validateRegistrationCompliancePayload()` rejects missing `professionalCommitmentAccepted`',
  '- [x] `auditRegistrationPayload()` flags gaps for Prosecutor dashboard',
  '- [x] `repairRegistrationSubmissionsCompliance()` backfills legacy submissions',
  '- [x] `ComplianceCheckbox` UI with modal pledges (B2B registration flow)',
  '',
  '---',
  '',
  '## 5. Super-Intelligence Protocol Steps',
  '',
  '1. Knowledge Injection (ZATCA · Vercel/Supabase · DevOps playbook)',
  '2. Prosecutor Pre-Commit (blocking gate)',
  '3. Crisis Failure Simulation (on performance bottleneck or crisis watch)',
  '4. Double-Blind Peer Review (Prosecutor ↔ Technical Consultant)',
  '5. Performance Delta (Radar intelligence + Registration Compliance baseline)',
  '6. Ready → `pending_approval` | Blocked → `gate_blocked`',
  '',
  '---',
  '',
  '## 6. API Surface (Governance & Engineering)',
  '',
  '| Route | Method | Purpose |',
  '|-------|--------|---------|',
  '| `/api/admin-engineering-council` | GET/POST | Council bus, propose task, approve/reject |',
  '| `/api/admin-engineering-handshake` | GET/POST | Service ping, Ops Controller activation |',
  '| `/api/admin-super-intelligence-feed` | GET | Unified Hive Mind feed |',
  '| `/api/admin-technical-consultant-lab-chat` | GET/POST | TC chat + inline gate + performance delta |',
  '| `/api/admin-public-prosecutor-lab-chat` | GET/POST | Prosecutor governance chat |',
  '| `/api/admin-public-prosecutor-dashboard` | GET/POST | Radar sync, compliance audit/repair |',
  '| `/api/admin-system-crisis-advisor-lab-chat` | GET/POST | Crisis P0 playbook chat |',
  '',
  '---',
  '',
  '## 7. How to Regenerate This Export',
  '',
  '```bash',
  'node scripts/generate-architecture-export.mjs',
  '```',
  '',
  'Outputs:',
  '- `ARCHITECTURE.md` (this file)',
  '- `docs/export/FILE-TREE.md`',
  '- `docs/export/GROUP-*.md` (8 logical groups)',
  '',
].join('\n');

writeFileSync(join(ROOT, 'ARCHITECTURE.md'), architecture, 'utf8');
console.log('Generated ARCHITECTURE.md + docs/export/ (' + groupIndex.length + ' groups, ' + trees.src.length + '+' + trees.api.length + '+' + trees.supabase.length + ' files in tree)');
