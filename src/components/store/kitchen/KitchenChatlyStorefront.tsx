/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * واجهة زبون طبختنا1 — هيكل Chatly مع منطق halaqmap الحقيقي.
 */
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  Home as HomeIcon,
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
import { StoreShopHoursBanner } from '@/components/store/StoreShopHoursBanner';
import { StoreBuyerLocateButtons } from '@/components/store/StoreBuyerLocateButtons';
import { StoreShopLogoMark } from '@/components/store/StoreShopLogoMark';
import { StoreDirectPayGuest, StoreDirectPayPublicMount } from '@/components/store/StoreDirectPayGuest';
import { KitchenTabkhatnaMark } from '@/components/store/kitchen/KitchenTabkhatnaMark';
import { STORE_KITCHEN_LIVE, STORE_KITCHEN_LIVE_ACCENT, STORE_KITCHEN_LIVE_LAB_TOKEN } from '@/config/storeKitchenLive';
import { STORE_SHOP_HOURS_COPY } from '@/config/storeShopHours';
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
import { isShopClosedNow, shopHoursLinesAr } from '@/lib/storeShopHours';
import { liveActivityCoverSrc } from '@/lib/storeLiveActivityShelf';
import { cn } from '@/lib/utils';

type ShelfRow = KitchenLabState['shelf'][number];

export function KitchenChatlyStorefront({
  state,
  onChange,
  token,
}: {
  state: KitchenLabState;
  onChange: (next: KitchenLabState) => void;
  token: string;
}) {
  const isLab = token === STORE_KITCHEN_LIVE_LAB_TOKEN;
  const saved = useMemo(() => (isLab ? null : readSavedKitchenBuyer()), [isLab]);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [category, setCategory] = useState('الكل');
  const [search, setSearch] = useState('');

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
  const [cartOpen, setCartOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const closed = isShopClosedNow(state.host);
  const orderable = state.shelf.filter((item) => item.inStock);
  const soldOut = state.host.showSoldOut ? state.shelf.filter((item) => !item.inStock) : [];
  const featured = orderable.filter((item) => item.featured).slice(0, 8);
  const shelfItems = orderable.filter((item) => !featured.some((row) => row.catalogId === item.catalogId));
  const today = orderable.find((item) => item.catalogId === 'today-board') || featured[0];
  const needsPlace = service === 'delivery';

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
  const cartLineCount = lines.reduce((sum, line) => sum + line.qty, 0);
  const cartItemCount = lines.length;

  const categories = useMemo(() => {
    const cats = new Set<string>();
    orderable.forEach((item) => {
      if (item.category?.trim()) cats.add(item.category.trim());
    });
    return ['الكل', ...(featured.length ? [STORE_KITCHEN_LIVE.featuredTitleAr] : []), ...Array.from(cats).sort()];
  }, [orderable, featured.length]);

  const filtered = useMemo(() => {
    const q = search.trim();
    const base = category === STORE_KITCHEN_LIVE.featuredTitleAr ? orderable.filter((i) => i.featured) : shelfItems;
    return base.filter((item) => {
      const matchesCategory =
        category === 'الكل' ||
        (category === STORE_KITCHEN_LIVE.featuredTitleAr ? item.featured : item.category === category);
      const matchesSearch = !q || item.nameAr.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [orderable, category, search, shelfItems]);

  const heroSrc = today?.photoSrc || liveActivityCoverSrc(state.shelf) || STORE_KITCHEN_LIVE.heroImage;
  const hoursLine = shopHoursLinesAr(state.host).join(' · ');
  const pickupMaps = state.host.pickupPlaceVisible ? state.host.pickupMapsUrl : '';
  const myTicket = lastKey ? state.orders.find((item) => item.idempotencyKey === lastKey) : undefined;

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

  function serviceLabel(s: KitchenService) {
    if (s === 'pickup') return STORE_KITCHEN_LIVE.servicePickupAr;
    return STORE_KITCHEN_LIVE.serviceDeliveryAr;
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
    if (!isLab) {
      writeSavedKitchenBuyer(saveBuyer ? { name: order.name, phone: order.phone, place: order.place } : null);
    }
    setQty({});
    setNote('');
    setScheduledAt('');
    setDeliveryPhotoSrc('');
    setLastKey(idempotencyKey);
    setIdempotencyKey(newKitchenIdempotencyKey());
    setSent(`وصلت تذكرة النشاط رقم ${ticketNo}.`);
    setCartOpen(false);
    setCheckoutOpen(false);
    showNotice('وصلت تذكرة النشاط');
  }

  function openCheckout() {
    setCheckoutOpen(true);
  }

  const services = [
    { id: 'delivery' as const, label: STORE_KITCHEN_LIVE.serviceDeliveryAr, icon: Truck, copy: 'إلى بابك' },
    { id: 'pickup' as const, label: STORE_KITCHEN_LIVE.servicePickupAr, icon: MapPin, copy: 'من باب النشاط' },
  ];

  return (
    <main dir="rtl" className="kitchen-chatly-root min-h-dvh bg-[#f4e6d2] pb-32 text-[#2a1e14]">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-[#e9d3b0] py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-[#f0c8a0] bg-[#fff8ef] text-[#b23a0f]">
              <StoreShopLogoMark src={state.host.logoSrc} className="size-8" />
              {!state.host.logoSrc ? <KitchenTabkhatnaMark size="sm" /> : null}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#c2410c]">{STORE_KITCHEN_LIVE.shopKickerAr}</p>
              <p className="truncate text-lg font-black tracking-tight">{state.host.shopName}</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              if (cartLineCount) setCartOpen(true);
              else showNotice('السلة فارغة — اختر من القائمة أولاً');
            }}
            className="kitchen-chatly-btn-ghost relative h-10 shrink-0 rounded-full px-4 text-xs font-black"
          >
            <ShoppingBag size={16} />
            السلة
            {cartLineCount ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-[#c2410c] text-[10px] text-white">
                {cartLineCount}
              </span>
            ) : null}
          </Button>
        </header>

        {state.host.flashAr.trim() ? (
          <p className="mt-4 overflow-hidden rounded-2xl border border-[#f0c8a0] bg-[#fde3c6] px-4 py-2 text-sm font-bold text-[#9a3009]">
            {state.host.flashAr}
          </p>
        ) : null}

        <StoreShopHoursBanner hours={state.host} accent={STORE_KITCHEN_LIVE_ACCENT} />

        {!state.host.acceptingOrders ? (
          <p className="mt-3 rounded-2xl border border-[#e8c4bc] bg-[#fdf0ed] px-4 py-3 text-sm font-bold text-[#9f554c]">
            {STORE_SHOP_HOURS_COPY.pauseVisitorAr}
          </p>
        ) : null}

        <section className="grid gap-8 border-b border-[#e9d3b0] py-9 lg:grid-cols-[1fr_0.86fr] lg:items-center lg:gap-16">
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs font-bold text-[#c2410c]">
              <span className="h-px w-8 bg-[#b23a0f]" />
              {STORE_KITCHEN_LIVE.shopKickerAr}
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-[1.08] tracking-[-0.06em] text-[#2a1e14] sm:text-5xl">
              {state.host.shopName}
              <br />
              <span className="text-[#c2410c]">طبخ بيت يصل منظماً</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-[#6e5a47]">{state.host.blurbAr}</p>
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
                className="kitchen-chatly-btn-primary h-12 rounded-full px-6 text-sm font-black shadow-[0_12px_25px_rgba(194,65,12,0.2)]"
              >
                اختَر طريقة الاستلام
                <ChevronDown size={16} />
              </Button>
              {today ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-[#f0c8a0] bg-[#fff8ef] px-4 py-3 text-xs font-bold text-[#6e5a47]">
                  <span className="size-2 rounded-full bg-[#c2410c]" />
                  {STORE_KITCHEN_LIVE.todayTitleAr}: {today.nameAr}
                </div>
              ) : null}
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-xs font-bold text-[#79674f]">
              {hoursLine ? (
                <span className="inline-flex items-center gap-2">
                  <Clock3 size={15} className="text-[#c2410c]" />
                  {hoursLine}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2">
                <HomeIcon size={15} className="text-[#c2410c]" />
                نشاط أسرة منتجة
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-8 -top-8 size-24 rounded-full border border-dashed border-[#e0b47c]" />
            <div className="relative overflow-hidden rounded-[2rem] border-[9px] border-[#fff8ef] bg-[#f0dcc0] shadow-[0_22px_60px_rgba(194,65,12,0.15)]">
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
          <section className="border-b border-[#e9d3b0] py-9">
            <p className="text-xs font-bold tracking-[0.16em] text-[#c2410c]">{STORE_KITCHEN_LIVE.featuredTitleAr}</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#2a1e14]">{STORE_KITCHEN_LIVE.featuredTitleAr}</h2>
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
          <section className="border-b border-[#e9d3b0] py-9">
            <p className="text-xs font-bold tracking-[0.16em] text-[#b23a0f]">{STORE_KITCHEN_LIVE.todayTitleAr}</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-[#f0c8a0] bg-[#fff8ef]">
              {today.photoSrc ? (
                <img src={today.photoSrc} alt={today.nameAr} className="aspect-[16/9] w-full object-cover" loading="lazy" />
              ) : null}
              <div className="flex items-center justify-between gap-3 px-4 py-4">
                <div>
                  <h2 className="text-xl font-black text-[#2a1e14]">{today.nameAr}</h2>
                  <p className="mt-1 text-sm font-black text-[#c2410c]">{today.price} ر.س</p>
                </div>
                <QtyControls value={qty[today.catalogId] || 0} onMinus={() => bump(today.catalogId, -1)} onPlus={() => bump(today.catalogId, 1)} />
              </div>
            </div>
          </section>
        ) : null}

        <section className="sticky top-0 z-20 -mx-4 border-b border-[#e9d3b0] bg-[#f4e6d2]/95 px-4 py-3 backdrop-blur-sm sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a7860]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={orderable.length >= 8 ? 'ابحث في الأصناف…' : ''}
                className="h-11 border-[#e3cfa8] bg-[#fff8ef] pr-10 text-sm text-[#2a1e14] placeholder:text-[#b3a084]"
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
                    category === item ? 'kitchen-chatly-btn-primary' : 'kitchen-chatly-btn-ghost',
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
              <p className="text-xs font-bold tracking-[0.16em] text-[#c2410c]">{STORE_KITCHEN_LIVE.shelfTitleAr}</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#2a1e14]">اختَر ما تحتاجه</h2>
            </div>
            <span className="hidden items-center gap-2 text-xs font-bold text-[#79674f] sm:flex">
              <HomeIcon size={16} className="text-[#c2410c]" />
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
            <div className="mt-6 rounded-2xl border border-dashed border-[#e9d8bc] bg-[#fff8ef] p-10 text-center">
              <HomeIcon size={24} className="mx-auto text-[#b23a0f]" />
              <p className="mt-3 font-black text-[#2a1e14]">ما لقينا هذا الصنف</p>
              <p className="mt-1 text-sm text-[#8a7860]">جرّب كلمة ثانية أو ارجع لكل الأصناف.</p>
            </div>
          ) : null}
          {soldOut.length ? (
            <div className="mt-6 space-y-2">
              {soldOut.map((item) => (
                <div key={item.catalogId} className="flex items-center justify-between rounded-xl border border-[#e9d8bc] bg-[#fbf3e6] px-3 py-2 text-sm text-[#a2917a]">
                  <span className="line-through">{item.nameAr}</span>
                  <span>{STORE_KITCHEN_LIVE.soldOutAr}</span>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="grid gap-3 border-t border-[#e9d3b0] py-8 sm:grid-cols-3">
          <Feature icon={Truck} title={STORE_KITCHEN_LIVE.serviceDeliveryAr} copy="توصيل واضح مع رسوم إن وُجدت." />
          <Feature icon={MapPin} title={STORE_KITCHEN_LIVE.servicePickupAr} copy="موقع الاستلام من الباب يصلك مع الجاهزية." />
          <Feature icon={Store} title="نشاط أسرة منتجة" copy="طلبك يذهب مباشرة إلى هذا النشاط." />
        </section>

        <section className="rounded-2xl border border-[#e3cfa8] bg-[#fff8ef] p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-[#c2410c]">نشاط أسرة منتجة</p>
              <h3 className="mt-1 text-lg font-black text-[#2a1e14]">أنت تطلب من نشاط واحد في حيك</h3>
              <p className="mt-1 text-sm text-[#79674f]">ليست سوقاً مشتركة؛ طلبك يذهب مباشرة إلى {state.host.shopName}.</p>
            </div>
            <StoreDirectPayPublicMount product="store_kitchen_live" token={token} accent={STORE_KITCHEN_LIVE_ACCENT} />
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-[#e9d3b0] py-7 text-sm text-[#79674f] sm:flex-row sm:items-center sm:justify-between">
          <p>طبختنا1 — من مطبخ البيت إلى بابك.</p>
          <div className="flex flex-wrap gap-5 font-bold">
            <span>الدفع نقداً أو شبكة عند التسليم</span>
            <span>لا عمولة على قيمة الوجبات</span>
          </div>
        </footer>
      </div>

      {cartLineCount > 0 ? (
        <div className="fixed bottom-4 right-4 left-4 z-30 mx-auto flex max-w-[800px] items-center justify-between gap-4 rounded-2xl bg-[#2a1e14] px-4 py-3 text-white shadow-[0_15px_35px_rgba(42,30,20,0.28)] sm:right-8 sm:left-8 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#c2410c]">
              <KitchenTabkhatnaMark size="sm" inverse />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">
                {cartItemCount} {cartItemCount === 1 ? 'صنف' : 'أصناف'} في السلة
              </p>
              <p className="text-xs text-[#f0dcc0]">
                {total} ر.س · {serviceLabel(service)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={openCheckout}
            className="h-10 shrink-0 rounded-xl border-0 bg-[#fde3c6] px-4 text-xs font-black text-[#7a3212] shadow-none hover:bg-white"
          >
            إتمام الطلب
            <ArrowLeft size={15} />
          </Button>
        </div>
      ) : null}

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="kitchen-chatly-root max-h-[90vh] max-w-lg overflow-y-auto border-[#e3cfa8] bg-[#fff8ef] p-0 text-right" dir="rtl">
          <div className="p-5 sm:p-6">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <DialogTitle className="text-2xl font-black text-[#2a1e14]">مراجعة السلة</DialogTitle>
                  <DialogDescription className="mt-2 text-sm leading-6 text-[#79674f]">
                    راجع طلبك قبل إتمامه.
                  </DialogDescription>
                </div>
                <span className="rounded-full bg-[#fde3c6] px-3 py-1 text-xs font-black text-[#c2410c]">
                  {cartItemCount} أصناف
                </span>
              </div>
            </DialogHeader>
            <div className="mt-6 space-y-3">
              {lines.map((line) => {
                const item = orderable.find((row) => row.catalogId === line.catalogId);
                if (!item) return null;
                return (
                  <div key={line.catalogId} className="flex items-center gap-3 rounded-xl border border-[#e9d8bc] bg-white p-3">
                    <ProductVisual item={item} small />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-[#2a1e14]">{line.nameAr}</p>
                      <p className="mt-1 text-xs text-[#8a7860]">{priceLine(item)}</p>
                    </div>
                    <QtyControls value={line.qty} onMinus={() => bump(line.catalogId, -1)} onPlus={() => bump(line.catalogId, 1)} />
                  </div>
                );
              })}
            </div>
            <div className="mt-6 rounded-xl bg-[#fde3c6] p-4">
              <div className="flex items-center justify-between text-lg font-black text-[#2a1e14]">
                <span>الإجمالي</span>
                <span>{total} ر.س</span>
              </div>
              {deliveryFee > 0 ? (
                <p className="mt-2 text-xs leading-5 text-[#79674f]">يشمل رسوم توصيل {deliveryFee} ر.س.</p>
              ) : null}
            </div>
            <Button
              type="button"
              onClick={() => {
                setCartOpen(false);
                openCheckout();
              }}
              className="kitchen-chatly-btn-primary mt-5 h-12 w-full rounded-xl text-sm font-black"
            >
              أكمل الطلب
              <ArrowLeft size={16} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={serviceOpen} onOpenChange={setServiceOpen}>
        <DialogContent className="kitchen-chatly-root max-w-xl border-[#e3cfa8] bg-[#fff8ef] text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#2a1e14]">كيف يصلك طلبك؟</DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-[#79674f]">
              اختر التوصيل أو الاستلام من باب النشاط.
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
                    ? 'border-[#c2410c] bg-[#fde3c6]'
                    : 'border-[#e9d8bc] bg-white hover:bg-[#fbeddb]',
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#fff8ef] text-[#c2410c]">
                  <Icon size={18} />
                </span>
                <span className="text-sm font-black text-[#2a1e14]">{label}</span>
                <span className="text-xs font-normal text-[#8a7860]">{copy}</span>
              </Button>
            ))}
          </div>
          {service === 'pickup' ? (
            <div className="mt-5 rounded-xl border border-[#e3cfa8] bg-[#fde3c6] p-4">
              <div className="flex items-center gap-2 text-sm font-black text-[#9a3009]">
                <MapPin size={16} />
                {STORE_KITCHEN_LIVE.pickupPlaceTitleAr}
              </div>
              {pickupMaps ? (
                <a
                  className="mt-3 inline-flex rounded-full bg-[#c2410c] px-3 py-1.5 text-xs font-bold text-white"
                  href={pickupMaps}
                  target="_blank"
                  rel="noreferrer"
                >
                  {STORE_KITCHEN_LIVE.pickupPlaceOpenAr}
                </a>
              ) : (
                <p className="mt-2 text-sm leading-6 text-[#79674f]">
                  {state.host.pickupPlaceVisible ? STORE_KITCHEN_LIVE.pickupPlacePendingAr : STORE_KITCHEN_LIVE.pickupPlaceHiddenAr}
                </p>
              )}
            </div>
          ) : null}
          <Button
            type="button"
            onClick={() => {
              setServiceOpen(false);
              showNotice('تم حفظ طريقة الاستلام');
            }}
            className="kitchen-chatly-btn-primary mt-6 h-11 w-full rounded-xl text-sm font-black"
          >
            تأكيد طريقة الاستلام
            <Check size={16} />
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="kitchen-chatly-root max-h-[90vh] max-w-lg overflow-y-auto border-[#e3cfa8] bg-[#fff8ef] text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#2a1e14]">
              {closed ? STORE_SHOP_HOURS_COPY.preorderTitleAr : STORE_KITCHEN_LIVE.checkoutTitleAr}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-[#79674f]">
              الإجمالي الآن: {total} ر.س
            </DialogDescription>
          </DialogHeader>
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <label className="block text-xs font-bold text-[#6e5a47]">
              {STORE_KITCHEN_LIVE.buyerNameLabelAr}
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 h-11 border-[#e3cfa8] bg-white"
                maxLength={40}
              />
            </label>
            <label className="block text-xs font-bold text-[#6e5a47]">
              {STORE_KITCHEN_LIVE.buyerPhoneLabelAr}
              <Input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 h-11 border-[#e3cfa8] bg-white"
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
                    service === id ? 'kitchen-chatly-btn-primary' : 'kitchen-chatly-btn-ghost',
                  )}
                >
                  {label}
                </Button>
              ))}
            </div>
            {needsPlace ? (
              <>
                <label className="block text-xs font-bold text-[#6e5a47]">
                  {STORE_KITCHEN_LIVE.buyerPlaceLabelAr}
                  <Input
                    required
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="mt-2 h-11 border-[#e3cfa8] bg-white"
                    maxLength={240}
                  />
                </label>
                <p className="text-xs leading-6 text-[#8a7860]">{STORE_KITCHEN_LIVE.buyerPlaceHintAr}</p>
                <StoreBuyerLocateButtons
                  value={place}
                  accent={STORE_KITCHEN_LIVE_ACCENT}
                  copy={STORE_KITCHEN_LIVE}
                  onLocated={(mapsUrl) => {
                    setPlace(mapsUrl);
                    if (saveBuyer && name.trim() && phone.trim()) {
                      writeSavedKitchenBuyer({ name: name.trim().slice(0, 40), phone: phone.trim().slice(0, 20), place: mapsUrl });
                    }
                  }}
                />
                <label className="block text-xs font-bold text-[#6e5a47]">
                  {STORE_KITCHEN_LIVE.buyerPhotoLabelAr}
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-2 block w-full text-xs"
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
              <div className="rounded-xl border border-[#e3cfa8] bg-[#fde3c6] p-4">
                <p className="text-sm font-black text-[#9a3009]">{STORE_KITCHEN_LIVE.pickupPlaceTitleAr}</p>
                {pickupMaps ? (
                  <a
                    className="mt-2 inline-flex rounded-full bg-[#c2410c] px-3 py-1.5 text-xs font-bold text-white"
                    href={pickupMaps}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {STORE_KITCHEN_LIVE.pickupPlaceOpenAr}
                  </a>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-[#79674f]">
                    {state.host.pickupPlaceVisible ? STORE_KITCHEN_LIVE.pickupPlacePendingAr : STORE_KITCHEN_LIVE.pickupPlaceHiddenAr}
                  </p>
                )}
              </div>
            )}
            {state.host.scheduleEnabled ? (
              <label className="block text-xs font-bold text-[#6e5a47]">
                {STORE_KITCHEN_LIVE.buyerScheduleLabelAr}
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="mt-2 h-11 border-[#e3cfa8] bg-white"
                />
              </label>
            ) : null}
            <label className="block text-xs font-bold text-[#6e5a47]">
              {STORE_KITCHEN_LIVE.buyerNoteLabelAr}
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-2 h-11 border-[#e3cfa8] bg-white"
                maxLength={160}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => setPay('cash')}
                className={cn(
                  'h-9 rounded-full px-3 text-xs font-bold shadow-none',
                  pay === 'cash' ? 'kitchen-chatly-btn-primary' : 'kitchen-chatly-btn-ghost',
                )}
              >
                {STORE_KITCHEN_LIVE.payCashAr}
              </Button>
              <Button
                type="button"
                onClick={() => setPay('card')}
                className={cn(
                  'h-9 rounded-full px-3 text-xs font-bold shadow-none',
                  pay === 'card' ? 'kitchen-chatly-btn-primary' : 'kitchen-chatly-btn-ghost',
                )}
              >
                {STORE_KITCHEN_LIVE.payCardAr}
              </Button>
            </div>
            <div>
              <StoreDirectPayPublicMount product="store_kitchen_live" token={token} accent={STORE_KITCHEN_LIVE_ACCENT} />
            </div>
            {!isLab ? (
              <label className="flex items-start gap-2 text-sm leading-7 text-[#79674f]">
                <input type="checkbox" checked={saveBuyer} onChange={(e) => setSaveBuyer(e.target.checked)} className="mt-1" />
                <span>{STORE_KITCHEN_LIVE.saveBuyerAr}</span>
              </label>
            ) : null}
            <Button type="submit" className="kitchen-chatly-btn-primary h-12 w-full rounded-xl text-sm font-black">
              {STORE_KITCHEN_LIVE.submitOrderAr}
            </Button>
            {sent ? <p className="text-sm font-bold text-[#c2410c]">{sent}</p> : null}
            {sent && myTicket?.id ? (
              <StoreDirectPayGuest
                product="store_kitchen_live"
                token={token}
                requestRef={myTicket.id}
                accent={STORE_KITCHEN_LIVE_ACCENT}
                amountSar={String(total || '')}
              />
            ) : null}
            {myTicket?.readyAt ? (
              <div className="rounded-xl border border-[#e3cfa8] bg-[#fde3c6] p-4">
                <p className="text-sm font-black text-[#9a3009]">{STORE_KITCHEN_LIVE.orderReadyBannerAr}</p>
                {myTicket.readyMapsUrl ? (
                  <a
                    className="mt-2 inline-flex rounded-full bg-[#c2410c] px-3 py-1.5 text-xs font-bold text-white"
                    href={myTicket.readyMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {STORE_KITCHEN_LIVE.pickupPlaceOpenAr}
                  </a>
                ) : null}
              </div>
            ) : null}
          </form>
        </DialogContent>
      </Dialog>

      {notice ? (
        <div className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-full bg-[#2a1e14] px-5 py-3 text-sm font-bold text-white shadow-xl sm:right-8">
          <Check size={16} className="text-[#fde3c6]" />
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
    <article className="group overflow-hidden rounded-2xl border border-[#e9d8bc] bg-[#fff8ef] shadow-[0_10px_25px_rgba(42,30,20,0.05)]">
      <ProductVisual item={item} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-[#2a1e14]">{item.nameAr}</h3>
            {item.category ? <p className="mt-1 text-xs font-bold text-[#8a7860]">{item.category}</p> : null}
          </div>
          <p className="whitespace-nowrap text-base font-black text-[#c2410c]">
            {item.price} <span className="text-[10px]">ر.س</span>
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span
            className={cn(
              'text-[10px] font-black',
              item.featured ? 'text-[#c2410c]' : 'text-[#a2917a]',
            )}
          >
            {item.featured ? STORE_KITCHEN_LIVE.featuredTitleAr : STORE_KITCHEN_LIVE.stockOnAr}
          </span>
          {quantity ? (
            <QtyControls value={quantity} onMinus={() => onChange(-1)} onPlus={() => onChange(1)} />
          ) : (
            <Button
              type="button"
              onClick={() => onChange(1)}
              className="h-9 rounded-lg border-0 bg-[#fde3c6] px-3 text-xs font-black text-[#9a3009] shadow-none hover:bg-[#f5d3ab]"
            >
              إضافة سريعة
              <Plus size={14} />
            </Button>
          )}
        </div>
        <p className="mt-2 text-[10px] text-[#a2917a]">{priceLine}</p>
      </div>
    </article>
  );
}

function ProductVisual({ item, small = false }: { item: ShelfRow; small?: boolean }) {
  const src = item.photoSrc || STORE_KITCHEN_LIVE.heroImage;
  return (
    <div className={cn('relative overflow-hidden bg-[#f0dcc0]', small ? 'size-16 shrink-0 rounded-lg' : '')}>
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
        <span className="absolute right-3 top-3 rounded-full bg-[#fff8ef]/90 px-2 py-1 text-[10px] font-black text-[#c2410c]">
          {STORE_KITCHEN_LIVE.featuredTitleAr}
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
    <div className="flex items-center gap-2 rounded-lg bg-[#fde3c6] px-2 py-1">
      <Button type="button" onClick={onMinus} className="size-7 rounded-md bg-transparent p-0 text-[#9a3009] shadow-none hover:bg-white">
        <Minus size={14} />
      </Button>
      <span className="w-4 text-center text-sm font-black">{value}</span>
      <Button type="button" onClick={onPlus} className="size-7 rounded-md bg-transparent p-0 text-[#9a3009] shadow-none hover:bg-white">
        <Plus size={14} />
      </Button>
    </div>
  );
}

function Feature({ icon: Icon, title, copy }: { icon: typeof Truck; title: string; copy: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-[#e9d8bc] bg-[#fff8ef] p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fde3c6] text-[#c2410c]">
        <Icon size={17} />
      </span>
      <div>
        <p className="text-sm font-black text-[#2a1e14]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#8a7860]">{copy}</p>
      </div>
    </div>
  );
}
