/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import QRCode from 'react-qr-code';
import { STORE_RESTAURANT_LIVE } from '@/config/storeRestaurantLive';
import { restaurantWhatsAppText, type RestaurantLabState } from '@/lib/storeRestaurantLiveLab';
import { StoreDeskOrderAlert } from '@/components/store/StoreDeskOrderAlert';
import { StoreDeskControlTitle } from '@/components/store/StoreDeskControlTitle';
import { StoreDeskArchiveDock } from '@/components/store/StoreDeskArchiveDock';
import { StoreDeskTicketActions } from '@/components/store/StoreDeskTicketActions';
import { StoreRestaurantMenuBoard } from '@/components/store/StoreRestaurantMenuBoard';
import { StoreRestaurantDeskChat } from '@/components/store/StoreRestaurantChat';
import { StoreShopPresenceCount } from '@/components/store/StoreShopPresenceCount';
import { StoreProductPassDeskButton } from '@/components/store/StoreProductPassDeskButton';
import { StoreShopHoursDesk } from '@/components/store/StoreShopHoursDesk';
import { StoreShopPlaceDesk } from '@/components/store/StoreShopPlaceDesk';
import { StoreDeskHelpSupport } from '@/components/store/StoreDeskHelpSupport';
import { StoreDeskGuideLink } from '@/components/store/StoreDeskGuideLink';
import { StoreShopLogoDesk } from '@/components/store/StoreShopLogoDesk';
import { STORE_RESTAURANT_SUPPORT } from '@/config/storeProductSupport';
import { StoreOpsSection } from '@/components/store/StoreOpsSection';
import { StoreDirectPayDesk } from '@/components/store/StoreDirectPayDesk';
import { STORE_PRODUCT_TRIAL_PRODUCTS } from '@/config/storeProductTrial';
import { STORE_DESK_ORDER_TICKET_COPY } from '@/config/storeDeskOrderTicket';
import { applyDeskFinish, deskOrderPhase, isLiveDeskTicket, receiveDeskTicket } from '@/lib/storeDeskOrderTicket';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

export function StoreRestaurantDesk({
  state,
  onChange,
  shopUrl,
  token,
  showTrialNote = false,
}: {
  state: RestaurantLabState;
  onChange: (next: RestaurantLabState) => void;
  shopUrl: string;
  token: string;
  showTrialNote?: boolean;
}) {
  const live = state.orders.filter(isLiveDeskTicket);
  const fresh = live.filter((item) => deskOrderPhase(item) === 'new');
  const working = live.filter((item) => deskOrderPhase(item) === 'received');

  function receiveOrder(id: string) {
    onChange({ ...state, orders: receiveDeskTicket(state.orders, id) });
  }

  function finishOrder(id: string) {
    const next = applyDeskFinish(state.orders, state.orderArchive, id, 'restaurant');
    onChange({ ...state, orders: next.orders, orderArchive: next.orderArchive });
  }

  function toggleStock(catalogId: string) {
    onChange({
      ...state,
      shelf: state.shelf.map((item) => (item.catalogId === catalogId ? { ...item, inStock: !item.inStock } : item)),
    });
  }

  function printQr() {
    const node = document.getElementById('restaurant-qr-print');
    if (!node) return;
    const win = window.open('', '_blank', 'width=420,height=640');
    if (!win) return;
    win.document.write(`<html lang="ar" dir="rtl"><head><title>ملصق QR</title></head><body>${node.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div className="space-y-6">
      <StoreDeskOrderAlert
        product="restaurant"
        token={token}
        shopName={state.host.shopName}
        orderIds={fresh.map((item) => item.id)}
        unreadCount={fresh.length}
      />
      <StoreDeskControlTitle
        trialNote={showTrialNote ? STORE_PRODUCT_TRIAL_PRODUCTS.restaurant.deskNoteAr : ''}
      />
      <div className={cn('rounded-2xl border p-4', fresh.length ? 'restaurant-alert border-[#e08a3c]' : 'border-white/12')}>
        <h2 className="text-lg font-extrabold">{STORE_RESTAURANT_LIVE.liveOrdersAr}</h2>
        <p className="mt-1 text-sm text-white/60">{fresh.length ? `${fresh.length} تذكرة جديدة` : 'لا تذاكر جديدة الآن.'}</p>
        <StoreShopPresenceCount productTag="store_restaurant_live" token={token} />
        {fresh.length ? (
          <>
            <p className="mt-3 text-xs font-extrabold text-[#e08a3c]">{STORE_DESK_ORDER_TICKET_COPY.newLaneAr}</p>
            <ul className="mt-2 space-y-3">
              {fresh.map((order) => (
                <li key={order.id} className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm">
                  <p className="font-extrabold text-[#e08a3c]">
                    تذكرة {order.ticketNo} · {order.name} · {order.phone}
                  </p>
                  <p className="mt-1 text-white/70">
                    {order.service === 'pickup' ? STORE_RESTAURANT_LIVE.servicePickupAr : STORE_RESTAURANT_LIVE.serviceDeliveryAr}
                    {order.place ? ` · ${order.place}` : ''}
                  </p>
                  {order.note ? <p className="mt-1 text-white/60">{order.note}</p> : null}
                  <p className="mt-1">{order.lines.map((line) => `${line.nameAr}×${line.qty}`).join(' · ')}</p>
                  <p className="mt-1 font-black">
                    {order.total} ر.س · {order.pay === 'card' ? STORE_RESTAURANT_LIVE.payCardAr : STORE_RESTAURANT_LIVE.payCashAr}
                  </p>
                  <a
                    className="mt-2 inline-flex rounded-full bg-[#e08a3c] px-3 py-1.5 text-xs font-bold text-[#061018]"
                    href={`https://wa.me/?text=${encodeURIComponent(restaurantWhatsAppText(order, state.host.shopName, state.host.vendorMode === 'mobile' ? state.host.pickupMapsUrl : ''))}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {STORE_RESTAURANT_LIVE.whatsappReceiptAr}
                  </a>
                  <StoreDeskTicketActions order={order} accent="#e08a3c" onReceive={() => receiveOrder(order.id)} onFinish={() => finishOrder(order.id)} />
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {working.length ? (
          <>
            <p className="mt-4 text-xs font-extrabold text-white/70">{STORE_DESK_ORDER_TICKET_COPY.receivedLaneAr}</p>
            <ul className="mt-2 space-y-3">
              {working.map((order) => (
                <li key={order.id} className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm">
                  <p className="font-extrabold text-[#e08a3c]">
                    تذكرة {order.ticketNo} · {order.name} · {order.phone}
                  </p>
                  <p className="mt-1 text-white/70">
                    {order.service === 'pickup' ? STORE_RESTAURANT_LIVE.servicePickupAr : STORE_RESTAURANT_LIVE.serviceDeliveryAr}
                    {order.place ? ` · ${order.place}` : ''}
                  </p>
                  {order.note ? <p className="mt-1 text-white/60">{order.note}</p> : null}
                  <p className="mt-1">{order.lines.map((line) => `${line.nameAr}×${line.qty}`).join(' · ')}</p>
                  <p className="mt-1 font-black">
                    {order.total} ر.س · {order.pay === 'card' ? STORE_RESTAURANT_LIVE.payCardAr : STORE_RESTAURANT_LIVE.payCashAr}
                  </p>
                  <a
                    className="mt-2 inline-flex rounded-full bg-[#e08a3c] px-3 py-1.5 text-xs font-bold text-[#061018]"
                    href={`https://wa.me/?text=${encodeURIComponent(restaurantWhatsAppText(order, state.host.shopName, state.host.vendorMode === 'mobile' ? state.host.pickupMapsUrl : ''))}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {STORE_RESTAURANT_LIVE.whatsappReceiptAr}
                  </a>
                  <StoreDeskTicketActions order={order} accent="#e08a3c" onReceive={() => receiveOrder(order.id)} onFinish={() => finishOrder(order.id)} />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
      <StoreRestaurantDeskChat state={state} onChange={onChange} />
      <StoreDirectPayDesk product="store_restaurant_live" token={token} accent="#e08a3c" />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          {STORE_RESTAURANT_LIVE.restaurantNameLabelAr}
          <input
            className="restaurant-field"
            value={state.host.shopName}
            onChange={(e) => onChange({ ...state, host: { ...state.host, shopName: e.target.value } })}
          />
        </label>
        <StoreShopLogoDesk
          logoSrc={state.host.logoSrc}
          onChange={(logoSrc) => onChange({ ...state, host: { ...state.host, logoSrc } })}
          accent="#e08a3c"
        />
        <label className="block text-sm sm:col-span-2">
          خانة تعريفية
          <input
            className="restaurant-field"
            value={state.host.blurbAr}
            onChange={(e) => onChange({ ...state, host: { ...state.host, blurbAr: e.target.value } })}
          />
        </label>
        {state.host.customFields.map((line, index) => (
          <label key={index} className="block text-sm sm:col-span-2">
            نص مخصص {index + 1}
            <input
              className="restaurant-field"
              value={line}
              onChange={(e) => {
                const customFields = state.host.customFields.slice();
                customFields[index] = e.target.value;
                onChange({ ...state, host: { ...state.host, customFields } });
              }}
            />
          </label>
        ))}
      </div>

      <StoreOpsSection titleAr="الموقع وساعات العمل" accent="#e08a3c">
      <StoreShopPlaceDesk
        value={state.host}
        onChange={(place) => onChange({ ...state, host: { ...state.host, ...place } })}
        copy={STORE_RESTAURANT_LIVE}
        accent="#e08a3c"
      />

      <StoreShopHoursDesk
        value={state.host}
        onChange={(nextHours) => onChange({ ...state, host: { ...state.host, ...nextHours } })}
        accent="#e08a3c"
      />
      </StoreOpsSection>

      <label className="block text-sm">
        {STORE_RESTAURANT_LIVE.flashLabelAr}
        <input
          className="restaurant-field"
          value={state.host.flashAr}
          onChange={(e) => onChange({ ...state, host: { ...state.host, flashAr: e.target.value } })}
          placeholder={STORE_RESTAURANT_LIVE.flashHintAr}
        />
      </label>

      <div className="rounded-2xl border border-white/12 p-4">
        <h3 className="font-extrabold">حالة الأطباق</h3>
        <ul className="mt-3 space-y-2">
          {state.shelf.map((item) => (
            <li key={item.catalogId} className="flex items-center justify-between gap-3 text-sm">
              <span className={item.inStock ? '' : 'text-white/35 line-through'}>{item.nameAr}</span>
              <button
                type="button"
                onClick={() => toggleStock(item.catalogId)}
                className={cn('rounded-full px-3 py-1 text-xs', item.inStock ? 'bg-[#e08a3c] font-bold text-[#061018]' : 'border border-white/20')}
              >
                {item.inStock ? STORE_RESTAURANT_LIVE.stockOnAr : STORE_RESTAURANT_LIVE.stockOffAr}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <StoreRestaurantMenuBoard state={state} onChange={onChange} />

      <StoreOpsSection titleAr="ملصق العرض" accent="#e08a3c">
      <div className="rounded-2xl border border-[#e08a3c]/30 p-4">
        <div id="restaurant-qr-print" className="mx-auto w-64 rounded-xl bg-white p-4 text-center text-[#061018]">
          <p className="text-sm font-black">{state.host.shopName}</p>
          <div className="mx-auto my-3 w-40">
            <QRCode value={shopUrl} size={160} />
          </div>
          <p className="text-xs leading-6">{STORE_RESTAURANT_LIVE.qrPhraseAr}</p>
        </div>
        <button type="button" onClick={printQr} className="mt-3 w-full rounded-full bg-[#e08a3c] py-2 text-sm font-bold text-[#061018]">
          {STORE_RESTAURANT_LIVE.qrPrintAr}
        </button>
        <StoreProductPassDeskButton kind="restaurant" token={token} shopName={state.host.shopName} />
      </div>
      </StoreOpsSection>

      <StoreDeskArchiveDock tickets={state.orderArchive} accent="#e08a3c" filename="restaurant-archive.json" />
      <StoreDeskGuideLink
        to={ROUTE_PATHS.STORE_RESTAURANT_SUPPORT}
        leadAr={STORE_RESTAURANT_SUPPORT.deskLeadAr}
        ctaAr={STORE_RESTAURANT_SUPPORT.deskCtaAr}
        accent={STORE_RESTAURANT_SUPPORT.accent}
      />
      <StoreDeskHelpSupport product="restaurant" />
    </div>
  );
}
