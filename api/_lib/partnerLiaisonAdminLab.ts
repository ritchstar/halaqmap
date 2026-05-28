import type { SupabaseClient } from '@supabase/supabase-js';
import { appendUniversalAgentDoctrines } from './platformManagementReferral.js';
import { composePartnerPathKnowledgePack } from './partnerAssistantKnowledge.js';
import { assertVisionMime } from './opsBillingAi.js';

export type PartnerLiaisonLabChatTurn = { role: 'user' | 'assistant'; content: string };

export type PartnerLiaisonFrictionTheme = { themeAr: string; count: number };

export type PartnerLiaisonRecentChat = {
  id: string;
  salonLabel: string;
  handledAt: string;
  sentiment: 'positive' | 'neutral' | 'friction';
  summaryAr: string;
};

export type PartnerLiaisonAnalyticsSnapshot = {
  chatsHandled7d: number;
  avgSentimentScore: number;
  frictionReports7d: number;
  topFrictionThemes: PartnerLiaisonFrictionTheme[];
  recentChats: PartnerLiaisonRecentChat[];
  dataSource: 'live' | 'staging_mock' | 'hybrid';
  platformSignals?: {
    totalBarbers: number;
    newBarbers7d: number;
    activeBarbers: number;
    tierCounts: { bronze: number; gold: number; diamond: number };
  };
};

/** Staging snapshot until dedicated partner analytics API ships. */
const PARTNER_LIAISON_ANALYTICS_STAGING: Omit<PartnerLiaisonAnalyticsSnapshot, 'dataSource'> = {
  chatsHandled7d: 284,
  avgSentimentScore: 78,
  frictionReports7d: 19,
  topFrictionThemes: [
    { themeAr: 'تأخير تفعيل الماسي بعد الدفع', count: 7 },
    { themeAr: 'صعوبة رفع صور المعرض', count: 5 },
    { themeAr: 'إعداد أوقات العمل والورديات', count: 4 },
    { themeAr: 'استفسارات نظام الرصد الذكي', count: 3 },
  ],
  recentChats: [
    {
      id: 'pl-1',
      salonLabel: 'صالون النخبة — الرياض',
      handledAt: '2026-05-19T09:14:00',
      sentiment: 'positive',
      summaryAr: 'استفسار عن خطوات التفعيل بعد الدفع — تم توضيح مسار الويب هوك.',
    },
    {
      id: 'pl-2',
      salonLabel: 'حلاقة الشرق — الدمام',
      handledAt: '2026-05-19T08:42:00',
      sentiment: 'friction',
      summaryAr: 'احتكاك: تأخر ظهور البنر بعد 24 ساعة — مُسجَّل للمتابعة الميدانية.',
    },
    {
      id: 'pl-3',
      salonLabel: 'مؤسسة الفخامة — جدة',
      handledAt: '2026-05-18T21:05:00',
      sentiment: 'neutral',
      summaryAr: 'سؤال عن الفرق بين الذهبي والماسي — إجابة معيارية من قاعدة المعرفة.',
    },
    {
      id: 'pl-4',
      salonLabel: 'صالون الواحة — المدينة',
      handledAt: '2026-05-18T17:30:00',
      sentiment: 'friction',
      summaryAr: 'ملاحظة ميدانية: صعوبة ضبط المناوب الرقمي من لوحة الحلاق.',
    },
  ],
};

export async function loadPartnerLiaisonAnalyticsSnapshot(
  supabase: SupabaseClient,
): Promise<PartnerLiaisonAnalyticsSnapshot> {
  const since7d = new Date(Date.now() - 7 * 86400000).toISOString();

  try {
    const [
      { count: totalBarbers },
      { count: newBarbers7d },
      { count: activeBarbers },
      { data: tierRows },
    ] = await Promise.all([
      supabase.from('barbers').select('id', { count: 'exact', head: true }),
      supabase.from('barbers').select('id', { count: 'exact', head: true }).gte('created_at', since7d),
      supabase.from('barbers').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('barbers').select('tier'),
    ]);

    const tierCounts = { bronze: 0, gold: 0, diamond: 0 };
    for (const row of tierRows ?? []) {
      const tier = String(row.tier || 'bronze').toLowerCase();
      if (tier === 'gold') tierCounts.gold += 1;
      else if (tier === 'diamond') tierCounts.diamond += 1;
      else tierCounts.bronze += 1;
    }

    const hasLiveSignals = totalBarbers != null || newBarbers7d != null;

    return {
      ...PARTNER_LIAISON_ANALYTICS_STAGING,
      dataSource: hasLiveSignals ? 'hybrid' : 'staging_mock',
      platformSignals: hasLiveSignals
        ? {
            totalBarbers: totalBarbers ?? 0,
            newBarbers7d: newBarbers7d ?? 0,
            activeBarbers: activeBarbers ?? 0,
            tierCounts,
          }
        : undefined,
    };
  } catch {
    return {
      ...PARTNER_LIAISON_ANALYTICS_STAGING,
      dataSource: 'staging_mock',
    };
  }
}

export function buildPartnerLiaisonAdminLabSystemPrompt(
  snapshot: PartnerLiaisonAnalyticsSnapshot,
): string {
  const kb = composePartnerPathKnowledgePack();

  return appendUniversalAgentDoctrines(
    [
    'أنت **مساعد الشركاء — علاقات المسار البرمجي** في منصة **حلاق ماب (Halaq Map)**.',
    '',
    '## وضع المحادثة الإدارية (Admin Lab)',
    'مُتحدّثك **مالك/مشرف المنصة** يريد مناقشتك، اختبارك، واستشارتك — ليس حلاقاً يسأل عن الانضمام.',
    'كن **شريكاً في التفكير**: قدّم مرئياتك، اقتراحاتك، وتحليلك بثقة ودقة — لا تكتفِ بتلخيص الأرقام.',
    '',
    '### ما يُتوقع منك في الجلسة',
    '- **ناقش** أنماط الاحتكاك التشغيلي واقترح حلولاً منتجية أو تواصلية.',
    '- **حاكِ** ردود مساعد الشركاء لحلاق محتمل (عربي/إنجليزي) عند الطلب — سمِّ الشخصية بوضوح.',
    '- **حلّل** لقطات شاشة (صفحة شركاء، شات، بنر، لوحة حلاق) واقترح تحسينات UX أو نصوص.',
    '- **قيّم** مشاعر أصحاب الصالونات من اللقطة الميدانية وحدّد أولويات المتابعة.',
    '- **اقترح** تحسينات لمسار الانضمام، التفعيل، أو قاعدة المعرفة — بربطها بالبيانات.',
    '- عند أمر تحديث سلوكي: أكّد ما فهمته بجملة واحدة ثم طبّقه في الردود التالية.',
    '',
    '## تخصصك — نطاق العمل',
    '- مسار **الخدمات البرمجية للمنصة** (انضمام الحلاقين، الباقات، التفعيل، الدعم).',
    '- **لا بيانات مالية** للمستهلك النهائي — لا محافظ زبائن، لا وساطة مدفوعات.',
    '- تجربة **المستخدم النهائي** (الباحث عن حلاق): مجاني، بدون تسجيل، إذن موقع لنظام الرصد الذكي فقط.',
    '- API الميداني للحلاقين: `/api/partner-assistant-chat` — أنت نسخة إدارية أعمق للمناقشة والتخطيط.',
    '',
    '## عقيدة — ممنوعات',
    '- **لا تختلق** أرقام أو أسعار خارج قاعدة المعرفة — الأسعار في أقسام «حقائق المنتج» و«سجل التحديثات» **مسموح** ذكرها.',
    '- **لا تعد** بحجز مواعيد أو وساطة مالية للزبائن.',
    '- **لا تقدّم** مسار «مراجعة واعتماد يدوي» كخطوة افتراضية بعد الدفع — المسار: دفع → تفعيل تلقائي.',
    '- خارج النطاق (قانون، منافسون، بيانات شخصية): اعتذر واقترح الدعم الفني.',
    '',
    '## لقطة التقارير الميدانية (قراءة فقط)',
    JSON.stringify(snapshot, null, 2),
    snapshot.dataSource === 'staging_mock'
      ? '⚠️ البيانات أعلاه **تجريبية (staging)** — اذكر ذلك عند الاستشهاد بها ولا تقدّمها كأرقام حية مؤكدة.'
      : snapshot.dataSource === 'hybrid'
        ? '⚠️ **platformSignals** أعلاه من قاعدة البيانات الحية؛ **topFrictionThemes** و**recentChats** ما زالت تجريبية حتى يُربط سجل محادثات المساعد — فرّق بينهما بوضوح.'
        : '',
    '',
    '## الاستمرارية والدقة في المحادثة',
    '- **لا تكرّر** الترحيب أو تقديم نفسك بعد الرسالة الأولى في الجلسة.',
    '- **ارجع** لما قاله المشرف سابقاً في المحادثة قبل الرد — لا تتجاهل سياق الجلسة.',
    '- عند «ناقش» أو «ما رأيك؟»: ادخل في **حوار حقيقي** بمرئيات واقتراحات، لا قائمة جافة فقط.',
    '- عند **عدم اليقين**: قل ذلك صراحة واقترح ما يلزم للتحقق (لقطة شاشة، سجل دعم، إلخ).',
    '- عند **محاكاة رد لحلاق**: ضع الرد بين علامتي اقتباس أو تحت عنوان «رد مقترح للحلاق».',
    '',
    '## قاعدة المعرفة — مسار الشركاء',
    kb,
    '',
    '## أسلوب الرد',
    '- رد بالعربية الواضحة ما لم يطلب محاكاة بلغة أخرى.',
    '- Markdown خفيف مسموح (**غامق**، قوائم، جداول بسيطة).',
    '- كن **محادثياً ودقيقاً**: اربط كل اقتراح بسبب من البيانات أو المعرفة.',
    '- عند السؤال «ما رأيك؟» أو «ماذا تقترح؟»: قدّم 2–4 نقاط عملية مرتبة بالأولوية.',
    '- عند تحليل احتكاك: (1) التشخيص (2) التأثير (3) اقتراح قصير/متوسط المدى.',
  ]
    .filter(Boolean)
    .join('\n'),
    'partner_relations_liaison',
  );
}

export async function callPartnerLiaisonAdminLabVision(input: {
  system: string;
  userText: string;
  imageBase64?: string;
  imageMime?: string;
  conversationHistory?: PartnerLiaisonLabChatTurn[];
  timeoutMs?: number;
}): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY not configured on server');

  const model =
    (process.env.PARTNER_LIAISON_LAB_OPENAI_MODEL ||
      process.env.PARTNER_ASSISTANT_OPENAI_MODEL ||
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
    text: input.userText || 'حلّل المرفق في سياق مساعد الشركاء وعلاقات المسار البرمجي.',
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
        temperature: 0.38,
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
