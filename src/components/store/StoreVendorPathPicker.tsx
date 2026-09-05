/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * اختيار مسار ثابت أو متحرك على نفس المنتج، بلا لقب رابع.
 */
import { STORE_MOBILE_VENDOR, type StoreVendorMode } from '@/config/storeMobileVendor';
import { cn } from '@/lib/utils';

export function StoreVendorPathPicker({
  value,
  onChange,
  accent,
  titleAr,
  leadAr,
  fixedTitleAr,
  mobileTitleAr,
}: {
  value: StoreVendorMode;
  onChange: (mode: StoreVendorMode) => void;
  accent: string;
  titleAr?: string;
  leadAr?: string;
  fixedTitleAr?: string;
  mobileTitleAr?: string;
}) {
  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-extrabold">{titleAr ?? STORE_MOBILE_VENDOR.pathTitleAr}</legend>
      {leadAr ? <p className="mt-1 text-xs leading-6 text-white/60">{leadAr}</p> : null}
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange('fixed')}
          className={cn('rounded-2xl border px-4 py-3 text-right', value === 'fixed' ? '' : 'border-white/15')}
          style={value === 'fixed' ? { borderColor: accent, backgroundColor: `${accent}26` } : undefined}
        >
          <p className="font-extrabold">{fixedTitleAr ?? STORE_MOBILE_VENDOR.fixedTitleAr}</p>
          <p className="mt-1 text-xs leading-6 text-white/65">{STORE_MOBILE_VENDOR.fixedLeadAr}</p>
        </button>
        <button
          type="button"
          onClick={() => onChange('mobile')}
          className={cn('store-mobile-shell rounded-2xl border px-4 py-3 text-right', value === 'mobile' ? '' : 'border-white/15')}
          style={{ color: accent, ...(value === 'mobile' ? { borderColor: accent, backgroundColor: `${accent}26` } : {}) }}
        >
          <p className="font-extrabold">{mobileTitleAr ?? STORE_MOBILE_VENDOR.mobileTitleAr}</p>
          <p className="mt-1 text-xs leading-6 text-white/65">{STORE_MOBILE_VENDOR.mobileLeadAr}</p>
        </button>
      </div>
    </fieldset>
  );
}
