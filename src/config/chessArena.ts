/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ساحة الشطرنج — المرحلة الأولى: لعب ضد الذكاء الاصطناعي بثلاث مستويات،
 * بجلسة محفوظة محلياً (بلا خادم، بلا حساب). التشاركي والاشتراكات المدفوعة
 * مرحلتان لاحقتان غير مفعّلتين بعد — راجع docs/chess-arena-roadmap.md.
 */

export type ChessDifficultyId = 'beginner' | 'intermediate' | 'advanced';

export interface ChessDifficultyLevel {
  id: ChessDifficultyId;
  titleAr: string;
  descriptionAr: string;
  /** عمق البحث الأساسي (نصف-نقلات) قبل تمديد الوقت الإضافي عند التعادل بالتقييم. */
  searchDepth: number;
  /** أقصى زمن تفكير مسموح للذكاء الاصطناعي بالمللي ثانية (تعميق تكراري). */
  timeBudgetMs: number;
  /** احتمال أن يلعب الذكاء الاصطناعي نقلة عشوائية عمداً بدل الأفضل — يصنع مستوى «مبتدئ» قابلاً للفوز عليه. */
  blunderChance: number;
}

export const CHESS_DIFFICULTY_LEVELS: readonly ChessDifficultyLevel[] = [
  {
    id: 'beginner',
    titleAr: 'مبتدئ',
    descriptionAr: 'مناسب لمن يتعلم القواعد — يخطئ الذكاء الاصطناعي كثيراً ويمنحك فرصاً واضحة.',
    searchDepth: 1,
    timeBudgetMs: 150,
    blunderChance: 0.35,
  },
  {
    id: 'intermediate',
    titleAr: 'متوسط',
    descriptionAr: 'تحدٍ متوازن لمن يجيد الأساسيات ويريد تمريناً حقيقياً.',
    searchDepth: 2,
    timeBudgetMs: 400,
    blunderChance: 0.12,
  },
  {
    id: 'advanced',
    titleAr: 'محترف',
    descriptionAr: 'بحث أعمق بلا أخطاء متعمدة — للاعبين المتمرسين الباحثين عن تحدٍ جاد.',
    searchDepth: 3,
    timeBudgetMs: 900,
    blunderChance: 0,
  },
] as const;

export function getChessDifficultyLevel(id: ChessDifficultyId): ChessDifficultyLevel {
  return CHESS_DIFFICULTY_LEVELS.find((level) => level.id === id) ?? CHESS_DIFFICULTY_LEVELS[0];
}

export const CHESS_ARENA_COPY = {
  documentTitle: 'ساحة الشطرنج — العب ضد الذكاء الاصطناعي | خريطة الحل',
  heroBadgeAr: 'ساحة الشطرنج',
  heroTitleAr: 'العب الشطرنج ضد الذكاء الاصطناعي',
  heroSubtitleAr:
    'اختر مستوى التحدي الذي يناسبك، وابدأ اللعب فوراً بلا تسجيل ولا انتظار — وتبقى جلستك محفوظة طالما لم تُغلق المتصفح.',
  heroNoteAr: 'بلا حساب، بلا تحميل — يعمل بالكامل من داخل المتصفح.',
  comingSoonBadgeAr: 'قريباً',
  comingSoonTitleAr: 'ساحة تشاركية واشتراكات مدفوعة',
  comingSoonBodyAr:
    'نعمل على مرحلة لاحقة تتيح مواجهة لاعبين حقيقيين متصلين في نفس اللحظة، ضمن ساحة شطرنج مدفوعة الاشتراك — هذه الصفحة اليوم هي الأساس الذي تُبنى عليه تلك المرحلة.',
  pickLevelTitleAr: 'اختر مستوى الذكاء الاصطناعي',
  startButtonAr: 'ابدأ اللعب',
  resumeBannerAr: 'لديك مباراة محفوظة — تابع من حيث توقفت.',
  resumeButtonAr: 'تابع المباراة',
  newGameFromResumeAr: 'ابدأ مباراة جديدة بدلاً منها',
  resignButtonAr: 'استسلام',
  newGameButtonAr: 'مباراة جديدة',
  changeLevelButtonAr: 'تغيير المستوى',
  backHomeAr: 'الرئيسية',
  playerLabelAr: 'أنت',
  aiLabelAr: 'الذكاء الاصطناعي',
  turnPlayerAr: 'دورك للعب',
  turnAiAr: 'الذكاء الاصطناعي يفكّر…',
  checkAr: 'كش!',
  checkmatePlayerWinsAr: 'كش ملك! لقد فزت 🎉',
  checkmateAiWinsAr: 'كش ملك! فاز الذكاء الاصطناعي هذه المرة.',
  drawAr: 'تعادل.',
  resignedAr: 'استسلمت — انتهت المباراة.',
  promotionTitleAr: 'اختر الترقية',
  confirmResignAr: 'هل تريد الاستسلام وإنهاء هذه المباراة؟',
  confirmNewGameWhilePlayingAr: 'ستفقد تقدّم المباراة الحالية إن بدأت مباراة جديدة. متابعة؟',
} as const;

/** مفتاح تخزين جلسة اللعب المحلية — نمط «Lab» المتّبع في بقية المنتجات. */
export const CHESS_SESSION_STORAGE_KEY = 'halaqmap-chess-arena:v1';
