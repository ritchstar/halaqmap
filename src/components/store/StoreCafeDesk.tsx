/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import QRCode from 'react-qr-code';
import { STORE_CAFE_LIVE } from '@/config/storeCafeLive';
import { cafeWhatsAppText, type CafeLabState } from '@/lib/storeCafeLiveLab';
import { StoreDeskOrderAlert } from '@/components/store/StoreDeskOrderAlert';
import { StoreDeskControlTitle } from '@/components/store/StoreDeskControlTitle';
import { StoreDeskArchiveDock } from '@/components/store/StoreDeskArchiveDock';
import { StoreDeskTicketActions } from '@/components/store/StoreDeskTicketActions';
import { STORE_PRODUCT_TRIAL_PRODUCTS } from '@/config/storeProductTrial';
import { STORE_DESK_ORDER_TICKET_COPY } from '@/config/storeDeskOrderTicket';
import { applyDeskFinish, deskOrderPhase, isLiveDeskTicket, receiveDeskTicket } from '@/lib/storeDeskOrderTicket';
import { StoreCafeMenuBoard } from '@/components/store/StoreCafeMenuBoard';
import { StoreCafeDeskChat } from '@/components/store/StoreCafeChat';
import { StoreShopPresenceCount } from '@/components/store/StoreShopPresenceCount';
import { StoreProductPassDeskButton } from '@/components/store/StoreProductPassDeskButton';
import { StoreShopHoursDesk } from '@/components/store/StoreShopHoursDesk';
import { StoreShopPlaceDesk } from '@/components/store/StoreShopPlaceDesk';
import { StoreDeskHelpSupport } from '@/components/store/StoreDeskHelpSupport';
import { cn } from '@/lib/utils';

export function StoreCafeDesk({
  state,
  onChange,
  shopUrl,
  showTrialNote = false,
  token,
}: {
  state: CafeLabState;
  onChange: (next: CafeLabState) => void;
  shopUrl: string;
  showTrialNote?: boolean;
  token: string;
}) {
  const live = state.orders.filter(isLiveDeskTicket);
  const fresh = live.filter((item) => deskOrderPhase(item) === 'new');
  const working = live.filter((item) => deskOrderPhase(item) === 'received');

  function receiveOrder(id: string) {
    onChange({ ...state, orders: receiveDeskTicket(state.orders, id) });
  }

  function finishOrder(id: string) {
    const next = applyDeskFinish(state.orders, state.orderArchive, id, 'cafe');
    onChange({ ...state, orders: next.orders, orderArchive: next.orderArchive });
  }

  function toggleStock(catalogId: string) {
    onChange({
      ...state,
      shelf: state.shelf.map((item) => (item.catalogId === catalogId ? { ...item, inStock: !item.inStock } : item)),
    });
  }

  function printQr() {
    const node = document.getElementById('cafe-qr-print');
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
        product="cafe"
        token={token}
        shopName={state.host.shopName}
        orderIds={fresh.map((item) => item.id)}
        unreadCount={fresh.length}
      />
      <StoreDeskControlTitle trialNote={showTrialNote ? STORE_PRODUCT_TRIAL_PRODUCTS.cafe.deskNoteAr : ''} />
      <div className={cn('rounded-2xl border p-4', fresh.length ? 'restaurant-alert border-[#c48a4a]' : 'border-white/12')}>
        <h2 className="text-lg font-extrabold">{STORE_CAFE_LIVE.liveOrdersAr}</h2>
        <p className="mt-1 text-sm text-white/60">{fresh.length ? `${fresh.length} تذكرة جديدة` : 'لا تذاكر جديدة الآن.'}</p>
        <StoreShopPresenceCount productTag="store_cafe_live" token={token} />
        {fresh.length ? (
          <>
            <p className="mt-3 text-xs font-extrabold text-[#c48a4a]">{STORE_DESK_ORDER_TICKET_COPY.newLaneAr}</p>
            <ul className="mt-2 space-y-3">
              {fresh.map((order) => (
                <li key={order.id} className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm">
                  <p className="font-extrabold text-[#c48a4a]">
                    تذكرة {order.ticketNo} · {order.name} · {order.phone}
                  </p>
                  <p className="mt-1 text-white/70">
                    {order.service === 'pickup' ? STORE_CAFE_LIVE.servicePickupAr : STORE_CAFE_LIVE.serviceDeliveryAr}
                    {order.place ? ` · ${order.place}` : ''}
                  </p>
                  {order.note ? <p className="mt-1 text-white/60">{order.note}</p> : null}
                  <p className="mt-1">{order.lines.map((line) => `${line.nameAr}×${line.qty}`).join(' · ')}</p>
                  <p className="mt-1 font-black">
                    {order.total} ر.س · {order.pay === 'card' ? STORE_CAFE_LIVE.payCardAr : STORE_CAFE_LIVE.payCashAr}
                  </p>
                  <a
                    className="mt-2 inline-flex rounded-full bg-[#c48a4a] px-3 py-1.5 text-xs font-bold text-[#061018]"
                    href={`https://wa.me/?text=${encodeURIComponent(cafeWhatsAppText(order, state.host.shopName, state.host.vendorMode === 'mobile' ? state.host.pickupMapsUrl : ''))}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {STORE_CAFE_LIVE.whatsappReceiptAr}
                  </a>
                  <StoreDeskTicketActions order={order} accent="#c48a4a" onReceive={() => receiveOrder(order.id)} onFinish={() => finishOrder(order.id)} />
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
                  <p className="font-extrabold text-[#c48a4a]">
                    تذكرة {order.ticketNo} · {order.name} · {order.phone}
                  </p>
                  <p className="mt-1 text-white/70">
                    {order.service === 'pickup' ? STORE_CAFE_LIVE.servicePickupAr : STORE_CAFE_LIVE.serviceDeliveryAr}
                    {order.place ? ` · ${order.place}` : ''}
                  </p>
                  {order.note ? <p className="mt-1 text-white/60">{order.note}</p> : null}
                  <p className="mt-1">{order.lines.map((line) => `${line.nameAr}×${line.qty}`).join(' · ')}</p>
                  <p className="mt-1 font-black">
                    {order.total} ر.س · {order.pay === 'card' ? STORE_CAFE_LIVE.payCardAr : STORE_CAFE_LIVE.payCashAr}
                  </p>
                  <a
                    className="mt-2 inline-flex rounded-full bg-[#c48a4a] px-3 py-1.5 text-xs font-bold text-[#061018]"
                    href={`https://wa.me/?text=${encodeURIComponent(cafeWhatsAppText(order, state.host.shopName, state.host.vendorMode === 'mobile' ? state.host.pickupMapsUrl : ''))}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {STORE_CAFE_LIVE.whatsappReceiptAr}
                  </a>
                  <StoreDeskTicketActions order={order} accent="#c48a4a" onReceive={() => receiveOrder(order.id)} onFinish={() => finishOrder(order.id)} />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
      <StoreCafeDeskChat state={state} onChange={onChange} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          {STORE_CAFE_LIVE.cafeNameLabelAr}
          <input
            className="cafe-field"
            value={state.host.shopName}
            onChange={(e) => onChange({ ...state, host: { ...state.host, shopName: e.target.value } })}
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          خانة تعريفية
          <input
            className="cafe-field"
            value={state.host.blurbAr}
            onChange={(e) => onChange({ ...state, host: { ...state.host, blurbAr: e.target.value } })}
          />
        </label>
        {state.host.customFields.map((line, index) => (
          <label key={index} className="block text-sm sm:col-span-2">
            نص مخصص {index + 1}
            <input
              className="cafe-field"
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

      <StoreShopPlaceDesk
        value={state.host}
        onChange={(place) => onChange({ ...state, host: { ...state.host, ...place } })}
        copy={STORE_CAFE_LIVE}
        accent="#c48a4a"
      />

      <StoreShopHoursDesk
        value={state.host}
        onChange={(nextHours) => onChange({ ...state, host: { ...state.host, ...nextHours } })}
        accent="#c48a4a"
      />

      <label className="block text-sm">
        {STORE_CAFE_LIVE.flashLabelAr}
        <input
          className="cafe-field"
          value={state.host.flashAr}
          onChange={(e) => onChange({ ...state, host: { ...state.host, flashAr: e.target.value } })}
          placeholder={STORE_CAFE_LIVE.flashHintAr}
        />
      </label>

      <div className="rounded-2xl border border-white/12 p-4">
        <h3 className="font-extrabold">حالة الأصناف</h3>
        <ul className="mt-3 space-y-2">
          {state.shelf.map((item) => (
            <li key={item.catalogId} className="flex items-center justify-between gap-3 text-sm">
              <span className={item.inStock ? '' : 'text-white/35 line-through'}>{item.nameAr}</span>
              <button
                type="button"
                onClick={() => toggleStock(item.catalogId)}
                className={cn('rounded-full px-3 py-1 text-xs', item.inStock ? 'bg-[#c48a4a] font-bold text-[#061018]' : 'border border-white/20')}
              >
                {item.inStock ? STORE_CAFE_LIVE.stockOnAr : STORE_CAFE_LIVE.stockOffAr}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <StoreCafeMenuBoard state={state} onChange={onChange} />

      <div className="rounded-2xl border border-[#c48a4a]/30 p-4">
        <div id="cafe-qr-print" className="mx-auto w-64 rounded-xl bg-white p-4 text-center text-[#061018]">
          <p className="text-sm font-black">{state.host.shopName}</p>
          <div className="mx-auto my-3 w-40">
            <QRCode value={shopUrl} size={160} />
          </div>
          <p className="text-xs leading-6">{STORE_CAFE_LIVE.qrPhraseAr}</p>
        </div>
        <button type="button" onClick={printQr} className="mt-3 w-full rounded-full bg-[#c48a4a] py-2 text-sm font-bold text-[#061018]">
          {STORE_CAFE_LIVE.qrPrintAr}
        </button>
        <StoreProductPassDeskButton kind="cafe" token={token} shopName={state.host.shopName} />
      </div>

      <StoreDeskArchiveDock tickets={state.orderArchive} accent="#c48a4a" filename="cafe-archive.json" />
      <StoreDeskHelpSupport product="cafe" />
    </div>
  );
}
