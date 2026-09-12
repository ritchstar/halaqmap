/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * واجهة زبون خضارنا1 — هيكل Chatly مع منطق halaqmap الحقيقي.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Apple,
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  LocateFixed,
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
import { StoreProduceBuyerChat } from '@/components/store/StoreProduceChat';
import { StoreMobileVendorBanner } from '@/components/store/StoreMobileVendorBanner';
import { StoreMobileVendorMark } from '@/components/store/StoreMobileVendorMark';
import { StoreShopHoursBanner } from '@/components/store/StoreShopHoursBanner';
import { StoreBuyerLocateButtons } from '@/components/store/StoreBuyerLocateButtons';
import { StoreShopLogoMark } from '@/components/store/StoreShopLogoMark';
import { StoreShopPlacePin } from '@/components/store/StoreShopPlacePin';
import { StoreDirectPayGuest, StoreDirectPayPublicMount } from '@/components/store/StoreDirectPayGuest';
import { ProduceKhudaranaMark } from '@/components/store/produce/ProduceKhudaranaMark';
import {
  STORE_PRODUCE_LIVE,
  STORE_PRODUCE_LIVE_ACCENT,
  STORE_PRODUCE_LIVE_LAB_TOKEN,
  produceCatalogImage,
} from '@/config/storeProduceLive';
import { STORE_PRODUCE_UNIT_AR } from '@/config/storeProduceCatalog';
import { STORE_MOBILE_VENDOR } from '@/config/storeMobileVendor';
import { STORE_SHOP_HOURS_COPY } from '@/config/storeShopHours';
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
import { neighborVendorState } from '@/lib/storeMobileVendor';
import { isShopClosedNow, shopHoursLinesAr } from '@/lib/storeShopHours';
import { liveActivityCoverSrc } from '@/lib/storeLiveActivityShelf';
import {
  clearNeighborCartQty,
  readNeighborCartQty,
  writeNeighborCartQty,
} from '@/lib/neighborCartStorage';
import { NeighborShopEvents } from '@/lib/neighborShopAnalytics';
import { cn } from '@/lib/utils';

type ShelfRow = ProduceLabState['shelf'][number];

export function ProduceChatlyStorefront({
  state,
  onChange,
  token,
}: {
  state: ProduceLabState;
  onChange: (next: ProduceLabState) => void;
  token: string;
}) {
  const isLab = token === STORE_PRODUCE_LIVE_LAB_TOKEN;
  const saved = useMemo(() => (isLab ? null : readSavedProduceBuyer()), [isLab]);
  const [qty, setQty] = useState<Record<string, number>>(() => readNeighborCartQty('produce', token));
  const [category, setCategory] = useState('الكل');
  const [search, setSearch] = useState('');
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
  const [cartOpen, setCartOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const mobile = state.host.vendorMode === 'mobile';
  const closed = isShopClosedNow(state.host);
  const neighbor = neighborVendorState({ ...state.host, closed });
  const preorder = closed || (mobile && neighbor !== 'at_pin');
  const visible = state.shelf.filter((item) => item.inStock);
  const arrivedCount = visible.filter((item) => item.arrivedToday).length;

  const lines: ProduceOrderLine[] = visible
    .map((item) => ({
      catalogId: item.catalogId,
      nameAr: item.nameAr,
      qty: qty[item.catalogId] || 0,
      price: item.price,
    }))
    .filter((line) => line.qty > 0);

  const total = produceCartTotal(lines);
  const cartLineCount = lines.reduce((sum, line) => sum + line.qty, 0);
  const cartItemCount = lines.length;

  const categories = useMemo(() => {
    const cats = new Set<string>();
    visible.forEach((item) => {
      if (item.category?.trim()) cats.add(item.category.trim());
    });
    return ['الكل', ...(arrivedCount ? ['وصل اليوم'] : []), ...Array.from(cats).sort()];
  }, [visible, arrivedCount]);

  const filtered = useMemo(() => {
    const q = search.trim();
    return visible.filter((item) => {
      const matchesCategory =
        category === 'الكل' ||
        (category === 'وصل اليوم' ? item.arrivedToday : item.category === category);
      const matchesSearch = !q || item.nameAr.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [visible, category, search]);

  const heroSrc = liveActivityCoverSrc(state.shelf) || produceCatalogImage(0);
  const hoursLine = shopHoursLinesAr(state.host).join(' · ');

  useEffect(() => {
    writeNeighborCartQty('produce', token, qty);
  }, [token, qty]);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    NeighborShopEvents.viewStore('produce', token, isLab);
  }, [token, isLab]);

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

  function bump(id: string, delta: number) {
    setQty((current) => {
      const prev = current[id] || 0;
      const next = Math.max(0, prev + delta);
      if (delta > 0 && next > prev) NeighborShopEvents.addItem('produce', token, isLab, id);
      if (delta < 0 && next < prev) NeighborShopEvents.removeItem('produce', token, isLab, id);
      return { ...current, [id]: next };
    });
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2200);
  }

  function priceLine(item: ShelfRow) {
    return `${item.price} ر.س / ${STORE_PRODUCE_UNIT_AR[item.unit]}`;
  }

  function serviceLabel(s: ProduceService) {
    if (s === 'pickup') return STORE_PRODUCE_LIVE.servicePickupAr;
    if (s === 'come') return STORE_PRODUCE_LIVE.serviceComeAr;
    return STORE_PRODUCE_LIVE.serviceDeliveryAr;
  }

  async function submit() {
    const orderName = isLab ? STORE_PRODUCE_LIVE.labDemoNameAr : name.trim().slice(0, 40);
    const orderPhone = isLab ? STORE_PRODUCE_LIVE.labDemoPhoneAr : phone.trim().slice(0, 20);
    const orderPlace = isLab ? STORE_PRODUCE_LIVE.labDemoPlaceAr : place.trim().slice(0, 240);
    if (!isLab && orderName.length < 2) return;
    if (!isLab && orderPhone.length < 9) return;
    const come = mobile && service === 'come';
    if (!come && !lines.length) return;
    NeighborShopEvents.submitOrder('produce', token, isLab, cartLineCount);
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
    clearNeighborCartQty('produce', token);
    NeighborShopEvents.orderSubmitted('produce', token, isLab, cartLineCount);
    setSent(true);
    setCartOpen(false);
    setCheckoutOpen(false);
    showNotice(come ? STORE_PRODUCE_LIVE.comeWatchingAr : STORE_PRODUCE_LIVE.orderSentAr);
    if (come) {
      setWatchingCome(true);
      setComeHint(STORE_PRODUCE_LIVE.comeWatchingAr);
    }
  }

  function openCheckout() {
    NeighborShopEvents.viewCart('produce', token, isLab, cartItemCount);
    NeighborShopEvents.beginCheckout('produce', token, isLab);
    setCheckoutOpen(true);
  }

  const services = [
    { id: 'delivery' as const, label: STORE_PRODUCE_LIVE.serviceDeliveryAr, icon: Truck, copy: 'إلى بابك' },
    { id: 'pickup' as const, label: STORE_PRODUCE_LIVE.servicePickupAr, icon: MapPin, copy: 'من نقطة البائع' },
    ...(mobile
      ? [{ id: 'come' as const, label: STORE_PRODUCE_LIVE.serviceComeAr, icon: LocateFixed, copy: 'لبائع المتجول' }]
      : []),
  ];

  return (
    <main dir="rtl" className="produce-chatly-root min-h-dvh bg-[#f4f1e8] pb-32 text-[#22332b]">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-[#dfe4d6] py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-[#b8c9a9] bg-[#fffdf5] text-[#426d42]">
              <StoreShopLogoMark src={state.host.logoSrc} className="size-8" />
              {!state.host.logoSrc ? <ProduceKhudaranaMark size="sm" /> : null}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#5b7d48]">{STORE_PRODUCE_LIVE.shopKickerAr}</p>
              <p className="truncate text-lg font-black tracking-tight">{state.host.shopName}</p>
            </div>
            {mobile ? <StoreMobileVendorMark accent={STORE_PRODUCE_LIVE_ACCENT} /> : null}
            <StoreShopPlacePin
              mapsUrl={state.host.pickupMapsUrl}
              visible={mobile ? neighbor === 'at_pin' : state.host.pickupPlaceVisible}
              accent={STORE_PRODUCE_LIVE_ACCENT}
              labelAr={STORE_PRODUCE_LIVE.pickupPinAriaAr}
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              if (cartLineCount) setCartOpen(true);
              else showNotice('السلة فارغة — اختر من الرف أولاً');
            }}
            className="produce-chatly-btn-ghost relative h-10 shrink-0 rounded-full px-4 text-xs font-black"
          >
            <ShoppingBag size={16} />
            السلة
            {cartLineCount ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-[#3f7440] text-[10px] text-white">
                {cartLineCount}
              </span>
            ) : null}
          </Button>
        </header>

        {state.host.flashAr.trim() ? (
          <p className="mt-4 overflow-hidden rounded-2xl border border-[#cad7bd] bg-[#eaf1e4] px-4 py-2 text-sm font-bold text-[#3f6d3c]">
            {state.host.flashAr}
          </p>
        ) : null}

        <StoreShopHoursBanner hours={state.host} accent={STORE_PRODUCE_LIVE_ACCENT} />
        <StoreMobileVendorBanner place={state.host} closed={closed} accent={STORE_PRODUCE_LIVE_ACCENT} />

        {!state.host.acceptingOrders ? (
          <p className="mt-3 rounded-2xl border border-[#e8c4bc] bg-[#fdf0ed] px-4 py-3 text-sm font-bold text-[#9f554c]">
            {STORE_SHOP_HOURS_COPY.pauseVisitorAr}
          </p>
        ) : null}

        <section className="grid gap-8 border-b border-[#dfe4d6] py-9 lg:grid-cols-[1fr_0.86fr] lg:items-center lg:gap-16">
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs font-bold text-[#5b7d48]">
              <span className="h-px w-8 bg-[#9ab17e]" />
              {STORE_PRODUCE_LIVE.shopKickerAr}
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-[1.08] tracking-[-0.06em] text-[#20352b] sm:text-5xl">
              {state.host.shopName}
              <br />
              <span className="text-[#4c813d]">{STORE_PRODUCE_LIVE.shopHeroTaglineAr}</span>
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
                className="produce-chatly-btn-primary h-12 rounded-full px-6 text-sm font-black shadow-[0_12px_25px_rgba(63,116,64,0.2)]"
              >
                اختَر طريقة الاستلام
                <ChevronDown size={16} />
              </Button>
              {arrivedCount ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-[#cad7bd] bg-[#fffdf5] px-4 py-3 text-xs font-bold text-[#637263]">
                  <span className="size-2 rounded-full bg-[#3d9a6c]" />
                  {arrivedCount} أصناف وصلت اليوم
                </div>
              ) : null}
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-xs font-bold text-[#758374]">
              {hoursLine ? (
                <span className="inline-flex items-center gap-2">
                  <Clock3 size={15} className="text-[#5b7d48]" />
                  {hoursLine}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2">
                <Store size={15} className="text-[#5b7d48]" />
                متجر مستقل في الحي
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-8 -top-8 size-24 rounded-full border border-dashed border-[#b6c8aa]" />
            <div className="relative overflow-hidden rounded-[2rem] border-[9px] border-[#fffdf5] bg-[#dfe8d8] shadow-[0_22px_60px_rgba(44,72,42,0.15)]">
              <img
                src={heroSrc}
                alt=""
                className="aspect-square w-full object-cover"
                loading="eager"
                decoding="async"
              />
              {arrivedCount ? (
                <div className="absolute bottom-4 right-4 left-4 rounded-2xl border border-white/20 bg-[#20352b]/88 px-4 py-3 text-white backdrop-blur-sm">
                  <p className="text-[10px] font-bold text-[#cbe4b8]">محصول اليوم</p>
                  <p className="mt-1 text-sm font-black">{STORE_PRODUCE_LIVE.todayTitleAr}</p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="sticky top-0 z-20 -mx-4 border-b border-[#dfe4d6] bg-[#f4f1e8]/95 px-4 py-3 backdrop-blur-sm sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#788877]" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  if (event.target.value.trim()) {
                    NeighborShopEvents.searchProducts('produce', token, isLab, event.target.value.trim().length);
                  }
                }}
                placeholder={visible.length >= 8 ? 'ابحث في الرف…' : ''}
                className="h-11 border-[#d4dfcc] bg-[#fffdf5] pr-10 text-sm text-[#22332b] placeholder:text-[#a0aca0]"
              />
            </div>
            <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
              {categories.map((item) => (
                <Button
                  key={item}
                  type="button"
                  onClick={() => {
                    setCategory(item);
                    if (item !== 'الكل') NeighborShopEvents.applyCategory('produce', token, isLab, item);
                  }}
                  className={cn(
                    'h-10 shrink-0 rounded-full px-4 text-xs font-bold shadow-none',
                    category === item
                      ? 'produce-chatly-btn-primary'
                      : 'produce-chatly-btn-ghost',
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
              <p className="text-xs font-bold tracking-[0.16em] text-[#5b7d48]">{STORE_PRODUCE_LIVE.shelfTitleAr}</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#20352b]">اختَر ما تحتاجه</h2>
              <p className="mt-2 text-sm text-[#758374]">{STORE_PRODUCE_LIVE.priceEstimateNoteAr}</p>
            </div>
            <span className="hidden items-center gap-2 text-xs font-bold text-[#758374] sm:flex">
              <Apple size={16} className="text-[#5b7d48]" />
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
            <div className="mt-6 rounded-2xl border border-dashed border-[#cbd8c2] bg-[#fffdf5] p-10 text-center">
              <Apple size={24} className="mx-auto text-[#77966a]" />
              <p className="mt-3 font-black text-[#29402e]">ما لقينا هذا الصنف</p>
              <p className="mt-1 text-sm text-[#788877]">جرّب كلمة ثانية أو ارجع لكل الرف.</p>
            </div>
          ) : null}
        </section>

        <section className="grid gap-3 border-t border-[#dfe4d6] py-8 sm:grid-cols-3">
          <Feature icon={Truck} title={STORE_PRODUCE_LIVE.serviceDeliveryAr} copy="توصيل واضح — الدفع عند الاستلام." />
          <Feature icon={MapPin} title={STORE_PRODUCE_LIVE.servicePickupAr} copy="نقطة البائع تظهر قبل التأكيد." />
          {mobile ? (
            <Feature icon={Compass} title={STORE_PRODUCE_LIVE.serviceComeAr} copy="تنبيه عند اقتراب البائع المتجول." />
          ) : (
            <Feature icon={Store} title="متجر مستقل" copy="طلبك يذهب مباشرة إلى هذا المحل." />
          )}
        </section>

        <section className="rounded-2xl border border-[#d4dfcc] bg-[#fffdf5] p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-[#5b7d48]">متجر مستقل</p>
              <h3 className="mt-1 text-lg font-black text-[#20352b]">أنت تشتري من بائع واحد في حيك</h3>
              <p className="mt-1 text-sm text-[#758374]">ليست سوقاً مشتركة؛ طلبك يذهب مباشرة إلى {state.host.shopName}.</p>
            </div>
            <StoreDirectPayPublicMount product="store_produce_live" token={token} accent={STORE_PRODUCE_LIVE_ACCENT} />
          </div>
        </section>

        <div className="mt-6">
          <StoreProduceBuyerChat state={state} onChange={onChange} />
        </div>

        <footer className="flex flex-col gap-3 border-t border-[#dfe4d6] py-7 text-sm text-[#758374] sm:flex-row sm:items-center sm:justify-between">
          <p>خضارنا1 — من سوق الحي إلى بيتك.</p>
          <div className="flex flex-wrap gap-5 font-bold">
            <span>الدفع عند الاستلام أو التحويل المباشر</span>
            <span>لا تحصيل سلة عبر ميسر</span>
          </div>
        </footer>
      </div>

      {cartLineCount > 0 ? (
        <div className="fixed bottom-4 right-4 left-4 z-30 mx-auto flex max-w-[800px] items-center justify-between gap-4 rounded-2xl bg-[#20352b] px-4 py-3 text-white shadow-[0_15px_35px_rgba(32,53,43,0.28)] sm:right-8 sm:left-8 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#5f994e]">
              <ProduceKhudaranaMark size="sm" inverse />
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
            className="h-10 shrink-0 rounded-xl border-0 bg-[#d7e9c9] px-4 text-xs font-black text-[#27472c] shadow-none hover:bg-white"
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
                  <DialogTitle className="text-2xl font-black text-[#20352b]">مراجعة السلة</DialogTitle>
                  <DialogDescription className="mt-2 text-sm leading-6 text-[#758374]">
                    {STORE_PRODUCE_LIVE.priceEstimateNoteAr}
                  </DialogDescription>
                </div>
                <span className="rounded-full bg-[#eaf1e4] px-3 py-1 text-xs font-black text-[#477141]">
                  {cartItemCount} أصناف
                </span>
              </div>
            </DialogHeader>
            <div className="mt-6 space-y-3">
              {lines.map((line) => {
                const item = visible.find((row) => row.catalogId === line.catalogId);
                if (!item) return null;
                return (
                  <div key={line.catalogId} className="flex items-center gap-3 rounded-xl border border-[#dfe7d9] bg-white p-3">
                    <ProductVisual item={item} imageIndex={0} small />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-[#20352b]">{line.nameAr}</p>
                      <p className="mt-1 text-xs text-[#7a8979]">{priceLine(item)}</p>
                    </div>
                    <QtyControls value={line.qty} onMinus={() => bump(line.catalogId, -1)} onPlus={() => bump(line.catalogId, 1)} />
                  </div>
                );
              })}
            </div>
            <div className="mt-6 rounded-xl bg-[#edf4e8] p-4">
              <div className="flex items-center justify-between text-lg font-black text-[#20352b]">
                <span>الإجمالي التقديري</span>
                <span>{total} ر.س</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#758374]">{STORE_PRODUCE_LIVE.priceEstimateNoteAr}</p>
            </div>
            <Button
              type="button"
              onClick={() => {
                setCartOpen(false);
                openCheckout();
              }}
              className="produce-chatly-btn-primary mt-5 h-12 w-full rounded-xl text-sm font-black"
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
            <DialogTitle className="text-2xl font-black text-[#20352b]">كيف توصلك مشترياتك؟</DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-[#758374]">
              الخدمة تظهر حسب نوع البائع وموقعه الحالي.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {services.map(({ id, label, icon: Icon, copy }) => (
              <Button
                key={id}
                type="button"
                onClick={() => setService(id)}
                className={cn(
                  'h-auto min-w-0 flex-col items-start gap-3 rounded-xl border p-4 text-right shadow-none',
                  service === id
                    ? 'border-[#5d914e] bg-[#eaf1e4]'
                    : 'border-[#dfe7d9] bg-white hover:bg-[#f0f5ec]',
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#fffdf5] text-[#4a7b46]">
                  <Icon size={18} />
                </span>
                <span className="text-sm font-black text-[#20352b]">{label}</span>
                <span className="text-xs font-normal text-[#7a8979]">{copy}</span>
              </Button>
            ))}
          </div>
          {service === 'pickup' && state.host.pickupPlaceVisible && state.host.pickupPlaceAr ? (
            <div className="mt-5 rounded-xl border border-[#d4dfcc] bg-[#eef4e9] p-4">
              <div className="flex items-center gap-2 text-sm font-black text-[#3f6d3c]">
                <MapPin size={16} />
                موقع الاستلام
              </div>
              <p className="mt-2 text-sm leading-6 text-[#586a5c]">{state.host.pickupPlaceAr}</p>
            </div>
          ) : null}
          {service === 'come' ? (
            <div className="mt-5 rounded-xl bg-[#20352b] p-4 text-white">
              <div className="flex items-center gap-2 text-sm font-black text-[#d7e9c9]">
                <LocateFixed size={16} />
                {STORE_PRODUCE_LIVE.serviceComeLeadAr}
              </div>
            </div>
          ) : null}
          <Button
            type="button"
            onClick={() => {
              setServiceOpen(false);
              showNotice('تم حفظ طريقة الخدمة');
            }}
            className="produce-chatly-btn-primary mt-6 h-11 w-full rounded-xl text-sm font-black"
          >
            تأكيد طريقة الخدمة
            <Check size={16} />
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-[#d4dfcc] bg-[#fffdf5] text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#20352b]">
              {preorder ? STORE_SHOP_HOURS_COPY.preorderTitleAr : STORE_PRODUCE_LIVE.checkoutTitleAr}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-[#758374]">
              الإجمالي التقديري: {total} ر.س — {STORE_PRODUCE_LIVE.priceEstimateNoteAr}
            </DialogDescription>
          </DialogHeader>
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <label className="block text-xs font-bold text-[#647463]">
              {STORE_PRODUCE_LIVE.buyerNameLabelAr}
              <Input
                required={!isLab}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 h-11 border-[#d4dfcc] bg-white"
                maxLength={40}
                placeholder={isLab ? STORE_PRODUCE_LIVE.labDemoNameAr : undefined}
              />
            </label>
            <label className="block text-xs font-bold text-[#647463]">
              {STORE_PRODUCE_LIVE.buyerPhoneLabelAr}
              <Input
                required={!isLab}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 h-11 border-[#d4dfcc] bg-white"
                inputMode="tel"
                maxLength={20}
                placeholder={isLab ? STORE_PRODUCE_LIVE.labDemoPhoneAr : undefined}
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
                    service === id ? 'produce-chatly-btn-primary' : 'produce-chatly-btn-ghost',
                  )}
                >
                  {label}
                </Button>
              ))}
            </div>
            {service === 'delivery' || service === 'come' ? (
              <>
                <label className="block text-xs font-bold text-[#647463]">
                  {mobile ? STORE_MOBILE_VENDOR.placeHintAr : STORE_PRODUCE_LIVE.buyerPlaceLabelAr}
                  <Input
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="mt-2 h-11 border-[#d4dfcc] bg-white"
                    maxLength={240}
                    required={service === 'come'}
                    placeholder={isLab ? STORE_PRODUCE_LIVE.labDemoPlaceAr : undefined}
                  />
                </label>
                <StoreBuyerLocateButtons
                  value={place}
                  accent={STORE_PRODUCE_LIVE_ACCENT}
                  copy={STORE_PRODUCE_LIVE}
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
                  pay === 'cash' ? 'produce-chatly-btn-primary' : 'produce-chatly-btn-ghost',
                )}
              >
                {STORE_PRODUCE_LIVE.payCashAr}
              </Button>
              <Button
                type="button"
                onClick={() => setPay('card')}
                className={cn(
                  'h-9 rounded-full px-3 text-xs font-bold shadow-none',
                  pay === 'card' ? 'produce-chatly-btn-primary' : 'produce-chatly-btn-ghost',
                )}
              >
                {STORE_PRODUCE_LIVE.payCardAr}
              </Button>
            </div>
            {!isLab ? (
              <label className="flex items-start gap-2 text-sm leading-7 text-[#586a5c]">
                <input type="checkbox" checked={saveBuyer} onChange={(e) => setSaveBuyer(e.target.checked)} className="mt-1" />
                <span>{STORE_PRODUCE_LIVE.saveBuyerAr}</span>
              </label>
            ) : null}
            <Button type="submit" className="produce-chatly-btn-primary h-12 w-full rounded-xl text-sm font-black">
              {service === 'come' ? STORE_PRODUCE_LIVE.comeSubmitAr : STORE_PRODUCE_LIVE.submitOrderAr}
            </Button>
            {comeHint ? <p className="text-sm leading-7 text-[#3f6d3c]">{comeHint}</p> : null}
            {sent && service !== 'come' ? <p className="text-sm font-bold text-[#3f7440]">{STORE_PRODUCE_LIVE.orderSentAr}</p> : null}
            {sent && state.orders[0]?.id ? (
              <StoreDirectPayGuest
                product="store_produce_live"
                token={token}
                requestRef={state.orders[0].id}
                accent={STORE_PRODUCE_LIVE_ACCENT}
                amountSar={String(state.orders[0].total || '')}
              />
            ) : null}
          </form>
        </DialogContent>
      </Dialog>

      {notice ? (
        <div className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-full bg-[#20352b] px-5 py-3 text-sm font-bold text-white shadow-xl sm:right-8">
          <Check size={16} className="text-[#cbe4b8]" />
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
    <article className="group overflow-hidden rounded-2xl border border-[#dfe7d9] bg-[#fffdf5] shadow-[0_10px_25px_rgba(51,77,45,0.05)]">
      <ProductVisual item={item} imageIndex={imageIndex} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-[#20352b]">{item.nameAr}</h3>
            <p className="mt-1 text-xs font-bold text-[#849284]">{STORE_PRODUCE_UNIT_AR[item.unit]}</p>
          </div>
          <p className="whitespace-nowrap text-base font-black text-[#4f813f]">
            {item.price} <span className="text-[10px]">ر.س</span>
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span
            className={cn(
              'text-[10px] font-black',
              item.arrivedToday ? 'text-[#4a7b46]' : 'text-[#9aa49a]',
            )}
          >
            {item.arrivedToday ? 'وصل اليوم' : 'متوفر'}
          </span>
          {quantity ? (
            <QtyControls value={quantity} onMinus={() => onChange(-1)} onPlus={() => onChange(1)} />
          ) : (
            <Button
              type="button"
              onClick={() => onChange(1)}
              className="h-9 rounded-lg border-0 bg-[#eaf1e4] px-3 text-xs font-black text-[#3f6d3c] shadow-none hover:bg-[#dcebd6]"
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

function ProductVisual({ item, imageIndex, small = false }: { item: ShelfRow; imageIndex: number; small?: boolean }) {
  const src = item.photoSrc?.trim() || produceCatalogImage(imageIndex);
  return (
    <div className={cn('relative overflow-hidden bg-[#e0eadb]', small ? 'size-16 shrink-0 rounded-lg' : '')}>
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
      {!small && item.arrivedToday ? (
        <span className="absolute right-3 top-3 rounded-full bg-[#fffdf5]/90 px-2 py-1 text-[10px] font-black text-[#477141]">
          وصل اليوم
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
    <div className="flex items-center gap-2 rounded-lg bg-[#edf4e8] px-2 py-1">
      <Button type="button" onClick={onMinus} className="size-7 rounded-md bg-transparent p-0 text-[#426d42] shadow-none hover:bg-white">
        <Minus size={14} />
      </Button>
      <span className="w-4 text-center text-sm font-black">{value}</span>
      <Button type="button" onClick={onPlus} className="size-7 rounded-md bg-transparent p-0 text-[#426d42] shadow-none hover:bg-white">
        <Plus size={14} />
      </Button>
    </div>
  );
}

function Feature({ icon: Icon, title, copy }: { icon: typeof Truck; title: string; copy: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-[#dfe7d9] bg-[#fffdf5] p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1e4] text-[#4a7b46]">
        <Icon size={17} />
      </span>
      <div>
        <p className="text-sm font-black text-[#20352b]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#849284]">{copy}</p>
      </div>
    </div>
  );
}
