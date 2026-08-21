/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * عبارات ترحيب قاعة الزواج — تظهر ثلاثاً ثلاثاً من لوحة المضيف.
 * لا يُستورد من App.
 */

export type WeddingWelcomeWeight = 'hero' | 'support' | 'caption';

export type WeddingWelcomeLine = {
  id: string;
  textAr: string;
  weight: WeddingWelcomeWeight;
};

export type WeddingWelcomeSet = {
  id: string;
  toneAr: string;
  lines: readonly [WeddingWelcomeLine, WeddingWelcomeLine, WeddingWelcomeLine];
};

export const STORE_WEDDING_WELCOME_SET_SIZE = 3 as const;

export const STORE_WEDDING_WELCOME_SETS = [
  {
    id: 'formal',
    toneAr: 'ترحيب رسمي',
    lines: [
      {
        id: 'formal-hero',
        weight: 'hero',
        textAr:
          'أهلاً ومرحباً بكم. تكتمل بهجتنا بوجودكم، وتشرفنا تلبية دعوتنا لمشاركتنا فرحة العمر. حضوركم إكليل فرح يزين ليلتنا.',
      },
      {
        id: 'formal-support',
        weight: 'support',
        textAr:
          'بكل فخر واعتزاز، وبأجمل عبارات الترحيب، نتشرف بحضوركم الكريم ليشاركنا فرحتنا ويضفي على حفلنا بهجة وسروراً.',
      },
      {
        id: 'formal-caption',
        weight: 'caption',
        textAr:
          'حيّ الله من لفانا ونوّر حفلنا. حضوركم شرف نعتز به، ومشاركتكم فرحتنا فرحة لا تكتمل إلا بوجودكم الكريم.',
      },
    ],
  },
  {
    id: 'warm',
    toneAr: 'دفء وامتنان',
    lines: [
      {
        id: 'warm-hero',
        weight: 'hero',
        textAr:
          'بكل الحب والود، ندعوكم لمشاركتنا أسعد لحظات العمر. بحضوركم ومباركتكم تزداد قاعتنا نوراً وفرحاً، وتُبنى أجمل الذكريات.',
      },
      {
        id: 'warm-support',
        weight: 'support',
        textAr:
          'الفرحة لا تكتمل إلا بكم، والبهجة لا تكتمل إلا بنوركم. يسعدنا أن تكونوا شهوداً على ميثاق الحب والوفاء في ليلتنا الكبرى.',
      },
      {
        id: 'warm-caption',
        weight: 'caption',
        textAr:
          'ليلتنا تزداد شعاعاً بوجودكم، وقلوبنا تفيض شكراً لتلبية دعوتنا. دمتم لنا سنداً وفرحاً يملأ العمر.',
      },
    ],
  },
  {
    id: 'display',
    toneAr: 'شاشة وتنويه',
    lines: [
      {
        id: 'display-hero',
        weight: 'hero',
        textAr: 'أنرتم حفلنا. شاركونا كلماتكم الطيبة ودعواتكم الصادقة للعرسان عبر الرابط.',
      },
      {
        id: 'display-support',
        weight: 'support',
        textAr: 'مرحباً بضيوفنا الكرام. يسعدنا استقبال تهانيكم وصوركم الحية لتزيّن شاشتنا الآن.',
      },
      {
        id: 'display-caption',
        weight: 'caption',
        textAr: 'حضوركم يملأ المكان فرحاً. أهلاً وسهلاً بكم في ليلة العمر.',
      },
    ],
  },
  {
    id: 'heritage',
    toneAr: 'ترحيب أصيل',
    lines: [
      {
        id: 'heritage-hero',
        weight: 'hero',
        textAr:
          'يا مرحباً ترحيبةٍ كلها شوق، ترحيبة تملأ الفضاء والمساحة. أهلاً بكم عدّ ما لاح بالبرق بروق، وعدّ الشجر ما هبّ ريحه وطاحه.',
      },
      {
        id: 'heritage-support',
        weight: 'support',
        textAr: 'هلا باللي لفا الصالة ونوّرها بعد غياب. هلا باللي يشاركنا الفرح في ليلة العمر.',
      },
      {
        id: 'heritage-caption',
        weight: 'caption',
        textAr: 'بوجودكم تبتسم الليلة. مرحباً بكم تراحيب المطر.',
      },
    ],
  },
] as const satisfies readonly WeddingWelcomeSet[];

export function weddingWelcomeSetCount(): number {
  return STORE_WEDDING_WELCOME_SETS.length;
}

export function normalizeWeddingWelcomeSetIndex(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  const count = weddingWelcomeSetCount();
  const idx = Math.trunc(n);
  return ((idx % count) + count) % count;
}

export function nextWeddingWelcomeSetIndex(current: unknown): number {
  return (normalizeWeddingWelcomeSetIndex(current) + 1) % weddingWelcomeSetCount();
}

export function weddingWelcomeSetAt(raw: unknown): (typeof STORE_WEDDING_WELCOME_SETS)[number] {
  return STORE_WEDDING_WELCOME_SETS[normalizeWeddingWelcomeSetIndex(raw)];
}

export function weddingWelcomeHeroText(raw: unknown): string {
  return weddingWelcomeSetAt(raw).lines[0].textAr;
}
