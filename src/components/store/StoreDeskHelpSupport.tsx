/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صندوق مغلق أسفل لوحة الكاشير: تعليمات المنتج ثم صفحة دعم داخل الصندوق.
 */
import { ChevronDown, Headphones, MessageCircle } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { SiWhatsapp } from 'react-icons/si';
import { STORE_DESK_HELP, STORE_DESK_HELP_COPY, type StoreDeskHelpProduct } from '@/config/storeDeskHelp';
import { FOUNDER_DESK_WHATSAPP_E164 } from '@/config/founderDeskCopy';
import { buildWhatsAppChatHref } from '@/lib/saudiWhatsAppPhone';
import { cn } from '@/lib/utils';

const FounderDeskVisitorChatLazy = lazy(() =>
  import('@/components/partner/FounderDeskVisitorChat').then((m) => ({ default: m.FounderDeskVisitorChat })),
);

type Pane = 'help' | 'support' | 'chat';

export function StoreDeskHelpSupport({ product }: { product: StoreDeskHelpProduct }) {
  const [open, setOpen] = useState(false);
  const [pane, setPane] = useState<Pane>('help');
  const pack = STORE_DESK_HELP[product];
  const whatsappHref = buildWhatsAppChatHref(FOUNDER_DESK_WHATSAPP_E164, pack.whatsappPrefillAr);

  function toggle() {
    setOpen((current) => {
      if (current) setPane('help');
      return !current;
    });
  }

  return (
    <section className="rounded-2xl border border-white/12 bg-black/25" style={{ borderColor: `${pack.accent}55` }}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? STORE_DESK_HELP_COPY.closeAr : STORE_DESK_HELP_COPY.openAr}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start"
      >
        <span className="text-base font-extrabold" style={{ color: pack.accent }}>
          {STORE_DESK_HELP_COPY.titleAr}
        </span>
        <ChevronDown className={cn('h-5 w-5 shrink-0 text-white/70 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-white/10 px-4 py-4">
          {pane === 'help' ? (
            <>
              <p className="text-sm font-bold text-white/80">{pack.productAr}</p>
              <ol className="list-decimal space-y-2 ps-5 text-sm leading-7 text-white/75">
                {pack.stepsAr.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => setPane('support')}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold text-[#061018]"
                style={{ backgroundColor: pack.accent }}
              >
                <Headphones className="h-4 w-4" aria-hidden />
                {STORE_DESK_HELP_COPY.supportAr}
              </button>
            </>
          ) : null}

          {pane === 'support' ? (
            <div className="space-y-3">
              <p className="text-sm font-extrabold text-[#f7edd8]">{STORE_DESK_HELP_COPY.supportPageAr}</p>
              <p className="text-sm leading-7 text-white/70">{STORE_DESK_HELP_COPY.supportLeadAr}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1c7d6a] px-4 py-2.5 text-sm font-extrabold text-white"
                  >
                    <SiWhatsapp className="h-4 w-4" aria-hidden />
                    {STORE_DESK_HELP_COPY.whatsappAr}
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => setPane('chat')}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-extrabold text-[#061018]"
                  style={{ backgroundColor: pack.accent }}
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  {STORE_DESK_HELP_COPY.chatAr}
                </button>
              </div>
              <button type="button" onClick={() => setPane('help')} className="text-xs text-white/50">
                {STORE_DESK_HELP_COPY.backHelpAr}
              </button>
            </div>
          ) : null}

          {pane === 'chat' ? (
            <div className="space-y-3">
              <p className="text-sm font-extrabold text-[#f7edd8]">{STORE_DESK_HELP_COPY.chatAr}</p>
              <Suspense fallback={<p className="text-sm text-white/50">جاري فتح المحادثة…</p>}>
                <FounderDeskVisitorChatLazy compact origin="store" />
              </Suspense>
              <button type="button" onClick={() => setPane('support')} className="text-xs text-white/50">
                {STORE_DESK_HELP_COPY.supportPageAr}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
