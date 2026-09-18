/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ساحة الشطرنج — المرحلة الأولى (مطوَّرة): لعب ضد الذكاء الاصطناعي بثلاث
 * مستويات، محرك Stockfish الحقيقي لمستوى «محترف» (مع خط رجوع آمن للمحرك
 * المحلي عند تعذّر التحميل)، ولوحة بتصميم أرقى — كل ذلك بجلسة محفوظة
 * محلياً (بلا خادم، بلا حساب). التشاركي والاشتراكات المدفوعة مرحلتان
 * لاحقتان غير مفعّلتين بعد — راجع docs/chess-arena-roadmap.md.
 */

export type ChessDifficultyId = 'beginner' | 'intermediate' | 'advanced';

export interface ChessDifficultyLevel {
  id: ChessDifficultyId;
  titleAr: string;
  descriptionAr: string;
  /** عمق البحث الأساسي (نصف-نقلات) قبل تمديد الوقت الإضافي عند التعادل بالتقييم — للمحرك المحلي فقط. */
  searchDepth: number;
  /** أقصى زمن تفكير مسموح بالمللي ثانية — يُستخدم أيضاً كـ movetime لمحرك Stockfish عند تفعيله. */
  timeBudgetMs: number;
  /** احتمال أن يلعب المحرك المحلي نقلة عشوائية عمداً بدل الأفضل — يصنع مستوى «مبتدئ» قابلاً للفوز عليه. */
  blunderChance: number;
  /** استخدام محرك Stockfish الحقيقي (عبر Web Worker) بدل المحرك المحلي، مع خط رجوع تلقائي عند التعذّر. */
  useStockfish: boolean;
  /** قيمة UCI «Skill Level» (0 أضعف – 20 أقوى) عند تفعيل Stockfish. */
  stockfishSkillLevel?: number;
}

export const CHESS_DIFFICULTY_LEVELS: readonly ChessDifficultyLevel[] = [
  {
    id: 'beginner',
    titleAr: 'مبتدئ',
    descriptionAr: 'مناسب لمن يتعلم القواعد — يخطئ الذكاء الاصطناعي كثيراً ويمنحك فرصاً واضحة.',
    searchDepth: 1,
    timeBudgetMs: 150,
    blunderChance: 0.35,
    useStockfish: false,
  },
  {
    id: 'intermediate',
    titleAr: 'متوسط',
    descriptionAr: 'تحدٍ متوازن لمن يجيد الأساسيات ويريد تمريناً حقيقياً.',
    searchDepth: 2,
    timeBudgetMs: 400,
    blunderChance: 0.12,
    useStockfish: false,
  },
  {
    id: 'advanced',
    titleAr: 'محترف',
    descriptionAr: 'محرك Stockfish الحقيقي بأقصى قوة — للاعبين المتمرسين الباحثين عن تحدٍ جاد.',
    searchDepth: 3,
    timeBudgetMs: 900,
    blunderChance: 0,
    useStockfish: true,
    stockfishSkillLevel: 20,
  },
] as const;

export function getChessDifficultyLevel(id: ChessDifficultyId): ChessDifficultyLevel {
  return CHESS_DIFFICULTY_LEVELS.find((level) => level.id === id) ?? CHESS_DIFFICULTY_LEVELS[0];
}

/** طرق اللعب الحقيقية من حيث الوقت — ساعة فعلية تحكم مسار المباراة، وليست ديكوراً. */
export type ChessTimeControlId = 'bullet3' | 'blitz5' | 'rapid10' | 'untimed';

export interface ChessTimeControl {
  id: ChessTimeControlId;
  labelAr: string;
  /** المدة بالمللي ثانية، أو null لوضع «بلا وقت» (بلا ساعة إطلاقاً). */
  ms: number | null;
}

export const CHESS_TIME_CONTROLS: readonly ChessTimeControl[] = [
  { id: 'bullet3', labelAr: 'خاطفة · 3 دقائق', ms: 3 * 60_000 },
  { id: 'blitz5', labelAr: 'سريعة · 5 دقائق', ms: 5 * 60_000 },
  { id: 'rapid10', labelAr: 'عادية · 10 دقائق', ms: 10 * 60_000 },
  { id: 'untimed', labelAr: 'بلا وقت', ms: null },
] as const;

export function getChessTimeControl(id: ChessTimeControlId): ChessTimeControl {
  return CHESS_TIME_CONTROLS.find((tc) => tc.id === id) ?? CHESS_TIME_CONTROLS[2];
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
  checkmatePlayerWinsAr: 'كش ملك! لقد فزت',
  checkmateAiWinsAr: 'كش ملك! فاز الذكاء الاصطناعي هذه المرة',
  drawAr: 'تعادل',
  resignedAr: 'استسلمت — انتهت المباراة',
  timeoutAr: 'انتهى وقتك — خسرت المباراة',
  promotionTitleAr: 'اختر الترقية',
  confirmResignAr: 'هل تريد الاستسلام وإنهاء هذه المباراة؟',
  confirmNewGameWhilePlayingAr: 'ستفقد تقدّم المباراة الحالية إن بدأت مباراة جديدة. متابعة؟',
  movesLabelAr: 'النقلات',
  analysisTabLabelAr: 'التحليل',
  matchLogTitleAr: 'سجل المباراة',
  capturedByPlayerAr: 'قطع كسبتها',
  capturedByAiAr: 'قطع خسرتها',
  materialAdvantagePlayerAr: 'أنت متقدّم بمقدار',
  materialAdvantageAiAr: 'الذكاء الاصطناعي متقدّم بمقدار',
  materialEvenAr: 'المواد متعادلة بين الطرفين الآن',
  turnIndicatorLabelAr: 'الدور الآن',
  soundOnAr: 'الصوت مُفعَّل',
  soundOffAr: 'الصوت مُعطَّل',
  engineStockfishActiveAr: 'محرك Stockfish نشط',
  engineLocalFallbackAr: 'المحرك المحلي (Stockfish غير متاح الآن)',
  engineCheckingAr: 'جاري التحقق من المحرك…',
  resultOverlayNewGameAr: 'مباراة جديدة',
  opponentCardTitleAr: 'الخصم',
  controlPadTitleAr: 'لوحة القيادة',
  hintButtonAr: 'تلميح',
  hintLoadingAr: 'يفكّر…',
  undoButtonAr: 'تراجع',
  yourClockLabelAr: 'وقتك',
  aiThinkBudgetLabelAr: 'ميزانية تفكير الذكاء الاصطناعي',
  untimedLabelAr: 'بلا وقت',

  // طرق اللعب (التحكم بالوقت)
  pickTimeControlTitleAr: 'اختر طريقة اللعب',

  // الإحصائيات الحقيقية (محفوظة محلياً)
  statsCardTitleAr: 'إحصائياتك',
  statsPlayedAr: 'مباريات',
  statsWinsAr: 'فوز',
  statsLossesAr: 'خسارة',
  statsDrawsAr: 'تعادل',
  statsByLevelTitleAr: 'حسب المستوى',

  // أدوات (PGN/FEN)
  toolsTitleAr: 'أدوات',
  copyPgnButtonAr: 'نسخ PGN',
  copyFenButtonAr: 'نسخ FEN',
  copiedFeedbackAr: 'تم النسخ',
  copyFailedFeedbackAr: 'تعذّر النسخ',

  // مراجعة النقلات
  reviewToStartAr: 'بداية المباراة',
  reviewPrevAr: 'النقلة السابقة',
  reviewNextAr: 'النقلة التالية',
  reviewLiveAr: 'الوضع الحالي (مباشر)',
  reviewingBadgeAr: 'أنت تستعرض نقلة سابقة',
} as const;

/** مدة ساعة اللاعب الافتراضية (10 دقائق) — عدّاد تنازلي حقيقي يعمل فقط أثناء دور اللاعب. */
export const CHESS_CLOCK_START_MS = 10 * 60_000;

/** مفتاح تخزين جلسة اللعب المحلية — نمط «Lab» المتّبع في بقية المنتجات. */
export const CHESS_SESSION_STORAGE_KEY = 'halaqmap-chess-arena:v1';

/** مفتاح تخزين تفضيل الصوت محلياً. */
export const CHESS_SOUND_PREF_STORAGE_KEY = 'halaqmap-chess-arena-sound:v1';
