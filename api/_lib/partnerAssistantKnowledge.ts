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
  PARTNER_LANDING_BENEFITS_SECTION,
  PARTNER_LANDING_BEFORE_AFTER,
  PARTNER_LANDING_SOCIAL_PROOF,
  PARTNER_LANDING_SOCIAL_MOMENTUM,
  PARTNER_LANDING_QR_PROMO,
  PARTNER_LANDING_QUALITY_SEALS,
  PARTNER_LANDING_TESTIMONIALS_SECTION,
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
  const benefits = PARTNER_LANDING_BENEFITS_SECTION.items.map((b) => `- ${b.title}: ${b.body}`).join('\n');
  const before = PARTNER_LANDING_BEFORE_AFTER.before.bullets.map((b) => `- ${b}`).join('\n');
  const after = PARTNER_LANDING_BEFORE_AFTER.after.bullets.map((b) => `- ${b}`).join('\n');
  const seals = PARTNER_LANDING_QUALITY_SEALS.map((s) => `- ${s.title}: ${s.body}`).join('\n');
  const stories = PARTNER_LANDING_TESTIMONIALS_SECTION.stories
    .map((s) => `- «${s.quote}» (${s.attribution})`)
    .join('\n');
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
    joinBlocks('رمز QR لمسار الشركاء', [
      `${PARTNER_LANDING_QR_PROMO.kicker}`,
      `${PARTNER_LANDING_QR_PROMO.title}`,
      ...PARTNER_LANDING_QR_PROMO.steps.map((s) => `- ${s}`),
      `${PARTNER_LANDING_QR_PROMO.hint}`,
    ]),
    joinBlocks('لماذا حلاق ماب', [`${PARTNER_LANDING_WHY_SECTION.title}`, `${PARTNER_LANDING_WHY_SECTION.lead}`]),
    joinBlocks('ماذا تستفيد', [
      `${PARTNER_LANDING_BENEFITS_SECTION.title}`,
      `${PARTNER_LANDING_BENEFITS_SECTION.lead}`,
      benefits,
    ]),
    joinBlocks('قبل وبعد التسجيل', [
      `${PARTNER_LANDING_BEFORE_AFTER.title}`,
      `${PARTNER_LANDING_BEFORE_AFTER.subtitle}`,
      `قبل: ${PARTNER_LANDING_BEFORE_AFTER.before.label}`,
      before,
      `بعد: ${PARTNER_LANDING_BEFORE_AFTER.after.label}`,
      after,
    ]),
    joinBlocks('محفزات اجتماعية', [
      `${PARTNER_LANDING_SOCIAL_PROOF.statHeadline}`,
      `${PARTNER_LANDING_SOCIAL_PROOF.statDetail}`,
      `${PARTNER_LANDING_SOCIAL_PROOF.note}`,
      `${PARTNER_LANDING_SOCIAL_PROOF.momentumTitle}: ${PARTNER_LANDING_SOCIAL_PROOF.momentumLead}`,
      ...PARTNER_LANDING_SOCIAL_MOMENTUM.map((m) => `- ${m.label}: ${m.body}`),
    ]),
    joinBlocks('أختام الجودة', [seals]),
    joinBlocks('آراء الحلاقين (أمثلة)', [
      `${PARTNER_LANDING_TESTIMONIALS_SECTION.title}`,
      `${PARTNER_LANDING_TESTIMONIALS_SECTION.lead}`,
      stories,
    ]),
    joinBlocks('كيف يعمل', [`${PARTNER_LANDING_HOW_SECTION.title}`, `${PARTNER_LANDING_HOW_SECTION.lead}`]),
    joinBlocks('خطوات المسار', [steps]),
    joinBlocks('الباقات', [`${PARTNER_LANDING_PLANS_SECTION.title}`, `${PARTNER_LANDING_PLANS_SECTION.lead}`, plans]),
    joinBlocks('دعوة للإجراء', [
      `${PARTNER_LANDING_CTA_SECTION.title}`,
      `${PARTNER_LANDING_CTA_SECTION.lead}`,
      `شارات: ${PARTNER_LANDING_CTA_SECTION.chips.join(' — ')}`,
      `أزرار واجهة: ${PARTNER_LANDING_CTA_SECTION.primaryCta} / ${PARTNER_LANDING_CTA_SECTION.secondaryCta}`,
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
