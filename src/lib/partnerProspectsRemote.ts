import { getSupabaseClient } from '@/integrations/supabase/client';
import type {
  CommandLeadChannel,
  CommandLeadStatus,
  PartnerProspect,
  PartnerProspectSource,
  PartnerProspectTierFit,
} from '@/lib/adminCommandCenter';

const ROUTE = '/api/admin-partner-prospects';

export type PartnerProspectInput = {
  name: string;
  city: string;
  region: string;
  address?: string;
  tierFit?: PartnerProspectTierFit;
  channel?: CommandLeadChannel;
  phone?: string;
  email?: string;
  instagram?: string;
  website?: string;
  suggestedPitch?: string;
  source?: PartnerProspectSource;
  sourceMeta?: Record<string, unknown>;
};

export type PartnerProspectPatch = Partial<
  PartnerProspectInput & {
    status: CommandLeadStatus;
    assignedTo: string | null;
    notes: string | null;
    followUpDate: string | null;
    lastContactAt: string | null;
  }
>;

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function formatError(json: Record<string, unknown>, status: number): string {
  const err = typeof json.error === 'string' ? json.error : `HTTP ${status}`;
  const hint = typeof json.hint === 'string' ? json.hint : '';
  return hint ? `${err} — ${hint}` : err;
}

function mapProspect(raw: Record<string, unknown>): PartnerProspect {
  return {
    id: String(raw.id),
    legacyId: typeof raw.legacyId === 'string' ? raw.legacyId : null,
    name: String(raw.name ?? ''),
    city: String(raw.city ?? ''),
    region: String(raw.region ?? ''),
    address: typeof raw.address === 'string' ? raw.address : null,
    tierFit: (raw.tierFit as PartnerProspectTierFit) ?? 'gold',
    channel: (raw.channel as CommandLeadChannel) ?? 'whatsapp',
    phone: typeof raw.phone === 'string' ? raw.phone : null,
    email: typeof raw.email === 'string' ? raw.email : null,
    instagram: typeof raw.instagram === 'string' ? raw.instagram : null,
    website: typeof raw.website === 'string' ? raw.website : null,
    status: (raw.status as CommandLeadStatus) ?? 'new',
    assignedTo: typeof raw.assignedTo === 'string' ? raw.assignedTo : null,
    notes: typeof raw.notes === 'string' ? raw.notes : null,
    lastContactAt: typeof raw.lastContactAt === 'string' ? raw.lastContactAt : null,
    followUpDate: typeof raw.followUpDate === 'string' ? raw.followUpDate.slice(0, 10) : null,
    suggestedPitch: typeof raw.suggestedPitch === 'string' ? raw.suggestedPitch : null,
    source: (raw.source as PartnerProspectSource) ?? 'manual',
    sourceMeta:
      raw.sourceMeta && typeof raw.sourceMeta === 'object'
        ? (raw.sourceMeta as Record<string, unknown>)
        : {},
    createdByEmail: typeof raw.createdByEmail === 'string' ? raw.createdByEmail : null,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : null,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : null,
  };
}

export async function fetchPartnerProspects(): Promise<
  { ok: true; prospects: PartnerProspect[] } | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(ROUTE, { method: 'GET', headers: h });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatError(json, res.status) };
  }

  const rows = Array.isArray(json.prospects) ? json.prospects : [];
  return {
    ok: true,
    prospects: rows.map((row) => mapProspect(row as Record<string, unknown>)),
  };
}

export async function createPartnerProspect(
  input: PartnerProspectInput,
): Promise<{ ok: true; prospect: PartnerProspect } | { ok: false; error: string }> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(ROUTE, {
    method: 'POST',
    headers: h,
    body: JSON.stringify(input),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatError(json, res.status) };
  }

  const prospect = json.prospect;
  if (!prospect || typeof prospect !== 'object') {
    return { ok: false, error: 'استجابة غير متوقعة من الخادم' };
  }
  return { ok: true, prospect: mapProspect(prospect as Record<string, unknown>) };
}

export async function updatePartnerProspect(
  id: string,
  patch: PartnerProspectPatch,
): Promise<{ ok: true; prospect: PartnerProspect } | { ok: false; error: string }> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(ROUTE, {
    method: 'PATCH',
    headers: h,
    body: JSON.stringify({ id, ...patch }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatError(json, res.status) };
  }

  const prospect = json.prospect;
  if (!prospect || typeof prospect !== 'object') {
    return { ok: false, error: 'استجابة غير متوقعة من الخادم' };
  }
  return { ok: true, prospect: mapProspect(prospect as Record<string, unknown>) };
}

export const COMMAND_CENTER_LEGACY_STATE_KEY = 'halaqmap_command_center_lead_state_v1';

type LegacyLeadRuntimeState = {
  status?: CommandLeadStatus;
  assignedTo?: string;
  notes?: string;
  lastContactAt?: string;
  followUpDate?: string;
};

/** One-time migration from pre-DB localStorage lead states (keyed by legacy_id). */
export async function migrateLegacyCommandCenterState(
  prospects: PartnerProspect[],
): Promise<{ migrated: number }> {
  if (typeof window === 'undefined') return { migrated: 0 };
  try {
    const raw = localStorage.getItem(COMMAND_CENTER_LEGACY_STATE_KEY);
    if (!raw) return { migrated: 0 };

    const legacy = JSON.parse(raw) as Record<string, LegacyLeadRuntimeState>;
    let migrated = 0;

    for (const prospect of prospects) {
      const key = prospect.legacyId ?? prospect.id;
      const st = legacy[key] ?? legacy[prospect.id];
      if (!st) continue;
      if (prospect.status !== 'new' || prospect.notes || prospect.followUpDate) continue;

      const patch: PartnerProspectPatch = {};
      if (st.status) patch.status = st.status;
      if (st.assignedTo) patch.assignedTo = st.assignedTo;
      if (st.notes) patch.notes = st.notes;
      if (st.followUpDate) patch.followUpDate = st.followUpDate;
      if (st.lastContactAt) patch.lastContactAt = st.lastContactAt;

      if (Object.keys(patch).length === 0) continue;
      const r = await updatePartnerProspect(prospect.id, patch);
      if (r.ok) migrated += 1;
    }

    if (migrated > 0) {
      localStorage.removeItem(COMMAND_CENTER_LEGACY_STATE_KEY);
    }
    return { migrated };
  } catch {
    return { migrated: 0 };
  }
}
