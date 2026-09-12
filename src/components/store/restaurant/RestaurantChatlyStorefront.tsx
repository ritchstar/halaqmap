/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * واجهة زبون مطعمنا1 — هيكل Chatly مع منطق halaqmap الحقيقي.
 */
import { useMemo, useState } from 'react';
import {
  UtensilsCrossed,
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { StoreRestaurantBuyerChat } from '@/components/store/StoreRestaurantChat';
import { StoreMobileVendorBanner } from '@/components/store/StoreMobileVendorBanner';
import { StoreMobileVendorMark } from '@/components/store/StoreMobileVendorMark';
import { StoreShopHoursBanner } from '@/components/store/StoreShopHoursBanner';
import { StoreBuyerLocateButtons } from '@/components/store/StoreBuyerLocateButtons';
import { StoreShopLogoMark } from '@/components/store/StoreShopLogoMark';
import { StoreShopPlacePin } from '@/components/store/StoreShopPlacePin';
import { StoreDirectPayGuest, StoreDirectPayPublicMount } from '@/components/store/StoreDirectPayGuest';
import { RestaurantMatamnaMark } from '@/components/store/restaurant/RestaurantMatamnaMark';
import {
  STORE_RESTAURANT_LIVE,
  STORE_RESTAURANT_LIVE_ACCENT,
  STORE_RESTAURANT_LIVE_LAB_TOKEN,
  restaurantShelfVisible,
} from '@/config/storeRestaurantLive';
import { STORE_MOBILE_VENDOR } from '@/config/storeMobileVendor';
import { STORE_SHOP_HOURS_COPY } from '@/config/storeShopHours';
import {
  restaurantCartTotal,
  readSavedRestaurantBuyer,
  writeSavedRestaurantBuyer,
  type RestaurantLabState,
  type RestaurantOrderLine,
  type RestaurantPayMethod,
  type RestaurantService,
} from '@/lib/storeRestaurantLiveLab';
import { neighborVendorState } from '@/lib/storeMobileVendor';
import { isShopClosedNow, shopHoursLinesAr } from '@/lib/storeShopHours';
import { liveActivityCoverSrc } from '@/lib/storeLiveActivityShelf';
import { cn } from '@/lib/utils';

type ShelfRow = RestaurantLabState['shelf'][number];

export function RestaurantChatlyStorefront({
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
  const [category, setCategory] = useState('الكل');
  const [search, setSearch] = useState('');
  
  const [name, setName] = useState(saved?.name || '');
  const [phone, setPhone] = useState(saved?.phone || '');
  
  const [pay, setPay] = useState<RestaurantPayMethod>('cash');
  const [service, setService] = useState<RestaurantService>('delivery');
  const [saveBuyer, setSaveBuyer] = useState(Boolean(saved) && !isLab);
  const [placeDesc, setPlaceDesc] = useState(saved?.place || '');
  const [placeCoords, setPlaceCoords] = useState(isLab ? STORE_RESTAURANT_LIVE.labDemoCoordsAr : '');
  const [placeAdopted, setPlaceAdopted] = useState(isLab);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const mobile = state.host.vendorMode === 'mobile';
  const closed = isShopClosedNow(state.host);
  const neighbor = neighborVendorState({ ...state.host, closed });
  const preorder = closed || (mobile && neighbor !== 'at_pin');
  const serviceKind = mobile ? 'pickup' : service;
  const visible = state.shelf.filter((item) => restaurantShelfVisible(item.availability, item.inStock));
  const featured = visible.filter((item) => item.featured).slice(0, 8);
  const shelfItems = visible.filter((item) => !featured.some((row) => row.catalogId === item.catalogId));
  const today = visible.find((item) => item.catalogId === 'today-board') || featured[0];
  const needsPlace = serviceKind === 'delivery';

  const lines: RestaurantOrderLine[] = visible
    .map((item) => ({
      catalogId: item.catalogId,
      nameAr: item.nameAr,
      qty: qty[item.catalogId] || 0,
      price: item.price,
    }))
    .filter((line) => line.qty > 0);

  const total = restaurantCartTotal(lines);
  const cartLineCount = lines.reduce((sum, line) => sum + line.qty, 0);
  const cartItemCount = lines.length;

  const categories = useMemo(() => {
    const cats = new Set<string>();
    visible.forEach((item) => {
      if (item.category?.trim()) cats.add(item.category.trim());
    });
    return ['الكل', ...(featured.length ? [STORE_RESTAURANT_LIVE.featuredTitleAr] : []), ...Array.from(cats).sort()];
  }, [visible, featured.length]);

  const filtered = useMemo(() => {
    const q = search.trim();
    const base = category === STORE_RESTAURANT_LIVE.featuredTitleAr ? visible.filter((i) => i.featured) : shelfItems;
    return base.filter((item) => {
      const matchesCategory =
        category === 'الكل' ||
        (category === STORE_RESTAURANT_LIVE.featuredTitleAr ? item.featured : item.category === category);
      const matchesSearch = !q || item.nameAr.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [visible, category, search, shelfItems]);

  const heroSrc = today?.photoSrc || liveActivityCoverSrc(state.shelf) || STORE_RESTAURANT_LIVE.heroImage;
  const hoursLine = shopHoursLinesAr(state.host).join(' · ');





  function bump(id: string, delta: number) {
    setQty((current) => {
      const next = Math.max(0, (current[id] || 0) + delta);
      return { ...current, [id]: next };
    });
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2200);
  }

  function priceLine(item: ShelfRow) {
    return `${item.price} ر.س`;
  }

  function serviceLabel(s: RestaurantService) {
    if (s === 'pickup') return STORE_RESTAURANT_LIVE.servicePickupAr;
    return STORE_RESTAURANT_LIVE.serviceDeliveryAr;
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
    setCartOpen(false);
    setCheckoutOpen(false);
    showNotice(STORE_RESTAURANT_LIVE.orderSentAr);
  }

  function openCheckout() {
    setCheckoutOpen(true);
  }

  const services = [
    { id: 'delivery' as const, label: STORE_RESTAURANT_LIVE.serviceDeliveryAr, icon: Truck, copy: 'إلى بابك' },
    { id: 'pickup' as const, label: STORE_RESTAURANT_LIVE.servicePickupAr, icon: MapPin, copy: 'من نقطة البائع' },
  ];

  return (
    <main dir="rtl" className="restaurant-chatly-root min-h-dvh bg-[#f4f1e8] pb-32 text-[#2a1810]">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-[#dfe4d6] py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-[#e8c4a8] bg-[#fffdf5] text-[#c97430]">
              <StoreShopLogoMark src={state.host.logoSrc} className="size-8" />
              {!state.host.logoSrc ? <RestaurantMatamnaMark size="sm" /> : null}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#e08a3c]">{STORE_RESTAURANT_LIVE.shopKickerAr}</p>
              <p className="truncate text-lg font-black tracking-tight">{state.host.shopName}</p>
            </div>
            {mobile ? <StoreMobileVendorMark accent={STORE_RESTAURANT_LIVE_ACCENT} /> : null}
            <StoreShopPlacePin
              mapsUrl={state.host.pickupMapsUrl}
              visible={mobile ? neighbor === 'at_pin' : state.host.pickupPlaceVisible}
              accent={STORE_RESTAURANT_LIVE_ACCENT}
              labelAr={STORE_RESTAURANT_LIVE.pickupPinAriaAr}
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              if (cartLineCount) setCartOpen(true);
              else showNotice('السلة فارغة — اختر من الرف أولاً');
            }}
            className="restaurant-chatly-btn-ghost relative h-10 shrink-0 rounded-full px-4 text-xs font-black"
          >
            <ShoppingBag size={16} />
            السلة
            {cartLineCount ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-[#e08a3c] text-[10px] text-white">
                {cartLineCount}
              </span>
            ) : null}
          </Button>
        </header>

        {state.host.flashAr.trim() ? (
          <p className="mt-4 overflow-hidden rounded-2xl border border-[#f0c9a8] bg-[#fdeee0] px-4 py-2 text-sm font-bold text-[#c97430]">
            {state.host.flashAr}
          </p>
        ) : null}

        <StoreShopHoursBanner hours={state.host} accent={STORE_RESTAURANT_LIVE_ACCENT} />
        <StoreMobileVendorBanner place={state.host} closed={closed} accent={STORE_RESTAURANT_LIVE_ACCENT} />

        {!state.host.acceptingOrders ? (
          <p className="mt-3 rounded-2xl border border-[#e8c4bc] bg-[#fdf0ed] px-4 py-3 text-sm font-bold text-[#9f554c]">
            {STORE_SHOP_HOURS_COPY.pauseVisitorAr}
          </p>
        ) : null}

        <section className="grid gap-8 border-b border-[#dfe4d6] py-9 lg:grid-cols-[1fr_0.86fr] lg:items-center lg:gap-16">
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs font-bold text-[#e08a3c]">
              <span className="h-px w-8 bg-[#d4924a]" />
              {STORE_RESTAURANT_LIVE.shopKickerAr}
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-[1.08] tracking-[-0.06em] text-[#2a1810] sm:text-5xl">
              {state.host.shopName}
              <br />
              <span className="text-[#e08a3c]">{STORE_RESTAURANT_LIVE.heroCaptionAr}</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-[#667564]">{state.host.blurbAr}</p>
            {state.host.customFields.some((line) => line.trim()) ? (
              <ul className="mt-4 space-y-1 text-sm leading-7 text-[#758374]">
                {state.host.customFields
                  .filter((line) => line.trim())
                  .slice(0, 5)
                  .map((line) => (
                    <li key={line}>{line}</li>
                  ))}
              </ul>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => setServiceOpen(true)}
                className="restaurant-chatly-btn-primary h-12 rounded-full px-6 text-sm font-black shadow-[0_12px_25px_rgba(224,138,60,0.2)]"
              >
                اختَر طريقة الاستلام
                <ChevronDown size={16} />
              </Button>
              {today ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-[#f0c9a8] bg-[#fffdf5] px-4 py-3 text-xs font-bold text-[#637263]">
                  <span className="size-2 rounded-full bg-[#e08a3c]" />
                  {STORE_RESTAURANT_LIVE.todayTitleAr}: {today.nameAr}
                </div>
              ) : null}
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-xs font-bold text-[#758374]">
              {hoursLine ? (
                <span className="inline-flex items-center gap-2">
                  <Clock3 size={15} className="text-[#e08a3c]" />
                  {hoursLine}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2">
                <Store size={15} className="text-[#e08a3c]" />
                متجر مستقل في الحي
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-8 -top-8 size-24 rounded-full border border-dashed border-[#e0c4a0]" />
            <div className="relative overflow-hidden rounded-[2rem] border-[9px] border-[#fffdf5] bg-[#f0e0cc] shadow-[0_22px_60px_rgba(224,138,60,0.15)]">
              <img
                src={heroSrc}
                alt=""
                className="aspect-square w-full object-cover"
                loading="eager"
                decoding="async"
              />
              
            </div>
          </div>
        </section>

        
        {featured.length ? (
          <section className="border-b border-[#dfe4d6] py-9">
            <p className="text-xs font-bold tracking-[0.16em] text-[#e08a3c]">{STORE_RESTAURANT_LIVE.featuredTitleAr}</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#2a1810]">{STORE_RESTAURANT_LIVE.featuredTitleAr}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((item) => (
                <ProductCard
                  key={item.catalogId}
                  item={item}
                  quantity={qty[item.catalogId] || 0}
                  priceLine={priceLine(item)}
                  onChange={(delta) => bump(item.catalogId, delta)}
                />
              ))}
            </div>
          </section>
        ) : null}

        
        {today ? (
          <section className="border-b border-[#dfe4d6] py-9">
            <p className="text-xs font-bold tracking-[0.16em] text-[#d4924a]">{STORE_RESTAURANT_LIVE.todayTitleAr}</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-[#f0c9a8] bg-[#fffdf5]">
              {today.photoSrc ? (
                <img src={today.photoSrc} alt={today.nameAr} className="aspect-[16/9] w-full object-cover" loading="lazy" />
              ) : null}
              <div className="flex items-center justify-between gap-3 px-4 py-4">
                <div>
                  <h2 className="text-xl font-black text-[#2a1810]">{today.nameAr}</h2>
                  <p className="mt-1 text-sm font-black text-[#e08a3c]">{today.price} ر.س</p>
                </div>
                <QtyControls value={qty[today.catalogId] || 0} onMinus={() => bump(today.catalogId, -1)} onPlus={() => bump(today.catalogId, 1)} />
              </div>
            </div>
          </section>
        ) : null}

        <section className="sticky top-0 z-20 -mx-4 border-b border-[#dfe4d6] bg-[#f4f1e8]/95 px-4 py-3 backdrop-blur-sm sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#788877]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={visible.length >= 8 ? 'ابحث في الرف…' : ''}
                className="h-11 border-[#d4dfcc] bg-[#fffdf5] pr-10 text-sm text-[#2a1810] placeholder:text-[#a0aca0]"
              />
            </div>
            <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
              {categories.map((item) => (
                <Button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={cn(
                    'h-10 shrink-0 rounded-full px-4 text-xs font-bold shadow-none',
                    category === item
                      ? 'restaurant-chatly-btn-primary'
                      : 'restaurant-chatly-btn-ghost',
                  )}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section id="shelf" className="py-9">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#e08a3c]">{STORE_RESTAURANT_LIVE.shelfTitleAr}</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#2a1810]">اختَر ما تحتاجه</h2>
              <p className="mt-2 text-sm text-[#758374]">{STORE_RESTAURANT_LIVE.priceEstimateNoteAr}</p>
            </div>
            <span className="hidden items-center gap-2 text-xs font-bold text-[#758374] sm:flex">
              <UtensilsCrossed size={16} className="text-[#e08a3c]" />
              {filtered.length} أصناف
            </span>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((item) => (
              <ProductCard
                key={item.catalogId}
                item={item}
                quantity={qty[item.catalogId] || 0}
                priceLine={priceLine(item)}
                onChange={(delta) => bump(item.catalogId, delta)}
              />
            ))}
          </div>
          {!filtered.length ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[#e8dfd0] bg-[#fffdf5] p-10 text-center">
              <UtensilsCrossed size={24} className="mx-auto text-[#c97430]" />
              <p className="mt-3 font-black text-[#2a1810]">ما لقينا هذا الصنف</p>
              <p className="mt-1 text-sm text-[#788877]">جرّب كلمة ثانية أو ارجع لكل الرف.</p>
            </div>
          ) : null}
        </section>

        <section className="grid gap-3 border-t border-[#dfe4d6] py-8 sm:grid-cols-3">
          <Feature icon={Truck} title={STORE_RESTAURANT_LIVE.serviceDeliveryAr} copy="توصيل واضح — الدفع عند الاستلام." />
          <Feature icon={MapPin} title={STORE_RESTAURANT_LIVE.servicePickupAr} copy="نقطة البائع تظهر قبل التأكيد." />
          <Feature icon={Store} title="متجر مستقل" copy="طلبك يذهب مباشرة إلى هذا المحل." />
        </section>

        <section className="rounded-2xl border border-[#d4dfcc] bg-[#fffdf5] p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-[#e08a3c]">متجر مستقل</p>
              <h3 className="mt-1 text-lg font-black text-[#2a1810]">أنت تشتري من بائع واحد في حيك</h3>
              <p className="mt-1 text-sm text-[#758374]">ليست سوقاً مشتركة؛ طلبك يذهب مباشرة إلى {state.host.shopName}.</p>
            </div>
            <StoreDirectPayPublicMount product="store_restaurant_live" token={token} accent={STORE_RESTAURANT_LIVE_ACCENT} />
          </div>
        </section>

        <div className="mt-6">
          <StoreRestaurantBuyerChat state={state} onChange={onChange} isLab={isLab} />
        </div>

        <footer className="flex flex-col gap-3 border-t border-[#dfe4d6] py-7 text-sm text-[#758374] sm:flex-row sm:items-center sm:justify-between">
          <p>مطعمنا1 — من مطبخ الحي إلى بابك.</p>
          <div className="flex flex-wrap gap-5 font-bold">
            <span>الدفع عند الاستلام أو التحويل المباشر</span>
            <span>لا تحصيل سلة عبر ميسر</span>
          </div>
        </footer>
      </div>

      {cartLineCount > 0 ? (
        <div className="fixed bottom-4 right-4 left-4 z-30 mx-auto flex max-w-[800px] items-center justify-between gap-4 rounded-2xl bg-[#2a1810] px-4 py-3 text-white shadow-[0_15px_35px_rgba(42,24,16,0.28)] sm:right-8 sm:left-8 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e08a3c]">
              <RestaurantMatamnaMark size="sm" inverse />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">
                {cartItemCount} {cartItemCount === 1 ? 'صنف' : 'أصناف'} في السلة
              </p>
              <p className="text-xs text-[#c4dcc1]">
                {total} ر.س · {serviceLabel(service)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={openCheckout}
            className="h-10 shrink-0 rounded-xl border-0 bg-[#fdeee0] px-4 text-xs font-black text-[#27472c] shadow-none hover:bg-white"
          >
            إتمام الطلب
            <ArrowLeft size={15} />
          </Button>
        </div>
      ) : null}

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-[#d4dfcc] bg-[#fffdf5] p-0 text-right" dir="rtl">
          <div className="p-5 sm:p-6">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <DialogTitle className="text-2xl font-black text-[#2a1810]">مراجعة السلة</DialogTitle>
                  <DialogDescription className="mt-2 text-sm leading-6 text-[#758374]">
                    {STORE_RESTAURANT_LIVE.priceEstimateNoteAr}
                  </DialogDescription>
                </div>
                <span className="rounded-full bg-[#fdeee0] px-3 py-1 text-xs font-black text-[#e08a3c]">
                  {cartItemCount} أصناف
                </span>
              </div>
            </DialogHeader>
            <div className="mt-6 space-y-3">
              {lines.map((line) => {
                const item = visible.find((row) => row.catalogId === line.catalogId);
                if (!item) return null;
                return (
                  <div key={line.catalogId} className="flex items-center gap-3 rounded-xl border border-[#e8dfd0] bg-white p-3">
                    <ProductVisual item={item} small />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-[#2a1810]">{line.nameAr}</p>
                      <p className="mt-1 text-xs text-[#7a8979]">{priceLine(item)}</p>
                    </div>
                    <QtyControls value={line.qty} onMinus={() => bump(line.catalogId, -1)} onPlus={() => bump(line.catalogId, 1)} />
                  </div>
                );
              })}
            </div>
            <div className="mt-6 rounded-xl bg-[#fdeee0] p-4">
              <div className="flex items-center justify-between text-lg font-black text-[#2a1810]">
                <span>الإجمالي التقديري</span>
                <span>{total} ر.س</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#758374]">{STORE_RESTAURANT_LIVE.priceEstimateNoteAr}</p>
            </div>
            <Button
              type="button"
              onClick={() => {
                setCartOpen(false);
                openCheckout();
              }}
              className="restaurant-chatly-btn-primary mt-5 h-12 w-full rounded-xl text-sm font-black"
            >
              أكمل الطلب
              <ArrowLeft size={16} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={serviceOpen} onOpenChange={setServiceOpen}>
        <DialogContent className="max-w-xl border-[#d4dfcc] bg-[#fffdf5] text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#2a1810]">كيف توصلك مشترياتك؟</DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-[#758374]">
              الخدمة تظهر حسب نوع البائع وموقعه الحالي.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {services.map(({ id, label, icon: Icon, copy }) => (
              <Button
                key={id}
                type="button"
                onClick={() => setService(id as RestaurantService)}
                className={cn(
                  'h-auto min-w-0 flex-col items-start gap-3 rounded-xl border p-4 text-right shadow-none',
                  service === id
                    ? 'border-[#e08a3c] bg-[#fdeee0]'
                    : 'border-[#e8dfd0] bg-white hover:bg-[#fdf3e8]',
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#fffdf5] text-[#e08a3c]">
                  <Icon size={18} />
                </span>
                <span className="text-sm font-black text-[#2a1810]">{label}</span>
                <span className="text-xs font-normal text-[#7a8979]">{copy}</span>
              </Button>
            ))}
          </div>
          {service === 'pickup' && state.host.pickupPlaceVisible && state.host.pickupPlaceAr ? (
            <div className="mt-5 rounded-xl border border-[#d4dfcc] bg-[#fdeee0] p-4">
              <div className="flex items-center gap-2 text-sm font-black text-[#c97430]">
                <MapPin size={16} />
                موقع الاستلام
              </div>
              <p className="mt-2 text-sm leading-6 text-[#758374]">{state.host.pickupPlaceAr}</p>
            </div>
          ) : null}
          <Button
            type="button"
            onClick={() => {
              setServiceOpen(false);
              showNotice('تم حفظ طريقة الخدمة');
            }}
            className="restaurant-chatly-btn-primary mt-6 h-11 w-full rounded-xl text-sm font-black"
          >
            تأكيد طريقة الخدمة
            <Check size={16} />
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-[#d4dfcc] bg-[#fffdf5] text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#2a1810]">
              {preorder ? STORE_SHOP_HOURS_COPY.preorderTitleAr : STORE_RESTAURANT_LIVE.checkoutTitleAr}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-[#758374]">
              الإجمالي التقديري: {total} ر.س — {STORE_RESTAURANT_LIVE.priceEstimateNoteAr}
            </DialogDescription>
          </DialogHeader>
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <label className="block text-xs font-bold text-[#647463]">
              {STORE_RESTAURANT_LIVE.buyerNameLabelAr}
              <Input
                required={!isLab}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 h-11 border-[#d4dfcc] bg-white"
                maxLength={40}
                placeholder={isLab ? STORE_RESTAURANT_LIVE.labDemoNameAr : undefined}
              />
            </label>
            <label className="block text-xs font-bold text-[#647463]">
              {STORE_RESTAURANT_LIVE.buyerPhoneLabelAr}
              <Input
                required={!isLab}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 h-11 border-[#d4dfcc] bg-white"
                inputMode="tel"
                maxLength={20}
                placeholder={isLab ? STORE_RESTAURANT_LIVE.labDemoPhoneAr : undefined}
              />
            </label>
            {mobile ? (
              <p className="text-sm font-bold text-[#e08a3c]">{STORE_MOBILE_VENDOR.pickupFromCartAr}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {services.map(({ id, label }) => (
                  <Button
                    key={id}
                    type="button"
                    onClick={() => setService(id)}
                    className={cn(
                      'h-9 rounded-full px-3 text-xs font-bold shadow-none',
                      service === id ? 'restaurant-chatly-btn-primary' : 'restaurant-chatly-btn-ghost',
                    )}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            )}
            {needsPlace ? (
              <>
                <label className="block text-xs font-bold text-[#647463]">
                  {STORE_RESTAURANT_LIVE.buyerPlaceLabelAr}
                  <Input
                    required={!isLab}
                    value={placeDesc}
                    onChange={(e) => setPlaceDesc(e.target.value)}
                    className="mt-2 h-11 border-[#d4dfcc] bg-white"
                    maxLength={120}
                    placeholder={isLab ? STORE_RESTAURANT_LIVE.labDemoPlaceAr : 'الحي، الشارع، رقم المبنى أو أقرب علامة'}
                  />
                </label>
                <label className="block text-xs font-bold text-[#647463]">
                  {STORE_RESTAURANT_LIVE.buyerPlaceCoordsLabelAr}
                  <Input
                    readOnly
                    value={placeCoords}
                    className="mt-2 h-11 border-[#d4dfcc] bg-white text-[#849284]"
                    placeholder={STORE_RESTAURANT_LIVE.buyerPlaceCoordsHintAr}
                  />
                </label>
                {!isLab ? (
                  <StoreBuyerLocateButtons
                    value={placeCoords}
                    accent={STORE_RESTAURANT_LIVE_ACCENT}
                    copy={STORE_RESTAURANT_LIVE}
                    onLocated={(mapsUrl) => {
                      setPlaceCoords(mapsUrl);
                      setPlaceAdopted(false);
                    }}
                    onAdopted={() => setPlaceAdopted(true)}
                  />
                ) : null}
                {!isLab && placeCoords && !placeAdopted ? (
                  <p className="text-sm text-amber-700">اعتمد الموقع قبل إرسال الطلب.</p>
                ) : null}
              </>
            ) : null}
            <label className="block text-xs font-bold text-[#647463]">
              {STORE_RESTAURANT_LIVE.buyerNoteLabelAr}
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-2 h-11 border-[#d4dfcc] bg-white"
                maxLength={160}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => setPay('cash')}
                className={cn(
                  'h-9 rounded-full px-3 text-xs font-bold shadow-none',
                  pay === 'cash' ? 'restaurant-chatly-btn-primary' : 'restaurant-chatly-btn-ghost',
                )}
              >
                {STORE_RESTAURANT_LIVE.payCashAr}
              </Button>
              <Button
                type="button"
                onClick={() => setPay('card')}
                className={cn(
                  'h-9 rounded-full px-3 text-xs font-bold shadow-none',
                  pay === 'card' ? 'restaurant-chatly-btn-primary' : 'restaurant-chatly-btn-ghost',
                )}
              >
                {STORE_RESTAURANT_LIVE.payCardAr}
              </Button>
            </div>
            {!isLab ? (
              <label className="flex items-start gap-2 text-sm leading-7 text-[#758374]">
                <input type="checkbox" checked={saveBuyer} onChange={(e) => setSaveBuyer(e.target.checked)} className="mt-1" />
                <span>
                  {STORE_RESTAURANT_LIVE.saveBuyerAr}
                  <span className="mt-1 block text-xs text-[#849284]">{STORE_RESTAURANT_LIVE.saveBuyerHintAr}</span>
                </span>
              </label>
            ) : null}
            <Button type="submit" className="restaurant-chatly-btn-primary h-12 w-full rounded-xl text-sm font-black">
              {STORE_RESTAURANT_LIVE.submitOrderAr}
            </Button>
            {sent ? <p className="text-sm font-bold text-[#e08a3c]">{sent}</p> : null}
            {sent && state.orders[0]?.id ? (
              <StoreDirectPayGuest
                product="store_restaurant_live"
                token={token}
                requestRef={state.orders[0].id}
                accent={STORE_RESTAURANT_LIVE_ACCENT}
                amountSar={String(state.orders[0].total || '')}
              />
            ) : null}
          </form>
        </DialogContent>
      </Dialog>

      {notice ? (
        <div className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-full bg-[#2a1810] px-5 py-3 text-sm font-bold text-white shadow-xl sm:right-8">
          <Check size={16} className="text-[#fdeee0]" />
          {notice}
        </div>
      ) : null}
    </main>
  );
}

function ProductCard({
  item,
  quantity,
  priceLine,
  onChange,
}: {
  item: ShelfRow;
  quantity: number;
  priceLine: string;
  onChange: (delta: number) => void;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#e8dfd0] bg-[#fffdf5] shadow-[0_10px_25px_rgba(42,24,16,0.05)]">
      <ProductVisual item={item} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-[#2a1810]">{item.nameAr}</h3>
            {item.category ? <p className="mt-1 text-xs font-bold text-[#849284]">{item.category}</p> : null}
          </div>
          <p className="whitespace-nowrap text-base font-black text-[#e08a3c]">
            {item.price} <span className="text-[10px]">ر.س</span>
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span
            className={cn(
              'text-[10px] font-black',
              item.featured ? 'text-[#e08a3c]' : 'text-[#9aa49a]',
            )}
          >
            {item.featured ? STORE_RESTAURANT_LIVE.featuredTitleAr : STORE_RESTAURANT_LIVE.stockAvailableAr}
          </span>
          {quantity ? (
            <QtyControls value={quantity} onMinus={() => onChange(-1)} onPlus={() => onChange(1)} />
          ) : (
            <Button
              type="button"
              onClick={() => onChange(1)}
              className="h-9 rounded-lg border-0 bg-[#fdeee0] px-3 text-xs font-black text-[#c97430] shadow-none hover:bg-[#f5dcc8]"
            >
              إضافة سريعة
              <Plus size={14} />
            </Button>
          )}
        </div>
        <p className="mt-2 text-[10px] text-[#9aa49a]">{priceLine}</p>
      </div>
    </article>
  );
}

function ProductVisual({ item, small = false }: { item: ShelfRow; small?: boolean }) {
  const src = item.photoSrc || STORE_RESTAURANT_LIVE.heroImage;
  return (
    <div className={cn('relative overflow-hidden bg-[#f0e6d8]', small ? 'size-16 shrink-0 rounded-lg' : '')}>
      <img
        src={src}
        alt={item.nameAr}
        className={cn(
          'object-cover',
          small ? 'size-16' : 'aspect-square w-full transition-transform duration-500 group-hover:scale-105',
        )}
        loading="lazy"
        decoding="async"
      />
      {!small && item.featured ? (
        <span className="absolute right-3 top-3 rounded-full bg-[#fffdf5]/90 px-2 py-1 text-[10px] font-black text-[#e08a3c]">
          {STORE_RESTAURANT_LIVE.featuredTitleAr}
        </span>
      ) : null}
    </div>
  );
}

function QtyControls({
  value,
  onMinus,
  onPlus,
}: {
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-[#fdeee0] px-2 py-1">
      <Button type="button" onClick={onMinus} className="size-7 rounded-md bg-transparent p-0 text-[#c97430] shadow-none hover:bg-white">
        <Minus size={14} />
      </Button>
      <span className="w-4 text-center text-sm font-black">{value}</span>
      <Button type="button" onClick={onPlus} className="size-7 rounded-md bg-transparent p-0 text-[#c97430] shadow-none hover:bg-white">
        <Plus size={14} />
      </Button>
    </div>
  );
}

function Feature({ icon: Icon, title, copy }: { icon: typeof Truck; title: string; copy: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-[#e8dfd0] bg-[#fffdf5] p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fdeee0] text-[#e08a3c]">
        <Icon size={17} />
      </span>
      <div>
        <p className="text-sm font-black text-[#2a1810]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#849284]">{copy}</p>
      </div>
    </div>
  );
}
