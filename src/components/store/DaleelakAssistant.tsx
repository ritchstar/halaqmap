/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أيقونة عائمة «دليلك» — مساعد اختيار المسار عبر صفحات متجر خريطة الحل.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, SendHorizonal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAgentChatInputFocus, useAgentChatOpenFocus, useAgentChatScroll } from '@/hooks/useAgentChatSurface';
import { askDaleelak, type DaleelakChatMessage } from '@/lib/daleelakAssistantRemote';
import { DALEELAK_OPENING_LINE_AR } from '../../../api/_lib/daleelakKnowledge';

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      <span className="ms-1 text-[0.72rem] text-amber-200/70">يكتب</span>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-amber-300"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.1, delay: i * 0.18, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

const MAX_HISTORY = 8;
const ASSISTANT_NAME = 'دليلك';
const ASSISTANT_DIALOG_ID = 'daleelak-assistant';

function isStorePath(pathname: string): boolean {
  return pathname === '/store' || pathname.startsWith('/store/');
}

/**
 * يتحقق إن كان هناك أي نافذة Radix Dialog أخرى مفتوحة حالياً في الصفحة (غير
 * نافذة دليلك نفسها) — مثل نافذة إتمام الطلب أو اختيار طريقة الاستلام في
 * واجهات ChatlyDesk. زر «دليلك» العائم ثابت (`position: fixed`) بطبقة
 * `z-[60]` أعلى من طبقة `z-50` التي تستخدمها كل نوافذ الـDialog في المتجر،
 * فيظهر فوقها ويغطي جزءاً من أزرارها (مثل زر إرسال الطلب) حين تكون مفتوحة
 * في الوقت نفسه — مؤكَّد بالفحص المباشر على الموقع الفعلي. الحل هنا حارس
 * وقت التشغيل (بنفس فلسفة حرّاس التباين الأخرى في المتجر): إخفاء الزر
 * العائم تلقائياً طالما توجد نافذة أخرى مفتوحة، دون الحاجة لتعديل كل نوافذ
 * الـDialog في كل منتج على حدة.
 */
function hasOtherOpenDialog(): boolean {
  const openDialogs = document.querySelectorAll('[role="dialog"][data-state="open"]');
  for (const dialog of Array.from(openDialogs)) {
    if (dialog.id !== ASSISTANT_DIALOG_ID) return true;
  }
  return false;
}

// حد أدنى آمن لمسافة أعلى الزر إن جاء القياس الحي صفراً أو قبل استقرار
// التخطيط (يقارب ارتفاع رأس الصفحة المضغوط على الجوال بلا شريط الساعات).
const DEFAULT_HEADER_CLEARANCE_PX = 84;
// مسافة أمان إضافية أسفل حافة الشعار/الرأس.
const HEADER_CLEARANCE_GAP_PX = 10;

/**
 * زر «دليلك» يتموضع أعلى يمين الشاشة تحت الشعار مباشرة، في كل صفحات
 * `/store/*` (طلب صريح من صاحب المنصة). رأس الصفحة (`StoreVisitorHeader`)
 * عنصر عادي ضمن تدفّق الصفحة (لا `sticky` ولا `fixed`) ويتغيّر ارتفاعه فعلياً
 * حسب الجهاز — شريط ساعات المدن يظهر على الحاسوب فقط، ويختفي على الجوال،
 * وتتبدّل صفوف التنقّل بينهما. بدل تخمين قيمتين ثابتتين منفصلتين للجوال
 * والحاسوب قد تنكسران عند أي تعديل مستقبلي على الرأس، تقرأ هذه الدالة
 * الارتفاع الفعلي المعروض لرأس الصفحة وقت التشغيل (نفس فلسفة حرّاس التباين
 * ومسافة تفادي أيقونتَي قيّم/شارك سابقاً) — بصرف النظر عن أي نسخة أو حجم
 * شاشة. الارتفاع (لا موضعه من أعلى الشاشة) هو المقياس الصحيح هنا تحديداً
 * لأن الرأس نفسه يمرّ مع الصفحة عند التمرير، بخلاف زر دليلك الثابت.
 */
function useDaleelakHeaderClearance(active: boolean, routeKey: string): number | null {
  const [clearancePx, setClearancePx] = useState<number | null>(null);

  useEffect(() => {
    if (!active) {
      setClearancePx(null);
      return undefined;
    }

    const headerEl = document.querySelector('[data-store-visitor-header]');
    if (!headerEl) {
      setClearancePx(null);
      return undefined;
    }

    const recompute = () => {
      const height = headerEl.getBoundingClientRect().height;
      setClearancePx(Math.max(DEFAULT_HEADER_CLEARANCE_PX, Math.round(height + HEADER_CLEARANCE_GAP_PX)));
    };

    recompute();

    // يرصد تغيّر ارتفاع الرأس نفسه وقت التشغيل — تبدّل نسخة الجوال/الحاسوب
    // عند تغيّر حجم الشاشة، أو التفاف صف التنقّل على شاشة ضيقة.
    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(recompute);
      resizeObserver.observe(headerEl);
    }
    window.addEventListener('resize', recompute);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', recompute);
    };
    // routeKey (pathname) مُدرَج عمداً: بعض صفحات `/store/*` لا تعرض
    // StoreVisitorHeader إطلاقاً (مثل صفحة مقاطع اليوتيوب)، فيُعاد البحث عن
    // العنصر من جديد عند كل تنقّل داخل المتجر.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, routeKey]);

  return clearancePx;
}

export function DaleelakAssistant() {
  const { pathname } = useLocation();
  const visible = isStorePath(pathname);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [otherDialogOpen, setOtherDialogOpen] = useState(false);
  const headerClearancePx = useDaleelakHeaderClearance(visible, pathname);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<DaleelakChatMessage[]>([
    { role: 'assistant', content: DALEELAK_OPENING_LINE_AR },
  ]);

  const canSend = draft.trim().length > 0 && !isSending;

  useEffect(() => {
    if (!visible && open) setOpen(false);
  }, [visible, open]);

  useEffect(() => {
    if (!visible) return undefined;
    const syncOtherDialogState = () => setOtherDialogOpen(hasOtherOpenDialog());
    syncOtherDialogState();
    const observer = new MutationObserver(syncOtherDialogState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-state'],
      subtree: true,
    });
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useAgentChatOpenFocus(open, textareaRef);
  useAgentChatScroll(messagesRef, [messages, isSending, open]);
  useAgentChatInputFocus(isSending, textareaRef, open);

  const handleDraftChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, []);

  const sendPrompt = useCallback(async () => {
    const content = draft.trim();
    if (!content || isSending) return;
    setDraft('');
    setChatError(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const history = messages.slice(-MAX_HISTORY);
    const nextMessages: DaleelakChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setIsSending(true);

    const reply = await askDaleelak({ message: content, history });

    if (reply.ok === false) {
      setChatError(reply.error);
      setMessages([
        ...nextMessages,
        { role: 'assistant', content: 'أعتذر، ما قدرت أرد الآن. جرّب مرة ثانية أو راجع صفحة المنتج مباشرة.' },
      ]);
    } else {
      setMessages([...nextMessages, { role: 'assistant', content: reply.reply }]);
    }
    setIsSending(false);
  }, [draft, isSending, messages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void sendPrompt();
      }
    },
    [sendPrompt],
  );

  if (!visible) return null;

  return (
    <>
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              key="daleelak-backdrop"
              aria-hidden
              tabIndex={-1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[58] cursor-default bg-[#1a1208]/70 backdrop-blur-[3px]"
              onClick={() => setOpen(false)}
            />

            <motion.div
              key="daleelak-shell"
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none fixed inset-0 z-[59] flex items-end justify-center sm:items-center sm:p-4"
            >
              <motion.aside
                id="daleelak-assistant"
                role="dialog"
                aria-modal="true"
                aria-label={ASSISTANT_NAME}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                onClick={(e) => e.stopPropagation()}
                className="pointer-events-auto flex h-[min(92dvh,100dvh)] w-full max-w-full flex-col overflow-hidden rounded-t-[1.35rem] border border-amber-400/35 bg-[#1c140a]/98 text-right shadow-[0_-8px_60px_-12px_rgba(0,0,0,0.70)] backdrop-blur-xl sm:h-[min(85dvh,680px)] sm:max-w-[min(96vw,42rem)] sm:rounded-2xl"
                dir="rtl"
              >
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/8 bg-gradient-to-l from-amber-500/14 to-transparent px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-700 text-white shadow ring-2 ring-white/15">
                      <Compass className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-tight text-white">{ASSISTANT_NAME}</p>
                      <p className="text-[0.68rem] text-amber-200/70">يساعدك تختار المسار الأقرب لطريقة عملك</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-slate-400 hover:bg-white/10 hover:text-white"
                    onClick={() => setOpen(false)}
                    aria-label="إغلاق"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div ref={messagesRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5">
                  <div className="flex flex-col gap-2.5">
                    {messages.map((m, idx) => (
                      <motion.div
                        key={`${m.role}-${idx}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={
                          m.role === 'assistant'
                            ? 'max-w-[88%] self-start rounded-2xl rounded-tr-sm border border-amber-400/20 bg-amber-500/10 px-3.5 py-2.5 text-[0.875rem] leading-6 text-amber-50'
                            : 'max-w-[88%] self-end rounded-2xl rounded-tl-sm border border-orange-400/25 bg-orange-500/12 px-3.5 py-2.5 text-[0.875rem] leading-6 text-orange-50'
                        }
                      >
                        <p className="mb-1 text-[10px] font-semibold opacity-55">
                          {m.role === 'assistant' ? ASSISTANT_NAME : 'أنت'}
                        </p>
                        <p className="chat-arabic-text whitespace-pre-wrap break-words" dir="rtl">
                          {m.content}
                        </p>
                      </motion.div>
                    ))}

                    {isSending ? (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="self-start rounded-2xl rounded-tr-sm border border-amber-400/20 bg-amber-500/10"
                      >
                        <TypingDots />
                      </motion.div>
                    ) : null}

                    {chatError ? <p className="text-center text-[0.72rem] text-rose-300/80">{chatError}</p> : null}
                  </div>
                </div>

                <div className="shrink-0 border-t border-white/8 bg-[#171008]/95 px-3 py-3 sm:px-4">
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
                      className="flex-1 rounded-xl border border-white/15 bg-[#22180c] px-3.5 py-2.5 text-sm leading-6 text-white outline-none transition-all placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 disabled:opacity-50"
                      dir="rtl"
                    />
                    <motion.button
                      type="button"
                      onClick={() => void sendPrompt()}
                      disabled={!canSend}
                      whileTap={canSend ? { scale: 0.92 } : undefined}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow shadow-amber-500/25 transition-all hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="إرسال"
                    >
                      <SendHorizonal className="h-4 w-4" />
                    </motion.button>
                  </div>
                  <p className="mt-1.5 text-center text-[0.58rem] text-slate-500">
                    يجيب فقط عن منتجات متجر خريطة الحل
                  </p>
                </div>
              </motion.aside>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <div
        className="pointer-events-none fixed top-[84px] right-4 z-[60] flex flex-col items-end md:right-6"
        style={headerClearancePx !== null ? { top: `${headerClearancePx}px` } : undefined}
        data-daleelak-assistant="1"
      >
        {!open && !otherDialogOpen ? (
          <div className="pointer-events-auto relative shrink-0">
            <motion.button
              type="button"
              onClick={() => setOpen(true)}
              className="relative flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/40 bg-gradient-to-br from-[#2a1c0c] to-[#1a1208] text-white shadow-[0_12px_40px_-8px_rgba(245,158,11,0.45)] ring-2 ring-amber-500/25 transition hover:ring-amber-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1208]"
              aria-expanded={false}
              aria-controls="daleelak-assistant"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <span className="sr-only">فتح {ASSISTANT_NAME}</span>
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-700">
                <Compass className="h-6 w-6" strokeWidth={2.25} aria-hidden />
              </span>
            </motion.button>
            <span
              className="pointer-events-none absolute -top-1 end-0 z-[61] rounded-md bg-amber-300 px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-[#3b2508] shadow ring-1 ring-amber-900/30"
              aria-hidden
            >
              دليلك
            </span>
          </div>
        ) : null}
      </div>
    </>
  );
}
