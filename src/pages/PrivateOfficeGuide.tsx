/**
 * PrivateOfficeGuide — دليل إضافة المكتب الخاص
 * Route: /partners/private-office-guide
 *
 * يُرسَل مع إيصال اشتراك الماسي
 * شرح مفصّل بالأمثلة — التركيز على "تعليمة:" كرمز توجيه
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Copy, CheckCircle2, Moon, BookOpen, ArrowLeft,
  MessageSquare, FileText, CreditCard, HeadphonesIcon,
  Zap, ListTodo, AlertTriangle,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';

// ─── نسخ النص ─────────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className="flex items-center gap-1.5 rounded-lg border border-violet-400/25 bg-violet-500/10 px-2.5 py-1 text-[0.62rem] font-bold text-violet-300 hover:bg-violet-500/20 transition-all shrink-0">
      {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? 'نُسخ' : 'نسخ'}
    </button>
  );
}

// ─── بطاقة مثال تعليمة ────────────────────────────────────────────────────────
function InstructionExample({
  code, effect, trigger, color = 'violet',
}: { code: string; effect: string; trigger?: string; color?: 'violet' | 'amber' | 'emerald' }) {
  const border = color === 'amber' ? 'border-amber-400/25 bg-amber-950/25' : color === 'emerald' ? 'border-emerald-400/25 bg-emerald-950/25' : 'border-violet-400/25 bg-violet-950/25';
  const badge = color === 'amber' ? 'bg-amber-500/15 text-amber-300 border-amber-400/30' : color === 'emerald' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' : 'bg-violet-500/15 text-violet-300 border-violet-400/30';
  return (
    <div className={`rounded-2xl border p-4 ${border}`}>
      {/* رمز التوجيه */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="mb-1 text-[0.55rem] font-bold uppercase tracking-widest text-slate-500">رمز التوجيه — اكتبه في المكتب الخاص</p>
          <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono">
            <span className={`mt-0.5 rounded-md border px-2 py-0.5 text-[0.62rem] font-black ${badge}`}>تعليمة:</span>
            <span className="text-sm text-white leading-relaxed">{code.replace('تعليمة: ', '')}</span>
          </div>
        </div>
        <CopyBtn text={code} />
      </div>
      {/* التأثير على المناوب */}
      <div className="rounded-xl border border-white/5 bg-black/20 px-3 py-2.5">
        <p className="mb-0.5 text-[0.52rem] font-bold text-slate-500">ماذا سيفعل المناوب مع الزبائن؟</p>
        <p className="text-[0.72rem] leading-relaxed text-slate-300" style={{ unicodeBidi: 'plaintext' }}>{effect}</p>
      </div>
      {trigger && (
        <p className="mt-2 text-[0.58rem] text-slate-600 italic">{trigger}</p>
      )}
    </div>
  );
}

// ─── الصفحة الرئيسية ───────────────────────────────────────────────────────────
export default function PrivateOfficeGuide() {
  const navigate = useNavigate();

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: 'linear-gradient(160deg,#03000a 0%,#080018 40%,#060010 100%)' }}>

      {/* شريط العودة */}
      <div className="sticky top-0 z-40 border-b border-violet-500/15 bg-[#03000a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-violet-400/70 hover:text-violet-300 transition-colors">
            <ArrowLeft className="h-4 w-4 rotate-180" /> العودة
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🏛️</span>
            <span className="text-sm font-black text-violet-100">دليل إضافة المكتب الخاص</span>
          </div>
          <button onClick={() => navigate(ROUTE_PATHS.BARBER_LOGIN)}
            className="rounded-xl bg-gradient-to-l from-violet-600 to-violet-800 px-4 py-1.5 text-xs font-black text-white hover:from-violet-500 transition-all">
            دخول لوحة التحكم
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-14 px-5 py-12">

        {/* ══ بطاقة الترحيب ══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-3xl border border-violet-500/25 text-center"
          style={{ background: 'linear-gradient(145deg,#0a0018,#0d0025)', boxShadow: '0 0 60px rgba(139,92,246,0.08)' }}>
          <div className="border-b border-violet-500/15 px-8 py-8">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-violet-400/35"
              style={{ background: 'linear-gradient(135deg,#1e0a3c,#0a0018)', boxShadow: '0 0 30px rgba(139,92,246,0.25)' }}>
              <span className="text-3xl">🏛️</span>
            </div>
            <h1 className="mb-2 text-2xl font-black text-white md:text-3xl">إضافة المكتب الخاص</h1>
            <p className="text-violet-300/80">مساعد داخلي في لوحتك · مناوب على الشات للزبائن</p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-400">
              هذا الدليل يشرح لك كيف تتحكم في مناوبك بدقة عبر
              <strong className="text-violet-300"> رموز التوجيه </strong>
              التي تكتبها في المكتب الخاص — فيُنفّذها المناوب مع كل زبون تلقائياً.
            </p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-x-reverse divide-violet-500/10 px-0 py-5">
            {[
              { icon: '📋', label: 'تعليمات دائمة', desc: 'تكتبها مرة → تُطبَّق دائماً' },
              { icon: '🌙', label: 'مناوب ذكي', desc: 'يرد بذكاء بـ7 لغات' },
              { icon: '📡', label: 'تقارير لحظية', desc: 'كل محادثة تصلك فوراً' },
            ].map(s => (
              <div key={s.label} className="px-4 text-center">
                <div className="text-xl">{s.icon}</div>
                <div className="text-[0.65rem] font-black text-violet-200">{s.label}</div>
                <div className="text-[0.55rem] text-slate-500">{s.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ══ القسم الأول: رمز التوجيه ══ */}
        <section>
          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-300">
              <Zap className="h-3 w-3" /> القاعدة الأساسية
            </div>
            <h2 className="text-xl font-black text-white md:text-2xl">«تعليمة:» — رمز التوجيه الذي يباشر المناوب</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              كل ما تكتبه مسبوقاً بـ<strong className="text-violet-300">«تعليمة:»</strong> في المكتب الخاص
              يُحفظ فوراً ويُرسَل للمناوب الذي يردّ على زبائنك.
              المناوب يُطبّقها مع كل زبون — بسرية تامة دون أن يعرف الزبون مصدرها.
            </p>
          </div>

          {/* الصيغة الأساسية */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-amber-400/30 bg-amber-950/20 p-5">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-amber-400/60">الصيغة الصحيحة</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-amber-400/40 bg-amber-500/15 px-5 py-3 font-mono text-xl font-black text-amber-300">تعليمة:</div>
              <div className="text-slate-400">+</div>
              <div className="rounded-xl border border-white/10 bg-black/30 px-5 py-3 font-mono text-xl text-white">التوجيه الذي تريده</div>
            </div>
            <p className="mt-3 text-[0.65rem] text-amber-400/50">
              ⚠️ الصيغة الصحيحة: «تعليمة:» بالعربية + نقطتان + مسافة + النص. أي صيغة أخرى لن تُحفظ كتوجيه.
            </p>
          </div>

          {/* أمثلة شاملة */}
          <div className="space-y-4">
            <h3 className="font-black text-violet-200">أمثلة عملية على رموز التوجيه</h3>

            <InstructionExample color="violet"
              code="تعليمة: لا تقبل مواعيد بعد الساعة 10 مساءً"
              effect="عندما يطلب الزبون موعداً في وقت متأخر، يرد المناوب: «عذراً يا طويل العمر، الحجوزات متوقفة بعد الساعة العاشرة — كيف نبكّر لك موعداً للغد؟»"
              trigger="مثالية لضبط أوقات العمل وتقليل الاتصالات في الوقت الخطأ"
            />

            <InstructionExample color="amber"
              code="تعليمة: عندنا عرض هذا الأسبوع — قصة + لحية بـ40 ريال فقط"
              effect="في كل محادثة مع زبون، يذكر المناوب العرض بشكل طبيعي: «بالمناسبة، عندنا عرض الأسبوع: قصة + لحية بـ40 ريال — فرصة تستاهل!»"
              trigger="غيّرها كل أسبوع لتحديث العروض — المناوب يسوّق عنك"
            />

            <InstructionExample color="emerald"
              code="تعليمة: الصالون مغلق يوم الجمعة — نرحّب بالزبائن من السبت إلى الأربعاء"
              effect="كل من يتواصل يوم الجمعة يتلقى رداً واضحاً بأوقات العمل مع ترحيب دافئ ودعوة للحجز في الأيام الأخرى"
              trigger="محدّثة بأيام إجازتك — المناوب يعلم ولا داعي لتكرارها"
            />

            <InstructionExample color="violet"
              code="تعليمة: السعر الجديد لقصة الشعر 45 ريال، تشذيب اللحية 20 ريال"
              effect="المناوب يُجيب على أسئلة الأسعار بدقة دون أن تتدخل. «قصة الشعر بـ45 والتشذيب بـ20 — يسعد قلبك»"
              trigger="حدّث الأسعار متى شئت — تطبَّق فوراً في المحادثات"
            />

            <InstructionExample color="amber"
              code="تعليمة: المكان في حي النزهة، قريب من مسجد الفاروق — يسهل الوصول من الشارع الرئيسي"
              effect="عندما يسأل زبون عن الموقع، يعطيه المناوب وصفاً دقيقاً للوصول: «في حي النزهة قرب مسجد الفاروق، تلقى لنا على الشارع الرئيسي مباشرةً»"
              trigger="أضف علامات مميزة قريبة لتسهيل وصول الزبائن"
            />

            <InstructionExample color="emerald"
              code="تعليمة: ردّ على الإنجليزية والأردية بنفس اللغة — عندنا حلاقين متخصصين"
              effect="المناوب يكتشف لغة الزبون تلقائياً ويرد بها مع ذكر تخصص الحلاقين. Welcome! We have specialized barbers ready for you."
              trigger="مثالية للمناطق التجارية وقرب الأحياء متعددة الجنسيات"
            />
          </div>
        </section>

        {/* ══ القسم الثاني: جميع رموز التوجيه الكاملة ══ */}
        <section>
          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-300">
              <Zap className="h-3 w-3" /> جميع الرموز
            </div>
            <h2 className="text-xl font-black text-white">الدليل الكامل للرموز — ٩ رموز لكل احتياج</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              كل رمز له زر ملوّن في المكتب الخاص — اضغطه يُدرَج تلقائياً في الشات، اكتب ما يليه وأرسل.
            </p>
          </div>
          <div className="space-y-3">
            {([
              { code: 'تعليمة', tc: 'text-violet-300', bc: 'border-violet-400/25 bg-violet-950/25', title: 'توجيه عام للمناوب', affects: 'مناوب الشات — يُطبَّق مع كل زبون بسرية', examples: ['لا تقبل مواعيد بعد الساعة 10 مساءً', 'ابدأ كل رد بـ«أهلاً وسهلاً»'] },
              { code: 'عرض',    tc: 'text-amber-300',   bc: 'border-amber-400/25 bg-amber-950/25',   title: 'عرض أو تخفيض',    affects: 'مناوب الشات — يذكره عند المناسبة', examples: ['قصة + لحية بـ40 ريال هذا الأسبوع', 'تخفيض 20% على الحجز المسبق'] },
              { code: 'جدول',   tc: 'text-sky-300',     bc: 'border-sky-400/25 bg-sky-950/25',       title: 'أوقات العمل',     affects: 'مناوب الشات — يجيب عن مواعيد العمل', examples: ['مفتوح السبت-الخميس 10ص-10م، عطلة الجمعة', 'إجازة الأسبوع القادم أيام الأحد والاثنين'] },
              { code: 'خدمة',   tc: 'text-teal-300',    bc: 'border-teal-400/25 bg-teal-950/25',     title: 'خدمات وأسعار',    affects: 'مناوب الشات — يجيب عن الأسعار', examples: ['قصة شعر 40، تشذيب لحية 20، صبغة 80 ريال', 'نوفر زيارة منزلية بـ80 ريال لكبار السن'] },
              { code: 'موقع',   tc: 'text-emerald-300', bc: 'border-emerald-400/25 bg-emerald-950/25', title: 'الموقع والوصول', affects: 'مناوب الشات — يُرشد الزبائن للصالون', examples: ['في حي النزهة قرب مسجد الفاروق، الشارع الرئيسي', 'بجانب صيدلية النهدي في الدور الأرضي'] },
              { code: 'رد',     tc: 'text-rose-300',    bc: 'border-rose-400/25 bg-rose-950/25',     title: 'قالب رد جاهز',    affects: 'مناوب الشات — يستخدمه في الموقف المحدد', examples: ['عند السؤال عن الانتظار: المدة 20-30 دقيقة', 'عند الشكوى: آسفين وبنعوّض عليك'] },
              { code: 'تنبيه',  tc: 'text-orange-300',  bc: 'border-orange-400/25 bg-orange-950/25', title: 'تنبيه مؤقت',      affects: 'مناوب الشات — يُبلّغ كل من يتواصل', examples: ['الصالون مغلق غداً لإجازة طارئة', 'نغلق من 2-4 لزيارة صحية اليوم فقط'] },
              { code: 'مهمة',   tc: 'text-lime-300',    bc: 'border-lime-400/25 bg-lime-950/25',     title: 'مهمة تشغيلية',   affects: 'قائمة مهامك — تتابعها وتؤشّر إنجازها', examples: ['تجديد حزمة الرخصة قبل نهاية الشهر', 'رفع صور الإضاءة الجديدة على المعرض'] },
              { code: 'تذكير',  tc: 'text-pink-300',    bc: 'border-pink-400/25 bg-pink-950/25',     title: 'تذكير شخصي',     affects: 'قائمة مهامك — تذكير بموعد قادم', examples: ['تجديد الرخصة التجارية نهاية هذا الشهر', 'موعد الفحص الصحي الأسبوع القادم'] },
            ] as const).map(entry => (
              <div key={entry.code} className={`overflow-hidden rounded-2xl border p-4 ${entry.bc}`}>
                <div className="mb-2 flex items-center gap-3">
                  <span className={`rounded-xl border border-current/30 px-3 py-1 font-mono text-sm font-black ${entry.tc} bg-black/20`}>{entry.code}:</span>
                  <div>
                    <p className={`text-sm font-black ${entry.tc}`}>{entry.title}</p>
                    <p className="text-[0.58rem] text-slate-500">{entry.affects}</p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {entry.examples.map(ex => (
                    <div key={ex} className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                      <p className="flex-1 font-mono text-[0.65rem] text-white">{entry.code}: {ex}</p>
                      <CopyBtn text={`${entry.code}: ${ex}`} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ القسم القديم للمهام — مُحوَّل لقسم الأسئلة ══ */}
        <section>
          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-300">
              <ListTodo className="h-3 w-3" /> رمز ثانٍ
            </div>
            <h2 className="text-xl font-black text-white">«مهمة:» — لتتبع أعمالك التشغيلية</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              كل ما يسبقه <strong className="text-amber-300">«مهمة:»</strong> يُضاف لقائمة مهامك في المكتب الخاص.
              أشّرها منجزة بضغطة واحدة — المكتب يتذكرها لك.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { code: 'مهمة: تجديد حزمة الرخصة قبل نهاية الشهر', desc: 'تظهر في قائمة المهام حتى تؤشّرها منجزة' },
              { code: 'مهمة: رفع صور الإضاءة الجديدة على المعرض', desc: 'تذكّرك بتحديث بنرك وصورك' },
              { code: 'مهمة: تحديث سعر الخدمات في لوحة التحكم', desc: 'لا تنسى تحديث الأسعار مع كل تغيير' },
              { code: 'مهمة: التواصل مع الدعم لاستفسار عن الباقة', desc: 'كل شيء في مكان واحد — مكتبك' },
            ].map(t => (
              <div key={t.code} className="flex items-start gap-3 rounded-2xl border border-amber-400/15 bg-amber-950/20 p-4">
                <div className="mt-1 h-4 w-4 shrink-0 rounded border border-amber-400/30 bg-amber-500/10" />
                <div className="flex-1">
                  <p className="font-mono text-xs text-amber-300">{t.code}</p>
                  <p className="mt-1 text-[0.62rem] text-slate-500">{t.desc}</p>
                </div>
                <CopyBtn text={t.code} />
              </div>
            ))}
          </div>
        </section>

        {/* ══ القسم الثالث: الأسئلة السريعة ══ */}
        <section>
          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-300">
              <MessageSquare className="h-3 w-3" /> أسئلة سريعة
            </div>
            <h2 className="text-xl font-black text-white">اسأل المكتب مباشرةً — يجيبك فوراً</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { q: 'كم يوم باقي في حزمتي؟', a: 'يُظهر الأيام المتبقية + رابط التجديد', icon: CreditCard },
              { q: 'أرسل لي رابط التجديد', a: 'يُرسل رابط صفحة الدفع مباشرةً', icon: CreditCard },
              { q: 'وين رابط الدعم؟', a: 'يُرسل رابط الدعم الفني فوراً', icon: HeadphonesIcon },
              { q: 'ما هي تعليماتي الحالية؟', a: 'يُلخّص التعليمات المحفوظة', icon: BookOpen },
            ].map(item => (
              <div key={item.q} className="flex items-start gap-3 rounded-2xl border border-emerald-400/12 bg-emerald-950/20 p-4">
                <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/60" />
                <div className="flex-1">
                  <p className="font-mono text-xs font-black text-emerald-300">«{item.q}»</p>
                  <p className="mt-0.5 text-[0.62rem] text-slate-500">{item.a}</p>
                </div>
                <CopyBtn text={item.q} />
              </div>
            ))}
          </div>
        </section>

        {/* ══ القسم الرابع: تقارير المناوب ══ */}
        <section>
          <div className="mb-4">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-300">
              <FileText className="h-3 w-3" /> تقارير المناوب
            </div>
            <h2 className="text-xl font-black text-white">كل ما يستقبله المناوب يصلك تقريراً</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              بعد كل محادثة يجريها المناوب مع زبون، يظهر تقرير تلقائي في زر
              <strong className="text-violet-300"> «تقارير» </strong>
              في المكتب الخاص. التقرير يحتوي على رسالة الزبون + رد المناوب + التعليمات التي طبّقها.
            </p>
          </div>

          <div className="rounded-2xl border border-violet-500/20 bg-violet-950/20 p-5">
            <p className="mb-3 text-xs font-black text-violet-300/70">مثال على تقرير المناوب</p>
            <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-950/25 p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">🌙</span>
                <span className="text-xs font-black text-emerald-300">المناوب رد أثناء الإغلاق</span>
                <span className="text-[0.5rem] text-emerald-500/40">11:47 م</span>
              </div>
              <p className="text-[0.68rem] leading-relaxed text-slate-300">
                رسالة الزبون: «أبي أحجز بكرة الصبح الساعة 9»<br />
                رد المناوب: «أهلاً وسهلاً! الحين الصالون مغلق لكن أقدر أثبّت لك الساعة 9 صباحاً. تشرفنا فيك ونبدأ بك أول شيء»<br />
                التعليمات المطبّقة: 2 تعليمة
              </p>
            </div>
            <p className="mt-3 text-[0.6rem] text-violet-400/30">
              التقارير تتراكم في المكتب — اقرأها في أي وقت لمعرفة ما يدور مع زبائنك أثناء غيابك
            </p>
          </div>
        </section>

        {/* ══ تنبيهات مهمة ══ */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h2 className="text-lg font-black text-white">تنبيهات مهمة</h2>
          </div>
          <div className="space-y-3">
            {[
              { icon: '✅', text: 'التعليمات تُطبَّق فوراً — لا حاجة لإعادة تشغيل أي شيء' },
              { icon: '✅', text: 'تغيير التعليمة يُحدّث المناوب تلقائياً خلال ثوانٍ' },
              { icon: '✅', text: 'المناوب يُطبّق التعليمات بسرية — الزبون لا يعرف مصدرها' },
              { icon: '✅', text: 'يمكنك كتابة أي عدد من التعليمات — حتى 20 تعليمة نشطة' },
              { icon: '⚠️', text: 'لا تكتب بيانات سرية أو أرقام حسابات بنكية في التعليمات' },
              { icon: '⚠️', text: 'المناوب لا يحجز رسمياً ولا يُجري معاملات مالية — هو جسر التواصل فقط' },
            ].map(n => (
              <div key={n.text} className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3">
                <span>{n.icon}</span>
                <p className="text-sm text-slate-300">{n.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section>
          <div className="rounded-3xl border border-violet-500/25 p-8 text-center"
            style={{ background: 'linear-gradient(145deg,#0a0018,#0d0025)' }}>
            <Moon className="mx-auto mb-3 h-10 w-10 text-violet-400" />
            <h2 className="mb-2 text-xl font-black text-white">جاهز لتفعيل المكتب الخاص؟</h2>
            <p className="mb-5 text-sm text-slate-400">ابدأ بكتابة أول تعليمة لك — المناوب ينتظر أوامرك</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => navigate(ROUTE_PATHS.BARBER_LOGIN)}
                className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-white"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', boxShadow: '0 4px 20px rgba(139,92,246,0.30)' }}>
                <Moon className="h-4 w-4" /> افتح لوحة تحكم الماسي
              </button>
              <button onClick={() => navigate(ROUTE_PATHS.DIGITAL_SHIFT_FEATURE)}
                className="flex items-center gap-2 rounded-2xl border border-violet-400/25 bg-violet-500/10 px-6 py-3 text-sm font-semibold text-violet-300 hover:bg-violet-500/15 transition-all">
                شرح تقني مفصّل ←
              </button>
            </div>
          </div>
        </section>

      </div>

      <footer className="border-t border-violet-500/10 py-5 text-center text-[0.6rem] text-slate-600">
        إضافة المكتب الخاص 🏛️ · حلاق ماب · الباقة الماسية حصراً · ISIC4 474151
      </footer>
    </div>
  );
}
