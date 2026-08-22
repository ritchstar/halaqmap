/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState } from 'react';
import { STORE_GROCERS_LIVE } from '@/config/storeGrocersLive';
import {
  compressImageFile,
  grocersCartTotal,
  readSavedGrocersBuyer,
  writeSavedGrocersBuyer,
  type GrocersLabState,
  type GrocersOrderLine,
  type GrocersPayMethod,
} from '@/lib/storeGrocersLiveLab';
import { StoreGrocersBuyerChat } from '@/components/store/StoreGrocersChat';
import { cn } from '@/lib/utils';

export function StoreGrocersShop({
  state,
  onChange,
}: {
  state: GrocersLabState;
  onChange: (next: GrocersLabState) => void;
}) {
  const saved = useMemo(() => readSavedGrocersBuyer(), []);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState(saved?.name || '');
  const [phone, setPhone] = useState(saved?.phone || '');
  const [place, setPlace] = useState(saved?.place || '');
  const [facadeSrc, setFacadeSrc] = useState('');
  const [pay, setPay] = useState<GrocersPayMethod>('cash');
  const [saveBuyer, setSaveBuyer] = useState(Boolean(saved));
  const [sent, setSent] = useState(false);

  const visible = state.shelf.filter((item) => item.inStock);
  const featured = visible.filter((item) => item.featured).slice(0, 10);
  const rest = visible.filter((item) => !featured.some((row) => row.catalogId === item.catalogId));
  const lines: GrocersOrderLine[] = visible
    .map((item) => ({
      catalogId: item.catalogId,
      nameAr: item.nameAr,
      qty: qty[item.catalogId] || 0,
      price: item.price,
    }))
    .filter((line) => line.qty > 0);
  const total = grocersCartTotal(lines);

  function bump(id: string, delta: number) {
    setQty((current) => {
      const next = Math.max(0, (current[id] || 0) + delta);
      return { ...current, [id]: next };
    });
  }

  async function onFacade(file?: File) {
    if (!file) return;
    try {
      setFacadeSrc(await compressImageFile(file, 900));
    } catch {
      setFacadeSrc('');
    }
  }

  function submit() {
    if (name.trim().length < 2 || phone.trim().length < 9 || !lines.length) return;
    const order = {
      id: `${Date.now()}`,
      name: name.trim().slice(0, 40),
      phone: phone.trim().slice(0, 20),
      place: place.trim().slice(0, 160),
      facadeSrc,
      pay,
      lines,
      total,
      at: new Date().toISOString(),
      seen: false,
    };
    onChange({ ...state, orders: [order, ...state.orders].slice(0, 200) });
    writeSavedGrocersBuyer(saveBuyer ? { name: order.name, phone: order.phone, place: order.place } : null);
    setQty({});
    setSent(true);
  }

  return (
    <div className="space-y-6">
      {state.host.flashAr.trim() ? (
        <p className="grocers-flash overflow-hidden rounded-full border border-[#8fbf7a]/40 bg-[#8fbf7a]/15 px-4 py-2 text-sm text-[#d8f0cc]">
          {state.host.flashAr}
        </p>
      ) : null}
      <header>
        <p className="text-xs tracking-[0.3em] text-[#8fbf7a]">{STORE_GROCERS_LIVE.shopKickerAr}</p>
        <h2 className="mt-1 text-3xl font-black">{state.host.shopName}</h2>
        <p className="mt-2 text-sm leading-7 text-white/75">{state.host.blurbAr}</p>
        <ul className="mt-3 space-y-1 text-sm leading-7 text-white/70">
          {state.host.customFields.filter((line) => line.trim()).slice(0, 5).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </header>

      <section>
        <h3 className="text-lg font-extrabold">{STORE_GROCERS_LIVE.featuredTitleAr}</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {featured.map((item) => (
            <article key={item.catalogId} className="overflow-hidden rounded-2xl border border-[#8fbf7a]/30 bg-[#102018]">
              <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-[#8fbf7a]/35 to-[#061018] px-3 text-center text-sm font-bold">
                {item.nameAr}
              </div>
              <div className="p-3">
                <p className="text-sm font-black text-[#8fbf7a]">{item.price} ر.س</p>
                <QtyRow value={qty[item.catalogId] || 0} onMinus={() => bump(item.catalogId, -1)} onPlus={() => bump(item.catalogId, 1)} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-extrabold">{STORE_GROCERS_LIVE.shelfTitleAr}</h3>
        <ul className="mt-3 divide-y divide-white/8 rounded-2xl border border-white/10">
          {rest.map((item) => (
            <li key={item.catalogId} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <span>
                <p className="text-sm font-bold">{item.nameAr}</p>
                <p className="text-xs text-[#8fbf7a]">{item.price} ر.س</p>
              </span>
              <QtyRow value={qty[item.catalogId] || 0} onMinus={() => bump(item.catalogId, -1)} onPlus={() => bump(item.catalogId, 1)} />
            </li>
          ))}
        </ul>
      </section>

      <form
        id="grocers-checkout"
        className="rounded-2xl border border-[#8fbf7a]/35 bg-[#0b1a14] p-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <h3 className="text-lg font-extrabold">{STORE_GROCERS_LIVE.checkoutTitleAr}</h3>
        <p className="mt-1 text-sm text-[#8fbf7a]">الإجمالي الآن: {total} ر.س</p>
        <label className="mt-3 block text-sm">
          {STORE_GROCERS_LIVE.buyerNameLabelAr}
          <input required value={name} onChange={(e) => setName(e.target.value)} className="grocers-field" maxLength={40} />
        </label>
        <label className="mt-3 block text-sm">
          {STORE_GROCERS_LIVE.buyerPhoneLabelAr}
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="grocers-field" inputMode="tel" maxLength={20} />
        </label>
        <label className="mt-3 block text-sm">
          {STORE_GROCERS_LIVE.buyerPlaceLabelAr}
          <input value={place} onChange={(e) => setPlace(e.target.value)} className="grocers-field" maxLength={160} />
        </label>
        <label className="mt-3 block text-sm">
          {STORE_GROCERS_LIVE.buyerFacadeLabelAr}
          <input type="file" accept="image/*" className="mt-2 block w-full text-xs" onChange={(e) => void onFacade(e.target.files?.[0])} />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setPay('cash')} className={cn('rounded-full px-3 py-1.5 text-xs', pay === 'cash' ? 'bg-[#8fbf7a] font-bold text-[#061018]' : 'border border-white/20')}>
            {STORE_GROCERS_LIVE.payCashAr}
          </button>
          <button type="button" onClick={() => setPay('card')} className={cn('rounded-full px-3 py-1.5 text-xs', pay === 'card' ? 'bg-[#8fbf7a] font-bold text-[#061018]' : 'border border-white/20')}>
            {STORE_GROCERS_LIVE.payCardAr}
          </button>
        </div>
        <label className="mt-4 flex items-start gap-2 text-sm leading-7">
          <input type="checkbox" checked={saveBuyer} onChange={(e) => setSaveBuyer(e.target.checked)} className="mt-1" />
          <span>{STORE_GROCERS_LIVE.saveBuyerAr}</span>
        </label>
        <button type="submit" className="mt-4 min-h-12 w-full rounded-full bg-[#8fbf7a] text-sm font-bold text-[#061018]">
          {STORE_GROCERS_LIVE.submitOrderAr}
        </button>
        {sent ? <p className="mt-3 text-sm text-[#8fbf7a]">وصل الطلب للكاشير.</p> : null}
      </form>
      <StoreGrocersBuyerChat state={state} onChange={onChange} />
    </div>
  );
}

function QtyRow({ value, onMinus, onPlus }: { value: number; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <button type="button" onClick={onMinus} className="h-8 w-8 rounded-full border border-white/20 text-lg">
        −
      </button>
      <span className="min-w-6 text-center text-sm font-bold">{value}</span>
      <button type="button" onClick={onPlus} className="h-8 w-8 rounded-full bg-[#8fbf7a] text-lg font-black text-[#061018]">
        +
      </button>
    </div>
  );
}
