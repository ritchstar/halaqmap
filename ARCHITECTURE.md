# HalaqMap — Architecture Export & Audit

> **Founder Export & Audit** — snapshot of platform source at commit `b0e9e73`.
> feat(admin): activate Super-Intelligence Feed protocol system-wide

---

## 1. Audit Summary

| Domain | Status | Latest capability |
|--------|--------|-------------------|
| **Autonomous Engineering Wing** | ✅ Active | Council bus, draft branch, Founder approval gate |
| **Super-Intelligence Feed** | ✅ Active | Prosecutor gate, crisis simulation, peer review, performance delta |
| **Public Prosecutor** | ✅ Active | Radar sync, compliance audit, crisis interject, working papers |
| **Professional Commitment** | ✅ Enforced | `professionalCommitmentAccepted` + timestamp on registration |
| **Engineering Handshake** | ✅ Active | Supabase/Vercel/GitHub ping → Ops Controller gate |

### Key migrations (must run on Supabase)
- `85_platform_engineering_council.sql` — council messages + engineering executions
- `86_platform_engineering_handshake.sql` — founder handshake + ops_controller_enabled

### Architecture flow (Engineering + Super-Intelligence)

```
Founder / Admin
    │
    ├─ SuperIntelligenceFeedPanel ──GET──► /api/admin-super-intelligence-feed
    ├─ FounderSystemStatusPanel ──POST──► /api/admin-engineering-handshake
    ├─ EngineeringCouncilPanel ──POST──► /api/admin-engineering-council
    │       │
    │       └─ runSelfDevelopmentProtocol()
    │              ├─ generatePlanMarkdown()
    │              └─ runSuperIntelligencePipeline()
    │                     ├─ consultCrisisAdvisorForPlan() [if bottleneck]
    │                     ├─ runProsecutorGate() [blocking]
    │                     ├─ runDoubleBlindPeerReview()
    │                     └─ computePerformanceDelta()
    │
    └─ PublicProsecutorDashboard ──► audit/repair registration compliance
```

---

## 2. Repository Scale

| Path | Files |
|------|-------|
| `src/` | 338 |
| `api/` | 124 |
| `supabase/` | 109 |

Full tree: [`docs/export/FILE-TREE.md`](docs/export/FILE-TREE.md)

---

## 3. Logical Groups (Full Source Concatenation)

Each group contains **complete file contents** — no deletions, ready for copy/review.

- **[Core Config & Auth](docs/export/GROUP-01-CORE-CONFIG.md)** — `GROUP-01-CORE-CONFIG` · 6 files
- **[AI Staff Registry & Types](docs/export/GROUP-02-AI-STAFF-REGISTRY.md)** — `GROUP-02-AI-STAFF-REGISTRY` · 3 files
- **[Engineering Wing + Super-Intelligence (Backend)](docs/export/GROUP-03-ENGINEERING-SUPER-INTELLIGENCE.md)** — `GROUP-03-ENGINEERING-SUPER-INTELLIGENCE` · 11 files
- **[Public Prosecutor & Crisis Advisor](docs/export/GROUP-04-PUBLIC-PROSECUTOR.md)** — `GROUP-04-PUBLIC-PROSECUTOR` · 6 files
- **[Professional Commitment & Registration Compliance](docs/export/GROUP-05-COMPLIANCE-REGISTRATION.md)** — `GROUP-05-COMPLIANCE-REGISTRATION` · 5 files
- **[Ops Controller, Radar & Intelligence](docs/export/GROUP-06-OPS-RADAR.md)** — `GROUP-06-OPS-RADAR` · 9 files
- **[AI Staff & Founder UI Panels](docs/export/GROUP-07-AI-STAFF-UI.md)** — `GROUP-07-AI-STAFF-UI` · 11 files
- **[Supabase Migrations — Engineering & Handshake](docs/export/GROUP-08-SUPABASE-MIGRATIONS-ENGINEERING.md)** — `GROUP-08-SUPABASE-MIGRATIONS-ENGINEERING` · 4 files

---

## 4. Compliance Checklist (Professional Commitment)

- [x] `validateRegistrationCompliancePayload()` rejects missing `professionalCommitmentAccepted`
- [x] `auditRegistrationPayload()` flags gaps for Prosecutor dashboard
- [x] `repairRegistrationSubmissionsCompliance()` backfills legacy submissions
- [x] `ComplianceCheckbox` UI with modal pledges (B2B registration flow)

---

## 5. Super-Intelligence Protocol Steps

1. Knowledge Injection (ZATCA · Vercel/Supabase · DevOps playbook)
2. Prosecutor Pre-Commit (blocking gate)
3. Crisis Failure Simulation (on performance bottleneck or crisis watch)
4. Double-Blind Peer Review (Prosecutor ↔ Technical Consultant)
5. Performance Delta (Radar intelligence + Registration Compliance baseline)
6. Ready → `pending_approval` | Blocked → `gate_blocked`

---

## 6. API Surface (Governance & Engineering)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin-engineering-council` | GET/POST | Council bus, propose task, approve/reject |
| `/api/admin-engineering-handshake` | GET/POST | Service ping, Ops Controller activation |
| `/api/admin-super-intelligence-feed` | GET | Unified Hive Mind feed |
| `/api/admin-technical-consultant-lab-chat` | GET/POST | TC chat + inline gate + performance delta |
| `/api/admin-public-prosecutor-lab-chat` | GET/POST | Prosecutor governance chat |
| `/api/admin-public-prosecutor-dashboard` | GET/POST | Radar sync, compliance audit/repair |
| `/api/admin-system-crisis-advisor-lab-chat` | GET/POST | Crisis P0 playbook chat |

---

## 7. How to Regenerate This Export

```bash
node scripts/generate-architecture-export.mjs
```

Outputs:
- `ARCHITECTURE.md` (this file)
- `docs/export/FILE-TREE.md`
- `docs/export/GROUP-*.md` (8 logical groups)
