/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة تشغيل تمرتنا1 — هيكل Chatly مع منطق halaqmap الحقيقي.
 */
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  Bell,
  Clipboard,
  FileText,
  Settings,
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
import { STORE_DATES_LIVE, STORE_DATES_LIVE_ACCENT } from '@/config/storeDatesLive';
import { STORE_SHOP_HOURS_COPY } from '@/config/storeShopHours';
import { STORE_SHOP_PRESENCE_LABEL_AR } from '@/config/storeShopPresence';
import { datesServiceLabelAr, datesWhatsAppText, type DatesLabState, type DatesOrder } from '@/lib/storeDatesLiveLab';
import { StoreDeskOrderAlert } from '@/components/store/StoreDeskOrderAlert';
import { StoreDeskControlTitle } from '@/components/store/StoreDeskControlTitle';
import { StoreDatesIngest } from '@/components/store/StoreDatesIngest';
import { StoreDatesDeskChat } from '@/components/store/StoreDatesChat';
import { StoreDeskArchiveDock } from '@/components/store/StoreDeskArchiveDock';
import { StoreDeskTicketActions } from '@/components/store/StoreDeskTicketActions';
import { STORE_PRODUCT_TRIAL_PRODUCTS } from '@/config/storeProductTrial';
import { STORE_DESK_ORDER_TICKET_COPY } from '@/config/storeDeskOrderTicket';
import { applyDeskFinish, deskOrderPhase, isLiveDeskTicket, receiveDeskTicket } from '@/lib/storeDeskOrderTicket';
import { StoreShopHoursDesk } from '@/components/store/StoreShopHoursDesk';
import { StoreShopPlaceDesk } from '@/components/store/StoreShopPlaceDesk';
import { StoreDeskHelpSupport } from '@/components/store/StoreDeskHelpSupport';
import { StoreDeskGuideLink } from '@/components/store/StoreDeskGuideLink';
import { StoreDeskCornerDock } from '@/components/store/StoreDeskCornerNav';
import { StoreShopIdentityDesk } from '@/components/store/StoreShopIdentityDesk';
import { StoreDeskSaveStatusLine } from '@/components/store/StoreDeskSaveStatusLine';
import type { StoreLiveDeskSaveStatus } from '@/lib/storeLiveDeskSync';
import { StoreShopBackgroundDesk } from '@/components/store/StoreShopBackgroundDesk';
import { STORE_DATES_SUPPORT } from '@/config/storeProductSupport';
import { StoreDirectPayDesk } from '@/components/store/StoreDirectPayDesk';
import { DatesTamratnaMark } from '@/components/store/dates/DatesTamratnaMark';
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

export function DatesChatlyDesk({
  state,
  onChange,
  shopUrl,
  token,
  showTrialNote = false,
  saveStatus = 'idle',
}: {
  state: DatesLabState;
  onChange: (next: DatesLabState) => void;
  shopUrl: string;
  token: string;
  showTrialNote?: boolean;
  saveStatus?: StoreLiveDeskSaveStatus;
}) {
  const [section, setSection] = useState<DeskSection>('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [alertNode, setAlertNode] = useState<HTMLDivElement | null>(null);

  const live = state.orders.filter(isLiveDeskTicket);
  const fresh = live.filter((item) => deskOrderPhase(item) === 'new');
  const working = live.filter((item) => deskOrderPhase(item) === 'received');
  const presenceCount = useStoreShopPresence({
    role: 'desk',
    productTag: 'store_dates_live',
    token,
    enabled: Boolean(token),
  });

  const todaySalesTotal = useMemo(() => {
    const all: DatesOrder[] = [...state.orders, ...state.orderArchive];
    return all.filter((order) => orderIsToday(order.at)).reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  }, [state.orders, state.orderArchive]);

  const arrivedCount = state.shelf.filter((item) => item.arrivedToday).length;

  function receiveOrder(id: string) {
    onChange({ ...state, orders: receiveDeskTicket(state.orders, id) });
  }

  function finishOrder(id: string) {
    const next = applyDeskFinish(state.orders, state.orderArchive, id, 'dates');
    onChange({ ...state, orders: next.orders, orderArchive: next.orderArchive });
  }

  function toggleStock(catalogId: string) {
    onChange({
      ...state,
      shelf: state.shelf.map((item) => (item.catalogId === catalogId ? { ...item, inStock: !item.inStock } : item)),
    });
  }

  function toggleArrived(catalogId: string) {
    onChange({
      ...state,
      shelf: state.shelf.map((item) => (item.catalogId === catalogId ? { ...item, arrivedToday: !item.arrivedToday } : item)),
    });
  }

  function toggleAcceptingOrders() {
    onChange({ ...state, host: { ...state.host, acceptingOrders: !state.host.acceptingOrders } });
  }

  function goOverviewAlert() {
    setSection('overview');
    setMobileNav(false);
    window.requestAnimationFrame(() => {
      alertNode?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const nav: { key: DeskSection; label: string; icon: typeof Store; badge?: number }[] = [
    { key: 'overview', label: 'نظرة عامة', icon: Store },
    { key: 'orders', label: 'الطلبات', icon: ShoppingBag, badge: fresh.length || undefined },
    { key: 'products', label: 'الأصناف والمخزون', icon: Package },
    { key: 'location', label: 'الموقع وساعات العمل', icon: MapPin },
    { key: 'payment', label: 'الدفع المباشر', icon: Clipboard },
    { key: 'tools', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <main dir="rtl" className="dates-chatly-desk-root min-h-dvh bg-[#e8dcc8] pb-16 text-[#2a2016]">
      <div className="grid min-h-dvh lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-[min(280px,88vw)] flex-col border-l border-[#dac8aa] bg-[#f9f4ea] p-5 transition-transform lg:static lg:z-auto lg:w-auto lg:translate-x-0',
            mobileNav ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0',
          )}
        >
          <div className="flex items-center justify-between border-b border-[#dac8aa] pb-6 lg:block">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#f3e6cf] text-[#6f4a26]">
                <DatesTamratnaMark size="sm" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#8a6239]">مساحة التشغيل</p>
                <p className="text-lg font-black">{STORE_DATES_LIVE.titleAr}</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setMobileNav(false)}
              className="size-9 rounded-full bg-[#f3e6cf] p-0 text-[#6f4a26] shadow-none lg:hidden"
              aria-label="إغلاق القائمة"
            >
              <X size={16} />
            </Button>
          </div>

          <div className="mt-6 rounded-2xl bg-[#2a2016] p-4 text-white">
            <p className="text-xs text-[#f3e6cf]">حالة النشاط</p>
            <p className="mt-2 text-lg font-black">{state.host.shopName}</p>
            <p className="mt-1 text-[11px] text-[#e9dcc0]">
              {state.host.acceptingOrders ? 'يستقبل الطلبات الآن' : 'الاستقبال متوقف'}
            </p>
            <StoreDeskSaveStatusLine status={saveStatus} />
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
                    ? 'bg-[#f3e6cf] text-[#6f4a26] hover:bg-[#ecdcc0]'
                    : 'bg-transparent text-[#8a7c66] hover:bg-[#f2ebdd]',
                )}
              >
                <Icon size={17} />
                {label}
                {badge ? (
                  <span className="mr-auto flex size-5 items-center justify-center rounded-full bg-[#8a6239] text-[10px] text-white">
                    {badge}
                  </span>
                ) : null}
              </Button>
            ))}

            <div className="my-4 h-px bg-[#dac8aa]" />

            <Link
              to={ROUTE_PATHS.STORE_DATES_SUPPORT}
              onClick={() => setMobileNav(false)}
              className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-[#8a7c66] hover:bg-[#f2ebdd] hover:text-[#6f4a26]"
              title={STORE_DATES_SUPPORT.deskLeadAr}
            >
              <FileText size={17} />
              {STORE_DATES_SUPPORT.landingCtaAr}
            </Link>

            <Button
              type="button"
              onClick={() => {
                setSection('orders');
                setMobileNav(false);
              }}
              className="h-11 justify-start gap-3 rounded-xl bg-transparent px-3 text-sm font-bold text-[#8a7c66] shadow-none hover:bg-[#f2ebdd]"
            >
              <Archive size={17} />
              {STORE_DESK_ORDER_TICKET_COPY.archiveTitleAr}
            </Button>
          </nav>

          <a
            href={shopUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center gap-3 border-t border-[#dac8aa] px-1 pt-5 text-sm font-bold text-[#8a7c66] hover:text-[#6f4a26]"
          >
            <Store size={17} />
            {STORE_DATES_LIVE.shopLinkAr}
            <ArrowLeft size={14} className="mr-auto" />
          </a>
        </aside>

        {mobileNav ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[#2a2016]/40 lg:hidden"
            aria-label="إغلاق القائمة"
            onClick={() => setMobileNav(false)}
          />
        ) : null}

        <section className="min-w-0">
          <header className="dates-chatly-desk-header">
            <div className="dates-chatly-desk-header__top">
              <div className="dates-chatly-desk-header__start">
                <Button
                  type="button"
                  onClick={() => setMobileNav(true)}
                  className="size-10 shrink-0 rounded-full bg-[#f3e6cf] p-0 text-[#6f4a26] shadow-none lg:hidden"
                  aria-label="فتح القائمة"
                >
                  <Menu size={18} />
                </Button>
                <StoreBrandMark className="dates-chatly-desk-header__brand" />
                <div className="dates-chatly-desk-header__title-block min-w-0">
                  <p className="text-xs font-bold text-[#8a7c66]">ملخص اليوم</p>
                  <StoreDeskControlTitle trialNote="" />
                </div>
              </div>
              <div className="dates-chatly-desk-header__actions">
                <Button
                  type="button"
                  onClick={toggleAcceptingOrders}
                  className={cn(
                    'inline-flex h-10 max-w-[11rem] items-center gap-2 rounded-full border px-3 text-xs font-bold shadow-none sm:max-w-none',
                    state.host.acceptingOrders
                      ? 'border-[#dac8aa] bg-white text-[#8a6239] hover:bg-[#f2ebdd]'
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
                  className="relative size-10 rounded-full border border-[#dac8aa] bg-white p-0 text-[#8a7c66] shadow-none hover:bg-[#f2ebdd]"
                >
                  <Bell size={17} />
                  {fresh.length ? (
                    <span className="absolute -left-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#8a6239] text-[9px] font-black text-white">
                      {fresh.length}
                    </span>
                  ) : null}
                </Button>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#8a6239] text-sm font-black text-white">
                  <DatesTamratnaMark inverse size="sm" />
                </div>
              </div>
            </div>
            {showTrialNote ? (
              <p className="dates-chatly-desk-header__trial-note" role="note">
                {STORE_PRODUCT_TRIAL_PRODUCTS.dates.deskNoteAr}
              </p>
            ) : null}
          </header>

          <div className="p-4 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-[1420px]">
              {section === 'overview' ? (
                <OverviewSection
                  fresh={fresh}
                  working={working}
                  arrivedCount={arrivedCount}
                  presenceCount={presenceCount}
                  todaySalesTotal={todaySalesTotal}
                  flashAr={state.host.flashAr}
                  onFlashChange={(flashAr) => onChange({ ...state, host: { ...state.host, flashAr } })}
                  shopUrl={shopUrl}
                  onGoOrders={() => setSection('orders')}
                  onGoLocation={() => setSection('location')}
                  onReceive={receiveOrder}
                  onFinish={finishOrder}
                  shopName={state.host.shopName}
                  vendorMode={state.host.vendorMode}
                  pickupMapsUrl={state.host.vendorMode === 'mobile' ? state.host.pickupMapsUrl : ''}
                  alertRef={setAlertNode}
                  alertSlot={
                    <StoreDeskOrderAlert
                      product="dates"
                      token={token}
                      shopName={state.host.shopName}
                      orderIds={fresh.map((item) => item.id)}
                      unreadCount={fresh.length}
                    />
                  }
                  chatSlot={<StoreDatesDeskChat state={state} onChange={onChange} theme="light" />}
                />
              ) : null}

              {section === 'orders' ? (
                <OrdersSection
                  fresh={fresh}
                  working={working}
                  onReceive={receiveOrder}
                  onFinish={finishOrder}
                  shopName={state.host.shopName}
                  vendorMode={state.host.vendorMode}
                  pickupMapsUrl={state.host.vendorMode === 'mobile' ? state.host.pickupMapsUrl : ''}
                  archiveSlot={
                    <StoreDeskArchiveDock
                      tickets={state.orderArchive}
                      accent={STORE_DATES_LIVE_ACCENT}
                      filename="dates-archive.json"
                    />
                  }
                />
              ) : null}

              {section === 'products' ? (
                <ProductsSection
                  shelf={state.shelf}
                  onToggleStock={toggleStock}
                  onToggleArrived={toggleArrived}
                  ingestSlot={<StoreDatesIngest state={state} onChange={onChange} />}
                />
              ) : null}

              {section === 'location' ? (
                <LocationSection
                  placeSlot={
                    <StoreShopPlaceDesk
                      value={state.host}
                      onChange={(place) => onChange({ ...state, host: { ...state.host, ...place } })}
                      copy={STORE_DATES_LIVE}
                      accent={STORE_DATES_LIVE_ACCENT}
                    />
                  }
                  hoursSlot={
                    <StoreShopHoursDesk
                      value={state.host}
                      onChange={(nextHours) => onChange({ ...state, host: { ...state.host, ...nextHours } })}
                      accent={STORE_DATES_LIVE_ACCENT}
                      theme="light"
                    />
                  }
                />
              ) : null}

              {section === 'payment' ? (
                <PaymentSection
                  paySlot={<StoreDirectPayDesk product="store_dates_live" token={token} accent={STORE_DATES_LIVE_ACCENT} />}
                />
              ) : null}

              {section === 'tools' ? (
                <ToolsSection
                  flashAr={state.host.flashAr}
                  onFlashChange={(flashAr) => onChange({ ...state, host: { ...state.host, flashAr } })}
                  identitySlot={
                    <StoreShopIdentityDesk
                      shopNameLabel={STORE_DATES_LIVE.shopNameLabelAr}
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
                      accent={STORE_DATES_LIVE_ACCENT}
                      fieldClassName="dates-field"
                    />
                  }
                  backgroundSlot={
                    <StoreShopBackgroundDesk
                      value={{ shopHeaderBg: state.host.shopHeaderBg, shopPageBg: state.host.shopPageBg }}
                      onChange={(bg) => onChange({ ...state, host: { ...state.host, ...bg } })}
                      accent={STORE_DATES_LIVE_ACCENT}
                      fieldClassName="dates-field"
                    />
                  }
                  shareSlot={
                    <StoreLiveShopShareDesk
                      kind="dates"
                      token={token}
                      shopName={state.host.shopName}
                      shopUrl={shopUrl}
                      qrPhraseAr={STORE_DATES_LIVE.qrPhraseAr}
                      qrPrintAr={STORE_DATES_LIVE.qrPrintAr}
                      accent={STORE_DATES_LIVE_ACCENT}
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
          to={ROUTE_PATHS.STORE_DATES_SUPPORT}
          leadAr={STORE_DATES_SUPPORT.deskLeadAr}
          labelAr={STORE_DATES_SUPPORT.landingCtaAr}
        />
        <StoreDeskHelpSupport product="dates" />
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
        <p className="text-xs font-bold tracking-[0.16em] text-[#8a6239]">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#2e2418] sm:text-4xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#79674f]">{copy}</p>
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
      ? 'bg-[#f3e6cf] text-[#8a6239]'
      : tone === 'blue'
        ? 'bg-[#e3edf5] text-[#3d6b8a]'
        : tone === 'gold'
          ? 'bg-[#f7edd3] text-[#9a741d]'
          : 'bg-[#eef0e3] text-[#5f705f]';

  return (
    <div className="rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-4">
      <p className="text-xs font-bold text-[#8a7c66]">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#2e2418]">{value}</p>
      <p className={cn('mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-black', toneClass)}>{hint}</p>
    </div>
  );
}

function OrderTicketCard({
  order,
  onReceive,
  onFinish,
  shopName,
  vendorMode,
  pickupMapsUrl,
  compact = false,
}: {
  order: DatesOrder;
  onReceive: () => void;
  onFinish: () => void;
  shopName: string;
  vendorMode: 'fixed' | 'mobile';
  pickupMapsUrl: string;
  compact?: boolean;
}) {
  const phase = deskOrderPhase(order);
  return (
    <div className="store-desk-ticket-card rounded-xl border border-[#e6d7bc] bg-white p-4">
      <div className={cn('flex gap-3', compact ? 'flex-col sm:flex-row sm:items-center' : 'flex-col')}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-[#8a6239]">{order.name} · {order.phone}</span>
            <span className="rounded-full bg-[#f3e6cf] px-2 py-1 text-[10px] font-black text-[#8a6239]">
              {datesServiceLabelAr(order.service)}
            </span>
          </div>
          {order.place ? <p className="mt-1 text-xs text-[#8a7c66]">{order.place}</p> : null}
          <p className="mt-2 text-sm font-bold text-[#2e2418]">
            {order.lines.length
              ? order.lines.map((line) => `${line.nameAr}×${line.qty}`).join(' · ')
              : order.service === 'come'
                ? 'تسوق حر من الصندوق'
                : ''}
          </p>
        </div>
        <div className={cn('flex items-center justify-between gap-3', compact && 'sm:flex-col sm:items-end')}>
          <span className="font-black text-[#8a6239]">
            {order.total} ر.س · {order.pay === 'card' ? STORE_DATES_LIVE.payCardAr : STORE_DATES_LIVE.payCashAr}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <a
              className="inline-flex size-8 items-center justify-center rounded-lg bg-[#f3e6cf] text-[#8a6239] hover:bg-[#ecdcc0]"
              href={`https://wa.me/?text=${encodeURIComponent(datesWhatsAppText(order, shopName, vendorMode === 'mobile' ? pickupMapsUrl : ''))}`}
              target="_blank"
              rel="noreferrer"
              aria-label={STORE_DATES_LIVE.whatsappReceiptAr}
            >
              <ArrowLeft size={15} className="rotate-180" />
            </a>
            <StoreDeskTicketActions order={order} accent={STORE_DATES_LIVE_ACCENT} onReceive={onReceive} onFinish={onFinish} />
          </div>
        </div>
      </div>
      {!compact && phase === 'received' ? (
        <p className="mt-2 text-[10px] font-bold text-[#8a7c66]">{STORE_DESK_ORDER_TICKET_COPY.receivedLaneAr}</p>
      ) : null}
    </div>
  );
}

function OverviewSection({
  fresh,
  working,
  arrivedCount,
  presenceCount,
  todaySalesTotal,
  flashAr,
  onFlashChange,
  shopUrl,
  onGoOrders,
  onGoLocation,
  onReceive,
  onFinish,
  shopName,
  vendorMode,
  pickupMapsUrl,
  alertRef,
  alertSlot,
  chatSlot,
}: {
  fresh: DatesOrder[];
  working: DatesOrder[];
  arrivedCount: number;
  presenceCount: number;
  todaySalesTotal: number;
  flashAr: string;
  onFlashChange: (value: string) => void;
  shopUrl: string;
  onGoOrders: () => void;
  onGoLocation: () => void;
  onReceive: (id: string) => void;
  onFinish: (id: string) => void;
  shopName: string;
  vendorMode: 'fixed' | 'mobile';
  pickupMapsUrl: string;
  alertRef: (node: HTMLDivElement | null) => void;
  alertSlot: ReactNode;
  chatSlot: ReactNode;
}) {
  return (
    <>
      <div ref={alertRef} className="mb-6">
        {alertSlot}
      </div>

      <PageHeading
        eyebrow="لوحة اليوم"
        title="الطلبات، أصنافك، وموقع الصندوق — واضحين"
        copy="تمرتنا1 يجمع أصناف اليوم والطلبات والموقع في مكان واحد."
        action={
          <a
            href={shopUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#dac8aa] bg-[#f9f4ea] px-4 text-sm font-bold text-[#5f705f] hover:bg-[#f3e6cf]"
          >
            معاينة الصفحة
            <ArrowLeft size={15} />
          </a>
        }
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="طلبات جديدة" value={String(fresh.length)} hint="تحتاج استلام" tone="green" />
        <Metric label={STORE_SHOP_PRESENCE_LABEL_AR} value={String(presenceCount)} hint="متصفحون الآن" tone="blue" />
        <Metric label={STORE_DATES_LIVE.todayTitleAr} value={String(arrivedCount)} hint="صنف وصل اليوم" tone="gold" />
        <Metric label="إجمالي اليوم" value={`${todaySalesTotal} ر.س`} hint="طلبات اليوم" tone="olive" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <section className="rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[0.13em] text-[#8a6239]">الطلبات الجديدة</p>
              <h3 className="mt-1 text-lg font-black text-[#2e2418]">استلمها بسرعة</h3>
            </div>
            <Button
              type="button"
              onClick={onGoOrders}
              className="h-9 rounded-full bg-transparent px-3 text-xs font-black text-[#8a6239] shadow-none hover:bg-[#f3e6cf]"
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
                compact
                shopName={shopName}
                vendorMode={vendorMode}
                pickupMapsUrl={pickupMapsUrl}
                onReceive={() => onReceive(order.id)}
                onFinish={() => onFinish(order.id)}
              />
            ))}
            {!fresh.length ? (
              <div className="rounded-xl border border-dashed border-[#e6d7bc] p-8 text-center text-sm text-[#8a7c66]">
                لا طلبات جديدة الآن.
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl bg-[#2a2016] p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.13em] text-[#f3e6cf]">الموقع وساعات العمل</p>
              <h3 className="mt-1 text-lg font-black">موقع الصندوق والمسار المتحرك</h3>
            </div>
            <MapPin size={21} className="text-[#f3e6cf]" />
          </div>
          <p className="mt-4 text-xs leading-6 text-[#e9dcc0]">حدّث موقع الصندوق وجدول الأسبوع من قسم الموقع وساعات العمل.</p>
          <Button
            type="button"
            onClick={onGoLocation}
            className="mt-4 h-10 w-full rounded-xl border-0 bg-[#f3e6cf] text-xs font-black text-[#472e12] shadow-none hover:bg-white"
          >
            إدارة الموقع والساعات
            <ArrowLeft size={14} />
          </Button>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-[0.13em] text-[#8a6239]">شريط وصل اليوم</p>
            <p className="mt-1 text-sm text-[#79674f]">يظهر مباشرة أعلى صفحة جار الحي.</p>
            <label className="mt-4 block text-xs font-bold text-[#6f4a26]">
              {STORE_DATES_LIVE.flashLabelAr}
              <Textarea
                value={flashAr}
                onChange={(event) => onFlashChange(event.target.value)}
                placeholder={STORE_DATES_LIVE.flashHintAr}
                className="mt-2 min-h-20 border-[#dac8aa] bg-white text-sm"
              />
            </label>
          </div>
        </div>
      </section>

      {working.length ? (
        <section className="mt-6 rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5">
          <h3 className="font-black text-[#2e2418]">{STORE_DESK_ORDER_TICKET_COPY.receivedLaneAr}</h3>
          <div className="mt-4 space-y-3">
            {working.slice(0, 2).map((order) => (
              <OrderTicketCard
                key={order.id}
                order={order}
                shopName={shopName}
                vendorMode={vendorMode}
                pickupMapsUrl={pickupMapsUrl}
                onReceive={() => onReceive(order.id)}
                onFinish={() => onFinish(order.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-6">{chatSlot}</div>
    </>
  );
}

function OrdersSection({
  fresh,
  working,
  onReceive,
  onFinish,
  shopName,
  vendorMode,
  pickupMapsUrl,
  archiveSlot,
}: {
  fresh: DatesOrder[];
  working: DatesOrder[];
  onReceive: (id: string) => void;
  onFinish: (id: string) => void;
  shopName: string;
  vendorMode: 'fixed' | 'mobile';
  pickupMapsUrl: string;
  archiveSlot: ReactNode;
}) {
  return (
    <>
      <PageHeading
        eyebrow="الطلبات"
        title="مساران واضحان، ولا طلب يضيع"
        copy="استلم التذكرة، وأنهِها بعد التسليم أو الاستلام."
      />

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <OrderLane
          title={STORE_DESK_ORDER_TICKET_COPY.newLaneAr}
          items={fresh}
          shopName={shopName}
          vendorMode={vendorMode}
          pickupMapsUrl={pickupMapsUrl}
          onReceive={onReceive}
          onFinish={onFinish}
        />
        <OrderLane
          title={STORE_DESK_ORDER_TICKET_COPY.receivedLaneAr}
          items={working}
          shopName={shopName}
          vendorMode={vendorMode}
          pickupMapsUrl={pickupMapsUrl}
          onReceive={onReceive}
          onFinish={onFinish}
        />
      </div>

      <section className="mt-5 rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5">{archiveSlot}</section>
    </>
  );
}

function OrderLane({
  title,
  items,
  shopName,
  vendorMode,
  pickupMapsUrl,
  onReceive,
  onFinish,
}: {
  title: string;
  items: DatesOrder[];
  shopName: string;
  vendorMode: 'fixed' | 'mobile';
  pickupMapsUrl: string;
  onReceive: (id: string) => void;
  onFinish: (id: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-[#2e2418]">{title}</h3>
        <span className="rounded-full bg-[#f3e6cf] px-2 py-1 text-[10px] font-black text-[#8a6239]">{items.length}</span>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((order) => (
          <OrderTicketCard
            key={order.id}
            order={order}
            shopName={shopName}
            vendorMode={vendorMode}
            pickupMapsUrl={pickupMapsUrl}
            onReceive={() => onReceive(order.id)}
            onFinish={() => onFinish(order.id)}
          />
        ))}
        {!items.length ? (
          <div className="rounded-xl border border-dashed border-[#e6d7bc] p-8 text-center text-sm text-[#8a7c66]">
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
  onToggleArrived,
  ingestSlot,
}: {
  shelf: DatesLabState['shelf'];
  onToggleStock: (id: string) => void;
  onToggleArrived: (id: string) => void;
  ingestSlot: ReactNode;
}) {
  return (
    <>
      <PageHeading
        eyebrow="الأصناف والمخزون"
        title="حدّث ما وصل اليوم من مكان واحد"
        copy="أبرز ما وصل اليوم، وأوقف الصنف النافد، وأدر المكتبة من مكان واحد."
      />

      <div className="mt-7 rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {shelf.map((item) => (
            <div key={item.catalogId} className="flex items-center gap-3 rounded-xl border border-[#e6d7bc] bg-white p-4">
              <p className={cn('flex-1 font-black text-[#2e2418]', !item.inStock && 'text-[#8a7c66] line-through')}>{item.nameAr}</p>
              <Button
                type="button"
                onClick={() => onToggleArrived(item.catalogId)}
                className={cn(
                  'h-8 rounded-lg px-2 text-[10px] font-black shadow-none',
                  item.arrivedToday ? 'bg-[#f3e6cf] text-[#8a6239]' : 'bg-transparent text-[#8a7c66] hover:bg-[#f3e6cf]',
                )}
              >
                {item.arrivedToday ? STORE_DATES_LIVE.arrivedOnAr : STORE_DATES_LIVE.arrivedOffAr}
              </Button>
              <Button
                type="button"
                onClick={() => onToggleStock(item.catalogId)}
                className="h-8 rounded-lg bg-transparent px-2 text-[10px] font-black text-[#8a6239] shadow-none hover:bg-[#f3e6cf]"
              >
                {item.inStock ? STORE_DATES_LIVE.stockOffAr : STORE_DATES_LIVE.stockOnAr}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5">
        <h3 className="font-black text-[#2e2418]">{STORE_DATES_LIVE.ingestTitleAr}</h3>
        <div className="mt-4">{ingestSlot}</div>
      </section>
    </>
  );
}

function LocationSection({ placeSlot, hoursSlot }: { placeSlot: ReactNode; hoursSlot: ReactNode }) {
  return (
    <>
      <PageHeading
        eyebrow="الموقع وساعات العمل"
        title="خلّي موقعك واضحاً لجيران الحي"
        copy="حدّد موقع الصندوق أو العربة، وتحكم بساعات العمل والمسار المتحرك من هنا."
      />

      <div className="mt-7 grid gap-6">
        <section className="rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5">{placeSlot}</section>
        <section className="rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5">{hoursSlot}</section>
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
      <div className="mt-7 rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5">{paySlot}</div>
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
        eyebrow="الإعدادات"
        title="كل إعدادات نشاطك من هنا"
        copy="هوية النشاط، ملصق QR، وشريط وصل اليوم — كلها من نفس الأدوات الحقيقية."
      />

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5">{shareSlot}</section>
        <section className="rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5">
          <h3 className="font-black text-[#2e2418]">{STORE_DATES_LIVE.flashLabelAr}</h3>
          <p className="mt-2 text-sm leading-6 text-[#79674f]">رسالة قصيرة تظهر أعلى صفحة جار الحي.</p>
          <Textarea
            value={flashAr}
            onChange={(event) => onFlashChange(event.target.value)}
            placeholder={STORE_DATES_LIVE.flashHintAr}
            className="mt-5 min-h-24 border-[#dac8aa] bg-white"
          />
        </section>
      </div>

      <section className="mt-6 space-y-6 rounded-2xl border border-[#dac8aa] bg-[#f9f4ea] p-5">
        {identitySlot}
        {backgroundSlot}
      </section>
    </>
  );
}
