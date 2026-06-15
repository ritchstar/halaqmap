import type { CommandLeadChannel, PartnerProspectTierFit } from '@/lib/adminCommandCenter';

export type ParsedPartnerProspectDraft = {
  name?: string;
  city?: string;
  region?: string;
  address?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  website?: string;
  tierFit?: PartnerProspectTierFit;
  channel?: CommandLeadChannel;
  suggestedPitch?: string;
};

const FIELD_PATTERNS: { key: keyof ParsedPartnerProspectDraft; patterns: RegExp[] }[] = [
  {
    key: 'name',
    patterns: [
      /(?:^|\n)\s*[-*]?\s*(?:\*\*)?(?:اسم(?:\s*المحل)?|الاسم)(?:\*\*)?\s*[:：]\s*(.+)$/im,
      /(?:^|\n)\s*[-*]?\s*(?:\*\*)?name(?:\*\*)?\s*[:：]\s*(.+)$/im,
    ],
  },
  {
    key: 'city',
    patterns: [
      /(?:^|\n)\s*[-*]?\s*(?:\*\*)?(?:المدينة|مدينة)(?:\*\*)?\s*[:：]\s*(.+)$/im,
      /(?:^|\n)\s*[-*]?\s*(?:\*\*)?city(?:\*\*)?\s*[:：]\s*(.+)$/im,
    ],
  },
  {
    key: 'region',
    patterns: [
      /(?:^|\n)\s*[-*]?\s*(?:\*\*)?(?:المنطقة|منطقة)(?:\*\*)?\s*[:：]\s*(.+)$/im,
      /(?:^|\n)\s*[-*]?\s*(?:\*\*)?region(?:\*\*)?\s*[:：]\s*(.+)$/im,
    ],
  },
  {
    key: 'address',
    patterns: [
      /(?:^|\n)\s*[-*]?\s*(?:\*\*)?(?:العنوان|address)(?:\*\*)?\s*[:：]\s*(.+)$/im,
    ],
  },
  {
    key: 'phone',
    patterns: [
      /(?:^|\n)\s*[-*]?\s*(?:\*\*)?(?:الجوال|الهاتف|phone|whatsapp)(?:\*\*)?\s*[:：]\s*(.+)$/im,
    ],
  },
  {
    key: 'email',
    patterns: [
      /(?:^|\n)\s*[-*]?\s*(?:\*\*)?(?:البريد|email)(?:\*\*)?\s*[:：]\s*(.+)$/im,
    ],
  },
  {
    key: 'instagram',
    patterns: [
      /(?:^|\n)\s*[-*]?\s*(?:\*\*)?(?:انست(?:قرام|agram)|instagram)(?:\*\*)?\s*[:：]\s*(.+)$/im,
    ],
  },
  {
    key: 'website',
    patterns: [
      /(?:^|\n)\s*[-*]?\s*(?:\*\*)?(?:الموقع|website|url)(?:\*\*)?\s*[:：]\s*(.+)$/im,
    ],
  },
  {
    key: 'tierFit',
    patterns: [
      /(?:^|\n)\s*[-*]?\s*(?:\*\*)?(?:الباقة|tier(?:\s*fit)?)(?:\*\*)?\s*[:：]\s*(.+)$/im,
    ],
  },
  {
    key: 'suggestedPitch',
    patterns: [
      /(?:^|\n)\s*[-*]?\s*(?:\*\*)?(?:رسالة(?:\s*الواتساب)?|pitch|message)(?:\*\*)?\s*[:：]\s*([\s\S]+?)(?=\n\s*[-*]?\s*(?:\*\*)?(?:اسم|المدينة|المنطقة|الجوال)|$)/im,
    ],
  },
];

function cleanValue(raw: string): string {
  return raw.replace(/\*\*/g, '').replace(/`/g, '').trim();
}

function normalizeTierFit(raw: string): PartnerProspectTierFit | undefined {
  const v = raw.toLowerCase();
  if (v.includes('ماس') || v.includes('diamond')) return 'diamond';
  if (v.includes('ذهب') || v.includes('gold')) return 'gold';
  if (v.includes('برون') || v.includes('bronze')) return 'bronze';
  if (v.includes('mixed') || v.includes('/')) return 'mixed';
  return undefined;
}

function inferChannel(draft: ParsedPartnerProspectDraft): CommandLeadChannel | undefined {
  if (draft.phone) return 'whatsapp';
  if (draft.email) return 'email';
  if (draft.instagram) return 'instagram';
  if (draft.website) return 'website';
  return undefined;
}

/** Extract structured lead fields from a B2B strategist reply. */
export function parsePartnerProspectFromAssistantText(text: string): ParsedPartnerProspectDraft {
  const source = text.trim();
  if (!source) return {};

  const draft: ParsedPartnerProspectDraft = {};

  for (const field of FIELD_PATTERNS) {
    for (const pattern of field.patterns) {
      const match = source.match(pattern);
      if (!match?.[1]) continue;
      const value = cleanValue(match[1]);
      if (!value) continue;
      if (field.key === 'tierFit') {
        const tier = normalizeTierFit(value);
        if (tier) draft.tierFit = tier;
      } else {
        draft[field.key] = value as never;
      }
      break;
    }
  }

  if (!draft.channel) {
    draft.channel = inferChannel(draft);
  }

  return draft;
}

export const B2B_HANDOFF_FORMAT_HINT =
  'عند تجهيز lead للإحالة إلى غرفة القيادة، أضف في نهاية ردك كتلة بالحقول:\n' +
  '- **الاسم:** …\n' +
  '- **المدينة:** …\n' +
  '- **المنطقة:** …\n' +
  '- **العنوان:** …\n' +
  '- **الجوال:** …\n' +
  '- **انستقرام:** …\n' +
  '- **الموقع:** …\n' +
  '- **الباقة:** ذهبي/ماسي/…\n' +
  '- **رسالة الواتساب:** …';
