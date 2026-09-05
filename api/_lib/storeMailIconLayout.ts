/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * محرّك إيميل المتجر: روابط الصفحات وروابط المسوّقين تُصدَّر أيقونات
 * متمركزة بستايل المنتج أو المجموعة التسويقية. لا يُستورد من App.
 */
import { resolveResendFromAddress } from './resendFrom.js';
import { storeAffiliateCheckoutLinks, type StoreAffiliateCheckoutLinks } from './storeAffiliateCode.js';
import { STORE_LIVE_INVITE_MARK } from './storeLiveInviteShare.js';

export type StoreMailThemeId = 'wedding' | 'event' | 'lounge' | 'grocers' | 'restaurant' | 'cafe' | 'kitchen' | 'produce' | 'halana' | 'affiliate';

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
    markAr: 'أ',
    titleAr: 'أفراحي1',
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
  produce: {
    id: 'produce',
    markAr: 'خ',
    titleAr: 'خضارنا1',
    accent: '#3d8b4a',
    ink: '#061018',
    canvas: '#0b1a10',
    ring: '#7ec98a',
  },
  halana: {
    id: 'halana',
    markAr: 'ح',
    titleAr: 'حلانا1',
    accent: '#c45c7a',
    ink: '#1a0c10',
    canvas: '#1a0c10',
    ring: '#e08aa0',
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

export const STORE_MAIL_BRAND_LATIN = 'halaqmap';
export const STORE_MAIL_BRAND_AR = 'خريطة الحل';
export const STORE_MAIL_KIND_LABEL_AR = 'نوع الرسالة';
export const STORE_MAIL_FOOTER_AR =
  'رسالة من متجر خريطة الحل، المرجع الإداري للمنتجات البرمجية بما فيها منصة حلاق ماب.';

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
  const kind = escapeStoreMailHtml(input.kickerAr);
  const title = escapeStoreMailHtml(input.titleAr);
  const lead = escapeStoreMailHtml(input.leadAr);
  const brandLatin = escapeStoreMailHtml(STORE_MAIL_BRAND_LATIN);
  const brandAr = escapeStoreMailHtml(STORE_MAIL_BRAND_AR);
  const kindLabel = escapeStoreMailHtml(STORE_MAIL_KIND_LABEL_AR);
  const footer = escapeStoreMailHtml(STORE_MAIL_FOOTER_AR);
  const logo = escapeStoreMailHtml(STORE_LIVE_INVITE_MARK);
  const notes = input.notesAr
    .map(
      (note) =>
        `<p style="margin:10px 0 0;font-size:13px;line-height:1.85;color:#d7d1c6;text-align:center">${escapeStoreMailHtml(note)}</p>`,
    )
    .join('');
  const rows = input.iconRows.map(renderStoreMailIconRow).join('\n');
  return `<div dir="rtl" style="margin:0;padding:0;background:#061018">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#061018;font-family:Tajawal,Arial,sans-serif">
<tr>
<td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:${theme.canvas};border:1px solid ${theme.accent};border-radius:18px">
<tr>
<td align="center" style="padding:28px 20px 22px">
<img src="${logo}" width="56" height="56" alt="${brandLatin} ${brandAr}" style="display:block;margin:0 auto;border-radius:14px;border:1px solid ${theme.accent}" />
<p style="margin:10px 0 0;font-size:18px;font-weight:800;color:#f4efe4;text-align:center;unicode-bidi:isolate;direction:ltr">${brandLatin}</p>
<p style="margin:2px 0 0;font-size:15px;font-weight:800;color:${theme.accent};text-align:center">${brandAr}</p>
<p style="margin:16px 0 0;font-size:11px;font-weight:800;letter-spacing:0.04em;color:#94a3b8;text-align:center">${kindLabel}</p>
<p style="margin:4px 0 0;font-size:16px;font-weight:800;color:${theme.accent};text-align:center">${kind}</p>
<p style="margin:12px 0 0;font-size:20px;font-weight:800;line-height:1.6;color:#f4efe4;text-align:center">${title}</p>
<p style="margin:12px 0 0;font-size:14px;line-height:1.85;color:#d7d1c6;text-align:center">${lead}</p>
<div style="padding:22px 0 8px">${rows}</div>
${notes}
<p style="margin:12px 0 0;font-size:11px;line-height:1.8;color:#94a3b8;text-align:center">${footer}</p>
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
  if (!apiKey || !from) {
    console.error('[store-mail] resend_not_configured');
    return false;
  }
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
  if (!resp.ok) {
    const detail = (await resp.text().catch(() => '')).slice(0, 280);
    console.error('[store-mail] resend_failed', resp.status, detail);
    return false;
  }
  return true;
}

export function buildWeddingLiveLinksHtml(input: {
  displayUrl: string;
  hostUrl: string;
  expiresLabel: string;
}): string {
  const theme = THEMES.wedding;
  return buildStoreMailHtml({
    theme: 'wedding',
    kickerAr: `روابط تشغيل — ${theme.titleAr}`,
    titleAr: 'روابط التشغيل جاهزة',
    leadAr:
      'ثلاثة روابط بعد السداد: لوحة تعديل الدعوة، لوحة إنشاء روابط المدعوين، ومعاينة الدعوة. لا تشارك روابط الإدارة مع أحد. روابط المدعوين الفردية تصدر من لوحتك.',
    iconRows: [
      [
        {
          href: input.displayUrl,
          markAr: theme.markAr,
          titleAr: theme.titleAr,
          captionAr: 'معاينة الدعوة',
          theme: 'wedding',
        },
        {
          href: input.hostUrl,
          markAr: 'ل',
          titleAr: theme.titleAr,
          captionAr: 'لوحة التعديل والمدعوين',
          theme: 'wedding',
        },
      ],
    ],
    notesAr: [
      `تنتهي مدة التفعيل في ${input.expiresLabel}. احفظ الأرشيف من لوحتك قبل انتهائها.`,
      'يمكن تقييد رابط المدعو على جهاز بعد أول فتح. لا يمثل ذلك ضماناً مطلقاً ضد إعادة مشاركة الرابط.',
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
    kickerAr: `روابط تشغيل — ${theme.titleAr}`,
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
    kickerAr: input.renewed ? `تمديد تشغيل — ${theme.titleAr}` : `روابط تشغيل — ${theme.titleAr}`,
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
    kickerAr: input.renewed ? `تمديد تشغيل — ${theme.titleAr}` : `روابط تشغيل — ${theme.titleAr}`,
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
    kickerAr: input.renewed ? `تمديد تشغيل — ${theme.titleAr}` : `روابط تشغيل — ${theme.titleAr}`,
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
  gift?: boolean;
}): string {
  const theme = THEMES.kitchen;
  return buildStoreMailHtml({
    theme: 'kitchen',
    kickerAr: input.gift
      ? `هدية من متجر خريطة الحل — ${theme.titleAr}`
      : input.renewed
        ? `تمديد تشغيل — ${theme.titleAr}`
        : `روابط تشغيل — ${theme.titleAr}`,
    titleAr: input.gift ? 'روابط هدية طبختنا1' : input.renewed ? 'تمديد صفحة النشاط' : 'روابط التشغيل جاهزة',
    leadAr: input.gift
      ? 'هذه هدية من متجر خريطة الحل. اضغط الأيقونة لفتح صفحة الزبون أو لوحة النشاط.'
      : input.renewed
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
      input.gift
        ? `ساعة التشغيل مئة وثمانون يوماً من أول دخول إلى الرابط (${input.expiresLabel}). اللوحة تبيّن أن النشاط هدية. بعد انتهائها أعد الشراء من صفحة طبختنا1 فتبقى الصفحة واللوحة.`
        : `تنتهي المدة في ${input.expiresLabel}. بعد انتهائها تبقى الروابط وتحيلكم لإعادة الشراء على نفس الصفحة.`,
    ],
  });
}

export function buildProduceLiveLinksHtml(input: {
  shopUrl: string;
  deskUrl: string;
  expiresLabel: string;
  renewed?: boolean;
}): string {
  const theme = THEMES.produce;
  return buildStoreMailHtml({
    theme: 'produce',
    kickerAr: input.renewed ? `تمديد تشغيل — ${theme.titleAr}` : `روابط تشغيل — ${theme.titleAr}`,
    titleAr: input.renewed ? 'تمديد صفحة الصندوق' : 'روابط التشغيل جاهزة',
    leadAr: input.renewed
      ? 'الروابط نفسها لم تتغير. اضغط الأيقونة لفتح المسار.'
      : 'اضغط الأيقونة لفتح صفحة جار الحي أو لوحة الصندوق.',
    iconRows: [
      [
        {
          href: input.shopUrl,
          markAr: theme.markAr,
          titleAr: theme.titleAr,
          captionAr: 'جار الحي',
          theme: 'produce',
        },
        {
          href: input.deskUrl,
          markAr: 'ص',
          titleAr: theme.titleAr,
          captionAr: 'لوحة الصندوق',
          theme: 'produce',
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
    kickerAr: input.renewed ? `تمديد تشغيل — ${theme.titleAr}` : `روابط تشغيل — ${theme.titleAr}`,
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
    {
      href: input.productLinks.produce,
      markAr: THEMES.produce.markAr,
      titleAr: THEMES.produce.titleAr,
      captionAr: 'رابط الشراء',
      theme: 'produce',
    },
    {
      href: input.productLinks.halana,
      markAr: THEMES.halana.markAr,
      titleAr: THEMES.halana.titleAr,
      captionAr: 'رابط الشراء',
      theme: 'halana',
    },
  ];
  return buildStoreMailHtml({
    theme: 'affiliate',
    kickerAr: 'دخول المسوّق وروابط المنتجات',
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
