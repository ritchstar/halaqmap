/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * واجهة زبون تمرتنا1 — هيكل Chatly مع منطق halaqmap الحقيقي.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Minus,
  Navigation,
  Package,
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
import { StoreDatesBuyerChat } from '@/components/store/StoreDatesChat';
import { StoreMobileVendorBanner } from '@/components/store/StoreMobileVendorBanner';
import { StoreMobileVendorMark } from '@/components/store/StoreMobileVendorMark';
import { StoreShopHoursBanner } from '@/components/store/StoreShopHoursBanner';
import { StoreBuyerLocateButtons } from '@/components/store/StoreBuyerLocateButtons';
import { StoreShopLogoMark } from '@/components/store/StoreShopLogoMark';
import { StoreShopPlacePin } from '@/components/store/StoreShopPlacePin';
import { StoreDirectPayGuest, StoreDirectPayPublicMount } from '@/components/store/StoreDirectPayGuest';
import { StoreShopShippingBuyerCard } from '@/components/store/StoreShopShippingBuyerCard';
import { DatesTamratnaMark } from '@/components/store/dates/DatesTamratnaMark';
import { STORE_DATES_LIVE, STORE_DATES_LIVE_ACCENT, datesCatalogImage } from '@/config/storeDatesLive';
import { STORE_DATES_UNIT_AR } from '@/config/storeDatesCatalog';
import { sanitizeStoreProductImageSrc } from '@/lib/storeDisallowedImagery';
import { STORE_SHOT_SIZES, storeResponsiveWebpSrcSet } from '@/lib/storeResponsiveImage';
import { STORE_MOBILE_VENDOR } from '@/config/storeMobileVendor';
import { STORE_SHOP_HOURS_COPY } from '@/config/storeShopHours';
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
import { neighborVendorState } from '@/lib/storeMobileVendor';
import { isShopClosedNow, shopHoursLinesAr } from '@/lib/storeShopHours';
import { cn } from '@/lib/utils';

type ShelfRow = DatesLabState['shelf'][number];

/** بطاقات الشبكة (وصل اليوم/مميّز/كل الأصناف): عمود واحد على الجوال، عمودان sm، أربعة lg. */
const DATES_GRID_IMAGE_SIZES = '(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 23vw';

export function DatesChatlyStorefront({
  state,
  onChange,
  token,
}: {
  state: DatesLabState;
  onChange: (next: DatesLabState) => void;
  token: string;
}) {
  const saved = useMemo(() => readSavedDatesBuyer(), []);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [category, setCategory] = useState('الكل');
  const [search, setSearch] = useState('');

  const [name, setName] = useState(saved?.name || '');
  const [phone, setPhone] = useState(saved?.phone || '');

  const [pay, setPay] = useState<DatesPayMethod>('cash');
  const [service, setService] = useState<DatesService>('delivery');
  const [saveBuyer, setSaveBuyer] = useState(Boolean(saved));
  const [place, setPlace] = useState(saved?.place || '');
  const [buyerLat, setBuyerLat] = useState(0);
  const [buyerLng, setBuyerLng] = useState(0);
  const [comeHint, setComeHint] = useState('');
  const [watchingCome, setWatchingCome] = useState(false);
  const [sent, setSent] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const mobile = state.host.vendorMode === 'mobile';
  const closed = isShopClosedNow(state.host);
  const neighbor = neighborVendorState({ ...state.host, closed });
  const preorder = closed || (mobile && neighbor !== 'at_pin');
  const come = mobile && service === 'come';

  const visible = state.shelf.filter((item) => item.inStock);
  const arrived = visible.filter((item) => item.arrivedToday);
  const featuredAll = visible.filter((item) => item.featured && !item.arrivedToday).slice(0, 10);
  const featured = featuredAll.length >= 2 ? featuredAll : [];
  const featuredOrRest = featuredAll.length === 1 ? featuredAll : [];
  const shelfItems = visible
    .filter(
      (item) =>
        !item.arrivedToday &&
        !featured.some((row) => row.catalogId === item.catalogId) &&
        !featuredOrRest.some((row) => row.catalogId === item.catalogId),
    )
    .concat(featuredOrRest);

  const lines: DatesOrderLine[] = visible
    .map((item) => ({
      catalogId: item.catalogId,
      nameAr: item.nameAr,
      qty: qty[item.catalogId] || 0,
      price: item.price,
    }))
    .filter((line) => line.qty > 0);

  const total = datesCartTotal(lines);
  const cartLineCount = lines.reduce((sum, line) => sum + line.qty, 0);
  const cartItemCount = lines.length;
  const canCheckout = cartLineCount > 0 || come;

  const categories = useMemo(() => {
    const cats = new Set<string>();
    shelfItems.forEach((item) => {
      if (item.category?.trim()) cats.add(item.category.trim());
    });
    return ['الكل', ...(featured.length ? [STORE_DATES_LIVE.featuredTitleAr] : []), ...Array.from(cats).sort()];
  }, [shelfItems, featured.length]);

  const filtered = useMemo(() => {
    const q = search.trim();
    const base = category === STORE_DATES_LIVE.featuredTitleAr ? visible.filter((i) => i.featured) : shelfItems;
    return base.filter((item) => {
      const matchesCategory =
        category === 'الكل' ||
        (category === STORE_DATES_LIVE.featuredTitleAr ? item.featured : item.category === category);
      const matchesSearch = !q || item.nameAr.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [visible, shelfItems, category, search]);

  const hoursLine = shopHoursLinesAr(state.host).join(' · ');

  useEffect(() => {
    if (!mobile && service === 'come') setService('delivery');
  }, [mobile, service]);

  useEffect(() => {
    if (!state.host.shippingEnabled && service === 'shipping') setService('delivery');
  }, [state.host.shippingEnabled, service]);

  useEffect(() => {
    if (!watchingCome || !buyerLat || !buyerLng) return;
    if (!isDatesComeApproaching(buyerLat, buyerLng, state.host.pickupLat, state.host.pickupLng)) return;
    setWatchingCome(false);
    setComeHint(STORE_DATES_LIVE.comeApproachingAr);
    void showDatesComeApproachingNotice(state.host.shopName);
  }, [watchingCome, buyerLat, buyerLng, state.host.pickupLat, state.host.pickupLng, state.host.shopName]);

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
    return `${item.price} ر.س / ${STORE_DATES_UNIT_AR[item.unit]}`;
  }

  function serviceLabel(s: DatesService) {
    if (s === 'shipping') return STORE_DATES_LIVE.serviceShippingAr;
    if (s === 'come') return STORE_DATES_LIVE.serviceComeAr;
    if (s === 'pickup') return STORE_DATES_LIVE.servicePickupAr;
    return STORE_DATES_LIVE.serviceDeliveryAr;
  }

  async function submit() {
    if (name.trim().length < 2 || phone.trim().length < 9) return;
    if (!come && !lines.length) return;
    setComeHint('');
    const shipping = service === 'shipping';
    const coords = come
      ? parseMapsQueryCoords(place) || (buyerLat && buyerLng ? { lat: buyerLat, lng: buyerLng } : null)
      : null;
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
      place: shipping ? '' : place.trim().slice(0, 240),
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
    setSent(come ? '' : STORE_DATES_LIVE.orderSentAr);
    setOrderPlaced(true);
    setCartOpen(false);
    setCheckoutOpen(false);
    showNotice(come ? STORE_DATES_LIVE.comeWatchingAr : STORE_DATES_LIVE.orderSentAr);
    if (come) {
      setWatchingCome(true);
      setComeHint(STORE_DATES_LIVE.comeWatchingAr);
    }
  }

  function openCheckout() {
    setCheckoutOpen(true);
  }

  function confirmService() {
    setServiceOpen(false);
    if (service === 'come') {
      openCheckout();
    } else {
      showNotice('تم حفظ طريقة الخدمة');
    }
  }

  const services = [
    { id: 'delivery' as const, label: STORE_DATES_LIVE.serviceDeliveryAr, icon: Truck, copy: 'إلى بابك داخل النطاق' },
    { id: 'pickup' as const, label: STORE_DATES_LIVE.servicePickupAr, icon: MapPin, copy: 'من موقع الصندوق' },
    ...(mobile
      ? [{ id: 'come' as const, label: STORE_DATES_LIVE.serviceComeAr, icon: Navigation, copy: 'تسوق من العربة عند بابك' }]
      : []),
    ...(state.host.shippingEnabled
      ? [{ id: 'shipping' as const, label: STORE_DATES_LIVE.serviceShippingAr, icon: Package, copy: 'خارج النطاق — عبر شركة المشغّل' }]
      : []),
  ];

  return (
    <main dir="rtl" className="dates-chatly-root min-h-dvh bg-[#eee2ce] pb-32 text-[#2e2418]">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-[#e2d2b4] py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-[#d8c19c] bg-[#fbf6ec] text-[#6f4a26]">
              <StoreShopLogoMark src={state.host.logoSrc} className="size-8" />
              {!state.host.logoSrc ? <DatesTamratnaMark size="sm" /> : null}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#8a6239]">{STORE_DATES_LIVE.shopKickerAr}</p>
              <p className="truncate text-lg font-black tracking-tight">{state.host.shopName}</p>
            </div>
            {mobile ? <StoreMobileVendorMark accent={STORE_DATES_LIVE_ACCENT} /> : null}
            <StoreShopPlacePin
              mapsUrl={state.host.pickupMapsUrl}
              visible={mobile ? neighbor === 'at_pin' : state.host.pickupPlaceVisible}
              accent={STORE_DATES_LIVE_ACCENT}
              labelAr={STORE_DATES_LIVE.pickupPinAriaAr}
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              if (cartLineCount) setCartOpen(true);
              else showNotice('السلة فارغة — اختر من الرف أولاً');
            }}
            className="dates-chatly-btn-ghost relative h-10 shrink-0 rounded-full px-4 text-xs font-black"
          >
            <ShoppingBag size={16} />
            السلة
            {cartLineCount ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-[#8a6239] text-[10px] text-white">
                {cartLineCount}
              </span>
            ) : null}
          </Button>
        </header>

        {state.host.flashAr.trim() ? (
          <p className="mt-4 overflow-hidden rounded-2xl border border-[#d8c19c] bg-[#f3e6cf] px-4 py-2 text-sm font-bold text-[#6f4a26]">
            {state.host.flashAr}
          </p>
        ) : null}

        <StoreShopHoursBanner hours={state.host} accent={STORE_DATES_LIVE_ACCENT} />
        <StoreMobileVendorBanner place={state.host} closed={closed} accent={STORE_DATES_LIVE_ACCENT} />

        {!state.host.acceptingOrders ? (
          <p className="mt-3 rounded-2xl border border-[#e8c4bc] bg-[#fdf0ed] px-4 py-3 text-sm font-bold text-[#9f554c]">
            {STORE_SHOP_HOURS_COPY.pauseVisitorAr}
          </p>
        ) : null}

        <section className="grid gap-8 border-b border-[#e2d2b4] py-9 lg:grid-cols-[1fr_0.86fr] lg:items-center lg:gap-16">
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs font-bold text-[#8a6239]">
              <span className="h-px w-8 bg-[#8a6239]" />
              {STORE_DATES_LIVE.shopKickerAr}
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-[1.08] tracking-[-0.06em] text-[#2e2418] sm:text-5xl">
              {state.host.shopName}
              <br />
              <span className="text-[#8a6239]">{STORE_DATES_LIVE.heroCaptionAr}</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-[#6f6250]">{state.host.blurbAr}</p>
            {state.host.customFields.some((line) => line.trim()) ? (
              <ul className="mt-4 space-y-1 text-sm leading-7 text-[#79674f]">
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
                className="dates-chatly-btn-primary h-12 rounded-full px-6 text-sm font-black shadow-[0_12px_25px_rgba(138,98,57,0.2)]"
              >
                اختَر طريقة الاستلام
                <ChevronDown size={16} />
              </Button>
              {arrived.length ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d8c19c] bg-[#fbf6ec] px-4 py-3 text-xs font-bold text-[#6f6250]">
                  <span className="size-2 rounded-full bg-[#8a6239]" />
                  {STORE_DATES_LIVE.todayTitleAr}: {arrived[0].nameAr}
                  {arrived.length > 1 ? ` +${arrived.length - 1}` : ''}
                </div>
              ) : null}
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-xs font-bold text-[#79674f]">
              {hoursLine ? (
                <span className="inline-flex items-center gap-2">
                  <Clock3 size={15} className="text-[#8a6239]" />
                  {hoursLine}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2">
                <Store size={15} className="text-[#8a6239]" />
                متجر مستقل في الحي
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-8 -top-8 size-24 rounded-full border border-dashed border-[#d8c19c]" />
            <div className="relative overflow-hidden rounded-[2rem] border-[9px] border-[#fbf6ec] bg-[#e9dcc0] shadow-[0_22px_60px_rgba(138,98,57,0.15)]">
              {(() => {
                const heroSrc =
                  sanitizeStoreProductImageSrc(arrived[0]?.photoSrc || featured[0]?.photoSrc) || datesCatalogImage(0);
                const heroWebpSrcSet = storeResponsiveWebpSrcSet(heroSrc);
                if (!heroWebpSrcSet) {
                  return (
                    <img
                      src={heroSrc}
                      alt=""
                      className="aspect-square w-full object-cover"
                      loading="eager"
                      decoding="async"
                    />
                  );
                }
                return (
                  <picture>
                    <source type="image/webp" srcSet={heroWebpSrcSet} sizes={STORE_SHOT_SIZES} />
                    <img
                      src={heroSrc}
                      alt=""
                      className="aspect-square w-full object-cover"
                      sizes={STORE_SHOT_SIZES}
                      loading="eager"
                      decoding="async"
                    />
                  </picture>
                );
              })()}
            </div>
          </div>
        </section>

        {arrived.length ? (
          <section className="border-b border-[#e2d2b4] py-9">
            <p className="text-xs font-bold tracking-[0.16em] text-[#8a6239]">{STORE_DATES_LIVE.todayTitleAr}</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#2e2418]">{STORE_DATES_LIVE.todayTitleAr}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {arrived.map((item, index) => (
                <ProductCard
                  key={item.catalogId}
                  item={item}
                  imageIndex={index}
                  quantity={qty[item.catalogId] || 0}
                  priceLine={priceLine(item)}
                  onChange={(delta) => bump(item.catalogId, delta)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {featured.length ? (
          <section className="border-b border-[#e2d2b4] py-9">
            <p className="text-xs font-bold tracking-[0.16em] text-[#8a6239]">{STORE_DATES_LIVE.featuredTitleAr}</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#2e2418]">{STORE_DATES_LIVE.featuredTitleAr}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((item, index) => (
                <ProductCard
                  key={item.catalogId}
                  item={item}
                  imageIndex={index + 4}
                  quantity={qty[item.catalogId] || 0}
                  priceLine={priceLine(item)}
                  onChange={(delta) => bump(item.catalogId, delta)}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="sticky top-0 z-20 -mx-4 border-b border-[#e2d2b4] bg-[#eee2ce]/95 px-4 py-3 backdrop-blur-sm sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a7c66]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={visible.length >= 8 ? 'ابحث في الأصناف…' : ''}
                className="h-11 border-[#dac8aa] bg-[#fbf6ec] pr-10 text-sm text-[#2e2418] placeholder:text-[#a89a7e]"
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
                    category === item ? 'dates-chatly-btn-primary' : 'dates-chatly-btn-ghost',
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
              <p className="text-xs font-bold tracking-[0.16em] text-[#8a6239]">{STORE_DATES_LIVE.shelfTitleAr}</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#2e2418]">اختَر ما تحتاجه</h2>
              <p className="mt-2 text-sm text-[#79674f]">{STORE_DATES_LIVE.priceEstimateNoteAr}</p>
            </div>
            <span className="hidden items-center gap-2 text-xs font-bold text-[#79674f] sm:flex">
              {filtered.length} أصناف
            </span>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((item, index) => (
              <ProductCard
                key={item.catalogId}
                item={item}
                imageIndex={index}
                quantity={qty[item.catalogId] || 0}
                priceLine={priceLine(item)}
                onChange={(delta) => bump(item.catalogId, delta)}
              />
            ))}
          </div>
          {!filtered.length ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[#e2d2b4] bg-[#fbf6ec] p-10 text-center">
              <p className="mt-3 font-black text-[#2e2418]">ما لقينا هذا الصنف</p>
              <p className="mt-1 text-sm text-[#8a7c66]">جرّب كلمة ثانية أو ارجع لكل الأصناف.</p>
            </div>
          ) : null}
        </section>

        <section className="grid gap-3 border-t border-[#e2d2b4] py-8 sm:grid-cols-3">
          <Feature icon={Truck} title={STORE_DATES_LIVE.serviceDeliveryAr} copy="توصيل واضح — الدفع عند الاستلام." />
          <Feature icon={MapPin} title={STORE_DATES_LIVE.servicePickupAr} copy="موقع الصندوق يظهر قبل التأكيد." />
          {mobile ? (
            <Feature icon={Navigation} title={STORE_DATES_LIVE.serviceComeAr} copy="تنبيه عند اقتراب العربة من موقعك." />
          ) : (
            <Feature icon={Store} title="متجر مستقل" copy="طلبك يذهب مباشرة إلى هذا الصندوق." />
          )}
        </section>

        <section className="rounded-2xl border border-[#dac8aa] bg-[#fbf6ec] p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-[#8a6239]">متجر مستقل</p>
              <h3 className="mt-1 text-lg font-black text-[#2e2418]">أنت تشتري من بائع واحد في حيك</h3>
              <p className="mt-1 text-sm text-[#79674f]">ليست سوقاً مشتركة؛ طلبك يذهب مباشرة إلى {state.host.shopName}.</p>
            </div>
            <StoreDirectPayPublicMount product="store_dates_live" token={token} accent={STORE_DATES_LIVE_ACCENT} />
          </div>
        </section>

        <div className="mt-6">
          <StoreDatesBuyerChat state={state} onChange={onChange} theme="light" />
        </div>

        <footer className="flex flex-col gap-3 border-t border-[#e2d2b4] py-7 text-sm text-[#79674f] sm:flex-row sm:items-center sm:justify-between">
          <p>تمرتنا1 — من المحل إلى جوال الحي.</p>
          <div className="flex flex-wrap gap-5 font-bold">
            <span>الدفع عند الاستلام أو التحويل المباشر</span>
          </div>
        </footer>
      </div>

      {canCheckout ? (
        <div className="fixed bottom-4 right-4 left-4 z-30 mx-auto flex max-w-[800px] items-center justify-between gap-4 rounded-2xl bg-[#2e2418] px-4 py-3 text-white shadow-[0_15px_35px_rgba(46,36,24,0.28)] sm:right-8 sm:left-8 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#8a6239]">
              <DatesTamratnaMark size="sm" inverse />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">
                {come && !cartItemCount
                  ? STORE_DATES_LIVE.serviceComeAr
                  : `${cartItemCount} ${cartItemCount === 1 ? 'صنف' : 'أصناف'} في السلة`}
              </p>
              <p className="text-xs text-[#e9dcc0]">
                {total} ر.س · {serviceLabel(service)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={openCheckout}
            className="h-10 shrink-0 rounded-xl border-0 bg-[#f3e6cf] px-4 text-xs font-black text-[#472e12] shadow-none hover:bg-white"
          >
            إتمام الطلب
            <ArrowLeft size={15} />
          </Button>
        </div>
      ) : null}

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="dates-chatly-root max-h-[90vh] max-w-lg overflow-y-auto border-[#dac8aa] bg-[#fbf6ec] p-0 text-right" dir="rtl">
          <div className="p-5 sm:p-6">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <DialogTitle className="text-2xl font-black text-[#2e2418]">مراجعة السلة</DialogTitle>
                  <DialogDescription className="mt-2 text-sm leading-6 text-[#79674f]">
                    {STORE_DATES_LIVE.priceEstimateNoteAr}
                  </DialogDescription>
                </div>
                <span className="rounded-full bg-[#f3e6cf] px-3 py-1 text-xs font-black text-[#8a6239]">
                  {cartItemCount} أصناف
                </span>
              </div>
            </DialogHeader>
            <div className="mt-6 space-y-3">
              {lines.map((line) => {
                const item = visible.find((row) => row.catalogId === line.catalogId);
                if (!item) return null;
                return (
                  <div key={line.catalogId} className="flex items-center gap-3 rounded-xl border border-[#e2d2b4] bg-white p-3">
                    <ProductVisual item={item} imageIndex={0} small />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-[#2e2418]">{line.nameAr}</p>
                      <p className="mt-1 text-xs text-[#8a7c66]">{priceLine(item)}</p>
                    </div>
                    <QtyControls value={line.qty} onMinus={() => bump(line.catalogId, -1)} onPlus={() => bump(line.catalogId, 1)} />
                  </div>
                );
              })}
              {!lines.length ? (
                <p className="rounded-xl border border-dashed border-[#e2d2b4] p-6 text-center text-sm text-[#8a7c66]">السلة فارغة.</p>
              ) : null}
            </div>
            <div className="mt-6 rounded-xl bg-[#f3e6cf] p-4">
              <div className="flex items-center justify-between text-lg font-black text-[#2e2418]">
                <span>الإجمالي التقديري</span>
                <span>{total} ر.س</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#79674f]">{STORE_DATES_LIVE.priceEstimateNoteAr}</p>
            </div>
            <Button
              type="button"
              onClick={() => {
                setCartOpen(false);
                openCheckout();
              }}
              className="dates-chatly-btn-primary mt-5 h-12 w-full rounded-xl text-sm font-black"
            >
              أكمل الطلب
              <ArrowLeft size={16} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={serviceOpen} onOpenChange={setServiceOpen}>
        <DialogContent className="dates-chatly-root max-w-xl border-[#dac8aa] bg-[#fbf6ec] text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#2e2418]">كيف توصلك مشترياتك؟</DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-[#79674f]">
              الخدمة تظهر حسب نوع البائع وموقعه الحالي.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {services.map(({ id, label, icon: Icon, copy }) => (
              <Button
                key={id}
                type="button"
                onClick={() => setService(id)}
                className={cn(
                  'h-auto min-w-0 flex-col items-start gap-3 rounded-xl border p-4 text-right shadow-none',
                  service === id
                    ? 'border-[#8a6239] bg-[#f3e6cf]'
                    : 'border-[#e2d2b4] bg-white hover:bg-[#faf1de]',
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#fbf6ec] text-[#8a6239]">
                  <Icon size={18} />
                </span>
                <span className="text-sm font-black text-[#2e2418]">{label}</span>
                <span className="text-xs font-normal text-[#8a7c66]">{copy}</span>
              </Button>
            ))}
          </div>
          {service === 'come' ? (
            <p className="mt-4 text-sm leading-7 text-[#6f6250]">{STORE_DATES_LIVE.serviceComeLeadAr}</p>
          ) : null}
          {service === 'shipping' ? (
            <StoreShopShippingBuyerCard
              profile={state.host}
              leadAr={STORE_DATES_LIVE.serviceShippingLeadAr}
            />
          ) : null}
          {service === 'pickup' && state.host.pickupPlaceVisible && state.host.pickupMapsUrl ? (
            <div className="mt-5 rounded-xl border border-[#dac8aa] bg-[#f3e6cf] p-4">
              <div className="flex items-center gap-2 text-sm font-black text-[#6f4a26]">
                <MapPin size={16} />
                موقع الاستلام
              </div>
              <a
                href={state.host.pickupMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-sm leading-6 text-[#8a6239] underline"
              >
                {STORE_DATES_LIVE.pickupPlaceOpenAr}
              </a>
            </div>
          ) : null}
          <Button
            type="button"
            onClick={confirmService}
            className="dates-chatly-btn-primary mt-6 h-11 w-full rounded-xl text-sm font-black"
          >
            تأكيد طريقة الخدمة
            <Check size={16} />
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="dates-chatly-root max-h-[90vh] max-w-lg overflow-y-auto border-[#dac8aa] bg-[#fbf6ec] text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#2e2418]">
              {preorder ? STORE_SHOP_HOURS_COPY.preorderTitleAr : STORE_DATES_LIVE.checkoutTitleAr}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-[#79674f]">
              الإجمالي الآن: {total} ر.س — {STORE_DATES_LIVE.priceEstimateNoteAr}
            </DialogDescription>
          </DialogHeader>
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <label className="block text-xs font-bold text-[#6f6250]">
              {STORE_DATES_LIVE.buyerNameLabelAr}
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 h-11 border-[#dac8aa] bg-white"
                maxLength={40}
              />
            </label>
            <label className="block text-xs font-bold text-[#6f6250]">
              {STORE_DATES_LIVE.buyerPhoneLabelAr}
              <Input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 h-11 border-[#dac8aa] bg-white"
                inputMode="tel"
                maxLength={20}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {services.map(({ id, label }) => (
                <Button
                  key={id}
                  type="button"
                  onClick={() => setService(id)}
                  className={cn(
                    'h-9 rounded-full px-3 text-xs font-bold shadow-none',
                    service === id ? 'dates-chatly-btn-primary' : 'dates-chatly-btn-ghost',
                  )}
                >
                  {label}
                </Button>
              ))}
            </div>
            {service === 'come' ? (
              <p className="text-sm leading-7 text-[#6f6250]">{STORE_DATES_LIVE.serviceComeLeadAr}</p>
            ) : null}
            {service === 'shipping' ? (
              <StoreShopShippingBuyerCard
                profile={state.host}
                leadAr={STORE_DATES_LIVE.serviceShippingLeadAr}
              />
            ) : null}
            {service === 'delivery' || service === 'come' ? (
              <>
                <label className="block text-xs font-bold text-[#6f6250]">
                  {mobile ? STORE_MOBILE_VENDOR.placeHintAr : STORE_DATES_LIVE.buyerPlaceLabelAr}
                  <Input
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="mt-2 h-11 border-[#dac8aa] bg-white"
                    maxLength={240}
                    required={service === 'come'}
                  />
                </label>
                <StoreBuyerLocateButtons
                  value={place}
                  accent={STORE_DATES_LIVE_ACCENT}
                  copy={STORE_DATES_LIVE}
                  onLocated={setPlace}
                  onCoords={(lat, lng) => {
                    setBuyerLat(lat);
                    setBuyerLng(lng);
                  }}
                />
              </>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => setPay('cash')}
                className={cn(
                  'h-9 rounded-full px-3 text-xs font-bold shadow-none',
                  pay === 'cash' ? 'dates-chatly-btn-primary' : 'dates-chatly-btn-ghost',
                )}
              >
                {STORE_DATES_LIVE.payCashAr}
              </Button>
              <Button
                type="button"
                onClick={() => setPay('card')}
                className={cn(
                  'h-9 rounded-full px-3 text-xs font-bold shadow-none',
                  pay === 'card' ? 'dates-chatly-btn-primary' : 'dates-chatly-btn-ghost',
                )}
              >
                {STORE_DATES_LIVE.payCardAr}
              </Button>
            </div>
            <div>
              <StoreDirectPayPublicMount product="store_dates_live" token={token} accent={STORE_DATES_LIVE_ACCENT} />
            </div>
            <label className="flex items-start gap-2 text-sm leading-7 text-[#79674f]">
              <input type="checkbox" checked={saveBuyer} onChange={(e) => setSaveBuyer(e.target.checked)} className="mt-1" />
              <span>{STORE_DATES_LIVE.saveBuyerAr}</span>
            </label>
            <Button type="submit" className="dates-chatly-btn-primary h-12 w-full rounded-xl text-sm font-black">
              {service === 'come' ? STORE_DATES_LIVE.comeSubmitAr : STORE_DATES_LIVE.submitOrderAr}
            </Button>
            {comeHint ? <p className="text-sm font-bold text-[#8a6239]">{comeHint}</p> : null}
            {sent ? <p className="text-sm font-bold text-[#8a6239]">{sent}</p> : null}
            {orderPlaced && state.orders[0]?.id ? (
              <StoreDirectPayGuest
                product="store_dates_live"
                token={token}
                requestRef={state.orders[0].id}
                accent={STORE_DATES_LIVE_ACCENT}
                amountSar={String(state.orders[0].total || '')}
              />
            ) : null}
          </form>
        </DialogContent>
      </Dialog>

      {notice ? (
        <div className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-full bg-[#2e2418] px-5 py-3 text-sm font-bold text-white shadow-xl sm:right-8">
          <Check size={16} className="text-[#f3e6cf]" />
          {notice}
        </div>
      ) : null}
    </main>
  );
}

function ProductCard({
  item,
  imageIndex,
  quantity,
  priceLine,
  onChange,
}: {
  item: ShelfRow;
  imageIndex: number;
  quantity: number;
  priceLine: string;
  onChange: (delta: number) => void;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#e2d2b4] bg-[#fbf6ec] shadow-[0_10px_25px_rgba(46,36,24,0.05)]">
      <ProductVisual item={item} imageIndex={imageIndex} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-[#2e2418]">{item.nameAr}</h3>
            {item.category ? <p className="mt-1 text-xs font-bold text-[#8a7c66]">{item.category}</p> : null}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span
            className={cn(
              'text-[10px] font-black',
              item.arrivedToday
                ? 'text-[#8a6239]'
                : item.featured
                  ? 'text-[#8a6239]'
                  : 'text-[#a89a7e]',
            )}
          >
            {item.arrivedToday ? STORE_DATES_LIVE.arrivedOnAr : item.featured ? STORE_DATES_LIVE.featuredTitleAr : STORE_DATES_LIVE.stockOnAr}
          </span>
          {quantity ? (
            <QtyControls value={quantity} onMinus={() => onChange(-1)} onPlus={() => onChange(1)} />
          ) : (
            <Button
              type="button"
              onClick={() => onChange(1)}
              className="h-9 rounded-lg border-0 bg-[#f3e6cf] px-3 text-xs font-black text-[#6f4a26] shadow-none hover:bg-[#e9dcc0]"
            >
              إضافة سريعة
              <Plus size={14} />
            </Button>
          )}
        </div>
        <p className="mt-2 text-[10px] text-[#a89a7e]">{priceLine}</p>
      </div>
    </article>
  );
}

function ProductVisual({
  item,
  imageIndex,
  small = false,
}: {
  item: ShelfRow;
  imageIndex: number;
  small?: boolean;
}) {
  const src = sanitizeStoreProductImageSrc(item.photoSrc) || datesCatalogImage(imageIndex);
  const webpSrcSet = storeResponsiveWebpSrcSet(src);
  const visualSizes = small ? '64px' : DATES_GRID_IMAGE_SIZES;
  const imgClassName = cn(
    'object-cover',
    small ? 'size-16' : 'aspect-square w-full transition-transform duration-500 group-hover:scale-105',
  );
  return (
    <div className={cn('relative overflow-hidden bg-[#e9dcc0]', small ? 'size-16 shrink-0 rounded-lg' : '')}>
      {webpSrcSet ? (
        <picture>
          <source type="image/webp" srcSet={webpSrcSet} sizes={visualSizes} />
          <img
            src={src}
            alt={item.nameAr}
            className={imgClassName}
            sizes={visualSizes}
            loading="lazy"
            decoding="async"
          />
        </picture>
      ) : (
        <img src={src} alt={item.nameAr} className={imgClassName} loading="lazy" decoding="async" />
      )}
      {!small && item.arrivedToday ? (
        <span className="absolute right-3 top-3 rounded-full bg-[#fbf6ec]/90 px-2 py-1 text-[10px] font-black text-[#8a6239]">
          {STORE_DATES_LIVE.arrivedOnAr}
        </span>
      ) : !small && item.featured ? (
        <span className="absolute right-3 top-3 rounded-full bg-[#fbf6ec]/90 px-2 py-1 text-[10px] font-black text-[#8a6239]">
          {STORE_DATES_LIVE.featuredTitleAr}
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
    <div className="flex items-center gap-2 rounded-lg bg-[#f3e6cf] px-2 py-1">
      <Button type="button" onClick={onMinus} className="size-7 rounded-md bg-transparent p-0 text-[#6f4a26] shadow-none hover:bg-white">
        <Minus size={14} />
      </Button>
      <span className="w-4 text-center text-sm font-black">{value}</span>
      <Button type="button" onClick={onPlus} className="size-7 rounded-md bg-transparent p-0 text-[#6f4a26] shadow-none hover:bg-white">
        <Plus size={14} />
      </Button>
    </div>
  );
}

function Feature({ icon: Icon, title, copy }: { icon: typeof Truck; title: string; copy: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-[#e2d2b4] bg-[#fbf6ec] p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f3e6cf] text-[#8a6239]">
        <Icon size={17} />
      </span>
      <div>
        <p className="text-sm font-black text-[#2e2418]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#8a7c66]">{copy}</p>
      </div>
    </div>
  );
}
