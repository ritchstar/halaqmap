/**
 * مصدر الحقيقة الوحيد لضريبة القيمة المضافة على المنصّة (خادم).
 *
 * القراءة من `platform_zatca_tax_advisor_state`:
 *  · `tax_enabled` (افتراضي false) — العلم الحيّ الوحيد لعرض/فرض ض.ق.م.
 *  · `cached_vat_config.ratePercent` — النسبة المُجهَّزة (=15) عند التفعيل.
 *
 * لا يوجد مفتاح ضريبة ثانٍ؛ التفعيل الحيّ يتم فقط عبر مسار ZATCA المحكوم
 * (`activate_zatca_tax_live` / `manage_platform_commerce_rules`).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { ZATCA_PLATFORM_STATE_ID, ZATCA_PREPARED_VAT_RATE_PERCENT } from './agents/zatcaTaxTypes.js';

export type PlatformVatConfig = {
  /** هل ض.ق.م مفعّلة حيّاً على الواجهة/الفوترة. */
  enabled: boolean;
  /** النسبة المئوية المعتمدة (مثال 15 = 15%). */
  percent: number;
};

/** إعداد آمن افتراضي: مطفأة، بنسبة مُجهَّزة 15% (لا تُطبَّق ما لم تُفعَّل). */
export const DEFAULT_PLATFORM_VAT_CONFIG: PlatformVatConfig = {
  enabled: false,
  percent: ZATCA_PREPARED_VAT_RATE_PERCENT,
};

function clampPercent(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : Number.parseFloat(String(raw ?? ''));
  if (!Number.isFinite(n) || n < 0) return ZATCA_PREPARED_VAT_RATE_PERCENT;
  if (n > 50) return 50;
  return Math.round(n * 100) / 100;
}

/**
 * يقرأ إعداد الضريبة الحيّ من قاعدة البيانات (service role).
 * عند أي خطأ/غياب صف يُعيد الإعداد الآمن (مطفأة) — لا يُفرَض ضريبة عند الشك.
 */
export async function getPlatformVatConfig(supabase: SupabaseClient): Promise<PlatformVatConfig> {
  try {
    const { data, error } = await supabase
      .from('platform_zatca_tax_advisor_state')
      .select('tax_enabled, cached_vat_config')
      .eq('id', ZATCA_PLATFORM_STATE_ID)
      .maybeSingle();

    if (error || !data) return { ...DEFAULT_PLATFORM_VAT_CONFIG };

    const cfg =
      data.cached_vat_config && typeof data.cached_vat_config === 'object' && !Array.isArray(data.cached_vat_config)
        ? (data.cached_vat_config as Record<string, unknown>)
        : {};

    return {
      enabled: data.tax_enabled === true,
      percent: clampPercent(cfg.ratePercent),
    };
  } catch {
    return { ...DEFAULT_PLATFORM_VAT_CONFIG };
  }
}

/** المبلغ المدفوع (هللات) = الأساسي + الضريبة فوقه عند التفعيل، وإلا الأساسي كما هو. */
export function applyVat(baseHalalas: number, cfg: PlatformVatConfig): number {
  const base = Math.trunc(baseHalalas);
  if (!Number.isFinite(base) || base <= 0) return 0;
  if (!cfg.enabled || cfg.percent <= 0) return base;
  return Math.round(base * (1 + cfg.percent / 100));
}

/** المبلغ الأساسي (هللات) بعد فصل ضريبة مطبَّقة عن المبلغ المدفوع (المدفوع ÷ (1+نسبة/100)). */
export function baseFromChargedWithVat(chargedHalalas: number, cfg: PlatformVatConfig): number {
  const gross = Math.trunc(chargedHalalas);
  if (!Number.isFinite(gross) || gross <= 0) return 0;
  if (!cfg.enabled || cfg.percent <= 0) return gross;
  return Math.round(gross / (1 + cfg.percent / 100));
}
