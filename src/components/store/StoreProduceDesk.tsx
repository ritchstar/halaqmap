/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { STORE_PRODUCE_LIVE } from '@/config/storeProduceLive';
import {
  produceArchiveJson,
  produceWhatsAppText,
  playProduceBeep,
  type ProduceLabState,
} from '@/lib/storeProduceLiveLab';
import { StoreProduceIngest } from '@/components/store/StoreProduceIngest';
import { StoreProduceDeskChat } from '@/components/store/StoreProduceChat';
import { StoreProductPassDeskButton } from '@/components/store/StoreProductPassDeskButton';
import { StoreShopHoursDesk } from '@/components/store/StoreShopHoursDesk';
import { StoreShopPlaceDesk } from '@/components/store/StoreShopPlaceDesk';
import { StoreShopPresenceCount } from '@/components/store/StoreShopPresenceCount';
import { StoreTrialOpsNote } from '@/components/store/StoreTrialOpsNote';
import { cn } from '@/lib/utils';

export function StoreProduceDesk({
  state,
  onChange,
  shopUrl,
  token,
}: {
  state: ProduceLabState;
  onChange: (next: ProduceLabState) => void;
  shopUrl: string;
  token: string;
}) {
  const seenCount = useRef(state.orders.length);
  const [flashOn, setFlashOn] = useState(false);
  const unread = state.orders.filter((item) => !item.seen);

  useEffect(() => {
    if (state.orders.length > seenCount.current) {
      playProduceBeep();
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

  function toggleArrived(catalogId: string) {
    onChange({
      ...state,
      shelf: state.shelf.map((item) => (item.catalogId === catalogId ? { ...item, arrivedToday: !item.arrivedToday } : item)),
    });
  }

  function downloadArchive() {
    const blob = new Blob([produceArchiveJson(state)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'produce-archive.json';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function printQr() {
    const node = document.getElementById('produce-qr-print');
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
      <StoreTrialOpsNote productKey="produce" />
      <div className={cn('rounded-2xl border p-4', flashOn || unread.length ? 'produce-alert border-[#3d8b4a]' : 'border-white/12')}>
        <h2 className="text-lg font-extrabold">{STORE_PRODUCE_LIVE.liveOrdersAr}</h2>
        <p className="mt-1 text-sm text-white/60">{unread.length ? `${unread.length} طلب جديد` : 'لا طلبات جديدة الآن.'}</p>
        <StoreShopPresenceCount productTag="store_produce_live" token={token} />
        <ul className="mt-3 space-y-3">
          {state.orders.slice(0, 20).map((order) => (
            <li key={order.id} className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm">
              <p className="font-extrabold text-[#3d8b4a]">
                {order.name} · {order.phone}
              </p>
              <p className="mt-1 text-white/70">
                {order.service === 'pickup' ? STORE_PRODUCE_LIVE.servicePickupAr : STORE_PRODUCE_LIVE.serviceDeliveryAr}
                {order.place ? ` · ${order.place}` : ''}
              </p>
              <p className="mt-1">{order.lines.map((line) => `${line.nameAr}×${line.qty}`).join(' · ')}</p>
              <p className="mt-1 font-black">{order.total} ر.س · {order.pay === 'card' ? STORE_PRODUCE_LIVE.payCardAr : STORE_PRODUCE_LIVE.payCashAr}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  className="rounded-full bg-[#3d8b4a] px-3 py-1.5 text-xs font-bold text-[#061018]"
                  href={`https://wa.me/?text=${encodeURIComponent(produceWhatsAppText(order, state.host.shopName, state.host.vendorMode === 'mobile' ? state.host.pickupMapsUrl : ''))}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {STORE_PRODUCE_LIVE.whatsappReceiptAr}
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
        <button type="button" onClick={downloadArchive} className="mt-4 rounded-full border border-[#3d8b4a]/40 px-4 py-2 text-sm text-[#3d8b4a]">
          {STORE_PRODUCE_LIVE.archiveCtaAr}
        </button>
      </div>
      <StoreProduceDeskChat state={state} onChange={onChange} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          {STORE_PRODUCE_LIVE.shopNameLabelAr}
          <input
            className="produce-field"
            value={state.host.shopName}
            onChange={(e) => onChange({ ...state, host: { ...state.host, shopName: e.target.value } })}
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          خانة تعريفية
          <input
            className="produce-field"
            value={state.host.blurbAr}
            onChange={(e) => onChange({ ...state, host: { ...state.host, blurbAr: e.target.value } })}
          />
        </label>
        {state.host.customFields.map((line, index) => (
          <label key={index} className="block text-sm sm:col-span-2">
            نص مخصص {index + 1}
            <input
              className="produce-field"
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
        copy={STORE_PRODUCE_LIVE}
        accent="#3d8b4a"
      />

      <StoreShopHoursDesk
        value={state.host}
        onChange={(nextHours) => onChange({ ...state, host: { ...state.host, ...nextHours } })}
        accent="#3d8b4a"
      />

      <label className="block text-sm">
        {STORE_PRODUCE_LIVE.flashLabelAr}
        <input
          className="produce-field"
          value={state.host.flashAr}
          onChange={(e) => onChange({ ...state, host: { ...state.host, flashAr: e.target.value } })}
          placeholder={STORE_PRODUCE_LIVE.flashHintAr}
        />
      </label>

      <div className="rounded-2xl border border-white/12 p-4">
        <h3 className="font-extrabold">حالات السلع</h3>
        <ul className="mt-3 space-y-2">
          {state.shelf.map((item) => (
            <li key={item.catalogId} className="flex items-center justify-between gap-3 text-sm">
              <span className={item.inStock ? '' : 'text-white/35 line-through'}>{item.nameAr}</span>
              <span className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleArrived(item.catalogId)}
                  className={cn('rounded-full px-3 py-1 text-xs', item.arrivedToday ? 'bg-[#3d8b4a] font-bold text-[#061018]' : 'border border-white/20')}
                >
                  {item.arrivedToday ? STORE_PRODUCE_LIVE.arrivedOnAr : STORE_PRODUCE_LIVE.arrivedOffAr}
                </button>
                <button
                  type="button"
                  onClick={() => toggleStock(item.catalogId)}
                  className={cn('rounded-full px-3 py-1 text-xs', item.inStock ? 'bg-[#3d8b4a] font-bold text-[#061018]' : 'border border-white/20')}
                >
                  {item.inStock ? STORE_PRODUCE_LIVE.stockOnAr : STORE_PRODUCE_LIVE.stockOffAr}
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <StoreProduceIngest state={state} onChange={onChange} />

      <div className="rounded-2xl border border-[#3d8b4a]/30 p-4">
        <div id="produce-qr-print" className="mx-auto w-64 rounded-xl bg-white p-4 text-center text-[#061018]">
          <p className="text-sm font-black">{state.host.shopName}</p>
          <div className="mx-auto my-3 w-40">
            <QRCode value={shopUrl} size={160} />
          </div>
          <p className="text-xs leading-6">{STORE_PRODUCE_LIVE.qrPhraseAr}</p>
        </div>
        <button type="button" onClick={printQr} className="mt-3 w-full rounded-full bg-[#3d8b4a] py-2 text-sm font-bold text-[#061018]">
          {STORE_PRODUCE_LIVE.qrPrintAr}
        </button>
        <StoreProductPassDeskButton kind="produce" token={token} shopName={state.host.shopName} />
      </div>
    </div>
  );
}
