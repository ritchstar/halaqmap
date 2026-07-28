/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مرشد المستهلك النهائي داخل البنر التوضيحي — بلا تسويق صالون وهمي.
 */
export type ConciergeTurn = { role: 'user' | 'assistant'; content: string };

const MS_AR =
  'اكتب بالعربية الفصيحة الواضحة، اتجاه RTL، علامات الترقيم في نهاية الجملة العربية فقط. ضع أي مصطلح إنجليزي بين علامتي `backtick` أو على سطر مستقل، ولا تخلطه داخل جملة عربية متّصلة. لا تبدأ الفقرة العربية برقم لاتيني أو علامة Markdown مثل `###`.';

export function buildPlatformConsumerConciergeSystemPrompt(input: {
  cityAr?: string | null;
  coverageHint?: string | null;
}): string {
  const city = (input.cityAr || '').trim().slice(0, 80);
  const coverage = (input.coverageHint || '').trim().slice(0, 200);
  return `${MS_AR}

أنت «مرشد حلاق ماب» — وكيل المنصة للمستهلك النهائي داخل عرض تعليمي (بنر توضيحي).
لست مناوب صالون، ولست موظّف حجز، ولا تمثّل أي صالون باسمه.

الهوية:
- ترحّب بالباحث عن صالون بلطف مهني مختصر.
- تشرح خدمة المنصة فقط: استعلام موقع → فلترة لحظية → ظهور مزودين متاحين عند الطلب → تواصل مباشر مع الصالون الحقيقي عند التوفر.
- المنصة مجانية للباحث وبلا تسجيل حساب للبحث.

قواعد صارمة (لا تُكسر):
- لا تسوّق لأي صالون (بما في ذلك «صالون الماس» أو أي اسم تعليمي).
- لا تختلق صالونات أو مواعيد أو أسعار أو أرقام واتساب.
- لا تدّعِ وجود تغطية في حي المستخدم إن لم يؤكد السياق ذلك.
- عند فراغ الحي أو قلة الصالونات: اعترف أن التغطية تتوسع، واقترح توسيع نطاق البحث أو إعادة الاستعلام لاحقاً أو مشاركة الرابط مع صاحب صالون إن سأل عن الانضمام.
- لا تتحدث كبائع باقات B2B إلا بإيجاز شديد إن سأل المستخدم صراحة عن انضمام صالون — ثم وجّهه لمسار الشركاء دون أسعار مفصّلة إلا إن لزم بجملة واحدة.
- ارفض أي طلب يبدو كحجز من هذا العرض التعليمي ووضّح أنه تعليمي.

${city ? `سياق المدينة التقريبي للجلسة: ${city}` : 'لا مدينة مؤكدة في الجلسة.'}
${coverage ? `ملاحظة تغطية: ${coverage}` : ''}

طول الرد: فقرتان قصيرتان كحد أقصى. اختم بخطوة عملية واحدة واضحة.`;
}

/** ردود جاهزة عند غياب المفتاح أو فشل النموذج. */
export function platformConciergeFallbackReply(userMessage: string): string {
  const t = userMessage.trim().toLowerCase();
  const ar = userMessage.trim();

  if (!ar) {
    return 'أهلاً بك. اسألني كيف تعمل حلاق ماب أو ماذا تفعل إن لم يظهر صالون قريب.';
  }

  if (/salon|صالون|حلاق|موعد|حجز|سعر|واتس|whatsapp/i.test(ar) && /هذا|هذا العرض|الماس|تجرب/i.test(ar)) {
    return 'هذا العرض تعليمي من المنصة فقط — ليس صالوناً حقيقياً للحجز أو واتساب. عند ظهور صالون في نتائج بحثك تواصل معه من بنره مباشرة.';
  }

  if (/ليش|لماذا|ما في|مافي|فاضي|فارغ|ما يظهر|لا يوجد|مفيش|وين الصالون|أين/i.test(ar) || /empty|none|no salon/i.test(t)) {
    return 'التغطية ما زالت تتوسع في بعض الأحياء. وسّع نطاق العرض أو خفّف الفلاتر ثم أعد الاستعلام — وعند توفر صالون حقيقي سيظهر في النتائج للتواصل المباشر.';
  }

  if (/كيف|وش|ايش|ما هي|ماهي|اشرح|تشتغل|تعمل|المنصة|حلاق ماب/i.test(ar) || /how|what is|platform/i.test(t)) {
    return 'حلاق ماب تعرض مزودي الخدمة المناسبين عند الطلب: تحدد موقعك، تختار الفلاتر، وتعالج المنصة الاستعلام لحظياً. عند التوفر تظهر بنرات حقيقية للتواصل — مجاناً وبلا تسجيل للباحث.';
  }

  if (/انضم|سجّل|سجل|شريك|افتح صالون|باقة/i.test(ar) || /join|partner|register/i.test(t)) {
    return 'لانضمام صالون راجع مسار الشركاء في الموقع. أنا هنا لإرشاد الباحث عن صالون — وليس لإتمام اشتراك باقات من هذا العرض التعليمي.';
  }

  return 'أنا مرشد المنصة في عرض تعليمي. أشرح كيف يعمل البحث والظهور عند الطلب، وأساعدك إن كانت التغطية في حيّك ما زالت محدودة — دون حجز أو تسويق لصالون وهمي. ما الذي تود معرفته؟';
}

export function parseConciergeHistory(raw: unknown, max = 8): ConciergeTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const role = o.role === 'assistant' ? 'assistant' : o.role === 'user' ? 'user' : null;
      const content = String(o.content || '').trim();
      if (!role || !content) return null;
      return { role, content: content.slice(0, 1500) };
    })
    .filter((x): x is ConciergeTurn => x !== null)
    .slice(-max);
}

export async function callPlatformConciergeModel(
  systemPrompt: string,
  history: ConciergeTurn[],
  msg: string,
): Promise<string | null> {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.PLATFORM_CONCIERGE_MODEL?.trim() || 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: msg }],
        max_tokens: 420,
        temperature: 0.45,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch {
    return null;
  }
}
