import {
  AMBASSADOR_PAYOUT_MIN_SAR,
  AMBASSADOR_RULES_VERSION,
  AMBASSADOR_TARGET_EXPIRY_DAYS,
  AMBASSADOR_TARGET_REMINDER_DAYS,
  type AmbassadorDurationMonths,
  type AmbassadorPackageKey,
  AMBASSADOR_COMMISSION_TABLE,
} from '@/config/ambassadorFieldRulesPolicy';

/** v2: استمارة مراجعة + تفعيل مؤقت حتى أول إغلاق صالون */
const STORAGE_KEY = 'halaqmap-ambassador-portal-v2';

export type AmbassadorTargetKind = 'barber' | 'hospitality';

export type AmbassadorTargetStatus =
  | 'open'
  | 'rewarded'
  | 'expired'
  | 'rejected'
  | 'cancelled';

/** دورة حياة حساب السفير — مكافحة التفعيل الفوري العشوائي */
export type AmbassadorAccountStatus =
  | 'pending_review'
  | 'provisional'
  | 'active'
  | 'rejected';

export type AmbassadorApplication = {
  coverageArea: string;
  salesExperience: string;
  socialProofUrl: string;
  socialProofLabel: string;
  submittedAt: string;
};

export type AmbassadorTargetRequest = {
  id: string;
  kind: AmbassadorTargetKind;
  status: AmbassadorTargetStatus;
  shopName: string;
  shopPhone: string;
  city: string;
  district: string;
  notes: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  streetSignLabel: string;
  interiorLabels: string[];
  openedAt: string;
  expiresAt: string;
  rewardSar: number | null;
  rejectReason: string | null;
};

export type AmbassadorLedgerEntry = {
  id: string;
  entryType: 'commission' | 'hospitality' | 'payout' | 'clawback' | 'adjustment';
  amountSar: number;
  balanceAfterSar: number;
  note: string;
  createdAt: string;
  targetRequestId: string | null;
};

export type AmbassadorPayoutRequest = {
  id: string;
  amountSar: number;
  iban: string;
  status: 'pending' | 'processing' | 'paid' | 'rejected' | 'awaiting_receipt_ack';
  transferDocumentLabel: string | null;
  receiptAcknowledgedAt: string | null;
  createdAt: string;
};

export type AmbassadorProfile = {
  id: string;
  code: string;
  displayName: string;
  phone: string;
  iban: string;
  marketingLocked: boolean;
  accountStatus: AmbassadorAccountStatus;
  application: AmbassadorApplication;
  /** أول إغلاق صالون بمطابقة رخصة — يفتح الاعتماد الرسمي والمفروشات */
  firstBarberCloseAt: string | null;
  reviewedAt: string | null;
  rejectReason: string | null;
  rulesVersionAccepted: string;
  rulesAcceptedAt: string;
  createdAt: string;
};

export type AmbassadorPortalState = {
  profile: AmbassadorProfile;
  targets: AmbassadorTargetRequest[];
  ledger: AmbassadorLedgerEntry[];
  payouts: AmbassadorPayoutRequest[];
  balanceSar: number;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function uid(prefix: string): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let hex = '';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return `${prefix}_${hex}`;
}

export function createAmbassadorCode(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `AMB-${n}`;
}

export function lookupCommissionSar(
  packageKey: AmbassadorPackageKey,
  months: AmbassadorDurationMonths,
): number {
  const row = AMBASSADOR_COMMISSION_TABLE.find((r) => r.packageKey === packageKey);
  return row?.commissionByMonths[months] ?? 0;
}

export function isAmbassadorFieldActive(profile: AmbassadorProfile): boolean {
  return profile.accountStatus === 'provisional' || profile.accountStatus === 'active';
}

export function isHospitalityUnlocked(profile: AmbassadorProfile): boolean {
  return profile.accountStatus === 'active' && !!profile.firstBarberCloseAt;
}

export function isWalletPayoutAllowed(profile: AmbassadorProfile): boolean {
  return profile.accountStatus === 'active' && !!profile.firstBarberCloseAt;
}

export function accountStatusLabelAr(status: AmbassadorAccountStatus): string {
  switch (status) {
    case 'pending_review':
      return 'قيد المراجعة';
    case 'provisional':
      return 'تفعيل مؤقت';
    case 'active':
      return 'معتمد رسمياً';
    case 'rejected':
      return 'مرفوض';
    default:
      return status;
  }
}

export function readAmbassadorPortal(): AmbassadorPortalState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AmbassadorPortalState;
    if (!parsed?.profile?.code || !parsed.profile.rulesVersionAccepted) return null;
    if (parsed.profile.rulesVersionAccepted !== AMBASSADOR_RULES_VERSION) return null;
    if (!parsed.profile.accountStatus || !parsed.profile.application?.coverageArea) return null;
    return {
      ...parsed,
      targets: Array.isArray(parsed.targets) ? parsed.targets : [],
      ledger: Array.isArray(parsed.ledger) ? parsed.ledger : [],
      payouts: Array.isArray(parsed.payouts) ? parsed.payouts : [],
      balanceSar: Number(parsed.balanceSar) || 0,
      profile: {
        ...parsed.profile,
        firstBarberCloseAt: parsed.profile.firstBarberCloseAt ?? null,
        reviewedAt: parsed.profile.reviewedAt ?? null,
        rejectReason: parsed.profile.rejectReason ?? null,
      },
    };
  } catch {
    return null;
  }
}

export function writeAmbassadorPortal(state: AmbassadorPortalState): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAmbassadorPortal(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem('halaqmap-ambassador-portal-v1');
}

export type AmbassadorApplicationInput = {
  displayName: string;
  phone: string;
  coverageArea: string;
  salesExperience: string;
  socialProofUrl?: string;
  socialProofLabel?: string;
};

/** تقديم طلب انضمام — الحالة: قيد المراجعة (لا تفعيل فوري) */
export function submitAmbassadorApplication(input: AmbassadorApplicationInput): AmbassadorPortalState {
  const now = new Date().toISOString();
  const state: AmbassadorPortalState = {
    profile: {
      id: uid('amb'),
      code: createAmbassadorCode(),
      displayName: input.displayName.trim(),
      phone: input.phone.trim(),
      iban: '',
      marketingLocked: false,
      accountStatus: 'pending_review',
      application: {
        coverageArea: input.coverageArea.trim(),
        salesExperience: input.salesExperience.trim(),
        socialProofUrl: (input.socialProofUrl ?? '').trim(),
        socialProofLabel: (input.socialProofLabel ?? '').trim(),
        submittedAt: now,
      },
      firstBarberCloseAt: null,
      reviewedAt: null,
      rejectReason: null,
      rulesVersionAccepted: AMBASSADOR_RULES_VERSION,
      rulesAcceptedAt: now,
      createdAt: now,
    },
    targets: [],
    ledger: [],
    payouts: [],
    balanceSar: 0,
  };
  writeAmbassadorPortal(state);
  return state;
}

/**
 * اعتماد الطلب → تفعيل مؤقت (محاكاة مراجعة الإدارة حتى ربط لوحة الأدمن).
 */
export function approveAmbassadorToProvisional(
  state: AmbassadorPortalState,
): { ok: true; state: AmbassadorPortalState } | { ok: false; error: string } {
  if (state.profile.accountStatus !== 'pending_review') {
    return { ok: false, error: 'الطلب ليس قيد المراجعة.' };
  }
  const next: AmbassadorPortalState = {
    ...state,
    profile: {
      ...state.profile,
      accountStatus: 'provisional',
      reviewedAt: new Date().toISOString(),
      rejectReason: null,
    },
  };
  writeAmbassadorPortal(next);
  return { ok: true, state: next };
}

export function rejectAmbassadorApplication(
  state: AmbassadorPortalState,
  reason: string,
): AmbassadorPortalState {
  const next: AmbassadorPortalState = {
    ...state,
    profile: {
      ...state.profile,
      accountStatus: 'rejected',
      reviewedAt: new Date().toISOString(),
      rejectReason: reason.trim() || 'لم تُستوفَ معايير الجدية الميدانية.',
    },
  };
  writeAmbassadorPortal(next);
  return next;
}

export function refreshTargetStatuses(state: AmbassadorPortalState): AmbassadorPortalState {
  const now = Date.now();
  let changed = false;
  const targets = state.targets.map((t) => {
    if (t.status !== 'open') return t;
    if (new Date(t.expiresAt).getTime() <= now) {
      changed = true;
      return { ...t, status: 'expired' as const };
    }
    return t;
  });
  if (!changed) return state;
  const next = { ...state, targets };
  writeAmbassadorPortal(next);
  return next;
}

export function daysSinceOpen(openedAt: string): number {
  return Math.floor((Date.now() - new Date(openedAt).getTime()) / (24 * 60 * 60 * 1000));
}

export function targetWindowLabel(target: AmbassadorTargetRequest): string {
  if (target.status === 'expired') return 'منتهٍ — بلا عمولة';
  if (target.status === 'rewarded') return 'مستحق ومغلق';
  if (target.status === 'rejected') return 'مرفوض';
  if (target.status === 'cancelled') return 'ملغى';
  const days = daysSinceOpen(target.openedAt);
  if (days >= AMBASSADOR_TARGET_REMINDER_DAYS) {
    return `تنبيه متابعة · متبقي حتى اليوم ${AMBASSADOR_TARGET_EXPIRY_DAYS}`;
  }
  return `نشط · يوم ${days} من ${AMBASSADOR_TARGET_EXPIRY_DAYS}`;
}

export function createTargetRequest(
  state: AmbassadorPortalState,
  input: {
    kind: AmbassadorTargetKind;
    shopName: string;
    shopPhone: string;
    city: string;
    district: string;
    notes: string;
    latitude: number;
    longitude: number;
    accuracyMeters: number | null;
    streetSignLabel: string;
    interiorLabels: string[];
  },
): { ok: true; state: AmbassadorPortalState } | { ok: false; error: string } {
  if (state.profile.accountStatus === 'pending_review') {
    return { ok: false, error: 'حسابك قيد المراجعة — لا يمكن فتح استهداف قبل الاعتماد.' };
  }
  if (state.profile.accountStatus === 'rejected') {
    return { ok: false, error: 'طلب الانضمام مرفوض — تواصل مع الإدارة.' };
  }
  if (!isAmbassadorFieldActive(state.profile)) {
    return { ok: false, error: 'الحساب غير مفعّل للعمل الميداني.' };
  }
  if (state.profile.marketingLocked) {
    return { ok: false, error: 'التسويق مقفل حتى تقرّ باستلام آخر تحويل.' };
  }
  if (input.kind === 'hospitality' && !isHospitalityUnlocked(state.profile)) {
    return {
      ok: false,
      error: 'مسار المفروشات يُفتح بعد أول إغلاق صالون ناجح بمطابقة رخصة النفاذ.',
    };
  }
  if (!input.streetSignLabel.trim()) {
    return { ok: false, error: 'صورة لوحة المحل من الشارع إلزامية.' };
  }
  if (input.kind === 'barber' && input.interiorLabels.length < 4) {
    return { ok: false, error: 'يلزم أربع صور داخلية لطلب استهداف الحلاق.' };
  }
  if (input.kind === 'hospitality' && input.interiorLabels.length < 2) {
    return { ok: false, error: 'يلزم صورتان على الأقل لطلب المفروشات.' };
  }
  if (!Number.isFinite(input.latitude) || !Number.isFinite(input.longitude)) {
    return { ok: false, error: 'الإحداثيات إلزامية — حدّد موقعك من الجهاز.' };
  }

  const opened = new Date();
  const expires = new Date(opened);
  expires.setDate(expires.getDate() + AMBASSADOR_TARGET_EXPIRY_DAYS);

  const target: AmbassadorTargetRequest = {
    id: uid('tgt'),
    kind: input.kind,
    status: 'open',
    shopName: input.shopName.trim(),
    shopPhone: input.shopPhone.trim(),
    city: input.city.trim(),
    district: input.district.trim(),
    notes: input.notes.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    accuracyMeters: input.accuracyMeters,
    streetSignLabel: input.streetSignLabel.trim(),
    interiorLabels: input.interiorLabels.map((s) => s.trim()).filter(Boolean),
    openedAt: opened.toISOString(),
    expiresAt: expires.toISOString(),
    rewardSar: null,
    rejectReason: null,
  };

  const next: AmbassadorPortalState = {
    ...state,
    targets: [target, ...state.targets],
  };
  writeAmbassadorPortal(next);
  return { ok: true, state: next };
}

export function updateAmbassadorIban(
  state: AmbassadorPortalState,
  iban: string,
): AmbassadorPortalState {
  const next = {
    ...state,
    profile: { ...state.profile, iban: iban.trim() },
  };
  writeAmbassadorPortal(next);
  return next;
}

export function requestPayout(
  state: AmbassadorPortalState,
): { ok: true; state: AmbassadorPortalState } | { ok: false; error: string } {
  if (!isWalletPayoutAllowed(state.profile)) {
    return {
      ok: false,
      error: 'صرف المحفظة متاح بعد الاعتماد الرسمي (أول إغلاق صالون ناجح).',
    };
  }
  if (state.profile.marketingLocked) {
    return { ok: false, error: 'يوجد تحويل بانتظار إقرار الاستلام.' };
  }
  if (state.balanceSar < AMBASSADOR_PAYOUT_MIN_SAR) {
    return {
      ok: false,
      error: `الرصيد يجب أن يصل إلى ${AMBASSADOR_PAYOUT_MIN_SAR} ر.س لفتح طلب التحويل.`,
    };
  }
  if (!state.profile.iban.trim()) {
    return { ok: false, error: 'أدخل الآيبان أولاً.' };
  }

  const amount = state.balanceSar;
  const payout: AmbassadorPayoutRequest = {
    id: uid('pay'),
    amountSar: amount,
    iban: state.profile.iban.trim(),
    status: 'awaiting_receipt_ack',
    transferDocumentLabel: null,
    receiptAcknowledgedAt: null,
    createdAt: new Date().toISOString(),
  };

  const balanceAfter = 0;
  const ledger: AmbassadorLedgerEntry = {
    id: uid('led'),
    entryType: 'payout',
    amountSar: -amount,
    balanceAfterSar: balanceAfter,
    note: `طلب تحويل أرباح — ${amount} ر.س`,
    createdAt: new Date().toISOString(),
    targetRequestId: null,
  };

  const next: AmbassadorPortalState = {
    ...state,
    balanceSar: balanceAfter,
    ledger: [ledger, ...state.ledger],
    payouts: [payout, ...state.payouts],
    profile: { ...state.profile, marketingLocked: true },
  };
  writeAmbassadorPortal(next);
  return { ok: true, state: next };
}

export function attachTransferDocument(
  state: AmbassadorPortalState,
  payoutId: string,
  label: string,
): AmbassadorPortalState {
  const payouts = state.payouts.map((p) =>
    p.id === payoutId ? { ...p, transferDocumentLabel: label, status: 'awaiting_receipt_ack' as const } : p,
  );
  const next = { ...state, payouts };
  writeAmbassadorPortal(next);
  return next;
}

export function acknowledgePayoutReceipt(
  state: AmbassadorPortalState,
  payoutId: string,
): { ok: true; state: AmbassadorPortalState } | { ok: false; error: string } {
  const payout = state.payouts.find((p) => p.id === payoutId);
  if (!payout) return { ok: false, error: 'طلب التحويل غير موجود.' };
  if (!payout.transferDocumentLabel) {
    return { ok: false, error: 'ارفع مستند التحويل أولاً قبل إقرار الاستلام.' };
  }

  const payouts = state.payouts.map((p) =>
    p.id === payoutId
      ? {
          ...p,
          status: 'paid' as const,
          receiptAcknowledgedAt: new Date().toISOString(),
        }
      : p,
  );

  const next: AmbassadorPortalState = {
    ...state,
    payouts,
    profile: { ...state.profile, marketingLocked: false },
  };
  writeAmbassadorPortal(next);
  return { ok: true, state: next };
}

/**
 * محاكاة استحقاق عمولة — أول إغلاق صالون يرقّي الحساب إلى معتمد ويفتح المفروشات.
 */
export function simulateRewardForTarget(
  state: AmbassadorPortalState,
  targetId: string,
  amountSar: number,
  note: string,
): { ok: true; state: AmbassadorPortalState } | { ok: false; error: string } {
  if (!isAmbassadorFieldActive(state.profile)) {
    return { ok: false, error: 'الحساب غير مفعّل للعمل الميداني.' };
  }
  const target = state.targets.find((t) => t.id === targetId);
  if (!target) return { ok: false, error: 'الطلب غير موجود.' };
  if (target.status !== 'open') return { ok: false, error: 'الطلب ليس مفتوحاً.' };
  if (new Date(target.expiresAt).getTime() <= Date.now()) {
    return { ok: false, error: 'انتهت نافذة الطلب.' };
  }
  if (target.kind === 'hospitality' && !isHospitalityUnlocked(state.profile)) {
    return { ok: false, error: 'المفروشات مقفلة حتى أول إغلاق صالون.' };
  }

  const now = new Date().toISOString();
  const isFirstBarberClose =
    target.kind === 'barber' && !state.profile.firstBarberCloseAt;

  const balanceAfter = state.balanceSar + amountSar;
  const ledger: AmbassadorLedgerEntry = {
    id: uid('led'),
    entryType: target.kind === 'hospitality' ? 'hospitality' : 'commission',
    amountSar,
    balanceAfterSar: balanceAfter,
    note: isFirstBarberClose
      ? `${note} · أول إغلاق صالون — اعتماد رسمي`
      : note,
    createdAt: now,
    targetRequestId: targetId,
  };

  const targets = state.targets.map((t) =>
    t.id === targetId
      ? { ...t, status: 'rewarded' as const, rewardSar: amountSar }
      : t,
  );

  const next: AmbassadorPortalState = {
    ...state,
    balanceSar: balanceAfter,
    ledger: [ledger, ...state.ledger],
    targets,
    profile: isFirstBarberClose
      ? {
          ...state.profile,
          accountStatus: 'active',
          firstBarberCloseAt: now,
        }
      : state.profile,
  };
  writeAmbassadorPortal(next);
  return { ok: true, state: next };
}

export function buildAmbassadorReferralPath(code: string): string {
  return `/partners/register?ref=${encodeURIComponent(code)}`;
}
