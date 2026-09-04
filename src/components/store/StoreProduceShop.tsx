/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useMemo, useState } from 'react';
import { STORE_PRODUCE_LIVE } from '@/config/storeProduceLive';
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

export function StoreProduceShop({
  state,
  onChange,
  token,
}: {
  state: ProduceLabState;
  onChange: (next: ProduceLabState) => void;
  token: string;
}) {
  const saved = useMemo(() => readSavedProduceBuyer(), []);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState(saved?.name || '');
  const [phone, setPhone] = useState(saved?.phone || '');
  const [place, setPlace] = useState(saved?.place || '');
  const [pay, setPay] = useState<ProducePayMethod>('cash');
  const [service, setService] = useState<ProduceService>('delivery');
  const [buyerLat, setBuyerLat] = useState(0);
  const [buyerLng, setBuyerLng] = useState(0);
  const [comeHint, setComeHint] = useState('');
  const [watchingCome, setWatchingCome] = useState(false);
  const [saveBuyer, setSaveBuyer] = useState(Boolean(saved));
  const [sent, setSent] = useState(false);

  const mobile = state.host.vendorMode === 'mobile';
  const closed = isShopClosedNow(state.host);
  const neighbor = neighborVendorState({ ...state.host, closed });
  const preorder = closed || (mobile && neighbor !== 'at_pin');
  const visible = state.shelf.filter((item) => item.inStock);
  const arrived = visible.filter((item) => item.arrivedToday);
  const featured = visible.filter((item) => item.featured && !item.arrivedToday).slice(0, 10);
  const rest = visible.filter(
    (item) => !item.arrivedToday && !featured.some((row) => row.catalogId === item.catalogId),
  );
  const lines: ProduceOrderLine[] = visible
    .map((item) => ({
      catalogId: item.catalogId,
      nameAr: item.nameAr,
      qty: qty[item.catalogId] || 0,
      price: item.price,
    }))
    .filter((line) => line.qty > 0);
  const total = produceCartTotal(lines);

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
    if (!isProduceComeApproaching(buyerLat, buyerLng, state.host.pickupLat, state.host.pickupLng)) return;
    setWatchingCome(false);
    setComeHint(STORE_PRODUCE_LIVE.comeApproachingAr);
    void showProduceComeApproachingNotice(state.host.shopName);
  }, [watchingCome, buyerLat, buyerLng, state.host.pickupLat, state.host.pickupLng, state.host.shopName]);

  async function submit() {
    if (name.trim().length < 2 || phone.trim().length < 9) return;
    const come = mobile && service === 'come';
    if (!come && !lines.length) return;
    setComeHint('');
    const coords = come ? parseMapsQueryCoords(place) || (buyerLat && buyerLng ? { lat: buyerLat, lng: buyerLng } : null) : null;
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
    writeSavedProduceBuyer(saveBuyer ? { name: order.name, phone: order.phone, place: order.place } : null);
    setQty({});
    setSent(true);
    if (come) {
      setWatchingCome(true);
      setComeHint(STORE_PRODUCE_LIVE.comeWatchingAr);
    }
  }

  function priceLine(item: { price: number; unit: keyof typeof STORE_PRODUCE_UNIT_AR }) {
    return `${item.price} ر.س / ${STORE_PRODUCE_UNIT_AR[item.unit]}`;
  }

  return (
    <div className="space-y-6">
      {state.host.flashAr.trim() ? (
        <p className="produce-flash overflow-hidden rounded-full border border-[#3d8b4a]/40 bg-[#3d8b4a]/15 px-4 py-2 text-sm text-[#d8f0cc]">
          {state.host.flashAr}
        </p>
      ) : null}
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

      {arrived.length ? (
        <section>
          <h3 className="text-lg font-extrabold">{STORE_PRODUCE_LIVE.todayTitleAr}</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {arrived.map((item) => (
              <article key={item.catalogId} className="overflow-hidden rounded-2xl border border-[#3d8b4a]/45 bg-[#102018]">
                <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-[#3d8b4a]/45 to-[#061018] px-3 text-center text-sm font-bold">
                  {item.nameAr}
                </div>
                <div className="p-3">
                  <p className="text-sm font-black text-[#3d8b4a]">{priceLine(item)}</p>
                  <QtyRow value={qty[item.catalogId] || 0} onMinus={() => bump(item.catalogId, -1)} onPlus={() => bump(item.catalogId, 1)} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {featured.length ? (
        <section>
          <h3 className="text-lg font-extrabold">{STORE_PRODUCE_LIVE.featuredTitleAr}</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {featured.map((item) => (
              <article key={item.catalogId} className="overflow-hidden rounded-2xl border border-[#3d8b4a]/30 bg-[#102018]">
                <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-[#3d8b4a]/35 to-[#061018] px-3 text-center text-sm font-bold">
                  {item.nameAr}
                </div>
                <div className="p-3">
                  <p className="text-sm font-black text-[#3d8b4a]">{priceLine(item)}</p>
                  <QtyRow value={qty[item.catalogId] || 0} onMinus={() => bump(item.catalogId, -1)} onPlus={() => bump(item.catalogId, 1)} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {rest.length ? (
        <section>
          <h3 className="text-lg font-extrabold">{STORE_PRODUCE_LIVE.shelfTitleAr}</h3>
          <ul className="mt-3 divide-y divide-white/8 rounded-2xl border border-white/10">
            {rest.map((item) => (
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
        <label className="mt-3 block text-sm">
          {STORE_PRODUCE_LIVE.buyerNameLabelAr}
          <input required value={name} onChange={(e) => setName(e.target.value)} className="produce-field" maxLength={40} />
        </label>
        <label className="mt-3 block text-sm">
          {STORE_PRODUCE_LIVE.buyerPhoneLabelAr}
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="produce-field" inputMode="tel" maxLength={20} />
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
          <StoreDirectPayPublicMount product="store_produce_live" token={token} accent="#3d8b4a" />
        </div>
        <label className="mt-4 flex items-start gap-2 text-sm leading-7">
          <input type="checkbox" checked={saveBuyer} onChange={(e) => setSaveBuyer(e.target.checked)} className="mt-1" />
          <span>{STORE_PRODUCE_LIVE.saveBuyerAr}</span>
        </label>
        <button type="submit" className="mt-4 min-h-12 w-full rounded-full bg-[#3d8b4a] text-sm font-bold text-[#061018]">
          {service === 'come' ? STORE_PRODUCE_LIVE.comeSubmitAr : STORE_PRODUCE_LIVE.submitOrderAr}
        </button>
        {comeHint ? <p className="mt-3 text-sm leading-7 text-[#d8f0cc]">{comeHint}</p> : null}
        {sent && service !== 'come' ? <p className="mt-3 text-sm text-[#3d8b4a]">وصل الطلب للصندوق.</p> : null}
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
      <button type="button" onClick={onPlus} className="h-8 w-8 rounded-full bg-[#3d8b4a] text-lg font-black text-[#061018]">
        +
      </button>
    </div>
  );
}
