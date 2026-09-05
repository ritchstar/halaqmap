/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useMemo, useState } from 'react';
import { STORE_GROCERS_LIVE, STORE_GROCERS_LIVE_LAB_TOKEN, grocersCatalogImage } from '@/config/storeGrocersLive';
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
import { StoreMobileVendorBanner } from '@/components/store/StoreMobileVendorBanner';
import { StoreMobileVendorMark } from '@/components/store/StoreMobileVendorMark';
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

type GrocersService = 'delivery' | 'pickup';

export function StoreGrocersShop({
  state,
  onChange,
  token,
}: {
  state: GrocersLabState;
  onChange: (next: GrocersLabState) => void;
  token: string;
}) {
  const isLab = token === STORE_GROCERS_LIVE_LAB_TOKEN;
  const saved = useMemo(() => (isLab ? null : readSavedGrocersBuyer()), [isLab]);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState(saved?.name || '');
  const [phone, setPhone] = useState(saved?.phone || '');
  const [place, setPlace] = useState(saved?.place || '');
  const [placeConfirmed, setPlaceConfirmed] = useState(false);
  const [facadeSrc, setFacadeSrc] = useState('');
  const [pay, setPay] = useState<GrocersPayMethod>('cash');
  const [service, setService] = useState<GrocersService>('delivery');
  const [saveBuyer, setSaveBuyer] = useState(false);
  const [sent, setSent] = useState(false);

  const mobile = state.host.vendorMode === 'mobile';
  const closed = isShopClosedNow(state.host);
  const neighbor = neighborVendorState({ ...state.host, closed });
  const preorder = closed || (mobile && neighbor !== 'at_pin');
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
  const needsPlace = service === 'delivery';

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
    const orderName = isLab ? STORE_GROCERS_LIVE.labDemoNameAr : name.trim().slice(0, 40);
    const orderPhone = isLab ? STORE_GROCERS_LIVE.labDemoPhoneAr : phone.trim().slice(0, 20);
    const orderPlace = isLab
      ? STORE_GROCERS_LIVE.labDemoPlaceAr
      : needsPlace
        ? place.trim().slice(0, 160)
        : 'استلام من المحل';
    if (!isLab && orderName.length < 2) return;
    if (!isLab && orderPhone.length < 9) return;
    if (!isLab && needsPlace && orderPlace.length < 3) return;
    if (!lines.length) return;
    const order = {
      id: `${Date.now()}`,
      name: orderName,
      phone: orderPhone,
      place: orderPlace,
      facadeSrc: isLab ? '' : facadeSrc,
      pay,
      service,
      lines,
      total,
      at: new Date().toISOString(),
      seen: false,
    };
    onChange({ ...state, orders: [order, ...state.orders].slice(0, 200) });
    if (!isLab) {
      writeSavedGrocersBuyer(saveBuyer ? { name: order.name, phone: order.phone, place: order.place } : null);
    }
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
        <h2 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-black md:text-3xl">
          <StoreShopLogoMark src={state.host.logoSrc} />
          <span>{state.host.shopName}</span>
          {mobile ? <StoreMobileVendorMark accent="#8fbf7a" /> : null}
          <StoreShopPlacePin
            mapsUrl={state.host.pickupMapsUrl}
            visible={mobile ? neighbor === 'at_pin' : state.host.pickupPlaceVisible}
            accent="#8fbf7a"
            labelAr={STORE_GROCERS_LIVE.pickupPinAriaAr}
          />
        </h2>
        <p className="mt-2 text-sm leading-7 text-white/75">{state.host.blurbAr}</p>
        <ul className="mt-3 space-y-1 text-sm leading-7 text-white/70">
          {state.host.customFields.filter((line) => line.trim()).slice(0, 5).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </header>
      <StoreShopHoursBanner hours={state.host} accent="#8fbf7a" />
      <StoreMobileVendorBanner place={state.host} closed={closed} accent="#8fbf7a" />

      <section>
        <h3 className="text-lg font-extrabold">{STORE_GROCERS_LIVE.featuredTitleAr}</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((item, index) => (
            <article key={item.catalogId} className="overflow-hidden rounded-2xl border border-[#8fbf7a]/30 bg-[#102018]">
              <img
                src={grocersCatalogImage(index)}
                alt=""
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
              <div className="p-3">
                <p className="text-sm font-bold leading-6">{item.nameAr}</p>
                <p className="mt-1 text-sm font-black text-[#8fbf7a]">{item.price} ر.س</p>
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
        <h3 className="text-lg font-extrabold">
          {preorder ? STORE_SHOP_HOURS_COPY.preorderTitleAr : STORE_GROCERS_LIVE.checkoutTitleAr}
        </h3>
        <p className="mt-1 text-sm text-[#8fbf7a]">الإجمالي الآن: {total} ر.س</p>

        <p className="mt-4 text-sm font-bold">طريقة الاستلام</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setService('delivery')}
            className={cn('rounded-full px-3 py-1.5 text-xs', service === 'delivery' ? 'bg-[#8fbf7a] font-bold text-[#061018]' : 'border border-white/20')}
          >
            {STORE_GROCERS_LIVE.serviceDeliveryAr}
          </button>
          <button
            type="button"
            onClick={() => {
              setService('pickup');
              setPlaceConfirmed(false);
            }}
            className={cn('rounded-full px-3 py-1.5 text-xs', service === 'pickup' ? 'bg-[#8fbf7a] font-bold text-[#061018]' : 'border border-white/20')}
          >
            {STORE_GROCERS_LIVE.servicePickupAr}
          </button>
        </div>

        <label className="mt-3 block text-sm">
          {STORE_GROCERS_LIVE.buyerNameLabelAr}
          <input
            required={!isLab}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="grocers-field"
            maxLength={40}
            placeholder={isLab ? STORE_GROCERS_LIVE.labDemoNameAr : undefined}
          />
        </label>
        <label className="mt-3 block text-sm">
          {STORE_GROCERS_LIVE.buyerPhoneLabelAr}
          <input
            required={!isLab}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="grocers-field"
            inputMode="tel"
            maxLength={20}
            placeholder={isLab ? STORE_GROCERS_LIVE.labDemoPhoneAr : undefined}
          />
        </label>
        {needsPlace ? (
          <>
            <label className="mt-3 block text-sm">
              {mobile ? STORE_MOBILE_VENDOR.placeHintAr : STORE_GROCERS_LIVE.buyerPlaceLabelAr}
              <input
                value={place}
                onChange={(e) => {
                  setPlace(e.target.value);
                  setPlaceConfirmed(false);
                }}
                className="grocers-field"
                maxLength={160}
                placeholder={isLab ? STORE_GROCERS_LIVE.labDemoPlaceAr : undefined}
              />
            </label>
            <StoreBuyerLocateButtons
              value={place}
              accent="#8fbf7a"
              copy={STORE_GROCERS_LIVE}
              onLocated={(next) => {
                setPlace(next);
                setPlaceConfirmed(true);
              }}
            />
            {placeConfirmed && !place.startsWith('http') ? (
              <p className="mt-2 text-xs text-[#8fbf7a]">{STORE_GROCERS_LIVE.locateSavedAr}</p>
            ) : null}
          </>
        ) : null}

        {!isLab && needsPlace ? (
          <label className="mt-3 block text-sm">
            {STORE_GROCERS_LIVE.buyerFacadeLabelAr}
            <p className="mt-1 text-xs leading-6 text-white/55">{STORE_GROCERS_LIVE.buyerFacadeHintAr}</p>
            <input type="file" accept="image/*" className="mt-2 block w-full text-xs" onChange={(e) => void onFacade(e.target.files?.[0])} />
          </label>
        ) : null}

        <p className="mt-4 text-sm font-bold">طريقة الدفع</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => setPay('cash')} className={cn('rounded-full px-3 py-1.5 text-xs', pay === 'cash' ? 'bg-[#8fbf7a] font-bold text-[#061018]' : 'border border-white/20')}>
            {STORE_GROCERS_LIVE.payCashAr}
          </button>
          <button type="button" onClick={() => setPay('card')} className={cn('rounded-full px-3 py-1.5 text-xs', pay === 'card' ? 'bg-[#8fbf7a] font-bold text-[#061018]' : 'border border-white/20')}>
            {STORE_GROCERS_LIVE.payCardAr}
          </button>
        </div>
        <div className="mt-3">
          <StoreDirectPayPublicMount product="store_grocers_live" token={token} accent="#8fbf7a" />
        </div>
        {!isLab ? (
          <label className="mt-4 flex items-start gap-2 text-sm leading-7">
            <input type="checkbox" checked={saveBuyer} onChange={(e) => setSaveBuyer(e.target.checked)} className="mt-1" />
            <span>{STORE_GROCERS_LIVE.saveBuyerAr}</span>
          </label>
        ) : null}
        <button type="submit" className="mt-4 min-h-12 w-full rounded-full bg-[#8fbf7a] text-sm font-bold text-[#061018]">
          {STORE_GROCERS_LIVE.submitOrderAr}
        </button>
        {sent ? <p className="mt-3 text-sm text-[#8fbf7a]">{STORE_GROCERS_LIVE.orderSentAr}</p> : null}
        {sent && state.orders[0]?.id && !isLab ? (
          <div className="mt-4">
            <StoreDirectPayGuest
              product="store_grocers_live"
              token={token}
              requestRef={state.orders[0].id}
              accent="#8fbf7a"
              amountSar={String(state.orders[0].total || '')}
            />
          </div>
        ) : null}
      </form>
      <StoreGrocersBuyerChat state={state} onChange={onChange} isLab={isLab} />
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
