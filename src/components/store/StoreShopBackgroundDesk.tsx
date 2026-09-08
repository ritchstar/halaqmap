/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { STORE_SHOP_BACKGROUND_COPY } from '@/config/storeShopBackgroundCopy';
import { StoreOpsSection } from '@/components/store/StoreOpsSection';
import { compressImageFile } from '@/lib/storeKitchenLiveLab';
import { sanitizeShopBackground, type ShopBackgroundFields } from '@/lib/storeShopBackground';

const PRESET_COLORS = ['#14080c', '#1a1208', '#06201e', '#0b1a10', '#1a0c08', '#e8c547', '#14b8a6', '#c45c7a'] as const;

export function StoreShopBackgroundDesk({
  value,
  onChange,
  accent,
  fieldClassName,
}: {
  value: ShopBackgroundFields;
  onChange: (next: ShopBackgroundFields) => void;
  accent: string;
  fieldClassName: string;
}) {
  return (
    <StoreOpsSection titleAr={STORE_SHOP_BACKGROUND_COPY.sectionAr} accent={accent}>
      <p className="mb-4 text-sm leading-7 text-white/65">{STORE_SHOP_BACKGROUND_COPY.leadAr}</p>
      <BackgroundField
        label={STORE_SHOP_BACKGROUND_COPY.headerLabelAr}
        hint={STORE_SHOP_BACKGROUND_COPY.headerHintAr}
        bg={value.shopHeaderBg}
        onChange={(shopHeaderBg) => onChange({ ...value, shopHeaderBg })}
        accent={accent}
        fieldClassName={fieldClassName}
      />
      <BackgroundField
        label={STORE_SHOP_BACKGROUND_COPY.pageLabelAr}
        hint={STORE_SHOP_BACKGROUND_COPY.pageHintAr}
        bg={value.shopPageBg}
        onChange={(shopPageBg) => onChange({ ...value, shopPageBg })}
        accent={accent}
        fieldClassName={fieldClassName}
      />
    </StoreOpsSection>
  );
}

function BackgroundField({
  label,
  hint,
  bg,
  onChange,
  accent,
  fieldClassName,
}: {
  label: string;
  hint: string;
  bg: string;
  onChange: (value: string) => void;
  accent: string;
  fieldClassName: string;
}) {
  const safe = sanitizeShopBackground(bg);
  const isColor = safe.startsWith('#');

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm font-extrabold" style={{ color: accent }}>
        {label}
      </p>
      <p className="mt-1 text-xs leading-6 text-white/55">{hint}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            title={color}
            onClick={() => onChange(color)}
            className="h-9 w-9 rounded-full border-2 border-white/20"
            style={{ background: color }}
          />
        ))}
        <label className="inline-flex cursor-pointer items-center rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold">
          {STORE_SHOP_BACKGROUND_COPY.imageLabelAr}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              void compressImageFile(file, 1200).then(onChange).catch(() => undefined);
              event.target.value = '';
            }}
          />
        </label>
        {safe ? (
          <button type="button" onClick={() => onChange('')} className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold text-white/70">
            {STORE_SHOP_BACKGROUND_COPY.clearAr}
          </button>
        ) : null}
      </div>
      <label className="mt-3 block text-sm">
        {STORE_SHOP_BACKGROUND_COPY.colorLabelAr}
        <input
          className={fieldClassName}
          value={isColor ? safe : ''}
          onChange={(e) => onChange(e.target.value.trim())}
          placeholder="#14080c"
          maxLength={9}
        />
      </label>
      {safe ? (
        <div
          className="mt-3 h-16 overflow-hidden rounded-xl border border-white/10"
          style={
            safe.startsWith('linear-gradient') || safe.startsWith('radial-gradient')
              ? { background: safe }
              : isColor
                ? { backgroundColor: safe }
                : { backgroundImage: `url(${safe})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          }
        />
      ) : null}
    </div>
  );
}
