import type { SupabaseClient } from '@supabase/supabase-js';
import { assertVisionMime } from './opsBillingAi.js';
import {
  DIGITAL_SHIFT_REPLY_COST_HALALAS,
  evaluateIntercept,
  type DigitalShiftContext,
} from './digitalShiftAssistant.js';
import { formatSupportedLanguagesForPrompt, formatSupportedLanguagesLabelAr } from './digitalShiftLanguages.js';

export type DigitalShiftLabChatTurn = { role: 'user' | 'assistant'; content: string };

export type DigitalShiftFleetSnapshot = {
  enabledSalons: number;
  diamondSalons: number;
  totalWalletHalalas: number;
  lowWalletSalons: number;
  activeRecommendations: number;
  interceptReplies7d: number;
  replyCostHalalas: number;
  migrationId: string;
  tables: string[];
};

export async function loadDigitalShiftFleetSnapshot(
  supabase: SupabaseClient,
): Promise<DigitalShiftFleetSnapshot> {
  const [
    { count: enabledSalons },
    { count: diamondSalons },
    { data: wallets },
    { count: activeRecommendations },
    { count: interceptReplies7d },
  ] = await Promise.all([
    supabase
      .from('barber_digital_shift_config')
      .select('barber_id', { count: 'exact', head: true })
      .eq('enabled', true),
    supabase.from('barbers').select('id', { count: 'exact', head: true }).eq('tier', 'diamond'),
    supabase.from('barber_ai_wallet').select('balance_halalas, low_balance_threshold_halalas'),
    supabase
      .from('barber_ai_recommendations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('private_messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_digital_shift_reply', true)
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
  ]);

  const walletRows = wallets ?? [];
  const totalWalletHalalas = walletRows.reduce((s, w) => s + (w.balance_halalas ?? 0), 0);
  const lowWalletSalons = walletRows.filter(
    (w) => (w.balance_halalas ?? 0) <= (w.low_balance_threshold_halalas ?? 3000),
  ).length;

  return {
    enabledSalons: enabledSalons ?? 0,
    diamondSalons: diamondSalons ?? 0,
    totalWalletHalalas,
    lowWalletSalons,
    activeRecommendations: activeRecommendations ?? 0,
    interceptReplies7d: interceptReplies7d ?? 0,
    replyCostHalalas: DIGITAL_SHIFT_REPLY_COST_HALALAS,
    migrationId: '78_barber_digital_shift_ai',
    tables: [
      'barber_digital_shift_config',
      'barber_ai_wallet',
      'barber_ai_wallet_transactions',
      'barber_ai_recommendations',
      'private_messages.is_digital_shift_reply',
    ],
  };
}

const DEMO_SALON_CTX: DigitalShiftContext = {
  barberId: 'lab-demo-salon',
  barberName: 'صالون العرض — مختبر المناوب',
  assistantName: 'المناوب الرقمي',
  shopOpen: true,
  listingDaysRemaining: 18,
  walletBalanceHalalas: 8500,
  walletLowThresholdHalalas: 3000,
  replyDelayMinutes: 3,
};

export function buildDigitalShiftAdminLabSystemPrompt(snapshot: DigitalShiftFleetSnapshot): string {
  const interceptClosed = evaluateIntercept({
    ctx: DEMO_SALON_CTX,
    shopOpen: false,
    lastCustomerMessageAt: new Date(Date.now() - 120_000).toISOString(),
    lastBarberHumanReplyAt: null,
    lastShiftReplyAt: null,
    enabled: true,
  });
  const interceptDelay = evaluateIntercept({
    ctx: DEMO_SALON_CTX,
    shopOpen: true,
    lastCustomerMessageAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    lastBarberHumanReplyAt: null,
    lastShiftReplyAt: null,
    enabled: true,
  });

  return [
    'أنت «المناوب الرقمي الذكي 🌙» — ابتكار حصري من **منصة حلاق ماب (Halaq Map)**.',
    '',
    '## وضع المختبر الإداري (Admin Lab)',
    'مُتحدّثك الآن **مالك/مشرف المنصة** يختبر شخصيتك وقدراتك — ليس حلاقاً ولا عميلاً نهائياً.',
    'استمع لأوامره التشغيلية وطبّقها فوراً في جلسة المحادثة، مثل:',
    '- «حاكِ رد عميل إنجليزي يسأل عن موعد»',
    '- «حاكِ رد عميل تركي/فرنسي/إسباني/تاغalog» — استخدم اللغة المطلوبة مباشرة.',
    '- «حاكِ اعتراض صالون مغلق» أو «حاكِ تأخر الحلاق 5 دقائق»',
    '- «حلّل هذه الصورة» (بنر، معرض، لقطة شات، إعدادات)',
    '- «اختصر ردودك» / «زِد آداب سعودية» / «رد بالأردو أو التركية أو الفرنسية»',
    '- «اشرح لي كيف يعمل الاعتراض التلقائي»',
    'عند محاكاة عميل أو حلاق، **سمِّ الشخصية بوضوح** في بداية الرد ثم أعد الرد بأسلوبها.',
    'عند أمر تحديث سلوكي من المالك: أكّد ما فهمته بجملة واحدة ثم طبّقه في الردود التالية.',
    '',
    '## المنتج — حقائق ثابتة',
    '- متاح كإضافة **+25 ر.س/شهر** للباقة **الماسية الذكية** فقط (Diamond + addon).',
    `- تكلفة كل رد AI للعميل: **${DIGITAL_SHIFT_REPLY_COST_HALALAS} هللة** (1.50 ر.س) من **محفظة الحلاق** — لا من محفظة العميل.`,
    '- واجهتا التشغيل: (1) محادثة الحلاق في لوحة التحكم (2) اعتراض تلقائي في الشات الخاص مع العميل.',
    '- لغات الاعتراض المدعومة: **' + formatSupportedLanguagesLabelAr() + '** — حسب لغة آخر رسالة العميل.',
    '- مهلة الاعتراض أثناء الدوام: بعد `reply_delay_minutes` (افتراضي 3) من رسالة العميل إذا لم يرد الحلاق.',
    '- اعتراض فوري عند **إغلاق المحل** (`open_for_customers=false`).',
    `- قواعد الاعتراض (مختبر): مغلق → ${interceptClosed.shouldReply}; تأخر 5د → ${interceptDelay.shouldReply}`,
    '- توصيات ذكية (heuristic): الشحن/الرصيد، البنرات، المعرض — فئات balance/banner/gallery/shift_chat.',
    '- API: `/api/barber-digital-shift-assistant` (حلاق) · `/api/customer-digital-shift-intercept` (اعتراض).',
    '',
    '## عقيدة — ممنوعات مطلقة',
    '- **صفر تلاعب مالي**: لا تعد بخصومات، لا تحجز مدفوع، لا تغيّر أسعار الخدمة.',
    '- المنصة **لا تأخذ عمولة** على الحلاقة أو المواعيد.',
    '- لا تلمس محافظ العملاء — محفظة المناوب تخص الحلاق فقط.',
    '- لا تختلق بيانات صالون حقيقي — في المختبر استخدم «صالون العرض» أو البيانات التي يعطيك إياها المالك.',
    '',
    '## أسلوبك الافتراضي',
    '- آداب سعودية تجارية دافئة: «يا عمنا»، «تفضل»، «بإذنك» — بدون مبالغة.',
    '- مع الحلاق: «وش مهام اليوم اللي راح تضيفها عشان أشتغل معك؟»',
    '- مع العميل: مختصر، محترم، يطمئن أن الحلاق سيرد قريباً.',
    '',
    '## قراءة الصور',
    '- بنر إعلاني: وضوح النص، شارة خصم، ملاءمة الجوال، اقتراحات تحسين.',
    '- معرض أعمال: حداثة الصور، تنوع الأعمال، تنبيه صور قديمة (+45 يوم).',
    '- لقطة شات: تقييم أسلوب الرد، لغة العميل، هل الاعتراض مناسب.',
    '- إعدادات/لوحة: شرح ما تراه للمالك بربطه بقدرات المناوب.',
    '',
    '## لقطة الأسطول الحية (قراءة فقط)',
    JSON.stringify(snapshot, null, 2),
    '',
    '## تعليمات الرد',
    `- اللغات المدعومة للاعتراض: ${formatSupportedLanguagesForPrompt()}.`,
    '- رد للمالك بالعربية ما لم يطلب محاكاة بلغة عميل محددة.',
    '- Markdown خفيف مسموح (**غامق**، قوائم) — لا JSON إلا إذا طُلب صراحة.',
    '- كن عملياً: اختبر، حاكِ، حلّل، واشرح — أنت في جلسة QA مع المالك.',
  ].join('\n');
}

export async function callDigitalShiftAdminLabVision(input: {
  system: string;
  userText: string;
  imageBase64?: string;
  imageMime?: string;
  conversationHistory?: DigitalShiftLabChatTurn[];
  timeoutMs?: number;
}): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY not configured on server');

  const model =
    (process.env.DIGITAL_SHIFT_LAB_OPENAI_MODEL ||
      process.env.DIGITAL_SHIFT_OPENAI_MODEL ||
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
    text: input.userText || 'حلّل المرفق في سياق المناوب الرقمي الذكي.',
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
        temperature: 0.45,
        max_tokens: 1800,
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
