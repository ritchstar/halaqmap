/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شريط علوي بسيط — شعار + "العودة للمتجر"، بنفس نمط رأس فهرس الكتالوج
 * القديم (SolutionCatalogApp.tsx). موجود عشان الزائر ما ينحصر داخل
 * تجربة المسارات بلا طريق رجوع واضح.
 */
import { Link } from 'react-router-dom';
import { StoreBrandMark } from '@/components/store/StoreBrandMark';
import { ROUTE_PATHS } from '@/lib/routePaths';

export function PathsBackHeader() {
  return (
    <header className="flex items-center justify-between gap-3">
      <Link to={ROUTE_PATHS.STORE_LANDING} className="flex items-center gap-2">
        <StoreBrandMark className="h-8 w-8" />
        <span className="text-sm font-extrabold text-[#1f2933]">خريطة الحل</span>
      </Link>
      <Link
        to={ROUTE_PATHS.STORE_LANDING}
        className="flex min-h-11 items-center rounded-full border border-[#bdb5a7] bg-[#fffdf8] px-4 text-sm font-bold text-[#1f2933] underline-offset-4 transition hover:border-[#1f2933] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        العودة للمتجر
      </Link>
    </header>
  );
}
