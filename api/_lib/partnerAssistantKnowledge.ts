/**
 * نص معرفة «مسار الشركاء» لحقنها في prompt المساعد (مصدر واحد: نصوص المنصّة).
 * لا يُستبدل بيانات Supabase هنا — المحتوى هو نفس ما يعرضه مسار الشركاء في الواجهة.
 */
import {
  PARTNER_DIGITAL_ASSISTANT,
  PARTNER_LAYOUT_FOOTER_LINE,
  PARTNER_REGISTER_INTRO,
  PARTNER_REGISTER_INTRO_PARAGRAPHS,
  PARTNER_LANDING_HERO,
  PARTNER_LANDING_HERO_HIGHLIGHTS,
  PARTNER_LANDING_WHY_SECTION,
  PARTNER_LANDING_VALUE_PROPS,
  PARTNER_LANDING_NARRATIVE_SECTION,
  PARTNER_LANDING_PILLARS_SECTION,
  PARTNER_LANDING_EARLY_MOVER_SECTION,
  PARTNER_LANDING_HOW_SECTION,
  PARTNER_LANDING_PROCESS_STEPS,
  PARTNER_LANDING_PLANS_SECTION,
  PARTNER_LANDING_PLAN_CARDS,
  PARTNER_LANDING_CTA_SECTION,
  PARTNER_WHY_PAGE,
  PARTNER_STORY_PAGE,
} from '../../src/lib/partnerMarketingCopy';

function joinBlocks(title: string, lines: string[]): string {
  return `### ${title}\n${lines.filter(Boolean).join('\n')}\n`;
}

export function composePartnerPathKnowledgePack(): string {
  const highlights = PARTNER_LANDING_HERO_HIGHLIGHTS.map((h) => `- ${h.title}: ${h.body}`).join('\n');
  const valueProps = PARTNER_LANDING_VALUE_PROPS.map((v) => `- ${v.title}: ${v.body}`).join('\n');
  const pillars = PARTNER_LANDING_PILLARS_SECTION.pillars.map((p) => `- ${p.word}: ${p.body}`).join('\n');
  const early = PARTNER_LANDING_EARLY_MOVER_SECTION.bullets.map((b) => `- ${b}`).join('\n');
  const steps = PARTNER_LANDING_PROCESS_STEPS.map((s) => `- ${s.title}: ${s.body}`).join('\n');
  const plans = PARTNER_LANDING_PLAN_CARDS.map((c) => `- ${c.title} (${c.subtitle}): ${c.points.join('؛ ')}`).join('\n');
  const whySections = PARTNER_WHY_PAGE.sections.map((s) => `- ${s.title}: ${s.body}`).join('\n');
  const storyChapters = PARTNER_STORY_PAGE.chapters.map((c) => `- ${c.title}: ${c.body}`).join('\n');
  const introParas = PARTNER_REGISTER_INTRO_PARAGRAPHS.join('\n\n');

  return [
    joinBlocks('هوية المساعد في الواجهة', [
      `الاسم: ${PARTNER_DIGITAL_ASSISTANT.name}`,
      `الدور: ${PARTNER_DIGITAL_ASSISTANT.role}`,
      `ترحيب قصير: ${PARTNER_DIGITAL_ASSISTANT.greeting}`,
      `رسالة ترحيب: ${PARTNER_DIGITAL_ASSISTANT.welcome}`,
      `نصائح سريعة من الواجهة:\n${PARTNER_DIGITAL_ASSISTANT.tips.map((t) => `  • ${t}`).join('\n')}`,
    ]),
    joinBlocks('تذييل مسار الشركاء', [PARTNER_LAYOUT_FOOTER_LINE]),
    joinBlocks('مقدمة التسجيل (فقرات)', [introParas]),
    joinBlocks('مقدمة التسجيل (سطر واحد)', [PARTNER_REGISTER_INTRO]),
    joinBlocks('صفحة التسويق — شارة وبطاقة العنوان', [
      `${PARTNER_LANDING_HERO.badge}`,
      `${PARTNER_LANDING_HERO.title}`,
      `${PARTNER_LANDING_HERO.lead}`,
    ]),
    joinBlocks('صفحة التسويق — نقاط بارزة', [highlights]),
    joinBlocks('لماذا الانضمام الآن', [`${PARTNER_LANDING_WHY_SECTION.title}`, `${PARTNER_LANDING_WHY_SECTION.lead}`]),
    joinBlocks('قيم مقترحة', [valueProps]),
    joinBlocks('قسم السرد', [
      `${PARTNER_LANDING_NARRATIVE_SECTION.title}`,
      `${PARTNER_LANDING_NARRATIVE_SECTION.lead}`,
      ...PARTNER_LANDING_NARRATIVE_SECTION.paragraphs,
    ]),
    joinBlocks('الركائز الثلاث', [`${PARTNER_LANDING_PILLARS_SECTION.title}`, `${PARTNER_LANDING_PILLARS_SECTION.subtitle}`, pillars]),
    joinBlocks('الأوائل على الخريطة', [
      `${PARTNER_LANDING_EARLY_MOVER_SECTION.title}`,
      `${PARTNER_LANDING_EARLY_MOVER_SECTION.lead}`,
      early,
    ]),
    joinBlocks('كيف تنضم', [`${PARTNER_LANDING_HOW_SECTION.title}`, `${PARTNER_LANDING_HOW_SECTION.lead}`]),
    joinBlocks('خطوات المسار', [steps]),
    joinBlocks('الباقات', [`${PARTNER_LANDING_PLANS_SECTION.title}`, `${PARTNER_LANDING_PLANS_SECTION.lead}`, plans]),
    joinBlocks('دعوة للإجراء', [
      `${PARTNER_LANDING_CTA_SECTION.title}`,
      `${PARTNER_LANDING_CTA_SECTION.lead}`,
      `شارات: ${PARTNER_LANDING_CTA_SECTION.chips.join(' — ')}`,
    ]),
    joinBlocks('صفحة لماذا تنضم', [
      `${PARTNER_WHY_PAGE.heroBadge}`,
      `${PARTNER_WHY_PAGE.heroTitle}`,
      `${PARTNER_WHY_PAGE.heroLead}`,
      whySections,
      `خاتمة: ${PARTNER_WHY_PAGE.closingQuote}`,
      `أزرار واجهة: ${PARTNER_WHY_PAGE.ctaPrimary} / ${PARTNER_WHY_PAGE.ctaSecondary}`,
    ]),
    joinBlocks('صفحة القصة والمسار', [
      `${PARTNER_STORY_PAGE.heroBadge}`,
      `${PARTNER_STORY_PAGE.heroTitle}`,
      `${PARTNER_STORY_PAGE.heroLead}`,
      storyChapters,
      `التوقيع: ${PARTNER_STORY_PAGE.signature}`,
      `أزرار واجهة: ${PARTNER_STORY_PAGE.ctaPrimary} / ${PARTNER_STORY_PAGE.ctaSecondary}`,
    ]),
  ].join('\n');
}
