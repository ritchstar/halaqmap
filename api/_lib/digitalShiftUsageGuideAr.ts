/**
 * دليل استخدام المناوب والشات — يُدمَج في بريد التفعيل ويُعاد استخدامه في صفحات المعاينة لاحقاً.
 */

export const DIGITAL_SHIFT_USAGE_GUIDE_INTRO_AR =
  'دليل التشغيل السريع بعد التفعيل — اقرأه مرة واحدة ثم طبّق الخطوات من لوحة التحكم.';

export const DIGITAL_SHIFT_USAGE_GUIDE_SECTIONS = [
  {
    title: '١) افتح لوحة التحكم',
    bullets: [
      'استخدم رابط الدخول السريع في هذه الرسالة — يفتح لوحة التحكم مباشرة.',
      'من القائمة الجانبية انتقل إلى تبويب «شات العملاء» لمتابعة محادثات الزبائن الحية.',
      'تبويب «المناوب والمكتب الخاص» لإعداد المناوب، المحفظة، والتعليمات الداخلية.',
    ],
  },
  {
    title: '٢) شات الزبائن — كيف يعمل',
    bullets: [
      'الزبون يكتب من بنر الصالون — الجلسة ساعة واحدة لكل محادثة.',
      'المناوب يرد تلقائياً خلال نحو 5 ثوانٍ إذا لم ترد أنت — ويرد فوراً عند إغلاق المحل.',
      'المناوب يكتشف لغة الزبون ويرد بها (عربي، إنجليزي، تركي، إسباني، …) — وتظهر لك ترجمة عربية تحت الرسائل الأجنبية.',
      'عندما ترد أنت يدوياً يتوقف المناوب عن هذه المحادثة حتى تضغط «أعِد المناوب للرد».',
      'الزبون يرى زر تحديث بجانب الشات لمتابعة الردود لحظة بلحظة.',
    ],
  },
  {
    title: '٣) المكتب الخاص — تعليماتك السرية',
    bullets: [
      'اكتب تعليمات دائمة تُنفَّذ مع كل زبون — مثال: `تعليمة: لا نقبل مواعيد بعد العاشرة مساءً`.',
      'استخدم رموز التوجيه: `عرض:` للعروض، `جدول:` لأوقات العمل، `خدمة:` للأسعار، `موقع:` للعنوان.',
      'تصلك تقارير المناوب بعد كل محادثة — راجعها من المكتب الخاص.',
    ],
  },
  {
    title: '٤) المحفظة والتوصيات',
    bullets: [
      'كل رد آلي للمناوب يستهلك رصيداً بسيطاً من محفظة المناوب — راقب الرصيد واشحن من اللوحة.',
      'طاولة التوصيات تقترح تحسينات للبنر والمعرض — نفّذها لرفع جودة الردود.',
      'يمكنك تفعيل أو إيقاف المناوب وتسميته أمام الزبائن من إعدادات المناوب.',
    ],
  },
  {
    title: '٥) غرفة المراقبة (للمالك)',
    bullets: [
      'رابط منفصل في بريد التفعيل — متابعة قراءة فقط: مفتوح/مغلق، محادثات نشطة، تنبيهات.',
      'لا تعرض نصوص الزبائن — للإشراف دون التدخل في التفاصيل.',
    ],
  },
] as const;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildDigitalShiftUsageGuidePlain(dashboardUrl: string): string {
  const lines: string[] = [
    '',
    '══ دليل استخدام المناوب والشات ══',
    DIGITAL_SHIFT_USAGE_GUIDE_INTRO_AR,
    '',
  ];
  for (const section of DIGITAL_SHIFT_USAGE_GUIDE_SECTIONS) {
    lines.push(section.title);
    for (const b of section.bullets) {
      lines.push(`  • ${b}`);
    }
    lines.push('');
  }
  lines.push(`لوحة التحكم: ${dashboardUrl}`);
  lines.push('');
  return lines.join('\n');
}

export function buildDigitalShiftUsageGuideHtml(dashboardUrl: string): string {
  const h = escapeHtml;
  const dashSafe = h(dashboardUrl);
  const sectionsHtml = DIGITAL_SHIFT_USAGE_GUIDE_SECTIONS.map((section) => {
    const items = section.bullets
      .map((b) => `<li style="margin:0 0 8px">${h(b)}</li>`)
      .join('');
    return `<div style="margin:0 0 16px"><p style="margin:0 0 8px;font-size:14px;font-weight:800;color:#0e7490">${h(section.title)}</p><ul style="margin:0;padding:0 20px 0 0;font-size:13px;line-height:1.85;color:#115e59">${items}</ul></div>`;
  }).join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border-radius:14px;border:1px solid #67e8f9;background:linear-gradient(135deg,#ecfeff 0%,#f5f3ff 100%);overflow:hidden"><tr><td style="padding:18px 20px">
<p style="margin:0 0 6px;font-weight:800;font-size:15px;color:#0e7490">📘 دليل استخدام المناوب والشات</p>
<p style="margin:0 0 14px;font-size:13px;color:#475569;line-height:1.75">${h(DIGITAL_SHIFT_USAGE_GUIDE_INTRO_AR)}</p>
${sectionsHtml}
<p style="margin:14px 0 0;text-align:center"><a href="${dashSafe}" style="display:inline-block;padding:12px 22px;border-radius:12px;background:linear-gradient(180deg,#14b8a6,#0d9488);color:#fff;font-weight:700;text-decoration:none;font-size:14px">فتح لوحة التحكم</a></p>
</td></tr></table>`;
}
