/**
 * LegalObserverChat — مكتب الناظر القانوني ⚖️
 *
 * مدمج في أعلى صفحات:
 *  - سياسة الخصوصية
 *  - شروط الاستخدام
 *  - من نحن
 *  - لماذا تنضم (مسار الشركاء)
 *  - سياسة الاشتراك / رخصة النفاذ
 *
 * تصميم: midnight navy + ذهب قانوني — مختلف تماماً عن مكتب المبيعات
 * يظهر قبل النصوص الرسمية ليُرحِّب بالزائر ويُبسِّط له القانون
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, X, Send, ChevronDown, Shield } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Turn = { role: 'user' | 'assistant'; content: string; id: string };
interface Props { page: string }

// ─── Legal gold color ─────────────────────────────────────────────────────────
const GOLD = '#c9a227';
const GOLD_LIGHT = '#e8c547';
const NAVY = '#06091a';
const NAVY_MID = '#0d1225';

// ─── Rotating pitch lines ─────────────────────────────────────────────────────
const PITCH_LINES = [
  'اقرأ سياستنا — لكن اسألني أولاً ⚖️',
  'حقوقك محفوظة — وأنا هنا لشرحها',
  'الشروط طويلة؟ أخبرني باهتمامك وأُلخِّص 📋',
  'خصوصيتك أمانة لدينا — اسألني كيف',
  'سؤالك القانوني يستحق إجابة واضحة',
  'PDPL · حقوق المستخدم · شروط الاستخدام — موجود لكل شيء',
];

// ─── Quick prompts per page ───────────────────────────────────────────────────
const QUICK_BY_PAGE: Record<string, string[]> = {
  'سياسة الخصوصية': [
    'ماذا تجمعون من بياناتي؟',
    'هل تُشارَك بياناتي مع أحد؟',
    'كيف أحذف بياناتي؟',
    'هل تتبعون موقعي باستمرار؟',
  ],
  'شروط الاستخدام': [
    'هل يمكنني استرداد المبلغ؟',
    'ما مدة صلاحية الباقة؟',
    'ماذا بعد انتهاء الباقة؟',
    'ما حقوقي كمستخدم؟',
  ],
  'من نحن': [
    'هل حلاق ماب تأخذ عمولة؟',
    'ما الفرق بينها وبين تطبيقات الحجز؟',
    'أين مقر الشركة؟',
    'كيف تكسب المنصة؟',
  ],
  'لماذا تنضم': [
    'هل حلاق ماب وسيط تجاري؟',
    'ما الفرق بين الرخصة وتطبيق حجز؟',
    'هل تُفرض عمولة على خدمة الحلاقة؟',
    'ما التزاماتي القانونية كشريك؟',
  ],
  'سياسة الاشتراك': [
    'هل يمكنني استرداد المبلغ بعد الشراء؟',
    'ما مدة صلاحية حزمة الرخصة؟',
    'هل يوجد تجديد تلقائي؟',
    'ماذا يحدث عند انتهاء الحزمة؟',
  ],
};

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <span className="text-[0.68rem]" style={{ color: `${GOLD}99` }}>الناظر يقرأ</span>
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1, delay: i * 0.16, repeat: Infinity }} />
      ))}
    </div>
  );
}

// ─── API call ─────────────────────────────────────────────────────────────────
async function sendMsg(msg: string, history: Turn[], page: string): Promise<string> {
  try {
    const res = await fetch('/api/public-legal-observer-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg, page,
        history: history.slice(-6).map((t) => ({ role: t.role, content: t.content })),
      }),
    });
    const data = (await res.json()) as { reply?: string };
    return data.reply || 'لم يصل الرد — عاود المحاولة.';
  } catch {
    return 'خلل في الاتصال — عاود المحاولة.';
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LegalObserverChat({ page }: Props) {
  const [open, setOpen] = useState(false);
  const [pitchIdx, setPitchIdx] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: 'assistant',
      content: `مرحباً ⚖️\nأنا الناظر القانوني لحلاق ماب — متخصص في شرح سياسات المنصة وحقوق المستخدمين.\nأنت في صفحة "${page}" — اسألني أي شيء قبل أن تقرأ.`,
      id: 'welcome',
    },
  ]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const seq = useRef(0);
  const quickPrompts = QUICK_BY_PAGE[page] ?? QUICK_BY_PAGE['سياسة الخصوصية'];

  useEffect(() => {
    const id = setInterval(() => setPitchIdx((i) => (i + 1) % PITCH_LINES.length), 3400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (open) { setTimeout(() => textRef.current?.focus(), 150); }
  }, [open]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, loading, open]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text ?? draft).trim();
    if (!msg || loading) return;
    setDraft('');
    if (textRef.current) textRef.current.style.height = 'auto';
    const next: Turn[] = [...turns, { role: 'user', content: msg, id: `u-${++seq.current}` }];
    setTurns(next);
    setLoading(true);
    const reply = await sendMsg(msg, next, page);
    setTurns((p) => [...p, { role: 'assistant', content: reply, id: `a-${++seq.current}` }]);
    setLoading(false);
  }, [draft, loading, turns, page]);

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); }
  }, [handleSend]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }, []);

  return (
    <div dir="rtl" className="relative mb-6 w-full" style={{ zIndex: open ? 50 : 10 }}>

      <AnimatePresence mode="wait">
        {!open ? (
          /* ══════════ TEASER — لوحة قانونية أفقية ══════════ */
          <motion.div key="teaser"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl cursor-pointer"
            onClick={() => setOpen(true)}
          >
            {/* Layer 1: Background */}
            <div className="absolute inset-0 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MID} 50%, #0a0e20 100%)`,
                border: `1px solid ${GOLD}45`,
                boxShadow: `0 0 40px ${GOLD}18, 0 8px 32px rgba(0,0,0,0.6)`,
              }} />

            {/* Layer 2: Subtle legal grid pattern */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.03]"
              style={{ backgroundImage: `linear-gradient(${GOLD} 1px, transparent 1px), linear-gradient(90deg, ${GOLD} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

            {/* Layer 3: Left gold accent bar */}
            <div className="absolute right-0 top-0 h-full w-1 rounded-r-2xl"
              style={{ background: `linear-gradient(to bottom, transparent, ${GOLD}80, transparent)` }} />

            {/* Layer 4: Shimmer */}
            <motion.div className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{ background: `linear-gradient(135deg, transparent 40%, ${GOLD}06 50%, transparent 60%)` }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }} />

            <div className="relative flex items-center gap-5 px-5 py-4">
              {/* Scale icon */}
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                <div className="absolute inset-0 rounded-2xl"
                  style={{ background: `radial-gradient(circle, ${GOLD}25 0%, transparent 70%)`, filter: 'blur(6px)' }} />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${NAVY_MID}, ${NAVY})`,
                    border: `1.5px solid ${GOLD}55`,
                    boxShadow: `0 0 18px ${GOLD}30, inset 0 1px 0 ${GOLD_LIGHT}20`,
                  }}>
                  <Scale className="h-6 w-6" style={{ color: GOLD }} strokeWidth={1.5} />
                  {/* Shield badge */}
                  <div className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full"
                    style={{ background: GOLD, border: `2px solid ${NAVY}` }}>
                    <Shield className="h-2.5 w-2.5 text-black" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-black text-white">الناظر القانوني</p>
                  <div className="flex items-center gap-1 rounded-full px-2 py-0.5"
                    style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}35` }}>
                    <motion.div className="h-1.5 w-1.5 rounded-full" style={{ background: '#4ade80' }}
                      animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                    <span className="text-[0.52rem] font-bold" style={{ color: `${GOLD}cc` }}>متاح الآن</span>
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p key={pitchIdx}
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.3 }}
                    className="text-[0.78rem] font-semibold leading-snug"
                    style={{ color: `${GOLD}bb` }}>
                    {PITCH_LINES[pitchIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Stats */}
              <div className="hidden items-center gap-3 sm:flex">
                {[
                  { val: 'PDPL', lbl: 'امتثال' },
                  { val: '٢٤/٧', lbl: 'متاح' },
                  { val: '١٠٠٪', lbl: 'موثوق' },
                ].map((s) => (
                  <div key={s.lbl} className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-2"
                    style={{ background: `${GOLD}0e`, border: `1px solid ${GOLD}22` }}>
                    <span className="text-[0.72rem] font-black text-white">{s.val}</span>
                    <span className="text-[0.5rem]" style={{ color: `${GOLD}70` }}>{s.lbl}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                className="shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[0.72rem] font-black"
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, #a87e1a)`,
                  color: '#000',
                  boxShadow: `0 2px 14px ${GOLD}40`,
                }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              >
                <Scale className="h-3.5 w-3.5" />
                اسألني الآن
              </motion.div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 inset-x-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}50, transparent)` }} />
          </motion.div>

        ) : (
          /* ══════════ CHAT PANEL ══════════ */
          <motion.div key="chat"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="relative flex flex-col overflow-hidden rounded-2xl"
            style={{ height: 'min(85dvh, 580px)' }}
          >
            {/* Background */}
            <div className="absolute inset-0 rounded-2xl"
              style={{
                background: `linear-gradient(160deg, ${NAVY_MID} 0%, ${NAVY} 100%)`,
                border: `1px solid ${GOLD}40`,
                boxShadow: `0 0 60px ${GOLD}20, 0 16px 60px rgba(0,0,0,0.7)`,
              }} />
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.025]"
              style={{ backgroundImage: `linear-gradient(${GOLD} 1px, transparent 1px), linear-gradient(90deg, ${GOLD} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            <div className="absolute right-0 top-0 h-full w-1 rounded-r-2xl"
              style={{ background: `linear-gradient(to bottom, transparent, ${GOLD}70, transparent)` }} />

            {/* Header */}
            <div className="relative shrink-0 flex items-center justify-between gap-3 px-4 py-3.5"
              style={{ borderBottom: `1px solid ${GOLD}20` }}>
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${NAVY_MID}, ${NAVY})`, border: `1.5px solid ${GOLD}50`, boxShadow: `0 0 16px ${GOLD}25` }}>
                  <Scale className="h-5 w-5" style={{ color: GOLD }} strokeWidth={1.8} />
                  <motion.div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border"
                    style={{ background: '#4ade80', borderColor: NAVY }}
                    animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
                </div>
                <div>
                  <p className="text-sm font-black text-white">الناظر القانوني ⚖️</p>
                  <p className="text-[0.57rem]" style={{ color: `${GOLD}60` }}>صفحة: {page} · حلاق ماب</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                style={{ color: `${GOLD}60` }}
                onMouseEnter={(e) => (e.currentTarget.style.color = GOLD_LIGHT)}
                onMouseLeave={(e) => (e.currentTarget.style.color = `${GOLD}60`)}>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
              <div className="flex flex-col gap-2.5">
                {turns.map((t) => (
                  <motion.div key={t.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={t.role === 'assistant'
                      ? 'self-start max-w-[90%] rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-[0.875rem] leading-6'
                      : 'self-end max-w-[90%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[0.875rem] leading-6 text-slate-100'}
                    style={t.role === 'assistant'
                      ? { background: `${GOLD}0d`, border: `1px solid ${GOLD}22`, color: `${GOLD_LIGHT}f0` }
                      : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <p className="mb-1 text-[0.55rem] font-bold opacity-40">
                      {t.role === 'assistant' ? 'الناظر القانوني ⚖️' : 'أنت'}
                    </p>
                    <p className="whitespace-pre-wrap break-words" style={{ unicodeBidi: 'plaintext' }}>{t.content}</p>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="self-start rounded-2xl rounded-tr-sm"
                    style={{ background: `${GOLD}0d`, border: `1px solid ${GOLD}22` }}>
                    <TypingDots />
                  </motion.div>
                )}
                <div ref={endRef} className="h-1" />
              </div>
            </div>

            {/* Quick prompts */}
            {turns.length <= 2 && !loading && (
              <div className="shrink-0 px-3 py-2.5" style={{ borderTop: `1px solid ${GOLD}15` }}>
                <p className="mb-2 text-[0.58rem]" style={{ color: `${GOLD}55` }}>اسألني مباشرة:</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((q) => (
                    <button key={q} type="button" onClick={() => void handleSend(q)}
                      className="rounded-full px-3 py-1.5 text-[0.64rem] font-semibold transition-all"
                      style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}28`, color: `${GOLD_LIGHT}cc` }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = `${GOLD}20`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = `${GOLD}10`; }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="relative shrink-0 px-3 py-3" style={{ borderTop: `1px solid ${GOLD}18` }}>
              <div className="flex items-end gap-2">
                <textarea ref={textRef} value={draft} onChange={handleInput} onKeyDown={handleKey}
                  disabled={loading}
                  placeholder="سؤالك القانوني… (Enter للإرسال)"
                  rows={1}
                  style={{
                    minHeight: '44px', maxHeight: '120px', resize: 'none', overflowY: 'auto',
                    background: `${NAVY_MID}`, border: `1px solid ${GOLD}25`, color: 'white',
                    borderRadius: '12px', padding: '10px 14px', fontSize: '0.875rem', lineHeight: '1.5',
                    outline: 'none',
                  }}
                  className="flex-1 placeholder-[rgba(201,162,39,0.28)] transition-all disabled:opacity-50 focus:ring-1"
                  onFocus={(e) => { e.target.style.borderColor = `${GOLD}60`; }}
                  onBlur={(e) => { e.target.style.borderColor = `${GOLD}25`; }}
                  dir="rtl"
                />
                <motion.button type="button"
                  onClick={() => void handleSend()}
                  disabled={!draft.trim() || loading}
                  whileTap={draft.trim() && !loading ? { scale: 0.9 } : undefined}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD}, #a87e1a)`,
                    boxShadow: `0 4px 14px ${GOLD}35`,
                  }}>
                  <Send className="h-4 w-4 text-black" />
                </motion.button>
              </div>
              <p className="mt-1.5 text-center text-[0.52rem]" style={{ color: `${GOLD}20` }}>
                الناظر القانوني · حلاق ماب · مهمة سرية: يُسجِّل الاستفسارات
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
