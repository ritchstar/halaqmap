import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

function replaceAll(s, pairs) {
  for (const [a, b] of pairs) s = s.split(a).join(b);
  return s;
}

function transformCss(src, dest) {
  let s = fs.readFileSync(src, 'utf8');
  s = s.replace(/grocers-chatly/g, 'restaurant-chatly');
  s = s.replace(/\.grocers-field/g, '.restaurant-field');
  s = s.replace(/--gc-/g, '--rc-');
  s = s.replace(/تمويناتا1/g, 'مطعمنا1');
  s = s.replace(/#8fbf7a/g, '#e08a3c');
  s = s.replace(/#6fa058/g, '#c97430');
  s = s.replace(/#7aab65/g, '#d4924a');
  s = s.replace(/#d8f0cc/g, '#fde8d4');
  s = s.replace(/#eaf4e4/g, '#fdeee0');
  s = s.replace(/#eaf1e4/g, '#fdeee0');
  s = s.replace(/#eef4e9/g, '#fdf3e8');
  s = s.replace(/#edf4e8/g, '#fdf3e8');
  s = s.replace(/#f0f5ec/g, '#fdf6ef');
  s = s.replace(/#20352b/g, '#2a1810');
  s = s.replace(/#22332b/g, '#2a1810');
  fs.writeFileSync(dest, s);
}

function transformStorefront(src, dest) {
  let s = fs.readFileSync(src, 'utf8');
  s = replaceAll(s, [
    ['GrocersChatlyStorefront', 'RestaurantChatlyStorefront'],
    ['GrocersTamwinatMark', 'RestaurantMatamnaMark'],
    ['StoreGrocersBuyerChat', 'StoreRestaurantBuyerChat'],
    ['STORE_GROCERS_LIVE_ACCENT', 'STORE_RESTAURANT_LIVE_ACCENT'],
    ['STORE_GROCERS_LIVE_LAB_TOKEN', 'STORE_RESTAURANT_LIVE_LAB_TOKEN'],
    ['STORE_GROCERS_LIVE', 'STORE_RESTAURANT_LIVE'],
    ['grocersCatalogImage', 'restaurantHeroImage'],
    ['grocersCartTotal', 'restaurantCartTotal'],
    ['readSavedGrocersBuyer', 'readSavedRestaurantBuyer'],
    ['writeSavedGrocersBuyer', 'writeSavedRestaurantBuyer'],
    ['GrocersLabState', 'RestaurantLabState'],
    ['GrocersOrderLine', 'RestaurantOrderLine'],
    ['GrocersPayMethod', 'RestaurantPayMethod'],
    ['GrocersService', 'RestaurantService'],
    ['store_grocers_live', 'store_restaurant_live'],
    ['grocers-chatly', 'restaurant-chatly'],
    ['تمويناتا1 — مقاضيك للبيت', 'مطعمنا1 — من مطبخ الحي إلى بابك'],
    ['واجهة زبون تمويناتا1', 'واجهة زبون مطعمنا1'],
    ['STORE_RESTAURANT_LIVE.shopTitleAr', 'STORE_RESTAURANT_LIVE.heroCaptionAr'],
    ['Apple', 'UtensilsCrossed'],
  ]);

  s = s.replace(
    `import {
  compressImageFile,
  grocersCartTotal,
  readSavedGrocersBuyer,
  writeSavedGrocersBuyer,
  type GrocersLabState,
  type GrocersOrderLine,
  type GrocersPayMethod,
} from '@/lib/storeGrocersLiveLab';`,
    `import {
  readSavedRestaurantBuyer,
  restaurantCartTotal,
  writeSavedRestaurantBuyer,
  type RestaurantLabState,
  type RestaurantOrderLine,
  type RestaurantPayMethod,
  type RestaurantService,
} from '@/lib/storeRestaurantLiveLab';`,
  );

  s = s.replace(
    `import {
  STORE_GROCERS_LIVE,
  STORE_GROCERS_LIVE_ACCENT,
  STORE_GROCERS_LIVE_LAB_TOKEN,
  grocersCatalogImage,
} from '@/config/storeGrocersLive';`,
    `import {
  STORE_RESTAURANT_LIVE,
  restaurantShelfVisible,
} from '@/config/storeRestaurantLive';`,
  );

  s = s.replace(
    `import {
  clearNeighborCartQty,
  readNeighborCartQty,
  writeNeighborCartQty,
} from '@/lib/neighborCartStorage';
import { NeighborShopEvents } from '@/lib/neighborShopAnalytics';`,
    '',
  );

  s = s.replace('type GrocersService = \'delivery\' | \'pickup\';\n\n', '');

  s = s.replace(
    'const saved = useMemo(() => (isLab ? null : readSavedGrocersBuyer()), [isLab]);\n  const [qty, setQty] = useState<Record<string, number>>(() => readNeighborCartQty(\'grocers\', token));',
    'const saved = useMemo(() => (isLab ? null : readSavedRestaurantBuyer()), [isLab]);\n  const [qty, setQty] = useState<Record<string, number>>({});',
  );

  s = s.replace(
    `const [saveBuyer, setSaveBuyer] = useState(false);
  const [facadeSrc, setFacadeSrc] = useState('');
  const [placeConfirmed, setPlaceConfirmed] = useState(false);`,
    `const [saveBuyer, setSaveBuyer] = useState(Boolean(saved) && !isLab);
  const [placeDesc, setPlaceDesc] = useState(saved?.place || '');
  const [placeCoords, setPlaceCoords] = useState(isLab ? STORE_RESTAURANT_LIVE.labDemoCoordsAr : '');
  const [placeAdopted, setPlaceAdopted] = useState(isLab);
  const [note, setNote] = useState('');`,
  );

  s = s.replace(
    "const [place, setPlace] = useState(saved?.place || '');",
    '',
  );

  s = s.replace(
    'const visible = state.shelf.filter((item) => item.inStock);',
    'const serviceKind = mobile ? \'pickup\' : service;\n  const visible = state.shelf.filter((item) => restaurantShelfVisible(item.availability, item.inStock));',
  );

  s = s.replace(
    "const featured = visible.filter((item) => item.featured).slice(0, 10);\n  const shelfItems = visible.filter((item) => !featured.some((row) => row.catalogId === item.catalogId));\n  const needsPlace = service === 'delivery';",
    "const featured = visible.filter((item) => item.featured).slice(0, 8);\n  const shelfItems = visible.filter((item) => !featured.some((row) => row.catalogId === item.catalogId));\n  const today = visible.find((item) => item.catalogId === 'today-board') || featured[0];\n  const needsPlace = serviceKind === 'delivery';",
  );

  s = s.replace(/\n  useEffect\(\(\) => \{\n    writeNeighborCartQty[\s\S]*?\n  \}, \[token, qty\]\);\n/, '\n');

  s = s.replace(
    /\n  useEffect\(\(\) => \{\n    if \(viewedRef\.current\) return;[\s\S]*?NeighborShopEvents\.viewStore[\s\S]*?\n  \}, \[token, isLab\]\);\n/,
    '\n',
  );

  s = s.replace('const viewedRef = useRef(false);', '');

  s = s.replace(
    /async function onFacade[\s\S]*?\n  \}\n\n  function showNotice/,
    'function showNotice',
  );

  s = s.replace(
    /function bump\(id: string, delta: number\) \{[\s\S]*?\n  \}/,
    `function bump(id: string, delta: number) {
    setQty((current) => {
      const next = Math.max(0, (current[id] || 0) + delta);
      return { ...current, [id]: next };
    });
  }`,
  );

  s = s.replace(
    /function serviceLabel\(s: GrocersService\) \{[\s\S]*?\n  \}/,
    `function serviceLabel(s: RestaurantService) {
    if (s === 'pickup') return STORE_RESTAURANT_LIVE.servicePickupAr;
    return STORE_RESTAURANT_LIVE.serviceDeliveryAr;
  }`,
  );

  s = s.replace(
    /function submit\(\) \{[\s\S]*?\n  \}\n\n  function openCheckout/,
    `function submit() {
    const orderName = isLab ? STORE_RESTAURANT_LIVE.labDemoNameAr : name.trim().slice(0, 40);
    const orderPhone = isLab ? STORE_RESTAURANT_LIVE.labDemoPhoneAr : phone.trim().slice(0, 20);
    const orderPlaceDesc = isLab ? STORE_RESTAURANT_LIVE.labDemoPlaceAr : placeDesc.trim().slice(0, 120);
    const orderCoords = isLab ? STORE_RESTAURANT_LIVE.labDemoCoordsAr : placeCoords.trim();
    const combinedPlace = [orderPlaceDesc, orderCoords].filter(Boolean).join(' · ').slice(0, 160);

    if (!isLab && orderName.length < 2) return;
    if (!isLab && orderPhone.length < 9) return;
    if (!lines.length) return;
    if (serviceKind === 'delivery') {
      if (!isLab && orderPlaceDesc.length < 3) return;
      if (!isLab && !placeAdopted) return;
    }

    const ticketNo = state.host.nextTicket || 1;
    const order = {
      id: \`\${Date.now()}\`,
      ticketNo,
      name: orderName,
      phone: orderPhone,
      place: combinedPlace,
      note: note.trim().slice(0, 160),
      service: serviceKind,
      pay,
      lines,
      total,
      at: new Date().toISOString(),
      seen: false,
    };
    onChange({
      ...state,
      host: { ...state.host, nextTicket: ticketNo + 1 },
      orders: [order, ...state.orders].slice(0, 200),
    });
    if (!isLab) {
      writeSavedRestaurantBuyer(saveBuyer ? { name: order.name, phone: order.phone, place: orderPlaceDesc } : null);
    }
    setQty({});
    setNote('');
    setSent(\`\${STORE_RESTAURANT_LIVE.orderSentAr} (\${ticketNo})\`);
    setCartOpen(false);
    setCheckoutOpen(false);
    showNotice(STORE_RESTAURANT_LIVE.orderSentAr);
  }

  function openCheckout`,
  );

  s = s.replace(
    /function openCheckout\(\) \{[\s\S]*?\n  \}/,
    `function openCheckout() {
    setCheckoutOpen(true);
  }`,
  );

  s = s.replace(
    /onChange=\{\(event\) => \{[\s\S]*?NeighborShopEvents\.searchProducts[\s\S]*?\}\}/,
    'onChange={(event) => setSearch(event.target.value)}',
  );

  s = s.replace(
    /onClick=\{\(\) => \{\n                    setCategory\(item\);[\s\S]*?\}\}/g,
    'onClick={() => setCategory(item)}',
  );

  s = s.replace(
    `{featured.length ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-[#cad7bd] bg-[#fffdf5] px-4 py-3 text-xs font-bold text-[#637263]">
                  <span className="size-2 rounded-full bg-[#8fbf7a]" />
                  {featured.length} {STORE_RESTAURANT_LIVE.featuredTitleAr}
                </div>
              ) : null}`,
    `{today ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-[#f0c9a8] bg-[#fffdf5] px-4 py-3 text-xs font-bold text-[#637263]">
                  <span className="size-2 rounded-full bg-[#e08a3c]" />
                  {STORE_RESTAURANT_LIVE.todayTitleAr}: {today.nameAr}
                </div>
              ) : null}`,
  );

  const todaySection = `
        {today ? (
          <section className="border-b border-[#dfe4d6] py-9">
            <p className="text-xs font-bold tracking-[0.16em] text-[#d4924a]">{STORE_RESTAURANT_LIVE.todayTitleAr}</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-[#f0c9a8] bg-[#fffdf5]">
              {today.photoSrc ? (
                <img src={today.photoSrc} alt={today.nameAr} className="aspect-[16/9] w-full object-cover" loading="lazy" />
              ) : null}
              <div className="flex items-center justify-between gap-3 px-4 py-4">
                <div>
                  <h2 className="text-xl font-black text-[#2a1810]">{today.nameAr}</h2>
                  <p className="mt-1 text-sm font-black text-[#e08a3c]">{today.price} ر.س</p>
                </div>
                <QtyControls value={qty[today.catalogId] || 0} onMinus={() => bump(today.catalogId, -1)} onPlus={() => bump(today.catalogId, 1)} />
              </div>
            </div>
          </section>
        ) : null}

`;

  s = s.replace('<section className="sticky top-0 z-20', todaySection + '        <section className="sticky top-0 z-20');

  s = s.replace(
    `{needsPlace ? (
              <>
                <label className="block text-xs font-bold text-[#647463]">
                  {mobile ? STORE_MOBILE_VENDOR.placeHintAr : STORE_GROCERS_LIVE.buyerPlaceLabelAr}
                  <Input
                    value={place}
                    onChange={(e) => {
                      setPlace(e.target.value);
                      setPlaceConfirmed(false);
                    }}
                    className="mt-2 h-11 border-[#d4dfcc] bg-white"
                    maxLength={160}
                    placeholder={isLab ? STORE_GROCERS_LIVE.labDemoPlaceAr : undefined}
                  />
                </label>
                <StoreBuyerLocateButtons
                  value={place}
                  accent={STORE_GROCERS_LIVE_ACCENT}
                  copy={STORE_GROCERS_LIVE}
                  onLocated={(next) => {
                    setPlace(next);
                    setPlaceConfirmed(true);
                  }}
                />
                {placeConfirmed && !place.startsWith('http') ? (
                  <p className="text-sm text-[#7aab65]">{STORE_GROCERS_LIVE.locateSavedAr}</p>
                ) : null}
              </>
            ) : null}
            {!isLab && needsPlace ? (
              <label className="block text-xs font-bold text-[#647463]">
                {STORE_GROCERS_LIVE.buyerFacadeLabelAr}
                <p className="mt-1 text-xs leading-5 text-[#849284]">{STORE_GROCERS_LIVE.buyerFacadeHintAr}</p>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-xs"
                  onChange={(e) => void onFacade(e.target.files?.[0])}
                />
              </label>
            ) : null}`,
    `{mobile ? (
              <p className="text-sm font-bold text-[#e08a3c]">{STORE_MOBILE_VENDOR.pickupFromCartAr}</p>
            ) : null}
            {needsPlace ? (
              <>
                <label className="block text-xs font-bold text-[#647463]">
                  {STORE_RESTAURANT_LIVE.buyerPlaceLabelAr}
                  <Input
                    required={!isLab}
                    value={placeDesc}
                    onChange={(e) => setPlaceDesc(e.target.value)}
                    className="mt-2 h-11 border-[#d4dfcc] bg-white"
                    maxLength={120}
                    placeholder={isLab ? STORE_RESTAURANT_LIVE.labDemoPlaceAr : 'الحي، الشارع، رقم المبنى أو أقرب علامة'}
                  />
                </label>
                <label className="block text-xs font-bold text-[#647463]">
                  {STORE_RESTAURANT_LIVE.buyerPlaceCoordsLabelAr}
                  <Input
                    readOnly
                    value={placeCoords}
                    className="mt-2 h-11 border-[#d4dfcc] bg-white text-[#849284]"
                    placeholder={STORE_RESTAURANT_LIVE.buyerPlaceCoordsHintAr}
                  />
                </label>
                {!isLab ? (
                  <StoreBuyerLocateButtons
                    value={placeCoords}
                    accent={STORE_RESTAURANT_LIVE_ACCENT}
                    copy={STORE_RESTAURANT_LIVE}
                    onLocated={(mapsUrl) => {
                      setPlaceCoords(mapsUrl);
                      setPlaceAdopted(false);
                    }}
                    onAdopted={() => setPlaceAdopted(true)}
                  />
                ) : null}
                {!isLab && placeCoords && !placeAdopted ? (
                  <p className="text-sm text-amber-700">اعتمد الموقع قبل إرسال الطلب.</p>
                ) : null}
              </>
            ) : null}
            <label className="block text-xs font-bold text-[#647463]">
              {STORE_RESTAURANT_LIVE.buyerNoteLabelAr}
              <Input value={note} onChange={(e) => setNote(e.target.value)} className="mt-2 h-11 border-[#d4dfcc] bg-white" maxLength={160} />
            </label>`,
  );

  s = s.replace(
    /onClick=\{\(\) => \{\n                  setService\(id\);\n                  if \(id === 'pickup'\) setPlaceConfirmed\(false\);\n                \}\}/g,
    "onClick={() => setService(id as RestaurantService)}",
  );

  s = s.replace(
    `{mobile ? (
              <p className="text-sm font-bold text-[#e08a3c]">{STORE_MOBILE_VENDOR.pickupFromCartAr}</p>
            ) : null}
            {needsPlace ? (`,
    `{needsPlace ? (`,
  );

  s = s.replace(
    'const src = grocersCatalogImage(imageIndex);',
    'const src = item.photoSrc?.trim() || STORE_RESTAURANT_LIVE.heroImage;',
  );

  s = s.replace(
    'const heroSrc = liveActivityCoverSrc(state.shelf) || grocersCatalogImage(0);',
    'const heroSrc = today?.photoSrc || liveActivityCoverSrc(state.shelf) || STORE_RESTAURANT_LIVE.heroImage;',
  );

  s = s.replace(
    /import \{ liveActivityCoverSrc \} from '@\/lib\/storeLiveActivityShelf';/,
    "import { liveActivityCoverSrc } from '@/lib/storeLiveActivityShelf';\n\nfunction restaurantHeroImage(_index: number) {\n  return STORE_RESTAURANT_LIVE.heroImage;\n}",
  );

  s = s.replace(
    `{item.featured ? 'الأكثر طلباً' : 'متوفر'}`,
    "{item.featured ? STORE_RESTAURANT_LIVE.featuredTitleAr : STORE_RESTAURANT_LIVE.stockAvailableAr}",
  );

  fs.writeFileSync(dest, s);
}

function transformDesk(src, dest) {
  let s = fs.readFileSync(src, 'utf8');
  s = replaceAll(s, [
    ['GrocersChatlyDesk', 'RestaurantChatlyDesk'],
    ['GrocersTamwinatMark', 'RestaurantMatamnaMark'],
    ['GrocersLabState', 'RestaurantLabState'],
    ['GrocersOrder', 'RestaurantOrder'],
    ['STORE_GROCERS_LIVE_ACCENT', 'STORE_RESTAURANT_LIVE_ACCENT'],
    ['STORE_GROCERS_LIVE', 'STORE_RESTAURANT_LIVE'],
    ['STORE_GROCERS_SUPPORT', 'STORE_RESTAURANT_SUPPORT'],
    ['ROUTE_PATHS.STORE_GROCERS_SUPPORT', 'ROUTE_PATHS.STORE_RESTAURANT_SUPPORT'],
    ['grocersWhatsAppText', 'restaurantWhatsAppText'],
    ['StoreGrocersIngest', 'StoreRestaurantMenuBoard'],
    ['StoreGrocersDeskChat', 'StoreRestaurantDeskChat'],
    ['store_grocers_live', 'store_restaurant_live'],
    ['grocers-chatly', 'restaurant-chatly'],
    ['grocers-field', 'restaurant-field'],
    ['grocers-archive.json', 'restaurant-archive.json'],
    ['product="grocers"', 'product="restaurant"'],
    ['kind="grocers"', 'kind="restaurant"'],
    ["applyDeskFinish(state.orders, state.orderArchive, id, 'grocers')", "applyDeskFinish(state.orders, state.orderArchive, id, 'restaurant')"],
    ['STORE_PRODUCT_TRIAL_PRODUCTS.grocers', 'STORE_PRODUCT_TRIAL_PRODUCTS.restaurant'],
    ['تمويناتا1', 'مطعمنا1'],
    ['كاشيرك', 'المطبخ'],
    ['جار', 'ضيف الحي'],
  ]);

  s = s.replace(
    `import {
  grocersWhatsAppText,
  type GrocersLabState,
  type GrocersOrder,
} from '@/lib/storeGrocersLiveLab';`,
    `import {
  restaurantWhatsAppText,
  type RestaurantLabState,
  type RestaurantOrder,
} from '@/lib/storeRestaurantLiveLab';`,
  );

  s = s.replace(
    `import { STORE_GROCERS_LIVE, STORE_GROCERS_LIVE_ACCENT } from '@/config/storeGrocersLive';`,
    `import {
  STORE_RESTAURANT_AVAILABILITY_ORDER,
  STORE_RESTAURANT_LIVE,
  STORE_RESTAURANT_LIVE_ACCENT,
  restaurantAvailabilityLabel,
  type StoreRestaurantAvailability,
} from '@/config/storeRestaurantLive';`,
  );

  s = s.replace(
    /function toggleStock\(catalogId: string\) \{[\s\S]*?\n  \}/,
    `function cycleAvailability(catalogId: string) {
    onChange({
      ...state,
      shelf: state.shelf.map((item) => {
        if (item.catalogId !== catalogId) return item;
        const current = item.availability || (item.inStock ? 'available' : 'out');
        const index = STORE_RESTAURANT_AVAILABILITY_ORDER.indexOf(current);
        const next = STORE_RESTAURANT_AVAILABILITY_ORDER[(index + 1) % STORE_RESTAURANT_AVAILABILITY_ORDER.length];
        return {
          ...item,
          availability: next,
          inStock: next === 'available' || next === 'limited',
        };
      }),
    });
  }

  function clearArchive() {
    if (!window.confirm(STORE_RESTAURANT_LIVE.archiveDeleteConfirmAr)) return;
    onChange({ ...state, orderArchive: [] });
  }`,
  );

  s = s.replace('onToggleStock={toggleStock}', 'onCycleAvailability={cycleAvailability}');
  s = s.replace(
    'function ProductsSection({\n  shelf,\n  onToggleStock,\n  ingestSlot,',
    'function ProductsSection({\n  shelf,\n  onCycleAvailability,\n  ingestSlot,',
  );
  s = s.replace(
    'onToggleStock: (id: string) => void;\n  ingestSlot: ReactNode;',
    'onCycleAvailability: (id: string) => void;\n  ingestSlot: ReactNode;',
  );
  s = s.replace(
    'copy="إيقاف الصنف، وإدخال مجموعة سلع دفعة واحدة."',
    'copy="دورة حالة الطبق، وإدارة مكتبة الأطباق من مكان واحد."',
  );
  s = s.replace(
    'title="حدّث الرف من مكان واحد"',
    'title="حدّث قائمة الطعام من مكان واحد"',
  );

  s = s.replace(
    /shelf\.map\(\(item\) => \([\s\S]*?\)\)\}/,
    `shelf.map((item) => {
            const status = (item.availability || (item.inStock ? 'available' : 'out')) as StoreRestaurantAvailability;
            const visible = status === 'available' || status === 'limited';
            return (
            <div key={item.catalogId} className="flex items-center gap-3 rounded-xl border border-[#dfe7d9] bg-white p-4">
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl',
                  !visible ? 'bg-[#f8e3e7] text-[#a15e55]' : 'bg-[#fdeee0] text-[#e08a3c]',
                )}
              >
                <Package size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn('font-black text-[#2a1810]', !visible && 'text-[#849284] line-through')}>{item.nameAr}</p>
                <p className="mt-1 text-xs text-[#849284]">{item.price} ر.س</p>
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                <Button
                  type="button"
                  onClick={() => onCycleAvailability(item.catalogId)}
                  className="h-8 rounded-lg bg-transparent px-2 text-[10px] font-black text-[#e08a3c] shadow-none hover:bg-[#fdeee0]"
                >
                  {restaurantAvailabilityLabel(status)}
                </Button>
                {item.featured ? (
                  <span className="h-8 rounded-lg bg-[#fdeee0] px-2 text-[10px] font-black leading-8 text-[#d4924a]">{STORE_RESTAURANT_LIVE.featuredTitleAr}</span>
                ) : null}
              </div>
            </div>
            );
          })}`,
  );

  s = s.replace(
    '<StoreDeskArchiveDock\n                      tickets={state.orderArchive}\n                      accent={STORE_RESTAURANT_LIVE_ACCENT}\n                      filename="restaurant-archive.json"\n                    />',
    `<StoreDeskArchiveDock
                      tickets={state.orderArchive}
                      accent={STORE_RESTAURANT_LIVE_ACCENT}
                      filename="restaurant-archive.json"
                      onClear={clearArchive}
                      clearLabelAr={STORE_RESTAURANT_LIVE.archiveDeleteAr}
                    />`,
  );

  s = s.replace(
    'function displayName(order: { name: string }) {',
    'function displayName(order: { name: string; ticketNo?: number }) {',
  );
  s = s.replace(
    '<span className="text-xs font-black text-[#d4924a]">{displayName(order)}</span>',
    '<span className="text-xs font-black text-[#d4924a]">تذكرة {order.ticketNo} · {displayName(order)}</span>',
  );
  s = s.replace(
    '{order.place ? <p className="mt-1 text-xs text-[#849284]">{displayPlace(order)}</p> : null}\n          {!maskPii && order.facadeSrc ? (\n            <img src={order.facadeSrc} alt="" className="mt-2 h-20 w-28 rounded-lg object-cover" />\n          ) : null}',
    '{order.place ? <p className="mt-1 text-xs text-[#849284]">{displayPlace(order)}</p> : null}\n          {order.note ? <p className="mt-1 text-xs text-[#849284]">{order.note}</p> : null}',
  );

  s = s.replace(
    'shopNameLabel={STORE_GROCERS_LIVE.shopNameLabelAr}',
    'shopNameLabel={STORE_RESTAURANT_LIVE.restaurantNameLabelAr}',
  );

  s = s.replace(
    '<Metric label="الأكثر طلباً" value={String(featuredCount)} hint="أصناف مميزة" tone="gold" />',
    '<Metric label={STORE_RESTAURANT_LIVE.todayTitleAr} value={String(todayBoardCount)} hint="طبق اليوم" tone="gold" />',
  );
  s = s.replace(
    'const featuredCount = state.shelf.filter((item) => item.featured).length;',
    "const todayBoardCount = state.shelf.some((item) => item.catalogId === 'today-board') ? 1 : 0;",
  );
  s = s.replace(/featuredCount/g, 'todayBoardCount');

  fs.writeFileSync(dest, s);
}

transformCss(path.join(root, 'styles/grocersChatly.css'), path.join(root, 'styles/restaurantChatly.css'));
transformStorefront(
  path.join(root, 'components/store/grocers/GrocersChatlyStorefront.tsx'),
  path.join(root, 'components/store/restaurant/RestaurantChatlyStorefront.tsx'),
);
transformDesk(
  path.join(root, 'components/store/grocers/GrocersChatlyDesk.tsx'),
  path.join(root, 'components/store/restaurant/RestaurantChatlyDesk.tsx'),
);
console.log('done');
