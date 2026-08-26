/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState } from 'react';
import { STORE_CAFE_CATEGORIES, STORE_CAFE_MENU } from '@/config/storeCafeMenu';
import { STORE_CAFE_LIVE } from '@/config/storeCafeLive';
import { activateCafeDrink, compressImageFile, parseCafeListText, type CafeLabState } from '@/lib/storeCafeLiveLab';
import { cn } from '@/lib/utils';

export function StoreCafeMenuBoard({
  state,
  onChange,
}: {
  state: CafeLabState;
  onChange: (next: CafeLabState) => void;
}) {
  const [category, setCategory] = useState(STORE_CAFE_CATEGORIES[0] || 'حار');
  const [query, setQuery] = useState('');
  const [listText, setListText] = useState('قهوة عربية 8\nلاتيه 14');
  const [listPhoto, setListPhoto] = useState('');
  const rows = useMemo(() => parseCafeListText(listText), [listText]);
  const filtered = STORE_CAFE_MENU.filter((item) => {
    if (item.category !== category) return false;
    if (!query.trim()) return true;
    return item.nameAr.includes(query.trim());
  });

  function applyList() {
    let next = state;
    for (const row of rows) {
      const hit = STORE_CAFE_MENU.find((item) => item.nameAr === row.nameAr)
        || STORE_CAFE_MENU.find((item) => item.nameAr.includes(row.nameAr.slice(0, 6)));
      if (hit) next = activateCafeDrink(next, hit.id, row.price || hit.defaultPrice);
      else {
        next = {
          ...next,
          shelf: [
            ...next.shelf,
            {
              catalogId: `custom-${row.nameAr}`,
              nameAr: row.nameAr,
              category: 'مخصص',
              price: row.price || 0,
              inStock: true,
              featured: next.shelf.filter((item) => item.featured).length < 8,
              photoSrc: '',
            },
          ],
        };
      }
    }
    onChange(next);
  }

  async function setPhoto(catalogId: string, file?: File) {
    if (!file) return;
    try {
      const photoSrc = await compressImageFile(file, 900);
      onChange({
        ...state,
        shelf: state.shelf.map((item) => (item.catalogId === catalogId ? { ...item, photoSrc } : item)),
      });
    } catch {
      /* تجاهل الملف غير الصالح */
    }
  }

  return (
    <div className="space-y-5 rounded-2xl border border-white/12 p-4">
      <div>
        <h3 className="font-extrabold">{STORE_CAFE_LIVE.ingestTitleAr}</h3>
        <p className="mt-1 text-sm text-white/65">{STORE_CAFE_LIVE.catalogLeadAr}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {STORE_CAFE_CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={cn('rounded-full px-3 py-1 text-xs', category === item ? 'bg-[#c48a4a] font-bold text-[#061018]' : 'border border-white/20')}
          >
            {item}
          </button>
        ))}
      </div>
      <input
        className="cafe-field"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث عن طبق"
      />
      <ul className="max-h-72 space-y-2 overflow-auto">
        {filtered.map((item) => {
          const active = state.shelf.find((row) => row.catalogId === item.id);
          return (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-sm">
              <span>
                <p className="font-bold">{item.nameAr}</p>
                <p className="text-xs text-white/50">{item.defaultPrice} ر.س مقترح</p>
              </span>
              <button
                type="button"
                onClick={() => onChange(activateCafeDrink(state, item.id))}
                className={cn('rounded-full px-3 py-1 text-xs', active ? 'border border-[#c48a4a]/50 text-[#c48a4a]' : 'bg-[#c48a4a] font-bold text-[#061018]')}
              >
                {active ? 'محدّث' : STORE_CAFE_LIVE.activateAr}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="rounded-xl border border-white/10 p-3">
        <h4 className="font-extrabold">{STORE_CAFE_LIVE.photoUploadAr}</h4>
        <ul className="mt-2 space-y-2">
          {state.shelf.slice(0, 16).map((item) => (
            <li key={item.catalogId} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate">{item.nameAr}</span>
              <input
                type="file"
                accept="image/*"
                className="max-w-40 text-xs"
                onChange={(e) => void setPhoto(item.catalogId, e.target.files?.[0])}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-white/10 pt-4">
        <h4 className="font-extrabold">{STORE_CAFE_LIVE.listIngestTitleAr}</h4>
        <p className="mt-1 text-sm text-white/65">{STORE_CAFE_LIVE.listIngestLeadAr}</p>
        <textarea
          className="mt-2 h-28 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm"
          value={listText}
          onChange={(e) => setListText(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          className="mt-2 block w-full text-xs"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setListPhoto(String(reader.result || ''));
            reader.readAsDataURL(file);
          }}
        />
        {listPhoto ? <img src={listPhoto} alt="" className="mt-2 max-h-40 rounded-xl object-contain" /> : null}
        <ul className="mt-2 space-y-1 text-xs text-white/70">
          {rows.map((row) => (
            <li key={row.nameAr}>
              {row.nameAr} — {row.price || 'بلا سعر'}
            </li>
          ))}
        </ul>
        <button type="button" onClick={applyList} className="mt-3 rounded-full bg-[#c48a4a] px-4 py-2 text-sm font-bold text-[#061018]">
          احفظ الصفوف بعد المراجعة
        </button>
      </div>
    </div>
  );
}
