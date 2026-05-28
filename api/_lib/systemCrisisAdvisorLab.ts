import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SupabaseClient } from '@supabase/supabase-js';
import { appendUniversalAgentDoctrines } from './platformManagementReferral.js';
import { getOpsBillingTemporalAnchor } from './opsBillingAi.js';

export type SystemCrisisLabChatTurn = { role: 'user' | 'assistant'; content: string };

export type SystemCrisisLabContext = {
  playbookLoaded: boolean;
  playbookChars: number;
  anchorLabelAr: string;
  urgentOpsReports24h: number;
  recentUrgentTitles: string[];
  activeBarbersApprox: number | null;
  failedPayments24h: number | null;
  dataSource: 'live' | 'partial';
};

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const PLAYBOOK_PATH = join(MODULE_DIR, '../../docs/crisis-playbook.md');

let cachedPlaybook: string | null = null;

export function loadCrisisPlaybookMarkdown(): string {
  if (cachedPlaybook !== null) return cachedPlaybook;
  try {
    cachedPlaybook = readFileSync(PLAYBOOK_PATH, 'utf8');
    return cachedPlaybook;
  } catch {
    cachedPlaybook = '';
    return cachedPlaybook;
  }
}

export async function loadSystemCrisisLabContext(
  supabase: SupabaseClient,
): Promise<SystemCrisisLabContext> {
  const anchor = getOpsBillingTemporalAnchor();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let urgentOpsReports24h = 0;
  const recentUrgentTitles: string[] = [];
  let activeBarbersApprox: number | null = null;
  let failedPayments24h: number | null = null;

  try {
    const { data: urgentRows } = await supabase
      .from('platform_ops_controller_reports')
      .select('title, severity, detail')
      .gte('submitted_at', since)
      .eq('severity', 'urgent')
      .eq('reporter_role', 'OPS_MANAGER')
      .order('submitted_at', { ascending: false })
      .limit(8);

    for (const row of urgentRows ?? []) {
      const detail = row.detail as Record<string, unknown> | null;
      if (detail?.source === 'ops_intelligence_digest') continue;
      urgentOpsReports24h += 1;
      if (typeof row.title === 'string') recentUrgentTitles.push(row.title.slice(0, 120));
    }
  } catch {
    // partial
  }

  try {
    const { count } = await supabase
      .from('barbers')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);
    if (typeof count === 'number') activeBarbersApprox = count;
  } catch {
    // partial
  }

  try {
    const { count } = await supabase
      .from('payments')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since)
      .eq('status', 'failed');
    if (typeof count === 'number') failedPayments24h = count;
  } catch {
    // partial
  }

  const playbook = loadCrisisPlaybookMarkdown();

  return {
    playbookLoaded: playbook.length > 0,
    playbookChars: playbook.length,
    anchorLabelAr: anchor.labelAr,
    urgentOpsReports24h,
    recentUrgentTitles: recentUrgentTitles.slice(0, 5),
    activeBarbersApprox,
    failedPayments24h,
    dataSource:
      activeBarbersApprox !== null || urgentOpsReports24h > 0 ? 'live' : 'partial',
  };
}

export function buildSystemCrisisAdvisorLabSystemPrompt(
  ctx: SystemCrisisLabContext,
  playbook: string,
): string {
  const playbookBody =
    playbook.length > 0
      ? playbook.slice(0, 18_000)
      : '(تعذّر تحميل Crisis Playbook من docs/crisis-playbook.md على الخادم)';

  return appendUniversalAgentDoctrines(
    [
    'أنت **مستشار الأزمات التقنية (Strategic Technical Consultant)** في منصة **حلاق ماب (Halaq Map)**.',
    '',
    '## الهوية',
    '- استشاري تقني استراتيجي — هادئ، حازم، موثوق.',
    '- معرفة عميقة ببنية المنصة: Vite + React HashRouter، Vercel serverless API، Supabase (RLS + service_role)، Moyasar، Resend، ops-controller، AI staff labs.',
    '- **Professional Sovereignty** — لغة مهنية داخلية B2B؛ لا تسويق ولا طمأنة زائفة.',
    '',
    '## وضع الأزمة (Crisis Discussion)',
    '**تجاهل** أي ملاحظات واجهة غير حرجة، اقتراحات UX، أو تحسينات منتج.',
    '**ركّز حصرياً على:**',
    '1. **Uptime** — استمرارية الخدمة للمسارات الحرجة (بحث المستهلك، تسجيل الشريك، الدفع، لوحة الإدارة).',
    '2. **Data integrity** — سلامة البيانات، RLS، عدم تسرّب service role، اتساق المدفوعات والاشتراكات.',
    '3. **ترتيب الأولويات** — P0/P1/P2 مع خطوات قابلة للتنفيذ فوراً.',
    '',
    '## تنسيق كل رد',
    '1. **تقييم سريع** (جملة واحدة — شدة الحادث).',
    '2. **الإجراءات الفورية** (numbered list — 3–7 خطوات).',
    '3. **تحقق** (كيف نعرف أننا استعدنا الاستقرار).',
    '4. **ما لا تفعله الآن** (منع تفاقم الضرر).',
    '',
    '## لقطة تشغيل حية',
    `- التاريخ (الرياض): ${ctx.anchorLabelAr}`,
    `- تقارير OPS عاجلة (24س): ${ctx.urgentOpsReports24h}${ctx.recentUrgentTitles.length ? ` — ${ctx.recentUrgentTitles.join(' | ')}` : ''}`,
    `- حلاقون نشطون (تقريبي): ${ctx.activeBarbersApprox ?? 'غير متاح'}`,
    `- مدفوعات فاشلة (24س): ${ctx.failedPayments24h ?? 'غير متاح'}`,
    `- مصدر البيانات: ${ctx.dataSource}`,
    '',
    '## Crisis Playbook (read-only knowledge base)',
    playbookBody,
    '',
    '## قيود',
    '- لا تُنفّذ أوامر على الإنتاج — وجّه المؤسس فقط.',
    '- لا تكشف أسرار env للمستخدم؛ اذكر **أسماء** المتغيرات لا قيمها.',
    '- إذا lacked info، اسأل سؤالاً واحداً حاسماً ثم قدّم خطة افتراضية.',
    '- العربية افتراضياً؛ المصطلحات التقنية بالإنجليزية عند الحاجة.',
  ].join('\n'),
    'system_crisis_advisor',
  );
}

export async function callSystemCrisisAdvisorLabChat(input: {
  system: string;
  userText: string;
  conversationHistory?: SystemCrisisLabChatTurn[];
  timeoutMs?: number;
}): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY not configured on server');

  const model =
    (process.env.SYSTEM_CRISIS_ADVISOR_OPENAI_MODEL ||
      process.env.ADMIN_SENTINEL_OPENAI_MODEL ||
      'gpt-4o').trim() || 'gpt-4o';

  const timeoutMs = input.timeoutMs ?? 58_000;

  const historyMessages: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const turn of (input.conversationHistory || []).slice(-10)) {
    const role = turn.role === 'assistant' ? 'assistant' : 'user';
    const content = String(turn.content || '').trim();
    if (!content) continue;
    historyMessages.push({ role, content: content.slice(0, 8000) });
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
        temperature: 0.22,
        max_tokens: 2400,
        messages: [
          { role: 'system', content: input.system },
          ...historyMessages,
          { role: 'user', content: input.userText.slice(0, 12_000) },
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
      throw new Error('انتهت مهلة الرد — ركّز السؤال على P0 واحد');
    }
    throw e;
  } finally {
    clearTimeout(timeoutHandle);
  }
}
