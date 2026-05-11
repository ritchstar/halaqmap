import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, MapPin, Scissors, SendHorizonal, Smile, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PARTNER_DIGITAL_ASSISTANT, partnerAssistantHintForPath } from '@/lib/partnerMarketingCopy';
import { ROUTE_PATHS } from '@/lib';
import { askPartnerAssistant, type PartnerAssistantMessage } from '@/lib/partnerAssistantRemote';
import { PARTNER_ASSISTANT_UI_VERSION } from '@/lib/partnerAssistantUiVersion';
import { APP_BUILD } from '@/lib/appBuild';

const MAX_CHAT_TURNS = 16;

const ASSISTANT_DISPLAY_NAME = `${PARTNER_DIGITAL_ASSISTANT.name} (v${PARTNER_ASSISTANT_UI_VERSION})`;

export function PartnerDigitalBarberAssistant() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [messages, setMessages] = useState<PartnerAssistantMessage[]>([
    {
      role: 'assistant',
      content:
        'مرحباً بك في مسار الشركاء، يسعدني خدمتك. اسألني عن خطوات الانضمام، الباقات، أو كيفية الاستفادة من صفحات الشركاء.',
    },
  ]);

  const routeHint = useMemo(() => partnerAssistantHintForPath(pathname), [pathname]);
  const canSend = draft.trim().length > 0 && !isSending;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const sendPrompt = async () => {
    const content = draft.trim();
    if (!content || isSending) return;

    setDraft('');
    setChatError(null);

    const nextMessages = [...messages, { role: 'user' as const, content }];
    setMessages(nextMessages);
    setIsSending(true);

    const reply = await askPartnerAssistant({
      messages: nextMessages.slice(-MAX_CHAT_TURNS),
      pathname,
    });

    if (reply.ok === false) {
      setChatError(reply.error);
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content:
            'أعتذر، لم أستطع جلب الرد حالياً. يمكنك إعادة المحاولة أو فتح استوديو دعم الشركاء وسيتم خدمتك مباشرة.',
        },
      ]);
      setIsSending(false);
      return;
    }

    setMessages([...nextMessages, { role: 'assistant', content: reply.reply }]);
    setIsSending(false);
  };

  return (
    <>
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              key="backdrop"
              aria-hidden
              tabIndex={-1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[58] cursor-default bg-[#020617]/65 backdrop-blur-[3px]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="modal-shell"
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none fixed inset-0 z-[59] flex items-end justify-center sm:items-center sm:p-4"
            >
              <motion.aside
                id="partner-barber-assistant"
                role="dialog"
                aria-modal="true"
                aria-label={ASSISTANT_DISPLAY_NAME}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                onClick={(e) => e.stopPropagation()}
                className="pointer-events-auto flex h-[min(96dvh,100dvh)] max-h-[100dvh] w-full max-w-full flex-col overflow-hidden rounded-t-[1.35rem] border border-emerald-400/40 bg-[#071426]/97 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))] pt-[max(0.35rem,env(safe-area-inset-top,0px))] text-right shadow-[0_-8px_60px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md sm:h-[min(88dvh,720px)] sm:max-h-[min(88dvh,720px)] sm:max-w-[min(96vw,52rem)] sm:rounded-2xl sm:pb-[max(1rem,env(safe-area-inset-bottom,0px))] lg:max-w-[min(96vw,56rem)]"
                dir="rtl"
              >
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 bg-gradient-to-l from-emerald-500/15 to-transparent px-4 py-3.5 sm:px-5">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-lg ring-2 ring-white/20 sm:h-14 sm:w-14">
                      <Smile className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.25} aria-hidden />
                      <motion.span
                        className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#071426] ring-2 ring-emerald-400/60"
                        animate={{ rotate: [-6, 6, -6] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        aria-hidden
                      >
                        <Scissors className="h-3.5 w-3.5 text-emerald-200" />
                      </motion.span>
                      <motion.span
                        className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/95 text-[#071426] ring-2 ring-amber-200/80"
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        aria-hidden
                      >
                        <MapPin className="h-3 w-3" strokeWidth={2.5} />
                      </motion.span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-emerald-200/90 sm:text-sm">{PARTNER_DIGITAL_ASSISTANT.role}</p>
                      <p className="text-sm font-bold leading-snug text-white sm:text-base">{ASSISTANT_DISPLAY_NAME}</p>
                    </div>
                  </div>
                  <Button
                    ref={closeBtnRef}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-slate-300 hover:bg-white/10 hover:text-white sm:h-11 sm:w-11"
                    onClick={() => setOpen(false)}
                    aria-label="إغلاق نافذة المساعد"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex shrink-0 justify-end border-b border-white/10 px-4 py-2 sm:px-5">
                  <span
                    className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold tracking-tight text-emerald-100 sm:text-[11px]"
                    dir="ltr"
                    title={`بناء الواجهة ${APP_BUILD.builtAtIso}`}
                  >
                    Assistant v{PARTNER_ASSISTANT_UI_VERSION} · build {APP_BUILD.commit}
                  </span>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3 text-sm leading-relaxed text-slate-100 sm:px-5 sm:py-4 sm:text-[0.95rem] sm:leading-7">
                    <p className="font-semibold text-amber-100/95">{PARTNER_DIGITAL_ASSISTANT.greeting}</p>
                    <p className="text-slate-200/95">{PARTNER_DIGITAL_ASSISTANT.welcome}</p>
                    <p className="rounded-lg border border-white/10 bg-black/25 px-3 py-2.5 text-xs leading-6 text-emerald-100/90 sm:text-sm">
                      {routeHint}
                    </p>
                    <div className="rounded-xl border border-white/15 bg-black/20 p-2 sm:p-3">
                      <div className="space-y-2.5">
                        {messages.map((m, idx) => (
                          <div
                            key={`${m.role}-${idx}-${m.content.slice(0, 24)}`}
                            className={
                              m.role === 'assistant'
                                ? 'rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-50 sm:px-3.5 sm:py-3 sm:text-[0.9375rem]'
                                : 'rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2.5 text-sm text-cyan-50 sm:px-3.5 sm:py-3 sm:text-[0.9375rem]'
                            }
                          >
                            <p className="mb-1.5 text-[11px] font-semibold text-slate-300 sm:text-xs">
                              {m.role === 'assistant' ? 'مساعد الشركاء' : 'أنت'}
                            </p>
                            <p className="whitespace-pre-wrap break-words leading-6 sm:leading-7">{m.content}</p>
                          </div>
                        ))}
                        {isSending ? (
                          <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-100">
                            جاري تجهيز الرد...
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-semibold text-slate-300 sm:text-sm">نصائح سريعة</p>
                      <ul className="list-disc space-y-1.5 pr-4 text-xs text-slate-300 marker:text-emerald-400/80 sm:text-sm">
                        {PARTNER_DIGITAL_ASSISTANT.tips.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <Button asChild variant="secondary" size="default" className="w-full gap-2 sm:w-auto" onClick={() => setOpen(false)}>
                      <NavLink to={ROUTE_PATHS.PARTNER_SUPPORT}>
                        <Headphones className="h-4 w-4" />
                        استوديو دعم الشركاء
                      </NavLink>
                    </Button>
                    {chatError ? <p className="text-xs text-rose-200 sm:text-sm">{chatError}</p> : null}
                    <p className="text-[11px] text-slate-400 sm:text-xs">
                      يجيب هذا المساعد فقط عن معلومات «مسار الشركاء» المتاحة في المنصة.
                    </p>
                  </div>

                  <div className="shrink-0 border-t border-white/10 bg-[#061a2c]/90 px-4 py-3 sm:px-5 sm:py-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            void sendPrompt();
                          }
                        }}
                        placeholder="اكتب سؤالك حول مسار الشركاء… (Ctrl أو ⌘ + Enter للإرسال)"
                        rows={3}
                        className="min-h-[5.5rem] resize-y border-white/20 bg-[#091a2a] text-sm leading-6 text-white placeholder:text-slate-400 focus-visible:ring-emerald-300 sm:min-h-[6.25rem] sm:flex-1 sm:text-base"
                        dir="rtl"
                      />
                      <Button
                        type="button"
                        size="lg"
                        className="h-12 w-full shrink-0 bg-emerald-600 text-white hover:bg-emerald-500 sm:h-[6.25rem] sm:w-14 sm:px-0"
                        onClick={() => void sendPrompt()}
                        disabled={!canSend}
                        aria-label="إرسال السؤال"
                      >
                        <SendHorizonal className="mx-auto h-5 w-5 sm:h-6 sm:w-6" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <div
        className="pointer-events-none fixed bottom-4 left-4 z-[60] flex flex-col items-start sm:bottom-6 sm:left-6"
        data-partner-assistant="1"
        data-partner-assistant-ui-version={PARTNER_ASSISTANT_UI_VERSION}
      >
        {!open ? (
          <div className="pointer-events-auto relative shrink-0">
            <span
              className="pointer-events-none absolute -top-1 z-[61] rounded-md bg-emerald-300 px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-[#04210f] shadow ring-1 ring-emerald-800/30 end-0"
              aria-hidden
            >
              v{PARTNER_ASSISTANT_UI_VERSION}
            </span>
            <motion.button
              type="button"
              onClick={() => setOpen(true)}
              className="relative flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/40 bg-gradient-to-br from-[#0a1f33] to-[#071426] text-white shadow-[0_12px_40px_-8px_rgba(16,185,129,0.45)] ring-2 ring-emerald-500/25 transition hover:ring-emerald-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061223]"
              aria-expanded={false}
              aria-controls="partner-barber-assistant"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <span className="sr-only">فتح مساعد الشركاء — {ASSISTANT_DISPLAY_NAME}</span>
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600">
                <Smile className="h-6 w-6" strokeWidth={2.25} aria-hidden />
                <motion.span
                  className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#071426] ring-2 ring-white/25"
                  animate={{ rotate: [-8, 8, -8] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  aria-hidden
                >
                  <Scissors className="h-3 w-3 text-emerald-200" />
                </motion.span>
                <motion.span
                  className="absolute -top-0.5 -left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[#071426]"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  aria-hidden
                >
                  <MapPin className="h-2.5 w-2.5" strokeWidth={2.5} />
                </motion.span>
              </span>
            </motion.button>
          </div>
        ) : null}
      </div>
    </>
  );
}
