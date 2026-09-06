/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * روابط النمو والدعم ثابتة أسفل يسار لوحات التشغيل — بلا تزاحم مع أدوات المشغّل.
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function StoreDeskCornerDock({ children }: { children: ReactNode }) {
  return (
    <nav
      className="store-live-desk-corner pointer-events-none fixed bottom-2 left-2 z-40 flex flex-col items-start gap-1 pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] sm:bottom-3 sm:left-3"
      aria-label="نمو ودعم المنتج"
    >
      {children}
    </nav>
  );
}

export function StoreDeskCornerLink({
  to,
  labelAr,
  ariaLabel,
  badge,
}: {
  to: string;
  labelAr: string;
  ariaLabel?: string;
  badge?: boolean;
}) {
  return (
    <Link
      to={to}
      className="store-live-store-link pointer-events-auto relative inline-flex items-center gap-1.5"
      aria-label={ariaLabel || labelAr}
      title={ariaLabel || labelAr}
    >
      {badge ? (
        <span
          className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#e23d3d]"
          aria-hidden
        />
      ) : null}
      {labelAr}
    </Link>
  );
}

export function StoreDeskCornerButton({
  labelAr,
  ariaLabel,
  pressed,
  onClick,
}: {
  labelAr: string;
  ariaLabel?: string;
  pressed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={pressed}
      aria-label={ariaLabel || labelAr}
      title={ariaLabel || labelAr}
      className={cn(
        'store-live-store-link pointer-events-auto cursor-pointer border-0 bg-transparent p-0 text-start',
        pressed && 'text-[rgba(232,197,71,0.82)]',
      )}
    >
      {labelAr}
    </button>
  );
}
