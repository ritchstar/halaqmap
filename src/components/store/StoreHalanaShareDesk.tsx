/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ملصق QR وكرت الجوال ومشاركة المعرض على القنوات. من لوحة حلانا1 فقط.
 * يُشارك shop_token دائماً — لا desk_token — حتى تفتح الصفحة للعميلات.
 */
import { StoreLiveShopShareDesk } from '@/components/store/StoreLiveShopShareDesk';
import { storeLiveShopShareCaption } from '@/config/storeLiveShopShare';
import { STORE_HALANA_LIVE_ACCENT, STORE_HALANA_LIVE_COPY } from '@/config/storeHalanaLive';
import { liveShopWhatsappShareHref } from '@/lib/storeLiveShopShare';

export function StoreHalanaShareDesk({
  shopToken,
  shopUrl,
  orderUrl,
  shopName,
  variant = 'halana',
}: {
  shopToken: string;
  shopUrl: string;
  orderUrl: string;
  shopName: string;
  variant?: 'halana' | 'desk';
}) {
  const copy = STORE_HALANA_LIVE_COPY;
  const safeShopUrl = shopUrl.trim();
  const safeOrderUrl = orderUrl.trim();
  const orderCaption = safeOrderUrl ? storeLiveShopShareCaption('halana', shopName, safeOrderUrl) : '';
  const shareVariant = variant === 'desk' ? 'desk' : 'halana';

  return (
    <div className="space-y-4">
      <StoreLiveShopShareDesk
        kind="halana"
        token={shopToken}
        shopName={shopName}
        shopUrl={safeShopUrl}
        qrPhraseAr={copy.qrPhraseAr}
        qrPrintAr={copy.qrPrintAr}
        accent={STORE_HALANA_LIVE_ACCENT}
        variant={shareVariant}
        showTitle={variant !== 'desk'}
      />
      {safeOrderUrl ? (
        <section className={variant === 'desk' ? 'halana-desk-card space-y-3 rounded-2xl p-5' : 'halana-form-card space-y-3 rounded-2xl p-5'}>
          <h3 className={variant === 'desk' ? 'text-base font-extrabold text-[#3a2a22]' : 'halana-title-sm'}>{copy.orderShareTitleAr}</h3>
          <p className={variant === 'desk' ? 'text-sm leading-7 text-[#4a3a32]/78' : 'text-sm leading-7 text-[#ffe8c4]/80'}>{copy.orderShareLeadAr}</p>
          <pre className={variant === 'desk' ? 'halana-desk-input whitespace-pre-wrap text-sm leading-7' : 'halana-promo-card whitespace-pre-wrap text-sm leading-7 text-white/80'}>
            {orderCaption}
          </pre>
          <a
            href={liveShopWhatsappShareHref(orderCaption)}
            target="_blank"
            rel="noopener noreferrer"
            className={variant === 'desk' ? 'halana-desk-btn halana-desk-btn--ghost flex w-full items-center justify-center' : 'flex w-full items-center justify-center rounded-full border border-white/20 py-2.5 text-sm font-bold'}
          >
            {copy.orderShareWhatsappAr}
          </a>
        </section>
      ) : null}
    </div>
  );
}
