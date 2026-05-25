import type { SupabaseClient } from '@supabase/supabase-js';
import { ZatcaTaxAdvisorAgent } from './agents/ZatcaTaxAdvisorAgent.js';
import {
  ZATCA_MANDATORY_LIMIT_SAR,
  ZATCA_PREPARED_VAT_RATE_PERCENT,
  ZATCA_VOLUNTARY_LIMIT_SAR,
} from './agents/zatcaTaxTypes.js';
import { assertVisionMime } from './opsBillingAi.js';
import { ZATCA_PLATFORM_PACKAGES_NOTE_AR } from './subscriptionPricingCopy.js';

export type ZatcaLabChatTurn = { role: 'user' | 'assistant'; content: string };

export type ZatcaLabContext = {
  taxEnabledLive: boolean;
  lastRadarRunAt: string | null;
  totalHistoricalSar: number | null;
  trailing31dSar: number | null;
  activeWarnings: unknown[];
  complianceReportSummary: string;
  externalIntelSummary: string;
  hypotheticalScenariosJson: string;
};

export async function loadZatcaLabContext(supabase: SupabaseClient): Promise<ZatcaLabContext> {
  const agent = new ZatcaTaxAdvisorAgent(supabase);
  const [state, brief] = await Promise.all([
    agent.getState(),
    agent.getComplianceBrief({ refreshIntel: false }),
  ]);

  const analytics = brief.analytics;
  const report = brief.complianceReport;

  return {
    taxEnabledLive: state?.tax_enabled === true,
    lastRadarRunAt: state?.last_radar_run_at ?? null,
    totalHistoricalSar: analytics?.totalHistoricalSar ?? null,
    trailing31dSar: analytics ? analytics.trailing30dHalalas / 100 : null,
    activeWarnings: state?.active_warnings ?? [],
    complianceReportSummary: JSON.stringify(
      {
        generatedAt: report.generatedAt,
        currentRevenueSar: report.currentRevenueSar,
        thresholds: report.thresholds,
        vatActivationGuidance: report.vatActivationGuidance,
        disclaimerAr: report.disclaimerAr,
      },
      null,
      2,
    ),
    externalIntelSummary: JSON.stringify(brief.externalIntel, null, 2).slice(0, 8000),
    hypotheticalScenariosJson: JSON.stringify(report.hypotheticalScenarios ?? [], null, 2),
  };
}

export function buildZatcaAdvisorLabSystemPrompt(ctx: ZatcaLabContext): string {
  return [
    'أنت **خبير زكاة وضريبة (ZATCA) 🛡️** — زميل **خازن** في منصة **حلاق ماب (Halaq Map)**.',
    '',
    '## وضع المحادثة الإدارية (Admin Lab)',
    'مُتحدّثك **مالك/مشرف المنصة** يريد مناقشتك، اختبارك، وطرح أسئلة تشغيلية — كن شريكاً في التفكير لا مجرد لوحة تقارير.',
    'استمع لأوامره وطبّقها في الجلسة، مثل:',
    '- «اشرح لي حد التسجيل الإلزامي ومتى نفعّل ض.ق.م»',
    '- «احسب ض.ق.م 15% على حزمة ماسية 225 ر.س»',
    '- «حلّل هذه الفاتورة/اللقطة» (صورة)',
    '- «ما الفرق بين الحد الاختياري والإلزامي؟»',
    '- «لخّص آخر مسح ZATCA الخارجي»',
    'عند أمر تحديث سلوكي: أكّد ما فهمته بجملة واحدة ثم طبّقه في الردود التالية.',
    '',
    '## حقائق المنصة (ثابتة)',
    `- نسبة ض.ق.م المُجهَّزة: **${ZATCA_PREPARED_VAT_RATE_PERCENT}%** (formula: vat = round(subtotal × rate / 100)).`,
    `- حد التسجيل **الاختياري**: **${ZATCA_VOLUNTARY_LIMIT_SAR.toLocaleString('ar-SA')} ر.س** إيرادات مُرصَدة.`,
    `- حد التسجيل **الإلزامي**: **${ZATCA_MANDATORY_LIMIT_SAR.toLocaleString('ar-SA')} ر.س** — عند بلوغه يُجهَّز التفعيل ويُفعَّل عبر «التفعيل الفوري الحي» بصلاحية \`activate_zatca_tax_live\`.`,
    '- **لا تُفعّل** `tax_enabled` أو عرض ض.ق.م حياً على الواجهة من المحادثة — التفعيل يتم فقط عبر «التفعيل الفوري الحي» في المكتب المالي بعد بلوغ الحد الإلزامي.',
    '- المنصة: ' + ZATCA_PLATFORM_PACKAGES_NOTE_AR,
    '- مصادر: `listing_license_orders` + مدفوعات legacy — رادار إيرادات + تقرير استباقي + مسح مصادر ZATCA الرسمية.',
    '',
    '## عقيدة — حدود مهمة',
    '- **لست مستشاراً ضريبياً مرخّصاً** — قدّم إرشاداً تشغيلياً وتخطيطياً مع تنبيه «استشر مختصاً مرخّصاً للقرارات النهائية».',
    '- لا تختلق أرقام إيرادات — استخدم اللقطة أدناه أو قل «شغّل الرادار من المكتب المالي».',
    '- عند تحليل صورة فاتورة: استخرج المبالغ، نسبة الضريبة إن وُجدت، التاريخ، واقترح تصنيفاً (حزمة/إضافة) دون ادعاء إثبات قانوني.',
    '',
    '## لقطة حية (قراءة فقط)',
    JSON.stringify(
      {
        taxEnabledLive: ctx.taxEnabledLive,
        lastRadarRunAt: ctx.lastRadarRunAt,
        totalHistoricalSar: ctx.totalHistoricalSar,
        trailing31dSar: ctx.trailing31dSar,
        activeWarnings: ctx.activeWarnings,
      },
      null,
      2,
    ),
    '',
    '## تقرير الامتثال (ملخّص)',
    ctx.complianceReportSummary,
    '',
    '## سيناريوهات افتراضية (حزم)',
    ctx.hypotheticalScenariosJson,
    '',
    '## مسح ZATCA الخارجي (آخر لقطة)',
    ctx.externalIntelSummary,
    '',
    '## تعليمات الرد',
    '- رد بالعربية الواضحة — Markdown خفيف مسموح.',
    '- كن محادثياً ومباشراً مثل زميل خازن في اجتماع إداري.',
    '- إذا سُئلت عن تفعيل حي: وجّه إلى المكتب المالي وزر «التفعيل الفوري الحي» بعد مراجعة الشهادة.',
  ].join('\n');
}

export async function callZatcaAdvisorLabVision(input: {
  system: string;
  userText: string;
  imageBase64?: string;
  imageMime?: string;
  conversationHistory?: ZatcaLabChatTurn[];
  timeoutMs?: number;
}): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY not configured on server');

  const model =
    (process.env.ZATCA_LAB_OPENAI_MODEL ||
      process.env.ADMIN_SENTINEL_OPENAI_MODEL ||
      'gpt-4o').trim() || 'gpt-4o';

  const timeoutMs = input.timeoutMs ?? 52_000;

  const userContent: Array<Record<string, unknown>> = [];
  if (input.imageBase64 && input.imageMime) {
    const mimeErr = assertVisionMime(input.imageMime);
    if (mimeErr) throw new Error(mimeErr);
    userContent.push({
      type: 'image_url',
      image_url: { url: `data:${input.imageMime};base64,${input.imageBase64}`, detail: 'auto' },
    });
  }
  userContent.push({
    type: 'text',
    text: input.userText || 'حلّل المرفق في سياق ZATCA وامتثال حلاق ماب.',
  });

  const historyMessages: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const turn of (input.conversationHistory || []).slice(-10)) {
    const role = turn.role === 'assistant' ? 'assistant' : 'user';
    const content = String(turn.content || '').trim();
    if (!content) continue;
    historyMessages.push({ role, content: content.slice(0, 6000) });
  }

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: input.system },
          ...historyMessages,
          { role: 'user', content: userContent },
        ],
      }),
    });

    const json = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
      choices?: { message?: { content?: string } }[];
    };
    if (!res.ok) throw new Error(json.error?.message || `OpenAI HTTP ${res.status}`);
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty model response');
    return text;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('انتهت مهلة الرد — جرّب صورة أصغر أو أعد المحاولة');
    }
    throw e;
  } finally {
    clearTimeout(timeoutHandle);
  }
}
