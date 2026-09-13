/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة تشغيل طبختنا1 — هيكل Chatly مع منطق halaqmap الحقيقي.
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
  Gift,
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
import { STORE_KITCHEN_GIFT_COPY } from '@/config/storeKitchenGiftCampaign';
import { STORE_KITCHEN_LIVE, STORE_KITCHEN_LIVE_ACCENT } from '@/config/storeKitchenLive';
import { STORE_SHOP_HOURS_COPY } from '@/config/storeShopHours';
import { STORE_SHOP_PRESENCE_LABEL_AR } from '@/config/storeShopPresence';
import {
  kitchenBuyerWhatsAppHref,
  kitchenWhatsAppHref,
  isKitchenMapsUrl,
  markKitchenOrderReady,
  newKitchenQrStamp,
  type KitchenLabState,
  type KitchenOrder,
} from '@/lib/storeKitchenLiveLab';
import { StoreDeskOrderAlert } from '@/components/store/StoreDeskOrderAlert';
import { StoreDeskControlTitle } from '@/components/store/StoreDeskControlTitle';
import { StoreKitchenGrowthHubButton } from '@/components/store/StoreKitchenGrowthHubButton';
import { StoreKitchenLocateButton } from '@/components/store/StoreKitchenLocateButton';
import { StoreKitchenMenuBoard } from '@/components/store/StoreKitchenMenuBoard';
import { StoreDeskArchiveDock } from '@/components/store/StoreDeskArchiveDock';
import { StoreDeskTicketActions } from '@/components/store/StoreDeskTicketActions';
import { STORE_PRODUCT_TRIAL_PRODUCTS } from '@/config/storeProductTrial';
import { STORE_DESK_ORDER_TICKET_COPY } from '@/config/storeDeskOrderTicket';
import { applyDeskFinish, deskOrderPhase, isLiveDeskTicket, receiveDeskTicket } from '@/lib/storeDeskOrderTicket';
import { StoreShopHoursDesk } from '@/components/store/StoreShopHoursDesk';
import { StoreDeskHelpSupport } from '@/components/store/StoreDeskHelpSupport';
import { StoreDeskGuideLink } from '@/components/store/StoreDeskGuideLink';
import { StoreDeskCornerDock } from '@/components/store/StoreDeskCornerNav';
import { StoreShopIdentityDesk } from '@/components/store/StoreShopIdentityDesk';
import { StoreShopBackgroundDesk } from '@/components/store/StoreShopBackgroundDesk';
import { STORE_KITCHEN_SUPPORT } from '@/config/storeProductSupport';
import { StoreDirectPayDesk } from '@/components/store/StoreDirectPayDesk';
import { KitchenTabkhatnaMark } from '@/components/store/kitchen/KitchenTabkhatnaMark';
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

export function KitchenChatlyDesk({
  state,
  onChange,
  shopUrl,
  token,
  gift,
  showTrialNote = false,
}: {
  state: KitchenLabState;
  onChange: (next: KitchenLabState) => void;
  shopUrl: string;
  token: string;
  gift?: { expiresAt: string; shopToken: string } | null;
  showTrialNote?: boolean;
}) {
  const [section, setSection] = useState<DeskSection>('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);

  const live = state.orders.filter(isLiveDeskTicket);
  const fresh = live.filter((item) => deskOrderPhase(item) === 'new');
  const working = live.filter((item) => deskOrderPhase(item) === 'received');
  const presenceCount = useStoreShopPresence({
    role: 'desk',
    productTag: 'store_kitchen_live',
    token,
    enabled: Boolean(token),
  });

  const todaySalesTotal = useMemo(() => {
    const all: KitchenOrder[] = [...state.orders, ...state.orderArchive];
    return all.filter((order) => orderIsToday(order.at)).reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  }, [state.orders, state.orderArchive]);

  const todayBoardCount = state.shelf.some((item) => item.catalogId === 'today-board') ? 1 : 0;

  function receiveOrder(id: string) {
    onChange({ ...state, orders: receiveDeskTicket(state.orders, id) });
  }

  function finishOrder(id: string) {
    const next = applyDeskFinish(state.orders, state.orderArchive, id, 'kitchen');
    onChange({ ...state, orders: next.orders, orderArchive: next.orderArchive });
  }

  function markReady(id: string) {
    const mapsUrl = state.host.pickupMapsUrl;
    const next = markKitchenOrderReady(state, id, mapsUrl);
    onChange(next);
    const order = next.orders.find((item) => item.id === id);
    if (!order) return;
    window.open(kitchenBuyerWhatsAppHref(order, state.host.shopName, mapsUrl), '_blank', 'noopener,noreferrer');
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

  const giftCopy = STORE_KITCHEN_GIFT_COPY;
  const renewHref = gift?.shopToken
    ? `${ROUTE_PATHS.STORE_KITCHEN}?renew=${encodeURIComponent(gift.shopToken)}`
    : '';
  const giftEnds = gift?.expiresAt ? gift.expiresAt.slice(0, 10) : '';

  const nav: { key: DeskSection; label: string; icon: typeof Store; badge?: number }[] = [
    { key: 'overview', label: 'نظرة عامة', icon: Store },
    { key: 'orders', label: 'الطلبات', icon: ShoppingBag, badge: fresh.length || undefined },
    { key: 'products', label: 'الأصناف والمخزون', icon: Package },
    { key: 'location', label: 'الاستلام والساعات', icon: MapPin },
    { key: 'payment', label: 'الدفع المباشر', icon: Clipboard },
    { key: 'tools', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <main dir="rtl" className="kitchen-chatly-desk-root min-h-dvh bg-[#eee1cb] pb-16 text-[#271c13]">
      <div className="grid min-h-dvh lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-[min(280px,88vw)] flex-col border-l border-[#e3cfa8] bg-[#fbf6ef] p-5 transition-transform lg:static lg:z-auto lg:w-auto lg:translate-x-0',
            mobileNav ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0',
          )}
        >
          <div className="flex items-center justify-between border-b border-[#e3cfa8] pb-6 lg:block">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#fde3c6] text-[#c2410c]">
                <KitchenTabkhatnaMark size="sm" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#c2410c]">مساحة التشغيل</p>
                <p className="text-lg font-black">{STORE_KITCHEN_LIVE.titleAr}</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setMobileNav(false)}
              className="size-9 rounded-full bg-[#fde3c6] p-0 text-[#9a3009] shadow-none lg:hidden"
              aria-label="إغلاق القائمة"
            >
              <X size={16} />
            </Button>
          </div>

          <div className="mt-6 rounded-2xl bg-[#271c13] p-4 text-white">
            <p className="text-xs text-[#fde3c6]">حالة النشاط</p>
            <p className="mt-2 text-lg font-black">{state.host.shopName}</p>
            <p className="mt-1 text-[11px] text-[#f0dcc0]">
              {state.host.acceptingOrders ? 'يستقبل الطلبات الآن' : 'الاستقبال متوقف'}
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
                    ? 'bg-[#fde3c6] text-[#9a3009] hover:bg-[#f5d3ab]'
                    : 'bg-transparent text-[#8a7860] hover:bg-[#faf1e2]',
                )}
              >
                <Icon size={17} />
                {label}
                {badge ? (
                  <span className="mr-auto flex size-5 items-center justify-center rounded-full bg-[#c2410c] text-[10px] text-white">
                    {badge}
                  </span>
                ) : null}
              </Button>
            ))}

            <div className="my-4 h-px bg-[#e3cfa8]" />

            <Link
              to={ROUTE_PATHS.STORE_KITCHEN_SUPPORT}
              onClick={() => setMobileNav(false)}
              className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-[#8a7860] hover:bg-[#faf1e2] hover:text-[#9a3009]"
              title={STORE_KITCHEN_SUPPORT.deskLeadAr}
            >
              <FileText size={17} />
              {STORE_KITCHEN_SUPPORT.landingCtaAr}
            </Link>

            <Button
              type="button"
              onClick={() => {
                setSection('orders');
                setMobileNav(false);
              }}
              className="h-11 justify-start gap-3 rounded-xl bg-transparent px-3 text-sm font-bold text-[#8a7860] shadow-none hover:bg-[#faf1e2]"
            >
              <Archive size={17} />
              {STORE_DESK_ORDER_TICKET_COPY.archiveTitleAr}
            </Button>
          </nav>

          <a
            href={shopUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center gap-3 border-t border-[#e3cfa8] px-1 pt-5 text-sm font-bold text-[#8a7860] hover:text-[#9a3009]"
          >
            <Store size={17} />
            {STORE_KITCHEN_LIVE.shopLinkAr}
            <ArrowLeft size={14} className="mr-auto" />
          </a>
        </aside>

        {mobileNav ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[#271c13]/40 lg:hidden"
            aria-label="إغلاق القائمة"
            onClick={() => setMobileNav(false)}
          />
        ) : null}

        <section className="min-w-0">
          <header className="kitchen-chatly-desk-header">
            <div className="kitchen-chatly-desk-header__top">
              <div className="kitchen-chatly-desk-header__start">
                <Button
                  type="button"
                  onClick={() => setMobileNav(true)}
                  className="size-10 shrink-0 rounded-full bg-[#fde3c6] p-0 text-[#9a3009] shadow-none lg:hidden"
                  aria-label="فتح القائمة"
                >
                  <Menu size={18} />
                </Button>
                <StoreBrandMark className="kitchen-chatly-desk-header__brand" />
                <div className="kitchen-chatly-desk-header__title-block min-w-0">
                  <p className="text-xs font-bold text-[#8a7860]">ملخص اليوم</p>
                  <StoreDeskControlTitle kitchen trialNote="" />
                </div>
              </div>
              <div className="kitchen-chatly-desk-header__actions">
                <Button
                  type="button"
                  onClick={toggleAcceptingOrders}
                  className={cn(
                    'inline-flex h-10 max-w-[11rem] items-center gap-2 rounded-full border px-3 text-xs font-bold shadow-none sm:max-w-none',
                    state.host.acceptingOrders
                      ? 'border-[#e3cfa8] bg-white text-[#c2410c] hover:bg-[#faf1e2]'
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
                  className="relative size-10 rounded-full border border-[#e3cfa8] bg-white p-0 text-[#8a7860] shadow-none hover:bg-[#faf1e2]"
                >
                  <Bell size={17} />
                  {fresh.length ? (
                    <span className="absolute -left-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#c2410c] text-[9px] font-black text-white">
                      {fresh.length}
                    </span>
                  ) : null}
                </Button>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#c2410c] text-sm font-black text-white">
                  <KitchenTabkhatnaMark inverse size="sm" />
                </div>
              </div>
            </div>
            {showTrialNote && !gift ? (
              <p className="kitchen-chatly-desk-header__trial-note" role="note">
                {STORE_PRODUCT_TRIAL_PRODUCTS.kitchen.deskNoteAr}
              </p>
            ) : null}
          </header>

          <div className="p-4 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-[1420px]">
              {section === 'overview' ? (
                <OverviewSection
                  fresh={fresh}
                  working={working}
                  todayBoardCount={todayBoardCount}
                  presenceCount={presenceCount}
                  todaySalesTotal={todaySalesTotal}
                  flashAr={state.host.flashAr}
                  onFlashChange={(flashAr) => onChange({ ...state, host: { ...state.host, flashAr } })}
                  shopUrl={shopUrl}
                  onGoOrders={() => setSection('orders')}
                  onGoLocation={() => setSection('location')}
                  onReceive={receiveOrder}
                  onFinish={finishOrder}
                  onMarkReady={markReady}
                  shopName={state.host.shopName}
                  opsPhone={state.host.opsPhone}
                  alertRef={alertRef}
                  alertSlot={
                    <StoreDeskOrderAlert
                      product="kitchen"
                      token={token}
                      shopName={state.host.shopName}
                      orderIds={fresh.map((item) => item.id)}
                      unreadCount={fresh.length}
                    />
                  }
                  giftSlot={
                    gift ? (
                      <section className="rounded-2xl border border-[#c2410c] bg-[#fff8ef] p-5" aria-label={giftCopy.deskBadgeAr}>
                        <p className="inline-flex items-center gap-1.5 rounded-full border border-[#c2410c] px-2.5 py-0.5 text-[0.7rem] font-extrabold text-[#c2410c]">
                          <Gift size={13} />
                          {giftCopy.deskBadgeAr}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#6e5a47]">
                          {giftEnds ? `${giftCopy.deskClockStartedAr} ${giftEnds}` : giftCopy.deskClockPendingAr}
                        </p>
                        {renewHref ? (
                          <>
                            <p className="mt-2 text-sm leading-7 text-[#79674f]">{giftCopy.deskRenewHintAr}</p>
                            <Link
                              to={renewHref}
                              className="kitchen-chatly-btn-primary mt-3 inline-flex rounded-full px-4 py-2 text-sm font-extrabold"
                            >
                              {giftCopy.deskRenewCtaAr}
                            </Link>
                          </>
                        ) : null}
                      </section>
                    ) : null
                  }
                />
              ) : null}

              {section === 'orders' ? (
                <OrdersSection
                  fresh={fresh}
                  working={working}
                  onReceive={receiveOrder}
                  onFinish={finishOrder}
                  onMarkReady={markReady}
                  shopName={state.host.shopName}
                  opsPhone={state.host.opsPhone}
                  archiveSlot={
                    <StoreDeskArchiveDock
                      tickets={state.orderArchive}
                      accent={STORE_KITCHEN_LIVE_ACCENT}
                      filename="kitchen-archive.json"
                    />
                  }
                />
              ) : null}

              {section === 'products' ? (
                <ProductsSection
                  shelf={state.shelf}
                  showSoldOut={state.host.showSoldOut}
                  onToggleStock={toggleStock}
                  onToggleShowSoldOut={() =>
                    onChange({ ...state, host: { ...state.host, showSoldOut: !state.host.showSoldOut } })
                  }
                  ingestSlot={<StoreKitchenMenuBoard state={state} onChange={onChange} />}
                />
              ) : null}

              {section === 'location' ? (
                <LocationSection
                  pickupMapsUrl={state.host.pickupMapsUrl}
                  pickupPlaceVisible={state.host.pickupPlaceVisible}
                  onLocated={({ lat, lng, mapsUrl }) =>
                    onChange({
                      ...state,
                      host: { ...state.host, pickupLat: lat, pickupLng: lng, pickupMapsUrl: mapsUrl },
                    })
                  }
                  onShowPickup={() => onChange({ ...state, host: { ...state.host, pickupPlaceVisible: true } })}
                  onHidePickup={() => onChange({ ...state, host: { ...state.host, pickupPlaceVisible: false } })}
                  scheduleEnabled={state.host.scheduleEnabled}
                  onToggleSchedule={() =>
                    onChange({ ...state, host: { ...state.host, scheduleEnabled: !state.host.scheduleEnabled } })
                  }
                  deliveryFee={state.host.deliveryFee}
                  onDeliveryFeeChange={(deliveryFee) => onChange({ ...state, host: { ...state.host, deliveryFee } })}
                  hoursSlot={
                    <StoreShopHoursDesk
                      value={state.host}
                      onChange={(nextHours) => onChange({ ...state, host: { ...state.host, ...nextHours } })}
                      accent={STORE_KITCHEN_LIVE_ACCENT}
                      theme="light"
                    />
                  }
                />
              ) : null}

              {section === 'payment' ? (
                <PaymentSection
                  paySlot={<StoreDirectPayDesk product="store_kitchen_live" token={token} accent={STORE_KITCHEN_LIVE_ACCENT} />}
                />
              ) : null}

              {section === 'tools' ? (
                <ToolsSection
                  flashAr={state.host.flashAr}
                  onFlashChange={(flashAr) => onChange({ ...state, host: { ...state.host, flashAr } })}
                  identitySlot={
                    <StoreShopIdentityDesk
                      shopNameLabel={STORE_KITCHEN_LIVE.kitchenNameLabelAr}
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
                      accent={STORE_KITCHEN_LIVE_ACCENT}
                      fieldClassName="kitchen-field"
                      extraFields={
                        <label className="block text-sm">
                          {STORE_KITCHEN_LIVE.opsPhoneLabelAr}
                          <input
                            className="kitchen-field"
                            value={state.host.opsPhone}
                            onChange={(e) =>
                              onChange({ ...state, host: { ...state.host, opsPhone: e.target.value.slice(0, 20) } })
                            }
                            inputMode="tel"
                          />
                        </label>
                      }
                    />
                  }
                  backgroundSlot={
                    <StoreShopBackgroundDesk
                      value={{ shopHeaderBg: state.host.shopHeaderBg, shopPageBg: state.host.shopPageBg }}
                      onChange={(bg) => onChange({ ...state, host: { ...state.host, ...bg } })}
                      accent={STORE_KITCHEN_LIVE_ACCENT}
                      fieldClassName="kitchen-field"
                    />
                  }
                  shareSlot={
                    <StoreLiveShopShareDesk
                      kind="kitchen"
                      token={token}
                      shopName={state.host.shopName}
                      shopUrl={shopUrl}
                      qrValue={state.host.qrActive ? shopUrl : 'رمز أُبطل'}
                      qrPhraseAr={STORE_KITCHEN_LIVE.qrPhraseAr}
                      qrPrintAr={STORE_KITCHEN_LIVE.qrPrintAr}
                      accent={STORE_KITCHEN_LIVE_ACCENT}
                      qrStamp={state.host.qrActive ? state.host.qrStamp : ''}
                      showTitle={false}
                      afterPrint={
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Button
                            type="button"
                            onClick={() => onChange({ ...state, host: { ...state.host, qrActive: false } })}
                            className="rounded-full border border-[#e3cfa8] bg-white py-2 text-sm text-[#6e5a47] shadow-none hover:bg-[#faf1e2]"
                          >
                            {STORE_KITCHEN_LIVE.qrRevokeAr}
                          </Button>
                          <Button
                            type="button"
                            onClick={() =>
                              onChange({ ...state, host: { ...state.host, qrStamp: newKitchenQrStamp(), qrActive: true } })
                            }
                            className="kitchen-chatly-btn-primary sm:col-span-2 rounded-full py-2 text-sm"
                          >
                            {STORE_KITCHEN_LIVE.qrRenewAr}
                          </Button>
                        </div>
                      }
                    />
                  }
                />
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <StoreDeskCornerDock>
        <StoreKitchenGrowthHubButton token={token} />
        <StoreDeskGuideLink
          to={ROUTE_PATHS.STORE_KITCHEN_SUPPORT}
          leadAr={STORE_KITCHEN_SUPPORT.deskLeadAr}
          labelAr={STORE_KITCHEN_SUPPORT.landingCtaAr}
        />
        <StoreDeskHelpSupport product="kitchen" />
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
        <p className="text-xs font-bold tracking-[0.16em] text-[#c2410c]">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#2a1e14] sm:text-4xl">{title}</h2>
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
      ? 'bg-[#fde3c6] text-[#c2410c]'
      : tone === 'blue'
        ? 'bg-[#e3edf5] text-[#3d6b8a]'
        : tone === 'gold'
          ? 'bg-[#f7edd3] text-[#9a741d]'
          : 'bg-[#eef0e3] text-[#5f705f]';

  return (
    <div className="rounded-2xl border border-[#e3cfa8] bg-[#fff8ef] p-4">
      <p className="text-xs font-bold text-[#8a7860]">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#2a1e14]">{value}</p>
      <p className={cn('mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-black', toneClass)}>{hint}</p>
    </div>
  );
}

function OrderTicketCard({
  order,
  onReceive,
  onFinish,
  onMarkReady,
  shopName,
  opsPhone,
  compact = false,
}: {
  order: KitchenOrder;
  onReceive: () => void;
  onFinish: () => void;
  onMarkReady: () => void;
  shopName: string;
  opsPhone: string;
  compact?: boolean;
}) {
  function displayPlace(order: { place: string }) {
    if (order.place && isKitchenMapsUrl(order.place)) return 'تم تحديد الموقع';
    return order.place || 'بلا موقع مكتوب';
  }
  const phase = deskOrderPhase(order);
  return (
    <div className="store-desk-ticket-card rounded-xl border border-[#e9d8bc] bg-white p-4">
      <div className={cn('flex gap-3', compact ? 'flex-col sm:flex-row sm:items-center' : 'flex-col')}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-[#c2410c]">تذكرة {order.ticketNo} · {order.name}</span>
            <span className="rounded-full bg-[#fde3c6] px-2 py-1 text-[10px] font-black text-[#c2410c]">
              {order.service === 'pickup' ? STORE_KITCHEN_LIVE.servicePickupAr : STORE_KITCHEN_LIVE.serviceDeliveryAr}
            </span>
            {order.readyAt ? (
              <span className="rounded-full bg-[#e3f0e5] px-2 py-1 text-[10px] font-black text-[#2f7a4b]">
                {STORE_KITCHEN_LIVE.readyMarkedAr}
              </span>
            ) : null}
          </div>
          <p className="mt-1 font-black text-[#2a1e14]">{order.phone}</p>
          {order.place ? <p className="mt-1 text-xs text-[#8a7860]">{displayPlace(order)}</p> : null}
          {order.scheduledAt ? <p className="mt-1 text-xs text-[#8a7860]">الموعد: {order.scheduledAt}</p> : null}
          {order.note ? <p className="mt-1 text-xs text-[#8a7860]">{order.note}</p> : null}
          {order.deliveryPhotoSrc ? (
            <img src={order.deliveryPhotoSrc} alt="" className="mt-2 max-h-32 rounded-lg object-cover" />
          ) : null}
          <p className="mt-2 text-sm font-bold text-[#2a1e14]">
            {order.lines.map((line) => `${line.nameAr}×${line.qty}`).join(' · ')}
          </p>
        </div>
        <div className={cn('flex items-center justify-between gap-3', compact && 'sm:flex-col sm:items-end')}>
          <span className="font-black text-[#c2410c]">
            {order.total} ر.س · {order.pay === 'card' ? STORE_KITCHEN_LIVE.payCardAr : STORE_KITCHEN_LIVE.payCashAr}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <a
              className="inline-flex size-8 items-center justify-center rounded-lg bg-[#fde3c6] text-[#c2410c] hover:bg-[#f5d3ab]"
              href={kitchenWhatsAppHref(order, shopName, opsPhone)}
              target="_blank"
              rel="noreferrer"
              aria-label={STORE_KITCHEN_LIVE.whatsappReceiptAr}
            >
              <ArrowLeft size={15} className="rotate-180" />
            </a>
            {order.service === 'pickup' && !order.readyAt ? (
              <Button
                type="button"
                onClick={onMarkReady}
                className="h-8 rounded-lg bg-transparent px-2 text-[10px] font-black text-[#2f7a4b] shadow-none hover:bg-[#e3f0e5]"
              >
                {STORE_KITCHEN_LIVE.markReadyAr}
              </Button>
            ) : null}
            <StoreDeskTicketActions
              order={order}
              accent={STORE_KITCHEN_LIVE_ACCENT}
              onReceive={onReceive}
              onFinish={onFinish}
            />
          </div>
        </div>
      </div>
      {!compact && phase === 'received' ? (
        <p className="mt-2 text-[10px] font-bold text-[#8a7860]">{STORE_DESK_ORDER_TICKET_COPY.receivedLaneAr}</p>
      ) : null}
    </div>
  );
}

function OverviewSection({
  fresh,
  working,
  todayBoardCount,
  presenceCount,
  todaySalesTotal,
  flashAr,
  onFlashChange,
  shopUrl,
  onGoOrders,
  onGoLocation,
  onReceive,
  onFinish,
  onMarkReady,
  shopName,
  opsPhone,
  alertRef,
  alertSlot,
  giftSlot,
}: {
  fresh: KitchenOrder[];
  working: KitchenOrder[];
  todayBoardCount: number;
  presenceCount: number;
  todaySalesTotal: number;
  flashAr: string;
  onFlashChange: (value: string) => void;
  shopUrl: string;
  onGoOrders: () => void;
  onGoLocation: () => void;
  onReceive: (id: string) => void;
  onFinish: (id: string) => void;
  onMarkReady: (id: string) => void;
  shopName: string;
  opsPhone: string;
  alertRef: React.RefObject<HTMLDivElement | null>;
  alertSlot: ReactNode;
  giftSlot: ReactNode;
}) {
  return (
    <>
      <div ref={alertRef} className="mb-6">
        {alertSlot}
      </div>

      {giftSlot ? <div className="mb-6">{giftSlot}</div> : null}

      <PageHeading
        eyebrow="لوحة اليوم"
        title="الطلبات، أصنافك، وموقع الاستلام — واضحين"
        copy="طبختنا1 يعمل بنفس سرعة الطلب المنزلي: شوف الجديد، استلم الطلب، وأبلغ الزبون حين يجهز."
        action={
          <a
            href={shopUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#e3cfa8] bg-[#fff8ef] px-4 text-sm font-bold text-[#5f705f] hover:bg-[#fde3c6]"
          >
            معاينة الصفحة
            <ArrowLeft size={15} />
          </a>
        }
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="طلبات جديدة" value={String(fresh.length)} hint="تحتاج استلام" tone="green" />
        <Metric label={STORE_SHOP_PRESENCE_LABEL_AR} value={String(presenceCount)} hint="متصفحون الآن" tone="blue" />
        <Metric label={STORE_KITCHEN_LIVE.todayTitleAr} value={String(todayBoardCount)} hint="طبق اليوم" tone="gold" />
        <Metric label="إجمالي اليوم" value={`${todaySalesTotal} ر.س`} hint="طلبات اليوم" tone="olive" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <section className="rounded-2xl border border-[#e3cfa8] bg-[#fff8ef] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[0.13em] text-[#c2410c]">الطلبات الجديدة</p>
              <h3 className="mt-1 text-lg font-black text-[#2a1e14]">استلمها قبل أن تبرد</h3>
            </div>
            <Button
              type="button"
              onClick={onGoOrders}
              className="h-9 rounded-full bg-transparent px-3 text-xs font-black text-[#c2410c] shadow-none hover:bg-[#fde3c6]"
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
                opsPhone={opsPhone}
                onReceive={() => onReceive(order.id)}
                onFinish={() => onFinish(order.id)}
                onMarkReady={() => onMarkReady(order.id)}
              />
            ))}
            {!fresh.length ? (
              <div className="rounded-xl border border-dashed border-[#e9d8bc] p-8 text-center text-sm text-[#8a7860]">
                لا طلبات جديدة الآن.
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl bg-[#271c13] p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.13em] text-[#fde3c6]">الاستلام والساعات</p>
              <h3 className="mt-1 text-lg font-black">موقع الاستلام وساعات العمل</h3>
            </div>
            <MapPin size={21} className="text-[#fde3c6]" />
          </div>
          <p className="mt-4 text-xs leading-6 text-[#f0dcc0]">حدّث موقع الاستلام من الباب وساعات العمل من قسم الاستلام والساعات.</p>
          <Button
            type="button"
            onClick={onGoLocation}
            className="mt-4 h-10 w-full rounded-xl border-0 bg-[#fde3c6] text-xs font-black text-[#7a3212] shadow-none hover:bg-white"
          >
            إدارة الاستلام والساعات
            <ArrowLeft size={14} />
          </Button>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-[#e3cfa8] bg-[#fff8ef] p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-[0.13em] text-[#c2410c]">شريط طبق اليوم</p>
            <p className="mt-1 text-sm text-[#79674f]">يظهر مباشرة أعلى صفحة الزبون.</p>
            <label className="mt-4 block text-xs font-bold text-[#6e5a47]">
              {STORE_KITCHEN_LIVE.flashLabelAr}
              <Textarea
                value={flashAr}
                onChange={(event) => onFlashChange(event.target.value)}
                placeholder={STORE_KITCHEN_LIVE.flashHintAr}
                className="mt-2 min-h-20 border-[#e3cfa8] bg-white text-sm"
              />
            </label>
          </div>
        </div>
      </section>

      {working.length ? (
        <section className="mt-6 rounded-2xl border border-[#e3cfa8] bg-[#fff8ef] p-5">
          <h3 className="font-black text-[#2a1e14]">{STORE_DESK_ORDER_TICKET_COPY.receivedLaneAr}</h3>
          <div className="mt-4 space-y-3">
            {working.slice(0, 2).map((order) => (
              <OrderTicketCard
                key={order.id}
                order={order}
                shopName={shopName}
                opsPhone={opsPhone}
                onReceive={() => onReceive(order.id)}
                onFinish={() => onFinish(order.id)}
                onMarkReady={() => onMarkReady(order.id)}
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
  onReceive,
  onFinish,
  onMarkReady,
  shopName,
  opsPhone,
  archiveSlot,
}: {
  fresh: KitchenOrder[];
  working: KitchenOrder[];
  onReceive: (id: string) => void;
  onFinish: (id: string) => void;
  onMarkReady: (id: string) => void;
  shopName: string;
  opsPhone: string;
  archiveSlot: ReactNode;
}) {
  return (
    <>
      <PageHeading
        eyebrow="الطلبات"
        title="مساران واضحان، ولا طلب يضيع"
        copy="استلم التذكرة، وأبلغ الزبون بالجاهزية عند الاستلام من الباب، ثم أنهِها عندما يخرج الطلب."
      />

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <OrderLane
          title={STORE_DESK_ORDER_TICKET_COPY.newLaneAr}
          items={fresh}
          shopName={shopName}
          opsPhone={opsPhone}
          onReceive={onReceive}
          onFinish={onFinish}
          onMarkReady={onMarkReady}
        />
        <OrderLane
          title={STORE_DESK_ORDER_TICKET_COPY.receivedLaneAr}
          items={working}
          shopName={shopName}
          opsPhone={opsPhone}
          onReceive={onReceive}
          onFinish={onFinish}
          onMarkReady={onMarkReady}
        />
      </div>

      <section className="mt-5 rounded-2xl border border-[#e3cfa8] bg-[#fff8ef] p-5">{archiveSlot}</section>
    </>
  );
}

function OrderLane({
  title,
  items,
  shopName,
  opsPhone,
  onReceive,
  onFinish,
  onMarkReady,
}: {
  title: string;
  items: KitchenOrder[];
  shopName: string;
  opsPhone: string;
  onReceive: (id: string) => void;
  onFinish: (id: string) => void;
  onMarkReady: (id: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-[#e3cfa8] bg-[#fff8ef] p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-[#2a1e14]">{title}</h3>
        <span className="rounded-full bg-[#fde3c6] px-2 py-1 text-[10px] font-black text-[#c2410c]">{items.length}</span>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((order) => (
          <OrderTicketCard
            key={order.id}
            order={order}
            shopName={shopName}
            opsPhone={opsPhone}
            onReceive={() => onReceive(order.id)}
            onFinish={() => onFinish(order.id)}
            onMarkReady={() => onMarkReady(order.id)}
          />
        ))}
        {!items.length ? (
          <div className="rounded-xl border border-dashed border-[#e9d8bc] p-8 text-center text-sm text-[#8a7860]">
            لا توجد طلبات هنا الآن.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ProductsSection({
  shelf,
  showSoldOut,
  onToggleStock,
  onToggleShowSoldOut,
  ingestSlot,
}: {
  shelf: KitchenLabState['shelf'];
  showSoldOut: boolean;
  onToggleStock: (id: string) => void;
  onToggleShowSoldOut: () => void;
  ingestSlot: ReactNode;
}) {
  return (
    <>
      <PageHeading
        eyebrow="الأصناف والمخزون"
        title="حدّث ما يُطبخ اليوم من مكان واحد"
        copy="إيقاف الصنف أو إعادة تفعيله، وإدارة القائمة من مكان واحد."
      />

      <div className="mt-7 flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={onToggleShowSoldOut}
          className={cn(
            'h-10 rounded-full px-4 text-sm font-bold shadow-none',
            showSoldOut ? 'kitchen-chatly-btn-primary' : 'kitchen-chatly-btn-ghost',
          )}
        >
          {STORE_KITCHEN_LIVE.showSoldOutAr}
        </Button>
      </div>

      <div className="mt-5 rounded-2xl border border-[#e3cfa8] bg-[#fff8ef] p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {shelf.map((item) => (
            <div key={item.catalogId} className="flex items-center gap-3 rounded-xl border border-[#e9d8bc] bg-white p-4">
              <span
                className={cn(
                  'rounded-full px-2 py-1 text-[10px] font-black',
                  item.inStock ? 'bg-[#fde3c6] text-[#c2410c]' : 'bg-[#f8e3e7] text-[#a15e55]',
                )}
              >
                {item.inStock ? STORE_KITCHEN_LIVE.stockOnAr : STORE_KITCHEN_LIVE.stockOffAr}
              </span>
              <p className={cn('flex-1 font-black text-[#2a1e14]', !item.inStock && 'text-[#8a7860] line-through')}>{item.nameAr}</p>
              <Button
                type="button"
                onClick={() => onToggleStock(item.catalogId)}
                className="h-8 rounded-lg bg-transparent px-2 text-[10px] font-black text-[#c2410c] shadow-none hover:bg-[#fde3c6]"
              >
                {item.inStock ? 'إيقاف' : 'تفعيل'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-[#e3cfa8] bg-[#fff8ef] p-5">
        <h3 className="font-black text-[#2a1e14]">{STORE_KITCHEN_LIVE.ingestTitleAr}</h3>
        <div className="mt-4">{ingestSlot}</div>
      </section>
    </>
  );
}

function LocationSection({
  pickupMapsUrl,
  pickupPlaceVisible,
  onLocated,
  onShowPickup,
  onHidePickup,
  scheduleEnabled,
  onToggleSchedule,
  deliveryFee,
  onDeliveryFeeChange,
  hoursSlot,
}: {
  pickupMapsUrl: string;
  pickupPlaceVisible: boolean;
  onLocated: (next: { lat: number; lng: number; mapsUrl: string }) => void;
  onShowPickup: () => void;
  onHidePickup: () => void;
  scheduleEnabled: boolean;
  onToggleSchedule: () => void;
  deliveryFee: number;
  onDeliveryFeeChange: (value: number) => void;
  hoursSlot: ReactNode;
}) {
  return (
    <>
      <PageHeading
        eyebrow="الاستلام والساعات"
        title="خلّي الوصول واضحاً"
        copy="حدّد موقع الاستلام من الباب، وتحكم بساعات العمل ورسوم التوصيل والموعد الاختياري."
      />

      <div className="mt-7 grid gap-6">
        <section className="rounded-2xl border border-[#e3cfa8] bg-[#fff8ef] p-5">
          <h3 className="font-black text-[#2a1e14]">{STORE_KITCHEN_LIVE.deskPickupTitleAr}</h3>
          <p className="mt-2 text-sm leading-7 text-[#79674f]">{STORE_KITCHEN_LIVE.deskPickupLeadAr}</p>
          {pickupMapsUrl ? (
            <a
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#c2410c] px-3 py-1.5 text-xs font-bold text-[#c2410c] hover:bg-[#fde3c6]"
              href={pickupMapsUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Clock3 size={14} />
              {STORE_KITCHEN_LIVE.pickupPlaceOpenAr}
            </a>
          ) : null}
          <StoreKitchenLocateButton onLocated={onLocated} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={onShowPickup}
              className={cn(
                'h-10 rounded-full px-4 text-sm font-bold shadow-none',
                pickupPlaceVisible ? 'kitchen-chatly-btn-primary' : 'kitchen-chatly-btn-ghost',
              )}
            >
              {STORE_KITCHEN_LIVE.pickupShowAr}
            </Button>
            <Button
              type="button"
              onClick={onHidePickup}
              className={cn(
                'h-10 rounded-full px-4 text-sm font-bold shadow-none',
                !pickupPlaceVisible ? 'kitchen-chatly-btn-primary' : 'kitchen-chatly-btn-ghost',
              )}
            >
              {STORE_KITCHEN_LIVE.pickupHideAr}
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e3cfa8] bg-[#fff8ef] p-5">
          {hoursSlot}
        </section>

        <section className="rounded-2xl border border-[#e3cfa8] bg-[#fff8ef] p-5">
          <label className="block text-sm font-bold text-[#6e5a47]">
            {STORE_KITCHEN_LIVE.deliveryFeeLabelAr}
            <input
              className="kitchen-field"
              type="number"
              min={0}
              value={deliveryFee}
              onChange={(e) => onDeliveryFeeChange(Math.max(0, Number(e.target.value) || 0))}
            />
          </label>
          <Button
            type="button"
            onClick={onToggleSchedule}
            className={cn(
              'mt-4 h-10 rounded-full px-4 text-sm font-bold shadow-none',
              scheduleEnabled ? 'kitchen-chatly-btn-primary' : 'kitchen-chatly-btn-ghost',
            )}
          >
            {STORE_KITCHEN_LIVE.scheduleOnAr}
          </Button>
        </section>
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
      <div className="mt-7 rounded-2xl border border-[#e3cfa8] bg-[#fff8ef] p-5">{paySlot}</div>
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
        copy="هوية النشاط، ملصق QR، وعرض طبق اليوم — كلها من نفس الأدوات الحقيقية."
      />

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#e3cfa8] bg-[#fff8ef] p-5">{shareSlot}</section>
        <section className="rounded-2xl border border-[#e3cfa8] bg-[#fff8ef] p-5">
          <h3 className="font-black text-[#2a1e14]">{STORE_KITCHEN_LIVE.flashLabelAr}</h3>
          <p className="mt-2 text-sm leading-6 text-[#79674f]">رسالة قصيرة تظهر أعلى صفحة الزبون.</p>
          <Textarea
            value={flashAr}
            onChange={(event) => onFlashChange(event.target.value)}
            placeholder={STORE_KITCHEN_LIVE.flashHintAr}
            className="mt-5 min-h-24 border-[#e3cfa8] bg-white"
          />
        </section>
      </div>

      <section className="mt-6 space-y-6 rounded-2xl border border-[#e3cfa8] bg-[#fff8ef] p-5">
        {identitySlot}
        {backgroundSlot}
      </section>
    </>
  );
}
