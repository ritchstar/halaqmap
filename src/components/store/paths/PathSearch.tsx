/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بحث المسارات — يبحث في اسم المهنة/النشاط/الوسوم/الوصف، لا في اسم المنتج فقط.
 */
import { Search } from 'lucide-react';

export function PathSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="relative mx-auto block max-w-lg">
      <span className="sr-only">ابحث عن مهنتك أو نشاطك</span>
      <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#566269]" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="ابحث عن مهنتك أو نشاطك: طبخ منزلي، خضار، تموينات، مقهى، مناسبات..."
        className="min-h-11 w-full rounded-full border border-[#bdb5a7] bg-[#fffdf8] py-3 pl-4 pr-11 text-sm text-[#1f2933] outline-none transition placeholder:text-[#566269]/70 focus-visible:border-[#1d4f69] focus-visible:ring-2 focus-visible:ring-[#1d4f69]/30"
      />
    </label>
  );
}
