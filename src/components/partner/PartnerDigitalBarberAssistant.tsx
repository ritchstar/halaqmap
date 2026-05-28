import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAgentChatInputFocus, useAgentChatOpenFocus, useAgentChatScroll } from '@/hooks/useAgentChatSurface';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, MapPin, Scissors, SendHorizonal, Smile, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PARTNER_DIGITAL_ASSISTANT, partnerAssistantHintForPath } from '@/lib/partnerMarketingCopy';
import { ROUTE_PATHS } from '@/lib';
import { askPartnerAssistant, fetchPartnerAssistantMeta, type PartnerAssistantMessage } from '@/lib/partnerAssistantRemote';
import { PARTNER_ASSISTANT_KNOWLEDGE_VERSION, PARTNER_ASSISTANT_UI_VERSION } from '@/lib/partnerAssistantUiVersion';
import { APP_BUILD } from '@/lib/appBuild';

// ── مؤشر الكتابة ─────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      <span className="text-[0.72rem] text-emerald-300/60 ms-1">يكتب</span>
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.1, delay: i * 0.18, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

const MAX_CHAT_TURNS = 16;

const ASSISTANT_DISPLAY_NAME = `${PARTNER_DIGITAL_ASSISTANT.name} (v${PARTNER_ASSISTANT_UI_VERSION})`;

export function PartnerDigitalBarberAssistant() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [knowledgeVersion, setKnowledgeVersion] = useState<string>(PARTNER_ASSISTANT_KNOWLEDGE_VERSION);
  const [messages, setMessages] = useState<PartnerAssistantMessage[]>([
    {
      role: 'assistant',
      content: 'مرحباً! 👋 أنا مساعد الشركاء الرقمي. اسألني عن الانضمام، الباقات، المناوب الرقمي، أو أي شيء في مسار الخدمات التسويقية.',
    },
  ]);

  const routeHint = useMemo(() => partnerAssistantHintForPath(pathname), [pathname]);
  const canSend = draft.trim().length > 0 && !isSending;

  /* ── Meta ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    void fetchPartnerAssistantMeta().then((meta) => {
      if (meta?.knowledgeVersion) setKnowledgeVersion(meta.knowledgeVersion);
    });
  }, []);

  /* ── Body scroll lock ────────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open]);

  useAgentChatOpenFocus(open, textareaRef);
  useAgentChatScroll(messagesRef, [messages, isSending, open]);
  useAgentChatInputFocus(isSending, textareaRef, open);

  /* ── Auto-grow textarea ─────────────────────────────────────────── */
  const handleDraftChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }, []);

  /* ── Send ───────────────────────────────────────────────────────── */
  const sendPrompt = useCallback(async () => {
    const content = draft.trim();
    if (!content || isSending) return;
    setDraft('');
    setChatError(null);
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }

    const nextMessages = [...messages, { role: 'user' as const, content }];
    setMessages(nextMessages);
    setIsSending(true);

    const reply = await askPartnerAssistant({ messages: nextMessages.slice(-MAX_CHAT_TURNS), pathname });

    if (reply.ok === false) {
      setChatError(reply.error);
      setMessages([...nextMessages, { role: 'assistant', content: 'أعتذر، لم أستطع جلب الرد حالياً. جرّب مجدداً أو تواصل مع الدعم.' }]);
    } else {
      setMessages([...nextMessages, { role: 'assistant', content: reply.reply }]);
    }
    setIsSending(false);
  }, [draft, isSending, messages, pathname]);

  /* ── Enter to send ──────────────────────────────────────────────── */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendPrompt();
    }
  }, [sendPrompt]);

  return (
    <>
      <AnimatePresence>
        {open ? (
          <>
            {/* Backdrop */}
            <motion.button type="button" key="backdrop" aria-hidden tabIndex={-1}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[58] cursor-default bg-[#020617]/65 backdrop-blur-[3px]"
              onClick={() => setOpen(false)} />

            <motion.div key="modal-shell" role="presentation"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="pointer-events-none fixed inset-0 z-[59] flex items-end justify-center sm:items-center sm:p-4">

              <motion.aside
                id="partner-barber-assistant" role="dialog" aria-modal="true"
                aria-label={ASSISTANT_DISPLAY_NAME}
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                onClick={(e) => e.stopPropagation()}
                className="pointer-events-auto flex h-[min(92dvh,100dvh)] w-full max-w-full flex-col overflow-hidden rounded-t-[1.35rem] border border-emerald-400/35 bg-[#071426]/98 text-right shadow-[0_-8px_60px_-12px_rgba(0,0,0,0.70)] backdrop-blur-xl sm:h-[min(85dvh,680px)] sm:max-w-[min(96vw,50rem)] sm:rounded-2xl lg:max-w-[min(96vw,54rem)]"
                dir="rtl"
              >
                {/* ── Header ────────────────────────────────────────── */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/8 bg-gradient-to-l from-emerald-500/12 to-transparent px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    {/* Avatar */}
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow ring-2 ring-white/15">
                      <Smile className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                      <motion.span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#071426] ring-2 ring-emerald-400/50"
                        animate={{ rotate: [-6, 6, -6] }} transition={{ duration: 2.2, repeat: Infinity }} aria-hidden>
                        <Scissors className="h-3 w-3 text-emerald-200" />
                      </motion.span>
                      <motion.span className="absolute -top-0.5 -left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[#071426] ring-1 ring-amber-200/80"
                        animate={{ y: [0, -2, 0] }} transition={{ duration: 1.8, repeat: Infinity }} aria-hidden>
                        <MapPin className="h-2.5 w-2.5" strokeWidth={2.5} />
                      </motion.span>
                    </div>

                    {/* Name + badge */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white leading-tight">{ASSISTANT_DISPLAY_NAME}</p>
                        <span className="shrink-0 rounded-full border border-emerald-400/35 bg-emerald-500/12 px-2 py-0.5 font-mono text-[9px] font-semibold text-emerald-200/80" dir="ltr" title={APP_BUILD.builtAtIso}>
                          KB {knowledgeVersion}
                        </span>
                      </div>
                      <p className="text-[0.68rem] text-emerald-300/70">{routeHint}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Support link */}
                    <NavLink to={ROUTE_PATHS.PARTNER_SUPPORT} onClick={() => setOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-emerald-300 transition-colors"
                      title="الدعم الفني">
                      <Headphones className="h-4 w-4" />
                    </NavLink>
                    {/* Close */}
                    <Button ref={closeBtnRef} type="button" variant="ghost" size="icon"
                      className="h-8 w-8 text-slate-400 hover:bg-white/10 hover:text-white"
                      onClick={() => setOpen(false)} aria-label="إغلاق">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* ── Messages ──────────────────────────────────────── */}
                <div ref={messagesRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5">
                  <div className="flex flex-col gap-2.5">
                    {messages.map((m, idx) => (
                      <motion.div
                        key={`${m.role}-${idx}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={m.role === 'assistant'
                          ? 'self-start max-w-[88%] rounded-2xl rounded-tr-sm border border-emerald-400/20 bg-emerald-500/8 px-3.5 py-2.5 text-[0.875rem] leading-6 text-emerald-50'
                          : 'self-end max-w-[88%] rounded-2xl rounded-tl-sm border border-cyan-400/25 bg-cyan-500/10 px-3.5 py-2.5 text-[0.875rem] leading-6 text-cyan-50'}
                      >
                        <p className="mb-1 text-[10px] font-semibold opacity-55">
                          {m.role === 'assistant' ? 'مساعد الشركاء' : 'أنت'}
                        </p>
                        <p className="whitespace-pre-wrap break-words" style={{ unicodeBidi: 'plaintext' }}>{m.content}</p>
                      </motion.div>
                    ))}

                    {/* Typing indicator */}
                    {isSending && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="self-start rounded-2xl rounded-tr-sm border border-emerald-400/20 bg-emerald-500/8">
                        <TypingDots />
                      </motion.div>
                    )}

                    {/* Error */}
                    {chatError && (
                      <p className="text-center text-[0.72rem] text-rose-300/80">{chatError}</p>
                    )}

                  </div>
                </div>

                {/* ── Input ─────────────────────────────────────────── */}
                <div className="shrink-0 border-t border-white/8 bg-[#061a2c]/95 px-3 py-3 sm:px-4">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      value={draft}
                      onChange={handleDraftChange}
                      onKeyDown={handleKeyDown}
                      placeholder="اكتب سؤالك… (Enter للإرسال · Shift+Enter لسطر جديد)"
                      rows={1}
                      disabled={isSending}
                      style={{ minHeight: '44px', maxHeight: '140px', resize: 'none', overflowY: 'auto' }}
                      className="flex-1 rounded-xl border border-white/15 bg-[#091a2a] px-3.5 py-2.5 text-sm leading-6 text-white placeholder:text-slate-500 outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/30 transition-all disabled:opacity-50"
                      dir="rtl"
                    />
                    <motion.button
                      type="button"
                      onClick={() => void sendPrompt()}
                      disabled={!canSend}
                      whileTap={canSend ? { scale: 0.92 } : undefined}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow shadow-emerald-500/25 transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="إرسال"
                    >
                      <SendHorizonal className="h-4 w-4" />
                    </motion.button>
                  </div>
                  <p className="mt-1.5 text-center text-[0.58rem] text-slate-600">
                    يجيب فقط عن مسار الخدمات التسويقية للمنصة
                  </p>
                </div>
              </motion.aside>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <div
        className="pointer-events-none fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-4 z-[60] flex flex-col items-start md:bottom-6 md:left-6"
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
