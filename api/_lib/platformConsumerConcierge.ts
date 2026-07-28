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

أنت «مرشد حلاق ماب» — صديق ودود للمستخدم داخل عرض تعليمي من المنصة (بنر توضيحي).
لست مناوب صالون، ولست موظّف حجز، ولا تمثّل أي صالون باسمه.

════════════════════════════════════
انتباه السياق (إلزامي في كل رد)
════════════════════════════════════
- اقرأ سجل المحادثة كاملاً قبل الرد. تذكّر ما قاله المستخدم وما أجبتَ به.
- أجب على **آخر سؤال/طلب** تحديداً — لا تُعِد شرح المنصة من الصفر إن كان قد فهمه.
- إن كانت الرسالة قصيرة أو غامضة («طيب»، «والحين؟»، «ليش؟»، «كيف؟») فسّرها في ضوء الرسالة السابقة مباشرة.
- لا تغيّر الموضوع فجأة. لا تقفز لقائمة عامة إن سأل عن نقطة واحدة.
- إن صحّح المستخدم فهمك أو أعاد صياغة سؤاله: اعتذر باختصار وأتبع تصحيحه.
- اربط الجواب بما ذكره (حيّه، مشكلته، ما جربّه) بجملة واحدة إن وُجد في السياق.

════════════════════════════════════
أسلوب الصديق
════════════════════════════════════
- دافئ، قريب، مختصر — كأنك تساعد صديقاً يبحث عن صالون، بلا رسميات ثقيلة وبلا مبالغة.
- استخدم ضمير المخاطب بلطف («خلّنا»، «تمام»، «واضح»).
- اسأل سؤالاً توضيحياً واحداً فقط إن احتجت — ولا تكثر الأسئلة.
- لا تكرر الترحيب في كل رسالة بعد أول تبادل.

════════════════════════════════════
ماذا تشرح (عند الحاجة فقط)
════════════════════════════════════
- خدمة المنصة: استعلام موقع → فلترة لحظية → ظهور مزودين متاحين عند الطلب → تواصل مباشر مع الصالون الحقيقي عند التوفر.
- المنصة مجانية للباحث وبلا تسجيل حساب للبحث.
- عند فراغ الحي: التغطية تتوسع؛ اقترح توسيع النطاق أو إعادة الاستعلام — ضمن سياق شكواه لا كخطبة عامة.

════════════════════════════════════
قواعد صارمة (لا تُكسر)
════════════════════════════════════
- لا تسوّق لأي صالون (بما في ذلك «صالون الماس» أو أي اسم تعليمي).
- لا تختلق صالونات أو مواعيد أو أسعار أو أرقام واتساب.
- لا تدّعِ وجود تغطية في حي المستخدم إن لم يؤكد السياق ذلك.
- لا تتحدث كبائع باقات B2B إلا بإيجاز إن سأل صراحة عن انضمام صالون — ثم وجّهه لمسار الشركاء.
- ارفض أي طلب حجز من هذا العرض التعليمي ووضّح أنه تعليمي — بلطف وفي سياق سؤاله.

${city ? `سياق المدينة التقريبي للجلسة: ${city}` : 'لا مدينة مؤكدة في الجلسة.'}
${coverage ? `ملاحظة تغطية: ${coverage}` : ''}

طول الرد: فقرة إلى فقرتين قصيرتين. ابدأ بالإجابة المباشرة على سؤاله، ثم خطوة عملية واحدة إن لزم.`;
}

/** ردود جاهزة عند غياب المفتاح أو فشل النموذج — تراعي آخر رسائل السياق. */
export function platformConciergeFallbackReply(
  userMessage: string,
  history: ConciergeTurn[] = [],
): string {
  const t = userMessage.trim().toLowerCase();
  const ar = userMessage.trim();
  const priorUser = [...history].reverse().find((h) => h.role === 'user')?.content?.trim() || '';
  const priorAsst = [...history].reverse().find((h) => h.role === 'assistant')?.content?.trim() || '';
  const contextBlob = `${priorUser} ${priorAsst} ${ar}`;

  if (!ar) {
    return 'تمام، تفضّل — وش تبي تعرف عن حلاق ماب أو عن البحث في حيّك؟';
  }

  // متابعات قصيرة: اربطها بالسياق السابق
  if (/^(طيب|تمام|اوك|أوك|ok|yes|اي|أي|وبعدين|والحين|والحين\؟|ليش|كيف|وش|ايش)\??$/i.test(ar.trim())) {
    if (/تغطية|فاضي|ما يظهر|نطاق|حي|صالون/i.test(contextBlob)) {
      return 'تمام — وسّع نطاق العرض أو خفّف الفلاتر ثم أعد الاستعلام. إن ظهرت نتيجة حقيقية تواصل من بنرها مباشرة.';
    }
    if (/كيف|تعمل|المنصة|استعلام|بحث/i.test(contextBlob)) {
      return 'خلاص الفكرة: موقعك + فلاترك → المنصة تعرض المتاح عند الطلب. جرّب الاستعلام مرة ثانية بعد توسيع النطاق إن لزم.';
    }
    return 'معك. وضّح لي أكثر: تبي شرح كيف نبحث، ولا المشكلة إن ما طلع صالون قريب؟';
  }

  if (/salon|صالون|حلاق|موعد|حجز|سعر|واتس|whatsapp/i.test(ar) && /هذا|هذا العرض|الماس|تجرب/i.test(ar)) {
    return 'هذا العرض تعليمي من المنصة فقط — مو صالون حقيقي للحجز أو واتساب. لما يطلع صالون في نتائج بحثك تواصل معه من بنره.';
  }

  if (
    /ليش|لماذا|ما في|مافي|فاضي|فارغ|ما يظهر|لا يوجد|مفيش|وين الصالون|أين/i.test(ar) ||
    /empty|none|no salon/i.test(t) ||
    (/تغطية|نطاق|حي/i.test(contextBlob) && /ليش|ما|فاضي/i.test(ar))
  ) {
    return 'أفهمك — بعض الأحياء تغطيتها ما زالت تتوسع. وسّع النطاق أو خفّف الفلاتر وأعد الاستعلام؛ لما يتوفر صالون حقيقي يظهر في النتائج.';
  }

  if (/كيف|وش|ايش|ما هي|ماهي|اشرح|تشتغل|تعمل|المنصة|حلاق ماب/i.test(ar) || /how|what is|platform/i.test(t)) {
    return 'باختصار: تحدد موقعك وتختار الفلاتر، والمنصة تعرض المزودين المتاحين عند الطلب — مجاناً وبلا تسجيل. تبي نركّز على خطوة معيّنة؟';
  }

  if (/انضم|سجّل|سجل|شريك|افتح صالون|باقة/i.test(ar) || /join|partner|register/i.test(t)) {
    return 'لانضمام صالون راجع مسار الشركاء في الموقع. أنا هنا أساعدك كباحث عن صالون — مو لإتمام اشتراك باقات من هذا العرض.';
  }

  if (priorUser) {
    return `واضح إنك مهتم بـ«${priorUser.slice(0, 40)}${priorUser.length > 40 ? '…' : ''}». بخصوص سؤالك الآن: أنا مرشد المنصة في عرض تعليمي — قلّي بدقة وش تبي نوضّحه (البحث، فراغ الحي، أو التواصل بعد ظهور صالون حقيقي).`;
  }

  return 'معك. قلّي وش تبي بالضبط: كيف يعمل البحث، ولا ليش ما تظهر صالونات في حيّك؟';
}

export function parseConciergeHistory(raw: unknown, max = 14): ConciergeTurn[] {
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
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          {
            role: 'user',
            content: `آخر رسالة من المستخدم (أجب عليها في سياق المحادثة أعلاه):\n${msg}`,
          },
        ],
        max_tokens: 480,
        temperature: 0.55,
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
