/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState } from 'react';
import {
  STORE_RESTAURANT_LIVE,
  STORE_RESTAURANT_LIVE_LAB_TOKEN,
  restaurantShelfVisible,
} from '@/config/storeRestaurantLive';
import {
  readSavedRestaurantBuyer,
  restaurantCartTotal,
  writeSavedRestaurantBuyer,
  type RestaurantLabState,
  type RestaurantOrderLine,
  type RestaurantPayMethod,
  type RestaurantService,
} from '@/lib/storeRestaurantLiveLab';
import { StoreMobileVendorBanner } from '@/components/store/StoreMobileVendorBanner';
import { StoreMobileVendorMark } from '@/components/store/StoreMobileVendorMark';
import { StoreRestaurantBuyerChat } from '@/components/store/StoreRestaurantChat';
import { StoreShopHoursBanner } from '@/components/store/StoreShopHoursBanner';
import { StoreBuyerLocateButtons } from '@/components/store/StoreBuyerLocateButtons';
import { StoreShopPlacePin } from '@/components/store/StoreShopPlacePin';
import { StoreShopLogoMark } from '@/components/store/StoreShopLogoMark';
import { STORE_MOBILE_VENDOR } from '@/config/storeMobileVendor';
import { STORE_SHOP_HOURS_COPY } from '@/config/storeShopHours';
import { neighborVendorState } from '@/lib/storeMobileVendor';
import { isShopClosedNow } from '@/lib/storeShopHours';
import { cn } from '@/lib/utils';
import { StoreDirectPayGuest, StoreDirectPayPublicMount } from '@/components/store/StoreDirectPayGuest';

export function StoreRestaurantShop({
  state,
  onChange,
  token,
}: {
  state: RestaurantLabState;
  onChange: (next: RestaurantLabState) => void;
  token: string;
}) {
  const isLab = token === STORE_RESTAURANT_LIVE_LAB_TOKEN;
  const saved = useMemo(() => (isLab ? null : readSavedRestaurantBuyer()), [isLab]);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState(saved?.name || '');
  const [phone, setPhone] = useState(saved?.phone || '');
  const [placeDesc, setPlaceDesc] = useState(saved?.place || '');
  const [placeCoords, setPlaceCoords] = useState(isLab ? STORE_RESTAURANT_LIVE.labDemoCoordsAr : '');
  const [placeAdopted, setPlaceAdopted] = useState(isLab);
  const [note, setNote] = useState('');
  const [pay, setPay] = useState<RestaurantPayMethod>('cash');
  const [service, setService] = useState<RestaurantService>('delivery');
  const [saveBuyer, setSaveBuyer] = useState(Boolean(saved) && !isLab);
  const [sent, setSent] = useState('');

  const mobile = state.host.vendorMode === 'mobile';
  const closed = isShopClosedNow(state.host);
  const neighbor = neighborVendorState({ ...state.host, closed });
  const preorder = closed || (mobile && neighbor !== 'at_pin');
  const serviceKind = mobile ? 'pickup' : service;
  const visible = state.shelf.filter((item) => restaurantShelfVisible(item.availability, item.inStock));
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
    const orderName = isLab ? STORE_RESTAURANT_LIVE.labDemoNameAr : name.trim().slice(0, 40);
    const orderPhone = isLab ? STORE_RESTAURANT_LIVE.labDemoPhoneAr : phone.trim().slice(0, 20);
    const orderPlaceDesc = isLab ? STORE_RESTAURANT_LIVE.labDemoPlaceAr : placeDesc.trim().slice(0, 120);
    const orderCoords = isLab ? STORE_RESTAURANT_LIVE.labDemoCoordsAr : placeCoords.trim();
    const combinedPlace = [orderPlaceDesc, orderCoords].filter(Boolean).join(' · ').slice(0, 160);

    if (!isLab && orderName.length < 2) return;
    if (!isLab && orderPhone.length < 9) return;
    if (!lines.length) return;
    if (serviceKind === 'delivery') {
      if (!isLab && orderPlaceDesc.length < 3) return;
      if (!isLab && !placeAdopted) return;
    }

    const ticketNo = state.host.nextTicket || 1;
    const order = {
      id: `${Date.now()}`,
      ticketNo,
      name: orderName,
      phone: orderPhone,
      place: combinedPlace,
      note: note.trim().slice(0, 160),
      service: serviceKind,
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
    if (!isLab) {
      writeSavedRestaurantBuyer(saveBuyer ? { name: order.name, phone: order.phone, place: orderPlaceDesc } : null);
    }
    setQty({});
    setNote('');
    setSent(`${STORE_RESTAURANT_LIVE.orderSentAr} (${ticketNo})`);
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
          <StoreShopLogoMark src={state.host.logoSrc} />
          <span>{state.host.shopName}</span>
          {mobile ? <StoreMobileVendorMark accent="#e08a3c" /> : null}
          <StoreShopPlacePin
            mapsUrl={state.host.pickupMapsUrl}
            visible={mobile ? neighbor === 'at_pin' : state.host.pickupPlaceVisible}
            accent="#e08a3c"
            labelAr={STORE_RESTAURANT_LIVE.pickupPinAriaAr}
          />
        </h2>
        <p className="mt-2 text-sm leading-7 text-white/75">{state.host.blurbAr}</p>
        <ul className="mt-3 space-y-1 text-sm leading-7 text-white/70">
          {state.host.customFields.filter((line) => line.trim()).slice(0, 6).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </header>
      <StoreShopHoursBanner hours={state.host} accent="#e08a3c" />
      <StoreMobileVendorBanner place={state.host} closed={closed} accent="#e08a3c" />

      {today ? (
        <section className="overflow-hidden rounded-2xl border border-[#e08a3c]/40 bg-[#1a1008]">
          <p className="px-4 pt-3 text-xs font-bold tracking-wide text-[#e08a3c]">{STORE_RESTAURANT_LIVE.todayTitleAr}</p>
          {today.photoSrc ? (
            <img src={today.photoSrc} alt={today.nameAr} className="mt-2 aspect-[16/9] w-full object-cover" />
          ) : null}
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="font-extrabold">
              {today.nameAr} · {today.price} ر.س
            </p>
            <QtyRow value={qty[today.catalogId] || 0} onMinus={() => bump(today.catalogId, -1)} onPlus={() => bump(today.catalogId, 1)} />
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="text-lg font-extrabold">{STORE_RESTAURANT_LIVE.featuredTitleAr}</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {featured.map((item) => (
            <article key={item.catalogId} className="overflow-hidden rounded-2xl border border-[#e08a3c]/30 bg-[#1a1008]">
              {item.photoSrc ? (
                <img src={item.photoSrc} alt={item.nameAr} className="aspect-square w-full object-cover" />
              ) : null}
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
                {item.photoSrc ? <img src={item.photoSrc} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : null}
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
          {preorder ? STORE_SHOP_HOURS_COPY.preorderTitleAr : STORE_RESTAURANT_LIVE.checkoutTitleAr}
        </h3>
        <p className="mt-1 text-sm text-[#e08a3c]">الإجمالي الآن: {total} ر.س</p>
        <label className="mt-3 block text-sm">
          {STORE_RESTAURANT_LIVE.buyerNameLabelAr}
          <input
            required={!isLab}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="restaurant-field"
            maxLength={40}
            placeholder={isLab ? STORE_RESTAURANT_LIVE.labDemoNameAr : undefined}
          />
        </label>
        <label className="mt-3 block text-sm">
          {STORE_RESTAURANT_LIVE.buyerPhoneLabelAr}
          <input
            required={!isLab}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="restaurant-field"
            inputMode="tel"
            maxLength={20}
            placeholder={isLab ? STORE_RESTAURANT_LIVE.labDemoPhoneAr : undefined}
          />
        </label>
        {mobile ? (
          <p className="mt-3 text-sm font-bold text-[#e08a3c]">{STORE_MOBILE_VENDOR.pickupFromCartAr}</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setService('delivery')}
              className={cn('rounded-full px-3 py-1.5 text-xs', service === 'delivery' ? 'bg-[#e08a3c] font-bold text-[#061018]' : 'border border-white/20')}
            >
              {STORE_RESTAURANT_LIVE.serviceDeliveryAr}
            </button>
            <button
              type="button"
              onClick={() => setService('pickup')}
              className={cn('rounded-full px-3 py-1.5 text-xs', service === 'pickup' ? 'bg-[#e08a3c] font-bold text-[#061018]' : 'border border-white/20')}
            >
              {STORE_RESTAURANT_LIVE.servicePickupAr}
            </button>
          </div>
        )}
        {serviceKind === 'delivery' ? (
          <>
            <label className="mt-3 block text-sm">
              {STORE_RESTAURANT_LIVE.buyerPlaceLabelAr}
              <input
                required={!isLab}
                value={placeDesc}
                onChange={(e) => setPlaceDesc(e.target.value)}
                className="restaurant-field"
                maxLength={120}
                placeholder={isLab ? STORE_RESTAURANT_LIVE.labDemoPlaceAr : 'الحي، الشارع، رقم المبنى أو أقرب علامة'}
              />
            </label>
            <label className="mt-3 block text-sm">
              {STORE_RESTAURANT_LIVE.buyerPlaceCoordsLabelAr}
              <input
                readOnly
                value={placeCoords}
                className="restaurant-field text-white/70"
                placeholder={STORE_RESTAURANT_LIVE.buyerPlaceCoordsHintAr}
              />
            </label>
            {!isLab ? (
              <StoreBuyerLocateButtons
                value={placeCoords}
                accent="#e08a3c"
                copy={STORE_RESTAURANT_LIVE}
                onLocated={(mapsUrl) => {
                  setPlaceCoords(mapsUrl);
                  setPlaceAdopted(false);
                }}
                onAdopted={() => setPlaceAdopted(true)}
              />
            ) : null}
            {!isLab && placeCoords && !placeAdopted ? (
              <p className="mt-2 text-xs text-amber-100">اعتمد الموقع قبل إرسال الطلب.</p>
            ) : null}
          </>
        ) : null}
        <label className="mt-3 block text-sm">
          {STORE_RESTAURANT_LIVE.buyerNoteLabelAr}
          <input value={note} onChange={(e) => setNote(e.target.value)} className="restaurant-field" maxLength={160} />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPay('cash')}
            className={cn('rounded-full px-3 py-1.5 text-xs', pay === 'cash' ? 'bg-[#e08a3c] font-bold text-[#061018]' : 'border border-white/20')}
          >
            {STORE_RESTAURANT_LIVE.payCashAr}
          </button>
          <button
            type="button"
            onClick={() => setPay('card')}
            className={cn('rounded-full px-3 py-1.5 text-xs', pay === 'card' ? 'bg-[#e08a3c] font-bold text-[#061018]' : 'border border-white/20')}
          >
            {STORE_RESTAURANT_LIVE.payCardAr}
          </button>
        </div>
        {!isLab ? (
          <div className="mt-3">
            <StoreDirectPayPublicMount product="store_restaurant_live" token={token} accent="#e08a3c" />
          </div>
        ) : null}
        {!isLab ? (
          <label className="mt-4 flex items-start gap-2 text-sm leading-7">
            <input type="checkbox" checked={saveBuyer} onChange={(e) => setSaveBuyer(e.target.checked)} className="mt-1" />
            <span>
              {STORE_RESTAURANT_LIVE.saveBuyerAr}
              <span className="mt-1 block text-xs text-white/55">{STORE_RESTAURANT_LIVE.saveBuyerHintAr}</span>
            </span>
          </label>
        ) : null}
        <button type="submit" className="mt-4 min-h-12 w-full rounded-full bg-[#e08a3c] text-sm font-bold text-[#061018]">
          {STORE_RESTAURANT_LIVE.submitOrderAr}
        </button>
        {sent ? <p className="mt-3 text-sm text-[#e08a3c]">{sent}</p> : null}
        {sent && state.orders[0]?.id && !isLab ? (
          <div className="mt-4">
            <StoreDirectPayGuest
              product="store_restaurant_live"
              token={token}
              requestRef={state.orders[0].id}
              accent="#e08a3c"
              amountSar={String(state.orders[0].total || '')}
            />
          </div>
        ) : null}
      </form>
      <StoreRestaurantBuyerChat state={state} onChange={onChange} isLab={isLab} />
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
