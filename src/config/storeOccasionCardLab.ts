/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مختبر نماذج البطاقة الحيّة — لا يُستورد من App.
 * لا يغيّر الأسعار ولا الدفع ولا رخصة النفاذ.
 */
export const STORE_OCCASION_CARD_LAB_ENABLED = true;

export type LabTier = 'quick' | 'featured' | 'luxury';
export type LabLifecycle = 'before' | 'day' | 'after';

export const STORE_OCCASION_CARD_LAB = {
  documentTitle: 'نماذج البطاقة الحيّة — خريطة الحل',
  kickerAr: 'مختبر تجريبي — بلا دفع',
  titleAr: 'ثلاثة مستويات لبطاقة مناسبة حيّة',
  leadAr:
    'قارن السريعة والمميزة والفاخرة على الجوال. الأسعار المعتمدة تبقى 12 و29 و59 ر.س. هذا العرض لا يفتح ميسر ولا يغيّر أسعار البطاقة.',
  skipMotionAr: 'تخطي الافتتاح',
  mapsLabelAr: 'فتح الموقع',
  calendarLabelAr: 'إضافة للتقويم',
} as const;

export const LAB_PALETTES = {
  quick: [
    { id: 'sand', labelAr: 'رملي', bg: '#f4efe4', ink: '#1c1914', accent: '#b0893e', paper: '#fffaf2', image: '/images/store/lab/lab-quick-sand.png' },
    { id: 'sage', labelAr: 'نعناعي', bg: '#e8eee6', ink: '#14201a', accent: '#3f6b52', paper: '#f6faf6', image: '/images/store/lab/lab-quick-sage.png' },
    { id: 'ink', labelAr: 'حبري', bg: '#dce3ea', ink: '#101820', accent: '#4a6780', paper: '#f4f7fa', image: '/images/store/lab/lab-quick-ink.png' },
    { id: 'blush', labelAr: 'خوخي', bg: '#f6e8e0', ink: '#2a1614', accent: '#c47a62', paper: '#fff6f1', image: '/images/store/lab/lab-quick-blush.png' },
    { id: 'sky', labelAr: 'سماوي', bg: '#e4eef4', ink: '#12202a', accent: '#5a7a94', paper: '#f4f9fc', image: '/images/store/lab/lab-quick-sky.png' },
    { id: 'honey', labelAr: 'عسلي', bg: '#f3ead4', ink: '#24180c', accent: '#c49a48', paper: '#fff8ea', image: '/images/store/lab/lab-quick-honey.png' },
  ],
  featured: [
    { id: 'rose', labelAr: 'وردي', bg: '#2a1218', ink: '#f8e7dc', accent: '#e8b4a2', paper: '#3a1c22', image: '/images/store/lab/lab-featured-rose.png' },
    { id: 'navy', labelAr: 'كحلي', bg: '#0e1a2e', ink: '#e8eef8', accent: '#c9a24a', paper: '#16243c', image: '/images/store/lab/lab-featured-navy.png' },
    { id: 'olive', labelAr: 'زيتي', bg: '#161c14', ink: '#e8eee0', accent: '#c4b07a', paper: '#22281c', image: '/images/store/lab/lab-featured-olive.png' },
    { id: 'plum', labelAr: 'برقوقي', bg: '#1c1424', ink: '#f0e4f4', accent: '#d4b8e0', paper: '#2a1c34', image: '/images/store/lab/lab-featured-plum.png' },
    { id: 'charcoal', labelAr: 'فحمي', bg: '#121416', ink: '#ece8e2', accent: '#c4b49a', paper: '#1c2024', image: '/images/store/lab/lab-featured-charcoal.png' },
    { id: 'terracotta', labelAr: 'طيني', bg: '#2a1810', ink: '#f6e8d8', accent: '#e0a070', paper: '#3a2418', image: '/images/store/lab/lab-featured-terracotta.png' },
    { id: 'teal', labelAr: 'فيروزي', bg: '#0c1c20', ink: '#e4f0ee', accent: '#7ec4c0', paper: '#14282c', image: '/images/store/lab/lab-featured-teal.png' },
    { id: 'champagne', labelAr: 'شامبانيا', bg: '#241c14', ink: '#f6ecd8', accent: '#dcc08a', paper: '#32281c', image: '/images/store/lab/lab-featured-champagne.png' },
  ],
  luxury: [
    { id: 'gold', labelAr: 'ذهبي', bg: '#0c0a08', ink: '#f4e6c8', accent: '#d4af67', paper: '#16120c', image: '/images/store/lab/lab-luxury-gold.png' },
    { id: 'ivory', labelAr: 'عاجي', bg: '#1a1610', ink: '#f7edd8', accent: '#e0c48a', paper: '#241e16', image: '/images/store/lab/lab-luxury-ivory.png' },
    { id: 'emerald', labelAr: 'زمردي', bg: '#081410', ink: '#e4f0e6', accent: '#c6a35a', paper: '#102018', image: '/images/store/lab/lab-luxury-emerald.png' },
    { id: 'garnet', labelAr: 'عقيقي', bg: '#14080c', ink: '#f6e4dc', accent: '#e0b080', paper: '#1e1014', image: '/images/store/lab/lab-luxury-garnet.png' },
    { id: 'onyx', labelAr: 'أونيكس', bg: '#08080a', ink: '#f0e8dc', accent: '#d4af67', paper: '#121214', image: '/images/store/lab/lab-luxury-onyx.png' },
    { id: 'sapphire', labelAr: 'ياقوتي', bg: '#081018', ink: '#e8eef8', accent: '#c9a24a', paper: '#101828', image: '/images/store/lab/lab-luxury-sapphire.png' },
    { id: 'bronze', labelAr: 'برونزي', bg: '#140e08', ink: '#f4e6d0', accent: '#c48448', paper: '#1e1610', image: '/images/store/lab/lab-luxury-bronze.png' },
    { id: 'pearl', labelAr: 'لؤلؤي', bg: '#161412', ink: '#f6f0e6', accent: '#d8c8b0', paper: '#221e1a', image: '/images/store/lab/lab-luxury-pearl.png' },
    { id: 'burgundy', labelAr: 'قرمزي', bg: '#16080c', ink: '#f6e4dc', accent: '#d4a060', paper: '#220e14', image: '/images/store/lab/lab-luxury-burgundy.png' },
    { id: 'amber', labelAr: 'عنبري', bg: '#120c08', ink: '#f4e6c8', accent: '#e0a040', paper: '#1c1410', image: '/images/store/lab/lab-luxury-amber.png' },
    { id: 'silver', labelAr: 'فضي', bg: '#0c1014', ink: '#e8eef4', accent: '#c0c8d4', paper: '#14181c', image: '/images/store/lab/lab-luxury-silver.png' },
    { id: 'rosegold', labelAr: 'وردي ذهبي', bg: '#160c10', ink: '#f8e8e0', accent: '#e0a888', paper: '#221418', image: '/images/store/lab/lab-luxury-rosegold.png' },
  ],
} as const;

export const LAB_SUBSTYLES = [
  { id: 'modern', labelAr: 'بسيط عصري' },
  { id: 'classic', labelAr: 'زخرفي تقليدي' },
  { id: 'floral', labelAr: 'ورد وزهور' },
] as const;
