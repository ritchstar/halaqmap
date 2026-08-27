/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, MessageCircle, Shield, Sparkles } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { BannerRadiationField } from '@/components/BannerRadiationField';
import { FounderDeskVisitorChat } from '@/components/partner/FounderDeskVisitorChat';
import {
  BARBER_CARD_HERO_FRAME_DIAMOND_CLASS,
  BARBER_CARD_HERO_IMAGE_CLASS,
} from '@/config/barberBannerImagePolicy';
import { FOUNDER_DESK_COPY, FOUNDER_DESK_WHATSAPP_E164 } from '@/config/founderDeskCopy';
import { PLATFORM_BRAND_LOGO_PATH } from '@/config/platformBrandIdentity';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { buildWhatsAppChatHref } from '@/lib/saudiWhatsAppPhone';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  /** يفتح الشات مباشرة */
  startOpen?: boolean;
  /** إخفاء زر الصفحة المستقلة عندما نكون فيها أصلاً */
  standalone?: boolean;
  /** مصدر الجلسة في صندوق الإدارة — الافتراضي مسار الشركاء */
  origin?: 'partners' | 'store';
};

const VISITOR_CHAT_PATH =
  (ROUTE_PATHS as { FOUNDER_DESK_VISITOR_CHAT?: string }).FOUNDER_DESK_VISITOR_CHAT ||
  '/partners/live-chat';
const PRIVACY_PATH =
  (ROUTE_PATHS as { USER_PRIVACY_POLICY?: string }).USER_PRIVACY_POLICY || '/privacy-policy';

export function FounderDeskBanner({
  className,
  startOpen = false,
  standalone = false,
  origin = 'partners',
}: Props) {
  const [chatOpen, setChatOpen] = useState(startOpen);
  const deskOrigin = origin === 'store' ? 'store' : 'partners';
  const hideStandalone = standalone || deskOrigin === 'store';
  const whatsappHref = buildWhatsAppChatHref(
    FOUNDER_DESK_WHATSAPP_E164,
    deskOrigin === 'store' ? FOUNDER_DESK_COPY.whatsappPrefillStoreAr : FOUNDER_DESK_COPY.whatsappPrefillAr,
  );
  const isStore = deskOrigin === 'store';

  return (
    <div className={cn('relative mx-auto w-full max-w-sm', className)} dir="rtl">
      <BannerRadiationField tier={isStore ? 'gold' : 'diamond'}>
        <div
          className={cn(
            'relative overflow-hidden rounded-[1.7rem]',
            isStore
              ? 'border border-[#e8c547]/35 bg-gradient-to-b from-[#0b1a24] via-[#08141c] to-[#061018] shadow-[0_24px_60px_-28px_rgba(232,197,71,0.45)]'
              : 'border border-[#bedee8]/92 bg-gradient-to-b from-[#feffff] via-[#f7fcfd] to-[#edf8fb] shadow-[0_22px_48px_rgba(148,163,184,0.12)] ring-1 ring-[#deeff4]/80',
          )}
        >
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: isStore
                ? 'linear-gradient(90deg, transparent, rgba(232,197,71,0.55), transparent)'
                : 'linear-gradient(90deg, transparent, #18687a55, transparent)',
            }}
          />

          <div className={BARBER_CARD_HERO_FRAME_DIAMOND_CLASS}>
            <div
              className={
                isStore
                  ? 'absolute inset-0 bg-[linear-gradient(135deg,#0b1a24_0%,#122a36_55%,#0d2430_100%)]'
                  : 'absolute inset-0 bg-[linear-gradient(135deg,#f7fcfd_0%,#e8f4f8_55%,#d7ebf2_100%)]'
              }
            />
            <img
              src={isStore ? '/images/halaqmap-store-mark-radar-square-1200x1200.png' : PLATFORM_BRAND_LOGO_PATH}
              alt=""
              className={cn(BARBER_CARD_HERO_IMAGE_CLASS, 'object-contain p-5 sm:p-6')}
              loading="eager"
              decoding="async"
            />
            <div
              className={cn(
                'absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold',
                isStore
                  ? 'border border-[#e8c547]/40 bg-[#061018]/90 text-[#e8c547]'
                  : 'border border-[#cfe6ee]/92 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(239,248,251,0.95))] text-[#215d6a] shadow-[0_6px_12px_rgba(15,23,42,0.05)]',
              )}
            >
              <Sparkles className="h-3 w-3" />
              {FOUNDER_DESK_COPY.badgeAr}
            </div>
            <div
              className={cn(
                'absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-[0.08em]',
                isStore
                  ? 'border border-[#e8c547]/40 bg-[#061018]/90 text-[#e8c547]'
                  : 'border border-[#d8ecf3]/95 bg-white/92 text-cyan-700 shadow-[0_4px_8px_rgba(15,23,42,0.04)]',
              )}
            >
              <Shield className="h-3 w-3" />
              VIP
            </div>
          </div>

          <div className="p-4">
            <p
              className={cn('text-[0.7rem] font-bold tracking-wide', isStore ? 'text-[#e8c547]' : 'text-[#18687a]')}
              dir="ltr"
            >
              {FOUNDER_DESK_COPY.brandLatin}
            </p>
            <h3
              className={cn(
                'text-[1rem] font-black leading-tight',
                isStore ? 'text-[#f4efe4]' : 'text-slate-950',
              )}
            >
              {FOUNDER_DESK_COPY.publicNameAr}
            </h3>
            <p className={cn('mt-1 text-[0.72rem] font-semibold', isStore ? 'text-[#e8c547]' : 'text-[#18687a]')}>
              {FOUNDER_DESK_COPY.subtitleAr}
            </p>
            <div
              className={cn(
                'mt-1.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6rem] font-bold',
                isStore
                  ? 'border-[#e8c547]/30 bg-[#e8c547]/10 text-[#e8c547]'
                  : 'border-[#18687a]/20 bg-[#18687a]/8 text-[#18687a]',
              )}
            >
              <span className={cn('h-1 w-1 rounded-full', isStore ? 'bg-[#e8c547]' : 'bg-[#18687a]')} />
              {FOUNDER_DESK_COPY.statusAr}
            </div>
            {chatOpen ? null : (
              <p className={cn('mt-2 text-[0.62rem] leading-5', isStore ? 'text-white/55' : 'text-slate-500')}>
                {FOUNDER_DESK_COPY.privacyShortAr}{' '}
                <Link
                  to={PRIVACY_PATH}
                  className={cn(
                    'font-bold underline underline-offset-2',
                    isStore ? 'text-[#e8c547]' : 'text-[#18687a]',
                  )}
                >
                  {FOUNDER_DESK_COPY.privacyPolicyLinkAr}
                </Link>
              </p>
            )}

            <div className="mt-3.5 flex gap-2">
              <button
                type="button"
                onClick={() => setChatOpen((open) => !open)}
                className={cn(
                  'relative flex flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-full py-2.5 text-[0.8rem] font-bold',
                  isStore
                    ? 'bg-[#e8c547] text-[#061018] shadow-[0_12px_30px_-12px_rgba(232,197,71,0.8)]'
                    : 'bg-gradient-to-r from-[#336f7c] via-[#2b6270] to-[#214d57] text-white shadow-[0_10px_22px_rgba(24,104,122,0.13)]',
                )}
                aria-expanded={chatOpen}
                aria-label={FOUNDER_DESK_COPY.chatAriaAr}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{FOUNDER_DESK_COPY.chatCtaAr}</span>
              </button>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                  style={{
                    background: 'linear-gradient(135deg, #2bbd6a, #1c7d6a)',
                    boxShadow: '0 8px 16px rgba(37,211,102,0.15)',
                  }}
                  aria-label={FOUNDER_DESK_COPY.whatsappAriaAr}
                >
                  <SiWhatsapp className="h-4 w-4" />
                </a>
              ) : null}
            </div>

            {chatOpen ? (
              <>
                <FounderDeskVisitorChat
                  className="mt-3"
                  compact={!standalone}
                  expanded={standalone}
                  origin={deskOrigin}
                />
                {hideStandalone ? null : (
                  <Link
                    to={VISITOR_CHAT_PATH}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-[#18687a]/25 bg-white/80 py-2 text-[0.72rem] font-bold text-[#18687a]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {FOUNDER_DESK_COPY.openStandaloneAr}
                  </Link>
                )}
              </>
            ) : null}

            <div
              className={cn(
                'mt-3 flex items-center justify-center gap-1.5 border-t pt-2.5',
                isStore ? 'border-white/10' : 'border-slate-200/80',
              )}
            >
              <div className={cn('h-1.5 w-1.5 rounded-full', isStore ? 'bg-[#e8c547]/70' : 'bg-[#18687a]/70')} />
              <span
                className={cn(
                  'text-[0.55rem] font-semibold',
                  isStore ? 'text-[#e8c547]/45' : 'text-[#18687a]/40',
                )}
              >
                <span dir="ltr" className="tracking-[0.12em]">
                  {FOUNDER_DESK_COPY.brandLatin}
                </span>
                <span className="mx-1">·</span>
                {FOUNDER_DESK_COPY.publicNameAr}
              </span>
              <div className={cn('h-1.5 w-1.5 rounded-full', isStore ? 'bg-[#e8c547]/70' : 'bg-[#18687a]/70')} />
            </div>
          </div>
        </div>
      </BannerRadiationField>
    </div>
  );
}
