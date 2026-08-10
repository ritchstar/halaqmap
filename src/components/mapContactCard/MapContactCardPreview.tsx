/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { RefObject } from 'react';
import { cn } from '@/lib/utils';
import { IMAGES } from '@/assets/images';
import { MAP_CONTACT_CARD_PRODUCT_NAME_AR } from '@/config/mapContactCardCopy';

export type MapContactCardPreviewProps = {
  alias: string;
  message: string;
  cityNameAr: string;
  iconGlyph: string;
  qrDataUrl: string | null;
  className?: string;
  /** للمشاركة/التنزيل — يُمرَّر كـ ref عبر wrapper */
  cardRef?: RefObject<HTMLDivElement | null>;
};

export function MapContactCardPreview({
  alias,
  message,
  cityNameAr,
  iconGlyph,
  qrDataUrl,
  className,
  cardRef,
}: MapContactCardPreviewProps) {
  return (
    <div
      ref={cardRef}
      dir="rtl"
      className={cn(
        'relative mx-auto w-full max-w-[340px] overflow-hidden rounded-[1.75rem]',
        'border border-teal-300/35 bg-[#041016] text-white',
        'shadow-[0_20px_50px_rgba(0,0,0,0.45)]',
        className,
      )}
      style={{
        aspectRatio: '9 / 16',
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(45,212,191,0.22), transparent 55%), linear-gradient(165deg, #0a1f2e 0%, #041016 48%, #0c1a14 100%)',
      }}
    >
      {/* شريط علم رفيع */}
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{
          background: 'linear-gradient(90deg, #006c35 0%, #006c35 72%, #fff 72%, #fff 100%)',
        }}
        aria-hidden
      />

      <div className="flex h-full flex-col px-5 pb-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-bold tracking-wide text-teal-300/90">
              {MAP_CONTACT_CARD_PRODUCT_NAME_AR}
            </p>
            <p className="mt-1 text-[0.62rem] font-semibold text-slate-400">طلب تواصل من زبون</p>
          </div>
          <img
            src={IMAGES.HALAQMAP_LOGO_20260409_073322_83}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 rounded-xl object-cover ring-2 ring-teal-400/35"
            decoding="async"
            crossOrigin="anonymous"
          />
        </div>

        <div className="mt-8 flex flex-col items-center text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full border border-teal-300/40 bg-teal-500/15 text-4xl shadow-[0_0_28px_rgba(45,212,191,0.25)]"
            aria-hidden
          >
            {iconGlyph}
          </div>

          {/* ختم المدينة */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-500/10 px-4 py-1.5">
            <span className="text-sm" aria-hidden>
              🇸🇦
            </span>
            <span className="text-sm font-black text-amber-100">ختم {cityNameAr}</span>
          </div>

          <h2 className="mt-5 max-w-[16rem] text-2xl font-black tracking-tight text-white">
            {alias.trim() || 'زائر ماب'}
          </h2>
          <p className="mt-3 max-w-[16rem] text-[0.95rem] font-semibold leading-relaxed text-slate-200">
            {message.trim() || 'أفضل البحث والتواصل عبر حلاق ماب.'}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <div className="min-w-0 text-right">
            <p className="text-[0.7rem] font-black text-teal-200">حلاق ماب</p>
            <p className="mt-0.5 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-slate-500" dir="ltr">
              HALAQ MAP
            </p>
            <p className="mt-2 text-[0.6rem] leading-snug text-slate-400">
              🔗 امسح للانضمام والظهور
            </p>
          </div>
          <div className="shrink-0 rounded-xl bg-white p-1.5 shadow-lg">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="رمز QR" width={88} height={88} className="h-[88px] w-[88px]" />
            ) : (
              <div className="flex h-[88px] w-[88px] items-center justify-center bg-slate-100 text-[0.55rem] text-slate-500">
                QR
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
