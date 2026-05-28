export type CommandLeadChannel = 'whatsapp' | 'instagram' | 'email' | 'website' | 'phone';
export type CommandLeadStatus = 'new' | 'contacted' | 'waiting' | 'won' | 'lost';
export type PartnerProspectTierFit = 'gold' | 'diamond' | 'mixed';
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

export const DEFAULT_OUTREACH_MESSAGE =
  'السلام عليكم، معكم فريق منصة حلاق ماب. نرغب بدعوتكم للانضمام للمنصة وزيادة الظهور المحلي للعملاء القريبين. هل يمكن إرسال التفاصيل؟';

export function prospectOutreachMessage(prospect: Pick<PartnerProspect, 'name' | 'suggestedPitch'>): string {
  if (prospect.suggestedPitch?.trim()) {
    return prospect.suggestedPitch.trim();
  }
  return `مرحباً ${prospect.name}،\n${DEFAULT_OUTREACH_MESSAGE}`;
}

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
