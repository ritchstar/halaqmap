import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Sparkles,
  MapPin,
  Scissors,
  Store,
  BriefcaseBusiness,
} from 'lucide-react';
import { useAgentChatScroll } from '@/hooks/useAgentChatSurface';
import { PARTNER_EARLY_PRESENCE_DOCTRINE_SIMPLE_AR } from '@/config/partnerEarlyWaveCopy';

type Turn = { role: 'user' | 'assistant'; content: string; id: string };

const QUICK_TOPICS = [
  { label: 'الفرق بين الباقات', prompt: 'ما الفرق بين البرونزية والذهبية والماسية؟' },
  { label: 'الوضع النظامي والتوثيق', prompt: 'اشرح لي الوضع النظامي الحالي للمنصة والأنشطة الرسمية والترخيص والتوثيق.' },
  { label: 'اعتراض السعر', prompt: 'كيف ترد على اعتراض السعر لصالون متردد؟' },
  { label: 'ليش التواجد المبكر مهم؟', prompt: 'أقنعني لماذا التواجد المبكر داخل المنصة مهم للحلاق المستثمر.' },
  { label: 'خطة الانتشار للمستخدمين', prompt: 'اشرح لي منطق الإدارة في نشر المنصة على المستخدمين داخل مناطق المملكة.' },
  { label: 'الظهور عند الطلب', prompt: 'كيف يعمل الظهور عند الطلب فعلياً للصالون؟' },
  { label: 'إضافة المكتب الخاص', prompt: 'ما فائدة إضافة المكتب الخاص ولماذا تستحق؟' },
  { label: 'خطة الإغلاق', prompt: 'أعطني أسلوب إغلاق بيع مختصر لعميل ساخن.' },
] as const;

const PITCH_LINES = [
  'الباقات الحالية واضحة ومسبقة الدفع وفق السياسة المعتمدة داخل المنصة.',
  'التواجد المبكر داخل المنصة ليس شكلياً؛ هو تموضع يسبق اتساع الطلب في المنطقة.',
  'الإدارة تجهز الحلاقين أولاً ثم توسع وصول المستخدمين عليهم — هكذا يُبنى السوق الصحيح.',
  'إضافة المكتب الخاص ترفع جودة التشغيل وتحوّل الصفحة إلى قناة متابعة أدق.',
  'كل موضع يُبنى اليوم داخل المنصة قد يتحول لاحقاً إلى أفضلية تنافسية يصعب تعويضها.',
] as const;

function getGreeting(): string {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح المبيعات' : hour < 17 ? 'مساء الإنجاز' : 'مساء الإقفال الذكي';
  return `${greeting}.\n\nأنا مدير المبيعات التجاري لمنصة حلاق ماب.\nمهمتي هنا أن أوضح لك الباقات الفعلية الحالية، منطق التواجد المبكر، وخطة المنصة في تجهيز الحلاقين قبل توسيع الوصول للمستخدمين داخل مناطق المملكة.\n\n${PARTNER_EARLY_PRESENCE_DOCTRINE_SIMPLE_AR}\n\nاذكر لي ما الذي تريد حسمه أولاً: السعر، الباقة، أم ميزة الدخول المبكر؟`;
}

async function sendMsg(msg: string, history: Turn[]): Promise<string> {
  try {
    const res = await fetch('/api/public-b2b-sales-manager-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        history: history.slice(-10).map((turn) => ({ role: turn.role, content: turn.content })),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data.reply || 'وصلتني رسالتك، لكن الرد لم يكتمل. أعد المحاولة.';
  } catch (error) {
    return error instanceof Error ? error.message : 'تعذر الاتصال الآن. حاول بعد لحظة.';
  }
}

function TypingDots() {
  return (
    <div className="flex items-center gap-2 px-5 py-3.5">
      <span className="text-[0.72rem] text-amber-700/80">مدير المبيعات يجهز الرد</span>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-amber-500"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.15, 0.8] }}
          transition={{ duration: 0.9, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

export function SalesOfficeSaudiStyleChat() {
  const [turns, setTurns] = useState<Turn[]>([{ role: 'assistant', content: getGreeting(), id: 'welcome' }]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [pitchIdx, setPitchIdx] = useState(0);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const seq = useRef(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPitchIdx((current) => (current + 1) % PITCH_LINES.length);
    }, 3600);
    return () => window.clearInterval(id);
  }, []);

  useAgentChatScroll(messagesRef, [turns, loading]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text ?? draft).trim();
    if (!msg || loading) return;
    setDraft('');
    if (textRef.current) textRef.current.style.height = 'auto';

    const nextTurns: Turn[] = [...turns, { role: 'user', content: msg, id: `u-${++seq.current}` }];
    setTurns(nextTurns);
    setLoading(true);

    const reply = await sendMsg(msg, nextTurns);
    setTurns((prev): Turn[] => [...prev, { role: 'assistant', content: reply, id: `a-${++seq.current}` }]);
    setLoading(false);
  }, [draft, loading, turns]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <section className="relative mx-auto max-w-[84rem] [overflow-anchor:none]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="flex flex-col overflow-hidden rounded-3xl"
        style={{
          border: '1px solid rgba(201,162,39,0.24)',
          background: 'linear-gradient(165deg,#fffefa 0%,#fbf7ef 42%,#f8fbff 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85),0 24px 60px rgba(148,163,184,0.18),0 0 80px rgba(245,158,11,0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[linear-gradient(90deg,rgba(245,158,11,0.08),rgba(255,255,255,0.92),rgba(34,211,238,0.08))] px-5 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200 bg-[linear-gradient(145deg,#fffdf8,#f9f4e7)] shadow-[0_10px_24px_rgba(245,158,11,0.10)]">
              <BriefcaseBusiness className="h-5 w-5 text-amber-700" />
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ boxShadow: '0 0 8px rgba(52,211,153,0.45)' }}
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black text-slate-950">مدير المبيعات التجاري</p>
              <p className="text-[0.68rem] text-slate-500">الباقات · الظهور · التفعيل · الإقفال التجاري</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1.5">
            <motion.div
              className="h-2 w-2 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[0.6rem] font-bold text-emerald-700">نشط ومباشر</span>
          </div>
        </div>

        <div className="shrink-0 border-b border-slate-200 bg-white/80 px-5 py-3 md:px-6 [overflow-anchor:none]">
          <div className="mb-3 flex flex-wrap gap-2">
            {[
              { icon: Scissors, text: 'مخصص للصالونات' },
              { icon: Store, text: 'رخصة النفاذ' },
              { icon: MapPin, text: 'ظهور عند الطلب' },
              { icon: Sparkles, text: 'إضافة المكتب الخاص' },
            ].map((item) => (
              <span
                key={item.text}
                className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50/80 px-3 py-1.5 text-[0.72rem] font-semibold text-cyan-800"
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.text}
              </span>
            ))}
          </div>
          <div className="min-h-[5.5rem] sm:min-h-[4.75rem]">
            <motion.p
              key={pitchIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-amber-200 bg-white/92 px-4 py-3 text-[0.84rem] font-semibold leading-7 text-slate-800 shadow-[0_8px_18px_rgba(245,158,11,0.08)]"
            >
              {PITCH_LINES[pitchIdx]}
            </motion.p>
          </div>
        </div>

        <div
          ref={messagesRef}
          className="relative px-4 py-5 md:px-6"
        >
          {turns.length === 1 && !loading ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 w-full rounded-[1.6rem] border border-amber-200 bg-[linear-gradient(145deg,#fffdf7,#fbf4e6)] px-5 py-4 shadow-[0_16px_30px_rgba(245,158,11,0.08)]"
            >
              <p className="mb-1.5 text-[0.62rem] font-bold text-slate-500">مدير المبيعات التجاري</p>
              <p className="whitespace-pre-wrap text-[1rem] leading-8 text-slate-800" style={{ unicodeBidi: 'plaintext' }}>
                {turns[0].content}
              </p>
            </motion.div>
          ) : null}

          <div className="flex flex-col gap-4">
            {turns.slice(1).map((turn) => (
              <motion.div
                key={turn.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className={
                  turn.role === 'assistant'
                    ? 'w-full self-stretch max-w-none rounded-[1.6rem] border border-amber-200 bg-[linear-gradient(145deg,#fffdf7,#fbf4e6)] px-5 py-4 text-[1rem] leading-8 text-slate-800 shadow-[0_14px_26px_rgba(245,158,11,0.08)]'
                    : 'self-end w-full max-w-[92%] rounded-[1.4rem] rounded-tl-sm border border-cyan-200 bg-[linear-gradient(145deg,#f4fbfd,#eef8fb)] px-5 py-4 text-[1rem] leading-8 text-slate-800 shadow-[0_14px_26px_rgba(34,211,238,0.08)]'
                }
              >
                <p className="mb-1.5 text-[0.62rem] font-bold text-slate-500">
                  {turn.role === 'assistant' ? 'مدير المبيعات التجاري' : 'أنت'}
                </p>
                <p className="whitespace-pre-wrap break-words" style={{ unicodeBidi: 'plaintext' }}>
                  {turn.content}
                </p>
              </motion.div>
            ))}

            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-fit self-start rounded-2xl rounded-tr-sm border border-amber-200 bg-white/90 shadow-[0_8px_20px_rgba(245,158,11,0.08)]"
              >
                <TypingDots />
              </motion.div>
            ) : null}
          </div>
        </div>

        {!loading ? (
          <div className="shrink-0 border-t border-slate-200 bg-white/82 px-4 py-3.5 md:px-6">
            <div className="flex flex-wrap gap-2">
              {QUICK_TOPICS.map((topic) => (
                <button
                  key={topic.label}
                  type="button"
                  onClick={() => void handleSend(topic.prompt)}
                  className="rounded-full border border-amber-200 bg-white px-3.5 py-1.5 text-[0.74rem] font-semibold text-slate-700 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="shrink-0 border-t border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,250,252,0.98))] px-4 py-4 md:px-6">
          <motion.div
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/90 px-3.5 py-1.5 text-[0.76rem] font-bold text-amber-800 shadow-[0_0_0_1px_rgba(255,255,255,0.6)]"
            animate={{ opacity: [0.72, 1, 0.72] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
            </span>
            ابدأ الكتابة هنا
          </motion.div>
          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-2 shadow-[0_18px_36px_rgba(148,163,184,0.10),inset_0_1px_0_rgba(255,255,255,0.7)]">
            <div className="flex items-end gap-3">
              <textarea
                ref={textRef}
                value={draft}
                onChange={handleInput}
                onKeyDown={handleKey}
                disabled={loading}
                placeholder="اكتب سؤالك عن السعر أو الباقة أو التفعيل أو اعتراض العميل…"
                rows={2}
                className="flex-1 rounded-[1.1rem] border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-[1rem] leading-7 text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-200/60 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  minHeight: '60px',
                  maxHeight: '160px',
                  resize: 'none',
                  overflowY: 'auto',
                }}
                dir="rtl"
              />
              <motion.button
                type="button"
                onClick={() => void handleSend()}
                disabled={!draft.trim() || loading}
                whileTap={draft.trim() && !loading ? { scale: 0.9 } : undefined}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg,#f59e0b,#b45309)',
                  boxShadow: '0 0 24px rgba(245,158,11,0.24)',
                }}
              >
                <Send className="h-5 w-5 text-white" />
              </motion.button>
            </div>
          </div>
          <p className="mt-2 text-center text-[0.64rem] text-slate-500">
            يمكنك الكتابة مباشرة هنا في أي وقت، حتى بعد ظهور الردود
          </p>
        </div>
      </motion.div>
    </section>
  );
}
