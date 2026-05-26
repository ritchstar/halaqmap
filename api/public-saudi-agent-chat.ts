/**
 * public-saudi-agent-chat — وكيل «سعودي» الذكي
 *
 * وكيل ذكي متعدد اللغات بهوية سعودية أصيلة.
 * يعرف تاريخ المملكة، جغرافيتها، رؤية 2030، الفعاليات القادمة،
 * ويُحيل أسئلة حلاق ماب لمختصيها.
 *
 * يستخدم OpenAI GPT-4o مع system prompt محكم وأدوات متخصصة.
 */

export const config = { maxDuration: 60 };

type Turn = { role: 'user' | 'assistant'; content: string };

type Tool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store' },
  });
}

function parseHistory(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const role = o.role === 'assistant' ? 'assistant' : o.role === 'user' ? 'user' : null;
      const content = String(o.content || '').trim();
      if (!role || !content) return null;
      return { role, content: content.slice(0, 3000) };
    })
    .filter((x): x is Turn => x !== null)
    .slice(-14);
}

// ─── قاعدة معرفة ZATCA / حدود المملكة الجغرافية ────────────────────────────
const KSA_REGIONS_BRIEF = `
المناطق الإدارية الثلاث عشرة في المملكة العربية السعودية:
1. الرياض (عاصمة المملكة) 2. مكة المكرمة (الحرم المكي الشريف) 3. المدينة المنورة 
4. القصيم (بريدة وعنيزة) 5. المنطقة الشرقية (الدمام والقطيف والأحساء) 
6. عسير (أبها — المنطقة السياحية الجبلية) 7. تبوك (العُلا ونيوم وخليج العقبة) 
8. حائل 9. الحدود الشمالية (عرعر) 10. الجوف (سكاكا — زراعة الزيتون) 
11. جازان 12. نجران 13. الباحة.
`;

const KSA_HISTORY_BRIEF = `
التاريخ السعودي بالتسلسل:
• الدولة السعودية الأولى (١١٥٧هـ/١٧٤٤م): تحالف الشيخ محمد بن عبدالوهاب مع الأمير محمد بن سعود في الدرعية.
• الدولة السعودية الثانية (١٢٤٠هـ/١٨٢٤م): عودة الحكم السعودي وعاصمتها الرياض.
• الدولة السعودية الثالثة (١٣١٩هـ/١٩٠٢م): الملك المؤسس عبدالعزيز بن عبدالرحمن آل سعود يُعيد توحيد المملكة ويُعلنها عام ١٣٥١هـ/١٩٣٢م.
• العهد الزاهر: الملك عبدالعزيز ← سعود ← فيصل (النهضة والأمم المتحدة) ← خالد ← فهد (طفرة النفط) ← عبدالله (الإصلاح والتطوير) ← سلمان (رؤية ٢٠٣٠ بقيادة ولي العهد الأمير محمد بن سلمان).
`;

const KSA_VISION_EVENTS_BRIEF = `
رؤية المملكة ٢٠٣٠ والأحداث الكبرى القادمة:
• إكسبو ٢٠٣٠ الرياض: أول معرض دولي عالمي في المنطقة (أكتوبر ٢٠٣٠).
• كأس العالم فيفا ٢٠٣٤: المملكة العربية السعودية تستضيف البطولة على مستوى العالم.
• نيوم (NEOM): مدينة المستقبل في تبوك — ذا لاين، تروجينا (الألعاب الشتوية ٢٠٢٩)، سينداﻻ.
• الدرعية: الحي التاريخي يتحول لوجهة عالمية — مهرجان الدرعية السنوي.
• القدية: مدينة الترفيه الأضخم في العالم قرب الرياض.
• أرامكو وسوق الأسهم: اقتصاد متنوع يستهدف ١ تريليون دولار ناتج محلي بحلول ٢٠٣٠.
• السياحة: فيزا الزيارة الإلكترونية، الحج والعمرة، مناطق التراث (العُلا/الحِجر/مدائن صالح).
`;

const HALAQMAP_BRIEF = `
منصة حلاق ماب: مزوّد حلول تقنية B2B سعودي متخصص في قطاع الحلاقة.
- تربط الصالونات بالزبائن جغرافياً عبر "نظام الاستجابة الذكية" (On-Demand Visibility).
- ثلاث باقات: برونزي ١٠٠ ر.س / ذهبي ١٥٠ ر.س / ماسي ٢٠٠ ر.س — لمدة ٣٠ يوماً.
- لا عمولة على خدمات الحلاقة — رخصة برمجية صرفة.
- إضافة المكتب الخاص: مساعد داخلي + مناوب شات ذكي بـ٧ لغات (+٢٥ ر.س مع الماسي).
- لأسئلة الانضمام والتفاصيل: مدير المبيعات B2B في صفحات الشركاء.
`;

// ─── System Prompt الجوهري ────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  return `أنت **«سعودي»** 🇸🇦 — الصديق الذكي والمرافق الوطني السعودي.

اكتب بالعربية الواضحة، اتجاه RTL، علامات الترقيم في نهاية الجملة العربية فقط.
ضع أي مصطلح إنجليزي بين علامتي \`backtick\` أو على سطر مستقل.
لا تبدأ الفقرة العربية برقم لاتيني أو علامة Markdown مثل ###.

══════════════════════════
شخصيتك وهويتك (لا تتغيّر أبداً):
══════════════════════════
- سعودي الروح والكيان — تمثّل الكرم والأصالة والحضارة العربية السعودية
- أسلوبك: اللهجة السعودية البيضاء المفهومة لجميع المناطق
  («يا هلا والله ومسهلا»، «أبشر بسعدك»، «سم طال عمرك»، «زين وما قصّر»، «الله يوفقك»)
- ضاحك خفيف الظل — تُدخل البهجة بلطف
- محب لوطنه — تتحدث عن المملكة بفخر واعتزاز حقيقي
- صديق للجميع — تتعامل مع الزائر كصديق قديم لا كروبوت

══════════════════════════
قاعدة اللغات:
══════════════════════════
- العربية → اللهجة السعودية البيضاء الأصيلة (ممنوع الفصحى الجافة)
- الإنجليزية → جاوب بإنجليزية سعودية دافئة ومحترفة
- أي لغة أخرى (أوردو، فرنسية، تركية…) → جاوب بنفس اللغة مع الحفاظ على الروح السعودية الكريمة
- إذا خلط المستخدم لغات → اتبع نفس الخلط

══════════════════════════
معرفتك الشاملة:
══════════════════════════

## التاريخ السعودي
${KSA_HISTORY_BRIEF}

## الجغرافيا والمناطق
${KSA_REGIONS_BRIEF}

## رؤية ٢٠٣٠ والفعاليات الكبرى
${KSA_VISION_EVENTS_BRIEF}

## رموز الوطن والثقافة
- الفيصلية والمملكة (برجا الرياض) · الكعبة المشرفة والمسجد النبوي
- الصقر الوطني رمز القوة والسمو · النخلة رمز الكرم والعطاء · السيف رمز العدل
- الشعراء: أحمد الجابر · محمد الشيبان · طلال مداح · محمد عبده · عبدالمجيد عبدالله
- الرياضة: نادي الهلال والنصر والاتحاد والأهلي · الهيئة العامة للرياضة
- الأكلات: الكبسة · المطبّق · الجريش · المندي · الهريس
- الأزياء: الثوب والغترة والعقال للرجال · العباءة المطرّزة للسيدات
- المهرجانات: ليلة الهوية الوطنية ٢٣ سبتمبر · موسم الرياض · صيف السعودية · موسم الدرعية

## حلاق ماب
${HALAQMAP_BRIEF}

══════════════════════════
قواعد التحويل:
══════════════════════════
- أسئلة الانضمام لحلاق ماب → «هذي تخصص مدير المبيعات، كلّمه مباشرة من صفحة الشركاء — الزر الذهبي»
- أسئلة قانونية أو ضريبية → «تفضل تتواصل مع مختص مرخّص — أنا أُرشّد وما أُفتي قانونياً»
- أسئلة طبية أو حساسة → أحيل للجهات المختصة بلطف

══════════════════════════
أسلوب الردود:
══════════════════════════
- افتح بترحيب دافئ في الرد الأول فقط
- ردود متوسطة الطول — لا مختصرة ولا مطوّلة مملة
- استخدم الإيموجي بشكل طبيعي: 🇸🇦 🌴 🦅 ☕ 🏔️
- عند سرد القصص التاريخية: أضف تفاصيل حية ومشوّقة
- لا تكذب أبداً — إذا لم تعرف قل «والله ما عندي معلومة دقيقة عن هذي النقطة، أنصحك تراجع المصدر الرسمي»
- لا تنتقد أي حكومة أو دولة
`;
}

// ─── استدعاء OpenAI مع أدوات ────────────────────────────────────────────────
async function callOpenAI(
  systemPrompt: string,
  history: Turn[],
  userMsg: string,
): Promise<string> {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) return 'يا هلا! الخدمة مؤقتاً غير متاحة. 🙏';

  const tools: Tool[] = [
    {
      name: 'get_ksa_region_info',
      description: 'يجلب معلومات تفصيلية عن منطقة أو مدينة سعودية محددة',
      parameters: {
        type: 'object',
        properties: {
          region: { type: 'string', description: 'اسم المنطقة أو المدينة السعودية بالعربية' },
        },
        required: ['region'],
      },
    },
    {
      name: 'get_ksa_event_details',
      description: 'يجلب تفاصيل فعالية أو حدث سعودي كبير (إكسبو، كأس العالم، نيوم، إلخ)',
      parameters: {
        type: 'object',
        properties: {
          event: { type: 'string', description: 'اسم الفعالية أو المشروع' },
        },
        required: ['event'],
      },
    },
  ];

  // تعريفات أدوات الاستجابة الداخلية
  const toolResponses: Record<string, (args: Record<string, string>) => string> = {
    get_ksa_region_info: ({ region }) => {
      const regionData: Record<string, string> = {
        'الرياض': 'الرياض عاصمة المملكة وأكبر مدنها — تضم برج المملكة والفيصلية والدرعية التاريخية وسوق البطحاء وغيرها. فيها أكثر من ٨ ملايين نسمة وتتوسّع بمشاريع ضخمة كالقدية وسدير وغيرها.',
        'جدة': 'جدة عروس البحر الأحمر — ميناء تجاري تاريخي. فيها كورنيش جدة الشهير والبلد التاريخي (تراث يونيسكو) وبرج المملكة ومركز سعودي كبير.',
        'مكة': 'مكة المكرمة أم القرى وأشرف البقاع — قبلة المسلمين. الكعبة المشرفة والمسجد الحرام وجبل النور وجبل ثور وعرفات.',
        'المدينة': 'المدينة المنورة المضيئة بنور النبوة — فيها المسجد النبوي الشريف والبقيع ومسجد قباء أول مسجد في الإسلام.',
        'العلا': 'العُلا جوهرة التاريخ — مدائن صالح (الحِجر) تراث يونيسكو وجبال الحجر الوردي والواحات الخضراء. وجهة سياحية عالمية متنامية.',
        'أبها': 'أبها عاصمة عسير — تُعرف بـ"سقف المملكة" لارتفاعها وطقسها المعتدل وتلالها الخضراء وشلالات وسوق الاثنين الشهير.',
        'نيوم': 'نيوم مدينة المستقبل في تبوك — تضم ذا لاين (مدينة لا شوارع فيها) وتروجينا (المنتجع الجبلي الشتوي) وسينداﻻ (الجزيرة السياحية).',
        'الدمام': 'الدمام عاصمة المنطقة الشرقية — قريبة من الأحساء (أكبر واحة في العالم) وتاروت وجزيرة البحرين عبر الجسر.',
      };
      const key = Object.keys(regionData).find((k) => region.includes(k));
      return key ? regionData[key] : `${region} — منطقة سعودية مليئة بالتاريخ والموارد. اسأل عن جانب محدد وأفيدك أكثر.`;
    },
    get_ksa_event_details: ({ event }) => {
      const ev = event.toLowerCase();
      if (ev.includes('إكسبو') || ev.includes('expo')) {
        return 'إكسبو ٢٠٣٠ الرياض: أول معرض دولي عالمي في الشرق الأوسط. الشعار: "حضارة قادمة — حقبة المستقبل". يُقام من أكتوبر ٢٠٣٠ لعدة أشهر ويتوقع استقطاب أكثر من ٤٠ مليون زيارة.';
      }
      if (ev.includes('كأس العالم') || ev.includes('فيفا') || ev.includes('world cup')) {
        return 'كأس العالم فيفا ٢٠٣٤ في المملكة العربية السعودية: مسابقة كروية بطولة الكرة الأكبر عالمياً. ملاعب ضخمة في الرياض وجدة ومدن أخرى. المملكة تستعد بمنشآت عالمية المستوى.';
      }
      if (ev.includes('نيوم') || ev.includes('neom')) {
        return 'نيوم: أضخم مشروع تطوير في تاريخ المملكة. ذا لاين — مدينة خطية بدون سيارات. تروجينا — منتجع جبلي لأول دورة ألعاب شتوية ٢٠٢٩. سينداﻻ — جزيرة سياحية فاخرة. مساحة تفوق بلجيكا.';
      }
      if (ev.includes('قدية') || ev.includes('qiddiya')) {
        return 'القدية مدينة الترفيه والرياضة والفنون — تقع غرب الرياض. فيها حلبة فورمولا١ وألعاب مائية ومدينة موسيقى وملاهٍ ومرافق رياضية ضخمة.';
      }
      if (ev.includes('رؤية') || ev.includes('vision')) {
        return 'رؤية ٢٠٣٠: أجندة التحول الوطني التي أطلقها ولي العهد الأمير محمد بن سلمان عام ٢٠١٦. تستهدف تنويع مصادر الدخل، تطوير قطاعات غير نفطية، تمكين المرأة والشباب، تنشيط السياحة والترفيه.';
      }
      return `${event} — حدث سعودي مهم. أخبرني بتفاصيل أكثر وأزيدك معلومات دقيقة.`;
    },
  };

  const messages: { role: string; content: string }[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMsg },
  ];

  const requestBody = {
    model: 'gpt-4o',
    messages,
    tools: tools.map((t) => ({
      type: 'function',
      function: { name: t.name, description: t.description, parameters: t.parameters },
    })),
    tool_choice: 'auto',
    temperature: 0.75,
    max_tokens: 1200,
  };

  // ── الاستدعاء الأول ──────────────────────────────────────────────────────
  let res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(requestBody),
  });
  let data = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    choices?: {
      message?: {
        content?: string;
        tool_calls?: { id: string; function: { name: string; arguments: string } }[];
      };
    }[];
  };
  if (!res.ok) throw new Error(data.error?.message || `OpenAI HTTP ${res.status}`);

  const firstChoice = data.choices?.[0]?.message;

  // ── معالجة أدوات إن طُلبت ────────────────────────────────────────────────
  if (firstChoice?.tool_calls?.length) {
    const toolMessages: { role: string; content: string; tool_call_id?: string; name?: string }[] = [
      { role: 'assistant', content: firstChoice.content || '', ...{ tool_calls: firstChoice.tool_calls } },
    ];

    for (const tc of firstChoice.tool_calls) {
      const fnName = tc.function.name;
      let args: Record<string, string> = {};
      try { args = JSON.parse(tc.function.arguments) as Record<string, string>; } catch { /* ignore */ }
      const handler = toolResponses[fnName];
      const result = handler ? handler(args) : 'لا توجد معلومات متاحة حالياً.';
      toolMessages.push({ role: 'tool', tool_call_id: tc.id, name: fnName, content: result });
    }

    // استدعاء ثانٍ بعد أدوات
    const secondRequest = { ...requestBody, messages: [...messages, ...toolMessages], tools: undefined, tool_choice: undefined };
    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(secondRequest),
    });
    data = (await res.json().catch(() => ({}))) as typeof data;
    if (!res.ok) throw new Error(data.error?.message || `OpenAI HTTP ${res.status}`);
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty model response');
  return text;
}

// ─── Handlers ────────────────────────────────────────────────────────────────
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' },
  });
}

export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const msg = String(body.message ?? '').trim();
  if (!msg || msg.length < 1) return json({ error: 'رسالة فارغة' }, 400);
  if (msg.length > 2000) return json({ error: 'الرسالة طويلة' }, 400);

  const history = parseHistory(body.history);
  const systemPrompt = buildSystemPrompt();

  try {
    const reply = await callOpenAI(systemPrompt, history, msg);
    return json({ reply });
  } catch (e) {
    console.error('[saudi-agent]', e);
    return json({ error: e instanceof Error ? e.message : 'تعذر الرد — عاود المحاولة.' }, 500);
  }
}
