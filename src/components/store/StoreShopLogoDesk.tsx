/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رفع شعار المحل من لوحة الحي. لا يُستخدم في قاعات المناسبة ولا اللاونج.
 */
import { useState } from 'react';
import { STORE_SHOP_LOGO_COPY, STORE_SHOP_LOGO_MAX_CHARS } from '@/config/storeShopLogo';
import { parseShopLogoSrc } from '@/lib/storeShopLogo';
import { compressImageFile } from '@/lib/storeWeddingLiveLab';

export function StoreShopLogoDesk({
  logoSrc,
  onChange,
  accent,
}: {
  logoSrc: string;
  onChange: (next: string) => void;
  accent: string;
}) {
  const [error, setError] = useState('');

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError('');
    try {
      let dataUrl = await compressImageFile(file, 192);
      if (dataUrl.length > STORE_SHOP_LOGO_MAX_CHARS) {
        dataUrl = await compressImageFile(file, 96);
      }
      const parsed = parseShopLogoSrc(dataUrl);
      if (!parsed) {
        setError(STORE_SHOP_LOGO_COPY.errorAr);
        return;
      }
      onChange(parsed);
    } catch {
      setError(STORE_SHOP_LOGO_COPY.errorAr);
    }
  }

  return (
    <div className="sm:col-span-2">
      <p className="text-sm">{STORE_SHOP_LOGO_COPY.labelAr}</p>
      <p className="mt-1 text-xs leading-6 text-white/55">{STORE_SHOP_LOGO_COPY.leadAr}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {logoSrc ? (
          <img src={logoSrc} alt="" width={48} height={48} className="h-12 w-12 rounded-full border border-white/20 object-cover" />
        ) : (
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-white/25 text-xs text-white/40">
            شعار
          </span>
        )}
        <label className="inline-flex cursor-pointer rounded-full px-4 py-2 text-sm font-extrabold text-[#061018]" style={{ backgroundColor: accent }}>
          {STORE_SHOP_LOGO_COPY.uploadAr}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              void onFile(file);
            }}
          />
        </label>
        {logoSrc ? (
          <button type="button" className="text-sm text-white/60 underline" onClick={() => onChange('')}>
            {STORE_SHOP_LOGO_COPY.removeAr}
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
