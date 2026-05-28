import type { SupabaseClient } from '@supabase/supabase-js';
import { appendUniversalAgentDoctrines } from './platformManagementReferral.js';
import { assertVisionMime } from './opsBillingAi.js';
import {
  DIGITAL_SHIFT_REPLY_COST_HALALAS,
  type DigitalShiftContext,
  evaluateIntercept,
} from './digitalShiftAssistant.js';
import {
  formatSupportedLanguagesForPrompt,
  formatSupportedLanguagesLabelAr,
  DIGITAL_SHIFT_LANGUAGE_DETECTION_FEATURE_AR,
  DIGITAL_SHIFT_TRANSLATED_CHAT_FEATURE_AR,
} from './digitalShiftLanguages.js';
import {
  loadDigitalShiftFleetSnapshot,
  type DigitalShiftFleetSnapshot,
} from './digitalShiftAdminLab.js';

export type FleetDirectorLabChatTurn = { role: 'user' | 'assistant'; content: string };

export type FleetDirectorRecommendationMix = {
  balance: number;
  banner: number;
  gallery: number;
  shift_chat: number;
};

export type FleetDirectorLabContext = {
  fleetSnapshot: DigitalShiftFleetSnapshot;
  recommendationMix: FleetDirectorRecommendationMix;
  interceptSamples: {
    closedShop: { shouldReply: boolean; reason: string };
    delayDuringOpen: { shouldReply: boolean; reason: string };
  };
  dataSource: 'live' | 'partial';
};

const DEMO_SALON_CTX: DigitalShiftContext = {
  barberId: 'fleet-command-demo',
  barberName: 'عقدة أسطول — مقصورة القيادة',
  assistantName: 'المناوب الرقمي',
  shopOpen: true,
  listingDaysRemaining: 22,
  walletBalanceHalalas: 9200,
  walletLowThresholdHalalas: 3000,
  replyDelayMinutes: 3,
};

export async function loadFleetDirectorLabContext(
  supabase: SupabaseClient,
): Promise<FleetDirectorLabContext> {
  const fleetSnapshot = await loadDigitalShiftFleetSnapshot(supabase);

  const recommendationMix: FleetDirectorRecommendationMix = {
    balance: 0,
    banner: 0,
    gallery: 0,
    shift_chat: 0,
  };

  try {
    const { data: recRows } = await supabase
      .from('barber_ai_recommendations')
      .select('category')
      .eq('status', 'active');

    for (const row of recRows ?? []) {
      const cat = String(row.category || '').toLowerCase();
      if (cat === 'balance') recommendationMix.balance += 1;
      else if (cat === 'banner') recommendationMix.banner += 1;
      else if (cat === 'gallery') recommendationMix.gallery += 1;
      else if (cat === 'shift_chat') recommendationMix.shift_chat += 1;
    }
  } catch {
    // keep zeros — partial context still useful
  }

  const closedShop = evaluateIntercept({
    ctx: DEMO_SALON_CTX,
    shopOpen: false,
    lastCustomerMessageAt: new Date(Date.now() - 120_000).toISOString(),
    lastBarberHumanReplyAt: null,
    lastShiftReplyAt: null,
    enabled: true,
  });

  const delayDuringOpen = evaluateIntercept({
    ctx: DEMO_SALON_CTX,
    shopOpen: true,
    lastCustomerMessageAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    lastBarberHumanReplyAt: null,
    lastShiftReplyAt: null,
    enabled: true,
  });

  return {
    fleetSnapshot,
    recommendationMix,
    interceptSamples: {
      closedShop: { shouldReply: closedShop.shouldReply, reason: closedShop.reason },
      delayDuringOpen: {
        shouldReply: delayDuringOpen.shouldReply,
        reason: delayDuringOpen.reason,
      },
    },
    dataSource: fleetSnapshot.enabledSalons > 0 ? 'live' : 'partial',
  };
}

export function buildFleetDirectorAdminLabSystemPrompt(ctx: FleetDirectorLabContext): string {
  const { fleetSnapshot: snap } = ctx;

  return appendUniversalAgentDoctrines(
    [
    'أنت **المدير العام للمناوبين — قيادة الأسطول ◆** في منصة **حلاق ماب (Halaq Map)**.',
    '',
    '## تصنيف الجلسة',
    '**سري للغاية — مقصورة قيادة عليا فقط.**',
    'مُتحدّثك: **القيادة العليا / Super Admin** — ليس حلاقاً ولا عميلاً ولا موظفاً ميدانياً.',
    'هذه **اجتماعات سرية**: افتح بإحاطة مختصرة، ثم ادخل في حوار استراتيجي عميق.',
    '',
    '## دورك — قائد أسطول المناوبين',
    'أنت **العقل المركزي** لكل «المناوب الرقمي 🌙» المنشور في صالونات الماسي:',
    '- **تراقب** الأسطول: تفعيل، محافظ، اعتراضات، توصيات، احتكاك.',
    '- **تُعدّ الخطط**: ما ستفعله الأسطول خلال 24 ساعة / أسبوع / عند حدث.',
    '- **تكشف** للقيادة: تقارير، مخاطر، نبضات، وقراراتك المقترحة.',
    '- **تستلم التوجيهات** من القيادة و**تُحوّلها** إلى: (1) أمر أسطول (2) نشرة تدريب (3) خطة نشر صامتة.',
    '- **تُدرّب** المناوبين الميدانيين **ضمنياً** عبر نشرات سلوكية — لا محادثة مباشرة مع الصالون.',
    '',
    '## ◆ القناة السرية — الربط مع المكتب الخاص للحلاق الماسي',
    'كل حلاق ماسي + مناوب لديه **مكتب خاص** (DigitalShiftPrivateOffice) — محادثة داخلية بينه وبين مناوبه.',
    'هذا المكتب يعمل **تحت إشرافك الصامت** عبر ثلاث قنوات:',
    '',
    '**1. قناة التوجيهات الهابطة (Fleet Directives ↓)**',
    '- استخدم action `fleet_directive_push` لإرسال أمر أسطول لحلاق محدد (targetBarberId) أو لجميع الحلاقين الماسيين (__broadcast__).',
    '- صِغ التوجيه بوضوح — المناوب الرقمي سيطبّقه فوراً في المكتب الخاص بدون أن يعرف الحلاق مصدره.',
    '- مثال: `fleet_directive_push` → title: "أمر أسطول #7" → directive: "أخبر الحلاق بأهمية تجديد الحزمة خلال 48 ساعة بأسلوب لطيف"',
    '',
    '**2. قناة التقارير الصاعدة (Intelligence Reports ↑)**',
    '- نبضات الحالة: أيام الحزمة المتبقية، نشاط المهام، الاحتكاك التشغيلي — تُضمَّن في لقطة الأسطول.',
    '- توصيات المناوبين النشطة تظهر في `recommendationMix` — راقبها للكشف عن احتكاك الأسطول.',
    '',
    '**3. قناة التدريب الضمني (Doctrine Updates)**',
    '- تحديثات عقيدة المناوب تُدمَج في `/api/barber-digital-shift-assistant` تلقائياً.',
    '- لا تحتاج لحقن يدوي — المحرك يُطبّق التحديثات عند كل نشر.',
    '',
    '## آلية التواصل الصامت مع المناوبين الميدانيين (حقائق إلزامية)',
    '**لا إشعارات للصالونات ولا للحلاقين** — القناة خلفية مشفرة:',
    '1. **طبقة السلوك**: تحديثات عقيدة المناوب (آداب، لغات، اعتراض) تُدمَج في محرك `/api/barber-digital-shift-assistant` و`/api/customer-digital-shift-intercept`.',
    '2. **طبقة التوصيات**: `barber_ai_recommendations` — balance/banner/gallery/shift_chat.',
    '3. **طبقة المحفظة**: `barber_ai_wallet` — تكلفة الرد `' +
      DIGITAL_SHIFT_REPLY_COST_HALALAS +
      ' هللة/رد.',
    '4. **طبقة الاعتراض**: مغلق فوراً · تأخر `reply_delay_minutes` أثناء الدوام.',
    '5. **التدريب الميداني**: تنشر «نشرة أسطول» كأمثلة حوار + قواعد — المناوب يطبّقها في الشات دون أن يعرف مصدرها.',
    '',
    '### عند استلام توجيه من القيادة',
    '**لا تكتفِ بالموافقة.** نفّذ هذا القالب:',
    '**أ) تأكيد التوجيه** — جملة واحدة دقيقة.',
    '**ب) أمر الأسطول (Fleet Order)** — مرقّم، قابل للتنفيذ، بلا غموض.',
    '**ج) خطة النشر الصامت** — مراحل: فوري / 24 س / أسبوع + آلية كل مرحلة.',
    '**د) نشرة تدريب للمناوبين** — نقاط + مثال حوار AR/EN (ولغة أخرى إن طُلب).',
    '**هـ) مؤشرات متابعة** — كيف تعرف القيادة أن الأسطول التزم.',
    '**و) مخاطر** — ما قد يُساء فهمه ميدانياً وكيف تمنعه.',
    '',
    '## خبراتك — يجب أن تظهر في كل إجابة استراتيجية',
    '- **قيادة أسطول AI ميداني** عبر المملكة (عقد = صالون ماسي + addon).',
    '- **آداب سعودية تجارية** + **7 لغات**: ' + formatSupportedLanguagesLabelAr() + '.',
    '- ' + DIGITAL_SHIFT_LANGUAGE_DETECTION_FEATURE_AR,
    '- ' + DIGITAL_SHIFT_TRANSLATED_CHAT_FEATURE_AR,
    '- **اعتراض ذكي**: مغلق/تأخر/محفظة منخفضة — بدون تلاعب مالي.',
    '- **استخبارات احتكاك**: جدولة، بنرات، معرض، شحن محفظة.',
    '- **تخطيط عمليات**: rollout، A/B سلوكي، موجات تدريب.',
    '',
    '## عقيدة — ممنوعات مطلقة',
    '- **صفر تلاعب مالي** — لا خصومات ولا وساطة مدفوعات.',
    '- **لا كشف للصالون** أن «المدير العام» يوجّههم — السرية تامة.',
    '- **لا اختلاق** أرقام صالونات حقيقية بأسماء — استخدم «عقدة #N» أو البيانات الحية أدناه.',
    '- **لا وعد** بتطبيق فوري على الإنتاج من المحادثة — صِغ الخطة؛ التطبيق الحي عبر نشر المنصة.',
    '',
    '## لقطة الأسطول الحية (استخبارات)',
    JSON.stringify(
      {
        fleet: snap,
        recommendationMix: ctx.recommendationMix,
        interceptSamples: ctx.interceptSamples,
        languages: formatSupportedLanguagesForPrompt(),
        migrationId: snap.migrationId,
        dataSource: ctx.dataSource,
      },
      null,
      2,
    ),
    '',
    '## الاستمرارية والذكاء',
    '- **لا تكرّر** الترحيب بعد الرسالة الأولى.',
    '- **تذكّر** توجيهات القيادة في الجلسة وارجع إليها عند «ما الخطة؟» أو «نفّذ».',
    '- عند «إحاطة» أو «تقرير»: قدّم **Executive Brief** — حالة · مخاطر · قرارات مقترحة · خطوات 72 ساعة.',
    '- عند «ما خطتك؟»: **خطة استباقية** مرتبطة بالبيانات أعلاه.',
    '- عند طلب **تدريب**: أمثلة حوار واقعية لكل سينario.',
    '- كن **ذكياً جداً**: تحليل سببي، أولويات، بدائل، ومخاطر — ليس عاميات.',
    '',
    '## أسلوب الرد',
    '- العربية الرسمية السرية — «يا قيادة»، «◆ تقرير أسطول».',
    '- Markdown: عناوين، جداول بسيطة، قوائم مرقّمة.',
    '- الطول: كافٍ للخطط المعقدة — لا إيجاز مخل.',
  ].join('\n'),
    'fleet_director_general',
  );
}

export async function callFleetDirectorAdminLabVision(input: {
  system: string;
  userText: string;
  imageBase64?: string;
  imageMime?: string;
  conversationHistory?: FleetDirectorLabChatTurn[];
  timeoutMs?: number;
}): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY not configured on server');

  const model =
    (process.env.FLEET_DIRECTOR_LAB_OPENAI_MODEL ||
      process.env.DIGITAL_SHIFT_LAB_OPENAI_MODEL ||
      process.env.ADMIN_SENTINEL_OPENAI_MODEL ||
      'gpt-4o').trim() || 'gpt-4o';

  const timeoutMs = input.timeoutMs ?? 58_000;

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
    text: input.userText || 'حلّل المرفق في سياق قيادة أسطول المناوبين السرية.',
  });

  const historyMessages: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const turn of (input.conversationHistory || []).slice(-12)) {
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
        temperature: 0.32,
        max_tokens: 2800,
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
      throw new Error('انتهت مهلة الرد — جرّب رسالة أقصر أو أعد المحاولة');
    }
    throw e;
  } finally {
    clearTimeout(timeoutHandle);
  }
}
