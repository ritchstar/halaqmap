/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دائرة الشعار بجوار اسم المحل في صفحة الحي.
 */
export function StoreShopLogoMark({ src }: { src: string }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      width={40}
      height={40}
      className="h-10 w-10 shrink-0 rounded-full border border-white/20 object-cover"
    />
  );
}
