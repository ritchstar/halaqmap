export type RegistrationCompliancePayload = Record<string, unknown>;

export type RegistrationComplianceAudit = {
  ok: boolean;
  gaps: string[];
  repairable: boolean;
};

function collectComplianceGaps(payload: RegistrationCompliancePayload): string[] {
  const gaps: string[] = [];
  if (payload.legalDisclaimerAccepted !== true) gaps.push('التعهد القانوني غير مُؤشَّر');
  if (payload.registrationTermsAccepted !== true) gaps.push('شروط التسجيل غير مُؤشَّرة');
  if (payload.professionalCommitmentAccepted !== true) gaps.push('الالتزام المهني غير مُؤشَّر');
  if (!payload.legalDisclaimerAcceptedAtIso) gaps.push('طابع زمني للتعهد القانوني مفقود');
  if (!payload.registrationTermsAcceptedAtIso) gaps.push('طابع زمني لشروط التسجيل مفقود');
  if (!payload.professionalCommitmentAcceptedAtIso) gaps.push('طابع زمني للالتزام المهني مفقود');
  return gaps;
}

function documentsMentionProfessionalCommitment(payload: RegistrationCompliancePayload): boolean {
  const docs = payload.documents;
  if (!Array.isArray(docs)) return false;
  return docs.some(
    (entry) => typeof entry === 'string' && entry.includes('الالتزام المهني'),
  );
}

function pickComplianceTimestamp(payload: RegistrationCompliancePayload): string | null {
  const terms = payload.registrationTermsAcceptedAtIso;
  if (typeof terms === 'string' && terms.trim()) return terms.trim();
  const legal = payload.legalDisclaimerAcceptedAtIso;
  if (typeof legal === 'string' && legal.trim()) return legal.trim();
  return null;
}

/** Infer professional commitment for payloads submitted before structured fields were persisted. */
export function canInferProfessionalCommitment(payload: RegistrationCompliancePayload): boolean {
  if (payload.professionalCommitmentAccepted === true) {
    return typeof payload.professionalCommitmentAcceptedAtIso === 'string'
      ? Boolean(payload.professionalCommitmentAcceptedAtIso.trim())
      : pickComplianceTimestamp(payload) !== null;
  }

  if (payload.legalDisclaimerAccepted !== true || payload.registrationTermsAccepted !== true) {
    return false;
  }

  return pickComplianceTimestamp(payload) !== null || documentsMentionProfessionalCommitment(payload);
}

export function buildRegistrationComplianceBackfill(
  payload: RegistrationCompliancePayload,
): RegistrationCompliancePayload | null {
  const patch: RegistrationCompliancePayload = {};
  const timestamp = pickComplianceTimestamp(payload);

  if (payload.professionalCommitmentAccepted !== true) {
    if (!canInferProfessionalCommitment(payload)) return null;
    patch.professionalCommitmentAccepted = true;
  }

  if (
    typeof payload.professionalCommitmentAcceptedAtIso !== 'string' ||
    !payload.professionalCommitmentAcceptedAtIso.trim()
  ) {
    if (!timestamp) return null;
    patch.professionalCommitmentAcceptedAtIso = timestamp;
  }

  if (Object.keys(patch).length === 0) return null;

  return {
    ...payload,
    ...patch,
    complianceBackfillAtIso: new Date().toISOString(),
    complianceBackfillSource: 'registration_compliance_repair',
  };
}

export function auditRegistrationPayload(
  payload: RegistrationCompliancePayload,
): RegistrationComplianceAudit {
  const gaps = collectComplianceGaps(payload);
  if (gaps.length === 0) {
    return { ok: true, gaps: [], repairable: false };
  }

  const patched = buildRegistrationComplianceBackfill(payload);
  const repairable = patched ? collectComplianceGaps(patched).length === 0 : false;

  return { ok: false, gaps, repairable };
}

/** Strict validation for new registration submissions. */
export function validateRegistrationCompliancePayload(payload: RegistrationCompliancePayload): {
  ok: boolean;
  error?: string;
} {
  if (
    payload.professionalCommitmentAccepted !== true ||
    typeof payload.professionalCommitmentAcceptedAtIso !== 'string' ||
    !payload.professionalCommitmentAcceptedAtIso.trim()
  ) {
    return { ok: false, error: 'professional_commitment_required' };
  }

  if (
    payload.legalDisclaimerAccepted !== true ||
    payload.registrationTermsAccepted !== true ||
    !payload.legalDisclaimerAcceptedAtIso ||
    !payload.registrationTermsAcceptedAtIso
  ) {
    return { ok: false, error: 'registration_compliance_incomplete' };
  }

  if (
    payload.softwareProductAcknowledged !== true ||
    typeof payload.softwareProductAcknowledgedAtIso !== 'string' ||
    !payload.softwareProductAcknowledgedAtIso.trim()
  ) {
    return { ok: false, error: 'software_product_ack_required' };
  }

  return { ok: true };
}

export async function repairRegistrationSubmissionsCompliance(
  supabase: import('@supabase/supabase-js').SupabaseClient,
): Promise<{ repaired: number; skipped: number; samples: string[] }> {
  let repaired = 0;
  let skipped = 0;
  const samples: string[] = [];

  const { data } = await supabase
    .from('registration_submissions')
    .select('id, payload')
    .order('created_at', { ascending: false })
    .limit(120);

  for (const row of data ?? []) {
    const payload = (row.payload ?? {}) as RegistrationCompliancePayload;
    const before = auditRegistrationPayload(payload);
    if (before.ok) {
      skipped += 1;
      continue;
    }

    const patched = buildRegistrationComplianceBackfill(payload);
    if (!patched) {
      skipped += 1;
      if (samples.length < 8) {
        samples.push(`${String(row.id)}: ${before.gaps.join('؛ ')}`.slice(0, 160));
      }
      continue;
    }

    const after = auditRegistrationPayload(patched);
    if (!after.ok) {
      skipped += 1;
      continue;
    }

    const { error } = await supabase
      .from('registration_submissions')
      .update({ payload: patched })
      .eq('id', row.id);

    if (error) {
      skipped += 1;
      continue;
    }

    repaired += 1;
    if (samples.length < 8) {
      samples.push(`${String(row.id)}: تم إصلاح الالتزام المهني`);
    }
  }

  return { repaired, skipped, samples };
}
