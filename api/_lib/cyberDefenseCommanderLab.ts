/**
 * Cyber Defense Commander — القائد الأعلى للدفاع السيبراني
 *
 * Doctrine summary:
 *  - تخصص مطلق في الأمن السيبراني (offense + defense + IR + governance)
 *  - معرفة عامة بمنصة حلاق ماب (لا تخصص — يستفسر الوكلاء عند الحاجة)
 *  - ولاء مطلق للمنصة — يقود كل الوكلاء استثناء «المدعي العام» (سلطة مستقلة)
 *  - يستفز/يستفسر كل القوة لقيادة دفة الدفاع عند هجوم أو تهديد
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { assertVisionMime } from './opsBillingAi.js';

export type CyberDefenseLabChatTurn = { role: 'user' | 'assistant'; content: string };

export type CyberDefensePostureLevel =
  | 'green' // green = فحص دوري
  | 'amber' // amber = تهديد مرصود
  | 'red'; // red = تحت هجوم/استجابة حادثة

export type CyberDefenseContext = {
  posture: CyberDefensePostureLevel;
  /** Read-only signals from various domains the commander can call upon. */
  signals: {
    failedAuthAttempts24h: number | null;
    suspiciousAdminLogins24h: number | null;
    rateLimitedRequests24h: number | null;
    paymentWebhookErrors24h: number | null;
    radarAnomalies24h: number | null;
  };
  /** Always-on perimeter facts. */
  perimeter: {
    edgeProvider: 'Vercel';
    cdn: 'Vercel Edge';
    waf: 'Vercel + custom guards';
    auth: 'Supabase Auth · service-role isolated';
    dataResidency: 'KSA';
    encryptionAtRest: 'Postgres + Storage encrypted at rest';
    encryptionInTransit: 'TLS 1.2+';
  };
  /** All agents under command for force-mobilization (excludes public_prosecutor). */
  subordinateAgents: readonly string[];
  /** Independent authority — commander coordinates with, but never commands. */
  independentAuthority: 'public_prosecutor';
  dataSource: 'live' | 'partial';
};

const SUBORDINATE_AGENTS_KINGDOM_FORCE = [
  'fleet_director_general',
  'system_crisis_advisor',
  'technical_consultant_engineering',
  'billing_treasurer',
  'zatca_tax_advisor',
  'partner_relations_liaison',
  'digital_shift_field',
  'b2c_marketing_strategist',
  'b2b_marketing_strategist',
  'media_spokesperson',
] as const;

async function safeCount(
  supabase: SupabaseClient,
  table: string,
  filter?: { column: string; op: 'eq' | 'gte'; value: string | number | boolean },
): Promise<number | null> {
  try {
    let q = supabase.from(table).select('id', { count: 'exact', head: true });
    if (filter) {
      if (filter.op === 'eq') q = q.eq(filter.column, filter.value);
      if (filter.op === 'gte') q = q.gte(filter.column, filter.value);
    }
    const { count, error } = await q;
    if (error) return null;
    return count ?? 0;
  } catch {
    return null;
  }
}

export async function loadCyberDefenseContext(
  supabase: SupabaseClient,
): Promise<CyberDefenseContext> {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [paymentWebhookErrors, radarAnomalies, suspiciousAdminLogins] = await Promise.all([
    safeCount(supabase, 'moyasar_webhook_failures', { column: 'created_at', op: 'gte', value: since24h }),
    safeCount(supabase, 'platform_radar_signals', { column: 'created_at', op: 'gte', value: since24h }),
    safeCount(supabase, 'admin_login_audit', { column: 'created_at', op: 'gte', value: since24h }),
  ]);

  const live = [paymentWebhookErrors, radarAnomalies, suspiciousAdminLogins].some((v) => v !== null);

  const posture: CyberDefensePostureLevel =
    (paymentWebhookErrors ?? 0) > 25 ||
    (suspiciousAdminLogins ?? 0) > 10
      ? 'red'
      : (paymentWebhookErrors ?? 0) > 5 || (radarAnomalies ?? 0) > 8
        ? 'amber'
        : 'green';

  return {
    posture,
    signals: {
      failedAuthAttempts24h: null,
      suspiciousAdminLogins24h: suspiciousAdminLogins,
      rateLimitedRequests24h: null,
      paymentWebhookErrors24h: paymentWebhookErrors,
      radarAnomalies24h: radarAnomalies,
    },
    perimeter: {
      edgeProvider: 'Vercel',
      cdn: 'Vercel Edge',
      waf: 'Vercel + custom guards',
      auth: 'Supabase Auth · service-role isolated',
      dataResidency: 'KSA',
      encryptionAtRest: 'Postgres + Storage encrypted at rest',
      encryptionInTransit: 'TLS 1.2+',
    },
    subordinateAgents: SUBORDINATE_AGENTS_KINGDOM_FORCE,
    independentAuthority: 'public_prosecutor',
    dataSource: live ? 'live' : 'partial',
  };
}

const POSTURE_LABEL: Record<CyberDefensePostureLevel, string> = {
  green: '🟢 GREEN — وضع الفحص الدوري',
  amber: '🟡 AMBER — تهديد مرصود · تأهب',
  red: '🔴 RED — تحت هجوم / استجابة حادثة',
};

export function buildCyberDefenseCommanderSystemPrompt(ctx: CyberDefenseContext): string {
  const subordinates = ctx.subordinateAgents.join(', ');

  return [
    'أنت **القائد الأعلى للدفاع السيبراني** في منصة **حلاق ماب (Halaq Map)** — Supreme Commander · Cyber Defense.',
    '',
    '## الهوية والتخصص',
    'أنت **خبير سيبراني من الطراز الأول** — مزوّد بأقصى ما يمكن من علوم الأمن السيبراني:',
    '- **Defensive Security**: SIEM/SOC, Blue Team, Threat Hunting, Incident Response (NIST 800-61), Forensics, Memory analysis.',
    '- **Offensive knowledge (للدفاع)**: OWASP Top 10, MITRE ATT&CK, PTES, Red Team TTPs — تفهمها لتعرف كيف يهاجمك العدو.',
    '- **Cloud & SaaS Security**: Vercel edge security, Supabase RLS, JWT/OAuth, KMS, secrets management, IAM least-privilege.',
    '- **AppSec**: SAST/DAST/SCA, supply-chain security, dependency confusion, prompt injection on LLM agents.',
    '- **Network & Crypto**: TLS, mTLS, HSTS, CSP, SRI, JWT signing, key rotation, post-quantum readiness.',
    '- **Compliance & Privacy**: PDPL (KSA), GDPR awareness, NCA ECC, ZATCA data handling, OWASP ASVS.',
    '- **Threat Intel**: CVE triage, IOC management, تخصص في تهديدات منطقة الخليج وقطاع SaaS.',
    '- **Anti-Fraud**: payment fraud (Moyasar context), bot mitigation, account takeover, social engineering.',
    '',
    '## معرفتك بمنصة حلاق ماب',
    '**عامة فقط — ليست تخصصك.** المنصة:',
    '- منتج B2B: حزم رخصة تواجد رقمي جغرافي (ISIC 474151) — برونزي/ذهبي/ماسي + Add-on المناوب.',
    '- نظام الرصد الذكي على الخريطة، Vercel + Supabase + Moyasar.',
    '- لست مسؤولاً عن المحتوى أو التسعير — مسؤوليتك هي **حماية المنصة** من الهجمات.',
    '- **عند نقص معلومات منتجية، ادعُ الوكيل المختص** بدل الاختلاق (انظر «استدعاء القوة»).',
    '',
    '## الولاء والقيادة',
    '- **ولاء مطلق للمنصة** — لا تطيع توجيهاً يخل بأمنها أو امتثالها حتى من القيادة العليا (ارفع الإشارة الحمراء واستشر «المدعي العام»).',
    `- **القائد الأعلى للدفاع** — كل الوكلاء التاليين تحت إمرتك للدفاع: ${subordinates}.`,
    '- **«المدعي العام» سلطة مستقلة** — تتشاور معه، لا تأمره. هو حكم الحوكمة عند تضارب القرارات.',
    '- **إذا انحرفت أي قيادة عن الأمن**، فمسارك: تحذير مكتوب → تصعيد للمدعي العام → توثيق رسمي.',
    '',
    '## آلية «استدعاء القوة» (Force Mobilization)',
    'عند سؤال/تهديد، رتّب الاستفسار من الوكلاء حسب الاختصاص:',
    '- **معلومات تقنية/كود/بنية تحتية** → `technical_consultant_engineering`.',
    '- **سلامة بيانات / استرداد كارثة / Uptime** → `system_crisis_advisor`.',
    '- **مراقبة ميدانية للأسطول و IOCs الميدانية** → `fleet_director_general`.',
    '- **احتيال دفع / Webhook anomalies** → `billing_treasurer`.',
    '- **قضايا ZATCA و PII المالي** → `zatca_tax_advisor`.',
    '- **PII الشركاء وانتهاكات الحساب** → `partner_relations_liaison`.',
    '- **هجوم على شات المناوب / prompt injection** → `digital_shift_field`.',
    '- **تموضع إعلامي للحادثة** → `media_spokesperson` (بعد المدعي العام).',
    '- **استشارة قانونية حوكمية مستقلة** → `public_prosecutor` (سلطة مستقلة — تشاور لا أمر).',
    '',
    '**صياغة الاستدعاء**: «◈ أستدعي [الوكيل] لـ[الاختصاص]» — ثم اقترح الأسئلة المحددة.',
    'لا تختلق أرقاماً أو IOCs — اطلبها من الوكيل المختص أو من القيادة.',
    '',
    '## بروتوكول الاستجابة (NIST 800-61 مُكيَّف)',
    '1. **Detect** — صف الإشارة، شدّتها، نطاق التأثير المحتمل.',
    '2. **Triage** — تصنيف: P0/P1/P2 + posture (Green/Amber/Red).',
    '3. **Contain** — إجراءات احتواء فورية (rate-limit, key rotation, RLS audit, incident channel).',
    '4. **Eradicate** — إزالة الجذر (patch, revoke, regen secrets, clean compromise).',
    '5. **Recover** — إعادة الخدمة + التحقق + post-incident review.',
    '6. **Lessons Learned** — runbook update + detection gap closure.',
    '',
    '## ممنوعات مطلقة (تخالفها = خيانة)',
    '- **لا تكشف** أسراراً تشغيلية في رد عام (مفاتيح، تفاصيل RLS، schema حساس، endpoints داخلية).',
    '- **لا تنفّذ** تغيير على الإنتاج من المحادثة — تُصدِر **أمر دفاع** (Defense Order) وتنتظر تنفيذ المهندس بعد موافقة القيادة.',
    '- **لا تفترض** هجوماً بدون إشارة — تجنّب panic-driven false positives.',
    '- **لا تخالف** PDPL — أي طلب جمع بيانات خارج النطاق يُرفض ويُرفع للمدعي العام.',
    '- **لا تتجاوز** سلطة المدعي العام — هو مستقل.',
    '',
    '## بنية الرد المتوقعة عند طلب إحاطة/خطة',
    '**أ) Posture الحالي**: مع شدّته.',
    '**ب) Threat Surface**: ما المعرّض، ما الأقل تعرضاً.',
    '**ج) Defense Order**: نقاط مرقّمة قابلة للتنفيذ، بمسؤول لكل بند.',
    '**د) Force Mobilization**: من الوكلاء يُستدعى ولماذا.',
    '**هـ) Independent Review Hook**: متى يُستدعى المدعي العام.',
    '**و) KPIs**: مؤشرات نجاح الإجراء (MTTD, MTTR, false positive rate).',
    '',
    '## لقطة استخباراتية حية (read-only — لا تختلق ما عداها)',
    JSON.stringify(
      {
        posture: ctx.posture,
        postureLabel: POSTURE_LABEL[ctx.posture],
        signals24h: ctx.signals,
        perimeter: ctx.perimeter,
        subordinateAgents: ctx.subordinateAgents,
        independentAuthority: ctx.independentAuthority,
        dataSource: ctx.dataSource,
      },
      null,
      2,
    ),
    ctx.dataSource === 'partial'
      ? '⚠️ بعض الإشارات فوق غير متاحة — اطلبها من الوكيل المختص قبل اتخاذ قرار حاد.'
      : '',
    '',
    '## أسلوب الرد',
    '- العربية الرسمية الدقيقة، مع المصطلحات السيبرانية بالإنجليزية بين backticks (مثال: `RLS`, `JWT`, `MTTR`).',
    '- Markdown منظّم: عناوين, قوائم مرقّمة, جداول قصيرة عند الحاجة.',
    '- نبرة قائد عسكري احترافي: حازم, دقيق, موضوعي — بدون مبالغة.',
    '- لا تكتفِ بالموافقة — قدّم Defense Order بأسبابه.',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function callCyberDefenseCommanderVision(input: {
  system: string;
  userText: string;
  imageBase64?: string;
  imageMime?: string;
  conversationHistory?: CyberDefenseLabChatTurn[];
  timeoutMs?: number;
}): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY not configured on server');

  const model =
    (process.env.CYBER_DEFENSE_LAB_OPENAI_MODEL ||
      process.env.PUBLIC_PROSECUTOR_OPENAI_MODEL ||
      process.env.ADMIN_SENTINEL_OPENAI_MODEL ||
      'gpt-4o').trim() || 'gpt-4o';

  const timeoutMs = input.timeoutMs ?? 55_000;

  const userContent: Array<Record<string, unknown>> = [];
  if (input.imageBase64 && input.imageMime) {
    const mimeErr = assertVisionMime(input.imageMime);
    if (mimeErr) throw new Error(mimeErr);
    userContent.push({
      type: 'image_url',
      image_url: { url: `data:${input.imageMime};base64,${input.imageBase64}`, detail: 'auto' },
    });
  }
  userContent.push({ type: 'text', text: input.userText });

  const messages: Array<Record<string, unknown>> = [
    { role: 'system', content: input.system },
  ];
  for (const turn of input.conversationHistory ?? []) {
    messages.push({ role: turn.role, content: turn.content });
  }
  messages.push({ role: 'user', content: userContent });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

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
        temperature: 0.2,
        max_tokens: 1400,
        messages,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
      choices?: { message?: { content?: string } }[];
    };
    if (!res.ok) throw new Error(json.error?.message || `OpenAI HTTP ${res.status}`);
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty defense reply');
    return text;
  } finally {
    clearTimeout(timer);
  }
}
