/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  STORE_PRODUCE_LIVE,
  STORE_PRODUCE_LIVE_ACCENT,
  STORE_PRODUCE_LIVE_LAB_TOKEN,
  produceCatalogImage,
} from '@/config/storeProduceLive';
import { STORE_PRODUCE_UNIT_AR } from '@/config/storeProduceCatalog';
import {
  isProduceComeApproaching,
  parseMapsQueryCoords,
  requestProduceComeNotify,
  showProduceComeApproachingNotice,
} from '@/lib/storeProduceCome';
import {
  produceCartTotal,
  readSavedProduceBuyer,
  writeSavedProduceBuyer,
  type ProduceLabState,
  type ProduceOrderLine,
  type ProducePayMethod,
  type ProduceService,
} from '@/lib/storeProduceLiveLab';
import { StoreProduceBuyerChat } from '@/components/store/StoreProduceChat';
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
import { AdaptiveProductGrid } from '@/components/store/neighbor/AdaptiveProductGrid';
import { NeighborFloatingCart } from '@/components/store/neighbor/NeighborFloatingCart';
import { NeighborShelfExplorer, useNeighborShelfFilter } from '@/components/store/neighbor/NeighborShelfExplorer';
import {
  clearNeighborCartQty,
  readNeighborCartQty,
  writeNeighborCartQty,
} from '@/lib/neighborCartStorage';
import { NEIGHBOR_SHELF_ALL_CATEGORY, type NeighborShelfFilter } from '@/lib/neighborShelfFilter';
import { NeighborShopEvents } from '@/lib/neighborShopAnalytics';

export function StoreProduceShop({
  state,
  onChange,
  token,
  activityShell,
}: {
  state: ProduceLabState;
  onChange: (next: ProduceLabState) => void;
  token: string;
  activityShell?: boolean;
}) {
  const isLab = token === STORE_PRODUCE_LIVE_LAB_TOKEN;
  const neighborShopUx = Boolean(activityShell);
  const saved = useMemo(() => (isLab ? null : readSavedProduceBuyer()), [isLab]);
  const [qty, setQty] = useState<Record<string, number>>(() =>
    neighborShopUx ? readNeighborCartQty('produce', token) : {},
  );
  const [shelfFilter, setShelfFilter] = useState<NeighborShelfFilter>({
    query: '',
    category: NEIGHBOR_SHELF_ALL_CATEGORY,
  });
  const viewedRef = useRef(false);
  const [name, setName] = useState(saved?.name || '');
  const [phone, setPhone] = useState(saved?.phone || '');
  const [place, setPlace] = useState(saved?.place || '');
  const [pay, setPay] = useState<ProducePayMethod>('cash');
  const [service, setService] = useState<ProduceService>('delivery');
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
  const lines: ProduceOrderLine[] = visible
    .map((item) => ({
      catalogId: item.catalogId,
      nameAr: item.nameAr,
      qty: qty[item.catalogId] || 0,
      price: item.price,
    }))
    .filter((line) => line.qty > 0);
  const total = produceCartTotal(lines);
  const cartItemCount = lines.length;
  const cartLineCount = lines.reduce((sum, line) => sum + line.qty, 0);
  const neighborRows = useMemo(
    () =>
      visible.map((item) => ({
        catalogId: item.catalogId,
        nameAr: item.nameAr,
        category: [item.arrivedToday ? 'وصل اليوم' : '', item.category, STORE_PRODUCE_UNIT_AR[item.unit]]
          .filter(Boolean)
          .join(' · '),
        price: item.price,
        inStock: item.inStock,
      })),
    [visible],
  );
  const filteredNeighborRows = useNeighborShelfFilter(neighborRows, shelfFilter);

  useEffect(() => {
    if (!neighborShopUx) return;
    writeNeighborCartQty('produce', token, qty);
  }, [neighborShopUx, token, qty]);

  useEffect(() => {
    if (!neighborShopUx || viewedRef.current) return;
    viewedRef.current = true;
    NeighborShopEvents.viewStore('produce', token, isLab);
  }, [neighborShopUx, token, isLab]);

  function bump(id: string, delta: number) {
    setQty((current) => {
      const prev = current[id] || 0;
      const next = Math.max(0, prev + delta);
      if (neighborShopUx) {
        if (delta > 0 && next > prev) NeighborShopEvents.addItem('produce', token, isLab, id);
        if (delta < 0 && next < prev) NeighborShopEvents.removeItem('produce', token, isLab, id);
      }
      return { ...current, [id]: next };
    });
  }

  useEffect(() => {
    if (!mobile && service === 'come') setService('delivery');
  }, [mobile, service]);

  useEffect(() => {
    if (!watchingCome || !buyerLat || !buyerLng) return;
    if (!isProduceComeApproaching(buyerLat, buyerLng, state.host.pickupLat, state.host.pickupLng)) return;
    setWatchingCome(false);
    setComeHint(STORE_PRODUCE_LIVE.comeApproachingAr);
    void showProduceComeApproachingNotice(state.host.shopName);
  }, [watchingCome, buyerLat, buyerLng, state.host.pickupLat, state.host.pickupLng, state.host.shopName]);

  async function submit() {
    const orderName = isLab ? STORE_PRODUCE_LIVE.labDemoNameAr : name.trim().slice(0, 40);
    const orderPhone = isLab ? STORE_PRODUCE_LIVE.labDemoPhoneAr : phone.trim().slice(0, 20);
    const orderPlace = isLab ? STORE_PRODUCE_LIVE.labDemoPlaceAr : place.trim().slice(0, 240);
    if (!isLab && orderName.length < 2) return;
    if (!isLab && orderPhone.length < 9) return;
    const come = mobile && service === 'come';
    if (!come && !lines.length) return;
    if (neighborShopUx) {
      NeighborShopEvents.submitOrder('produce', token, isLab, cartLineCount);
    }
    setComeHint('');
    const coords = come
      ? parseMapsQueryCoords(orderPlace) || (buyerLat && buyerLng ? { lat: buyerLat, lng: buyerLng } : null)
      : null;
    if (come && !coords) {
      setComeHint(STORE_PRODUCE_LIVE.comeNeedPlaceAr);
      return;
    }
    if (come) {
      const granted = await requestProduceComeNotify();
      if (!granted) {
        setComeHint(STORE_PRODUCE_LIVE.comeNotifyDeniedAr);
        return;
      }
    }
    const order = {
      id: `${Date.now()}`,
      name: orderName,
      phone: orderPhone,
      place: orderPlace,
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
    if (!isLab) {
      writeSavedProduceBuyer(saveBuyer ? { name: order.name, phone: order.phone, place: order.place } : null);
    }
    setQty({});
    if (neighborShopUx) {
      clearNeighborCartQty('produce', token);
      NeighborShopEvents.orderSubmitted('produce', token, isLab, cartLineCount);
    }
    setSent(true);
    if (come) {
      setWatchingCome(true);
      setComeHint(STORE_PRODUCE_LIVE.comeWatchingAr);
    }
  }

  function priceLine(item: { price: number; unit: keyof typeof STORE_PRODUCE_UNIT_AR }) {
    return `${item.price} ر.س / ${STORE_PRODUCE_UNIT_AR[item.unit]}`;
  }

  const shelfList = activityShell ? visible : rest;

  return (
    <div className={cn('space-y-6', neighborShopUx && total > 0 && 'neighbor-shop-pad')}>
      {!activityShell && state.host.flashAr.trim() ? (
        <p className="produce-flash overflow-hidden rounded-full border border-[#3d8b4a]/40 bg-[#3d8b4a]/15 px-4 py-2 text-sm text-[#d8f0cc]">
          {state.host.flashAr}
        </p>
      ) : null}
      {!activityShell ? (
      <>
      <header>
        <p className="text-xs tracking-[0.3em] text-[#3d8b4a]">{STORE_PRODUCE_LIVE.shopKickerAr}</p>
        <h2 className="mt-1 flex items-center gap-2 text-3xl font-black">
          <StoreShopLogoMark src={state.host.logoSrc} />
          <span>{state.host.shopName}</span>
          {mobile ? <StoreMobileVendorMark accent="#3d8b4a" /> : null}
          <StoreShopPlacePin
            mapsUrl={state.host.pickupMapsUrl}
            visible={mobile ? neighbor === 'at_pin' : state.host.pickupPlaceVisible}
            accent="#3d8b4a"
            labelAr={STORE_PRODUCE_LIVE.pickupPinAriaAr}
          />
        </h2>
        <p className="mt-2 text-sm leading-7 text-white/75">{state.host.blurbAr}</p>
        <ul className="mt-3 space-y-1 text-sm leading-7 text-white/70">
          {state.host.customFields.filter((line) => line.trim()).slice(0, 5).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </header>
      <StoreShopHoursBanner hours={state.host} accent="#3d8b4a" />
      <StoreMobileVendorBanner place={state.host} closed={closed} accent="#3d8b4a" />
      </>
      ) : null}

      {!activityShell && arrived.length ? (
        <section>
          <h3 className="text-lg font-extrabold">{STORE_PRODUCE_LIVE.todayTitleAr}</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {arrived.map((item, index) => (
              <ProduceShelfCard
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
          <h3 className="text-lg font-extrabold">{STORE_PRODUCE_LIVE.featuredTitleAr}</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((item, index) => (
              <ProduceShelfCard
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

      {neighborShopUx ? (
        <section>
          <h3 className="text-lg font-extrabold">{STORE_PRODUCE_LIVE.shelfTitleAr}</h3>
          <div className="mt-3 space-y-3">
            <NeighborShelfExplorer
              items={neighborRows}
              accent={STORE_PRODUCE_LIVE_ACCENT}
              onFilterChange={(next) => {
                setShelfFilter(next);
                if (next.query.trim()) {
                  NeighborShopEvents.searchProducts('produce', token, isLab, next.query.trim().length);
                }
                if (next.category !== NEIGHBOR_SHELF_ALL_CATEGORY) {
                  NeighborShopEvents.applyCategory('produce', token, isLab, next.category);
                }
              }}
            />
            <AdaptiveProductGrid
              items={filteredNeighborRows}
              qty={qty}
              accent={STORE_PRODUCE_LIVE_ACCENT}
              onBump={bump}
            />
          </div>
        </section>
      ) : (activityShell ? shelfList.length : rest.length) ? (
        <section>
          <h3 className="text-lg font-extrabold">{STORE_PRODUCE_LIVE.shelfTitleAr}</h3>
          <ul className="mt-3 divide-y divide-white/8 rounded-2xl border border-white/10">
            {shelfList.map((item) => (
              <li key={item.catalogId} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span>
                  <p className="text-sm font-bold">{item.nameAr}</p>
                  <p className="text-xs text-[#3d8b4a]">{priceLine(item)}</p>
                </span>
                <QtyRow value={qty[item.catalogId] || 0} onMinus={() => bump(item.catalogId, -1)} onPlus={() => bump(item.catalogId, 1)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <form
        id="produce-checkout"
        className="rounded-2xl border border-[#3d8b4a]/35 bg-[#0b1a10] p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <h3 className="text-lg font-extrabold">
          {preorder ? STORE_SHOP_HOURS_COPY.preorderTitleAr : STORE_PRODUCE_LIVE.checkoutTitleAr}
        </h3>
        <p className="mt-1 text-sm text-[#3d8b4a]">الإجمالي الآن: {total} ر.س</p>
        <p className="mt-1 text-xs leading-6 text-white/55">{STORE_PRODUCE_LIVE.priceEstimateNoteAr}</p>
        <label className="mt-3 block text-sm">
          {STORE_PRODUCE_LIVE.buyerNameLabelAr}
          <input
            required={!isLab}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="produce-field"
            maxLength={40}
            placeholder={isLab ? STORE_PRODUCE_LIVE.labDemoNameAr : undefined}
          />
        </label>
        <label className="mt-3 block text-sm">
          {STORE_PRODUCE_LIVE.buyerPhoneLabelAr}
          <input
            required={!isLab}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="produce-field"
            inputMode="tel"
            maxLength={20}
            placeholder={isLab ? STORE_PRODUCE_LIVE.labDemoPhoneAr : undefined}
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setService('delivery')} className={cn('rounded-full px-3 py-1.5 text-xs', service === 'delivery' ? 'bg-[#3d8b4a] font-bold text-[#061018]' : 'border border-white/20')}>
            {STORE_PRODUCE_LIVE.serviceDeliveryAr}
          </button>
          <button type="button" onClick={() => setService('pickup')} className={cn('rounded-full px-3 py-1.5 text-xs', service === 'pickup' ? 'bg-[#3d8b4a] font-bold text-[#061018]' : 'border border-white/20')}>
            {STORE_PRODUCE_LIVE.servicePickupAr}
          </button>
          {mobile ? (
            <button type="button" onClick={() => setService('come')} className={cn('rounded-full px-3 py-1.5 text-xs', service === 'come' ? 'bg-[#3d8b4a] font-bold text-[#061018]' : 'border border-white/20')}>
              {STORE_PRODUCE_LIVE.serviceComeAr}
            </button>
          ) : null}
        </div>
        {service === 'come' ? (
          <p className="mt-2 text-sm leading-7 text-white/75">{STORE_PRODUCE_LIVE.serviceComeLeadAr}</p>
        ) : null}
        {service === 'delivery' || service === 'come' ? (
          <>
            <label className="mt-3 block text-sm">
              {mobile ? STORE_MOBILE_VENDOR.placeHintAr : STORE_PRODUCE_LIVE.buyerPlaceLabelAr}
              <input
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="produce-field"
                maxLength={240}
                required={service === 'come'}
                placeholder={isLab ? STORE_PRODUCE_LIVE.labDemoPlaceAr : undefined}
              />
            </label>
            <StoreBuyerLocateButtons
              value={place}
              accent="#3d8b4a"
              copy={STORE_PRODUCE_LIVE}
              onLocated={setPlace}
              onCoords={(lat, lng) => {
                setBuyerLat(lat);
                setBuyerLng(lng);
              }}
            />
          </>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setPay('cash')} className={cn('rounded-full px-3 py-1.5 text-xs', pay === 'cash' ? 'bg-[#3d8b4a] font-bold text-[#061018]' : 'border border-white/20')}>
            {STORE_PRODUCE_LIVE.payCashAr}
          </button>
          <button type="button" onClick={() => setPay('card')} className={cn('rounded-full px-3 py-1.5 text-xs', pay === 'card' ? 'bg-[#3d8b4a] font-bold text-[#061018]' : 'border border-white/20')}>
            {STORE_PRODUCE_LIVE.payCardAr}
          </button>
        </div>
        <div className="mt-3">
          {!activityShell ? (
          <StoreDirectPayPublicMount product="store_produce_live" token={token} accent="#3d8b4a" />
          ) : null}
        </div>
        {!isLab ? (
          <label className="mt-4 flex items-start gap-2 text-sm leading-7">
            <input type="checkbox" checked={saveBuyer} onChange={(e) => setSaveBuyer(e.target.checked)} className="mt-1" />
            <span>{STORE_PRODUCE_LIVE.saveBuyerAr}</span>
          </label>
        ) : null}
        <button type="submit" className="mt-4 min-h-12 w-full rounded-full bg-[#3d8b4a] text-sm font-bold text-[#061018]">
          {service === 'come' ? STORE_PRODUCE_LIVE.comeSubmitAr : STORE_PRODUCE_LIVE.submitOrderAr}
        </button>
        {comeHint ? <p className="mt-3 text-sm leading-7 text-[#d8f0cc]">{comeHint}</p> : null}
        {sent && service !== 'come' ? <p className="mt-3 text-sm text-[#3d8b4a]">{STORE_PRODUCE_LIVE.orderSentAr}</p> : null}
        {sent && state.orders[0]?.id ? (
          <div className="mt-4">
            <StoreDirectPayGuest
              product="store_produce_live"
              token={token}
              requestRef={state.orders[0].id}
              accent="#3d8b4a"
              amountSar={String(state.orders[0].total || '')}
            />
          </div>
        ) : null}
      </form>
      <StoreProduceBuyerChat state={state} onChange={onChange} />
      {neighborShopUx ? (
        <NeighborFloatingCart
          visible={total > 0}
          itemCount={cartItemCount}
          lineCount={cartLineCount}
          totalSar={total}
          shopName={state.host.shopName}
          accent={STORE_PRODUCE_LIVE_ACCENT}
          checkoutLabel={service === 'come' ? STORE_PRODUCE_LIVE.comeSubmitAr : STORE_PRODUCE_LIVE.submitOrderAr}
          onCheckout={() => {
            NeighborShopEvents.viewCart('produce', token, isLab, cartItemCount);
            NeighborShopEvents.beginCheckout('produce', token, isLab);
            document.getElementById('produce-checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        />
      ) : null}
    </div>
  );
}

function ProduceShelfCard({
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
    <article className="overflow-hidden rounded-2xl border border-[#3d8b4a]/35 bg-[#102018]">
      <div className="aspect-[4/3] overflow-hidden bg-[#061018]">
        <img
          src={produceCatalogImage(imageIndex)}
          alt={item.nameAr}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="p-3">
        <p className="text-sm font-extrabold text-[#f4efe4]">{item.nameAr}</p>
        <p className="mt-1 text-sm font-black text-[#3d8b4a]">{priceLine}</p>
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
      <button type="button" onClick={onPlus} className="h-8 w-8 rounded-full bg-[#3d8b4a] text-lg font-black text-[#061018]">
        +
      </button>
    </div>
  );
}
