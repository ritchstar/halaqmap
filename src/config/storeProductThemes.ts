/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * سجل ثيمات منتجات المتجر — جار الحي والتشغيل.
 * لا تُستورد من App.
 */

export type StoreProductThemeContext = 'storefront' | 'operator';

export type StoreProductThemeTokens = {
  pageBg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  accent: string;
  accentSecondary?: string;
  accentWarm?: string;
  field?: string;
};

export type StoreProductId =
  | 'halana'
  | 'kitchen'
  | 'produce'
  | 'grocers'
  | 'restaurant'
  | 'cafe'
  | 'lounge'
  | 'dates'
  | 'wedding'
  | 'event'
  | 'occasion_card';

export type StoreProductThemePair = Record<StoreProductThemeContext, StoreProductThemeTokens>;

/** خلفية احتياطية — ممنوع الرجوع للأسود */
export const STORE_PRODUCT_THEME_FALLBACK: StoreProductThemePair = {
  storefront: {
    pageBg: '#F3EEE6',
    surface: '#FBF8F2',
    surfaceAlt: '#EDE8DF',
    text: '#1F292D',
    muted: '#667176',
    accent: '#167E78',
  },
  operator: {
    pageBg: '#EEEAE4',
    surface: '#FBF8F2',
    surfaceAlt: '#E8E4DD',
    text: '#1F292D',
    muted: '#667176',
    accent: '#167E78',
    field: '#FFFFFF',
  },
};

export const FORBIDDEN_PAGE_BACKGROUNDS = new Set([
  '#000000',
  '#020912',
  '#070a0d',
  '#080808',
  '#0b0b0d',
  '#050308',
  '#14080c',
  '#0c1115',
  '#11181d',
]);

export const STORE_PRODUCT_THEMES: Record<StoreProductId, StoreProductThemePair> = {
  halana: {
    // محدّث ليطابق هوية تصميم "حلانا1" (Chatly): عاجي دافئ + توتي/فرنبوازي + بني وردي غامق.
    storefront: {
      pageBg: '#F7F2EC',
      surface: '#FFFBF7',
      surfaceAlt: '#F0E2DE',
      text: '#3A2227',
      muted: '#7A5F63',
      accent: '#B3426D',
      accentWarm: '#C59A57',
    },
    operator: {
      pageBg: '#F1E7E1',
      surface: '#FFF9F5',
      surfaceAlt: '#E8D6D1',
      text: '#301B20',
      muted: '#7A6266',
      accent: '#A23A61',
      field: '#FFFFFF',
    },
  },
  kitchen: {
    // محدّث ليطابق هوية تصميم "طبختنا1" (Chatly): برتقالي/كهرماني دافئ لمطبخ منزلي.
    storefront: {
      pageBg: '#F4E6D2',
      surface: '#FFF8EF',
      surfaceAlt: '#E9D3B0',
      text: '#2A1E14',
      muted: '#6E5A47',
      accent: '#C2410C',
      accentSecondary: '#F59E0B',
    },
    operator: {
      pageBg: '#EEE1CB',
      surface: '#FBF6EF',
      surfaceAlt: '#E3CFA8',
      text: '#271C13',
      muted: '#6A5745',
      accent: '#B23A0F',
      field: '#FFFFFF',
    },
  },
  produce: {
    // محدّث ليطابق هوية تصميم "خضارنا1" (Chatly): أخضر زيتوني على خلفية كريمية.
    storefront: {
      pageBg: '#F4F1E8',
      surface: '#FBFAF5',
      surfaceAlt: '#E7E4D6',
      text: '#20352B',
      muted: '#5C6B5F',
      accent: '#3F7440',
    },
    operator: {
      pageBg: '#EEEBDF',
      surface: '#F8F6EE',
      surfaceAlt: '#DEDBC9',
      text: '#1C2E24',
      muted: '#586A5C',
      accent: '#396B3C',
      field: '#FFFFFF',
    },
  },
  grocers: {
    // محدّث ليطابق هوية تصميم "تمويناتا1" (Chatly): أزرق أساسي + برتقالي ثانوي على رمادي فاتح.
    storefront: {
      pageBg: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceAlt: '#E2E8F0',
      text: '#0F172A',
      muted: '#475569',
      accent: '#1D4ED8',
      accentSecondary: '#F97316',
    },
    operator: {
      pageBg: '#EEF2F7',
      surface: '#FFFFFF',
      surfaceAlt: '#DCE3EC',
      text: '#0F172A',
      muted: '#475569',
      accent: '#1D4ED8',
      field: '#FFFFFF',
    },
  },
  restaurant: {
    storefront: {
      pageBg: '#F2E2D9',
      surface: '#FFF8F3',
      surfaceAlt: '#E8D0C4',
      text: '#302018',
      muted: '#746058',
      accent: '#A94E34',
    },
    operator: {
      pageBg: '#ECDED4',
      surface: '#FBF4EE',
      surfaceAlt: '#E2C8BA',
      text: '#2E2018',
      muted: '#71655C',
      accent: '#A94E34',
      field: '#FFFFFF',
    },
  },
  cafe: {
    storefront: {
      pageBg: '#EDE2D4',
      surface: '#FAF5EE',
      surfaceAlt: '#DFD0BE',
      text: '#2E2118',
      muted: '#6F6256',
      accent: '#865437',
    },
    operator: {
      pageBg: '#E7DCCF',
      surface: '#F8F2EA',
      surfaceAlt: '#D8C8B4',
      text: '#2A1E16',
      muted: '#6A5E53',
      accent: '#865437',
      field: '#FFFFFF',
    },
  },
  lounge: {
    storefront: {
      pageBg: '#E6E7ED',
      surface: '#F7F7FA',
      surfaceAlt: '#D5D7E2',
      text: '#252836',
      muted: '#5E6270',
      accent: '#4E5679',
    },
    operator: {
      pageBg: '#E0E2E9',
      surface: '#F3F4F8',
      surfaceAlt: '#CACDD8',
      text: '#252836',
      muted: '#5E6270',
      accent: '#4E5679',
      field: '#FFFFFF',
    },
  },
  dates: {
    storefront: {
      pageBg: '#EEE2CE',
      surface: '#FBF6EC',
      surfaceAlt: '#E2D2B4',
      text: '#2E2418',
      muted: '#6F6250',
      accent: '#8A6239',
    },
    operator: {
      pageBg: '#E8DCC8',
      surface: '#F9F4EA',
      surfaceAlt: '#DAC8AA',
      text: '#2A2016',
      muted: '#6A5E4C',
      accent: '#8A6239',
      field: '#FFFFFF',
    },
  },
  wedding: {
    storefront: {
      pageBg: '#F4EEE2',
      surface: '#FFFCF7',
      surfaceAlt: '#E8DFCF',
      text: '#2E2618',
      muted: '#6F6658',
      accent: '#9C7A38',
    },
    operator: {
      pageBg: '#EEE8DC',
      surface: '#FBF8F2',
      surfaceAlt: '#E0D6C4',
      text: '#2A2316',
      muted: '#6A6356',
      accent: '#9C7A38',
      field: '#FFFFFF',
    },
  },
  event: {
    storefront: {
      pageBg: '#EBE8F2',
      surface: '#FAF9FC',
      surfaceAlt: '#DAD4E6',
      text: '#2A2436',
      muted: '#655E74',
      accent: '#67558B',
    },
    operator: {
      pageBg: '#E5E2EC',
      surface: '#F6F5FA',
      surfaceAlt: '#D0C8DE',
      text: '#262030',
      muted: '#605A6A',
      accent: '#67558B',
      field: '#FFFFFF',
    },
  },
  occasion_card: {
    storefront: {
      pageBg: '#ECEDEF',
      surface: '#FAFAFB',
      surfaceAlt: '#DDE0E4',
      text: '#232629',
      muted: '#636870',
      accent: '#5C6470',
    },
    operator: {
      pageBg: '#E6E8EA',
      surface: '#F6F7F8',
      surfaceAlt: '#D4D8DC',
      text: '#232629',
      muted: '#636870',
      accent: '#5C6470',
      field: '#FFFFFF',
    },
  },
};
