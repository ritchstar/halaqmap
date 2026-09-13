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
  s = s.replace(/restaurant-chatly/g, 'cafe-chatly');
  s = s.replace(/\.restaurant-field/g, '.cafe-field');
  s = s.replace(/--rc-/g, '--cc-');
  s = s.replace(/مطعمنا1/g, 'كافينا1');
  s = s.replace(/#e08a3c/g, '#c48a4a');
  s = s.replace(/#c97430/g, '#9a5c32');
  s = s.replace(/#d4924a/g, '#b87a3a');
  s = s.replace(/#fdeee0/g, '#fde8d4');
  s = s.replace(/#f5dcc8/g, '#f0d4bc');
  s = s.replace(/#f0e6d8/g, '#f0e4d4');
  s = s.replace(/#f0e0cc/g, '#ede0d0');
  s = s.replace(/#e8c4a8/g, '#e0b890');
  s = s.replace(/#f0c9a8/g, '#e8c090');
  s = s.replace(/rgba\(224,138,60,/g, 'rgba(196,138,74,');
  fs.writeFileSync(dest, s);
}

function transformStorefront(src, dest) {
  let s = fs.readFileSync(src, 'utf8');
  s = replaceAll(s, [
    ['RestaurantChatlyStorefront', 'CafeChatlyStorefront'],
    ['RestaurantMatamnaMark', 'CafeCafenaMark'],
    ['StoreRestaurantBuyerChat', 'StoreCafeBuyerChat'],
    ['STORE_RESTAURANT_LIVE_ACCENT', 'STORE_CAFE_LIVE_ACCENT'],
    ['STORE_RESTAURANT_LIVE_LAB_TOKEN', 'STORE_CAFE_LIVE_LAB_TOKEN'],
    ['STORE_RESTAURANT_LIVE', 'STORE_CAFE_LIVE'],
    ['restaurantCartTotal', 'cafeCartTotal'],
    ['readSavedRestaurantBuyer', 'readSavedCafeBuyer'],
    ['writeSavedRestaurantBuyer', 'writeSavedCafeBuyer'],
    ['RestaurantLabState', 'CafeLabState'],
    ['RestaurantOrderLine', 'CafeOrderLine'],
    ['RestaurantPayMethod', 'CafePayMethod'],
    ['RestaurantService', 'CafeService'],
    ['store_restaurant_live', 'store_cafe_live'],
    ['restaurant-chatly', 'cafe-chatly'],
    ['مطعمنا1', 'كافينا1'],
    ['واجهة زبون مطعمنا1', 'واجهة زبون كافينا1'],
    ['UtensilsCrossed', 'Coffee'],
    ['#e08a3c', '#c48a4a'],
    ['#c97430', '#9a5c32'],
    ['#d4924a', '#b87a3a'],
    ['#fdeee0', '#fde8d4'],
    ['#f5dcc8', '#f0d4bc'],
    ['#f0e6d8', '#f0e4d4'],
    ['rgba(224,138,60,', 'rgba(196,138,74,'],
  ]);

  s = s.replace(
    `import {
  readSavedRestaurantBuyer,
  restaurantCartTotal,
  writeSavedRestaurantBuyer,
  type RestaurantLabState,
  type RestaurantOrderLine,
  type RestaurantPayMethod,
  type RestaurantService,
} from '@/lib/storeRestaurantLiveLab';`,
    `import {
  cafeCartTotal,
  readSavedCafeBuyer,
  writeSavedCafeBuyer,
  type CafeLabState,
  type CafeOrderLine,
  type CafePayMethod,
  type CafeService,
} from '@/lib/storeCafeLiveLab';`,
  );

  s = s.replace(
    `import {
  STORE_RESTAURANT_LIVE,
  STORE_RESTAURANT_LIVE_ACCENT,
  STORE_RESTAURANT_LIVE_LAB_TOKEN,
  restaurantShelfVisible,
} from '@/config/storeRestaurantLive';`,
    `import {
  STORE_CAFE_LIVE,
  STORE_CAFE_LIVE_ACCENT,
  STORE_CAFE_LIVE_LAB_TOKEN,
} from '@/config/storeCafeLive';`,
  );

  s = s.replace(
    'const isLab = token === STORE_CAFE_LIVE_LAB_TOKEN;\n  const saved = useMemo(() => (isLab ? null : readSavedCafeBuyer()), [isLab]);',
    'const saved = useMemo(() => readSavedCafeBuyer(), []);',
  );

  s = s.replace(
    `const [saveBuyer, setSaveBuyer] = useState(Boolean(saved) && !isLab);
  const [placeDesc, setPlaceDesc] = useState(saved?.place || '');
  const [placeCoords, setPlaceCoords] = useState(isLab ? STORE_CAFE_LIVE.labDemoCoordsAr : '');
  const [placeAdopted, setPlaceAdopted] = useState(isLab);
  const [note, setNote] = useState('');`,
    `const [saveBuyer, setSaveBuyer] = useState(Boolean(saved));
  const [place, setPlace] = useState(saved?.place || '');
  const [note, setNote] = useState('');`,
  );

  s = s.replace(
    'const visible = state.shelf.filter((item) => restaurantShelfVisible(item.availability, item.inStock));',
    'const visible = state.shelf.filter((item) => item.inStock);',
  );

  s = s.replace(
    /function submit\(\) \{[\s\S]*?\n  \}\n\n  function openCheckout/,
    `function submit() {
    if (name.trim().length < 2 || phone.trim().length < 9 || !lines.length) return;
    if (serviceKind === 'delivery' && place.trim().length < 3) return;

    const ticketNo = state.host.nextTicket || 1;
    const order = {
      id: \`\${Date.now()}\`,
      ticketNo,
      name: name.trim().slice(0, 40),
      phone: phone.trim().slice(0, 20),
      place: place.trim().slice(0, 160),
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
    writeSavedCafeBuyer(saveBuyer ? { name: order.name, phone: order.phone, place: order.place } : null);
    setQty({});
    setNote('');
    setSent(\`وصلت تذكرة الكاشير رقم \${ticketNo}.\`);
    setCartOpen(false);
    setCheckoutOpen(false);
    showNotice('وصلت تذكرة الكاشير');
  }

  function openCheckout`,
  );

  s = s.replace(
    /{needsPlace \? \([\s\S]*?\) : null}\n            <label className="block text-xs font-bold text-\[#647463\]">\n              \{STORE_CAFE_LIVE\.buyerNoteLabelAr\}/,
    `{mobile ? (
              <p className="text-sm font-bold text-[#c48a4a]">{STORE_MOBILE_VENDOR.pickupFromCartAr}</p>
            ) : null}
            {needsPlace ? (
              <>
                <label className="block text-xs font-bold text-[#647463]">
                  {STORE_CAFE_LIVE.buyerPlaceLabelAr}
                  <Input
                    required
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="mt-2 h-11 border-[#d4dfcc] bg-white"
                    maxLength={160}
                  />
                </label>
                <StoreBuyerLocateButtons
                  value={place}
                  accent={STORE_CAFE_LIVE_ACCENT}
                  copy={STORE_CAFE_LIVE}
                  onLocated={setPlace}
                />
              </>
            ) : null}
            <label className="block text-xs font-bold text-[#647463]">
              {STORE_CAFE_LIVE.buyerNoteLabelAr}`,
  );

  s = s.replace(/required=\{!isLab\}/g, 'required');
  s = s.replace(/placeholder=\{isLab \? STORE_CAFE_LIVE\.labDemoNameAr : undefined\}/g, '');
  s = s.replace(/placeholder=\{isLab \? STORE_CAFE_LIVE\.labDemoPhoneAr : undefined\}/g, '');

  s = s.replace(
    "{item.featured ? STORE_CAFE_LIVE.featuredTitleAr : STORE_CAFE_LIVE.stockAvailableAr}",
    "{item.featured ? STORE_CAFE_LIVE.featuredTitleAr : STORE_CAFE_LIVE.stockOnAr}",
  );

  s = s.replace(
    '{STORE_CAFE_LIVE.priceEstimateNoteAr}',
    "'الأسعار تقديرية حتى تأكيد الكاشير'",
  );

  fs.writeFileSync(dest, s);
}

function transformDesk(src, dest) {
  let s = fs.readFileSync(src, 'utf8');
  s = replaceAll(s, [
    ['RestaurantChatlyDesk', 'CafeChatlyDesk'],
    ['RestaurantMatamnaMark', 'CafeCafenaMark'],
    ['RestaurantLabState', 'CafeLabState'],
    ['RestaurantOrder', 'CafeOrder'],
    ['STORE_RESTAURANT_LIVE_ACCENT', 'STORE_CAFE_LIVE_ACCENT'],
    ['STORE_RESTAURANT_LIVE', 'STORE_CAFE_LIVE'],
    ['STORE_RESTAURANT_SUPPORT', 'STORE_CAFE_SUPPORT'],
    ['ROUTE_PATHS.STORE_RESTAURANT_SUPPORT', 'ROUTE_PATHS.STORE_CAFE_SUPPORT'],
    ['restaurantWhatsAppText', 'cafeWhatsAppText'],
    ['StoreRestaurantMenuBoard', 'StoreCafeMenuBoard'],
    ['StoreRestaurantDeskChat', 'StoreCafeDeskChat'],
    ['store_restaurant_live', 'store_cafe_live'],
    ['restaurant-chatly', 'cafe-chatly'],
    ['restaurant-field', 'cafe-field'],
    ['restaurant-archive.json', 'cafe-archive.json'],
    ['product="restaurant"', 'product="cafe"'],
    ['kind="restaurant"', 'kind="cafe"'],
    ["applyDeskFinish(state.orders, state.orderArchive, id, 'restaurant')", "applyDeskFinish(state.orders, state.orderArchive, id, 'cafe')"],
    ['STORE_PRODUCT_TRIAL_PRODUCTS.restaurant', 'STORE_PRODUCT_TRIAL_PRODUCTS.cafe'],
    ['مطعمنا1', 'كافينا1'],
    ['المطبخ', 'الكاشير'],
    ['#e08a3c', '#c48a4a'],
    ['#c97430', '#9a5c32'],
    ['#d4924a', '#b87a3a'],
    ['#fdeee0', '#fde8d4'],
  ]);

  s = s.replace(
    `import {
  cafeWhatsAppText,
  type CafeLabState,
  type CafeOrder,
} from '@/lib/storeRestaurantLiveLab';`,
    `import {
  cafeWhatsAppText,
  type CafeLabState,
  type CafeOrder,
} from '@/lib/storeCafeLiveLab';`,
  );

  s = s.replace(
    `import {
  STORE_RESTAURANT_AVAILABILITY_ORDER,
  STORE_CAFE_LIVE,
  STORE_CAFE_LIVE_ACCENT,
  restaurantAvailabilityLabel,
  type StoreRestaurantAvailability,
} from '@/config/storeRestaurantLive';`,
    `import { STORE_CAFE_LIVE, STORE_CAFE_LIVE_ACCENT } from '@/config/storeCafeLive';`,
  );

  s = s.replace(
    /function cycleAvailability\(catalogId: string\) \{[\s\S]*?\n  \}\n\n  function clearArchive\(\) \{[\s\S]*?\n  \}/,
    `function toggleStock(catalogId: string) {
    onChange({
      ...state,
      shelf: state.shelf.map((item) => (item.catalogId === catalogId ? { ...item, inStock: !item.inStock } : item)),
    });
  }

  function clearArchive() {
    if (!window.confirm('حذف أرشيف التذاكر؟')) return;
    onChange({ ...state, orderArchive: [] });
  }`,
  );

  s = s.replace(/onCycleAvailability=\{cycleAvailability\}/g, 'onToggleStock={toggleStock}');
  s = s.replace(/onCycleAvailability/g, 'onToggleStock');
  s = s.replace(
    'function ProductsSection({\n  shelf,\n  onToggleStock,\n  ingestSlot,',
    'function ProductsSection({\n  shelf,\n  onToggleStock,\n  ingestSlot,',
  );
  s = s.replace(
    'copy="دورة حالة الطبق، وإدارة مكتبة الأطباق من مكان واحد."',
    'copy="إيقاف الصنف أو إعادة تفعيله، وإدارة القائمة من مكان واحد."',
  );
  s = s.replace(
    'title="حدّث قائمة الطعام من مكان واحد"',
    'title="حدّث رف المشروبات من مكان واحد"',
  );

  s = s.replace(
    /shelf\.map\(\(item\) => \{[\s\S]*?onClick=\{\(\) => onToggleStock\(item\.catalogId\)\}[\s\S]*?\}\)\}/,
    `shelf.map((item) => (
              <div key={item.catalogId} className="flex items-center gap-3 rounded-xl border border-[#e8dfd0] bg-white p-4">
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-[10px] font-black',
                    item.inStock ? 'bg-[#fde8d4] text-[#c48a4a]' : 'bg-[#f8e3e7] text-[#a15e55]',
                  )}
                >
                  {item.inStock ? STORE_CAFE_LIVE.stockOnAr : STORE_CAFE_LIVE.stockOffAr}
                </span>
                <p className={cn('font-black text-[#2a1810]', !item.inStock && 'text-[#849284] line-through')}>{item.nameAr}</p>
                <Button
                  type="button"
                  onClick={() => onToggleStock(item.catalogId)}
                  className="mr-auto h-8 rounded-lg bg-transparent px-2 text-[10px] font-black text-[#c48a4a] shadow-none hover:bg-[#fde8d4]"
                >
                  {item.inStock ? 'إيقاف' : 'تفعيل'}
                </Button>
              </div>
            ))}`,
  );

  s = s.replace(
    'shopNameLabel={STORE_CAFE_LIVE.shopNameLabelAr}',
    'shopNameLabel={STORE_CAFE_LIVE.cafeNameLabelAr}',
  );

  fs.writeFileSync(dest, s);
}

const mark = `/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دمغة كافينا1 — مستوحاة من تصميم Chatly.
 */
import { Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

type CafeCafenaMarkProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  inverse?: boolean;
};

const sizeClasses = {
  sm: 'size-9 rounded-lg',
  md: 'size-11 rounded-xl',
  lg: 'size-14 rounded-2xl',
};

export function CafeCafenaMark({ className, size = 'md', inverse = false }: CafeCafenaMarkProps) {
  const iconSize = size === 'sm' ? 17 : size === 'md' ? 21 : 27;

  return (
    <span
      aria-label="دمغة كافينا1"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border shadow-sm',
        sizeClasses[size],
        inverse
          ? 'border-white/20 bg-white/10 text-[#fde8d4]'
          : 'border-[#e8c090] bg-[#fde8d4] text-[#9a5c32]',
        className,
      )}
    >
      <span className="absolute inset-x-1.5 bottom-1.5 h-1 rounded-full bg-current opacity-25" />
      <Coffee size={iconSize} strokeWidth={2} className="relative" />
    </span>
  );
}
`;

const uiLib = `/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تفعيل واجهة Chatly الهندسية لكافينا1 — بلا تغيير منطق الطلب أو الدفع.
 */
import { STORE_CAFE_LIVE_LAB_TOKEN } from '@/config/storeCafeLive';

function envEnabled(name: string, fallback: boolean): boolean {
  const raw = String((import.meta as { env?: Record<string, unknown> }).env?.[name] ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return true;
  return fallback;
}

/** عند تعطيل التعميم: معاينة المختبر فقط إن كان \`VITE_STORE_CAFE_CHATLY_UI\` مفعّلاً. */
export const STORE_CAFE_CHATLY_UI_LAB_DEFAULT = envEnabled('VITE_STORE_CAFE_CHATLY_UI', true);

/** افتراضياً: كل رموز كافينا1. \`VITE_STORE_CAFE_CHATLY_UI_ALL=false\` للرجوع الطارئ. */
export const STORE_CAFE_CHATLY_UI_ALL = envEnabled('VITE_STORE_CAFE_CHATLY_UI_ALL', true);

export function isCafeChatlyUi(token: string): boolean {
  if (STORE_CAFE_CHATLY_UI_ALL) return true;
  if (!STORE_CAFE_CHATLY_UI_LAB_DEFAULT) return false;
  return token.trim() === STORE_CAFE_LIVE_LAB_TOKEN;
}
`;

const cafeDir = path.join(root, 'components', 'store', 'cafe');
fs.mkdirSync(cafeDir, { recursive: true });

transformCss(
  path.join(root, 'styles', 'restaurantChatly.css'),
  path.join(root, 'styles', 'cafeChatly.css'),
);
transformStorefront(
  path.join(root, 'components', 'store', 'restaurant', 'RestaurantChatlyStorefront.tsx'),
  path.join(cafeDir, 'CafeChatlyStorefront.tsx'),
);
transformDesk(
  path.join(root, 'components', 'store', 'restaurant', 'RestaurantChatlyDesk.tsx'),
  path.join(cafeDir, 'CafeChatlyDesk.tsx'),
);
fs.writeFileSync(path.join(cafeDir, 'CafeCafenaMark.tsx'), mark);
fs.writeFileSync(path.join(root, 'lib', 'storeCafeChatlyUi.ts'), uiLib);

console.log('Cafe Chatly files generated.');
