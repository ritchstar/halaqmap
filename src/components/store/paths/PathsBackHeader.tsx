/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شريط علوي على خلفية صورة سوق تراثي — شعار + "العودة للمتجر"، فوق شريط
 * صورة بعرض الصفحة يفتح صفحة المسارات. موجود عشان الزائر ما ينحصر داخل
 * تجربة المسارات بلا طريق رجوع واضح.
 */
import { Link } from 'react-router-dom';
import { StoreBrandMark } from '@/components/store/StoreBrandMark';
import { ROUTE_PATHS } from '@/lib/routePaths';

const PATHS_HERO_IMAGE = '/images/store/paths-hero-souk.jpg';

export function PathsBackHeader() {
  return (
    <header
      className="relative flex min-h-40 items-center justify-between gap-3 overflow-hidden rounded-3xl border border-[#bdb5a7] bg-cover bg-center px-4 py-4 sm:min-h-56 sm:px-6"
      style={{ backgroundImage: `url(${PATHS_HERO_IMAGE})` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/45" aria-hidden />
      <Link to={ROUTE_PATHS.STORE_LANDING} className="relative z-10 flex items-center gap-2">
        <StoreBrandMark className="h-8 w-8" />
        <span className="text-sm font-extrabold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)]">منصة خريطة الحل</span>
      </Link>
      <Link
        to={ROUTE_PATHS.STORE_LANDING}
        className="relative z-10 flex min-h-11 items-center rounded-full border border-[#bdb5a7] bg-[#fffdf8] px-4 text-sm font-bold text-[#1f2933] underline-offset-4 transition hover:border-[#1f2933] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        العودة للمتجر
      </Link>
    </header>
  );
}
