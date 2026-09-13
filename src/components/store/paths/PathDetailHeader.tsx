/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ترويسة صفحة المسار الفردي — مسار تنقّل (breadcrumb) + عنوان + ملخص + CTA
 * رئيسي مرئي على كل المقاسات (سطح المكتب والجوال معاً، بخلاف الشريط الثابت
 * MobilePathCTA المخصص للجوال فقط).
 */
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/routePaths';

export function PathDetailHeader({
  shortTitleAr,
  titleAr,
  summaryAr,
  categoryAr,
  accent,
  href,
  external,
  ctaLabelAr,
  onCtaClick,
}: {
  shortTitleAr: string;
  titleAr: string;
  summaryAr: string;
  categoryAr: string;
  accent: string;
  href: string;
  external: boolean;
  ctaLabelAr: string;
  onCtaClick: () => void;
}) {
  const ctaClassName =
    'inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-extrabold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

  return (
    <header className="flex flex-col gap-4">
      <nav aria-label="مسار التنقل" className="flex flex-wrap items-center gap-1.5 text-xs text-[#566269]">
        <Link to={ROUTE_PATHS.STORE_PATHS_LAB} className="min-h-11 py-2 hover:text-[#1f2933]">
          صفحة المسارات
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-bold text-[#1f2933]">{shortTitleAr}</span>
      </nav>

      <div className="flex flex-col gap-3">
        <span
          className="w-fit rounded-full px-3 py-1 text-[11px] font-extrabold text-white"
          style={{ backgroundColor: accent }}
        >
          {categoryAr}
        </span>
        <h1 className="text-xl font-extrabold text-[#1f2933] sm:text-2xl">{titleAr}</h1>
        <p className="max-w-2xl text-sm leading-7 text-[#566269] sm:text-base">{summaryAr}</p>
        {external ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ctaClassName} w-fit`}
            style={{ backgroundColor: accent }}
            onClick={onCtaClick}
          >
            {ctaLabelAr}
          </a>
        ) : (
          <Link to={href} className={`${ctaClassName} w-fit`} style={{ backgroundColor: accent }} onClick={onCtaClick}>
            {ctaLabelAr}
          </Link>
        )}
      </div>
    </header>
  );
}
