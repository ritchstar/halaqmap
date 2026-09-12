/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { StoreDeskOrderAlert } from '@/components/store/StoreDeskOrderAlert';
import { StoreDeskControlTitle } from '@/components/store/StoreDeskControlTitle';
import { StoreKitchenGrowthHubButton } from '@/components/store/StoreKitchenGrowthHubButton';
import { StoreDeskArchiveDock } from '@/components/store/StoreDeskArchiveDock';
import { StoreDeskTicketActions } from '@/components/store/StoreDeskTicketActions';
import { Link } from 'react-router-dom';
import { StoreLiveShopShareDesk } from '@/components/store/StoreLiveShopShareDesk';
import { STORE_KITCHEN_GIFT_COPY } from '@/config/storeKitchenGiftCampaign';
import { STORE_KITCHEN_LIVE, STORE_KITCHEN_LIVE_ACCENT } from '@/config/storeKitchenLive';
import { STORE_PRODUCT_TRIAL_PRODUCTS } from '@/config/storeProductTrial';
import { STORE_DESK_ORDER_TICKET_COPY } from '@/config/storeDeskOrderTicket';
import { applyDeskFinish, deskOrderPhase, isLiveDeskTicket, receiveDeskTicket } from '@/lib/storeDeskOrderTicket';
import {
  kitchenBuyerWhatsAppHref,
  kitchenWhatsAppHref,
  isKitchenMapsUrl,
  markKitchenOrderReady,
  newKitchenQrStamp,
  type KitchenLabState,
  type KitchenOrder,
} from '@/lib/storeKitchenLiveLab';
import { StoreKitchenLocateButton } from '@/components/store/StoreKitchenLocateButton';
import { StoreKitchenMenuBoard } from '@/components/store/StoreKitchenMenuBoard';
import { StoreShopPresenceCount } from '@/components/store/StoreShopPresenceCount';
import { StoreShopHoursDesk } from '@/components/store/StoreShopHoursDesk';
import { StoreDeskHelpSupport } from '@/components/store/StoreDeskHelpSupport';
import { StoreDeskGuideLink } from '@/components/store/StoreDeskGuideLink';
import { StoreDeskCornerDock } from '@/components/store/StoreDeskCornerNav';
import { StoreShopIdentityDesk } from '@/components/store/StoreShopIdentityDesk';
import { StoreShopBackgroundDesk } from '@/components/store/StoreShopBackgroundDesk';
import { STORE_KITCHEN_SUPPORT } from '@/config/storeProductSupport';
import { StoreOpsSection } from '@/components/store/StoreOpsSection';
import { StoreDirectPayDesk } from '@/components/store/StoreDirectPayDesk';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

export function StoreKitchenDesk({
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
  const live = state.orders.filter(isLiveDeskTicket);
  const fresh = live.filter((item) => deskOrderPhase(item) === 'new');
  const working = live.filter((item) => deskOrderPhase(item) === 'received');

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

  function renderTicket(order: KitchenOrder) {
    return (
      <li key={order.id} className="store-desk-ticket-card rounded-xl border p-3 text-sm">
        <p className="store-desk-accent-text font-extrabold">
          تذكرة {order.ticketNo} · {order.name} · {order.phone}
        </p>
        <p className="mt-1 text-white/70">
          {order.service === 'pickup' ? STORE_KITCHEN_LIVE.servicePickupAr : STORE_KITCHEN_LIVE.serviceDeliveryAr}
          {order.place && !isKitchenMapsUrl(order.place) ? ` · ${order.place}` : ''}
        </p>
        {order.place && isKitchenMapsUrl(order.place) ? (
          <a className="store-desk-accent-text mt-1 inline-block text-xs" href={order.place} target="_blank" rel="noreferrer">
            {STORE_KITCHEN_LIVE.pickupPlaceOpenAr}
          </a>
        ) : null}
        {order.readyAt ? <p className="store-desk-accent-text mt-1">{STORE_KITCHEN_LIVE.readyMarkedAr}</p> : null}
        {order.scheduledAt ? <p className="mt-1 text-white/60">الموعد: {order.scheduledAt}</p> : null}
        {order.note ? <p className="mt-1 text-white/60">{order.note}</p> : null}
        {order.deliveryPhotoSrc ? (
          <img src={order.deliveryPhotoSrc} alt="" className="mt-2 max-h-32 rounded-lg object-cover" />
        ) : null}
        <p className="mt-1">{order.lines.map((line) => `${line.nameAr}×${line.qty}`).join(' · ')}</p>
        <p className="mt-1 font-black">
          {order.total} ر.س · {order.pay === 'card' ? STORE_KITCHEN_LIVE.payCardAr : STORE_KITCHEN_LIVE.payCashAr}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <a
            className="store-desk-accent-bg rounded-full px-3 py-1.5 text-xs font-bold"
            href={kitchenWhatsAppHref(order, state.host.shopName, state.host.opsPhone)}
            target="_blank"
            rel="noreferrer"
          >
            {STORE_KITCHEN_LIVE.whatsappReceiptAr}
          </a>
          {order.service === 'pickup' && !order.readyAt ? (
            <button
              type="button"
              className="store-desk-accent-border store-desk-accent-text rounded-full border px-3 py-1.5 text-xs font-bold"
              onClick={() => markReady(order.id)}
            >
              {STORE_KITCHEN_LIVE.markReadyAr}
            </button>
          ) : null}
        </div>
        <StoreDeskTicketActions order={order} accent={STORE_KITCHEN_LIVE_ACCENT} onReceive={() => receiveOrder(order.id)} onFinish={() => finishOrder(order.id)} />
      </li>
    );
  }

  const giftCopy = STORE_KITCHEN_GIFT_COPY;
  const renewHref = gift?.shopToken
    ? `${ROUTE_PATHS.STORE_KITCHEN}?renew=${encodeURIComponent(gift.shopToken)}`
    : '';
  const giftEnds = gift?.expiresAt ? gift.expiresAt.slice(0, 10) : '';

  return (
    <div className="space-y-6 pb-14">
      <StoreDeskOrderAlert
        product="kitchen"
        token={token}
        shopName={state.host.shopName}
        orderIds={fresh.map((item) => item.id)}
        unreadCount={fresh.length}
      />
      <StoreDeskControlTitle
        kitchen
        trialNote={showTrialNote && !gift ? STORE_PRODUCT_TRIAL_PRODUCTS.kitchen.deskNoteAr : ''}
      />
      {gift ? (
        <section className="store-desk-panel store-desk-accent-border rounded-2xl border p-4" aria-label={giftCopy.deskBadgeAr}>
          <p className="store-desk-accent-text inline-flex rounded-full border px-2.5 py-0.5 text-[0.7rem] font-extrabold">
            {giftCopy.deskBadgeAr}
          </p>
          <p className="mt-3 text-sm leading-7 text-white/80">
            {giftEnds ? `${giftCopy.deskClockStartedAr} ${giftEnds}` : giftCopy.deskClockPendingAr}
          </p>
          {renewHref ? (
            <>
              <p className="mt-2 text-sm leading-7 text-white/70">{giftCopy.deskRenewHintAr}</p>
              <Link
                to={renewHref}
                className="store-desk-accent-bg mt-3 inline-flex rounded-full px-4 py-2 text-sm font-extrabold"
              >
                {giftCopy.deskRenewCtaAr}
              </Link>
            </>
          ) : null}
        </section>
      ) : null}
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
        fieldClassName="restaurant-field"
        extraFields={
          <label className="block text-sm">
            {STORE_KITCHEN_LIVE.opsPhoneLabelAr}
            <input
              className="restaurant-field"
              value={state.host.opsPhone}
              onChange={(e) =>
                onChange({ ...state, host: { ...state.host, opsPhone: e.target.value.slice(0, 20) } })
              }
              inputMode="tel"
            />
          </label>
        }
      />
      <StoreShopBackgroundDesk
        value={{ shopHeaderBg: state.host.shopHeaderBg, shopPageBg: state.host.shopPageBg }}
        onChange={(bg) => onChange({ ...state, host: { ...state.host, ...bg } })}
        accent={STORE_KITCHEN_LIVE_ACCENT}
        fieldClassName="restaurant-field"
      />
      <div className={cn('rounded-2xl border p-4', fresh.length ? 'restaurant-alert store-desk-accent-border' : 'border-white/12')}>
        <h2 className="text-lg font-extrabold">{STORE_KITCHEN_LIVE.liveOrdersAr}</h2>
        <p className="mt-1 text-sm text-white/60">{fresh.length ? `${fresh.length} تذكرة جديدة` : 'لا تذاكر جديدة الآن.'}</p>
        <StoreShopPresenceCount productTag="store_kitchen_live" token={token} />
        {fresh.length ? (
          <>
            <p className="store-desk-accent-text mt-3 text-xs font-extrabold">{STORE_DESK_ORDER_TICKET_COPY.newLaneAr}</p>
            <ul className="mt-2 space-y-3">{fresh.map(renderTicket)}</ul>
          </>
        ) : null}
        {working.length ? (
          <>
            <p className="mt-4 text-xs font-extrabold text-white/70">{STORE_DESK_ORDER_TICKET_COPY.receivedLaneAr}</p>
            <ul className="mt-2 space-y-3">{working.map(renderTicket)}</ul>
          </>
        ) : null}
      </div>

      <section className="rounded-2xl border border-white/12 p-4">
        <h3 className="font-extrabold">{STORE_KITCHEN_LIVE.deskPickupTitleAr}</h3>
        <p className="mt-2 text-sm leading-7 text-white/65">{STORE_KITCHEN_LIVE.deskPickupLeadAr}</p>
        {state.host.pickupMapsUrl ? (
          <a
            className="store-desk-accent-border store-desk-accent-text mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs"
            href={state.host.pickupMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            {STORE_KITCHEN_LIVE.pickupPlaceOpenAr}
          </a>
        ) : null}
        <StoreKitchenLocateButton
          onLocated={({ lat, lng, mapsUrl }) =>
            onChange({
              ...state,
              host: { ...state.host, pickupLat: lat, pickupLng: lng, pickupMapsUrl: mapsUrl },
            })
          }
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...state, host: { ...state.host, pickupPlaceVisible: true } })}
            className={cn('rounded-full px-4 py-2 text-sm font-bold', state.host.pickupPlaceVisible ? 'store-desk-accent-bg' : 'border border-white/20')}
          >
            {STORE_KITCHEN_LIVE.pickupShowAr}
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...state, host: { ...state.host, pickupPlaceVisible: false } })}
            className={cn('rounded-full px-4 py-2 text-sm font-bold', !state.host.pickupPlaceVisible ? 'store-desk-accent-bg' : 'border border-white/20')}
          >
            {STORE_KITCHEN_LIVE.pickupHideAr}
          </button>
        </div>
      </section>

      <StoreDirectPayDesk product="store_kitchen_live" token={token} accent={STORE_KITCHEN_LIVE_ACCENT} />
      <StoreOpsSection titleAr="ساعات العمل">
      <StoreShopHoursDesk
        value={state.host}
        onChange={(nextHours) => onChange({ ...state, host: { ...state.host, ...nextHours } })}
        accent={STORE_KITCHEN_LIVE_ACCENT}
      />
      </StoreOpsSection>

      <label className="block text-sm">
        {STORE_KITCHEN_LIVE.flashLabelAr}
        <input
          className="restaurant-field"
          value={state.host.flashAr}
          onChange={(e) => onChange({ ...state, host: { ...state.host, flashAr: e.target.value } })}
          placeholder={STORE_KITCHEN_LIVE.flashHintAr}
        />
      </label>

      <label className="block text-sm">
        {STORE_KITCHEN_LIVE.deliveryFeeLabelAr}
        <input
          className="restaurant-field"
          type="number"
          min={0}
          value={state.host.deliveryFee}
          onChange={(e) => onChange({ ...state, host: { ...state.host, deliveryFee: Math.max(0, Number(e.target.value) || 0) } })}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...state, host: { ...state.host, acceptingOrders: !state.host.acceptingOrders } })}
          className={cn('rounded-full px-4 py-2 text-sm', state.host.acceptingOrders ? 'border border-white/20' : 'store-desk-accent-bg font-bold')}
        >
          {state.host.acceptingOrders ? STORE_KITCHEN_LIVE.pauseOnAr : STORE_KITCHEN_LIVE.pauseOffAr}
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...state, host: { ...state.host, showSoldOut: !state.host.showSoldOut } })}
          className={cn('rounded-full px-4 py-2 text-sm', state.host.showSoldOut ? 'store-desk-accent-bg font-bold' : 'border border-white/20')}
        >
          {STORE_KITCHEN_LIVE.showSoldOutAr}
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...state, host: { ...state.host, scheduleEnabled: !state.host.scheduleEnabled } })}
          className={cn('rounded-full px-4 py-2 text-sm', state.host.scheduleEnabled ? 'store-desk-accent-bg font-bold' : 'border border-white/20')}
        >
          {STORE_KITCHEN_LIVE.scheduleOnAr}
        </button>
      </div>

      <div className="rounded-2xl border border-white/12 p-4">
        <h3 className="font-extrabold">حالة الأصناف</h3>
        <ul className="mt-3 space-y-2">
          {state.shelf.map((item) => (
            <li key={item.catalogId} className="flex items-center justify-between gap-3 text-sm">
              <span className={item.inStock ? '' : 'text-white/35 line-through'}>{item.nameAr}</span>
              <button
                type="button"
                onClick={() => toggleStock(item.catalogId)}
                className={cn('rounded-full px-3 py-1 text-xs', item.inStock ? 'store-desk-accent-bg font-bold' : 'border border-white/20')}
              >
                {item.inStock ? STORE_KITCHEN_LIVE.stockOnAr : STORE_KITCHEN_LIVE.stockOffAr}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <StoreKitchenMenuBoard state={state} onChange={onChange} />

      <StoreOpsSection titleAr="ملصق العرض">
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
              <button
                type="button"
                onClick={() => onChange({ ...state, host: { ...state.host, qrActive: false } })}
                className="rounded-full border border-white/20 py-2 text-sm"
              >
                {STORE_KITCHEN_LIVE.qrRevokeAr}
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...state, host: { ...state.host, qrStamp: newKitchenQrStamp(), qrActive: true } })}
                className="store-desk-accent-border store-desk-accent-text sm:col-span-2 rounded-full border py-2 text-sm"
              >
                {STORE_KITCHEN_LIVE.qrRenewAr}
              </button>
            </div>
          }
        />
      </StoreOpsSection>

      <StoreDeskArchiveDock tickets={state.orderArchive} accent={STORE_KITCHEN_LIVE_ACCENT} filename="kitchen-archive.json" />
      <StoreDeskCornerDock>
        <StoreKitchenGrowthHubButton token={token} />
        <StoreDeskGuideLink
          to={ROUTE_PATHS.STORE_KITCHEN_SUPPORT}
          leadAr={STORE_KITCHEN_SUPPORT.deskLeadAr}
          labelAr={STORE_KITCHEN_SUPPORT.landingCtaAr}
        />
        <StoreDeskHelpSupport product="kitchen" />
      </StoreDeskCornerDock>
    </div>
  );
}
