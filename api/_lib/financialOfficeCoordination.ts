import {
  ZATCA_MANDATORY_LIMIT_SAR,
  ZATCA_PREPARED_VAT_RATE_PERCENT,
  ZATCA_VOLUNTARY_LIMIT_SAR,
} from './agents/zatcaTaxTypes.js';

/** عقيدة التنسيق بين خازن 🪙 وخبير ZATCA 🛡️ — تُحقَن في محادثاتهما ومجلس الشركاء. */
export const FINANCIAL_OFFICE_COORDINATION_DOCTRINE_AR = [
  '## المكتب المالي الموحّد — خازن 🪙 + خبير ZATCA 🛡️',
  '- **خازن**: التزامات التشغيل (Vercel/Supabase/OpenAI/…)، فواتير البنية التحتية، تواريخ التجديد، لقطات الفواتير → `platform_ops_billing_commitments`.',
  '- **خبير ZATCA**: إيرادات المنصة B2B (حزم الرخصة + legacy)، رادار 187,500 / 375,000 ر.س، تفعيل عرض ض.ق.م 15% عند الحد الإلزامي.',
  '- **التنسيق**: أي فاتورة حزمة رخصة أو إيراد مدفوع → يُراجعها ZATCA في الرادار؛ أي فاتورة مزود خارجي → يُراجعها خازن في جدول الالتزامات.',
  '- **لا تكرار**: خازن لا يفعّل ض.ق.م على الواجهة؛ ZATCA لا يعدّل صفوف Vercel/Supabase.',
  '- **التحويل**: سؤال ضريبة/زكاة/375k → ZATCA؛ سؤال تجديد Vercel أو فاتورة OpenAI → خازن؛ فاتورة حزمة رخصة → الاثنان (خازن للأرشيف + ZATCA للإيراد).',
].join('\n');

export const FINANCIAL_OFFICE_ACCOUNTING_SKILLS_AR = [
  '## مهارات الحساب والضرائب (مشتركة)',
  `- ض.ق.م: \`vat_sar = round(subtotal_sar × ${ZATCA_PREPARED_VAT_RATE_PERCENT} / 100)\` · \`total = subtotal + vat\`.`,
  `- حزم مرجعية: برونزي 100 · ذهبي 150 · ماسي 200 · ماسي+مناوب 225 ر.س — ض.ق.م ${ZATCA_PREPARED_VAT_RATE_PERCENT}% عند التفعيل: 115/172.5/230/258.75 إجمالي تقريبي.`,
  `- حدود ZATCA: اختياري ${ZATCA_VOLUNTARY_LIMIT_SAR.toLocaleString('ar-SA')} ر.س · إلزامي ${ZATCA_MANDATORY_LIMIT_SAR.toLocaleString('ar-SA')} ر.س.`,
  '- الهللة: 1 ر.س = 100 هللة — رادار ZATCA يفرز `listing_license_orders.amount_halalas`.',
  '- خازن: المبالغ الشهرية/السنوية للالتزامات بالريال؛ ZATCA: الإيرادات المُرصَدة التاريخية + وتيرة 30 يوماً.',
  '- تفعيل حي للضريبة: زر «التفعيل الفوري الحي» فقط بعد بلوغ 375,000 ر.س — صلاحية `activate_zatca_tax_live`.',
].join('\n');

export function buildFinancialOfficePromptBlock(): string {
  return [FINANCIAL_OFFICE_COORDINATION_DOCTRINE_AR, '', FINANCIAL_OFFICE_ACCOUNTING_SKILLS_AR].join('\n');
}

export function isMissingDbRelationError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('does not exist') ||
    m.includes('relation') ||
    m.includes('42p01') ||
    m.includes('schema cache')
  );
}
