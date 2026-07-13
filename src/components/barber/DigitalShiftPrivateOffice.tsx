/**
 * DigitalShiftPrivateOffice — المكتب الخاص للمناوب الرقمي
 *
 * محادثة داخلية حصرية بين الحلاق والمناوب الذكي
 * نظام الصندوق الفاخر — تصميم ذهبي/بنفسجي داكن
 *
 * المزايا:
 *  · تعليمات دائمة محفوظة يُعطيها الحلاق للمناوب
 *  · قائمة مهام مع تتبع الإنجاز
 *  · عرض تاريخ انتهاء الحزمة + روابط الدفع والدعم
 *  · محادثة غنية بفقاعات فاخرة وأيقونات
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAgentChatInputFocus, useAgentChatScroll } from '@/hooks/useAgentChatSurface';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, Send, Plus, Trash2, CheckCircle2, Circle,
  Zap, CreditCard, HeadphonesIcon,
  BookOpen, ListTodo, Sparkles, X, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import type { BarberPlatformBannerState } from '@/lib/barberDashboardLocalState';
import type { Post } from '@/lib';
import { buildSalonSnapshotPayload } from '@/lib/digitalShiftSalonSnapshot';
import {
  readShiftInstructions, writeShiftInstructions,
  readShiftTasks, writeShiftTasks,
  type ShiftInstruction, type ShiftTask,
} from '@/lib/barberDashboardLocalState';
import {
  digitalShiftBarberChatRemote,
  fleetDirectivesReadRemote,
  syncInstructionsRemote,
  shiftReportsReadRemote,
  type FleetDirective,
  type ShiftReport,
} from '@/lib/digitalShiftAssistantRemote';
import { sanitizeBarberFacingCopyAr } from '@/lib/barberFacingCopySanitize';
import { BarberDashboardOutboundAnchor } from '@/components/barber/BarberDashboardOutboundLink';
import { ROUTE_PATHS } from '@/lib/index';

type ChatTurn = { role: 'user' | 'assistant'; content: string; ts: string };

// ─── رموز التوجيه — كل رمز يُدرج في الشات ويُعالَج تلقائياً ──────────────────
const CODE_BUTTONS = [
  { code: 'تعليمة', label: 'تعليمة:', color: 'border-violet-300/55 bg-violet-500/25 text-violet-50', hint: 'توجيه دائم للمناوب يُطبَّق مع الزبائن', affects: 'shift' },
  { code: 'عرض',    label: 'عرض:',    color: 'border-amber-300/55 bg-amber-500/25 text-amber-50',   hint: 'عرض أو تخفيض يذكره المناوب للزبائن',   affects: 'shift' },
  { code: 'جدول',   label: 'جدول:',   color: 'border-sky-300/55 bg-sky-500/25 text-sky-50',         hint: 'أوقات العمل والإجازات',                  affects: 'shift' },
  { code: 'خدمة',   label: 'خدمة:',   color: 'border-teal-300/55 bg-teal-500/25 text-teal-50',      hint: 'خدمات وأسعار يردّ بها المناوب',          affects: 'shift' },
  { code: 'موقع',   label: 'موقع:',   color: 'border-emerald-300/55 bg-emerald-500/25 text-emerald-50', hint: 'وصف الموقع والوصول للصالون',         affects: 'shift' },
  { code: 'رد',     label: 'رد:',     color: 'border-rose-300/55 bg-rose-500/25 text-rose-50',       hint: 'قالب رد لموقف محدد',                     affects: 'shift' },
  { code: 'تنبيه',  label: 'تنبيه:',  color: 'border-orange-300/55 bg-orange-500/25 text-orange-50', hint: 'تنبيه مؤقت — إغلاق أو حدث',            affects: 'shift' },
  { code: 'مهمة',   label: 'مهمة:',   color: 'border-lime-300/55 bg-lime-500/25 text-lime-50',       hint: 'مهمة تُضاف لقائمة المهام',               affects: 'tasks' },
  { code: 'تذكير',  label: 'تذكير:',  color: 'border-pink-300/55 bg-pink-500/25 text-pink-50',       hint: 'تذكير شخصي بموعد أو مهمة قادمة',        affects: 'tasks' },
] as const;

function nowTs() {
  return new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}
function nid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="h-2 w-2 rounded-full bg-violet-400"
          animate={{ scale: [0.7, 1.2, 0.7], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, delay: i * 0.18, repeat: Infinity }} />
      ))}
    </div>
  );
}

// ─── Package status bar ───────────────────────────────────────────────────────
function PackageStatusBar({ daysRemaining }: { daysRemaining: number }) {
  const urgent = daysRemaining <= 5;
  const warning = daysRemaining <= 14 && !urgent;
  const color = urgent ? 'border-red-500/50 bg-red-950/40' : warning ? 'border-amber-500/40 bg-amber-950/30' : 'border-violet-500/25 bg-violet-950/20';
  const textColor = urgent ? 'text-red-300' : warning ? 'text-amber-300' : 'text-violet-300';
  const icon = urgent ? '🚨' : warning ? '⚠️' : '💎';

  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${color}`}>
      <div className="flex items-center gap-2.5">
        <span className="text-lg">{icon}</span>
        <div>
          <p className={`text-base font-black tracking-tight ${textColor} [text-shadow:0_0_18px_rgba(255,255,255,0.12)]`}>
            {daysRemaining === 0 ? 'الحزمة منتهية!' : `${daysRemaining} يوم متبقٍ`}
          </p>
          <p className="text-sm font-medium text-slate-300">حزمة رخصة النفاذ الماسية</p>
        </div>
      </div>
      <div className="flex gap-2">
        <BarberDashboardOutboundAnchor
          href={`/#${ROUTE_PATHS.PAYMENT}`}
          className="flex items-center gap-1.5 rounded-lg border border-amber-300/50 bg-amber-500/20 px-3 py-1.5 text-sm font-bold text-amber-100 hover:bg-amber-500/30 transition-all"
        >
          <CreditCard className="h-3.5 w-3.5" /> تجديد
        </BarberDashboardOutboundAnchor>
        <BarberDashboardOutboundAnchor
          href={`/#${ROUTE_PATHS.PARTNER_SUPPORT}`}
          className="flex items-center gap-1.5 rounded-lg border border-violet-300/45 bg-violet-500/20 px-3 py-1.5 text-sm font-bold text-violet-100 hover:bg-violet-500/30 transition-all"
        >
          <HeadphonesIcon className="h-3.5 w-3.5" /> دعم
        </BarberDashboardOutboundAnchor>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function DigitalShiftPrivateOffice({
  barberId,
  barberEmail,
  barberName,
  assistantName,
  listingDaysRemaining,
  bannerState,
  posts,
}: {
  barberId: string;
  barberEmail: string;
  barberName: string;
  assistantName: string;
  listingDaysRemaining: number;
  bannerState: BarberPlatformBannerState;
  posts: Post[];
}) {
  // ── Persistent state ──
  const [instructions, setInstructions] = useState<ShiftInstruction[]>(() => readShiftInstructions(barberId));
  const [tasks, setTasks] = useState<ShiftTask[]>(() => readShiftTasks(barberId));
  const [fleetDirectives, setFleetDirectives] = useState<FleetDirective[]>([]);
  const [showFleet, setShowFleet] = useState(false);
  const [shiftReports, setShiftReports] = useState<ShiftReport[]>([]);
  const [showReports, setShowReports] = useState(false);

  // ── Chat state ──
  const [turns, setTurns] = useState<ChatTurn[]>([{
    role: 'assistant',
    content: `أهلاً يا عمنا ${barberName}! 🌙\n\nأنا ${assistantName} — مناوبك الرقمي الخاص.\n\nأقدر أساعدك في:\n• حفظ تعليماتك وتنفيذها مع العملاء\n• تتبع مهامك وتذكيرك بها\n• الاطلاع على رصيد حزمتك ومتى تنتهي\n• الوصول لروابط الدفع والدعم فوراً\n\nوش تبي يا عمنا؟`,
    ts: nowTs(),
  }]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Panels ──
  const [showInstructions, setShowInstructions] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [newInstText, setNewInstText] = useState('');
  const [newTaskText, setNewTaskText] = useState('');

  const messagesRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Persist changes locally
  useEffect(() => { writeShiftInstructions(barberId, instructions); }, [barberId, instructions]);
  useEffect(() => { writeShiftTasks(barberId, tasks); }, [barberId, tasks]);

  // ◆ مزامنة التعليمات مع Supabase → تصل للمناوب على الشات
  useEffect(() => {
    const timer = setTimeout(() => {
      void syncInstructionsRemote({
        barberId,
        email: barberEmail,
        instructions: instructions.map(i => ({ id: i.id, text: i.text, active: i.active })),
      });
    }, 1500); // تأخير بسيط لتجنب الاستدعاء المتكرر عند الكتابة
    return () => clearTimeout(timer);
  }, [barberId, barberEmail, instructions]);

  // تحميل توجيهات تشغيلية من المنصة
  useEffect(() => {
    void fleetDirectivesReadRemote({ barberId, email: barberEmail }).then(r => {
      if (r.ok && r.directives.length > 0) setFleetDirectives(r.directives);
    });
  }, [barberId, barberEmail]);

  // ◆ تحميل تقارير المناوب
  useEffect(() => {
    void shiftReportsReadRemote({ barberId, email: barberEmail }).then(r => {
      if (r.ok) setShiftReports(r.reports);
    });
  }, [barberId, barberEmail]);

  useAgentChatScroll(messagesRef, [turns, loading]);
  useAgentChatInputFocus(loading, textRef);

  // ── Instructions CRUD ──
  const addInstruction = useCallback(() => {
    const text = newInstText.trim();
    if (!text) return;
    setInstructions(prev => [{ id: nid(), text, createdAt: new Date().toISOString(), active: true }, ...prev]);
    setNewInstText('');
    toast.success('تم حفظ التعليمة ✅');
  }, [newInstText]);

  const removeInstruction = useCallback((id: string) => {
    setInstructions(prev => prev.filter(i => i.id !== id));
  }, []);

  // ── Tasks CRUD ──
  const addTask = useCallback(() => {
    const text = newTaskText.trim();
    if (!text) return;
    setTasks(prev => [{ id: nid(), text, done: false, createdAt: new Date().toISOString() }, ...prev]);
    setNewTaskText('');
  }, [newTaskText]);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Send chat ──
  const send = useCallback(async (text?: string) => {
    const msg = (text ?? draft).trim();
    if (!msg || loading) return;
    setDraft('');
    if (textRef.current) { textRef.current.style.height = 'auto'; }

    // ── كشف رموز التوجيه تلقائياً ──────────────────────────────────────────────
    const SHIFT_CODES = ['تعليمة', 'عرض', 'جدول', 'خدمة', 'موقع', 'رد', 'تنبيه'];
    const TASK_CODES  = ['مهمة', 'تذكير'];
    const allCodes = [...SHIFT_CODES, ...TASK_CODES];
    const codeRegex = new RegExp(`^(${allCodes.join('|')})[:：]\\s*`);
    const codeMatch = msg.match(codeRegex);

    if (codeMatch) {
      const code = codeMatch[1];
      const text = msg.replace(codeMatch[0], '').trim();
      if (text) {
        if (TASK_CODES.includes(code)) {
          // مهمة أو تذكير → قائمة المهام
          setTasks(prev => [{ id: nid(), text: `[${code}] ${text}`, done: false, createdAt: new Date().toISOString() }, ...prev]);
          toast.success(`تمّت إضافة ${code} ✅`);
        } else {
          // كل الرموز الأخرى → تعليمات للمناوب بعلامة الفئة
          const taggedText = code === 'تعليمة' ? text : `[${code}] ${text}`;
          setInstructions(prev => [{ id: nid(), text: taggedText, createdAt: new Date().toISOString(), active: true }, ...prev]);
          toast.success(`تمّت إضافة ${code} ✅`);
        }
      }
    }

    const userTurn: ChatTurn = { role: 'user', content: msg, ts: nowTs() };
    const nextTurns = [...turns, userTurn];
    setTurns(nextTurns);
    setLoading(true);

    // لا تُرسل الرسالة الحالية داخل history — السيرفر يضيفها بعد تطبيع الأدوار
    const historyPayload = nextTurns
      .slice(0, -1)
      .slice(-10)
      .map((t) => ({ role: t.role, content: t.content }));

    const r = await digitalShiftBarberChatRemote({
      barberId,
      email: barberEmail,
      message: msg,
      history: historyPayload,
      instructions: instructions.filter(i => i.active).map(i => i.text),
      tasks: tasks.map(t => ({ text: t.text, done: t.done })),
      ...buildSalonSnapshotPayload(bannerState, posts),
    });

    setLoading(false);
    if (r.ok) {
      setTurns(p => [...p, { role: 'assistant', content: r.reply, ts: nowTs() }]);
      return;
    }

    // رمز توجيه حُفظ محلياً — أكّد للحلاق حتى لو فشل مزوّد الذكاء
    if (codeMatch) {
      const code = codeMatch[1];
      setTurns((p) => [
        ...p,
        {
          role: 'assistant',
          content: `تم يا عمنا ✅ حفظت «${code}» وسأطبّقها مع الزبائن. تبي تضيف شيء ثاني؟`,
          ts: nowTs(),
        },
      ]);
      return;
    }

    toast.error(r.error?.trim() || 'تعذّر الرد — حاول مجدداً');
  }, [draft, loading, turns, instructions, tasks, barberId, barberEmail, bannerState, posts]);

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); }
  }, [send]);

  const pendingTasks = tasks.filter(t => !t.done).length;
  const activeInstructions = instructions.filter(i => i.active).length;

  return (
    <div
      id="digital-shift-private-office"
      dir="rtl"
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: 'linear-gradient(145deg, #06000f 0%, #0d0020 50%, #080010 100%)',
        border: '1px solid rgba(139,92,246,0.25)',
        boxShadow: '0 0 80px rgba(139,92,246,0.08), 0 0 160px rgba(139,92,246,0.04), inset 0 1px 0 rgba(139,92,246,0.15)',
      }}
    >
      {/* ── خلفية توهج ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -top-20 right-1/4 h-48 w-72 rounded-full bg-violet-600/8 blur-[80px]" />
        <div className="absolute -bottom-16 left-1/4 h-40 w-64 rounded-full bg-amber-500/6 blur-[70px]" />
        <motion.div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(139,92,246,0.03) 50%, transparent 60%)' }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
        />
      </div>

      {/* ══ الرأس ══ */}
      <div className="relative border-b border-violet-500/15 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #1e0a3c, #0d0020)', border: '1.5px solid rgba(139,92,246,0.45)', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}>
              <Moon className="h-5 w-5 text-violet-300" />
              <motion.div className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#06000f]"
                animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}>
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              </motion.div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200/80">مكتب خاص · Diamond</p>
              <p className="text-lg font-black text-white [text-shadow:0_0_20px_rgba(196,181,253,0.35)]">{assistantName}</p>
              <p className="text-sm font-medium text-violet-100/85">مناوبك الرقمي الخاص — محادثة داخلية</p>
            </div>
          </div>
          {/* شارات سريعة */}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {/* زر تقارير المناوب */}
            <button onClick={() => { setShowReports(s => !s); setShowFleet(false); setShowTasks(false); setShowInstructions(false); }}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold transition-all ${
                showReports ? 'border-emerald-400/60 bg-emerald-500/25 text-emerald-100' : 'border-white/15 bg-white/[0.06] text-slate-200 hover:border-emerald-400/40'
              }`}>
              <FileText className="h-3.5 w-3.5" />
              {shiftReports.length > 0 && <span className="rounded-full bg-emerald-500 px-1.5 text-[0.65rem] font-black text-white">{shiftReports.length}</span>}
              تقارير
            </button>
            {/* ◆ زر القناة السرية */}
            {fleetDirectives.length > 0 && (
              <button onClick={() => { setShowFleet(s => !s); setShowTasks(false); setShowInstructions(false); }}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-black transition-all ${
                  showFleet ? 'border-purple-400/70 bg-purple-500/30 text-purple-50' : 'border-purple-400/40 bg-purple-500/15 text-purple-100 hover:border-purple-400/60 animate-pulse'
                }`}>
                ◆ <span className="rounded-full bg-purple-500 px-1.5 text-[0.65rem] font-black text-white">{fleetDirectives.length}</span>
              </button>
            )}
            <button onClick={() => { setShowTasks(s => !s); setShowInstructions(false); }}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold transition-all ${
                showTasks ? 'border-amber-300/60 bg-amber-500/25 text-amber-50' : 'border-white/15 bg-white/[0.06] text-slate-200 hover:border-amber-300/40'
              }`}>
              <ListTodo className="h-3.5 w-3.5" />
              {pendingTasks > 0 && <span className="rounded-full bg-amber-400 px-1.5 text-[0.65rem] font-black text-black">{pendingTasks}</span>}
              مهام
            </button>
            <button onClick={() => { setShowInstructions(s => !s); setShowTasks(false); }}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold transition-all ${
                showInstructions ? 'border-violet-300/60 bg-violet-500/25 text-violet-50' : 'border-white/15 bg-white/[0.06] text-slate-200 hover:border-violet-300/40'
              }`}>
              <BookOpen className="h-3.5 w-3.5" />
              {activeInstructions > 0 && <span className="rounded-full bg-violet-300 px-1.5 text-[0.65rem] font-black text-black">{activeInstructions}</span>}
              تعليمات
            </button>
          </div>
        </div>

        {/* شريط حالة الحزمة */}
        <div className="mt-3">
          <PackageStatusBar daysRemaining={listingDaysRemaining} />
        </div>
      </div>

      {/* ══ لوحة التعليمات ══ */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative border-b border-violet-500/12 overflow-hidden"
          >
            <div className="bg-violet-950/40 px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-base font-black text-violet-100">📋 تعليماتك المحفوظة للمناوب</p>
                <button onClick={() => setShowInstructions(false)} className="text-slate-300 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* إضافة تعليمة */}
              <div className="mb-3 flex gap-2">
                <input
                  value={newInstText}
                  onChange={e => setNewInstText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addInstruction(); }}
                  placeholder='مثال: لا تقبل مواعيد بعد الساعة 10 مساءً'
                  className="flex-1 rounded-xl border border-violet-300/35 bg-violet-950/60 px-3 py-2.5 text-sm text-white placeholder:text-violet-200/45 outline-none focus:border-violet-300/70"
                  dir="rtl"
                />
                <button onClick={addInstruction}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/30 border border-violet-300/40 text-violet-100 hover:bg-violet-500/45 transition-all">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {/* قائمة التعليمات */}
              <div className="max-h-44 space-y-2 overflow-y-auto">
                {instructions.length === 0 ? (
                  <p className="py-4 text-center text-sm text-violet-100/55">لا توجد تعليمات محفوظة بعد</p>
                ) : instructions.map(inst => (
                  <div key={inst.id} className="flex items-start gap-2 rounded-lg border border-violet-300/25 bg-violet-900/35 px-3 py-2.5">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-200" />
                    <p className="flex-1 text-sm font-medium leading-relaxed text-slate-100">{inst.text}</p>
                    <button onClick={() => removeInstruction(inst.id)}
                      className="shrink-0 text-slate-400 hover:text-red-300 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-violet-100/65">💡 يمكنك أيضاً إرسال «تعليمة: نصّ التعليمة» في المحادثة</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ لوحة تقارير المناوب (ما استقبله من الزبائن) ══ */}
      <AnimatePresence>
        {showReports && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative border-b border-emerald-500/15 overflow-hidden"
          >
            <div className="bg-emerald-950/35 px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-300" />
                  <p className="text-base font-black text-emerald-100">تقارير المناوب — ما استقبله من الزبائن</p>
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-100">مباشر</span>
                </div>
                <button onClick={() => setShowReports(false)} className="text-slate-300 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {shiftReports.length === 0 ? (
                <p className="py-6 text-center text-sm text-emerald-100/55">
                  لا تقارير بعد — المناوب لم يرد على أي زبون حتى الآن
                </p>
              ) : (
                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {shiftReports.map(r => (
                    <div key={r.id} className="rounded-xl border border-emerald-400/30 bg-emerald-950/40 px-4 py-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-sm font-black text-emerald-100">{r.title}</p>
                        <p className="shrink-0 text-xs text-emerald-200/70">{new Date(r.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100" style={{ unicodeBidi: 'plaintext' }}>{r.body}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 text-sm text-emerald-100/60">
                📡 يصلك تلقائياً كل مرة يتدخّل فيها المناوب مع زبون · التعليمات التي أعطيتها مُطبَّقة
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ توجيهات تشغيلية من المنصة ══ */}
      <AnimatePresence>
        {showFleet && fleetDirectives.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative border-b border-purple-500/20 overflow-hidden"
          >
            <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #0d0020 0%, #130030 100%)' }}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-purple-200 font-black">◆</span>
                  <p className="text-base font-black text-purple-50">توجيهات تشغيلية من المنصة</p>
                  <span className="rounded-full border border-purple-300/50 bg-purple-500/25 px-2 py-0.5 text-xs font-black text-purple-100 uppercase tracking-widest">
                    للمناوب
                  </span>
                </div>
                <button onClick={() => setShowFleet(false)} className="text-slate-300 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {fleetDirectives.map(d => (
                  <div key={d.id} className="rounded-xl border border-purple-300/35 bg-purple-950/50 px-4 py-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-black uppercase tracking-widest text-purple-100">
                        {sanitizeBarberFacingCopyAr(d.title)}
                      </p>
                      <p className="shrink-0 text-xs text-purple-200/70">{new Date(d.created_at).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <p className="text-sm leading-relaxed text-purple-50" style={{ unicodeBidi: 'plaintext' }}>
                      {sanitizeBarberFacingCopyAr(d.body)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-purple-100/65">
                ◆ صادرة من فريق تشغيل المناوب في المنصة · تُطبَّق تلقائياً على أسلوب الرد
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ لوحة المهام ══ */}
      <AnimatePresence>
        {showTasks && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative border-b border-amber-500/12 overflow-hidden"
          >
            <div className="bg-amber-950/30 px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-base font-black text-amber-100">✅ قائمة المهام</p>
                <button onClick={() => setShowTasks(false)} className="text-slate-300 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* إضافة مهمة */}
              <div className="mb-3 flex gap-2">
                <input
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addTask(); }}
                  placeholder='مثال: تجديد الحزمة قبل نهاية الشهر'
                  className="flex-1 rounded-xl border border-amber-300/35 bg-amber-950/40 px-3 py-2.5 text-sm text-white placeholder:text-amber-100/45 outline-none focus:border-amber-300/65"
                  dir="rtl"
                />
                <button onClick={addTask}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/25 border border-amber-300/40 text-amber-100 hover:bg-amber-500/40 transition-all">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {/* قائمة المهام */}
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="py-4 text-center text-sm text-amber-100/55">لا توجد مهام مسجّلة</p>
                ) : tasks.map(t => (
                  <div key={t.id} className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 transition-all ${
                    t.done ? 'border-white/10 bg-white/[0.04] opacity-60' : 'border-amber-300/25 bg-amber-950/35'
                  }`}>
                    <button onClick={() => toggleTask(t.id)} className="mt-0.5 shrink-0 text-amber-300 hover:text-emerald-300 transition-colors">
                      {t.done ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Circle className="h-4 w-4" />}
                    </button>
                    <p className={`flex-1 text-sm leading-relaxed ${t.done ? 'line-through text-slate-400' : 'font-medium text-slate-100'}`}>{t.text}</p>
                    <button onClick={() => removeTask(t.id)} className="shrink-0 text-slate-400 hover:text-red-300 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-amber-100/65">💡 يمكنك إرسال «مهمة: نصّ المهمة» في المحادثة لإضافتها تلقائياً</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ منطقة المحادثة ══ */}
      <div ref={messagesRef} className="relative" style={{ height: '420px', overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_30%_at_50%_0%,rgba(139,92,246,0.04),transparent)]" />
        <div className="relative flex flex-col gap-3 px-5 py-4">
          {turns.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${t.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* أيقونة */}
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm ${
                t.role === 'assistant'
                  ? 'bg-violet-900/60 border border-violet-500/30 text-violet-300'
                  : 'bg-amber-900/50 border border-amber-500/25 text-amber-300'
              }`}>
                {t.role === 'assistant' ? '🌙' : '✂️'}
              </div>
              {/* الفقاعة */}
              <div className={`max-w-[85%] rounded-2xl px-4 py-3.5 ${
                t.role === 'assistant'
                  ? 'rounded-tr-sm border border-violet-300/35 bg-gradient-to-br from-violet-500/25 to-violet-950/50 text-white shadow-[0_2px_20px_rgba(139,92,246,0.18)]'
                  : 'rounded-tl-sm border border-amber-300/35 bg-gradient-to-br from-amber-500/25 to-amber-950/45 text-amber-50 shadow-[0_2px_16px_rgba(245,158,11,0.12)]'
              }`}>
                <p
                  className="whitespace-pre-wrap break-words text-base font-medium leading-7 [text-shadow:0_0_12px_rgba(255,255,255,0.08)]"
                  style={{ unicodeBidi: 'plaintext' }}
                >
                  {t.content}
                </p>
                <p className="mt-1.5 text-xs font-medium opacity-70">{t.ts}</p>
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-row gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-900/60 text-sm">🌙</div>
              <div className="rounded-2xl rounded-tr-sm border border-violet-500/20 bg-violet-500/8">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ══ اقتراحات سريعة — تبقى ظاهرة بعد كل رد ══ */}
      {!loading && (
        <div className="border-t border-violet-400/20 px-5 py-3">
          <p className="mb-2 text-sm font-semibold text-violet-100/80">اختر سؤالاً أو اكتب رسالتك:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'كم يوم باقي في حزمتي؟',
              'أرسل لي رابط التجديد',
              'وين رابط الدعم؟',
              'ما هي تعليماتي الحالية؟',
              'كيف أستخدم رمز «تعليمة:»؟',
              'ما الفرق بين الباقات؟',
            ].map(q => (
              <button key={q} onClick={() => void send(q)}
                className="rounded-full border border-violet-300/35 bg-violet-500/20 px-3.5 py-1.5 text-sm font-semibold text-violet-50 hover:border-violet-200/55 hover:bg-violet-500/30 transition-all">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ حقل الإدخال ══ */}
      <div className="relative border-t border-violet-400/20 px-4 pt-3 pb-3">
        {/* ── أزرار رموز التوجيه ── */}
        <div className="mb-2.5 flex flex-wrap gap-2">
          <p className="mb-1 w-full text-sm font-semibold text-violet-100/75">رموز التوجيه — اضغط لإدراج الرمز ثم اكتب:</p>
          {CODE_BUTTONS.map(cb => (
            <button
              key={cb.code}
              type="button"
              title={cb.hint}
              onClick={() => {
                setDraft(`${cb.code}: `);
                setTimeout(() => {
                  if (textRef.current) {
                    textRef.current.focus();
                    const len = textRef.current.value.length;
                    textRef.current.setSelectionRange(len, len);
                  }
                }, 30);
              }}
              className={`rounded-lg border px-3 py-1.5 text-sm font-black transition-all hover:opacity-95 active:scale-95 ${cb.color}`}
            >
              {cb.label}
            </button>
          ))}
        </div>

        {/* ── حقل النص + زر الإرسال ── */}
        <div className="flex items-end gap-2">
          <textarea
            ref={textRef}
            value={draft}
            onChange={e => {
              setDraft(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKey}
            disabled={loading}
            placeholder='اختر رمزاً أعلاه أو اكتب مباشرةً — مثال: تعليمة: لا مواعيد بعد 10'
            rows={1}
            dir="rtl"
            style={{ minHeight: '48px', maxHeight: '120px', resize: 'none', overflowY: 'auto' }}
            className="flex-1 rounded-2xl border border-violet-300/35 bg-violet-950/70 px-4 py-3 text-base font-medium text-white placeholder:text-violet-100/45 outline-none focus:border-violet-200/60 focus:ring-2 focus:ring-violet-400/25 transition-all disabled:opacity-50"
          />
          <motion.button
            type="button"
            onClick={() => void send()}
            disabled={!draft.trim() || loading}
            whileTap={draft.trim() && !loading ? { scale: 0.88 } : undefined}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all disabled:cursor-not-allowed disabled:opacity-35"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 4px 16px rgba(139,92,246,0.35)' }}
          >
            <Send className="h-5 w-5 text-white" />
          </motion.button>
        </div>
        <p className="mt-2 text-center text-xs font-medium text-violet-100/55">
          {assistantName} · مكتبك الخاص · حلاق ماب Diamond
        </p>
      </div>
    </div>
  );
}
