/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { STORE_KITCHEN_LIVE } from '@/config/storeKitchenLive';
import {
  kitchenArchiveJson,
  kitchenWhatsAppHref,
  newKitchenQrStamp,
  playKitchenBeep,
  type KitchenLabState,
} from '@/lib/storeKitchenLiveLab';
import { StoreKitchenMenuBoard } from '@/components/store/StoreKitchenMenuBoard';
import { StoreShopPresenceCount } from '@/components/store/StoreShopPresenceCount';
import { cn } from '@/lib/utils';

export function StoreKitchenDesk({
  state,
  onChange,
  shopUrl,
  token,
}: {
  state: KitchenLabState;
  onChange: (next: KitchenLabState) => void;
  shopUrl: string;
  token: string;
}) {
  const seenCount = useRef(state.orders.length);
  const [flashOn, setFlashOn] = useState(false);
  const unread = state.orders.filter((item) => !item.seen);

  useEffect(() => {
    if (state.orders.length > seenCount.current) {
      playKitchenBeep();
      setFlashOn(true);
      window.setTimeout(() => setFlashOn(false), 1400);
    }
    seenCount.current = state.orders.length;
  }, [state.orders.length]);

  function markSeen(id: string) {
    onChange({
      ...state,
      orders: state.orders.map((item) => (item.id === id ? { ...item, seen: true } : item)),
    });
  }

  function toggleStock(catalogId: string) {
    onChange({
      ...state,
      shelf: state.shelf.map((item) => (item.catalogId === catalogId ? { ...item, inStock: !item.inStock } : item)),
    });
  }

  function downloadArchive() {
    const blob = new Blob([kitchenArchiveJson(state)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kitchen-archive.json';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function printQr() {
    const node = document.getElementById('kitchen-qr-print');
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
      <div className={cn('rounded-2xl border p-4', flashOn || unread.length ? 'restaurant-alert border-[#b45a3c]' : 'border-white/12')}>
        <h2 className="text-lg font-extrabold">{STORE_KITCHEN_LIVE.liveOrdersAr}</h2>
        <p className="mt-1 text-sm text-white/60">{unread.length ? `${unread.length} تذكرة جديدة` : 'لا تذاكر جديدة الآن.'}</p>
        <StoreShopPresenceCount productTag="store_kitchen_live" token={token} />
        <ul className="mt-3 space-y-3">
          {state.orders.slice(0, 20).map((order) => (
            <li key={order.id} className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm">
              <p className="font-extrabold text-[#b45a3c]">
                تذكرة {order.ticketNo} · {order.name} · {order.phone}
              </p>
              <p className="mt-1 text-white/70">
                {order.service === 'pickup' ? STORE_KITCHEN_LIVE.servicePickupAr : STORE_KITCHEN_LIVE.serviceDeliveryAr}
                {order.place ? ` · ${order.place}` : ''}
              </p>
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
                  className="rounded-full bg-[#b45a3c] px-3 py-1.5 text-xs font-bold text-[#061018]"
                  href={kitchenWhatsAppHref(order, state.host.shopName, state.host.opsPhone)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {STORE_KITCHEN_LIVE.whatsappReceiptAr}
                </a>
                {!order.seen ? (
                  <button type="button" className="text-xs text-white/50" onClick={() => markSeen(order.id)}>
                    علّم مقروءاً
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <button type="button" onClick={downloadArchive} className="mt-4 rounded-full border border-[#b45a3c]/40 px-4 py-2 text-sm text-[#b45a3c]">
          {STORE_KITCHEN_LIVE.archiveCtaAr}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          {STORE_KITCHEN_LIVE.kitchenNameLabelAr}
          <input
            className="restaurant-field"
            value={state.host.shopName}
            onChange={(e) => onChange({ ...state, host: { ...state.host, shopName: e.target.value } })}
          />
        </label>
        <label className="block text-sm">
          {STORE_KITCHEN_LIVE.opsPhoneLabelAr}
          <input
            className="restaurant-field"
            value={state.host.opsPhone}
            onChange={(e) => onChange({ ...state, host: { ...state.host, opsPhone: e.target.value.slice(0, 20) } })}
            inputMode="tel"
          />
        </label>
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
          className={cn('rounded-full px-4 py-2 text-sm', state.host.acceptingOrders ? 'border border-white/20' : 'bg-[#b45a3c] font-bold text-[#061018]')}
        >
          {state.host.acceptingOrders ? STORE_KITCHEN_LIVE.pauseOnAr : STORE_KITCHEN_LIVE.pauseOffAr}
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...state, host: { ...state.host, showSoldOut: !state.host.showSoldOut } })}
          className={cn('rounded-full px-4 py-2 text-sm', state.host.showSoldOut ? 'bg-[#b45a3c] font-bold text-[#061018]' : 'border border-white/20')}
        >
          {STORE_KITCHEN_LIVE.showSoldOutAr}
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...state, host: { ...state.host, scheduleEnabled: !state.host.scheduleEnabled } })}
          className={cn('rounded-full px-4 py-2 text-sm', state.host.scheduleEnabled ? 'bg-[#b45a3c] font-bold text-[#061018]' : 'border border-white/20')}
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
                className={cn('rounded-full px-3 py-1 text-xs', item.inStock ? 'bg-[#b45a3c] font-bold text-[#061018]' : 'border border-white/20')}
              >
                {item.inStock ? STORE_KITCHEN_LIVE.stockOnAr : STORE_KITCHEN_LIVE.stockOffAr}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <StoreKitchenMenuBoard state={state} onChange={onChange} />

      <div className="rounded-2xl border border-[#b45a3c]/30 p-4">
        <div id="kitchen-qr-print" className="mx-auto w-64 rounded-xl bg-white p-4 text-center text-[#061018]">
          <p className="text-sm font-black">{state.host.shopName}</p>
          <div className="mx-auto my-3 w-40">
            <QRCode value={state.host.qrActive ? shopUrl : 'رمز أُبطل'} size={160} />
          </div>
          <p className="text-xs leading-6">{STORE_KITCHEN_LIVE.qrPhraseAr}</p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={printQr} className="rounded-full bg-[#b45a3c] py-2 text-sm font-bold text-[#061018]">
            {STORE_KITCHEN_LIVE.qrPrintAr}
          </button>
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
            className="sm:col-span-2 rounded-full border border-[#b45a3c]/40 py-2 text-sm text-[#b45a3c]"
          >
            {STORE_KITCHEN_LIVE.qrRenewAr}
          </button>
        </div>
      </div>
    </div>
  );
}
