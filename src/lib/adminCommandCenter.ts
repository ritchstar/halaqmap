import {
  buildCommandCenterOutreachMessage,
  DEFAULT_OUTREACH_MESSAGE,
  type CommandCenterOutreachLength,
  type CommandCenterOutreachTierFit,
  type CommandCenterOutreachVariant,
} from '@/config/commandCenterOutreachCopy';

export type CommandLeadChannel = 'whatsapp' | 'instagram' | 'email' | 'website' | 'phone';
export type CommandLeadStatus = 'new' | 'contacted' | 'waiting' | 'won' | 'lost';
export type PartnerProspectTierFit = 'bronze' | 'gold' | 'diamond' | 'mixed';
export type PartnerProspectSource = 'manual' | 'seed' | 'b2b_strategist' | 'import';

/** Partner acquisition lead — persisted in `partner_prospects` (Command Center pipeline). */
export interface PartnerProspect {
  id: string;
  legacyId?: string | null;
  name: string;
  city: string;
  region: string;
  address?: string | null;
  tierFit: PartnerProspectTierFit;
  channel: CommandLeadChannel;
  phone?: string | null;
  email?: string | null;
  instagram?: string | null;
  website?: string | null;
  status: CommandLeadStatus;
  assignedTo?: string | null;
  notes?: string | null;
  lastContactAt?: string | null;
  followUpDate?: string | null;
  suggestedPitch?: string | null;
  source: PartnerProspectSource;
  sourceMeta?: Record<string, unknown>;
  createdByEmail?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** @deprecated Use PartnerProspect — kept for existing imports */
export type CommandCenterLead = PartnerProspect;

export { DEFAULT_OUTREACH_MESSAGE };

export type ProspectOutreachOptions = {
  variant?: CommandCenterOutreachVariant;
  length?: CommandCenterOutreachLength;
};

export function prospectOutreachMessage(
  prospect: Pick<PartnerProspect, 'name' | 'city' | 'region' | 'suggestedPitch' | 'tierFit'>,
  options: ProspectOutreachOptions = {},
): string {
  const { variant = 'initial', length = 'full' } = options;
  if (length === 'full' && variant === 'initial' && prospect.suggestedPitch?.trim()) {
    return prospect.suggestedPitch.trim();
  }
  return buildCommandCenterOutreachMessage({
    salonName: prospect.name,
    tierFit: prospect.tierFit as CommandCenterOutreachTierFit,
    variant,
    length,
    city: prospect.city,
    region: prospect.region,
  });
}

export const PARTNER_PROSPECT_UNKNOWN_LABEL = 'غير محدد';

export function normalizePhoneForWa(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('966')) return digits;
  if (digits.startsWith('05') && digits.length === 10) return `966${digits.slice(1)}`;
  return digits;
}

export function buildWaDeepLink(phone: string, message: string): string {
  return `https://wa.me/${normalizePhoneForWa(phone)}?text=${encodeURIComponent(message)}`;
}

export const PARTNER_PROSPECT_SOURCE_LABELS: Record<PartnerProspectSource, string> = {
  manual: 'يدوي',
  seed: 'بذرة',
  b2b_strategist: 'استراتيجي B2B',
  import: 'استيراد',
};
