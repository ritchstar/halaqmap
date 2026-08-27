/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * محرّك إيميل المتجر: روابط الصفحات وروابط المسوّقين تُصدَّر أيقونات
 * متمركزة بستايل المنتج أو المجموعة التسويقية. لا يُستورد من App.
 */
import { resolveResendFromAddress } from './resendFrom.js';
import { storeAffiliateCheckoutLinks, type StoreAffiliateCheckoutLinks } from './storeAffiliateCode.js';

export type StoreMailThemeId = 'wedding' | 'event' | 'lounge' | 'grocers' | 'restaurant' | 'cafe' | 'kitchen' | 'affiliate';

export type StoreMailTheme = {
  id: StoreMailThemeId;
  markAr: string;
  titleAr: string;
  accent: string;
  ink: string;
  canvas: string;
  ring: string;
};

export type StoreMailIconTile = {
  href: string;
  markAr: string;
  titleAr: string;
  captionAr: string;
  theme: StoreMailThemeId;
};

const THEMES: Record<StoreMailThemeId, StoreMailTheme> = {
  wedding: {
    id: 'wedding',
    markAr: 'ا',
    titleAr: 'افراحي1',
    accent: '#e8c547',
    ink: '#061018',
    canvas: '#1a1208',
    ring: '#f0d36a',
  },
  event: {
    id: 'event',
    markAr: 'ج',
    titleAr: 'اجواء1',
    accent: '#14b8a6',
    ink: '#042f2e',
    canvas: '#06201e',
    ring: '#5eead4',
  },
  lounge: {
    id: 'lounge',
    markAr: 'ل',
    titleAr: 'لاونجا1',
    accent: '#d4a574',
    ink: '#1a1208',
    canvas: '#1a140c',
    ring: '#e8c49a',
  },
  grocers: {
    id: 'grocers',
    markAr: 'ت',
    titleAr: 'تمويناتا1',
    accent: '#8fbf7a',
    ink: '#102010',
    canvas: '#0f1a10',
    ring: '#b7e0a4',
  },
  restaurant: {
    id: 'restaurant',
    markAr: 'م',
    titleAr: 'مطعمنا1',
    accent: '#e08a3c',
    ink: '#1a0e08',
    canvas: '#1a120c',
    ring: '#f0b27a',
  },
  cafe: {
    id: 'cafe',
    markAr: 'ك',
    titleAr: 'كافينا1',
    accent: '#c48a4a',
    ink: '#1a1008',
    canvas: '#1a120c',
    ring: '#e0b27a',
  },
  kitchen: {
    id: 'kitchen',
    markAr: 'ط',
    titleAr: 'طبختنا1',
    accent: '#b45a3c',
    ink: '#1a0c08',
    canvas: '#1a0c08',
    ring: '#d48a6a',
  },
  affiliate: {
    id: 'affiliate',
    markAr: 'س',
    titleAr: 'المجموعة التسويقية للمتجر الإلكتروني',
    accent: '#e8c547',
    ink: '#061018',
    canvas: '#07141c',
    ring: '#14b8a6',
  },
};

export const STORE_MAIL_ENGINE_LINE_AR =
  'المتجر يصدر المسارات أيقونات تشغيل جاهزة، بلا لصق عناوين طويلة.';

export function storeMailTheme(id: StoreMailThemeId): StoreMailTheme {
  return THEMES[id];
}

export function escapeStoreMailHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function iconTileHtml(tile: StoreMailIconTile): string {
  const theme = THEMES[tile.theme];
  const href = escapeStoreMailHtml(tile.href);
  const mark = escapeStoreMailHtml(tile.markAr);
  const title = escapeStoreMailHtml(tile.titleAr);
  const caption = escapeStoreMailHtml(tile.captionAr);
  return `<td align="center" valign="top" style="padding:8px 10px">
<a href="${href}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:inline-block">
<table role="presentation" cellpadding="0" cellspacing="0" align="center">
<tr>
<td align="center" valign="middle" width="72" height="72" style="width:72px;height:72px;border-radius:24px;background:${theme.accent};border:2px solid ${theme.ring};color:${theme.ink};font-size:28px;font-weight:800;font-family:Tajawal,Arial,sans-serif;line-height:72px">${mark}</td>
</tr>
<tr>
<td align="center" style="padding-top:8px;color:${theme.accent};font-size:13px;font-weight:800;font-family:Tajawal,Arial,sans-serif;line-height:1.45">${title}</td>
</tr>
<tr>
<td align="center" style="padding-top:2px;color:#c5c0b4;font-size:11px;font-weight:700;font-family:Tajawal,Arial,sans-serif">${caption}</td>
</tr>
</table>
</a>
</td>`;
}

export function renderStoreMailIconRow(tiles: StoreMailIconTile[]): string {
  if (tiles.length === 0) return '';
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto">
<tr>
${tiles.map(iconTileHtml).join('\n')}
</tr>
</table>`;
}

export function buildStoreMailHtml(input: {
  theme: StoreMailThemeId;
  kickerAr: string;
  titleAr: string;
  leadAr: string;
  iconRows: StoreMailIconTile[][];
  notesAr: string[];
}): string {
  const theme = THEMES[input.theme];
  const kicker = escapeStoreMailHtml(input.kickerAr);
  const title = escapeStoreMailHtml(input.titleAr);
  const lead = escapeStoreMailHtml(input.leadAr);
  const notes = input.notesAr
    .map(
      (note) =>
        `<p style="margin:10px 0 0;font-size:13px;line-height:1.85;color:#d7d1c6;text-align:center">${escapeStoreMailHtml(note)}</p>`,
    )
    .join('');
  const rows = input.iconRows.map(renderStoreMailIconRow).join('\n');
  const engine = escapeStoreMailHtml(STORE_MAIL_ENGINE_LINE_AR);
  return `<div dir="rtl" style="margin:0;padding:0;background:#061018">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#061018;font-family:Tajawal,Arial,sans-serif">
<tr>
<td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:${theme.canvas};border:1px solid ${theme.accent};border-radius:18px">
<tr>
<td align="center" style="padding:28px 20px 22px">
<p style="margin:0;font-size:12px;font-weight:800;letter-spacing:0.04em;color:${theme.accent};text-align:center">${kicker}</p>
<p style="margin:10px 0 0;font-size:20px;font-weight:800;line-height:1.6;color:#f4efe4;text-align:center">${title}</p>
<p style="margin:12px 0 0;font-size:14px;line-height:1.85;color:#d7d1c6;text-align:center">${lead}</p>
<div style="padding:22px 0 8px">${rows}</div>
${notes}
<p style="margin:18px 0 0;font-size:12px;line-height:1.8;color:${theme.accent};text-align:center">${engine}</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</div>`;
}

export async function sendStoreResendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const from = resolveResendFromAddress();
  if (!apiKey || !from) return false;
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });
  return resp.ok;
}

export function buildWeddingLiveLinksHtml(input: {
  displayUrl: string;
  hostUrl: string;
  expiresLabel: string;
}): string {
  const theme = THEMES.wedding;
  return buildStoreMailHtml({
    theme: 'wedding',
    kickerAr: theme.titleAr,
    titleAr: 'روابط التشغيل جاهزة',
    leadAr: 'اضغط الأيقونة لفتح المسار على جهازك. رابط الضيف يصدر من لوحة المضيف لكل مدعو.',
    iconRows: [
      [
        {
          href: input.displayUrl,
          markAr: theme.markAr,
          titleAr: theme.titleAr,
          captionAr: 'شاشة القاعة',
          theme: 'wedding',
        },
        {
          href: input.hostUrl,
          markAr: 'ل',
          titleAr: theme.titleAr,
          captionAr: 'لوحة المضيف',
          theme: 'wedding',
        },
      ],
    ],
    notesAr: [
      `تنتهي الصفحة في ${input.expiresLabel}. احفظ الأرشيف من لوحة المضيف قبل انتهائها.`,
      'إعادة إرسال رابط المدعو من مدعو تُحظر.',
    ],
  });
}

export function buildEventLiveLinksHtml(input: {
  displayUrl: string;
  hostUrl: string;
  expiresLabel: string;
}): string {
  const theme = THEMES.event;
  return buildStoreMailHtml({
    theme: 'event',
    kickerAr: theme.titleAr,
    titleAr: 'روابط التشغيل جاهزة',
    leadAr: 'اضغط الأيقونة لفتح المسار على جهازك. رابط الضيف يصدر من لوحة المضيف لكل مدعو.',
    iconRows: [
      [
        {
          href: input.displayUrl,
          markAr: theme.markAr,
          titleAr: theme.titleAr,
          captionAr: 'شاشة القاعة',
          theme: 'event',
        },
        {
          href: input.hostUrl,
          markAr: 'ل',
          titleAr: theme.titleAr,
          captionAr: 'لوحة المضيف',
          theme: 'event',
        },
      ],
    ],
    notesAr: [
      `تنتهي الصفحة في ${input.expiresLabel}. احفظ الأرشيف من لوحة المضيف قبل انتهائها.`,
      'إعادة إرسال رابط المدعو من مدعو تُحظر.',
    ],
  });
}

export function buildLoungeLiveLinksHtml(input: {
  displayUrl: string;
  guestUrl: string;
  hostUrl: string;
  expiresLabel: string;
  renewed?: boolean;
}): string {
  const theme = THEMES.lounge;
  return buildStoreMailHtml({
    theme: 'lounge',
    kickerAr: theme.titleAr,
    titleAr: input.renewed ? 'تمديد التشغيل ثلاثة أشهر' : 'روابط التشغيل جاهزة',
    leadAr: input.renewed
      ? 'الروابط نفسها لم تتغير. اضغط الأيقونة لفتح المسار.'
      : 'اضغط الأيقونة لفتح شاشة اللاونج أو رابط الزبون أو لوحة المضيف.',
    iconRows: [
      [
        {
          href: input.displayUrl,
          markAr: theme.markAr,
          titleAr: theme.titleAr,
          captionAr: 'شاشة اللاونج',
          theme: 'lounge',
        },
        {
          href: input.guestUrl,
          markAr: 'ز',
          titleAr: theme.titleAr,
          captionAr: 'رابط الزبون',
          theme: 'lounge',
        },
        {
          href: input.hostUrl,
          markAr: 'ل',
          titleAr: theme.titleAr,
          captionAr: 'لوحة المضيف',
          theme: 'lounge',
        },
      ],
    ],
    notesAr: [
      `تنتهي مدة التشغيل في ${input.expiresLabel}. بعد انتهائها تبقى الروابط وتحيلكم إلى صفحة المنتج لإعادة الشراء على نفس الشاشة.`,
    ],
  });
}

export function buildGrocersLiveLinksHtml(input: {
  shopUrl: string;
  deskUrl: string;
  expiresLabel: string;
  renewed?: boolean;
}): string {
  const theme = THEMES.grocers;
  return buildStoreMailHtml({
    theme: 'grocers',
    kickerAr: theme.titleAr,
    titleAr: input.renewed ? 'تمديد تموينات الحي' : 'روابط التشغيل جاهزة',
    leadAr: input.renewed
      ? 'الروابط نفسها لم تتغير. اضغط الأيقونة لفتح المسار.'
      : 'اضغط الأيقونة لفتح متجر الزبون أو لوحة الكاشير.',
    iconRows: [
      [
        {
          href: input.shopUrl,
          markAr: theme.markAr,
          titleAr: theme.titleAr,
          captionAr: 'متجر الزبون',
          theme: 'grocers',
        },
        {
          href: input.deskUrl,
          markAr: 'ك',
          titleAr: theme.titleAr,
          captionAr: 'لوحة الكاشير',
          theme: 'grocers',
        },
      ],
    ],
    notesAr: [
      `تنتهي المدة في ${input.expiresLabel}. بعد انتهائها تبقى الروابط وتحيلكم لإعادة الشراء على نفس الصفحة.`,
    ],
  });
}

export function buildRestaurantLiveLinksHtml(input: {
  shopUrl: string;
  deskUrl: string;
  expiresLabel: string;
  renewed?: boolean;
}): string {
  const theme = THEMES.restaurant;
  return buildStoreMailHtml({
    theme: 'restaurant',
    kickerAr: theme.titleAr,
    titleAr: input.renewed ? 'تمديد صفحة المطعم' : 'روابط التشغيل جاهزة',
    leadAr: input.renewed
      ? 'الروابط نفسها لم تتغير. اضغط الأيقونة لفتح المسار.'
      : 'اضغط الأيقونة لفتح صفحة ضيف الحي أو لوحة المطبخ.',
    iconRows: [
      [
        {
          href: input.shopUrl,
          markAr: theme.markAr,
          titleAr: theme.titleAr,
          captionAr: 'صفحة ضيف الحي',
          theme: 'restaurant',
        },
        {
          href: input.deskUrl,
          markAr: 'ط',
          titleAr: theme.titleAr,
          captionAr: 'لوحة المطبخ',
          theme: 'restaurant',
        },
      ],
    ],
    notesAr: [
      `تنتهي المدة في ${input.expiresLabel}. بعد انتهائها تبقى الروابط وتحيلكم لإعادة الشراء على نفس الصفحة.`,
    ],
  });
}

export function buildKitchenLiveLinksHtml(input: {
  shopUrl: string;
  deskUrl: string;
  expiresLabel: string;
  renewed?: boolean;
}): string {
  const theme = THEMES.kitchen;
  return buildStoreMailHtml({
    theme: 'kitchen',
    kickerAr: theme.titleAr,
    titleAr: input.renewed ? 'تمديد صفحة النشاط' : 'روابط التشغيل جاهزة',
    leadAr: input.renewed
      ? 'الروابط نفسها لم تتغير. اضغط الأيقونة لفتح المسار.'
      : 'اضغط الأيقونة لفتح صفحة الزبون أو لوحة النشاط.',
    iconRows: [
      [
        {
          href: input.shopUrl,
          markAr: theme.markAr,
          titleAr: theme.titleAr,
          captionAr: 'صفحة الزبون',
          theme: 'kitchen',
        },
        {
          href: input.deskUrl,
          markAr: 'ط',
          titleAr: theme.titleAr,
          captionAr: 'لوحة النشاط',
          theme: 'kitchen',
        },
      ],
    ],
    notesAr: [
      `تنتهي المدة في ${input.expiresLabel}. بعد انتهائها تبقى الروابط وتحيلكم لإعادة الشراء على نفس الصفحة.`,
    ],
  });
}

export function buildCafeLiveLinksHtml(input: {
  shopUrl: string;
  deskUrl: string;
  displayUrl: string;
  quietUrl: string;
  menuUrl: string;
  guestUrl: string;
  hostUrl: string;
  expiresLabel: string;
  renewed?: boolean;
}): string {
  const theme = THEMES.cafe;
  return buildStoreMailHtml({
    theme: 'cafe',
    kickerAr: theme.titleAr,
    titleAr: input.renewed ? 'تمديد صفحة المقهى' : 'روابط التشغيل جاهزة',
    leadAr: input.renewed
      ? 'الروابط نفسها لم تتغير. اضغط الأيقونة لفتح المسار.'
      : 'اضغط الأيقونة لفتح صفحة جار الحي أو الشاشات أو لوحة الكاشير.',
    iconRows: [
      [
        {
          href: input.shopUrl,
          markAr: theme.markAr,
          titleAr: theme.titleAr,
          captionAr: 'صفحة جار الحي',
          theme: 'cafe',
        },
        {
          href: input.deskUrl,
          markAr: 'ك',
          titleAr: theme.titleAr,
          captionAr: 'لوحة الكاشير',
          theme: 'cafe',
        },
        {
          href: input.hostUrl,
          markAr: 'ش',
          titleAr: theme.titleAr,
          captionAr: 'لوحة الشاشات',
          theme: 'cafe',
        },
      ],
      [
        {
          href: input.displayUrl,
          markAr: 'ر',
          titleAr: theme.titleAr,
          captionAr: 'الشاشة الرئيسية',
          theme: 'cafe',
        },
        {
          href: input.quietUrl,
          markAr: 'ه',
          titleAr: theme.titleAr,
          captionAr: 'الشاشة الهادئة',
          theme: 'cafe',
        },
        {
          href: input.menuUrl,
          markAr: 'ق',
          titleAr: theme.titleAr,
          captionAr: 'شاشة القائمة',
          theme: 'cafe',
        },
      ],
      [
        {
          href: input.guestUrl,
          markAr: 'ض',
          titleAr: theme.titleAr,
          captionAr: 'رابط المشاركة',
          theme: 'cafe',
        },
      ],
    ],
    notesAr: [
      `تنتهي المدة في ${input.expiresLabel}. بعد انتهائها تبقى الروابط وتحيلكم لإعادة الشراء على نفس الصفحة.`,
    ],
  });
}

export function buildStoreAffiliateMagicHtml(input: {
  loginUrl: string;
  productLinks: StoreAffiliateCheckoutLinks;
}): string {
  const group = THEMES.affiliate;
  const products: StoreMailIconTile[] = [
    {
      href: input.productLinks.wedding,
      markAr: THEMES.wedding.markAr,
      titleAr: THEMES.wedding.titleAr,
      captionAr: 'رابط الشراء',
      theme: 'wedding',
    },
    {
      href: input.productLinks.event,
      markAr: THEMES.event.markAr,
      titleAr: THEMES.event.titleAr,
      captionAr: 'رابط الشراء',
      theme: 'event',
    },
    {
      href: input.productLinks.lounge,
      markAr: THEMES.lounge.markAr,
      titleAr: THEMES.lounge.titleAr,
      captionAr: 'رابط الشراء',
      theme: 'lounge',
    },
    {
      href: input.productLinks.grocers,
      markAr: THEMES.grocers.markAr,
      titleAr: THEMES.grocers.titleAr,
      captionAr: 'رابط الشراء',
      theme: 'grocers',
    },
    {
      href: input.productLinks.restaurant,
      markAr: THEMES.restaurant.markAr,
      titleAr: THEMES.restaurant.titleAr,
      captionAr: 'رابط الشراء',
      theme: 'restaurant',
    },
    {
      href: input.productLinks.cafe,
      markAr: THEMES.cafe.markAr,
      titleAr: THEMES.cafe.titleAr,
      captionAr: 'رابط الشراء',
      theme: 'cafe',
    },
    {
      href: input.productLinks.kitchen,
      markAr: THEMES.kitchen.markAr,
      titleAr: THEMES.kitchen.titleAr,
      captionAr: 'رابط الشراء',
      theme: 'kitchen',
    },
  ];
  return buildStoreMailHtml({
    theme: 'affiliate',
    kickerAr: group.titleAr,
    titleAr: 'دخول اللوحة وروابط المنتجات',
    leadAr: 'الأيقونة الذهبية تفتح اللوحة من جهازك. أيقونات المنتجات روابط الشراء باسمك.',
    iconRows: [
      [
        {
          href: input.loginUrl,
          markAr: group.markAr,
          titleAr: 'لوحة المسوّق',
          captionAr: 'دخول سري',
          theme: 'affiliate',
        },
      ],
      products.slice(0, 3),
      products.slice(3),
    ],
    notesAr: [
      'رابط الدخول لمرة واحدة وينتهي بعد ثلاثين دقيقة.',
      'إن تم الشراء من روابطك تُقيَّد عمولتك الثابتة فقط من حصة المنصة.',
    ],
  });
}

export { storeAffiliateCheckoutLinks };
export type { StoreAffiliateCheckoutLinks };
