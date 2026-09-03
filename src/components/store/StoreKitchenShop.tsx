/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState } from 'react';
import { STORE_KITCHEN_LIVE } from '@/config/storeKitchenLive';
import { STORE_SHOP_HOURS_COPY } from '@/config/storeShopHours';
import { StoreShopHoursBanner } from '@/components/store/StoreShopHoursBanner';
import { StoreShopLogoMark } from '@/components/store/StoreShopLogoMark';
import {
  addKitchenOrder,
  compressImageFile,
  kitchenCartTotal,
  newKitchenIdempotencyKey,
  readSavedKitchenBuyer,
  writeSavedKitchenBuyer,
  type KitchenLabState,
  type KitchenOrderLine,
  type KitchenPayMethod,
  type KitchenService,
} from '@/lib/storeKitchenLiveLab';
import { StoreBuyerLocateButtons } from '@/components/store/StoreBuyerLocateButtons';
import { StoreDirectPayGuest, StoreDirectPayPublicMount } from '@/components/store/StoreDirectPayGuest';
import { isShopClosedNow } from '@/lib/storeShopHours';
import { cn } from '@/lib/utils';

export function StoreKitchenShop({
  state,
  onChange,
  token,
}: {
  state: KitchenLabState;
  onChange: (next: KitchenLabState) => void;
  token: string;
}) {
  const saved = useMemo(() => readSavedKitchenBuyer(), []);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState(saved?.name || '');
  const [phone, setPhone] = useState(saved?.phone || '');
  const [place, setPlace] = useState(saved?.place || '');
  const [note, setNote] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [deliveryPhotoSrc, setDeliveryPhotoSrc] = useState('');
  const [pay, setPay] = useState<KitchenPayMethod>('cash');
  const [service, setService] = useState<KitchenService>('delivery');
  const [saveBuyer, setSaveBuyer] = useState(Boolean(saved));
  const [sent, setSent] = useState('');
  const [lastKey, setLastKey] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(newKitchenIdempotencyKey);

  const orderable = state.shelf.filter((item) => item.inStock);
  const soldOut = state.host.showSoldOut ? state.shelf.filter((item) => !item.inStock) : [];
  const featured = orderable.filter((item) => item.featured).slice(0, 8);
  const rest = orderable.filter((item) => !featured.some((row) => row.catalogId === item.catalogId));
  const today = orderable.find((item) => item.catalogId === 'today-board') || featured[0];
  const lines: KitchenOrderLine[] = orderable
    .map((item) => ({
      catalogId: item.catalogId,
      nameAr: item.nameAr,
      qty: qty[item.catalogId] || 0,
      price: item.price,
    }))
    .filter((line) => line.qty > 0);
  const deliveryFee = service === 'delivery' ? Math.max(0, state.host.deliveryFee) : 0;
  const total = kitchenCartTotal(lines, service, state.host.deliveryFee);

  function bump(id: string, delta: number) {
    setQty((current) => {
      const next = Math.max(0, (current[id] || 0) + delta);
      return { ...current, [id]: next };
    });
  }

  function submit() {
    if (!state.host.acceptingOrders) return;
    if (name.trim().length < 2 || phone.trim().length < 9 || !lines.length) return;
    if (service === 'delivery' && place.trim().length < 3) return;
    const ticketNo = state.host.nextTicket || 1;
    const order = {
      id: `${Date.now()}`,
      ticketNo,
      idempotencyKey,
      name: name.trim().slice(0, 40),
      phone: phone.trim().slice(0, 20),
      place: service === 'delivery' ? place.trim().slice(0, 240) : '',
      note: note.trim().slice(0, 160),
      service,
      pay,
      lines,
      deliveryFee,
      total,
      at: new Date().toISOString(),
      scheduledAt: state.host.scheduleEnabled ? scheduledAt.trim().slice(0, 40) : '',
      deliveryPhotoSrc: service === 'delivery' ? deliveryPhotoSrc : '',
      seen: false,
    };
    onChange(addKitchenOrder(state, order));
    writeSavedKitchenBuyer(saveBuyer ? { name: order.name, phone: order.phone, place: order.place } : null);
    setQty({});
    setNote('');
    setScheduledAt('');
    setDeliveryPhotoSrc('');
    setLastKey(idempotencyKey);
    setIdempotencyKey(newKitchenIdempotencyKey());
    setSent(`وصلت تذكرة النشاط رقم ${ticketNo}.`);
  }

  const myTicket = lastKey ? state.orders.find((item) => item.idempotencyKey === lastKey) : undefined;
  const pickupMaps = state.host.pickupPlaceVisible ? state.host.pickupMapsUrl : '';

  return (
    <div className="space-y-6">
      {state.host.flashAr.trim() ? (
        <p className="restaurant-flash overflow-hidden rounded-full border border-[#b45a3c]/40 bg-[#b45a3c]/15 px-4 py-2 text-sm text-[#f3d2b0]">
          {state.host.flashAr}
        </p>
      ) : null}
      <header>
        <p className="text-xs tracking-[0.3em] text-[#b45a3c]">{STORE_KITCHEN_LIVE.shopKickerAr}</p>
        <h2 className="mt-1 flex items-center gap-2 text-3xl font-black">
          <StoreShopLogoMark src={state.host.logoSrc} />
          <span>{state.host.shopName}</span>
        </h2>
        <p className="mt-2 text-sm leading-7 text-white/75">{state.host.blurbAr}</p>
        <ul className="mt-3 space-y-1 text-sm leading-7 text-white/70">
          {state.host.customFields.filter((line) => line.trim()).slice(0, 5).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </header>
      <StoreShopHoursBanner hours={state.host} accent="#b45a3c" />

      {today ? (
        <section className="overflow-hidden rounded-2xl border border-[#b45a3c]/40 bg-[#1a0c08]">
          <p className="px-4 pt-3 text-xs font-bold tracking-wide text-[#b45a3c]">{STORE_KITCHEN_LIVE.todayTitleAr}</p>
          {today.photoSrc ? (
            <img src={today.photoSrc} alt="" className="mt-2 aspect-[16/9] w-full object-cover" />
          ) : (
            <div className="mt-2 flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-[#b45a3c]/40 to-[#061018] px-4 text-center text-xl font-black">
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
        <h3 className="text-lg font-extrabold">{STORE_KITCHEN_LIVE.featuredTitleAr}</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((item) => (
            <article key={item.catalogId} className="overflow-hidden rounded-2xl border border-[#b45a3c]/30 bg-[#1a0c08]">
              {item.photoSrc ? (
                <img src={item.photoSrc} alt="" className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-[#b45a3c]/35 to-[#061018] px-3 text-center text-sm font-bold">
                  {item.nameAr}
                </div>
              )}
              <div className="p-3">
                <p className="text-sm font-bold">{item.nameAr}</p>
                <p className="text-sm font-black text-[#b45a3c]">{item.price} ر.س</p>
                <QtyRow value={qty[item.catalogId] || 0} onMinus={() => bump(item.catalogId, -1)} onPlus={() => bump(item.catalogId, 1)} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-extrabold">{STORE_KITCHEN_LIVE.shelfTitleAr}</h3>
        <ul className="mt-3 divide-y divide-white/8 rounded-2xl border border-white/10">
          {rest.map((item) => (
            <li key={item.catalogId} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <span className="flex min-w-0 items-center gap-3">
                {item.photoSrc ? <img src={item.photoSrc} alt="" className="h-12 w-12 rounded-lg object-cover" /> : null}
                <span>
                  <p className="text-sm font-bold">{item.nameAr}</p>
                  <p className="text-xs text-[#b45a3c]">{item.price} ر.س</p>
                </span>
              </span>
              <QtyRow value={qty[item.catalogId] || 0} onMinus={() => bump(item.catalogId, -1)} onPlus={() => bump(item.catalogId, 1)} />
            </li>
          ))}
        </ul>
      </section>

      {soldOut.length ? (
        <ul className="space-y-2 text-sm text-white/45">
          {soldOut.map((item) => (
            <li key={item.catalogId} className="flex items-center justify-between rounded-xl border border-white/8 px-3 py-2">
              <span className="line-through">{item.nameAr}</span>
              <span>{STORE_KITCHEN_LIVE.soldOutAr}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {!state.host.acceptingOrders ? (
        <p className="rounded-2xl border border-[#b45a3c]/35 bg-[#b45a3c]/10 px-4 py-3 text-sm leading-7">
          {STORE_KITCHEN_LIVE.pausedAr}
        </p>
      ) : (
        <form
          id="kitchen-checkout"
          className="rounded-2xl border border-[#b45a3c]/35 bg-[#1a0c08] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <h3 className="text-lg font-extrabold">
            {isShopClosedNow(state.host) ? STORE_SHOP_HOURS_COPY.preorderTitleAr : STORE_KITCHEN_LIVE.checkoutTitleAr}
          </h3>
          <p className="mt-1 text-sm text-[#b45a3c]">الإجمالي الآن: {total} ر.س</p>
          <label className="mt-3 block text-sm">
            {STORE_KITCHEN_LIVE.buyerNameLabelAr}
            <input required value={name} onChange={(e) => setName(e.target.value)} className="restaurant-field" maxLength={40} />
          </label>
          <label className="mt-3 block text-sm">
            {STORE_KITCHEN_LIVE.buyerPhoneLabelAr}
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="restaurant-field" inputMode="tel" maxLength={20} />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => setService('delivery')} className={cn('rounded-full px-3 py-1.5 text-xs', service === 'delivery' ? 'bg-[#b45a3c] font-bold text-[#061018]' : 'border border-white/20')}>
              {STORE_KITCHEN_LIVE.serviceDeliveryAr}
            </button>
            <button type="button" onClick={() => setService('pickup')} className={cn('rounded-full px-3 py-1.5 text-xs', service === 'pickup' ? 'bg-[#b45a3c] font-bold text-[#061018]' : 'border border-white/20')}>
              {STORE_KITCHEN_LIVE.servicePickupAr}
            </button>
          </div>
          {service === 'delivery' ? (
            <>
              <label className="mt-3 block text-sm">
                {STORE_KITCHEN_LIVE.buyerPlaceLabelAr}
                <input required value={place} onChange={(e) => setPlace(e.target.value)} className="restaurant-field" maxLength={240} />
              </label>
              <p className="mt-1 text-xs leading-6 text-white/60">{STORE_KITCHEN_LIVE.buyerPlaceHintAr}</p>
              <StoreBuyerLocateButtons
                value={place}
                accent="#b45a3c"
                copy={STORE_KITCHEN_LIVE}
                onLocated={(mapsUrl) => {
                  setPlace(mapsUrl);
                  if (saveBuyer && name.trim() && phone.trim()) {
                    writeSavedKitchenBuyer({ name: name.trim().slice(0, 40), phone: phone.trim().slice(0, 20), place: mapsUrl });
                  }
                }}
              />
              <label className="mt-3 block text-sm">
                {STORE_KITCHEN_LIVE.buyerPhotoLabelAr}
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full text-xs"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      setDeliveryPhotoSrc('');
                      return;
                    }
                    void compressImageFile(file, 900).then(setDeliveryPhotoSrc).catch(() => setDeliveryPhotoSrc(''));
                  }}
                />
              </label>
            </>
          ) : (
            <aside className="mt-3 rounded-xl border border-[#b45a3c]/30 bg-[#b45a3c]/10 px-3 py-3 text-sm leading-7">
              <p className="font-extrabold">{STORE_KITCHEN_LIVE.pickupPlaceTitleAr}</p>
              {pickupMaps ? (
                <a
                  className="mt-2 inline-flex rounded-full bg-[#b45a3c] px-3 py-1.5 text-xs font-bold text-[#061018]"
                  href={pickupMaps}
                  target="_blank"
                  rel="noreferrer"
                >
                  {STORE_KITCHEN_LIVE.pickupPlaceOpenAr}
                </a>
              ) : (
                <p className="mt-1 text-white/70">
                  {state.host.pickupPlaceVisible ? STORE_KITCHEN_LIVE.pickupPlacePendingAr : STORE_KITCHEN_LIVE.pickupPlaceHiddenAr}
                </p>
              )}
            </aside>
          )}
          {state.host.scheduleEnabled ? (
            <label className="mt-3 block text-sm">
              {STORE_KITCHEN_LIVE.buyerScheduleLabelAr}
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="restaurant-field"
              />
            </label>
          ) : null}
          <label className="mt-3 block text-sm">
            {STORE_KITCHEN_LIVE.buyerNoteLabelAr}
            <input value={note} onChange={(e) => setNote(e.target.value)} className="restaurant-field" maxLength={160} />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => setPay('cash')} className={cn('rounded-full px-3 py-1.5 text-xs', pay === 'cash' ? 'bg-[#b45a3c] font-bold text-[#061018]' : 'border border-white/20')}>
              {STORE_KITCHEN_LIVE.payCashAr}
            </button>
            <button type="button" onClick={() => setPay('card')} className={cn('rounded-full px-3 py-1.5 text-xs', pay === 'card' ? 'bg-[#b45a3c] font-bold text-[#061018]' : 'border border-white/20')}>
              {STORE_KITCHEN_LIVE.payCardAr}
            </button>
          </div>
          <div className="mt-3">
            <StoreDirectPayPublicMount product="store_kitchen_live" token={token} accent="#b45a3c" />
          </div>
          <label className="mt-4 flex items-start gap-2 text-sm leading-7">
            <input type="checkbox" checked={saveBuyer} onChange={(e) => setSaveBuyer(e.target.checked)} className="mt-1" />
            <span>{STORE_KITCHEN_LIVE.saveBuyerAr}</span>
          </label>
          <button type="submit" className="mt-4 min-h-12 w-full rounded-full bg-[#b45a3c] text-sm font-bold text-[#061018]">
            {STORE_KITCHEN_LIVE.submitOrderAr}
          </button>
          {sent ? <p className="mt-3 text-sm text-[#b45a3c]">{sent}</p> : null}
          {sent && myTicket?.id ? (
            <div className="mt-4">
              <StoreDirectPayGuest
                product="store_kitchen_live"
                token={token}
                requestRef={myTicket.id}
                accent="#b45a3c"
                amountSar={String(total || '')}
              />
            </div>
          ) : null}
          {myTicket?.readyAt ? (
            <aside className="mt-3 rounded-xl border border-[#b45a3c]/40 bg-[#b45a3c]/15 px-3 py-3 text-sm leading-7">
              <p className="font-extrabold">{STORE_KITCHEN_LIVE.orderReadyBannerAr}</p>
              {myTicket.readyMapsUrl ? (
                <a
                  className="mt-2 inline-flex rounded-full bg-[#b45a3c] px-3 py-1.5 text-xs font-bold text-[#061018]"
                  href={myTicket.readyMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {STORE_KITCHEN_LIVE.pickupPlaceOpenAr}
                </a>
              ) : null}
            </aside>
          ) : null}
        </form>
      )}
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
      <button type="button" onClick={onPlus} className="h-8 w-8 rounded-full bg-[#b45a3c] text-lg font-black text-[#061018]">
        +
      </button>
    </div>
  );
}
