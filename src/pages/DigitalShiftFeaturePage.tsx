/**
 * DigitalShiftFeaturePage — صفحة شرح مفصّل للمناوب الرقمي الذكي
 * Route: /partners/digital-shift
 *
 * تشرح للحلاق بالكامل ميزات:
 *  · المناوب مع الزبائن (Customer-facing)
 *  · المكتب الخاص (Private Office — الجديد)
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Moon, MessageCircle, Globe2, BookOpen, ListTodo,
  CreditCard, HeadphonesIcon, Bell, Lock, ArrowLeft,
  CheckCircle2, Zap, Users, Clock, Shield,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { DIGITAL_SHIFT_MONTHLY_ADDON_SAR } from '@/config/subscriptionPricing';

const PRICE_D = 200;

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55 }}
      className={`relative ${className}`}
    >
      {children}
    </motion.section>
  );
}

// ─── Feature pill ─────────────────────────────────────────────────────────────
function Pill({ icon: Icon, label, color = 'violet' }: { icon: typeof Moon; label: string; color?: string }) {
  const cls = color === 'amber'
    ? 'border-amber-400/30 bg-amber-500/10 text-amber-300'
    : 'border-violet-400/30 bg-violet-500/10 text-violet-300';
  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.7rem] font-semibold ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </div>
  );
}

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({ n, title, desc, example }: { n: number; title: string; desc: string; example?: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/12 text-sm font-black text-violet-300">
        {n}
      </div>
      <div>
        <p className="font-black text-white">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{desc}</p>
        {example && (
          <div className="mt-2 rounded-xl border border-violet-400/15 bg-violet-950/30 px-3 py-2 text-[0.72rem] text-violet-300/80 italic">
            مثال: «{example}»
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DigitalShiftFeaturePage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'حلاق ماب — المناوب الرقمي الذكي | شرح مفصّل';
  }, []);

  return (
    <div
      dir="rtl"
      className="min-h-screen"
      style={{ background: 'linear-gradient(160deg, #03000a 0%, #080018 40%, #060010 100%)' }}
    >
      {/* ── شريط العودة ── */}
      <div className="sticky top-0 z-40 border-b border-violet-500/15 bg-[#03000a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
          <button onClick={() => navigate(ROUTE_PATHS.LANDING_PARTNERS_PREVIEW)}
            className="flex items-center gap-2 text-sm text-violet-400/70 hover:text-violet-300 transition-colors">
            <ArrowLeft className="h-4 w-4 rotate-180" /> العودة
          </button>
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-black text-violet-100">المناوب الرقمي الذكي</span>
          </div>
          <button
            onClick={() => navigate(ROUTE_PATHS.REGISTER)}
            className="rounded-xl bg-gradient-to-l from-violet-600 to-violet-800 px-4 py-1.5 text-xs font-black text-white hover:from-violet-500 transition-all"
          >
            ابدأ الآن
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-20 px-5 py-14">

        {/* ══ HERO ══ */}
        <Section>
          <div className="text-center">
            <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-violet-600/8 blur-[100px]" />
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-violet-400/40 bg-gradient-to-br from-violet-900/80 to-violet-950"
              style={{ boxShadow: '0 0 40px rgba(139,92,246,0.30)' }}
            >
              <Moon className="h-10 w-10 text-violet-300" />
            </motion.div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-xs font-black text-violet-300">
              إضافة برمجية متقدمة · Diamond Add-on · +{DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س/حزمة
            </div>
            <h1 className="mt-4 text-3xl font-black leading-tight text-white md:text-4xl">
              المناوب الرقمي الذكي
            </h1>
            <p className="mt-3 text-lg text-violet-300/80">مساعدك الشخصي الذي لا ينام — للزبائن وللحلاق</p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              بإضافة بسيطة (+{DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س/حزمة) على الباقة الماسية ({PRICE_D} ر.س) تحصل على مساعدين في واحد:
              مناوب يرد على زبائنك بذكاء، ومكتب خاص يساعدك أنت على إدارة صالونك.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Pill icon={Globe2} label="يرد على ٧ لغات" color="violet" />
              <Pill icon={Clock} label="يعمل ٢٤/٧" color="violet" />
              <Pill icon={Lock} label="مكتب خاص للحلاق" color="amber" />
              <Pill icon={Bell} label="تنبيه انتهاء الرخصة" color="amber" />
              <Pill icon={Shield} label="لا عمولات" color="violet" />
            </div>
          </div>
        </Section>

        {/* ══ الجزء الأول: مناوب الزبائن ══ */}
        <Section>
          <div className="overflow-hidden rounded-3xl border border-violet-500/20"
            style={{ background: 'linear-gradient(145deg, #0a0018, #0d0020)' }}>
            <div className="border-b border-violet-500/15 px-7 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/15">
                  <MessageCircle className="h-5 w-5 text-violet-300" />
                </div>
                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-widest text-violet-400/60">الجزء الأول</p>
                  <h2 className="text-lg font-black text-white">المناوب مع الزبائن</h2>
                </div>
              </div>
            </div>
            <div className="space-y-5 px-7 py-6">
              <p className="text-sm leading-7 text-slate-300">
                عندما يُغلق الصالون أو يتأخر الرد، يتدخّل المناوب تلقائياً ويرد على الزبون بأسلوب سعودي دافئ واحترافي —
                بلغة الزبون نفسها بدون أي إعداد يدوي.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Globe2, t: 'رد متعدد اللغات', d: 'عربي، إنجليزي، أردو، تركي، فرنسي، إسباني، فلبيني — يكتشف اللغة من أول رسالة' },
                  { icon: Clock, t: 'تدخّل ذكي', d: 'يتدخّل بعد مهلة تحددها أنت (١-٣٠ دقيقة) أو فوراً عند الإغلاق' },
                  { icon: Users, t: 'ضيافة حقيقية', d: 'يرحّب، يؤكد التوفر، ويمهّد لوصول الزبون — بدون وعود مالية' },
                  { icon: Shield, t: 'لا عمولة', d: 'المناوب لا يُجري معاملات مالية — هو فقط جسر التواصل الأول' },
                ].map(f => (
                  <div key={f.t} className="flex items-start gap-3 rounded-2xl border border-violet-400/10 bg-violet-900/15 px-4 py-3">
                    <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                    <div>
                      <p className="text-sm font-bold text-violet-100">{f.t}</p>
                      <p className="mt-0.5 text-[0.7rem] leading-relaxed text-slate-400">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* محاكاة محادثة */}
              <div className="rounded-2xl border border-white/8 bg-black/30 p-4">
                <p className="mb-3 text-[0.6rem] font-bold uppercase tracking-widest text-slate-500">محاكاة محادثة حقيقية</p>
                <div className="space-y-2">
                  <div className="ms-8 rounded-2xl rounded-tl-sm border border-white/10 bg-white/8 px-4 py-2.5 text-sm text-slate-200">
                    أبي أحجز كرسي الحين — في أحد متاح؟
                  </div>
                  <div className="me-8 rounded-2xl rounded-tr-sm border border-violet-500/20 bg-violet-500/10 px-4 py-2.5 text-sm text-violet-100">
                    🌟 أهلاً وسهلاً! أنا {'"'}المناوب{'"'} من الصالون — الحلاق منشغل الآن لكن عندنا كرسي فاضي.
                    سيتواصل معك أحد الفريق في أقرب وقت لتأكيد الموعد. تشرفنا فيك! ✂️
                  </div>
                  <p className="text-center text-[0.55rem] text-slate-600">المناوب رد خلال ثوانٍ — الصالون كان مغلقاً</p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ══ الجزء الثاني: المكتب الخاص ══ */}
        <Section>
          <div className="overflow-hidden rounded-3xl border border-amber-500/20"
            style={{ background: 'linear-gradient(145deg, #0a0600, #130d00)' }}>
            <div className="border-b border-amber-500/15 px-7 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/15">
                  <Lock className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-widest text-amber-400/60">الجزء الثاني · جديد</p>
                  <h2 className="text-lg font-black text-white">المكتب الخاص — محادثتك الشخصية مع المناوب</h2>
                </div>
              </div>
            </div>
            <div className="space-y-6 px-7 py-6">
              <p className="text-sm leading-7 text-slate-300">
                محادثة داخلية حصرية بينك أنت والمناوب — لا يراها الزبائن. اعطه تعليمات، سجّل مهامك، واستعلم عن رخصتك بلحظة.
              </p>

              {/* كيف تستخدمه */}
              <div>
                <h3 className="mb-4 text-sm font-black text-amber-300">كيف تستخدم المكتب الخاص؟</h3>
                <div className="space-y-4">
                  <StepCard n={1} title="أعطِ المناوب تعليماتك"
                    desc="اكتب تعليمات دائمة يُطبّقها المناوب مع كل زبون — تُحفظ تلقائياً."
                    example="تعليمة: لا تقبل مواعيد ما بين الـ ١٢ والـ ٢ ظهراً" />
                  <StepCard n={2} title="سجّل مهامك اليومية"
                    desc="قائمة مهام تشغيلية مع تتبع الإنجاز — لا تنسى شيئاً."
                    example="مهمة: تجديد حزمة الرخصة قبل نهاية الأسبوع" />
                  <StepCard n={3} title="اسأل عن رصيد حزمتك"
                    desc="يُخبرك بالأيام المتبقية ويُرسل رابط التجديد فوراً."
                    example="كم يوم باقي في حزمتي؟" />
                  <StepCard n={4} title="الوصول للدعم الفني"
                    desc="رابط الدعم مباشرة داخل المحادثة — بلا بحث."
                    example="وين رابط الدعم؟" />
                </div>
              </div>

              {/* مميزات المكتب */}
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: BookOpen, t: 'تعليمات دائمة', d: 'اكتب مرة وتُطبَّق دائماً — المناوب يعرف حدودك' },
                  { icon: ListTodo, t: 'قائمة مهام', d: 'أضف وأشّر الإنجاز — كل شيء في مكان واحد' },
                  { icon: CreditCard, t: 'رابط التجديد', d: 'يرسله فوراً عند السؤال أو التنبيه التلقائي' },
                  { icon: HeadphonesIcon, t: 'رابط الدعم', d: 'وصول مباشر لفريق الدعم من المحادثة' },
                  { icon: Bell, t: 'تنبيه ذكي', d: 'تحذير قبل ١٤ يوم من انتهاء الرخصة' },
                  { icon: Lock, t: 'خاص تماماً', d: 'الزبائن لا يرون هذه المحادثة أبداً' },
                ].map(f => (
                  <div key={f.t} className="flex items-start gap-3 rounded-2xl border border-amber-400/10 bg-amber-950/20 px-4 py-3">
                    <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <div>
                      <p className="text-sm font-bold text-amber-100">{f.t}</p>
                      <p className="mt-0.5 text-[0.7rem] leading-relaxed text-slate-400">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ══ الفرق بين الباقات ══ */}
        <Section>
          <h2 className="mb-8 text-center text-2xl font-black text-white">المناوب في كل باقة</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: 'برونزي & ذهبي',
                badge: '🥉🥇',
                color: 'border-slate-700/50 bg-slate-800/20',
                badge_color: 'text-slate-400',
                features: ['❌ المناوب الذكي غير متاح', '✅ ظهور جغرافي عند الطلب', '✅ بطاقة صالون كاملة'],
                note: 'يمكن الترقية للماسي في أي وقت',
              },
              {
                name: 'ماسي — بدون Add-on',
                badge: '💎',
                color: 'border-cyan-500/25 bg-cyan-950/15',
                badge_color: 'text-cyan-300',
                features: ['❌ المناوب غير مفعّل', '✅ صدارة النتائج', '✅ بورتفوليو غير محدود', '✅ تحليلات متقدمة'],
                note: 'يمكن إضافة المناوب متى شئت (+25 ر.س)',
              },
              {
                name: 'ماسي + المناوب',
                badge: '💎🌙',
                color: 'border-violet-500/35 bg-violet-950/20',
                badge_color: 'text-violet-300',
                features: [
                  '✅ مناوب ذكي للزبائن ٢٤/٧',
                  '✅ مكتب خاص للحلاق',
                  '✅ تعليمات + مهام محفوظة',
                  '✅ رصيد الحزمة + تجديد',
                  '✅ تنبيه انتهاء الرخصة',
                  '✅ كل مزايا الماسي',
                ],
                note: 'الباقة الأقوى — 225 ر.س/حزمة',
                recommended: true,
              },
            ].map(tier => (
              <div key={tier.name}
                className={`relative rounded-2xl border p-5 ${tier.color} ${tier.recommended ? 'shadow-[0_0_30px_rgba(139,92,246,0.15)]' : ''}`}>
                {tier.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-3 py-0.5 text-[0.6rem] font-black text-white">
                    الأكثر قيمةً
                  </div>
                )}
                <p className="mb-1 text-xl">{tier.badge}</p>
                <p className={`mb-3 text-sm font-black ${tier.badge_color}`}>{tier.name}</p>
                <div className="space-y-1.5">
                  {tier.features.map(f => (
                    <p key={f} className="text-[0.72rem] text-slate-300">{f}</p>
                  ))}
                </div>
                <p className="mt-3 text-[0.6rem] text-slate-500">{tier.note}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ══ CTA ══ */}
        <Section>
          <div className="rounded-3xl border border-violet-500/25 p-8 text-center"
            style={{ background: 'linear-gradient(145deg,#0a0018,#0d0025)' }}>
            <Moon className="mx-auto mb-4 h-12 w-12 text-violet-400" />
            <h2 className="mb-2 text-2xl font-black text-white">جاهز لتفعيل المناوب؟</h2>
            <p className="mb-6 text-slate-400">ابدأ بالباقة الماسية وأضف المناوب — {PRICE_D + DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س/حزمة فقط</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => navigate(`${ROUTE_PATHS.REGISTER}?tier=diamond`)}
                className="flex items-center gap-2 rounded-2xl px-8 py-3 text-sm font-black text-white"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', boxShadow: '0 4px 24px rgba(139,92,246,0.35)' }}>
                <Moon className="h-4 w-4" /> سجّل الآن واحصل على المناوب
              </button>
              <button onClick={() => navigate(ROUTE_PATHS.LANDING_PARTNERS_PREVIEW)}
                className="flex items-center gap-2 rounded-2xl border border-violet-400/30 bg-violet-500/10 px-6 py-3 text-sm font-semibold text-violet-300 hover:bg-violet-500/18 transition-all">
                <ArrowLeft className="h-4 w-4 rotate-180" /> العودة لصفحة الباقات
              </button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {['لا عمولات', 'مسبقة الدفع', 'إلغاء في أي وقت', 'ISIC4 474151'].map(t => (
                <div key={t} className="flex items-center gap-1.5 text-[0.65rem] text-slate-500">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500/60" /> {t}
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      <footer className="border-t border-violet-500/10 py-6 text-center text-[0.6rem] text-slate-600">
        المناوب الرقمي الذكي 🌙 · إضافة برمجية متقدمة · حلاق ماب · ISIC4 474151
      </footer>
    </div>
  );
}
