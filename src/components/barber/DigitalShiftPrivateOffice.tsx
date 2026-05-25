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
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, Send, Plus, Trash2, CheckCircle2, Circle,
  Zap, CreditCard, HeadphonesIcon,
  BookOpen, ListTodo, Sparkles, X, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
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
import { ROUTE_PATHS } from '@/lib/index';

type ChatTurn = { role: 'user' | 'assistant'; content: string; ts: string };

// ─── رموز التوجيه — كل رمز يُدرج في الشات ويُعالَج تلقائياً ──────────────────
const CODE_BUTTONS = [
  { code: 'تعليمة', label: 'تعليمة:', color: 'border-violet-400/40 bg-violet-500/15 text-violet-200', hint: 'توجيه دائم للمناوب يُطبَّق مع الزبائن', affects: 'shift' },
  { code: 'عرض',    label: 'عرض:',    color: 'border-amber-400/40 bg-amber-500/15 text-amber-200',   hint: 'عرض أو تخفيض يذكره المناوب للزبائن',   affects: 'shift' },
  { code: 'جدول',   label: 'جدول:',   color: 'border-sky-400/40 bg-sky-500/15 text-sky-200',         hint: 'أوقات العمل والإجازات',                  affects: 'shift' },
  { code: 'خدمة',   label: 'خدمة:',   color: 'border-teal-400/40 bg-teal-500/15 text-teal-200',      hint: 'خدمات وأسعار يردّ بها المناوب',          affects: 'shift' },
  { code: 'موقع',   label: 'موقع:',   color: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200', hint: 'وصف الموقع والوصول للصالون',         affects: 'shift' },
  { code: 'رد',     label: 'رد:',     color: 'border-rose-400/40 bg-rose-500/15 text-rose-200',       hint: 'قالب رد لموقف محدد',                     affects: 'shift' },
  { code: 'تنبيه',  label: 'تنبيه:',  color: 'border-orange-400/40 bg-orange-500/15 text-orange-200', hint: 'تنبيه مؤقت — إغلاق أو حدث',            affects: 'shift' },
  { code: 'مهمة',   label: 'مهمة:',   color: 'border-lime-400/40 bg-lime-500/15 text-lime-200',       hint: 'مهمة تُضاف لقائمة المهام',               affects: 'tasks' },
  { code: 'تذكير',  label: 'تذكير:',  color: 'border-pink-400/40 bg-pink-500/15 text-pink-200',       hint: 'تذكير شخصي بموعد أو مهمة قادمة',        affects: 'tasks' },
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
    <div className={`flex items-center justify-between rounded-xl border px-4 py-2.5 ${color}`}>
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <div>
          <p className={`text-xs font-black ${textColor}`}>
            {daysRemaining === 0 ? 'الحزمة منتهية!' : `${daysRemaining} يوم متبقٍ`}
          </p>
          <p className="text-[0.58rem] text-slate-500">حزمة رخصة النفاذ الماسية</p>
        </div>
      </div>
      <div className="flex gap-2">
        <a
          href={`/#${ROUTE_PATHS.PAYMENT}`}
          className="flex items-center gap-1 rounded-lg border border-amber-400/35 bg-amber-500/12 px-2.5 py-1 text-[0.62rem] font-bold text-amber-300 hover:bg-amber-500/20 transition-all"
        >
          <CreditCard className="h-3 w-3" /> تجديد
        </a>
        <a
          href={`/#${ROUTE_PATHS.PARTNER_SUPPORT}`}
          className="flex items-center gap-1 rounded-lg border border-violet-400/25 bg-violet-500/10 px-2.5 py-1 text-[0.62rem] font-bold text-violet-300 hover:bg-violet-500/18 transition-all"
        >
          <HeadphonesIcon className="h-3 w-3" /> دعم
        </a>
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
}: {
  barberId: string;
  barberEmail: string;
  barberName: string;
  assistantName: string;
  listingDaysRemaining: number;
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

  const endRef = useRef<HTMLDivElement>(null);
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

  // ◆ القناة السرية — تحميل توجيهات الأسطول
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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, loading]);

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

    const r = await digitalShiftBarberChatRemote({
      barberId,
      email: barberEmail,
      message: msg,
      history: nextTurns.slice(-10).map(t => ({ role: t.role, content: t.content })),
      instructions: instructions.filter(i => i.active).map(i => i.text),
      tasks: tasks.map(t => ({ text: t.text, done: t.done })),
    });

    setLoading(false);
    if (r.ok) {
      setTurns(p => [...p, { role: 'assistant', content: r.reply, ts: nowTs() }]);
    } else {
      toast.error('تعذّر الرد — حاول مجدداً');
    }
  }, [draft, loading, turns, instructions, tasks, barberId, barberEmail]);

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); }
  }, [send]);

  const pendingTasks = tasks.filter(t => !t.done).length;
  const activeInstructions = instructions.filter(i => i.active).length;

  return (
    <div
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
              <p className="text-[0.6rem] font-bold uppercase tracking-widest text-violet-400/60">مكتب خاص · Diamond</p>
              <p className="text-sm font-black text-violet-100">{assistantName}</p>
              <p className="text-[0.55rem] text-violet-400/45">مناوبك الرقمي الخاص — محادثة داخلية</p>
            </div>
          </div>
          {/* شارات سريعة */}
          <div className="flex items-center gap-2">
            {/* زر تقارير المناوب */}
            <button onClick={() => { setShowReports(s => !s); setShowFleet(false); setShowTasks(false); setShowInstructions(false); }}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[0.6rem] font-bold transition-all ${
                showReports ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300' : 'border-white/8 bg-white/[0.03] text-slate-400 hover:border-emerald-500/30'
              }`}>
              <FileText className="h-3 w-3" />
              {shiftReports.length > 0 && <span className="rounded-full bg-emerald-500 px-1 text-[0.5rem] font-black text-white">{shiftReports.length}</span>}
              تقارير
            </button>
            {/* ◆ زر القناة السرية */}
            {fleetDirectives.length > 0 && (
              <button onClick={() => { setShowFleet(s => !s); setShowTasks(false); setShowInstructions(false); }}
                className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[0.6rem] font-black transition-all ${
                  showFleet ? 'border-purple-500/60 bg-purple-500/20 text-purple-200' : 'border-purple-500/30 bg-purple-500/8 text-purple-400 hover:border-purple-500/50 animate-pulse'
                }`}>
                ◆ <span className="rounded-full bg-purple-500 px-1 text-[0.5rem] font-black text-white">{fleetDirectives.length}</span>
              </button>
            )}
            <button onClick={() => { setShowTasks(s => !s); setShowInstructions(false); }}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[0.6rem] font-bold transition-all ${
                showTasks ? 'border-amber-400/50 bg-amber-500/15 text-amber-300' : 'border-white/8 bg-white/[0.03] text-slate-400 hover:border-amber-400/30'
              }`}>
              <ListTodo className="h-3 w-3" />
              {pendingTasks > 0 && <span className="rounded-full bg-amber-400 px-1 text-[0.5rem] font-black text-black">{pendingTasks}</span>}
              مهام
            </button>
            <button onClick={() => { setShowInstructions(s => !s); setShowTasks(false); }}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[0.6rem] font-bold transition-all ${
                showInstructions ? 'border-violet-400/50 bg-violet-500/15 text-violet-300' : 'border-white/8 bg-white/[0.03] text-slate-400 hover:border-violet-400/30'
              }`}>
              <BookOpen className="h-3 w-3" />
              {activeInstructions > 0 && <span className="rounded-full bg-violet-400 px-1 text-[0.5rem] font-black text-black">{activeInstructions}</span>}
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
            <div className="bg-violet-950/30 px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-black text-violet-300">📋 تعليماتك المحفوظة للمناوب</p>
                <button onClick={() => setShowInstructions(false)} className="text-slate-600 hover:text-slate-400">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {/* إضافة تعليمة */}
              <div className="mb-3 flex gap-2">
                <input
                  value={newInstText}
                  onChange={e => setNewInstText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addInstruction(); }}
                  placeholder='مثال: لا تقبل مواعيد بعد الساعة 10 مساءً'
                  className="flex-1 rounded-xl border border-violet-400/20 bg-violet-950/40 px-3 py-2 text-xs text-white placeholder:text-violet-400/30 outline-none focus:border-violet-400/50"
                  dir="rtl"
                />
                <button onClick={addInstruction}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-400/30 text-violet-300 hover:bg-violet-500/35 transition-all">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {/* قائمة التعليمات */}
              <div className="max-h-40 space-y-1.5 overflow-y-auto">
                {instructions.length === 0 ? (
                  <p className="py-4 text-center text-[0.65rem] text-violet-400/30">لا توجد تعليمات محفوظة بعد</p>
                ) : instructions.map(inst => (
                  <div key={inst.id} className="flex items-start gap-2 rounded-lg border border-violet-400/12 bg-violet-900/20 px-3 py-2">
                    <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-violet-400/60" />
                    <p className="flex-1 text-[0.72rem] text-slate-300 leading-relaxed">{inst.text}</p>
                    <button onClick={() => removeInstruction(inst.id)}
                      className="shrink-0 text-slate-700 hover:text-red-400 transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[0.55rem] text-violet-400/30">💡 يمكنك أيضاً إرسال «تعليمة: نصّ التعليمة» في المحادثة</p>
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
            <div className="bg-emerald-950/25 px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-emerald-400" />
                  <p className="text-xs font-black text-emerald-300">تقارير المناوب — ما استقبله من الزبائن</p>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[0.5rem] text-emerald-400">مباشر</span>
                </div>
                <button onClick={() => setShowReports(false)} className="text-slate-600 hover:text-slate-400">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {shiftReports.length === 0 ? (
                <p className="py-6 text-center text-[0.65rem] text-emerald-400/30">
                  لا تقارير بعد — المناوب لم يرد على أي زبون حتى الآن
                </p>
              ) : (
                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {shiftReports.map(r => (
                    <div key={r.id} className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 px-4 py-3">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-[0.65rem] font-black text-emerald-300">{r.title}</p>
                        <p className="text-[0.5rem] text-emerald-500/40">{new Date(r.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <p className="whitespace-pre-wrap text-[0.65rem] leading-relaxed text-slate-300" style={{ unicodeBidi: 'plaintext' }}>{r.body}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 text-[0.52rem] text-emerald-400/25">
                📡 يصلك تلقائياً كل مرة يتدخّل فيها المناوب مع زبون · التعليمات التي أعطيتها مُطبَّقة
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ لوحة القناة السرية — توجيهات الأسطول ══ */}
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
                  <span className="text-purple-400 font-black">◆</span>
                  <p className="text-xs font-black text-purple-300">قناة سرية — توجيهات قيادة الأسطول</p>
                  <span className="rounded-full border border-purple-500/40 bg-purple-500/15 px-2 py-0.5 text-[0.5rem] font-black text-purple-300 uppercase tracking-widest">
                    مُشفَّرة
                  </span>
                </div>
                <button onClick={() => setShowFleet(false)} className="text-slate-600 hover:text-slate-400">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {fleetDirectives.map(d => (
                  <div key={d.id} className="rounded-xl border border-purple-500/25 bg-purple-950/40 px-4 py-3">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-[0.6rem] font-black uppercase tracking-widest text-purple-400/70">{d.title}</p>
                      <p className="text-[0.5rem] text-purple-500/40">{new Date(d.created_at).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <p className="text-[0.72rem] leading-relaxed text-purple-100/90" style={{ unicodeBidi: 'plaintext' }}>{d.body}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[0.55rem] text-purple-500/35">
                ◆ صادرة من المدير العام للمناوبين · قيادة الأسطول السرية · مُطبَّقة تلقائياً
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
            <div className="bg-amber-950/20 px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-black text-amber-300">✅ قائمة المهام</p>
                <button onClick={() => setShowTasks(false)} className="text-slate-600 hover:text-slate-400">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {/* إضافة مهمة */}
              <div className="mb-3 flex gap-2">
                <input
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addTask(); }}
                  placeholder='مثال: تجديد الحزمة قبل نهاية الشهر'
                  className="flex-1 rounded-xl border border-amber-400/20 bg-amber-950/30 px-3 py-2 text-xs text-white placeholder:text-amber-400/30 outline-none focus:border-amber-400/45"
                  dir="rtl"
                />
                <button onClick={addTask}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-400/25 text-amber-300 hover:bg-amber-500/28 transition-all">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {/* قائمة المهام */}
              <div className="max-h-44 space-y-1.5 overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="py-4 text-center text-[0.65rem] text-amber-400/30">لا توجد مهام مسجّلة</p>
                ) : tasks.map(t => (
                  <div key={t.id} className={`flex items-start gap-2 rounded-lg border px-3 py-2 transition-all ${
                    t.done ? 'border-white/5 bg-white/[0.02] opacity-50' : 'border-amber-400/15 bg-amber-950/25'
                  }`}>
                    <button onClick={() => toggleTask(t.id)} className="mt-0.5 shrink-0 text-amber-400 hover:text-emerald-400 transition-colors">
                      {t.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Circle className="h-3.5 w-3.5" />}
                    </button>
                    <p className={`flex-1 text-[0.72rem] leading-relaxed ${t.done ? 'line-through text-slate-600' : 'text-slate-300'}`}>{t.text}</p>
                    <button onClick={() => removeTask(t.id)} className="shrink-0 text-slate-700 hover:text-red-400 transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[0.55rem] text-amber-400/30">💡 يمكنك إرسال «مهمة: نصّ المهمة» في المحادثة لإضافتها تلقائياً</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ منطقة المحادثة ══ */}
      <div className="relative" style={{ height: '380px', overflowY: 'auto', overscrollBehavior: 'contain' }}>
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
              <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                t.role === 'assistant'
                  ? 'rounded-tr-sm border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-violet-900/8 text-violet-50 shadow-[0_2px_16px_rgba(139,92,246,0.08)]'
                  : 'rounded-tl-sm border border-amber-500/18 bg-gradient-to-br from-amber-500/10 to-amber-900/8 text-amber-50'
              }`}>
                <p className="whitespace-pre-wrap break-words text-[0.82rem] leading-6" style={{ unicodeBidi: 'plaintext' }}>
                  {t.content}
                </p>
                <p className="mt-1 text-[0.5rem] opacity-35">{t.ts}</p>
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
          <div ref={endRef} className="h-1" />
        </div>
      </div>

      {/* ══ اقتراحات سريعة — تبقى ظاهرة بعد كل رد ══ */}
      {!loading && (
        <div className="border-t border-violet-500/10 px-5 py-3">
          <p className="mb-2 text-[0.58rem] text-violet-400/40">اختر سؤالاً أو اكتب رسالتك:</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              'كم يوم باقي في حزمتي؟',
              'أرسل لي رابط التجديد',
              'وين رابط الدعم؟',
              'ما هي تعليماتي الحالية؟',
              'كيف أستخدم رمز «تعليمة:»؟',
              'ما الفرق بين الباقات؟',
            ].map(q => (
              <button key={q} onClick={() => void send(q)}
                className="rounded-full border border-violet-400/20 bg-violet-500/8 px-3 py-1 text-[0.62rem] font-semibold text-violet-300/80 hover:border-violet-400/40 hover:bg-violet-500/15 transition-all">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ حقل الإدخال ══ */}
      <div className="relative border-t border-violet-500/15 px-4 pt-2.5 pb-3">
        {/* ── أزرار رموز التوجيه ── */}
        <div className="mb-2 flex flex-wrap gap-1.5">
          <p className="w-full text-[0.5rem] text-violet-400/30 mb-0.5">رموز التوجيه — اضغط لإدراج الرمز ثم اكتب:</p>
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
              className={`rounded-lg border px-2.5 py-1 text-[0.6rem] font-black transition-all hover:opacity-90 active:scale-95 ${cb.color}`}
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
            style={{ minHeight: '44px', maxHeight: '120px', resize: 'none', overflowY: 'auto' }}
            className="flex-1 rounded-2xl border border-violet-400/18 bg-violet-950/50 px-4 py-2.5 text-sm text-white placeholder:text-violet-400/22 outline-none focus:border-violet-400/45 focus:ring-1 focus:ring-violet-400/20 transition-all disabled:opacity-50"
          />
          <motion.button
            type="button"
            onClick={() => void send()}
            disabled={!draft.trim() || loading}
            whileTap={draft.trim() && !loading ? { scale: 0.88 } : undefined}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all disabled:cursor-not-allowed disabled:opacity-35"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 4px 16px rgba(139,92,246,0.35)' }}
          >
            <Send className="h-4 w-4 text-white" />
          </motion.button>
        </div>
        <p className="mt-1.5 text-center text-[0.5rem] text-violet-400/15">
          {assistantName} · مكتبك الخاص · حلاق ماب Diamond
        </p>
      </div>
    </div>
  );
}
