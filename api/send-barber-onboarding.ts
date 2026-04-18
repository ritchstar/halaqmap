import { createClient } from '@supabase/supabase-js';

export const config = {
  maxDuration: 60,
};

type Tier = 'bronze' | 'gold' | 'diamond' | string;

type SinglePayload = {
  mode: 'single';
  barberName: string;
  barberEmail: string;
  tier?: Tier | null;
  /** اختياري — يُفضّل تمريره بعد الاعتماد لتسريع إرفاق QR دون جلب إضافي */
  barberId?: string;
  ratingInviteToken?: string;
  /** رقم طلب التسجيل (مثال HM-20260417-AB12CD) — مرجع الدعم */
  registrationOrderId?: string;
};

type BulkPayload = {
  mode: 'bulk_active';
  limit?: number;
};

type OnboardingBody = SinglePayload | BulkPayload;

type MailLinks = {
  /** أصل الموقع بدون شرطة مائلة أخيرة — لبناء روابط الصور والصفحات */
  siteBase: string;
  homeUrl: string;
  aboutUrl: string;
  registerUrl: string;
  privacyUrl: string;
  loginUrl: string;
  dashboardUrl: string;
  policyUrl: string;
  /** ملاحظات / شكاوى للإدارة — من BARBER_ADMIN_FEEDBACK_URL أو بريد */
  adminFeedbackUrl: string;
};

/** محتوى بريد التقييم + QR */
type RatingEmailContext = {
  ratingPageUrl: string;
  hasToken: boolean;
  qrPngBase64: string | null;
};

const RATING_QR_CONTENT_ID = 'halaqmap-rating-qr';

function buildRatingInviteUrlStatic(siteOrigin: string, barberId: string, token: string): string {
  const base = siteOrigin.replace(/\/+$/, '');
  const hashPath = `/rate/${encodeURIComponent(barberId)}?t=${encodeURIComponent(token)}`;
  return `${base}/#${hashPath}`;
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-supabase-anon',
    'Access-Control-Max-Age': '86400',
  };
}

function safeHost(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).host;
  } catch {
    return rawUrl;
  }
}

function tierLabelAr(tier: Tier | null | undefined): string {
  const t = String(tier || '').toLowerCase();
  if (t === 'diamond') return 'الماسي';
  if (t === 'gold') return 'الذهبي';
  return 'البرونزي';
}

/** للفقرات الشرطية في الرسالة */
function tierKey(tier: Tier | null | undefined): 'bronze' | 'gold' | 'diamond' {
  const t = String(tier || '').toLowerCase();
  if (t === 'gold') return 'gold';
  if (t === 'diamond') return 'diamond';
  return 'bronze';
}

function sanitizeBaseUrl(raw: string): string {
  return raw.replace(/\/+$/, '');
}

function getSiteBaseUrl(): string {
  const fromEnv =
    (process.env.VITE_SITE_ORIGIN || process.env.VITE_PUBLIC_APP_ORIGIN || process.env.PUBLIC_SITE_ORIGIN || '')
      .trim();
  if (fromEnv) return sanitizeBaseUrl(fromEnv);
  return 'https://www.halaqmap.com';
}

function getAdminFeedbackUrl(siteBase: string): string {
  const explicit = (process.env.BARBER_ADMIN_FEEDBACK_URL || '').trim();
  if (explicit) return explicit;
  const mail = (
    process.env.ADMIN_FEEDBACK_EMAIL ||
    process.env.BARBER_SUPPORT_EMAIL ||
    process.env.SUPPORT_EMAIL ||
    process.env.VITE_ADMIN_EMAIL ||
    ''
  ).trim();
  if (mail) {
    const sub = encodeURIComponent('ملاحظات / شكوى — حلاق ماب (حلاق)');
    const body = encodeURIComponent('اكتب اسم الصالون وبريدك المسجل، ثم تفاصيل طلبك:\n\n');
    return `mailto:${encodeURIComponent(mail)}?subject=${sub}&body=${body}`;
  }
  return `${sanitizeBaseUrl(siteBase)}/#/about`;
}

function buildLinks(baseUrl: string): MailLinks {
  const b = sanitizeBaseUrl(baseUrl);
  return {
    siteBase: b,
    homeUrl: `${b}/#/`,
    aboutUrl: `${b}/#/about`,
    registerUrl: `${b}/#/partners/register`,
    privacyUrl: `${b}/#/privacy`,
    loginUrl: `${b}/#/partners/login`,
    dashboardUrl: `${b}/#/barber/dashboard`,
    policyUrl: `${b}/#/partners/subscription-policy`,
    adminFeedbackUrl: getAdminFeedbackUrl(b),
  };
}

function logoPublicUrl(links: MailLinks): string {
  return `${links.siteBase}/images/halaqmap_logo_20260409_073322.png`;
}

/** سطر مساعدة اختياري من متغيرات البيئة (Vercel) */
function supportContactPlain(): string {
  const email = (process.env.BARBER_SUPPORT_EMAIL || process.env.SUPPORT_EMAIL || '').trim();
  if (email) return `للاستفسار: ${email}`;
  return 'لمساعدتك: زر موقع حلاق ماب من الرابط أدناه، ثم صفحة «من نحن» لمعلومات التواصل.';
}

function supportContactHtml(): string {
  const email = (process.env.BARBER_SUPPORT_EMAIL || process.env.SUPPORT_EMAIL || '').trim();
  if (email) {
    const safe = escapeHtml(email);
    const href = `mailto:${encodeURIComponent(email)}`;
    return `<p style="margin:0;font-size:14px;color:#475569;line-height:1.85">للاستفسار يمكنك مراسلتنا على: <a href="${escapeHtml(href)}" style="color:#0d9488;font-weight:700">${safe}</a></p>`;
  }
  return `<p style="margin:0;font-size:14px;color:#475569;line-height:1.85">لمساعدتك، زر <strong>الصفحة الرئيسية</strong> ثم <strong>من نحن</strong> لمعلومات التواصل.</p>`;
}

function siteLinksCardBody(links: MailLinks): string {
  const h = (u: string) => escapeHtml(u);
  return (
    '<p style="margin:0 0 8px;font-size:14px;color:#475569;line-height:1.85">احفظ هذه الروابط للوصول السريع إلى منصة حلاق ماب:</p>' +
    '<p style="margin:0;font-size:14px;line-height:2.1">' +
    '<a href="' +
    h(links.homeUrl) +
    '" style="color:#0d9488;font-weight:700">الرئيسية</a> · ' +
    '<a href="' +
    h(links.aboutUrl) +
    '" style="color:#0d9488;font-weight:700">من نحن</a> · ' +
    '<a href="' +
    h(links.registerUrl) +
    '" style="color:#0d9488;font-weight:700">طلب اشتراك</a> · ' +
    '<a href="' +
    h(links.privacyUrl) +
    '" style="color:#0d9488;font-weight:700">الخصوصية</a></p>'
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function loadBarberIdAndRatingToken(
  supabaseUrl: string,
  serviceRole: string,
  email: string,
): Promise<{ id: string; rating_invite_token: string | null } | null> {
  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const raw = email.trim();
  for (const addr of [raw, raw.toLowerCase()]) {
    const { data, error } = await supabase
      .from('barbers')
      .select('id, rating_invite_token')
      .eq('email', addr)
      .eq('is_active', true)
      .maybeSingle();
    if (error || !data) continue;
    return {
      id: String((data as { id: string }).id),
      rating_invite_token: (data as { rating_invite_token: string | null }).rating_invite_token,
    };
  }
  return null;
}

async function buildRatingEmailContext(
  siteBase: string,
  barberId: string | null,
  token: string | null,
): Promise<RatingEmailContext> {
  const tid = barberId?.trim() || '';
  const tok = token?.trim() || '';
  if (!tid || !tok) {
    return { ratingPageUrl: '', hasToken: false, qrPngBase64: null };
  }
  const ratingPageUrl = buildRatingInviteUrlStatic(siteBase, tid, tok);
  let qrPngBase64: string | null = null;
  try {
    const { default: QRCode } = await import('qrcode');
    const buf = await QRCode.toBuffer(ratingPageUrl, {
      type: 'png',
      width: 768,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#0f172a', light: '#ffffff' },
    });
    qrPngBase64 = buf.toString('base64');
  } catch {
    qrPngBase64 = null;
  }
  return { ratingPageUrl, hasToken: true, qrPngBase64 };
}

function emailCard(title: string, body: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;border-radius:14px;border:1px solid #e2e8f0;background:#ffffff"><tr><td style="padding:16px 18px"><p style="margin:0 0 10px;font-size:13px;font-weight:800;color:#0d9488;letter-spacing:0.02em">${title}</p><div style="font-size:14px;color:#334155;line-height:1.9">${body}</div></td></tr></table>`;
}

function ratingAndQrSectionHtml(ctx: RatingEmailContext): string {
  if (!ctx.hasToken) {
    return emailCard(
      'رمز التقييم لعملائك',
      '<p style="margin:0;font-size:14px;color:#475569;line-height:1.85">لم يُرفق رمز QR تلقائياً (تأكد من وجود <strong>رمز دعوة التقييم</strong> في حسابك). من لوحة التحكم ← <strong>QR والتقييمات</strong> اعرض الرمز أو انسخ الرابط للعميل. صفحة التقييم <strong>خاصة بصالونك</strong>؛ يستطيع العميل الوصول إليها وإعادة التقييم ضمن الضوابط الظاهرة في الصفحة.</p>',
    );
  }
  const urlEsc = escapeHtml(ctx.ratingPageUrl);
  const imgBlock =
    ctx.qrPngBase64 != null
      ? `<div style="text-align:center;margin:0 0 14px;padding:16px;background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0"><img src="cid:${RATING_QR_CONTENT_ID}" width="400" alt="رمز QR لتقييم الصالون" style="max-width:min(92vw,520px);width:100%;height:auto;display:inline-block;border-radius:8px" /><p style="margin:10px 0 0;font-size:12px;color:#64748b">حجم مناسب للعرض على <strong>آيباد</strong> أو شاشة في الصالون.</p></div>`
      : '<p style="margin:0 0 12px;font-size:13px;color:#92400e">تعذر توليد صورة الرمز؛ استخدم الرابط أدناه أو لوحة التحكم.</p>';
  return emailCard(
    'رمز QR لتقييم صالونك',
    `<p style="margin:0 0 12px;font-size:14px;color:#475569;line-height:1.9">يوجّه العميل إلى <strong>صفحة تقييم خاصة بصالونك</strong> على حلاق ماب. يمسح الرمز أو يفتح الرابط على جواله. <strong>إعادة التقييم</strong> متاحة ضمن القواعد المعروضة في الصفحة.</p>${imgBlock}<p style="margin:0 0 12px;font-size:14px;color:#475569;line-height:1.85"><strong>للعرض أمام العميل:</strong> آيباد بملء الشاشة، أو <strong>طباعة</strong> الملف المرفق (PNG) وتعليقه في المحل.</p><p style="margin:0"><a href="${urlEsc}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 18px;border-radius:10px;background:#0d9488;color:#fff;font-weight:700;text-decoration:none;font-size:14px">فتح / نسخ رابط التقييم</a></p><p style="margin:12px 0 0;font-size:12px;color:#94a3b8;word-break:break-all" dir="ltr">${urlEsc}</p>`,
  );
}

function adminFeedbackSectionHtml(links: MailLinks): string {
  const uu = escapeHtml(links.adminFeedbackUrl);
  return emailCard(
    'التواصل مع الإدارة',
    `<p style="margin:0 0 10px;font-size:14px;color:#475569;line-height:1.85">رابط مباشر لكتابة <strong>ملاحظاتك</strong> أو <strong>شكواك</strong> أو أي <strong>مشكلة</strong> تواجهك في المنصة أو الحساب:</p><p style="margin:0"><a href="${uu}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 18px;border-radius:10px;border:2px solid #D4AF37;background:linear-gradient(135deg,#fffbeb,#fff);color:#854d0e;font-weight:800;text-decoration:none;font-size:14px">فتح التواصل مع الإدارة</a></p>`,
  );
}

function ratingSectionPlain(rating: RatingEmailContext): string[] {
  if (!rating.hasToken) {
    return [
      '',
      'رمز التقييم:',
      '- لم يُرفق رابط التقييم تلقائياً. من لوحة التحكم ← QR والتقييمات اعرض الرمز أو انسخ الرابط لعميلك.',
    ];
  }
  return [
    '',
    'رابط صفحة التقييم (خاص بصالونك):',
    rating.ratingPageUrl,
    'يُرفق مع هذه الرسالة ملف PNG لرمز QR — اطبعه أو اعرضه على آيباد أمام العميل.',
    'يمكن للعميل إعادة فتح الرابط والتقييم ضمن الضوابط المعروضة في الصفحة.',
  ];
}

function adminFeedbackPlain(links: MailLinks): string[] {
  return ['', 'التواصل مع الإدارة (ملاحظات / شكاوى):', links.adminFeedbackUrl];
}

function tierSpecificLines(k: 'bronze' | 'gold' | 'diamond'): string[] {
  if (k === 'bronze') {
    return [
      'باقتك البرونزية:',
      '- أوقات العمل الأساسية كما سجّلتها عند التسجيل؛ لتحرير جدول أسبوعي متقدّم يمكن الترقية إلى ذهبي أو ماسي.',
    ];
  }
  const lines: string[] = [
    k === 'diamond' ? 'باقتك الماسية (تشمل مزايا الباقة الذهبية + إضافات ماسية):' : 'باقتك الذهبية:',
    '- من «الإعدادات»: جدول أوقات العمل الأسبوعي (يُحفظ على جهازك كمعاينة إلى حين اكتمال المزامنة مع الخادم إن لزم).',
    '- من «QR والتقييمات»: رابط ورمز لتقييم الزبائن بعد الزيارة (متاح للذهبي والماسي).',
  ];
  if (k === 'diamond') {
    lines.push(
      '- من «الإعدادات» أيضاً: جدولة المواعيد (ماسي) — إظهار أو إخفاء كتلة الحجز للعملاء على الخريطة (معاينة على الجهاز).',
    );
  }
  return lines;
}

function orderRefPlainLines(registrationOrderId: string | null | undefined): string[] {
  const id = String(registrationOrderId || '').trim();
  if (!id) return [];
  return [
    '',
    'رقم طلب الاشتراك (مرجع الدعم):',
    id,
    'احفظ هذا الرقم عند التواصل مع الدعم أو فريق حلاق ماب.',
  ];
}

function orderRefSectionHtml(registrationOrderId: string | null | undefined): string {
  const id = String(registrationOrderId || '').trim();
  if (!id) return '';
  const safe = escapeHtml(id);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border-radius:14px;border:1px solid #bae6fd;background:#f0f9ff"><tr><td style="padding:14px 16px;font-size:14px;color:#0c4a6e;line-height:1.75"><p style="margin:0;font-weight:800">رقم طلب الاشتراك (مرجع الدعم)</p><p style="margin:6px 0 0;font-family:ui-monospace,monospace;font-size:15px;letter-spacing:0.02em" dir="ltr">${safe}</p><p style="margin:8px 0 0;font-size:12px;color:#0369a1">احفظه عند مراسلة الدعم أو فريق حلاق ماب.</p></td></tr></table>`;
}

function emailOpeningLines(name: string, tierLabel: string): string[] {
  return [
    'حلاق ماب — منصة الحلاقين على الخريطة',
    '════════════════════════════════════',
    '',
    `🎉 أهلًا ${name}!`,
    '',
    'نحن في حلاق ماب سعداء جدًا باعتماد حسابك — هذه ليست مجرد رسالة تأكيد، بل دعوة للانضمام إلى مسار نمو نعمل عليه بخطى مدروسة: انتشار منهجي في المدن والأحياء، خرائط أوضح، ووصول أقوى للعميل القريب منك.',
    '',
    'وجود صالونك على المنصة الآن إنجاز حقيقي: أنت من الشركاء الأوائل الذين يساعدوننا نبني شبكة حلاقين موثوقة يثق بها الزائر. مع توسع المنصة، يتعزز ظهورك تدريجيًا أمام من يبحث عنك في محيطه — هذا تقدم تسويقي ملموس مبني على القرب والخريطة والمحتوى، لا وعودًا فارغة.',
    '',
    `باقتك الحالية: ${tierLabel}. فيما يلي ما يهمك عمليًا: روابط الدخول، أمان تسجيل الدخول، وملخص لوحة التحكم (بنفس روح تجربة المنصة: وضوح، احتراف، وتركيز على صالونك).`,
  ];
}

function emailText(
  name: string,
  tierLabel: string,
  tier: Tier | null | undefined,
  links: MailLinks,
  rating: RatingEmailContext,
): string {
  const k = tierKey(tier);
  const tierLines = tierSpecificLines(k);
  return [
    ...emailOpeningLines(name, tierLabel),
    '',
    'روابط سريعة:',
    `- الصفحة الرئيسية: ${links.homeUrl}`,
    `- من نحن: ${links.aboutUrl}`,
    `- تسجيل دخول الحلاق: ${links.loginUrl}`,
    `- لوحة التحكم: ${links.dashboardUrl}`,
    `- سياسة الاشتراكات: ${links.policyUrl}`,
    `- الخصوصية: ${links.privacyUrl}`,
    `- طلب اشتراك جديد (للمرجعية): ${links.registerUrl}`,
    '',
    'تسجيل الدخول (آمن وواضح):',
    '- البريد الإلكتروني نفسه المسجّل في حسابك لدينا.',
    '- «رمز الدخول» الذي يزوّدك به فريق حلاق ماب (رمز منصّة — لا يُقبل أي كلمة مرور عشوائية).',
    '- لا تشارك رمز الدخول مع أشخاص غير المخوّلين في إدارة صالونك.',
    '',
    'لوحة التحكم — بتصميم موحّد لحلاق ماب:',
    '- يظهر اسم صالونك في الأعلى من بياناتنا المعتمدة.',
    '- الإحصائيات تبدأ من الصفر؛ ونوضح بصدق: المنصة لا تعرض إيرادات محلك — خصوصيتك التجارية محفوظة.',
    '',
    ...tierLines,
    '',
    'ماذا تفعل داخل اللوحة؟',
    '- الإعدادات ← «البنر والعروض»: روابط صور البنر، وتفعيل شارة الخصم والنسبة عند الحاجة.',
    '- المواعيد ← «إضافة أوقات متاحة»: نوافذ زمنية توضّح أن لديك وقتًا مفتوحًا للحجز.',
    '- البوستات والعروض: إنشاء وتعديل وحذف المنشورات.',
    '- الرسائل: يبدأ الحوار من العميل عبر التطبيق؛ بعد أول رسالة يمكنك الرد.',
    '',
    'لصورك وبنراتك:',
    '- يفضّل مقاس أفقي واضح (مثال تقريبي 1600×900) وتجنّب الخطوط الدقيقة جدًا.',
    '- جدّد الصور مع كل عرض أو هوية جديدة — العميل يقرأ الصورة قبل النص.',
    '',
    'قبل الختام:',
    '- دقة بياناتك (الجوال، الواتساب، ساعات العمل) = فرص أعلى ليصلك من يبحث عنك بالقرب منه.',
    '- احفظ هذه الرسالة أو ضع روابط الدخول في مفضلة المتصفح للرجوع السريع.',
    '',
    supportContactPlain(),
    ...ratingSectionPlain(rating),
    ...adminFeedbackPlain(links),
    '',
    'شكرًا لثقتك. نتطلع لرؤية صالونك يلمع على الخريطة ✨',
    '',
    '— فريق حلاق ماب',
  ].join('\n');
}

function emailHtml(
  name: string,
  tierLabel: string,
  tier: Tier | null | undefined,
  links: MailLinks,
  rating: RatingEmailContext,
  registrationOrderId?: string | null,
): string {
  const nameSafe = escapeHtml(name);
  const tierSafe = escapeHtml(tierLabel);
  const k = tierKey(tier);
  const orderRefBlock = orderRefSectionHtml(registrationOrderId);
  const logoSrc = escapeHtml(logoPublicUrl(links));
  const preheader =
    'اعتماد حسابك على حلاق ماب — روابط الدخول، لوحة التحكم، ودليلك في رسالة واحدة.';

  const goldDiamondBox =
    k === 'bronze'
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border-radius:14px;border:1px solid #d1fae5;background:linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 100%);overflow:hidden"><tr><td style="padding:16px 18px;font-size:14px;color:#134e4a;line-height:1.85"><p style="margin:0;font-weight:700;color:#0f766e">باقتك البرونزية</p><p style="margin:8px 0 0">أوقات العمل كما سجّلتها عند التسجيل؛ لجدول أسبوعي متقدّم يمكنك لاحقًا الترقية إلى <strong>ذهبي</strong> أو <strong>ماسي</strong>.</p></td></tr></table>`
      : k === 'gold'
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border-radius:14px;border:1px solid #fcd34d;background:linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%);overflow:hidden"><tr><td style="padding:16px 18px;font-size:14px;color:#78350f;line-height:1.85"><p style="margin:0;font-weight:800;color:#92400e">باقتك الذهبية</p><ul style="margin:10px 0 0;padding:0 20px 0 0"><li style="margin:0 0 6px"><strong>الإعدادات:</strong> جدول أوقات العمل الأسبوعي.</li><li style="margin:0"><strong>QR والتقييمات:</strong> رابط ورمز التقييم بعد الزيارة.</li></ul></td></tr></table>`
        : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border-radius:14px;border:1px solid #5eead4;background:linear-gradient(135deg,#ecfeff 0%,#ccfbf1 100%);overflow:hidden"><tr><td style="padding:16px 18px;font-size:14px;color:#115e59;line-height:1.85"><p style="margin:0;font-weight:800;color:#0f766e">باقتك الماسية</p><p style="margin:6px 0 10px;font-size:13px;color:#0d9488">تشمل مزايا الذهبي + إضافات ماسية</p><ul style="margin:0;padding:0 20px 0 0"><li style="margin:0 0 6px"><strong>الإعدادات:</strong> جدول أوقات العمل الأسبوعي.</li><li style="margin:0 0 6px"><strong>QR والتقييمات:</strong> رابط ورمز التقييم.</li><li style="margin:0"><strong>جدولة المواعيد (ماسي):</strong> إظهار أو إخفاء الحجز على الخريطة.</li></ul></td></tr></table>`;

  const btn = (href: string, label: string) =>
    `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin:6px 6px 6px 0;padding:12px 22px;border-radius:12px;background:linear-gradient(180deg,#14b8a6,#0d9488);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;box-shadow:0 4px 14px rgba(13,148,136,0.35)">${label}</a>`;

  const u = (href: string) => escapeHtml(href);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>حلاق ماب | أهلاً ${nameSafe}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800&amp;family=IBM+Plex+Sans+Arabic:wght@400;600;700&amp;display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#ecfdf5;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ffffff;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#d1fae5 0%,#f8fafc 45%,#f1f5f9 100%);padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" class="hm-inner" style="max-width:560px;width:100%;border-radius:20px;overflow:hidden;border:1px solid #a7f3d0;background:#ffffff;box-shadow:0 22px 50px rgba(15,118,110,0.12)">
<tr><td style="height:5px;background:linear-gradient(90deg,#0d9488,#14b8a6,#D4AF37);"></td></tr>
<tr><td style="padding:22px 20px 8px;text-align:center;background:radial-gradient(ellipse at top,#ecfdf5 0%,#ffffff 55%);">
  <img src="${logoSrc}" width="132" height="auto" alt="حلاق ماب" style="display:block;margin:0 auto 12px;max-width:132px;height:auto;border:0" />
  <p style="margin:0 0 4px;font-family:Tajawal,'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;font-size:26px;font-weight:800;letter-spacing:-0.02em;color:#0f172a;">حلاق ماب</p>
  <p style="margin:0 0 18px;font-family:Tajawal,'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;font-size:13px;font-weight:600;color:#0d9488;">منصة الحلاقين على الخريطة</p>
  <p style="margin:0 0 8px;font-family:Tajawal,'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;font-size:13px;font-weight:700;color:#0d9488;">🎉 خطوة مميزة على الخريطة</p>
  <h1 style="margin:0 0 14px;font-family:Tajawal,'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;font-size:24px;font-weight:800;color:#0f172a;line-height:1.4;">أهلًا ${nameSafe}!</h1>
</td></tr>
<tr><td style="padding:0 22px 8px;font-family:Tajawal,'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;font-size:15px;color:#334155;line-height:1.95;">
  <p style="margin:0 0 14px">نفرح باعتماد حسابك — هذه دعوة للانضمام إلى مسار نمو <strong style="color:#0f766e">مدروس</strong>: انتشار منهجي في المدن والأحياء، خرائط أوضح، ووصول أقوى للعميل القريب منك.</p>
  <p style="margin:0 0 14px"><strong style="color:#0f172a">وجود صالونك الآن إنجاز كبير:</strong> أنت من الشركاء الأوائل الذين يساعدوننا نبني شبكة حلاقين موثوقة. مع توسع المنصة، يتعزز ظهورك تدريجيًا أمام من يبحث عنك في محيطه — تقدم تسويقي <strong>ملموس</strong> مبني على القرب والخريطة والمحتوى.</p>
  <p style="margin:0 0 18px">نوعدك بخطوات واضحة أمامك في لوحة التحكم: بنرات وعروض، أوقات متاحة، رسائل العملاء، وتجربة تصميم تحمل روح <strong style="color:#0d9488">حلاق ماب</strong> — وضوح، احتراف، وتركيز على صالونك.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px"><tr><td style="text-align:center">
    <span style="display:inline-block;padding:8px 18px;border-radius:999px;background:linear-gradient(135deg,#fffbeb,#fef9c3);border:1px solid #facc15;color:#854d0e;font-family:Tajawal,'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;font-size:13px;font-weight:800;">الباقة المعتمدة: ${tierSafe}</span>
  </td></tr></table>
  ${orderRefBlock}
</td></tr>
<tr><td style="padding:0 22px 10px;text-align:center;font-family:Tajawal,'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;">
  ${btn(links.loginUrl, 'تسجيل دخول الحلاق')}
  ${btn(links.dashboardUrl, 'فتح لوحة التحكم')}
  <div style="margin-top:14px;line-height:2;font-size:13px">
    <a href="${u(links.homeUrl)}" target="_blank" rel="noopener noreferrer" style="color:#0d9488;font-weight:600;text-decoration:underline;">الصفحة الرئيسية</a>
    <span style="color:#cbd5e1;margin:0 6px">|</span>
    <a href="${u(links.aboutUrl)}" target="_blank" rel="noopener noreferrer" style="color:#0d9488;font-weight:600;text-decoration:underline;">من نحن</a>
    <span style="color:#cbd5e1;margin:0 6px">|</span>
    <a href="${u(links.policyUrl)}" target="_blank" rel="noopener noreferrer" style="color:#0d9488;font-weight:600;text-decoration:underline;">سياسة الاشتراكات</a>
    <span style="color:#cbd5e1;margin:0 6px">|</span>
    <a href="${u(links.privacyUrl)}" target="_blank" rel="noopener noreferrer" style="color:#0d9488;font-weight:600;text-decoration:underline;">الخصوصية</a>
  </div>
</td></tr>
<tr><td style="padding:0 22px 22px;font-family:Tajawal,'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;">
  ${emailCard('روابط الموقع', siteLinksCardBody(links))}
  ${emailCard(
    'خطواتك التالية (سريعة)',
    '<ol style="margin:0;padding:0 22px 0 0;font-size:14px;color:#475569;line-height:1.95"><li style="margin:0 0 8px">سجّل الدخول من الزر أعلاه ببريدك ورمز المنصة.</li><li style="margin:0 0 8px">من «الإعدادات» حدّث <strong>البنر والعروض</strong> وصورك بأفضل جودة.</li><li style="margin:0 0 8px">من «المواعيد» أضف <strong>أوقاتًا متاحة</strong> للحجز إن رغبت.</li><li style="margin:0">تفقد ظهورك من <strong>الصفحة الرئيسية</strong> على الخريطة بعد التحديثات.</li></ol>',
  )}
  ${emailCard(
    'تسجيل الدخول — آمن',
    '<ul style="margin:0;padding:0 20px 0 0;font-size:14px;color:#475569;line-height:1.85"><li style="margin:0 0 6px">البريد نفسه المسجّل لدينا.</li><li style="margin:0 0 6px">رمز الدخول من فريق حلاق ماب (رمز منصّة — لا يُقبل أي كلمة مرور عشوائية).</li><li style="margin:0">لا تشارك الرمز مع غير المخوّلين بإدارة الصالون.</li></ul>',
  )}
  ${emailCard(
    'لوحة التحكم — كما في المنصة',
    '<p style="margin:0;font-size:14px;color:#475569;line-height:1.85">اسم صالونك يظهر في الأعلى من بياناتنا المعتمدة. الإحصائيات تبدأ من الصفر؛ ونوضح بصدق: <strong>لا نعرض إيرادات محلك</strong> على المنصة.</p>',
  )}
  ${goldDiamondBox}
  ${ratingAndQrSectionHtml(rating)}
  ${adminFeedbackSectionHtml(links)}
  ${emailCard(
    'ماذا يهمك داخل اللوحة؟',
    '<ul style="margin:0;padding:0 20px 0 0;font-size:14px;color:#475569;line-height:1.85"><li style="margin:0 0 6px"><strong>الإعدادات</strong> ← البنر والعروض (روابط صور، شارة خصم عند الحاجة).</li><li style="margin:0 0 6px"><strong>المواعيد</strong> ← أوقات متاحة للحجز.</li><li style="margin:0 0 6px"><strong>البوستات والعروض</strong> لإدارة المنشورات.</li><li style="margin:0"><strong>الرسائل</strong>: يبدأ العميل الحوار من التطبيق؛ بعد أول رسالة يمكنك الرد.</li></ul>',
  )}
  ${emailCard(
    'بنراتك بأفضل صورة',
    '<ul style="margin:0;padding:0 20px 0 0;font-size:14px;color:#475569;line-height:1.85"><li style="margin:0 0 6px">مقاس أفقي واضح (مثال تقريبي 1600×900) وتجنّب الخطوط الدقيقة جدًا.</li><li style="margin:0">حدّث الصور مع كل عرض — العميل يقرأ الصورة قبل النص.</li></ul>',
  )}
  ${emailCard('مساعدتك تهمنا', supportContactHtml())}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0;border-radius:14px;border:1px dashed #94a3b8;background:#f8fafc"><tr><td style="padding:16px 18px;font-family:Tajawal,'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;font-size:13px;color:#475569;line-height:1.85;text-align:center">دقة الجوال والواتساب وساعات العمل = فرص أعلى ليصلك من يبحث عنك بالقرب ✨<br/><span style="font-size:12px;color:#94a3b8">احفظ هذه الرسالة أو أضف روابط الدخول إلى مفضلتك للرجوع السريع.</span></td></tr></table>
  <p style="margin:16px 0 0;text-align:center;font-size:11px;color:#94a3b8;font-family:Tajawal,'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;" dir="ltr">${escapeHtml(links.siteBase)}</p>
  <p style="margin:22px 0 6px;text-align:center;font-size:15px;font-weight:700;color:#0f172a;font-family:Tajawal,'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;">شكرًا لثقتك — نتطلع لرؤية صالونك يلمع على الخريطة</p>
  <p style="margin:0 0 18px;text-align:center;font-size:13px;color:#64748b;font-family:Tajawal,'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;">— فريق حلاق ماب</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** نتيجة إرسال Resend — يجب تعريفها قبل sendViaResend لضمان فحص TS على Vercel */
type ResendSendOutcome = { ok: true; id: string } | { ok: false; error: string };

function isResendFailure(r: ResendSendOutcome): r is { ok: false; error: string } {
  return r.ok === false;
}

type AnonGateOutcome = { ok: true } | { ok: false; error: string; status: number };

function isAnonFailure(r: AnonGateOutcome): r is { ok: false; error: string; status: number } {
  return r.ok === false;
}

async function sendViaResend(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
  resendApiKey: string;
  fromEmail: string;
  attachments?: Array<{ filename: string; content: string; content_type?: string; content_id?: string }>;
}): Promise<ResendSendOutcome> {
  const body: Record<string, unknown> = {
    from: input.fromEmail,
    to: [input.to],
    subject: input.subject,
    text: input.text,
    html: input.html,
  };
  if (input.attachments?.length) {
    body.attachments = input.attachments;
  }

  const maxAttempts = 3;
  let lastError = 'Network error while calling Resend API';

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${input.resendApiKey}`,
        },
        body: JSON.stringify(body),
      });
      const rawBody = await resp.text();
      let payload = {} as { id?: string; message?: string; name?: string };
      try {
        payload = JSON.parse(rawBody) as typeof payload;
      } catch {
        /* ignore */
      }

      if (resp.ok) {
        if (!payload.id) {
          return { ok: false, error: payload.message || rawBody.trim() || 'Missing Resend message id' };
        }
        return { ok: true, id: payload.id };
      }

      const isRetryable = resp.status === 429 || resp.status >= 500;
      lastError = payload.message || payload.name || rawBody.trim() || `Resend HTTP ${resp.status}`;
      if (!isRetryable || attempt === maxAttempts) {
        return { ok: false, error: lastError };
      }
    } catch {
      if (attempt === maxAttempts) {
        return { ok: false, error: lastError };
      }
    }
    await sleep(250 * attempt);
  }
  return { ok: false, error: lastError };
}

function validateAnon(request: Request, expectedAnon: string): AnonGateOutcome {
  if (!expectedAnon) {
    return {
      ok: false,
      error: 'Server not configured (SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY)',
      status: 503,
    };
  }
  const providedAnon = request.headers.get('x-supabase-anon')?.trim() || '';
  if (providedAnon !== expectedAnon) {
    return { ok: false, error: 'Unauthorized', status: 401 };
  }
  return { ok: true };
}

function parseLimit(raw: unknown, fallback = 200): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(500, Math.max(1, Math.floor(n)));
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** تطبيع بسيط: يزيل مسافات وأحرف شائعة بالخطأ عند النسخ من الجداول */
function normalizeRecipientEmail(raw: string): string {
  return raw
    .trim()
    .replace(/^<+|>+$/g, '')
    .replace(/^['"]+|['"]+$/g, '')
    .toLowerCase();
}

function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

/** تشخيص بدون أسرار — /api/send-barber-onboarding */
export async function GET(request: Request): Promise<Response> {
  const headers = corsHeaders(request);
  const resolvedUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const resendApiKeySet = Boolean((process.env.RESEND_API_KEY || '').trim());
  const fromEmailSet = Boolean((process.env.RESEND_FROM_EMAIL || '').trim());
  const anonSet = Boolean((process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim());
  return Response.json(
    {
      ok: true,
      route: 'send-barber-onboarding',
      supabaseUrlSet: Boolean(resolvedUrl),
      supabaseUrlHost: safeHost(resolvedUrl),
      resendApiKeySet,
      resendFromEmailSet: fromEmailSet,
      anonKeySetForVerification: anonSet,
      ready: resendApiKeySet && fromEmailSet && anonSet,
    },
    { headers }
  );
}

export async function POST(request: Request): Promise<Response> {
  const headers = corsHeaders(request);
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const expectedAnon = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  const fromEmail = (process.env.RESEND_FROM_EMAIL || '').trim();

  const anonCheck = validateAnon(request, expectedAnon);
  if (isAnonFailure(anonCheck)) {
    return Response.json({ error: anonCheck.error }, { status: anonCheck.status, headers });
  }
  if (!resendApiKey || !fromEmail) {
    return Response.json(
      { error: 'Server not configured (RESEND_API_KEY / RESEND_FROM_EMAIL)' },
      { status: 503, headers }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }
  const payload = body as Partial<OnboardingBody>;
  const mode = payload.mode;

  const baseUrl = getSiteBaseUrl();
  const links = buildLinks(baseUrl);

  if (mode === 'single') {
    const barberEmail = normalizeRecipientEmail(String(payload.barberEmail || ''));
    const barberName = String(payload.barberName || '').trim() || 'شريك حلاق ماب';
    const tierRaw = (payload as SinglePayload).tier;
    const tier = tierLabelAr(tierRaw);
    if (!barberEmail) {
      return Response.json({ error: 'Missing barberEmail' }, { status: 400, headers });
    }
    if (!isValidEmail(barberEmail)) {
      return Response.json({ error: 'Invalid barberEmail' }, { status: 400, headers });
    }
    let barberId: string | null = String((payload as SinglePayload).barberId ?? '').trim() || null;
    let ratingTok: string | null = String((payload as SinglePayload).ratingInviteToken ?? '').trim() || null;
    if ((!barberId || !ratingTok) && url && serviceRole) {
      const row = await loadBarberIdAndRatingToken(url, serviceRole, barberEmail);
      if (row) {
        barberId = row.id;
        ratingTok = row.rating_invite_token;
      }
    }
    const ratingCtx = await buildRatingEmailContext(baseUrl, barberId, ratingTok);
    const registrationOrderId = String((payload as SinglePayload).registrationOrderId ?? '').trim() || null;
    const attachments =
      ratingCtx.hasToken && ratingCtx.qrPngBase64
        ? [
            {
              filename: 'halaqmap-rating-qr.png',
              content: ratingCtx.qrPngBase64,
              content_type: 'image/png',
              content_id: RATING_QR_CONTENT_ID,
            },
          ]
        : undefined;
    const subject = '🎉 حلاق ماب | حسابك معتمد — أهلًا بك على الخريطة + روابط لوحة التحكم';
    const text = emailText(barberName, tier, tierRaw, links, ratingCtx, registrationOrderId);
    const html = emailHtml(barberName, tier, tierRaw, links, ratingCtx, registrationOrderId);
    const sent = await sendViaResend({
      to: barberEmail,
      subject,
      text,
      html,
      resendApiKey,
      fromEmail,
      attachments,
    });
    if (isResendFailure(sent)) {
      return Response.json({ error: sent.error }, { status: 502, headers });
    }
    return Response.json({ ok: true, mode: 'single', messageId: sent.id, to: barberEmail }, { headers });
  }

  if (mode === 'bulk_active') {
    if (!url || !serviceRole) {
      return Response.json(
        { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
        { status: 503, headers }
      );
    }
    const limit = parseLimit((payload as BulkPayload).limit, 200);
    const supabase = createClient(url, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from('barbers')
      .select('id, name, email, tier, is_active, rating_invite_token')
      .eq('is_active', true)
      .not('email', 'is', null)
      .limit(limit);
    if (error) {
      return Response.json({ error: error.message }, { status: 500, headers });
    }
    const rows = (data ?? []) as Array<{
      id: string;
      name: string | null;
      email: string | null;
      tier: string | null;
      rating_invite_token: string | null;
    }>;
    let sentCount = 0;
    const apiFailed: Array<{ email: string; error: string }> = [];
    const invalidSamples: string[] = [];
    let skippedInvalid = 0;
    let skippedDuplicate = 0;
    const seen = new Set<string>();
    for (const row of rows) {
      const email = normalizeRecipientEmail(String(row.email || ''));
      if (!email) continue;
      if (!isValidEmail(email)) {
        skippedInvalid += 1;
        if (invalidSamples.length < 15) invalidSamples.push(email || '(فارغ)');
        continue;
      }
      if (seen.has(email)) {
        skippedDuplicate += 1;
        continue;
      }
      seen.add(email);
      const name = String(row.name || '').trim() || 'شريك حلاق ماب';
      const tier = tierLabelAr(row.tier);
      const ratingCtx = await buildRatingEmailContext(baseUrl, String(row.id), row.rating_invite_token);
      const attachments =
        ratingCtx.hasToken && ratingCtx.qrPngBase64
          ? [
              {
                filename: 'halaqmap-rating-qr.png',
                content: ratingCtx.qrPngBase64,
                content_type: 'image/png',
                content_id: RATING_QR_CONTENT_ID,
              },
            ]
          : undefined;
      const subject = '🎉 حلاق ماب | أنت على الخريطة — روابط لوحة التحكم ودليلك';
      const text = emailText(name, tier, row.tier, links, ratingCtx, null);
      const html = emailHtml(name, tier, row.tier, links, ratingCtx, null);
      const sent = await sendViaResend({
        to: email,
        subject,
        text,
        html,
        resendApiKey,
        fromEmail,
        attachments,
      });
      if (isResendFailure(sent)) {
        apiFailed.push({ email, error: sent.error });
      } else {
        sentCount += 1;
      }
      await sleep(150);
    }
    const uniqueRecipients = seen.size;
    return Response.json(
      {
        ok: true,
        mode: 'bulk_active',
        attempted: rows.length,
        uniqueRecipients,
        sent: sentCount,
        failed: apiFailed.length,
        skippedInvalid,
        skippedDuplicate,
        failedDetails: apiFailed.slice(0, 30),
        invalidSamples,
      },
      { headers }
    );
  }

  return Response.json({ error: 'Unsupported mode' }, { status: 400, headers });
}
