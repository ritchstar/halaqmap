/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ساحة بلوت — نصوص واجهة المرحلة الأولى التأسيسية (حكم فقط، مجاني بالكامل).
 */

/** هدف النقاط الافتراضي للمباراة — قابل للتعديل لاحقاً دون مساس بمنطق المحرك. */
export const BALOOT_MATCH_TARGET_SCORE = 152;

/** مفتاح تخزين جلسة ساحة بلوت محلياً (localStorage). */
export const BALOOT_SESSION_STORAGE_KEY = 'halaqmap-baloot-arena:v1';

export const BALOOT_ARENA_COPY = {
  documentTitle: 'ساحة بلوت — العب حكم ضد الذكاء الاصطناعي | خريطة الحل',
  heroBadgeAr: 'ساحة بلوت',
  heroTitleAr: 'العب بلوت (حكم) ضد الذكاء الاصطناعي',
  heroSubtitleAr:
    'فريق حقيقي ٢ ضد ٢ — أنت وشريكك الآلي في مواجهة خصمين آليين، بقواعد حكم الأساسية: السرى والبلوت والكبّوت.',
  heroNoteAr: 'مرحلة أولى تأسيسية: حكم فقط بلا صن أو مضاعفة بعد — تجربة مجانية بالكامل.',
  comingSoonBadgeAr: 'قريباً',
  comingSoonTitleAr: 'صن، المضاعفة، ولعب حقيقي مع أصدقائك',
  comingSoonBodyAr: 'بعد أن نستقر على جودة الذكاء الاصطناعي في هذه المرحلة، نضيف صن والمضاعفة ثم التعدد الحقيقي بين لاعبين بشريين.',
  backHomeAr: 'رجوع للرئيسية',
  soundOnAr: 'كتم الصوت',
  soundOffAr: 'تشغيل الصوت',
  newMatchAr: 'مباراة جديدة',
  resumeMatchAr: 'استكمال المباراة',
  resumeBannerAr: 'لديك مباراة بلوت محفوظة — أكمل من حيث توقفت أو ابدأ من جديد.',
  startMatchAr: 'ابدأ المباراة',
  passAr: 'تمرير',
  declareHokumAr: 'أعلن الحكم',
  chooseSuitAr: 'اختر بذلة الحكم',
  yourTurnToBidAr: 'دورك — أعلن الحكم أو مرّر',
  waitingForBidAr: 'بانتظار مزايدة اللاعبين الآخرين…',
  forcedDealerBidAr: 'مرّر الجميع — الموزّع يُجبر على إعلان الحكم.',
  playCardAr: 'العب الورقة',
  yourTurnToPlayAr: 'دورك — اختر ورقة',
  handScoredAr: 'انتهى الشوط',
  matchWonAr: 'فزتم بالمباراة! 🎉',
  matchLostAr: 'خسرتم المباراة — حظ أوفر المرة القادمة',
  playerTeamLabelAr: 'فريقكم',
  opponentTeamLabelAr: 'فريق الخصم',
  siraBonusLabelAr: 'سرى',
  balootBonusLabelAr: 'بلوت',
  kabootBonusLabelAr: 'كبّوت',
  confirmNewMatchWhilePlayingAr: 'يوجد مباراة قائمة — هل تريد بدء مباراة جديدة بدلاً منها؟',
} as const;

export const BALOOT_SEAT_LABELS_AR: Record<'south' | 'west' | 'north' | 'east', string> = {
  south: 'أنت',
  west: 'الخصم (يسار)',
  north: 'شريكك',
  east: 'الخصم (يمين)',
};

export const BALOOT_SUIT_LABELS_AR: Record<'hearts' | 'diamonds' | 'clubs' | 'spades', string> = {
  hearts: 'هارت (كوبة)',
  diamonds: 'دياموند (ديناري)',
  clubs: 'كلوب (سباتي)',
  spades: 'سبيد (بستوني)',
};

export const BALOOT_SUIT_SYMBOLS: Record<'hearts' | 'diamonds' | 'clubs' | 'spades', string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};
