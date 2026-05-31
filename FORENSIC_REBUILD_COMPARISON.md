# Forensic Rebuild Comparison Report

## Scope
- Rebuild branch: `forensic/rebuild-from-1e96f7d`
- Baseline commit: `1e96f7d`
- Comparison target: `main` at `014cb6e`
- Rebuild commits:
  - `44c6192` (Phase A core stability)
  - `65f6aa2` (Phase B routing/layout/PWA)
  - `22baaac` (Phase C high-risk feature reattach)

## Verification Evidence
- Baseline build initially failed due to missing `src/pages/HospitalityB2BRequestLanding.tsx`.
- After Phase A, Phase B, and Phase C dependency closure, `npm run build` completed successfully.
- DOM stabilization stack now includes:
  - guarded `removeChild` fallback in `src/main.tsx`
  - route-aware recovery in `src/components/RootErrorBoundary.tsx`
  - hash-aware boundary remount in `src/components/RouteScopedErrorBoundary.tsx`

## Direct Diff: `main..forensic/rebuild-from-1e96f7d`
Remaining differences are concentrated in 21 files:

- Deleted documentation files on rebuild branch:
  - `EXECUTION_RUNBOOK.md`
  - `FORENSIC_REPORT_CONTINUATION.md`
  - `FORENSIC_REPORT_ROOT_CAUSE_ANALYSIS.md`
  - `PATCH_1_EVIDENCE.md`
- Behavioral/logic drift files:
  - `src/components/AdminAuthHashGate.tsx`
  - `src/components/GeoRadarButton.tsx`
  - `src/components/LocationButton.tsx`
  - `src/lib/partnerProspectExcelParse.ts`
  - `src/pages/RateBarber.tsx`
  - `src/pages/RegisterSuccess.tsx`
  - `src/pages/ShopOpenStatus.tsx`
  - `src/modules/ops-controller/registry.ts`
  - `src/modules/ai-staff/components/DigitalShiftOversightPanel.tsx`
  - `src/modules/ai-staff/components/SuperIntelligenceFeedPanel.tsx`
  - plus minor drift in additional support files listed by `git diff --name-status main..HEAD`.

## Root-Cause Findings
1. Rebuild from `1e96f7d` exposed hidden dependency chains (hospitality page, geolocation diagnostics, strict geolocation utilities).
2. White-screen class failures were tied to runtime detach races, not only service-worker behavior.
3. Core platform stability is currently achieved by combining:
   - guarded DOM mismatch handling,
   - path+hash scoped error boundary resets,
   - conservative PWA activation policy (`registerType: prompt`, `skipWaiting: false`, `clientsClaim: false`).
4. Remaining drift vs `main` is largely from late-cycle hotfixes and docs that were not part of the phased reattach set.

## Backport / Alignment Strategy
To align branch output with `main` safely:

1. Keep Phase A/B/C commits as the reconstruction backbone.
2. Reconcile remaining drift by importing `main` versions for unresolved critical runtime files:
   - `src/components/AdminAuthHashGate.tsx`
   - `src/components/GeoRadarButton.tsx`
   - `src/components/LocationButton.tsx`
   - `src/lib/partnerProspectExcelParse.ts`
   - `src/pages/RateBarber.tsx`
   - `src/pages/RegisterSuccess.tsx`
   - `src/pages/ShopOpenStatus.tsx`
3. Restore forensic docs if required for audit parity:
   - `EXECUTION_RUNBOOK.md`
   - `FORENSIC_REPORT_CONTINUATION.md`
   - `FORENSIC_REPORT_ROOT_CAUSE_ANALYSIS.md`
   - `PATCH_1_EVIDENCE.md`
4. Re-run acceptance suite:
   - `npm run build`
   - manual rapid navigation stress (admin + landing + partner pages)
   - geolocation workflow validation (desktop and mobile)

## Conclusion
The forensic rebuild branch is now build-stable and reproduces the intended stabilization architecture. The remaining differences against `main` are explicit and bounded, making final parity/backport decisions auditable and low-risk.
