/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * اسم النشاط وشعاره — موضع موحّد أعلى لوحات الحي الخمس.
 */
import type { ReactNode } from 'react';
import { StoreOpsSection } from '@/components/store/StoreOpsSection';
import { StoreShopLogoDesk } from '@/components/store/StoreShopLogoDesk';
import { STORE_SHOP_LOGO_COPY } from '@/config/storeShopLogo';

export function StoreShopIdentityDesk({
  shopNameLabel,
  shopName,
  onShopNameChange,
  logoSrc,
  onLogoChange,
  blurbAr,
  onBlurbChange,
  customFields,
  onCustomFieldChange,
  customFieldLabel,
  accent,
  fieldClassName,
  extraFields,
}: {
  shopNameLabel: string;
  shopName: string;
  onShopNameChange: (value: string) => void;
  logoSrc: string;
  onLogoChange: (value: string) => void;
  blurbAr: string;
  onBlurbChange: (value: string) => void;
  customFields: readonly string[];
  onCustomFieldChange: (index: number, value: string) => void;
  customFieldLabel?: (index: number) => string;
  accent: string;
  fieldClassName: string;
  extraFields?: ReactNode;
}) {
  return (
    <StoreOpsSection titleAr={STORE_SHOP_LOGO_COPY.sectionAr} accent={accent} defaultOpen>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          {shopNameLabel}
          <input className={fieldClassName} value={shopName} onChange={(e) => onShopNameChange(e.target.value)} />
        </label>
        <StoreShopLogoDesk logoSrc={logoSrc} onChange={onLogoChange} accent={accent} />
        {extraFields}
        <label className="block text-sm sm:col-span-2">
          خانة تعريفية
          <input className={fieldClassName} value={blurbAr} onChange={(e) => onBlurbChange(e.target.value)} />
        </label>
        {customFields.map((line, index) => (
          <label key={index} className="block text-sm sm:col-span-2">
            {customFieldLabel?.(index) ?? `نص مخصص ${index + 1}`}
            <input
              className={fieldClassName}
              value={line}
              onChange={(e) => onCustomFieldChange(index, e.target.value)}
            />
          </label>
        ))}
      </div>
    </StoreOpsSection>
  );
}
