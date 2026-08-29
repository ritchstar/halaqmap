/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState } from 'react';
import { STORE_PRODUCE_CATALOG, STORE_PRODUCE_CATEGORIES } from '@/config/storeProduceCatalog';
import { STORE_PRODUCE_LIVE } from '@/config/storeProduceLive';
import { activateProduceCatalogItem, parseProduceListText, type ProduceLabState } from '@/lib/storeProduceLiveLab';
import { cn } from '@/lib/utils';

export function StoreProduceIngest({
  state,
  onChange,
}: {
  state: ProduceLabState;
  onChange: (next: ProduceLabState) => void;
}) {
  const [category, setCategory] = useState(STORE_PRODUCE_CATEGORIES[0] || 'خضار ورقية');
  const [query, setQuery] = useState('');
  const [listText, setListText] = useState('طماطم 6\nرمان 11\nخس بلدي 3');
  const [listPhoto, setListPhoto] = useState('');
  const rows = useMemo(() => parseProduceListText(listText), [listText]);
  const filtered = STORE_PRODUCE_CATALOG.filter((item) => {
    if (item.category !== category) return false;
    if (!query.trim()) return true;
    return item.nameAr.includes(query.trim());
  });

  function applyList() {
    let next = state;
    for (const row of rows) {
      const hit = STORE_PRODUCE_CATALOG.find((item) => item.nameAr === row.nameAr)
        || STORE_PRODUCE_CATALOG.find((item) => item.nameAr.includes(row.nameAr.slice(0, 8)));
      if (hit) next = activateProduceCatalogItem(next, hit.id, row.price || hit.defaultPrice);
      else {
        next = {
          ...next,
          shelf: [
            ...next.shelf,
            {
              catalogId: `custom-${row.nameAr}`,
              nameAr: row.nameAr,
              category: 'مخصص',
              unit: 'kilo',
              price: row.price || 0,
              inStock: true,
              arrivedToday: true,
              featured: next.shelf.filter((item) => item.featured).length < 10,
            },
          ],
        };
      }
    }
    onChange(next);
  }

  return (
    <div className="space-y-5 rounded-2xl border border-white/12 p-4">
      <div>
        <h3 className="font-extrabold">{STORE_PRODUCE_LIVE.ingestTitleAr}</h3>
        <p className="mt-1 text-sm text-white/65">{STORE_PRODUCE_LIVE.catalogLeadAr}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {STORE_PRODUCE_CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={cn('rounded-full px-3 py-1 text-xs', category === item ? 'bg-[#3d8b4a] font-bold text-[#061018]' : 'border border-white/20')}
          >
            {item}
          </button>
        ))}
      </div>
      <input
        className="produce-field"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث عن سلعة"
      />
      <ul className="max-h-72 space-y-2 overflow-auto">
        {filtered.map((item) => {
          const active = state.shelf.find((row) => row.catalogId === item.id);
          return (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-sm">
              <span>
                <p className="font-bold">{item.nameAr}</p>
                <p className="text-xs text-white/50">{item.defaultPrice} ر.س / {item.unit === 'piece' ? 'حبة' : item.unit === 'bunch' ? 'حزمة' : item.unit === 'crate' ? 'صندوق' : 'كيلو'}</p>
              </span>
              <button
                type="button"
                onClick={() => onChange(activateProduceCatalogItem(state, item.id))}
                className={cn('rounded-full px-3 py-1 text-xs', active ? 'border border-[#3d8b4a]/50 text-[#3d8b4a]' : 'bg-[#3d8b4a] font-bold text-[#061018]')}
              >
                {active ? 'محدّث' : STORE_PRODUCE_LIVE.activateAr}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-white/10 pt-4">
        <h4 className="font-extrabold">{STORE_PRODUCE_LIVE.listIngestTitleAr}</h4>
        <p className="mt-1 text-sm text-white/65">{STORE_PRODUCE_LIVE.listIngestLeadAr}</p>
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
        <button type="button" onClick={applyList} className="mt-3 rounded-full bg-[#3d8b4a] px-4 py-2 text-sm font-bold text-[#061018]">
          احفظ الصفوف بعد المراجعة
        </button>
      </div>
    </div>
  );
}
