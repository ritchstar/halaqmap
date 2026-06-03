/**
 * PrivateOfficeSimPreview — محاكاة تفاعلية للمكتب الخاص
 *
 * تُظهر الدورة الكاملة:
 *  1. أزرار الرموز الملوّنة
 *  2. الضغط على الزر → يُدرج الرمز في الشات
 *  3. الحلاق يكمل النص ويرسل
 *  4. المساعد يُأكّد الحفظ
 *  5. زبون يتواصل ليلاً → المناوب يطبّق التعليمة
 *  6. تقرير يصل للمكتب
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { RotateCcw, Send, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── فازات المحاكاة ─────────────────────────────────────────────────────────
type Phase =
  | 'idle'
  | 'highlight_btn'   // وميض الزر «عرض:»
  | 'code_inserted'   // الرمز يظهر في الحقل
  | 'typing_text'     // الحلاق يكتب بعد الرمز
  | 'barber_sent'     // الرسالة ترسَل
  | 'assistant_ack'   // المساعد يُأكّد
  | 'shift_scene'     // مشهد الزبون + المناوب
  | 'report_arrives'  // تقرير يصل
  | 'done';

const DELAYS: Record<Phase, number> = {
  idle: 0, highlight_btn: 800, code_inserted: 600,
  typing_text: 60, barber_sent: 700, assistant_ack: 1000,
  shift_scene: 1800, report_arrives: 1600, done: 0,
};

const CODE_BUTTONS = [
  { code: 'تعليمة', label: 'تعليمة:', color: 'border-violet-200 bg-violet-50 text-violet-800' },
  { code: 'عرض',    label: 'عرض:',    color: 'border-amber-200 bg-amber-50 text-amber-800' },
  { code: 'جدول',   label: 'جدول:',   color: 'border-sky-200 bg-sky-50 text-sky-800' },
  { code: 'خدمة',   label: 'خدمة:',   color: 'border-teal-200 bg-teal-50 text-teal-800' },
  { code: 'موقع',   label: 'موقع:',   color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  { code: 'رد',     label: 'رد:',     color: 'border-rose-200 bg-rose-50 text-rose-800' },
  { code: 'تنبيه',  label: 'تنبيه:',  color: 'border-orange-200 bg-orange-50 text-orange-800' },
  { code: 'مهمة',   label: 'مهمة:',   color: 'border-lime-200 bg-lime-50 text-lime-800' },
  { code: 'تذكير',  label: 'تذكير:',  color: 'border-pink-200 bg-pink-50 text-pink-800' },
] as const;

const DEMO_CODE = 'عرض';
const DEMO_TEXT = 'قصة + لحية بـ40 ريال هذا الأسبوع';
const FULL_MSG  = `${DEMO_CODE}: ${DEMO_TEXT}`;
const ACK_MSG   = '✅ تمّت إضافة العرض — المناوب سيذكره للزبائن تلقائياً بشكل طبيعي في المحادثة';
const CUSTOMER_MSG = 'في عندكم عروض هالأسبوع؟';
const SHIFT_REPLY  = '🌟 أهلاً وسهلاً! نعم، عندنا عرض هذا الأسبوع: قصة + لحية بـ40 ريال فقط. شرفونا متى شئتم!';
const REPORT_MSG   = '🌙 المناوب رد أثناء الإغلاق\nالزبون: «في عندكم عروض؟»\nالمناوب: «قصة + لحية بـ40 ريال…»\nالتعليمات المطبّقة: ١ تعليمة';

// ── Typing dots ───────────────────────────────────────────────────────────────
function Dots() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1">
      {[0,1,2].map(i => (
        <motion.span key={i} className="inline-block h-1 w-1 rounded-full bg-current"
          animate={{ opacity:[0.3,1,0.3], scale:[0.7,1.2,0.7] }}
          transition={{ duration:0.9, delay:i*0.15, repeat:Infinity }} />
      ))}
    </span>
  );
}

export function PrivateOfficeSimPreview() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('idle');
  const [typedLen, setTypedLen] = useState(0);   // للكتابة التدريجية في حقل الإدخال
  const [ackLen, setAckLen]     = useState(0);   // للتأكيد
  const [shiftLen, setShiftLen] = useState(0);   // لرد المناوب
  const runIdRef = useRef(0);

  const advance = useCallback((next: Phase, delay: number, fn?: () => void) => {
    const id = runIdRef.current;
    window.setTimeout(() => {
      if (runIdRef.current !== id) return;
      fn?.();
      setPhase(next);
    }, delay);
  }, []);

  const runSim = useCallback(() => {
    runIdRef.current++;
    setPhase('idle');
    setTypedLen(0); setAckLen(0); setShiftLen(0);

    let t = 400;
    const step = (next: Phase, extra = 0, fn?: () => void) => {
      t += extra;
      advance(next, t, fn);
      t += DELAYS[next] || 0;
    };

    step('highlight_btn', 0);
    step('code_inserted', DELAYS.highlight_btn);
    step('typing_text', DELAYS.code_inserted);
    step('barber_sent', DEMO_TEXT.length * DELAYS.typing_text + 300);
    step('assistant_ack', DELAYS.barber_sent);
    step('shift_scene', DELAYS.assistant_ack + ACK_MSG.length * 25);
    step('report_arrives', DELAYS.shift_scene + SHIFT_REPLY.length * 22 + 400);
    step('done', DELAYS.report_arrives + 500);
  }, [advance]);

  // كتابة تدريجية في حقل الإدخال
  useEffect(() => {
    if (phase !== 'typing_text') return;
    if (reduceMotion) { setTypedLen(DEMO_TEXT.length); setPhase('barber_sent'); return; }
    if (typedLen >= DEMO_TEXT.length) return;
    const id = window.setTimeout(() => setTypedLen(n => n + 1), DELAYS.typing_text);
    return () => window.clearTimeout(id);
  }, [phase, typedLen, reduceMotion]);

  // كتابة تأكيد المساعد
  useEffect(() => {
    if (phase !== 'assistant_ack') return;
    if (reduceMotion) { setAckLen(ACK_MSG.length); return; }
    if (ackLen >= ACK_MSG.length) return;
    const id = window.setTimeout(() => setAckLen(n => n + 1), 25);
    return () => window.clearTimeout(id);
  }, [phase, ackLen, reduceMotion]);

  // كتابة رد المناوب
  useEffect(() => {
    if (phase !== 'shift_scene' && phase !== 'report_arrives' && phase !== 'done') return;
    if (shiftLen >= SHIFT_REPLY.length) return;
    const id = window.setTimeout(() => setShiftLen(n => n + 1), 22);
    return () => window.clearTimeout(id);
  }, [phase, shiftLen]);

  useEffect(() => {
    const id = window.setTimeout(runSim, 700);
    return () => { runIdRef.current++; window.clearTimeout(id); };
  }, [runSim]);

  const codeInserted = ['code_inserted','typing_text','barber_sent','assistant_ack','shift_scene','report_arrives','done'].includes(phase);
  const msgSent      = ['barber_sent','assistant_ack','shift_scene','report_arrives','done'].includes(phase);
  const showAck      = ['assistant_ack','shift_scene','report_arrives','done'].includes(phase);
  const showShift    = ['shift_scene','report_arrives','done'].includes(phase);
  const showReport   = ['report_arrives','done'].includes(phase);

  const inputText = codeInserted
    ? `${DEMO_CODE}: ${phase === 'typing_text' ? DEMO_TEXT.slice(0, typedLen) : (msgSent ? DEMO_TEXT : DEMO_TEXT.slice(0, typedLen))}`
    : (phase === 'highlight_btn' ? '' : '');

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      dir="rtl"
      className="feature-preview-glass relative w-full overflow-hidden rounded-[1.6rem] border border-violet-200/80 p-4"
      style={{ boxShadow: '0 22px 54px rgba(148,163,184,0.16)' }}
    >
      {/* ─ رأس ─ */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🏛️</span>
          <span className="text-[0.65rem] font-bold text-violet-700">محاكاة · المكتب الخاص</span>
        </div>
        <Button type="button" variant="ghost" size="sm"
          className="h-7 gap-1 border border-slate-200 bg-white/80 text-[0.6rem] text-slate-700 hover:bg-white"
          onClick={runSim}>
          <RotateCcw className="h-3 w-3" /> إعادة التشغيل
        </Button>
      </div>

      {/* ─ المكتب الخاص (القسم الأيسر في الشاشة الحقيقية) ─ */}
      <div className="mb-4 overflow-hidden rounded-[1.3rem] border border-violet-200 bg-white/92 shadow-[0_18px_40px_rgba(148,163,184,0.10)]">
        {/* هيدر المكتب */}
        <div className="flex items-center gap-2 border-b border-violet-100 px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-sm">🌙</div>
          <div>
            <p className="text-[0.58rem] font-black text-violet-900">المناوب الرقمي</p>
            <p className="text-[0.48rem] text-violet-600">مكتبك الخاص · محادثة داخلية</p>
          </div>
          <div className="mr-auto flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-1.5 py-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[0.45rem] text-emerald-700">متصل</span>
          </div>
        </div>

        {/* منطقة المحادثة */}
        <div className="min-h-[130px] space-y-2 px-3 py-3">
          {/* رسالة الحلاق */}
          <AnimatePresence>
            {msgSent && (
              <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                className="flex flex-row-reverse gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-[0.6rem]">✂️</div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-amber-200 bg-amber-50 px-3 py-2">
                  <p className="text-[0.68rem] font-bold text-amber-900">{FULL_MSG}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* تأكيد المساعد */}
          <AnimatePresence>
            {showAck && (
              <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                className="flex gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-[0.6rem]">🏛️</div>
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-violet-200 bg-violet-50 px-3 py-2">
                  <p className="text-[0.65rem] text-violet-900">{ACK_MSG.slice(0, ackLen)}{ackLen < ACK_MSG.length && <span className="mr-0.5 inline-block h-3 w-0.5 animate-pulse align-middle bg-violet-400" />}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* حالة المعالجة */}
          {phase === 'highlight_btn' && (
            <p className="py-4 text-center text-[0.6rem] text-violet-500">اضغط «عرض:» لإرسال عرضك للمناوب…</p>
          )}
          {phase === 'idle' && (
            <p className="py-4 text-center text-[0.6rem] text-violet-500">اكتب أمراً أو سؤالاً أو اضغط أحد رموز التوجيه</p>
          )}
        </div>

        {/* أزرار الرموز */}
        <div className="border-t border-violet-100 px-3 pb-1 pt-2">
          <p className="mb-1.5 text-[0.45rem] text-violet-500">رموز التوجيه:</p>
          <div className="flex flex-wrap gap-1">
            {CODE_BUTTONS.map(cb => (
              <motion.div key={cb.code}
                animate={phase === 'highlight_btn' && cb.code === DEMO_CODE
                  ? { scale:[1,1.12,1], boxShadow:['0 0 0px transparent','0 0 12px rgba(251,191,36,0.5)','0 0 0px transparent'] }
                  : {}}
                transition={{ duration:0.5, repeat: phase === 'highlight_btn' && cb.code === DEMO_CODE ? 1 : 0 }}
                className={`rounded-lg border px-2 py-0.5 text-[0.55rem] font-black transition-all ${cb.color} ${
                  phase === 'highlight_btn' && cb.code === DEMO_CODE ? 'ring-1 ring-amber-400/60' : ''
                }`}>
                {cb.label}
              </motion.div>
            ))}
          </div>
        </div>

        {/* حقل الإدخال */}
        <div className="px-3 pb-3 pt-2">
          <div className="flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 shadow-sm">
            <p className="min-h-[1.2rem] flex-1 font-mono text-[0.68rem] text-slate-900">
              {codeInserted && !msgSent ? (
                <>
                  <span className="text-amber-300 font-black">{DEMO_CODE}:</span>
                  <span> {DEMO_TEXT.slice(0, typedLen)}</span>
                  {phase === 'typing_text' && <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse align-middle bg-slate-900" />}
                </>
              ) : msgSent ? (
                <span className="text-violet-400">اكتب أمراً أو رمزاً…</span>
              ) : (
                <span className="text-violet-400">اختر رمزاً أو اكتب…</span>
              )}
            </p>
            <motion.div animate={phase === 'barber_sent' ? { scale:[1,0.85,1] } : {}}
              className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-600">
              <Send className="h-3 w-3 text-white" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─ تأثير المناوب على الشات (ما يراه الزبون) ─ */}
      <AnimatePresence>
        {showShift && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            className="mb-4 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/85">
            <div className="border-b border-emerald-100 px-3 py-1.5">
              <p className="text-[0.55rem] font-bold text-emerald-700">📱 شات الزبون — المناوب طبّق العرض</p>
            </div>
            <div className="space-y-2 px-3 py-2.5">
              {/* رسالة الزبون */}
              <div className="flex flex-row-reverse gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[0.5rem]">👤</div>
                <div className="rounded-2xl rounded-tl-sm bg-white px-3 py-1.5 shadow-sm">
                  <p className="text-[0.65rem] text-slate-700">{CUSTOMER_MSG}</p>
                </div>
              </div>
              {/* رد المناوب */}
              <div className="flex gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-[0.5rem]">🌙</div>
                <div className="rounded-2xl rounded-tr-sm border border-emerald-200 bg-white px-3 py-1.5">
                  <p className="text-[0.65rem] leading-relaxed text-emerald-900">
                    {SHIFT_REPLY.slice(0, shiftLen)}
                    {shiftLen < SHIFT_REPLY.length && <span className="inline-block w-0.5 h-3 bg-emerald-300 animate-pulse mr-0.5 align-middle" />}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─ تقرير يصل للمكتب ─ */}
      <AnimatePresence>
        {showReport && (
          <motion.div initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }}
            className="overflow-hidden rounded-2xl border border-violet-200 bg-violet-50/90">
            <div className="flex items-center gap-2 px-3 py-2">
              <FileText className="h-3 w-3 text-emerald-400" />
              <p className="text-[0.58rem] font-black text-emerald-700">📡 تقرير وصل للمكتب الخاص</p>
              <motion.span animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1.5, repeat:Infinity }}
                className="mr-auto rounded-full border border-emerald-200 bg-white/92 px-1.5 py-0.5 text-[0.45rem] font-black text-emerald-700 shadow-[0_6px_12px_rgba(16,185,129,0.08)]">جديد</motion.span>
            </div>
            <div className="border-t border-violet-100 px-3 py-2.5">
              <p className="whitespace-pre-line text-[0.62rem] leading-relaxed text-slate-700">{REPORT_MSG}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─ شريط المراحل ─ */}
      <div className="mt-3 flex items-center gap-1">
        {(['highlight_btn','barber_sent','assistant_ack','shift_scene','report_arrives'] as Phase[]).map((p, i) => {
          const phases: Phase[] = ['idle','highlight_btn','code_inserted','typing_text','barber_sent','assistant_ack','shift_scene','report_arrives','done'];
          const cur = phases.indexOf(phase);
          const tgt = phases.indexOf(p);
          const done_ = cur > tgt;
          const active = cur === tgt;
          return (
            <div key={p} className="flex-1">
              <div className={`h-0.5 rounded-full transition-all duration-500 ${done_ || active ? 'bg-violet-500' : 'bg-violet-500/15'}`} />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[0.45rem] text-violet-500">
        <span>الضغط</span><span>الإرسال</span><span>التأكيد</span><span>المناوب</span><span>التقرير</span>
      </div>
    </motion.div>
  );
}
