/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useMemo, useState } from 'react';
import { STORE_DATES_LIVE, STORE_DATES_LIVE_LAB_TOKEN, datesCatalogImage } from '@/config/storeDatesLive';
import { STORE_DATES_UNIT_AR } from '@/config/storeDatesCatalog';
import {
  isDatesComeApproaching,
  parseMapsQueryCoords,
  requestDatesComeNotify,
  showDatesComeApproachingNotice,
} from '@/lib/storeDatesCome';
import {
  datesCartTotal,
  readSavedDatesBuyer,
  writeSavedDatesBuyer,
  type DatesLabState,
  type DatesOrderLine,
  type DatesPayMethod,
  type DatesService,
} from '@/lib/storeDatesLiveLab';
import { StoreDatesBuyerChat } from '@/components/store/StoreDatesChat';
import { StoreMobileVendorBanner } from '@/components/store/StoreMobileVendorBanner';
import { StoreMobileVendorMark } from '@/components/store/StoreMobileVendorMark';
import { StoreShopHoursBanner } from '@/components/store/StoreShopHoursBanner';
import { StoreBuyerLocateButtons } from '@/components/store/StoreBuyerLocateButtons';
import { StoreShopLogoMark } from '@/components/store/StoreShopLogoMark';
import { StoreShopPlacePin } from '@/components/store/StoreShopPlacePin';
import { STORE_MOBILE_VENDOR } from '@/config/storeMobileVendor';
import { STORE_SHOP_HOURS_COPY } from '@/config/storeShopHours';
import { neighborVendorState } from '@/lib/storeMobileVendor';
import { isShopClosedNow } from '@/lib/storeShopHours';
import { cn } from '@/lib/utils';
import { StoreDirectPayGuest, StoreDirectPayPublicMount } from '@/components/store/StoreDirectPayGuest';

export function StoreDatesShop({
  state,
  onChange,
  token,
  activityShell,
}: {
  state: DatesLabState;
  onChange: (next: DatesLabState) => void;
  token: string;
  activityShell?: boolean;
}) {
  const isLab = token === STORE_DATES_LIVE_LAB_TOKEN;
  const saved = useMemo(() => (isLab ? null : readSavedDatesBuyer()), [isLab]);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState(saved?.name || '');
  const [phone, setPhone] = useState(saved?.phone || '');
  const [place, setPlace] = useState(saved?.place || '');
  const [pay, setPay] = useState<DatesPayMethod>('cash');
  const [service, setService] = useState<DatesService>('delivery');
  const [buyerLat, setBuyerLat] = useState(0);
  const [buyerLng, setBuyerLng] = useState(0);
  const [comeHint, setComeHint] = useState('');
  const [watchingCome, setWatchingCome] = useState(false);
  const [saveBuyer, setSaveBuyer] = useState(false);
  const [sent, setSent] = useState(false);

  const mobile = state.host.vendorMode === 'mobile';
  const closed = isShopClosedNow(state.host);
  const neighbor = neighborVendorState({ ...state.host, closed });
  const preorder = closed || (mobile && neighbor !== 'at_pin');
  const visible = state.shelf.filter((item) => item.inStock);
  const arrived = visible.filter((item) => item.arrivedToday);
  const featuredAll = visible.filter((item) => item.featured && !item.arrivedToday).slice(0, 10);
  const featured = featuredAll.length >= 2 ? featuredAll : [];
  const featuredOrRest = featuredAll.length === 1 ? featuredAll : [];
  const rest = visible.filter(
    (item) =>
      !item.arrivedToday &&
      !featured.some((row) => row.catalogId === item.catalogId) &&
      !featuredOrRest.some((row) => row.catalogId === item.catalogId),
  ).concat(featuredOrRest);
  const lines: DatesOrderLine[] = visible
    .map((item) => ({
      catalogId: item.catalogId,
      nameAr: item.nameAr,
      qty: qty[item.catalogId] || 0,
      price: item.price,
    }))
    .filter((line) => line.qty > 0);
  const total = datesCartTotal(lines);

  function bump(id: string, delta: number) {
    setQty((current) => {
      const next = Math.max(0, (current[id] || 0) + delta);
      return { ...current, [id]: next };
    });
  }

  useEffect(() => {
    if (!mobile && service === 'come') setService('delivery');
  }, [mobile, service]);

  useEffect(() => {
    if (!watchingCome || !buyerLat || !buyerLng) return;
    if (!isDatesComeApproaching(buyerLat, buyerLng, state.host.pickupLat, state.host.pickupLng)) return;
    setWatchingCome(false);
    setComeHint(STORE_DATES_LIVE.comeApproachingAr);
    void showDatesComeApproachingNotice(state.host.shopName);
  }, [watchingCome, buyerLat, buyerLng, state.host.pickupLat, state.host.pickupLng, state.host.shopName]);

  async function submit() {
    if (name.trim().length < 2 || phone.trim().length < 9) return;
    const come = mobile && service === 'come';
    if (!come && !lines.length) return;
    setComeHint('');
    const coords = come ? parseMapsQueryCoords(place) || (buyerLat && buyerLng ? { lat: buyerLat, lng: buyerLng } : null) : null;
    if (come && !coords) {
      setComeHint(STORE_DATES_LIVE.comeNeedPlaceAr);
      return;
    }
    if (come) {
      const granted = await requestDatesComeNotify();
      if (!granted) {
        setComeHint(STORE_DATES_LIVE.comeNotifyDeniedAr);
        return;
      }
    }
    const order = {
      id: `${Date.now()}`,
      name: name.trim().slice(0, 40),
      phone: phone.trim().slice(0, 20),
      place: place.trim().slice(0, 240),
      service: come ? ('come' as const) : service,
      pay,
      lines,
      total,
      at: new Date().toISOString(),
      seen: false,
      buyerLat: coords?.lat,
      buyerLng: coords?.lng,
    };
    onChange({ ...state, orders: [order, ...state.orders].slice(0, 200) });
    writeSavedDatesBuyer(saveBuyer ? { name: order.name, phone: order.phone, place: order.place } : null);
    setQty({});
    setSent(true);
    if (come) {
      setWatchingCome(true);
      setComeHint(STORE_DATES_LIVE.comeWatchingAr);
    }
  }

  function priceLine(item: { price: number; unit: keyof typeof STORE_DATES_UNIT_AR }) {
    return `${item.price} ر.س / ${STORE_DATES_UNIT_AR[item.unit]}`;
  }

  const shelfList = activityShell ? visible : rest;

  return (
    <div className="space-y-6">
      {!activityShell && state.host.flashAr.trim() ? (
        <p className="dates-flash overflow-hidden rounded-full border border-[#8A6239]/40 bg-[#8A6239]/15 px-4 py-2 text-sm text-[#f0e2cc]">
          {state.host.flashAr}
        </p>
      ) : null}
      {!activityShell ? (
      <>
      <header>
        <p className="text-xs tracking-[0.3em] text-[#8A6239]">{STORE_DATES_LIVE.shopKickerAr}</p>
        <h2 className="mt-1 flex items-center gap-2 text-3xl font-black">
          <StoreShopLogoMark src={state.host.logoSrc} />
          <span>{state.host.shopName}</span>
          {mobile ? <StoreMobileVendorMark accent="#8A6239" /> : null}
          <StoreShopPlacePin
            mapsUrl={state.host.pickupMapsUrl}
            visible={mobile ? neighbor === 'at_pin' : state.host.pickupPlaceVisible}
            accent="#8A6239"
            labelAr={STORE_DATES_LIVE.pickupPinAriaAr}
          />
        </h2>
        <p className="mt-2 text-sm leading-7 text-white/75">{state.host.blurbAr}</p>
        <ul className="mt-3 space-y-1 text-sm leading-7 text-white/70">
          {state.host.customFields.filter((line) => line.trim()).slice(0, 5).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </header>
      <StoreShopHoursBanner hours={state.host} accent="#8A6239" />
      <StoreMobileVendorBanner place={state.host} closed={closed} accent="#8A6239" />
      </>
      ) : null}

      {!activityShell && arrived.length ? (
        <section>
          <h3 className="text-lg font-extrabold">{STORE_DATES_LIVE.todayTitleAr}</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {arrived.map((item, index) => (
              <DatesShelfCard
                key={item.catalogId}
                item={item}
                imageIndex={index}
                qty={qty[item.catalogId] || 0}
                onMinus={() => bump(item.catalogId, -1)}
                onPlus={() => bump(item.catalogId, 1)}
                priceLine={priceLine(item)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {!activityShell && featured.length ? (
        <section>
          <h3 className="text-lg font-extrabold">{STORE_DATES_LIVE.featuredTitleAr}</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((item, index) => (
              <DatesShelfCard
                key={item.catalogId}
                item={item}
                imageIndex={index + 4}
                qty={qty[item.catalogId] || 0}
                onMinus={() => bump(item.catalogId, -1)}
                onPlus={() => bump(item.catalogId, 1)}
                priceLine={priceLine(item)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {(activityShell ? shelfList.length : rest.length) ? (
        <section>
          <h3 className="text-lg font-extrabold">{STORE_DATES_LIVE.shelfTitleAr}</h3>
          <ul className="mt-3 divide-y divide-white/8 rounded-2xl border border-white/10">
            {shelfList.map((item) => (
              <li key={item.catalogId} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span>
                  <p className="text-sm font-bold">{item.nameAr}</p>
                  <p className="text-xs text-[#8A6239]">{priceLine(item)}</p>
                </span>
                <QtyRow value={qty[item.catalogId] || 0} onMinus={() => bump(item.catalogId, -1)} onPlus={() => bump(item.catalogId, 1)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <form
        id="dates-checkout"
        className="rounded-2xl border border-[#8A6239]/35 bg-[#1a140c] p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <h3 className="text-lg font-extrabold">
          {preorder ? STORE_SHOP_HOURS_COPY.preorderTitleAr : STORE_DATES_LIVE.checkoutTitleAr}
        </h3>
        <p className="mt-1 text-sm text-[#8A6239]">الإجمالي الآن: {total} ر.س</p>
        <p className="mt-1 text-xs leading-6 text-white/55">{STORE_DATES_LIVE.priceEstimateNoteAr}</p>
        <label className="mt-3 block text-sm">
          {STORE_DATES_LIVE.buyerNameLabelAr}
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="dates-field"
            maxLength={40}
            placeholder={isLab ? STORE_DATES_LIVE.labDemoNameAr : undefined}
          />
        </label>
        <label className="mt-3 block text-sm">
          {STORE_DATES_LIVE.buyerPhoneLabelAr}
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="dates-field"
            inputMode="tel"
            maxLength={20}
            placeholder={isLab ? STORE_DATES_LIVE.labDemoPhoneAr : undefined}
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setService('delivery')} className={cn('rounded-full px-3 py-1.5 text-xs', service === 'delivery' ? 'bg-[#8A6239] font-bold text-[#061018]' : 'border border-white/20')}>
            {STORE_DATES_LIVE.serviceDeliveryAr}
          </button>
          <button type="button" onClick={() => setService('pickup')} className={cn('rounded-full px-3 py-1.5 text-xs', service === 'pickup' ? 'bg-[#8A6239] font-bold text-[#061018]' : 'border border-white/20')}>
            {STORE_DATES_LIVE.servicePickupAr}
          </button>
          {mobile ? (
            <button type="button" onClick={() => setService('come')} className={cn('rounded-full px-3 py-1.5 text-xs', service === 'come' ? 'bg-[#8A6239] font-bold text-[#061018]' : 'border border-white/20')}>
              {STORE_DATES_LIVE.serviceComeAr}
            </button>
          ) : null}
        </div>
        {service === 'come' ? (
          <p className="mt-2 text-sm leading-7 text-white/75">{STORE_DATES_LIVE.serviceComeLeadAr}</p>
        ) : null}
        {service === 'delivery' || service === 'come' ? (
          <>
            <label className="mt-3 block text-sm">
              {mobile ? STORE_MOBILE_VENDOR.placeHintAr : STORE_DATES_LIVE.buyerPlaceLabelAr}
              <input
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="dates-field"
                maxLength={240}
                required={service === 'come'}
                placeholder={isLab ? STORE_DATES_LIVE.labDemoPlaceAr : undefined}
              />
            </label>
            <StoreBuyerLocateButtons
              value={place}
              accent="#8A6239"
              copy={STORE_DATES_LIVE}
              onLocated={setPlace}
              onCoords={(lat, lng) => {
                setBuyerLat(lat);
                setBuyerLng(lng);
              }}
            />
          </>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setPay('cash')} className={cn('rounded-full px-3 py-1.5 text-xs', pay === 'cash' ? 'bg-[#8A6239] font-bold text-[#061018]' : 'border border-white/20')}>
            {STORE_DATES_LIVE.payCashAr}
          </button>
          <button type="button" onClick={() => setPay('card')} className={cn('rounded-full px-3 py-1.5 text-xs', pay === 'card' ? 'bg-[#8A6239] font-bold text-[#061018]' : 'border border-white/20')}>
            {STORE_DATES_LIVE.payCardAr}
          </button>
        </div>
        <div className="mt-3">
          {!activityShell ? (
          <StoreDirectPayPublicMount product="store_dates_live" token={token} accent="#8A6239" />
          ) : null}
        </div>
        <label className="mt-4 flex items-start gap-2 text-sm leading-7">
          <input type="checkbox" checked={saveBuyer} onChange={(e) => setSaveBuyer(e.target.checked)} className="mt-1" />
          <span>{STORE_DATES_LIVE.saveBuyerAr}</span>
        </label>
        <button type="submit" className="mt-4 min-h-12 w-full rounded-full bg-[#8A6239] text-sm font-bold text-[#061018]">
          {service === 'come' ? STORE_DATES_LIVE.comeSubmitAr : STORE_DATES_LIVE.submitOrderAr}
        </button>
        {comeHint ? <p className="mt-3 text-sm leading-7 text-[#f0e2cc]">{comeHint}</p> : null}
        {sent && service !== 'come' ? <p className="mt-3 text-sm text-[#8A6239]">{STORE_DATES_LIVE.orderSentAr}</p> : null}
        {sent && state.orders[0]?.id ? (
          <div className="mt-4">
            <StoreDirectPayGuest
              product="store_dates_live"
              token={token}
              requestRef={state.orders[0].id}
              accent="#8A6239"
              amountSar={String(state.orders[0].total || '')}
            />
          </div>
        ) : null}
      </form>
      <StoreDatesBuyerChat state={state} onChange={onChange} />
    </div>
  );
}

function DatesShelfCard({
  item,
  imageIndex,
  qty,
  onMinus,
  onPlus,
  priceLine,
}: {
  item: { catalogId: string; nameAr: string };
  imageIndex: number;
  qty: number;
  onMinus: () => void;
  onPlus: () => void;
  priceLine: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#8A6239]/35 bg-[#241b10]">
      <div className="aspect-[4/3] overflow-hidden bg-[#061018]">
        <img
          src={datesCatalogImage(imageIndex)}
          alt={item.nameAr}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="p-3">
        <p className="text-sm font-extrabold text-[#f4efe4]">{item.nameAr}</p>
        <p className="mt-1 text-sm font-black text-[#8A6239]">{priceLine}</p>
        <QtyRow value={qty} onMinus={onMinus} onPlus={onPlus} />
      </div>
    </article>
  );
}

function QtyRow({ value, onMinus, onPlus }: { value: number; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <button type="button" onClick={onMinus} className="h-8 w-8 rounded-full border border-white/20 text-lg">
        −
      </button>
      <span className="min-w-6 text-center text-sm font-bold">{value}</span>
      <button type="button" onClick={onPlus} className="h-8 w-8 rounded-full bg-[#8A6239] text-lg font-black text-[#061018]">
        +
      </button>
    </div>
  );
}
