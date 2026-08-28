/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState } from 'react';
import { STORE_RESTAURANT_LIVE } from '@/config/storeRestaurantLive';
import {
  readSavedRestaurantBuyer,
  restaurantCartTotal,
  writeSavedRestaurantBuyer,
  type RestaurantLabState,
  type RestaurantOrderLine,
  type RestaurantPayMethod,
  type RestaurantService,
} from '@/lib/storeRestaurantLiveLab';
import { StoreRestaurantBuyerChat } from '@/components/store/StoreRestaurantChat';
import { StoreShopHoursBanner } from '@/components/store/StoreShopHoursBanner';
import { StoreShopPlacePin } from '@/components/store/StoreShopPlacePin';
import { STORE_SHOP_HOURS_COPY } from '@/config/storeShopHours';
import { isShopClosedNow } from '@/lib/storeShopHours';
import { cn } from '@/lib/utils';

export function StoreRestaurantShop({
  state,
  onChange,
}: {
  state: RestaurantLabState;
  onChange: (next: RestaurantLabState) => void;
}) {
  const saved = useMemo(() => readSavedRestaurantBuyer(), []);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState(saved?.name || '');
  const [phone, setPhone] = useState(saved?.phone || '');
  const [place, setPlace] = useState(saved?.place || '');
  const [note, setNote] = useState('');
  const [pay, setPay] = useState<RestaurantPayMethod>('cash');
  const [service, setService] = useState<RestaurantService>('delivery');
  const [saveBuyer, setSaveBuyer] = useState(Boolean(saved));
  const [sent, setSent] = useState('');

  const visible = state.shelf.filter((item) => item.inStock);
  const featured = visible.filter((item) => item.featured).slice(0, 8);
  const rest = visible.filter((item) => !featured.some((row) => row.catalogId === item.catalogId));
  const today = visible.find((item) => item.catalogId === 'today-board') || featured[0];
  const lines: RestaurantOrderLine[] = visible
    .map((item) => ({
      catalogId: item.catalogId,
      nameAr: item.nameAr,
      qty: qty[item.catalogId] || 0,
      price: item.price,
    }))
    .filter((line) => line.qty > 0);
  const total = restaurantCartTotal(lines);

  function bump(id: string, delta: number) {
    setQty((current) => {
      const next = Math.max(0, (current[id] || 0) + delta);
      return { ...current, [id]: next };
    });
  }

  function submit() {
    if (name.trim().length < 2 || phone.trim().length < 9 || !lines.length) return;
    if (service === 'delivery' && place.trim().length < 3) return;
    const ticketNo = state.host.nextTicket || 1;
    const order = {
      id: `${Date.now()}`,
      ticketNo,
      name: name.trim().slice(0, 40),
      phone: phone.trim().slice(0, 20),
      place: place.trim().slice(0, 160),
      note: note.trim().slice(0, 160),
      service,
      pay,
      lines,
      total,
      at: new Date().toISOString(),
      seen: false,
    };
    onChange({
      ...state,
      host: { ...state.host, nextTicket: ticketNo + 1 },
      orders: [order, ...state.orders].slice(0, 200),
    });
    writeSavedRestaurantBuyer(saveBuyer ? { name: order.name, phone: order.phone, place: order.place } : null);
    setQty({});
    setNote('');
    setSent(`وصلت تذكرة المطبخ رقم ${ticketNo}.`);
  }

  return (
    <div className="space-y-6">
      {state.host.flashAr.trim() ? (
        <p className="restaurant-flash overflow-hidden rounded-full border border-[#e08a3c]/40 bg-[#e08a3c]/15 px-4 py-2 text-sm text-[#f3d2b0]">
          {state.host.flashAr}
        </p>
      ) : null}
      <header>
        <p className="text-xs tracking-[0.3em] text-[#e08a3c]">{STORE_RESTAURANT_LIVE.shopKickerAr}</p>
        <h2 className="mt-1 flex items-center gap-2 text-3xl font-black">
          <span>{state.host.shopName}</span>
          <StoreShopPlacePin
            mapsUrl={state.host.pickupMapsUrl}
            visible={state.host.pickupPlaceVisible}
            accent="#e08a3c"
            labelAr={STORE_RESTAURANT_LIVE.pickupPinAriaAr}
          />
        </h2>
        <p className="mt-2 text-sm leading-7 text-white/75">{state.host.blurbAr}</p>
        <ul className="mt-3 space-y-1 text-sm leading-7 text-white/70">
          {state.host.customFields.filter((line) => line.trim()).slice(0, 5).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </header>
      <StoreShopHoursBanner hours={state.host} accent="#e08a3c" />

      {today ? (
        <section className="overflow-hidden rounded-2xl border border-[#e08a3c]/40 bg-[#1a1008]">
          <p className="px-4 pt-3 text-xs font-bold tracking-wide text-[#e08a3c]">{STORE_RESTAURANT_LIVE.todayTitleAr}</p>
          {today.photoSrc ? (
            <img src={today.photoSrc} alt="" className="mt-2 aspect-[16/9] w-full object-cover" />
          ) : (
            <div className="mt-2 flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-[#e08a3c]/40 to-[#061018] px-4 text-center text-xl font-black">
              {today.nameAr}
            </div>
          )}
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="font-extrabold">{today.nameAr} · {today.price} ر.س</p>
            <QtyRow value={qty[today.catalogId] || 0} onMinus={() => bump(today.catalogId, -1)} onPlus={() => bump(today.catalogId, 1)} />
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="text-lg font-extrabold">{STORE_RESTAURANT_LIVE.featuredTitleAr}</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((item) => (
            <article key={item.catalogId} className="overflow-hidden rounded-2xl border border-[#e08a3c]/30 bg-[#1a1008]">
              {item.photoSrc ? (
                <img src={item.photoSrc} alt="" className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-[#e08a3c]/35 to-[#061018] px-3 text-center text-sm font-bold">
                  {item.nameAr}
                </div>
              )}
              <div className="p-3">
                <p className="text-sm font-bold">{item.nameAr}</p>
                <p className="text-sm font-black text-[#e08a3c]">{item.price} ر.س</p>
                <QtyRow value={qty[item.catalogId] || 0} onMinus={() => bump(item.catalogId, -1)} onPlus={() => bump(item.catalogId, 1)} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-extrabold">{STORE_RESTAURANT_LIVE.shelfTitleAr}</h3>
        <ul className="mt-3 divide-y divide-white/8 rounded-2xl border border-white/10">
          {rest.map((item) => (
            <li key={item.catalogId} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <span className="flex min-w-0 items-center gap-3">
                {item.photoSrc ? <img src={item.photoSrc} alt="" className="h-12 w-12 rounded-lg object-cover" /> : null}
                <span>
                  <p className="text-sm font-bold">{item.nameAr}</p>
                  <p className="text-xs text-[#e08a3c]">{item.price} ر.س</p>
                </span>
              </span>
              <QtyRow value={qty[item.catalogId] || 0} onMinus={() => bump(item.catalogId, -1)} onPlus={() => bump(item.catalogId, 1)} />
            </li>
          ))}
        </ul>
      </section>

      <form
        id="restaurant-checkout"
        className="rounded-2xl border border-[#e08a3c]/35 bg-[#1a1008] p-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <h3 className="text-lg font-extrabold">
          {isShopClosedNow(state.host) ? STORE_SHOP_HOURS_COPY.preorderTitleAr : STORE_RESTAURANT_LIVE.checkoutTitleAr}
        </h3>
        <p className="mt-1 text-sm text-[#e08a3c]">الإجمالي الآن: {total} ر.س</p>
        <label className="mt-3 block text-sm">
          {STORE_RESTAURANT_LIVE.buyerNameLabelAr}
          <input required value={name} onChange={(e) => setName(e.target.value)} className="restaurant-field" maxLength={40} />
        </label>
        <label className="mt-3 block text-sm">
          {STORE_RESTAURANT_LIVE.buyerPhoneLabelAr}
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="restaurant-field" inputMode="tel" maxLength={20} />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setService('delivery')} className={cn('rounded-full px-3 py-1.5 text-xs', service === 'delivery' ? 'bg-[#e08a3c] font-bold text-[#061018]' : 'border border-white/20')}>
            {STORE_RESTAURANT_LIVE.serviceDeliveryAr}
          </button>
          <button type="button" onClick={() => setService('pickup')} className={cn('rounded-full px-3 py-1.5 text-xs', service === 'pickup' ? 'bg-[#e08a3c] font-bold text-[#061018]' : 'border border-white/20')}>
            {STORE_RESTAURANT_LIVE.servicePickupAr}
          </button>
        </div>
        {service === 'delivery' ? (
          <label className="mt-3 block text-sm">
            {STORE_RESTAURANT_LIVE.buyerPlaceLabelAr}
            <input required value={place} onChange={(e) => setPlace(e.target.value)} className="restaurant-field" maxLength={160} />
          </label>
        ) : null}
        <label className="mt-3 block text-sm">
          {STORE_RESTAURANT_LIVE.buyerNoteLabelAr}
          <input value={note} onChange={(e) => setNote(e.target.value)} className="restaurant-field" maxLength={160} />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setPay('cash')} className={cn('rounded-full px-3 py-1.5 text-xs', pay === 'cash' ? 'bg-[#e08a3c] font-bold text-[#061018]' : 'border border-white/20')}>
            {STORE_RESTAURANT_LIVE.payCashAr}
          </button>
          <button type="button" onClick={() => setPay('card')} className={cn('rounded-full px-3 py-1.5 text-xs', pay === 'card' ? 'bg-[#e08a3c] font-bold text-[#061018]' : 'border border-white/20')}>
            {STORE_RESTAURANT_LIVE.payCardAr}
          </button>
        </div>
        <label className="mt-4 flex items-start gap-2 text-sm leading-7">
          <input type="checkbox" checked={saveBuyer} onChange={(e) => setSaveBuyer(e.target.checked)} className="mt-1" />
          <span>{STORE_RESTAURANT_LIVE.saveBuyerAr}</span>
        </label>
        <button type="submit" className="mt-4 min-h-12 w-full rounded-full bg-[#e08a3c] text-sm font-bold text-[#061018]">
          {STORE_RESTAURANT_LIVE.submitOrderAr}
        </button>
        {sent ? <p className="mt-3 text-sm text-[#e08a3c]">{sent}</p> : null}
      </form>
      <StoreRestaurantBuyerChat state={state} onChange={onChange} />
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
      <button type="button" onClick={onPlus} className="h-8 w-8 rounded-full bg-[#e08a3c] text-lg font-black text-[#061018]">
        +
      </button>
    </div>
  );
}
