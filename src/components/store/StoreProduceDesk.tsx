/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { StoreLiveShopShareDesk } from '@/components/store/StoreLiveShopShareDesk';
import { STORE_PRODUCE_LIVE } from '@/config/storeProduceLive';
import { STORE_SHOP_HOURS_COPY } from '@/config/storeShopHours';
import { produceServiceLabelAr, produceWhatsAppText, type ProduceLabState } from '@/lib/storeProduceLiveLab';
import { StoreDeskOrderAlert } from '@/components/store/StoreDeskOrderAlert';
import { StoreDeskControlTitle } from '@/components/store/StoreDeskControlTitle';
import { StoreDeskArchiveDock } from '@/components/store/StoreDeskArchiveDock';
import { StoreDeskTicketActions } from '@/components/store/StoreDeskTicketActions';
import { STORE_PRODUCT_TRIAL_PRODUCTS } from '@/config/storeProductTrial';
import { STORE_DESK_ORDER_TICKET_COPY } from '@/config/storeDeskOrderTicket';
import { applyDeskFinish, deskOrderPhase, isLiveDeskTicket, receiveDeskTicket } from '@/lib/storeDeskOrderTicket';
import { StoreProduceIngest } from '@/components/store/StoreProduceIngest';
import { StoreProduceDeskChat } from '@/components/store/StoreProduceChat';
import { StoreShopHoursDesk } from '@/components/store/StoreShopHoursDesk';
import { StoreShopPlaceDesk } from '@/components/store/StoreShopPlaceDesk';
import { StoreShopPresenceCount } from '@/components/store/StoreShopPresenceCount';
import { StoreDeskHelpSupport } from '@/components/store/StoreDeskHelpSupport';
import { StoreDeskGuideLink } from '@/components/store/StoreDeskGuideLink';
import { StoreDeskCornerDock } from '@/components/store/StoreDeskCornerNav';
import { StoreShopIdentityDesk } from '@/components/store/StoreShopIdentityDesk';
import { StoreShopBackgroundDesk } from '@/components/store/StoreShopBackgroundDesk';
import { STORE_PRODUCE_SUPPORT } from '@/config/storeProductSupport';
import { StoreOpsSection } from '@/components/store/StoreOpsSection';
import { StoreDirectPayDesk } from '@/components/store/StoreDirectPayDesk';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

export function StoreProduceDesk({
  state,
  onChange,
  shopUrl,
  token,
  showTrialNote = false,
}: {
  state: ProduceLabState;
  onChange: (next: ProduceLabState) => void;
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
    const next = applyDeskFinish(state.orders, state.orderArchive, id, 'produce');
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

  return (
    <div className="space-y-6 pb-14">
      <StoreDeskOrderAlert
        product="produce"
        token={token}
        shopName={state.host.shopName}
        orderIds={fresh.map((item) => item.id)}
        unreadCount={fresh.length}
      />
      <StoreDeskControlTitle trialNote={showTrialNote ? STORE_PRODUCT_TRIAL_PRODUCTS.produce.deskNoteAr : ''} />
      <StoreShopIdentityDesk
        shopNameLabel={STORE_PRODUCE_LIVE.shopNameLabelAr}
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
        accent="#3d8b4a"
        fieldClassName="produce-field"
      />
      <StoreShopBackgroundDesk
        value={{ shopHeaderBg: state.host.shopHeaderBg, shopPageBg: state.host.shopPageBg }}
        onChange={(bg) => onChange({ ...state, host: { ...state.host, ...bg } })}
        accent="#3d8b4a"
        fieldClassName="produce-field"
      />
      <div className={cn('rounded-2xl border p-4', fresh.length ? 'produce-alert border-[#3d8b4a]' : 'border-white/12')}>
        <h2 className="text-lg font-extrabold">{STORE_PRODUCE_LIVE.liveOrdersAr}</h2>
        <p className="mt-1 text-sm text-white/60">{fresh.length ? `${fresh.length} طلب جديد` : 'لا طلبات جديدة الآن.'}</p>
        <StoreShopPresenceCount productTag="store_produce_live" token={token} />
        {fresh.length ? (
          <>
            <p className="mt-3 text-xs font-extrabold text-[#3d8b4a]">{STORE_DESK_ORDER_TICKET_COPY.newLaneAr}</p>
            <ul className="mt-2 space-y-3">
              {fresh.map((order) => (
                <li key={order.id} className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm">
                  <p className="font-extrabold text-[#3d8b4a]">
                    {order.name} · {order.phone}
                  </p>
                  <p className="mt-1 text-white/70">
                    {produceServiceLabelAr(order.service)}
                    {order.place ? ` · ${order.place}` : ''}
                  </p>
                  <p className="mt-1">{order.lines.map((line) => `${line.nameAr}×${line.qty}`).join(' · ')}</p>
                  <p className="mt-1 font-black">{order.total} ر.س · {order.pay === 'card' ? STORE_PRODUCE_LIVE.payCardAr : STORE_PRODUCE_LIVE.payCashAr}</p>
                  <a
                    className="mt-2 inline-flex rounded-full bg-[#3d8b4a] px-3 py-1.5 text-xs font-bold text-[#061018]"
                    href={`https://wa.me/?text=${encodeURIComponent(produceWhatsAppText(order, state.host.shopName, state.host.vendorMode === 'mobile' ? state.host.pickupMapsUrl : ''))}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {STORE_PRODUCE_LIVE.whatsappReceiptAr}
                  </a>
                  <StoreDeskTicketActions order={order} accent="#3d8b4a" onReceive={() => receiveOrder(order.id)} onFinish={() => finishOrder(order.id)} />
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
                  <p className="font-extrabold text-[#3d8b4a]">
                    {order.name} · {order.phone}
                  </p>
                  <p className="mt-1 text-white/70">
                    {produceServiceLabelAr(order.service)}
                    {order.place ? ` · ${order.place}` : ''}
                  </p>
                  <p className="mt-1">{order.lines.map((line) => `${line.nameAr}×${line.qty}`).join(' · ')}</p>
                  <p className="mt-1 font-black">{order.total} ر.س · {order.pay === 'card' ? STORE_PRODUCE_LIVE.payCardAr : STORE_PRODUCE_LIVE.payCashAr}</p>
                  <a
                    className="mt-2 inline-flex rounded-full bg-[#3d8b4a] px-3 py-1.5 text-xs font-bold text-[#061018]"
                    href={`https://wa.me/?text=${encodeURIComponent(produceWhatsAppText(order, state.host.shopName, state.host.vendorMode === 'mobile' ? state.host.pickupMapsUrl : ''))}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {STORE_PRODUCE_LIVE.whatsappReceiptAr}
                  </a>
                  <StoreDeskTicketActions order={order} accent="#3d8b4a" onReceive={() => receiveOrder(order.id)} onFinish={() => finishOrder(order.id)} />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
      <StoreProduceDeskChat state={state} onChange={onChange} />
      <StoreDirectPayDesk product="store_produce_live" token={token} accent="#3d8b4a" />

      <StoreOpsSection titleAr="الموقع وساعات العمل" accent="#3d8b4a">
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
      </StoreOpsSection>

      <label className="block text-sm">
        {STORE_PRODUCE_LIVE.flashLabelAr}
        <input
          className="produce-field"
          value={state.host.flashAr}
          onChange={(e) => onChange({ ...state, host: { ...state.host, flashAr: e.target.value } })}
          placeholder={STORE_PRODUCE_LIVE.flashHintAr}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...state, host: { ...state.host, acceptingOrders: !state.host.acceptingOrders } })}
          className={cn('rounded-full px-4 py-2 text-sm', state.host.acceptingOrders ? 'border border-white/20' : 'bg-[#3d8b4a] font-bold text-[#061018]')}
        >
          {state.host.acceptingOrders ? STORE_SHOP_HOURS_COPY.pauseOnAr : STORE_SHOP_HOURS_COPY.pauseOffAr}
        </button>
      </div>

      <StoreOpsSection titleAr="حالات السلع" accent="#3d8b4a">
      <div className="rounded-2xl border border-white/12 p-4">
        <h3 className="font-extrabold">حالات السلع</h3>
        <ul className="mt-3 max-h-72 space-y-2 overflow-auto">
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
      </StoreOpsSection>

      <StoreOpsSection titleAr={STORE_PRODUCE_LIVE.ingestTitleAr} accent="#3d8b4a">
        <StoreProduceIngest state={state} onChange={onChange} />
      </StoreOpsSection>

      <StoreOpsSection titleAr="ملصق العرض" accent="#3d8b4a">
        <StoreLiveShopShareDesk
          kind="produce"
          token={token}
          shopName={state.host.shopName}
          shopUrl={shopUrl}
          qrPhraseAr={STORE_PRODUCE_LIVE.qrPhraseAr}
          qrPrintAr={STORE_PRODUCE_LIVE.qrPrintAr}
          accent="#3d8b4a"
          showTitle={false}
        />
      </StoreOpsSection>

      <StoreDeskArchiveDock tickets={state.orderArchive} accent="#3d8b4a" filename="produce-archive.json" />
      <StoreDeskCornerDock>
        <StoreDeskGuideLink
          to={ROUTE_PATHS.STORE_PRODUCE_SUPPORT}
          leadAr={STORE_PRODUCE_SUPPORT.deskLeadAr}
          labelAr={STORE_PRODUCE_SUPPORT.landingCtaAr}
        />
        <StoreDeskHelpSupport product="produce" />
      </StoreDeskCornerDock>
    </div>
  );
}
