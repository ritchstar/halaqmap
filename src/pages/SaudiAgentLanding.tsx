/**
 * SaudiAgentLanding — صفحة هبوط وكيل «سعودي» 🇸🇦
 *
 * تصميم فاخر بالهوية السعودية: أخضر وذهبي وأبيض
 * محادثة مباشرة مع الوكيل الذكي
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronDown, Sparkles, Globe2, BookOpen, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib';

// ─── Types ───────────────────────────────────────────────────────────────────
type Turn = { role: 'user' | 'assistant'; content: string; id: string };

// ─── Quick Prompts ───────────────────────────────────────────────────────────
const QUICK_TOPICS = [
  { label: '🏆 كأس العالم ٢٠٣٤', prompt: 'حدثني عن استضافة المملكة لكأس العالم ٢٠٣٤' },
  { label: '🌆 إكسبو ٢٠٣٠', prompt: 'وش هو إكسبو ٢٠٣٠ الرياض؟ شفّلي تفاصيله' },
  { label: '🏗️ مشروع نيوم', prompt: 'قولي عن نيوم وذا لاين' },
  { label: '📜 تاريخ المملكة', prompt: 'احكيلي عن تأسيس المملكة العربية السعودية من البداية' },
  { label: '🌴 العُلا والحجر', prompt: 'وش في العُلا؟ أبي أسافر لها' },
  { label: '👀 رؤية ٢٠٣٠', prompt: 'شرحلي رؤية ٢٠٣٠ وش تبي تحقق؟' },
  { label: '🦅 رموز الوطن', prompt: 'حدثني عن رموز المملكة العربية السعودية' },
  { label: '✂️ حلاق ماب', prompt: 'وش هي منصة حلاق ماب؟' },
];

// ─── Saudi Greetings carousel ────────────────────────────────────────────────
const GREETINGS = [
  'يا هلا والله ومسهلا بك 🇸🇦',
  'الله يحييك وين ما كنت 🌴',
  'أبشر بسعدك يا صديقي 🤝',
  'هلا هلا — شرّفت وزيّنت 🌟',
];

// ─── Typing indicator ────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-2 px-5 py-3.5">
      <span className="text-[0.72rem] text-green-300/60">سعودي يكتب</span>
      {[0, 1, 2].map((i) => (
        <motion.div key={i}
          className="h-2 w-2 rounded-full bg-green-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 0.9, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

// ─── API call ────────────────────────────────────────────────────────────────
async function sendMsg(msg: string, history: Turn[]): Promise<string> {
  try {
    const res = await fetch('/api/public-saudi-agent-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        history: history.slice(-14).map((t) => ({ role: t.role, content: t.content })),
      }),
    });
    const data = (await res.json()) as { reply?: string; error?: string };
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data.reply || 'الله يعيننا — ما وصلني ردك، عاود! 🙏';
  } catch (e) {
    return e instanceof Error ? e.message : 'في مشكلة بالاتصال — جرّب بعد ثانية. 🔄';
  }
}

// ─── Saudi Emblem SVG ────────────────────────────────────────────────────────
function SaudiEmblem({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* دائرة خارجية */}
      <circle cx="50" cy="50" r="48" stroke="#c9a227" strokeWidth="2" fill="none" />
      <circle cx="50" cy="50" r="44" stroke="#c9a227" strokeWidth="0.5" fill="none" opacity="0.5" />
      {/* النخلة المبسطة */}
      <rect x="48" y="45" width="4" height="30" rx="2" fill="#c9a227" />
      <ellipse cx="50" cy="42" rx="16" ry="10" fill="#1a6e3b" opacity="0.9" />
      <ellipse cx="50" cy="40" rx="12" ry="8" fill="#1e8040" />
      <ellipse cx="50" cy="38" rx="8" ry="6" fill="#22913f" />
      {/* السيفان */}
      <line x1="20" y1="72" x2="80" y2="72" stroke="#c9a227" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 20 72 Q 50 65 80 72" stroke="#c9a227" strokeWidth="1.5" fill="none" />
      <path d="M 20 72 Q 50 79 80 72" stroke="#c9a227" strokeWidth="1.5" fill="none" />
      {/* نجوم زخرفية */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = 50 + 38 * Math.cos(rad);
        const y = 50 + 38 * Math.sin(rad);
        return <circle key={i} cx={x} cy={y} r="1.5" fill="#c9a227" opacity="0.6" />;
      })}
    </svg>
  );
}

// ─── Star field background ───────────────────────────────────────────────────
function StarField() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 4,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 3 + Math.random() * 2, delay: s.delay, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SaudiAgentLanding() {
  const navigate = useNavigate();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [greetingIdx, setGreetingIdx] = useState(0);
  const [chatStarted, setChatStarted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const seq = useRef(0);

  // تدوير التحيات
  useEffect(() => {
    const t = setInterval(() => setGreetingIdx((i) => (i + 1) % GREETINGS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, loading]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text ?? draft).trim();
    if (!msg || loading) return;
    setDraft('');
    if (textRef.current) textRef.current.style.height = 'auto';
    setChatStarted(true);

    const userTurn: Turn = { role: 'user', content: msg, id: `u-${++seq.current}` };
    const next = [...turns, userTurn];
    setTurns(next);
    setLoading(true);

    const reply = await sendMsg(msg, next);
    setTurns((p) => [...p, { role: 'assistant', content: reply, id: `a-${++seq.current}` }]);
    setLoading(false);
    setTimeout(() => textRef.current?.focus(), 100);
  }, [draft, loading, turns]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg,#0a1f0f 0%,#061510 40%,#0d1c08 70%,#0a1810 100%)' }}
    >
      <StarField />

      {/* ── زر العودة للرئيسية ── */}
      <motion.button
        type="button"
        onClick={() => navigate(ROUTE_PATHS.HOME)}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ x: -3 }}
        className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl border border-yellow-500/30 bg-[#0a1f0f]/90 px-4 py-2.5 text-[0.75rem] font-bold text-yellow-300/80 backdrop-blur-md transition-all hover:border-yellow-400/55 hover:text-yellow-200"
        style={{ boxShadow: '0 0 16px rgba(26,110,59,0.25)' }}
      >
        <ArrowRight className="h-4 w-4" />
        العودة للرئيسية
      </motion.button>

      {/* ── خلفية سديمية ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-green-700/12 blur-[180px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-yellow-600/10 blur-[160px]" />
        <div className="absolute top-1/3 right-0 h-[300px] w-[300px] rounded-full bg-green-500/8 blur-[120px]" />
        {/* شبكة نقطية */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle,rgba(201,162,39,1) 1px,transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      {/* ── خط علوي ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{ background: 'linear-gradient(90deg,transparent,#c9a227,#1a6e3b,#c9a227,transparent)' }}
      />

      {/* ════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════ */}
      <section className="relative px-5 pt-16 pb-10 text-center">
        {/* شارة */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/35 bg-yellow-500/10 px-5 py-2 text-xs font-bold tracking-widest text-yellow-300"
        >
          <Sparkles className="h-3.5 w-3.5" />
          وكيل ذكي · مدعوم بـ GPT-4o · متعدد اللغات
          <Sparkles className="h-3.5 w-3.5" />
        </motion.div>

        {/* الشعار + الاسم */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col items-center gap-5"
        >
          <motion.div
            animate={{ rotateY: [0, 8, 0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <SaudiEmblem size={100} />
          </motion.div>

          <div>
            <h1
              className="text-6xl font-black tracking-tight md:text-8xl"
              style={{
                background: 'linear-gradient(135deg,#fde68a 0%,#c9a227 35%,#ffffff 55%,#c9a227 80%,#fde68a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
                filter: 'drop-shadow(0 0 40px rgba(201,162,39,0.5))',
              }}
            >
              سعودي
            </h1>
            <p className="mt-2 text-lg font-semibold text-green-300/80">
              مرافقك الذكي إلى قلب المملكة العربية السعودية
            </p>
          </div>
        </motion.div>

        {/* تحيات دوّارة */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 h-8"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={greetingIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="text-xl font-bold text-yellow-300"
            >
              {GREETINGS[greetingIdx]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-400"
        >
          صديقك السعودي الذكي — يحكيلك عن تاريخ المملكة، رؤية ٢٠٣٠، الفعاليات الكبرى، المدن، الثقافة،
          ويرد عليك بأي لغة تكتب. سمّه، ناقشه، واسأله عن كل شيء.
        </motion.p>

        {/* بادجات إمكانيات */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          {[
            { icon: BookOpen, text: 'تاريخ المملكة' },
            { icon: MapPin, text: 'الجغرافيا والمدن' },
            { icon: Globe2, text: 'متعدد اللغات' },
            { icon: Sparkles, text: 'رؤية ٢٠٣٠' },
          ].map(({ icon: Icon, text }) => (
            <span key={text}
              className="flex items-center gap-1.5 rounded-full border border-green-500/25 bg-green-500/8 px-3 py-1.5 text-xs font-semibold text-green-300"
            >
              <Icon className="h-3.5 w-3.5" />
              {text}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          CHAT SECTION
      ════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-3xl px-4 pb-20">

        {/* لوحة المحادثة */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="overflow-hidden rounded-3xl"
          style={{
            border: '1px solid rgba(201,162,39,0.30)',
            background: 'linear-gradient(160deg,rgba(26,110,59,0.12) 0%,rgba(6,21,16,0.95) 40%,rgba(13,28,8,0.98) 100%)',
            boxShadow: '0 0 80px rgba(26,110,59,0.20),0 0 160px rgba(201,162,39,0.08),inset 0 1px 0 rgba(201,162,39,0.20)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* هيدر المحادثة */}
          <div className="flex items-center justify-between border-b border-yellow-500/15 bg-gradient-to-l from-green-900/20 via-transparent to-yellow-900/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-yellow-500/35 bg-gradient-to-br from-green-800/50 to-yellow-900/30">
                <span className="text-2xl">🇸🇦</span>
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a1f0f] bg-emerald-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ boxShadow: '0 0 8px rgba(52,211,153,0.8)' }}
                />
              </div>
              <div>
                <p className="text-base font-black text-yellow-200">سعودي 🤝</p>
                <p className="text-[0.62rem] text-green-400/60">الوكيل الذكي · متاح الآن · يرد بلغتك</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/8 px-3 py-1">
              <motion.div className="h-2 w-2 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <span className="text-[0.6rem] font-bold text-green-300">نشط</span>
            </div>
          </div>

          {/* منطقة الرسائل */}
          <div
            className="relative overflow-y-auto overscroll-contain px-5 py-5 scroll-smooth"
            style={{ minHeight: chatStarted ? '380px' : '120px', maxHeight: '55dvh', transition: 'min-height 0.4s ease' }}
          >
            {/* رسالة ترحيب */}
            {turns.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="self-start max-w-[88%] rounded-2xl rounded-tr-sm border border-green-500/22 bg-gradient-to-br from-green-900/30 to-green-950/20 px-5 py-4"
              >
                <p className="mb-1.5 text-[0.62rem] font-bold text-green-400/50">سعودي 🇸🇦</p>
                <p className="text-[1rem] leading-7 text-green-50">
                  يا هلا وسهلا! 🇸🇦 أنا «سعودي» — رفيقك الذكي من قلب المملكة.
                  <br />
                  سلني عن أي شيء: تاريخنا، مدننا، رؤية ٢٠٣٠، الفعاليات القادمة، أو أي سؤال في بالك.
                  <br />
                  وإذا تبي تكلمني بالإنجليزي أو أي لغة ثانية — أنا هنا! 😄
                </p>
              </motion.div>
            )}

            {/* الرسائل */}
            <div className="flex flex-col gap-4">
              {turns.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className={t.role === 'assistant'
                    ? 'self-start max-w-[88%] rounded-2xl rounded-tr-sm border border-green-500/20 bg-gradient-to-br from-green-900/25 to-green-950/15 px-5 py-4 text-[1rem] leading-7 text-green-50'
                    : 'self-end max-w-[88%] rounded-2xl rounded-tl-sm border border-yellow-500/20 bg-gradient-to-br from-yellow-900/20 to-yellow-950/15 px-5 py-4 text-[1rem] leading-7 text-yellow-50'}
                >
                  <p className="mb-1.5 text-[0.62rem] font-bold opacity-45">
                    {t.role === 'assistant' ? 'سعودي 🇸🇦' : 'أنت'}
                  </p>
                  <p className="whitespace-pre-wrap break-words" style={{ unicodeBidi: 'plaintext' }}>{t.content}</p>
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="self-start rounded-2xl rounded-tr-sm border border-green-500/18 bg-green-900/20">
                  <TypingDots />
                </motion.div>
              )}
              <div ref={endRef} className="h-2" />
            </div>
          </div>

          {/* أسئلة سريعة */}
          {!loading && (
            <div className="border-t border-yellow-500/10 bg-black/20 px-4 py-3.5">
              <p className="mb-2.5 text-[0.65rem] font-bold text-yellow-500/40">💡 اختر موضوعاً أو اكتب سؤالك:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_TOPICS.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => void handleSend(q.prompt)}
                    className="rounded-full border border-green-500/25 bg-green-500/10 px-3.5 py-1.5 text-[0.72rem] font-semibold text-green-300/90 hover:border-green-400/50 hover:bg-green-500/18 hover:text-green-200 transition-all"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* منطقة الكتابة */}
          <div className="border-t border-yellow-500/12 bg-gradient-to-t from-black/40 to-transparent px-4 py-4">
            <div className="flex items-end gap-3">
              <textarea
                ref={textRef}
                value={draft}
                onChange={handleInput}
                onKeyDown={handleKey}
                disabled={loading}
                placeholder="اكتب سؤالك بأي لغة… (Enter للإرسال، Shift+Enter سطر جديد)"
                rows={2}
                style={{ minHeight: '60px', maxHeight: '160px', resize: 'none', overflowY: 'auto' }}
                className="flex-1 rounded-2xl border border-green-500/25 bg-[#071510]/80 px-5 py-3.5 text-[1rem] leading-7 text-white placeholder:text-green-400/30 outline-none focus:border-green-400/55 focus:ring-2 focus:ring-green-400/20 transition-all disabled:opacity-50"
                dir="rtl"
              />
              <motion.button
                type="button"
                onClick={() => void handleSend()}
                disabled={!draft.trim() || loading}
                whileTap={draft.trim() && !loading ? { scale: 0.9 } : undefined}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg,#1a6e3b,#22913f)',
                  boxShadow: '0 0 24px rgba(26,110,59,0.5)',
                }}
              >
                <Send className="h-5 w-5 text-white" />
              </motion.button>
            </div>
            <p className="mt-2 text-center text-[0.58rem] text-green-400/20">
              سعودي · وكيل ذكي مدعوم بالذكاء الاصطناعي · يرد بلغتك
            </p>
          </div>
        </motion.div>

        {/* سهم للأسفل يشير للمحادثة */}
        {!chatStarted && (
          <motion.div
            className="mt-4 flex justify-center"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="h-6 w-6 text-yellow-400/40" />
          </motion.div>
        )}
      </section>

      {/* ════════════════════════════════════════
          FEATURES SECTION
      ════════════════════════════════════════ */}
      <section className="relative border-t border-yellow-500/10 px-5 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="text-[0.7rem] font-black tracking-widest text-yellow-500/50">ما يعرفه سعودي</p>
            <h2 className="mt-2 text-3xl font-black text-white">معرفة شاملة بلا حدود</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                emoji: '🏛️', title: 'التاريخ السعودي',
                desc: 'من الدولة السعودية الأولى ١٧٤٤م إلى العهد الزاهر — كل حقبة بتفاصيلها',
                accent: '#c9a227',
              },
              {
                emoji: '🗺️', title: 'الجغرافيا والمناطق',
                desc: 'المناطق الثلاث عشرة، المدن، الجبال، السواحل، الصحاري، والواحات',
                accent: '#22913f',
              },
              {
                emoji: '🚀', title: 'رؤية ٢٠٣٠',
                desc: 'الأهداف، المشاريع الكبرى، نيوم، القدية، إكسبو ٢٠٣٠، كأس العالم ٢٠٣٤',
                accent: '#06b6d4',
              },
              {
                emoji: '🎭', title: 'الثقافة والتراث',
                desc: 'الأزياء، الأكلات، الأغاني الوطنية، رموز المملكة، الفنون والمهرجانات',
                accent: '#a78bfa',
              },
              {
                emoji: '🌍', title: 'متعدد اللغات',
                desc: 'يرد بالعربية السعودية الأصيلة أو بأي لغة تختارها بطلاقة واحترافية',
                accent: '#f59e0b',
              },
              {
                emoji: '✂️', title: 'حلاق ماب',
                desc: 'يعرف منصة حلاق ماب ويُحيل أسئلة الانضمام لمختصيها مباشرة',
                accent: '#22913f',
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group relative overflow-hidden rounded-2xl p-5"
                style={{
                  border: `1px solid ${card.accent}28`,
                  background: `linear-gradient(155deg,${card.accent}10 0%,rgba(6,21,16,0.95) 60%,${card.accent}06 100%)`,
                  boxShadow: `0 0 20px ${card.accent}10`,
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `radial-gradient(ellipse 80% 80% at 50% 50%,${card.accent}12,transparent)` }}
                />
                <p className="mb-3 text-3xl">{card.emoji}</p>
                <h3 className="mb-2 text-base font-black text-white">{card.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative border-t border-yellow-500/10 px-5 py-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-px flex-1 max-w-[120px]" style={{ background: 'linear-gradient(to right,transparent,rgba(201,162,39,0.3))' }} />
          <SaudiEmblem size={28} />
          <div className="h-px flex-1 max-w-[120px]" style={{ background: 'linear-gradient(to left,transparent,rgba(201,162,39,0.3))' }} />
        </div>
        <p className="text-[0.65rem] text-slate-600">
          سعودي · وكيل ذكي مدعوم بالذكاء الاصطناعي · مقدّم من منصة حلاق ماب 🇸🇦
        </p>
        <p className="mt-1 text-[0.58rem] text-slate-700">
          المعلومات للإثراء المعرفي فقط — الرجوع للمصادر الرسمية للقرارات الرسمية
        </p>
      </footer>
    </div>
  );
}
