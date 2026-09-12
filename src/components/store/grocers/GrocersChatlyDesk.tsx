/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة تشغيل تمويناتا1 — هيكل Chatly مع منطق halaqmap الحقيقي.
 */
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  Bell,
  Clipboard,
  Clock3,
  FileText,
  Grid2X2,
  
  MapPin,
  Menu,
  Package,
  ShoppingBag,
  Store,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StoreLiveShopShareDesk } from '@/components/store/StoreLiveShopShareDesk';
import { STORE_GROCERS_LIVE, STORE_GROCERS_LIVE_ACCENT } from '@/config/storeGrocersLive';
import { STORE_MOBILE_VENDOR } from '@/config/storeMobileVendor';
import { STORE_SHOP_HOURS_COPY } from '@/config/storeShopHours';
import {
  grocersWhatsAppText,
  type GrocersLabState,
  type GrocersOrder,
} from '@/lib/storeGrocersLiveLab';
import { StoreDeskOrderAlert } from '@/components/store/StoreDeskOrderAlert';
import { StoreDeskControlTitle } from '@/components/store/StoreDeskControlTitle';
import { StoreDeskArchiveDock } from '@/components/store/StoreDeskArchiveDock';
import { StoreDeskTicketActions } from '@/components/store/StoreDeskTicketActions';
import { STORE_PRODUCT_TRIAL_PRODUCTS } from '@/config/storeProductTrial';
import { STORE_DESK_ORDER_TICKET_COPY } from '@/config/storeDeskOrderTicket';
import { applyDeskFinish, deskOrderPhase, isLiveDeskTicket, receiveDeskTicket } from '@/lib/storeDeskOrderTicket';
import { StoreGrocersIngest } from '@/components/store/StoreGrocersIngest';
import { StoreGrocersDeskChat } from '@/components/store/StoreGrocersChat';
import { StoreShopHoursDesk } from '@/components/store/StoreShopHoursDesk';
import { StoreShopPlaceDesk } from '@/components/store/StoreShopPlaceDesk';
import { StoreDeskHelpSupport } from '@/components/store/StoreDeskHelpSupport';
import { StoreDeskGuideLink } from '@/components/store/StoreDeskGuideLink';
import { StoreDeskCornerDock } from '@/components/store/StoreDeskCornerNav';
import { StoreShopIdentityDesk } from '@/components/store/StoreShopIdentityDesk';
import { StoreShopBackgroundDesk } from '@/components/store/StoreShopBackgroundDesk';
import { STORE_GROCERS_SUPPORT } from '@/config/storeProductSupport';
import { StoreDirectPayDesk } from '@/components/store/StoreDirectPayDesk';
import { GrocersTamwinatMark } from '@/components/store/grocers/GrocersTamwinatMark';
import { StoreBrandMark } from '@/components/store/StoreBrandMark';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useStoreShopPresence } from '@/hooks/useStoreShopPresence';
import { cn } from '@/lib/utils';

type DeskSection = 'overview' | 'orders' | 'products' | 'location' | 'payment' | 'tools';

function orderIsToday(at: string): boolean {
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function GrocersChatlyDesk({
  state,
  onChange,
  shopUrl,
  token,
  showTrialNote = false,
  maskPii = false,
}: {
  state: GrocersLabState;
  onChange: (next: GrocersLabState) => void;
  shopUrl: string;
  token: string;
  showTrialNote?: boolean;
  maskPii?: boolean;
}) {
  const [section, setSection] = useState<DeskSection>('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);

  const live = state.orders.filter(isLiveDeskTicket);
  const fresh = live.filter((item) => deskOrderPhase(item) === 'new');
  const working = live.filter((item) => deskOrderPhase(item) === 'received');
  const presenceCount = useStoreShopPresence({
    role: 'desk',
    productTag: 'store_grocers_live',
    token,
    enabled: Boolean(token),
  });

  const todaySalesTotal = useMemo(() => {
    const all: GrocersOrder[] = [...state.orders, ...state.orderArchive];
    return all.filter((order) => orderIsToday(order.at)).reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  }, [state.orders, state.orderArchive]);

  const featuredCount = state.shelf.filter((item) => item.featured).length;

  const vendorLabel =
    state.host.vendorMode === 'mobile' ? STORE_MOBILE_VENDOR.mobileTitleAr : STORE_MOBILE_VENDOR.fixedTitleAr;

  function receiveOrder(id: string) {
    onChange({ ...state, orders: receiveDeskTicket(state.orders, id) });
  }

  function finishOrder(id: string) {
    const next = applyDeskFinish(state.orders, state.orderArchive, id, 'grocers');
    onChange({ ...state, orders: next.orders, orderArchive: next.orderArchive });
  }

  function toggleStock(catalogId: string) {
    onChange({
      ...state,
      shelf: state.shelf.map((item) => (item.catalogId === catalogId ? { ...item, inStock: !item.inStock } : item)),
    });
  }


  function toggleAcceptingOrders() {
    onChange({ ...state, host: { ...state.host, acceptingOrders: !state.host.acceptingOrders } });
  }

  function goOverviewAlert() {
    setSection('overview');
    setMobileNav(false);
    window.requestAnimationFrame(() => {
      alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const nav: { key: DeskSection; label: string; icon: typeof Store; badge?: number }[] = [
    { key: 'overview', label: 'نظرة عامة', icon: Store },
    { key: 'orders', label: 'الطلبات', icon: ShoppingBag, badge: fresh.length || undefined },
    { key: 'products', label: 'المنتجات والمخزون', icon: Package },
    { key: 'location', label: 'الموقع والساعات', icon: MapPin },
    { key: 'payment', label: 'الدفع المباشر', icon: Clipboard },
    { key: 'tools', label: 'أدوات المشاركة', icon: Grid2X2 },
  ];

  return (
    <main dir="rtl" className="grocers-chatly-desk-root min-h-dvh bg-[#f4f1e8] pb-16 text-[#22332b]">
      <div className="grid min-h-dvh lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-[min(280px,88vw)] flex-col border-l border-[#dfe4d6] bg-[#fffdf5] p-5 transition-transform lg:static lg:z-auto lg:w-auto lg:translate-x-0',
            mobileNav ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0',
          )}
        >
          <div className="flex items-center justify-between border-b border-[#dfe4d6] pb-6 lg:block">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#eaf1e4] text-[#7aab65]">
                <GrocersTamwinatMark size="sm" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#7aab65]">مساحة التشغيل</p>
                <p className="text-lg font-black">{STORE_GROCERS_LIVE.titleAr}</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setMobileNav(false)}
              className="size-9 rounded-full bg-[#eaf1e4] p-0 text-[#6fa058] shadow-none lg:hidden"
              aria-label="إغلاق القائمة"
            >
              <X size={16} />
            </Button>
          </div>

          <div className="mt-6 rounded-2xl bg-[#20352b] p-4 text-white">
            <p className="text-xs text-[#d8f0cc]">حالة البائع</p>
            <p className="mt-2 text-lg font-black">{state.host.shopName}</p>
            <p className="mt-1 text-[11px] text-[#c4dcc1]">
              {state.host.acceptingOrders ? 'يستقبل الطلبات الآن' : 'الاستقبال متوقف'}
            </p>
            <p className="mt-2 inline-flex rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-[#d8f0cc]">
              {vendorLabel}
            </p>
          </div>

          <nav className="mt-7 flex flex-1 flex-col gap-1 overflow-y-auto">
            {nav.map(({ key, label, icon: Icon, badge }) => (
              <Button
                key={key}
                type="button"
                onClick={() => {
                  setSection(key);
                  setMobileNav(false);
                }}
                className={cn(
                  'h-11 justify-start gap-3 rounded-xl px-3 text-sm font-bold shadow-none',
                  section === key
                    ? 'bg-[#eaf1e4] text-[#6fa058] hover:bg-[#dfeeda]'
                    : 'bg-transparent text-[#6d7b6d] hover:bg-[#f0f5ec]',
                )}
              >
                <Icon size={17} />
                {label}
                {badge ? (
                  <span className="mr-auto flex size-5 items-center justify-center rounded-full bg-[#7aab65] text-[10px] text-white">
                    {badge}
                  </span>
                ) : null}
              </Button>
            ))}

            <div className="my-4 h-px bg-[#dfe4d6]" />

            <Link
              to={ROUTE_PATHS.STORE_GROCERS_SUPPORT}
              onClick={() => setMobileNav(false)}
              className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-[#6d7b6d] hover:bg-[#f0f5ec] hover:text-[#6fa058]"
              title={STORE_GROCERS_SUPPORT.deskLeadAr}
            >
              <FileText size={17} />
              {STORE_GROCERS_SUPPORT.landingCtaAr}
            </Link>

            <Button
              type="button"
              onClick={() => {
                setSection('orders');
                setMobileNav(false);
              }}
              className="h-11 justify-start gap-3 rounded-xl bg-transparent px-3 text-sm font-bold text-[#6d7b6d] shadow-none hover:bg-[#f0f5ec]"
            >
              <Archive size={17} />
              {STORE_DESK_ORDER_TICKET_COPY.archiveTitleAr}
            </Button>
          </nav>

          <a
            href={shopUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center gap-3 border-t border-[#dfe4d6] px-1 pt-5 text-sm font-bold text-[#6d7b6d] hover:text-[#6fa058]"
          >
            <Store size={17} />
            {STORE_GROCERS_LIVE.shopLinkAr}
            <ArrowLeft size={14} className="mr-auto" />
          </a>
        </aside>

        {mobileNav ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[#20352b]/40 lg:hidden"
            aria-label="إغلاق القائمة"
            onClick={() => setMobileNav(false)}
          />
        ) : null}

        <section className="min-w-0">
          <header className="grocers-chatly-desk-header">
            <div className="grocers-chatly-desk-header__top">
              <div className="grocers-chatly-desk-header__start">
                <Button
                  type="button"
                  onClick={() => setMobileNav(true)}
                  className="size-10 shrink-0 rounded-full bg-[#eaf1e4] p-0 text-[#6fa058] shadow-none lg:hidden"
                  aria-label="فتح القائمة"
                >
                  <Menu size={18} />
                </Button>
                <StoreBrandMark className="grocers-chatly-desk-header__brand" />
                <div className="grocers-chatly-desk-header__title-block min-w-0">
                  <p className="text-xs font-bold text-[#849284]">ملخص اليوم</p>
                  <StoreDeskControlTitle trialNote="" />
                </div>
              </div>
              <div className="grocers-chatly-desk-header__actions">
                <Button
                  type="button"
                  onClick={toggleAcceptingOrders}
                  className={cn(
                    'inline-flex h-10 max-w-[11rem] items-center gap-2 rounded-full border px-3 text-xs font-bold shadow-none sm:max-w-none',
                    state.host.acceptingOrders
                      ? 'border-[#d4dfcc] bg-white text-[#8fbf7a] hover:bg-[#f0f5ec]'
                      : 'border-[#e8c4bc] bg-[#fdf0ed] text-[#9f554c] hover:bg-[#fae4df]',
                  )}
                >
                  <span
                    className={cn('size-2 rounded-full', state.host.acceptingOrders ? 'bg-[#3d9a6c]' : 'bg-[#c56c5c]')}
                  />
                  {state.host.acceptingOrders ? STORE_SHOP_HOURS_COPY.pauseOnAr : STORE_SHOP_HOURS_COPY.pauseOffAr}
                </Button>
                <Button
                  type="button"
                  onClick={goOverviewAlert}
                  aria-label={STORE_DESK_ORDER_TICKET_COPY.newLaneAr}
                  className="relative size-10 rounded-full border border-[#dfe4d6] bg-white p-0 text-[#637263] shadow-none hover:bg-[#f0f5ec]"
                >
                  <Bell size={17} />
                  {fresh.length ? (
                    <span className="absolute -left-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#7aab65] text-[9px] font-black text-white">
                      {fresh.length}
                    </span>
                  ) : null}
                </Button>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#8fbf7a] text-sm font-black text-white">
                  <GrocersTamwinatMark inverse size="sm" />
                </div>
              </div>
            </div>
            {showTrialNote ? (
              <p className="grocers-chatly-desk-header__trial-note" role="note">
                {STORE_PRODUCT_TRIAL_PRODUCTS.grocers.deskNoteAr}
              </p>
            ) : null}
          </header>

          <div className="p-4 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-[1420px]">
              {section === 'overview' ? (
                <OverviewSection
                  maskPii={maskPii}
                  fresh={fresh}
                  working={working}
                  featuredCount={featuredCount}
                  presenceCount={presenceCount}
                  todaySalesTotal={todaySalesTotal}
                  vendorLabel={vendorLabel}
                  flashAr={state.host.flashAr}
                  onFlashChange={(flashAr) => onChange({ ...state, host: { ...state.host, flashAr } })}
                  shopUrl={shopUrl}
                  onGoOrders={() => setSection('orders')}
                  onGoLocation={() => setSection('location')}
                  onReceive={receiveOrder}
                  onFinish={finishOrder}
                  shopName={state.host.shopName}
                  mapsUrl={state.host.vendorMode === 'mobile' ? state.host.pickupMapsUrl : ''}
                  alertRef={alertRef}
                  alertSlot={
                    <StoreDeskOrderAlert
                      product="grocers"
                      token={token}
                      shopName={state.host.shopName}
                      orderIds={fresh.map((item) => item.id)}
                      unreadCount={fresh.length}
                    />
                  }
                />
              ) : null}

              {section === 'orders' ? (
                <OrdersSection
                  maskPii={maskPii}
                  fresh={fresh}
                  working={working}
                  onReceive={receiveOrder}
                  onFinish={finishOrder}
                  shopName={state.host.shopName}
                  mapsUrl={state.host.vendorMode === 'mobile' ? state.host.pickupMapsUrl : ''}
                  chatSlot={<StoreGrocersDeskChat state={state} onChange={onChange} />}
                  archiveSlot={
                    <StoreDeskArchiveDock
                      tickets={state.orderArchive}
                      accent={STORE_GROCERS_LIVE_ACCENT}
                      filename="grocers-archive.json"
                    />
                  }
                />
              ) : null}

              {section === 'products' ? (
                <ProductsSection
                  shelf={state.shelf}
                  onToggleStock={toggleStock}
                  ingestSlot={<StoreGrocersIngest state={state} onChange={onChange} />}
                />
              ) : null}

              {section === 'location' ? (
                <LocationSection
                  vendorLabel={vendorLabel}
                  placeSlot={
                    <StoreShopPlaceDesk
                      value={state.host}
                      onChange={(place) => onChange({ ...state, host: { ...state.host, ...place } })}
                      copy={STORE_GROCERS_LIVE}
                      accent={STORE_GROCERS_LIVE_ACCENT}
                    />
                  }
                  hoursSlot={
                    <StoreShopHoursDesk
                      value={state.host}
                      onChange={(nextHours) => onChange({ ...state, host: { ...state.host, ...nextHours } })}
                      accent={STORE_GROCERS_LIVE_ACCENT}
                    />
                  }
                />
              ) : null}

              {section === 'payment' ? (
                <PaymentSection paySlot={<StoreDirectPayDesk product="store_grocers_live" token={token} accent={STORE_GROCERS_LIVE_ACCENT} />} />
              ) : null}

              {section === 'tools' ? (
                <ToolsSection
                  flashAr={state.host.flashAr}
                  onFlashChange={(flashAr) => onChange({ ...state, host: { ...state.host, flashAr } })}
                  identitySlot={
                    <StoreShopIdentityDesk
                      shopNameLabel={STORE_GROCERS_LIVE.shopNameLabelAr}
                      shopName={state.host.shopName}
                      onShopNameChange={(shopName) => onChange({ ...state, host: { ...state.host, shopName } })}
                      logoSrc={state.host.logoSrc}
                      onLogoChange={(logoSrc) => onChange({ ...state, host: { ...state.host, logoSrc } })}
                      blurbAr={state.host.blurbAr}
                      onBlurbChange={(blurbAr) => onChange({ ...state, host: { ...state.host, blurbAr } })}
                      customFields={state.host.customFields}
                      onCustomFieldChange={(index, value) => {
                        const customFields = state.host.customFields.slice();
                        customFields[index] = value;
                        onChange({ ...state, host: { ...state.host, customFields } });
                      }}
                      accent={STORE_GROCERS_LIVE_ACCENT}
                      fieldClassName="grocers-field"
                    />
                  }
                  backgroundSlot={
                    <StoreShopBackgroundDesk
                      value={{ shopHeaderBg: state.host.shopHeaderBg, shopPageBg: state.host.shopPageBg }}
                      onChange={(bg) => onChange({ ...state, host: { ...state.host, ...bg } })}
                      accent={STORE_GROCERS_LIVE_ACCENT}
                      fieldClassName="grocers-field"
                    />
                  }
                  shareSlot={
                    <StoreLiveShopShareDesk
                      kind="grocers"
                      token={token}
                      shopName={state.host.shopName}
                      shopUrl={shopUrl}
                      qrPhraseAr={STORE_GROCERS_LIVE.qrPhraseAr}
                      qrPrintAr={STORE_GROCERS_LIVE.qrPrintAr}
                      accent={STORE_GROCERS_LIVE_ACCENT}
                      showTitle={false}
                    />
                  }
                />
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <StoreDeskCornerDock>
        <StoreDeskGuideLink
          to={ROUTE_PATHS.STORE_GROCERS_SUPPORT}
          leadAr={STORE_GROCERS_SUPPORT.deskLeadAr}
          labelAr={STORE_GROCERS_SUPPORT.landingCtaAr}
        />
        <StoreDeskHelpSupport product="grocers" />
      </StoreDeskCornerDock>
    </main>
  );
}

function PageHeading({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-[#7aab65]">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#20352b] sm:text-4xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#758374]">{copy}</p>
      </div>
      {action}
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: 'green' | 'blue' | 'gold' | 'olive';
}) {
  const toneClass =
    tone === 'green'
      ? 'bg-[#eaf1e4] text-[#7aab65]'
      : tone === 'blue'
        ? 'bg-[#e3edf5] text-[#3d6b8a]'
        : tone === 'gold'
          ? 'bg-[#f7edd3] text-[#9a741d]'
          : 'bg-[#eef0e3] text-[#5f705f]';

  return (
    <div className="rounded-2xl border border-[#dfe4d6] bg-[#fffdf5] p-4">
      <p className="text-xs font-bold text-[#849284]">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#20352b]">{value}</p>
      <p className={cn('mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-black', toneClass)}>{hint}</p>
    </div>
  );
}

function OrderTicketCard({
  order,
  onReceive,
  onFinish,
  shopName,
  mapsUrl,
  compact = false,
  maskPii = false,
}: {
  order: GrocersOrder;
  onReceive: () => void;
  onFinish: () => void;
  shopName: string;
  mapsUrl: string;
  compact?: boolean;
  maskPii?: boolean;
}) {
  function displayName(order: { name: string }) {
    return maskPii ? STORE_GROCERS_LIVE.labDeskMaskedNameAr : order.name;
  }
  function displayPhone(order: { phone: string }) {
    return maskPii ? STORE_GROCERS_LIVE.labDeskMaskedPhoneAr : order.phone;
  }
  function displayPlace(order: { place: string }) {
    if (maskPii) return STORE_GROCERS_LIVE.labDeskMaskedPlaceAr;
    if (order.place.startsWith('http')) return 'تم تحديد الموقع';
    return order.place || 'بلا موقع مكتوب';
  }
  const phase = deskOrderPhase(order);
  return (
    <div className="store-desk-ticket-card rounded-xl border border-[#dfe7d9] bg-white p-4">
      <div className={cn('flex gap-3', compact ? 'flex-col sm:flex-row sm:items-center' : 'flex-col')}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-[#7aab65]">{displayName(order)}</span>
            <span className="rounded-full bg-[#eaf1e4] px-2 py-1 text-[10px] font-black text-[#7aab65]">
              {(order.service === 'pickup' ? STORE_GROCERS_LIVE.servicePickupAr : STORE_GROCERS_LIVE.serviceDeliveryAr)}
            </span>
          </div>
          <p className="mt-1 font-black text-[#20352b]">{displayPhone(order)}</p>
          {order.place ? <p className="mt-1 text-xs text-[#849284]">{displayPlace(order)}</p> : null}
          {!maskPii && order.facadeSrc ? (
            <img src={order.facadeSrc} alt="" className="mt-2 h-20 w-28 rounded-lg object-cover" />
          ) : null}
          <p className="mt-2 text-sm font-bold text-[#20352b]">
            {order.lines.map((line) => `${line.nameAr}×${line.qty}`).join(' · ')}
          </p>
        </div>
        <div className={cn('flex items-center justify-between gap-3', compact && 'sm:flex-col sm:items-end')}>
          <span className="font-black text-[#7aab65]">
            {order.total} ر.س · {order.pay === 'card' ? STORE_GROCERS_LIVE.payCardAr : STORE_GROCERS_LIVE.payCashAr}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <a
              className="inline-flex size-8 items-center justify-center rounded-lg bg-[#eaf1e4] text-[#7aab65] hover:bg-[#dfeeda]"
              href={`https://wa.me/?text=${encodeURIComponent(grocersWhatsAppText(order, shopName, mapsUrl))}`}
              target="_blank"
              rel="noreferrer"
              aria-label={STORE_GROCERS_LIVE.whatsappReceiptAr}
            >
              <ArrowLeft size={15} className="rotate-180" />
            </a>
            <StoreDeskTicketActions
              order={order}
              accent={STORE_GROCERS_LIVE_ACCENT}
              onReceive={onReceive}
              onFinish={onFinish}
            />
          </div>
        </div>
      </div>
      {!compact && phase === 'received' ? (
        <p className="mt-2 text-[10px] font-bold text-[#849284]">{STORE_DESK_ORDER_TICKET_COPY.receivedLaneAr}</p>
      ) : null}
    </div>
  );
}

function OverviewSection({
  fresh,
  working,
  featuredCount,
  presenceCount,
  maskPii,
  todaySalesTotal,
  vendorLabel,
  flashAr,
  onFlashChange,
  shopUrl,
  onGoOrders,
  onGoLocation,
  onReceive,
  onFinish,
  shopName,
  mapsUrl,
  alertRef,
  alertSlot,
}: {
  fresh: GrocersOrder[];
  working: GrocersOrder[];
  featuredCount: number;
  presenceCount: number;
  maskPii: boolean;
  todaySalesTotal: number;
  vendorLabel: string;
  flashAr: string;
  onFlashChange: (value: string) => void;
  shopUrl: string;
  onGoOrders: () => void;
  onGoLocation: () => void;
  onReceive: (id: string) => void;
  onFinish: (id: string) => void;
  shopName: string;
  mapsUrl: string;
  alertRef: React.RefObject<HTMLDivElement | null>;
  alertSlot: ReactNode;
}) {
  return (
    <>
      <div ref={alertRef} className="mb-6">
        {alertSlot}
      </div>

      <PageHeading
        eyebrow="لوحة اليوم"
        title="كاشيرك، طلباتك، وموقعك — واضحين"
        copy="تمويناتا1 يعمل بنفس سرعة السوق: شوف الجديد، استلم الطلب، وخلّ الجار يعرف أين أنت."
        action={
          <a
            href={shopUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#d4dfcc] bg-[#fffdf5] px-4 text-sm font-bold text-[#5f705f] hover:bg-[#eef4e9]"
          >
            معاينة المتجر
            <ArrowLeft size={15} />
          </a>
        }
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="طلبات جديدة" value={String(fresh.length)} hint="تحتاج استلام" tone="green" />
        <Metric label={STORE_GROCERS_LIVE.presenceDeskLabelAr} value={String(presenceCount)} hint="متصفحون الآن" tone="blue" />
        <Metric label="الأكثر طلباً" value={String(featuredCount)} hint="أصناف مميزة" tone="gold" />
        <Metric label="إجمالي اليوم" value={`${todaySalesTotal} ر.س`} hint="طلبات اليوم" tone="olive" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <section className="rounded-2xl border border-[#dfe4d6] bg-[#fffdf5] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[0.13em] text-[#7aab65]">الطلبات الجديدة</p>
              <h3 className="mt-1 text-lg font-black text-[#20352b]">استلمها قبل أن تبرد</h3>
            </div>
            <Button
              type="button"
              onClick={onGoOrders}
              className="h-9 rounded-full bg-transparent px-3 text-xs font-black text-[#7aab65] shadow-none hover:bg-[#eef4e9]"
            >
              كل الطلبات
              <ArrowLeft size={14} />
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {fresh.slice(0, 2).map((order) => (
              <OrderTicketCard
                key={order.id}
                order={order}
                maskPii={maskPii}
                compact
                shopName={shopName}
                mapsUrl={mapsUrl}
                onReceive={() => onReceive(order.id)}
                onFinish={() => onFinish(order.id)}
              />
            ))}
            {!fresh.length ? (
              <div className="rounded-xl border border-dashed border-[#cbd8c2] p-8 text-center text-sm text-[#849284]">
                لا طلبات جديدة الآن.
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl bg-[#20352b] p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.13em] text-[#d8f0cc]">الموقع والتشغيل</p>
              <h3 className="mt-1 text-lg font-black">{vendorLabel}</h3>
            </div>
            <MapPin size={21} className="text-[#d8f0cc]" />
          </div>
          <p className="mt-4 text-xs leading-6 text-[#c4dcc1]">حدّث موقع المحل أو العربة وساعات العمل من قسم الموقع.</p>
          <Button
            type="button"
            onClick={onGoLocation}
            className="mt-4 h-10 w-full rounded-xl border-0 bg-[#d8f0cc] text-xs font-black text-[#27472c] shadow-none hover:bg-white"
          >
            إدارة الموقع والساعات
            <ArrowLeft size={14} />
          </Button>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-[#dfe4d6] bg-[#fffdf5] p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-[0.13em] text-[#7aab65]">عرض الفلاش</p>
            <p className="mt-1 text-sm text-[#758374]">يظهر مباشرة أعلى صفحة العميل.</p>
            <label className="mt-4 block text-xs font-bold text-[#647463]">
              {STORE_GROCERS_LIVE.flashLabelAr}
              <Textarea
                value={flashAr}
                onChange={(event) => onFlashChange(event.target.value)}
                placeholder={STORE_GROCERS_LIVE.flashHintAr}
                className="mt-2 min-h-20 border-[#d4dfcc] bg-white text-sm"
              />
            </label>
          </div>
        </div>
      </section>

      {working.length ? (
        <section className="mt-6 rounded-2xl border border-[#dfe4d6] bg-[#fffdf5] p-5">
          <h3 className="font-black text-[#20352b]">{STORE_DESK_ORDER_TICKET_COPY.receivedLaneAr}</h3>
          <div className="mt-4 space-y-3">
            {working.slice(0, 2).map((order) => (
              <OrderTicketCard
                key={order.id}
                order={order}
                shopName={shopName}
                mapsUrl={mapsUrl}
                onReceive={() => onReceive(order.id)}
                onFinish={() => onFinish(order.id)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function OrdersSection({
  fresh,
  working,
  maskPii,
  onReceive,
  onFinish,
  shopName,
  mapsUrl,
  chatSlot,
  archiveSlot,
}: {
  fresh: GrocersOrder[];
  working: GrocersOrder[];
  maskPii: boolean;
  onReceive: (id: string) => void;
  onFinish: (id: string) => void;
  shopName: string;
  mapsUrl: string;
  chatSlot: ReactNode;
  archiveSlot: ReactNode;
}) {
  return (
    <>
      <PageHeading
        eyebrow="الطلبات"
        title="مساران واضحان، ولا طلب يضيع"
        copy="استلم التذكرة، تواصل مع العميل، ثم أنهِها عندما يخرج الطلب."
      />

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <OrderLane
          maskPii={maskPii}
          title={STORE_DESK_ORDER_TICKET_COPY.newLaneAr}
          items={fresh}
          shopName={shopName}
          mapsUrl={mapsUrl}
          onReceive={onReceive}
          onFinish={onFinish}
        />
        <OrderLane
          maskPii={maskPii}
          title={STORE_DESK_ORDER_TICKET_COPY.receivedLaneAr}
          items={working}
          shopName={shopName}
          mapsUrl={mapsUrl}
          onReceive={onReceive}
          onFinish={onFinish}
        />
      </div>

      <div className="mt-6">{chatSlot}</div>

      <section className="mt-5 rounded-2xl border border-[#dfe4d6] bg-[#fffdf5] p-5">{archiveSlot}</section>
    </>
  );
}

function OrderLane({
  title,
  items,
  maskPii,
  shopName,
  mapsUrl,
  onReceive,
  onFinish,
}: {
  title: string;
  items: GrocersOrder[];
  maskPii: boolean;
  shopName: string;
  mapsUrl: string;
  onReceive: (id: string) => void;
  onFinish: (id: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-[#dfe4d6] bg-[#fffdf5] p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-[#20352b]">{title}</h3>
        <span className="rounded-full bg-[#eaf1e4] px-2 py-1 text-[10px] font-black text-[#7aab65]">{items.length}</span>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((order) => (
          <OrderTicketCard
            key={order.id}
            order={order}
            maskPii={maskPii}
            shopName={shopName}
            mapsUrl={mapsUrl}
            onReceive={() => onReceive(order.id)}
            onFinish={() => onFinish(order.id)}
          />
        ))}
        {!items.length ? (
          <div className="rounded-xl border border-dashed border-[#cbd8c2] p-8 text-center text-sm text-[#849284]">
            لا توجد طلبات هنا الآن.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ProductsSection({
  shelf,
  onToggleStock,
  ingestSlot,
}: {
  shelf: GrocersLabState['shelf'];
  onToggleStock: (id: string) => void;
  ingestSlot: ReactNode;
}) {
  return (
    <>
      <PageHeading
        eyebrow="المنتجات والمخزون"
        title="حدّث الرف من مكان واحد"
        copy="إيقاف الصنف، وإدخال مجموعة سلع دفعة واحدة."
      />

      <div className="mt-7 rounded-2xl border border-[#dfe4d6] bg-[#fffdf5] p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {shelf.map((item) => (
            <div key={item.catalogId} className="flex items-center gap-3 rounded-xl border border-[#dfe7d9] bg-white p-4">
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl',
                  !item.inStock
                      ? 'bg-[#f8e3e7] text-[#a15e55]'
                      : 'bg-[#f7edd3] text-[#9a741d]',
                )}
              >
                <Package size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn('font-black text-[#20352b]', !item.inStock && 'text-[#849284] line-through')}>
                  {item.nameAr}
                </p>
                <p className="mt-1 text-xs text-[#849284]">
                  {item.price} ر.س
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                <Button
                  type="button"
                  onClick={() => onToggleStock(item.catalogId)}
                  className="h-8 rounded-lg bg-transparent px-2 text-[10px] font-black text-[#a15e55] shadow-none hover:bg-[#f8e3e7]"
                >
                  {item.inStock ? STORE_GROCERS_LIVE.stockOnAr : STORE_GROCERS_LIVE.stockOffAr}
                </Button>
                {item.featured ? (
                  <span className="h-8 rounded-lg bg-[#eaf4e4] px-2 text-[10px] font-black leading-8 text-[#7aab65]">الأكثر طلباً</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-[#dfe4d6] bg-[#fffdf5] p-5">
        <h3 className="font-black text-[#20352b]">{STORE_GROCERS_LIVE.ingestTitleAr}</h3>
        <div className="mt-4">{ingestSlot}</div>
      </section>
    </>
  );
}

function LocationSection({
  vendorLabel,
  placeSlot,
  hoursSlot,
}: {
  vendorLabel: string;
  placeSlot: ReactNode;
  hoursSlot: ReactNode;
}) {
  return (
    <>
      <PageHeading
        eyebrow="الموقع والساعات"
        title="خلّي الوصول واضحاً"
        copy="عرض النمط الحالي للقراءة فقط، وتحديث الموقع وساعات العمل من الأدوات الحقيقية."
      />

      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d4dfcc] bg-[#fffdf5] px-4 py-2 text-xs font-bold text-[#5f705f]">
        <Clock3 size={15} className="text-[#7aab65]" />
        نمط التشغيل: {vendorLabel} — للقراءة فقط
      </div>

      <div className="grid gap-6">
        {placeSlot}
        {hoursSlot}
      </div>
    </>
  );
}

function PaymentSection({ paySlot }: { paySlot: ReactNode }) {
  return (
    <>
      <PageHeading
        eyebrow="الدفع المباشر"
        title="اجعل التحويل بسيطاً"
        copy="التعليمات تظهر بعد إرسال الطلب، مع التحقّقات الكاملة وحفظ حقيقي على الخادم."
      />
      <div className="mt-7 rounded-2xl border border-[#dfe4d6] bg-[#fffdf5] p-5">{paySlot}</div>
    </>
  );
}

function ToolsSection({
  flashAr,
  onFlashChange,
  identitySlot,
  backgroundSlot,
  shareSlot,
}: {
  flashAr: string;
  onFlashChange: (value: string) => void;
  identitySlot: ReactNode;
  backgroundSlot: ReactNode;
  shareSlot: ReactNode;
}) {
  return (
    <>
      <PageHeading
        eyebrow="أدوات المشاركة"
        title="خلّي الوصول أسهل"
        copy="هوية المتجر، ملصق QR، وعرض الفلاش — كلها من نفس الأدوات الحقيقية."
      />

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#dfe4d6] bg-[#fffdf5] p-5">{shareSlot}</section>
        <section className="rounded-2xl border border-[#dfe4d6] bg-[#fffdf5] p-5">
          <h3 className="font-black text-[#20352b]">{STORE_GROCERS_LIVE.flashLabelAr}</h3>
          <p className="mt-2 text-sm leading-6 text-[#758374]">رسالة قصيرة تظهر أعلى المتجر.</p>
          <Textarea
            value={flashAr}
            onChange={(event) => onFlashChange(event.target.value)}
            placeholder={STORE_GROCERS_LIVE.flashHintAr}
            className="mt-5 min-h-24 border-[#d4dfcc] bg-white"
          />
        </section>
      </div>

      <section className="mt-6 space-y-6 rounded-2xl border border-[#dfe4d6] bg-[#fffdf5] p-5">
        {identitySlot}
        {backgroundSlot}
      </section>
    </>
  );
}
