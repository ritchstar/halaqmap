/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شعار ثقة لتسجيل المصنف لدى الهيئة السعودية للملكية الفكرية.
 * يُستخدم فقط للمنتجات الخمسة الصادرة شهاداتها. لا يُستورد من App.
 */
import { ShieldCheck } from 'lucide-react';
import { STORE_SAIP_COPY, storeSaipWorkById, type StoreSaipProductId } from '@/config/storeSaipRegistry';
import { cn } from '@/lib/utils';

type Props = {
  productId: StoreSaipProductId;
  className?: string;
};

export function StoreSaipTrustLine({ productId, className }: Props) {
  const work = storeSaipWorkById(productId);
  if (!work) return null;

  return (
    <p className={cn('mt-3 max-w-xl text-sm leading-7 text-white/65', className)}>
      <ShieldCheck className="mb-0.5 ml-1 inline h-3.5 w-3.5 align-text-bottom text-white/50" aria-hidden />
      {work.titleAr}
      {' '}
      {STORE_SAIP_COPY.phraseAr}
      .
      {' '}
      {STORE_SAIP_COPY.certLabelAr}
      {' '}
      <code dir="ltr" className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-[0.85em] font-bold text-white/80">
        {work.certificateNo}
      </code>
      .
    </p>
  );
}
