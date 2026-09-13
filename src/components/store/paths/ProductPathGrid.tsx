/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { ProductPathDefinition } from '@/config/storeProductPathTypes';
import { ProductPathCard } from '@/components/store/paths/ProductPathCard';

export function ProductPathGrid({
  paths,
  onReset,
}: {
  paths: readonly ProductPathDefinition[];
  onReset: () => void;
}) {
  if (paths.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#bdb5a7] bg-[#fffaf4] px-6 py-14 text-center">
        <p className="text-base font-extrabold text-[#1f2933]">لا توجد مسارات مطابقة</p>
        <p className="mt-2 text-sm leading-6 text-[#566269]">جرّب كلمة أخرى أو أعد ضبط الفلاتر.</p>
        <button
          type="button"
          onClick={onReset}
          className="mt-5 min-h-11 rounded-full border border-[#1d4f69] px-5 py-2.5 text-sm font-extrabold text-[#1d4f69] transition hover:bg-[#1d4f69]/5"
        >
          إعادة ضبط الفلاتر
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {paths.map((path) => (
        <ProductPathCard key={path.slug} path={path} />
      ))}
    </div>
  );
}
