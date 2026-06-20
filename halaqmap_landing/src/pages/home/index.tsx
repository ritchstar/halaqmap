import { motion } from "framer-motion";
import { MapPin, Phone, MessageCircle, Check, X, Star, Scissors, Shield, Zap, Users, ChevronLeft, ArrowLeft } from "lucide-react";

/* @section: landing-page */
export default function Home() {
  const REGISTER_URL = "https://www.halaqmap.com/#/partners";
  const EXPERIENCE_URL = "https://www.halaqmap.com/#/شاهد تجربة الزبون";

  const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };
  const stagger = {
    visible: { transition: { staggerChildren: 0.12 } },
  };

  return (
    <div dir="rtl" className="min-h-screen font-sans overflow-x-hidden" style={{ background: "#0A1628", color: "#F8FAFC" }}>
      {/* Grid Background Overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(13,148,136,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(13,148,136,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          zIndex: 0,
        }}
      />

      {/* ───── NAVBAR ───── */}
      {/* @section: navbar */}
      <nav className="relative z-50 w-full border-b" style={{ borderColor: "rgba(13,148,136,0.2)", background: "rgba(10,22,40,0.92)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(13,148,136,0.2)", border: "1px solid rgba(13,148,136,0.4)" }}>
              <MapPin size={16} style={{ color: "#0D9488" }} />
            </div>
            <span className="font-bold text-lg" style={{ color: "#0D9488" }}>حلاق ماب</span>
            <span className="text-sm" style={{ color: "#94A3B8" }}>| مسار الشركاء</span>
          </div>
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-90"
            style={{ background: "#0D9488", color: "#F8FAFC" }}
          >
            سجّل صالونك
          </a>
        </div>
      </nav>

      {/* ───── HERO ───── */}
      {/* @section: hero */}
      <section className="relative z-10 py-24 px-6">
        {/* Glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)" }} />

        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" style={{ background: "rgba(13,148,136,0.12)", border: "1px solid rgba(13,148,136,0.35)", color: "#0D9488" }}>
            <Scissors size={14} />
            <span>مسار الخدمات التسويقية للشركاء</span>
          </motion.div>

          {/* Main title */}
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-4xl md:text-6xl font-black leading-tight mb-6">
            <span style={{ color: "#F8FAFC" }}>اجعل صالونك</span>
            <br />
            <span style={{ color: "#0D9488" }}>يُكتشف بذكاء</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="text-xl md:text-2xl font-bold mb-4" style={{ color: "#D4AF37" }}>
            زبائن قريبون يصلون إليك عندما يحتاجون حلاقة
          </motion.p>

          {/* Description */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="max-w-2xl mx-auto mb-6">
            <p className="text-base leading-relaxed mb-2" style={{ color: "#CBD5E1" }}>
              منصة تربطك بزبون قريب في اللحظة المناسبة — حضور رسمي لصالونك، تواصل مباشر، ولا عمولة على خدمة الحلاقة.
            </p>
            <p className="text-base" style={{ color: "#94A3B8" }}>
              تدفع مقابل حزمة ظهور رقمية — لا وساطة ولا حجز نيابة عنك.
            </p>
          </motion.div>

          {/* Self-service path */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.4 }} className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg mb-10" style={{ background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.2)", color: "#64A8A3" }}>
            <Zap size={13} />
            <span>مسار ذاتي: تسجيل → باقة → دفع → تفعيل</span>
          </motion.div>

          {/* Feature strip */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }} className="flex flex-wrap justify-center gap-6 mb-12 text-sm font-semibold" style={{ color: "#94A3B8" }}>
            {["لا عمولة", "لا وسيط", "حضور رسمي"].map((f, i) => (
              <span key={i} className="flex items-center gap-2">
                <Check size={14} style={{ color: "#0D9488" }} />
                {f}
              </span>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="flex flex-wrap justify-center gap-4">
            <a href={REGISTER_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 hover:scale-105" style={{ background: "#0D9488", color: "#fff", boxShadow: "0 0 24px rgba(13,148,136,0.35)" }}>
              <span>سجّل طلبك الآن</span>
              <ArrowLeft size={18} />
            </a>
            <a href={EXPERIENCE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:bg-teal-900/20" style={{ border: "1px solid rgba(13,148,136,0.5)", color: "#0D9488" }}>
              <span>شاهد تجربة الزبون</span>
            </a>
          </motion.div>

          {/* Badge tier pills */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.65 }} className="flex justify-center gap-3 mt-10">
            {[
              { label: "برونزي", color: "#cd7f32", bg: "rgba(205,127,50,0.12)", border: "rgba(205,127,50,0.35)" },
              { label: "ذهبي", color: "#D4AF37", bg: "rgba(212,175,55,0.12)", border: "rgba(212,175,55,0.4)" },
              { label: "ماسي", color: "#06B6D4", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.35)" },
            ].map((tier) => (
              <span key={tier.label} className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: tier.bg, border: `1px solid ${tier.border}`, color: tier.color }}>
                {tier.label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───── PROBLEM ───── */}
      {/* @section: problem */}
      <section className="relative z-10 py-20 px-6" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
            {/* Section tag */}
            <motion.div variants={fadeUp} className="flex justify-center mb-6">
              <span className="text-sm font-medium px-4 py-1.5 rounded-full" style={{ background: "rgba(13,148,136,0.1)", border: "1px solid rgba(13,148,136,0.3)", color: "#0D9488" }}>
                تحديات الصالون
              </span>
            </motion.div>

            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-center mb-3" style={{ color: "#F8FAFC" }}>
              الكرسي الفارغ والمكالمة الضائعة
            </motion.h2>
            <motion.p variants={fadeUp} className="text-center mb-14 text-base" style={{ color: "#D4AF37" }}>
              مشكلة يومية لكل صالون — وحلاق ماب يوجّه الطلب المناسب إليك
            </motion.p>

            <motion.div variants={stagger} className="grid md:grid-cols-2 gap-4">
              {[
                { icon: <Users size={20} />, color: "#0D9488", title: "الزبون العابر الضائع", desc: "الزبون موجود الآن، ويريد خدمة — وليس «اسم في قائمة طويلة»" },
                { icon: <Zap size={20} />, color: "#D4AF37", title: "إعلانات بلا نتيجة", desc: "الإعلان العشوائي يكلف، ولا يضمن طلباً حقيقياً في وقت فراغك" },
                { icon: <Phone size={20} />, color: "#0D9488", title: "اتصالات تستهلك وقتك", desc: "مكالمات أثناء الإغلاق أو من مناطق بعيدة تضيع وقت فريقك بلا فائدة" },
                { icon: <Star size={20} />, color: "#D4AF37", title: "الطلب الموجه بذكاء", desc: "حلاق ماب يوجّه الطلب المناسب إلى صالونك — لا يعدك بزحمة دائمة" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="flex gap-4 p-5 rounded-2xl transition-all duration-300 hover:scale-[1.01]" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(${item.color === "#0D9488" ? "13,148,136" : "212,175,55"},0.2)` }}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `rgba(${item.color === "#0D9488" ? "13,148,136" : "212,175,55"},0.15)`, color: item.color }}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-base mb-1" style={{ color: "#F8FAFC" }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      {/* @section: how-it-works */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center mb-6">
              <span className="text-sm font-medium px-4 py-1.5 rounded-full" style={{ background: "rgba(13,148,136,0.1)", border: "1px solid rgba(13,148,136,0.3)", color: "#0D9488" }}>
                رحلة الزبون
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-center mb-3" style={{ color: "#F8FAFC" }}>
              كيف يصل الزبون إليك؟
            </motion.h2>
            <motion.p variants={fadeUp} className="text-center mb-14" style={{ color: "#D4AF37" }}>
              مسار بسيط — من الاستعلام إلى اتصالك أنت
            </motion.p>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* Connector line (desktop) */}
              <div className="hidden md:block absolute top-10 left-[16.5%] right-[16.5%] h-px" style={{ background: "linear-gradient(90deg, #0D9488 0%, #D4AF37 50%, #0D9488 100%)", opacity: 0.3 }} />

              {[
                {
                  step: "١", icon: <MapPin size={28} />, color: "#0D9488", borderColor: "rgba(13,148,136,0.4)",
                  title: "الاستعلام",
                  desc: "الزبون يبدأ الاستعلام ويسمح بموقعه — مجاناً وبدون حساب — ليرى من قرب يمكنه زيارته الآن",
                },
                {
                  step: "٢", icon: <Scissors size={28} />, color: "#D4AF37", borderColor: "rgba(212,175,55,0.4)",
                  title: "ظهور صالونك",
                  desc: "يظهر صالونك بين الخيارات المناسبة إذا كنت مشتركاً (قريب، مفتوح، نوع الخدمة) — بطاقتك بصورك ووسائل تواصلك",
                },
                {
                  step: "٣", icon: <MessageCircle size={28} />, color: "#0D9488", borderColor: "rgba(13,148,136,0.4)",
                  title: "تواصل مباشر",
                  desc: "يتصل أو يراسلك مباشرة — أنت من يحدد الموعد والسعر والخدمة. لا وساطة ولا عمولة",
                },
              ].map((step, i) => (
                <motion.div key={i} variants={fadeUp} className="relative text-center p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${step.borderColor}` }}>
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5" style={{ background: `rgba(${step.color === "#0D9488" ? "13,148,136" : "212,175,55"},0.15)`, border: `1px solid ${step.borderColor}`, color: step.color }}>
                    {step.icon}
                  </div>
                  <div className="text-3xl font-black mb-3" style={{ color: step.color }}>{step.step}</div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: "#F8FAFC" }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{step.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Footer note */}
            <motion.p variants={fadeUp} className="text-center mt-8 text-sm" style={{ color: "#64748B" }}>
              لا عمولة على الحلاقة — دور المنصة ربط وظهور لا فرض حجز
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ───── PACKAGES ───── */}
      {/* @section: packages */}
      <section className="relative z-10 py-20 px-6" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center mb-6">
              <span className="text-sm font-medium px-4 py-1.5 rounded-full" style={{ background: "rgba(13,148,136,0.1)", border: "1px solid rgba(13,148,136,0.3)", color: "#0D9488" }}>
                باقات رخصة النفاذ
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-center mb-2" style={{ color: "#F8FAFC" }}>
              اختر الباقة المناسبة لصالونك
            </motion.h2>
            <motion.p variants={fadeUp} className="text-center mb-14 text-sm" style={{ color: "#94A3B8" }}>
              30 يوماً · لا عمولة على الحلاقة · مسار تسجيل ذاتي
            </motion.p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Bronze */}
              <motion.div variants={fadeUp} className="p-6 rounded-2xl flex flex-col" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(205,127,50,0.35)" }}>
                <div className="mb-5">
                  <span className="text-2xl mb-2 block">🥉</span>
                  <h3 className="text-xl font-black mb-1" style={{ color: "#cd7f32" }}>برونزي</h3>
                  <div className="font-black text-3xl mt-3" style={{ color: "#F8FAFC", fontFamily: "IBM Plex Mono, monospace" }}>100 <span className="text-base font-normal" style={{ color: "#94A3B8" }}>ر.س / حزمة</span></div>
                </div>
                <ul className="space-y-2.5 flex-1 text-sm">
                  {[
                    { ok: true, text: "ظهور عند الطلب المناسب (قرب + مفتوح + الخدمة)" },
                    { ok: true, text: "بطاقة صالون: اتصال + واتساب + صور أساسية" },
                    { ok: true, text: "أوقات عمل أسبوعية + حالة مفتوح/مغلق" },
                    { ok: true, text: "شهادة تفعيل ورقم رخصة نفاذ" },
                    { ok: false, text: "لوحة تحكم" },
                    { ok: false, text: "جدولة المواعيد" },
                  ].map((f, i) => (
                    <li key={i} className={`flex items-start gap-2 ${!f.ok ? "opacity-40" : ""}`}>
                      {f.ok
                        ? <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#cd7f32" }} />
                        : <X size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#64748B" }} />
                      }
                      <span style={{ color: f.ok ? "#CBD5E1" : "#64748B" }}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <a href={REGISTER_URL} target="_blank" rel="noopener noreferrer" className="mt-6 block text-center py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90" style={{ border: "1px solid rgba(205,127,50,0.5)", color: "#cd7f32" }}>
                  اشترك الآن
                </a>
              </motion.div>

              {/* Gold — Featured */}
              <motion.div variants={fadeUp} className="p-6 rounded-2xl flex flex-col relative" style={{ background: "rgba(212,175,55,0.07)", border: "2px solid rgba(212,175,55,0.55)", boxShadow: "0 0 32px rgba(212,175,55,0.12)" }}>
                <div className="absolute -top-3 right-6">
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "#D4AF37", color: "#0A1628" }}>الأكثر طلباً</span>
                </div>
                <div className="mb-5">
                  <span className="text-2xl mb-2 block">🥇</span>
                  <h3 className="text-xl font-black mb-1" style={{ color: "#D4AF37" }}>ذهبي</h3>
                  <div className="font-black text-3xl mt-3" style={{ color: "#F8FAFC", fontFamily: "IBM Plex Mono, monospace" }}>150 <span className="text-base font-normal" style={{ color: "#94A3B8" }}>ر.س / حزمة</span></div>
                </div>
                <ul className="space-y-2.5 flex-1 text-sm">
                  {[
                    { ok: true, text: "كل مميزات البرونزي" },
                    { ok: true, text: "أولوية ذهبية في ترتيب الظهور" },
                    { ok: true, text: "معرض حتى 20 صورة + جودة عرض أعلى" },
                    { ok: true, text: "تقييمات موثقة عبر QR" },
                    { ok: true, text: "واتساب + شات مباشر (60 دقيقة)" },
                    { ok: true, text: "لوحة تحكم: صور، أسعار، أوقات العمل" },
                    { ok: false, text: "جدولة المواعيد" },
                  ].map((f, i) => (
                    <li key={i} className={`flex items-start gap-2 ${!f.ok ? "opacity-40" : ""}`}>
                      {f.ok
                        ? <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#D4AF37" }} />
                        : <X size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#64748B" }} />
                      }
                      <span style={{ color: f.ok ? "#F8FAFC" : "#64748B" }}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <a href={REGISTER_URL} target="_blank" rel="noopener noreferrer" className="mt-6 block text-center py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90" style={{ background: "#D4AF37", color: "#0A1628" }}>
                  اشترك الآن
                </a>
              </motion.div>

              {/* Diamond */}
              <motion.div variants={fadeUp} className="p-6 rounded-2xl flex flex-col" style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.35)" }}>
                <div className="mb-5">
                  <span className="text-2xl mb-2 block">💎</span>
                  <h3 className="text-xl font-black mb-1" style={{ color: "#06B6D4" }}>ماسي</h3>
                  <div className="font-black text-3xl mt-3" style={{ color: "#F8FAFC", fontFamily: "IBM Plex Mono, monospace" }}>
                    200 <span className="text-base font-normal" style={{ color: "#94A3B8" }}>ر.س / حزمة</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#06B6D4" }}>+ مكتب خاص: 225 ر.س (+25 إضافة)</div>
                </div>
                <ul className="space-y-2.5 flex-1 text-sm">
                  {[
                    { ok: true, text: "أعلى أولوية في منطقتك" },
                    { ok: true, text: "معرض حتى 40 صورة + فيديو مباشر" },
                    { ok: true, text: "دعم متعدد اللغات" },
                    { ok: true, text: "لوحة تحكم كاملة" },
                    { ok: true, special: true, text: "جدولة المواعيد من اللوحة ✦" },
                    { ok: true, text: "خدمة منزلية + شات بوت (اختياري)" },
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: (f as { special?: boolean }).special ? "#D4AF37" : "#06B6D4" }} />
                      <span style={{ color: (f as { special?: boolean }).special ? "#D4AF37" : "#F8FAFC", fontWeight: (f as { special?: boolean }).special ? 700 : 400 }}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <a href={REGISTER_URL} target="_blank" rel="noopener noreferrer" className="mt-6 block text-center py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90" style={{ border: "1px solid rgba(6,182,212,0.5)", color: "#06B6D4" }}>
                  اشترك الآن
                </a>
              </motion.div>
            </div>

            <motion.p variants={fadeUp} className="text-center mt-6 text-xs" style={{ color: "#475569" }}>
              جميع الأسعار غير شاملة الضريبة · التفعيل بعد إتمام الدفع
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ───── TRUST SIGNALS ───── */}
      {/* @section: trust */}
      <section className="relative z-10 py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Shield size={22} />, color: "#0D9488", title: "منصة محمية", sub: "SSL Labs A+" },
              { icon: <Check size={22} />, color: "#D4AF37", title: "لا عمولة", sub: "على الحلاقة" },
              { icon: <Zap size={22} />, color: "#0D9488", title: "تفعيل فوري", sub: "بعد السداد" },
              { icon: <Users size={22} />, color: "#D4AF37", title: "تواصل مباشر", sub: "بلا وسيط" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${item.color === "#0D9488" ? "13,148,136" : "212,175,55"},0.2)` }}>
                <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-3" style={{ background: `rgba(${item.color === "#0D9488" ? "13,148,136" : "212,175,55"},0.12)`, color: item.color }}>
                  {item.icon}
                </div>
                <div className="font-bold text-sm mb-0.5" style={{ color: "#F8FAFC" }}>{item.title}</div>
                <div className="text-xs" style={{ color: "#64748B" }}>{item.sub}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───── WHY NOW ───── */}
      {/* @section: why-now */}
      <section className="relative z-10 py-16 px-6" style={{ background: "rgba(13,148,136,0.04)", borderTop: "1px solid rgba(13,148,136,0.12)", borderBottom: "1px solid rgba(13,148,136,0.12)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-black mb-8" style={{ color: "#F8FAFC" }}>
              لماذا الانضمام <span style={{ color: "#D4AF37" }}>الآن؟</span>
            </motion.h2>
            <motion.div variants={stagger} className="space-y-4 text-right">
              {[
                "كلما اكتملت شبكة الصالونات في منطقتك، صارت المنافسة على الظهور أعلى",
                "من يسجّل الآن يبني حضوراً رسمياً قبل موجة التوسع القادمة",
                "حزمة رقمية 30 يوماً — تفعيل واضح بدون عمولة على خدمة الحلاقة",
                "مسار ذاتي على المنصة: تسجيل → اختيار الباقة → الدفع → التفعيل",
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="flex gap-3 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(13,148,136,0.2)" }}>
                  <ChevronLeft size={18} className="mt-0.5 flex-shrink-0" style={{ color: "#0D9488" }} />
                  <p className="text-sm leading-relaxed" style={{ color: "#CBD5E1" }}>{item}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ───── CTA FINAL ───── */}
      {/* @section: cta-final */}
      <section className="relative z-10 py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(13,148,136,0.08) 0%, transparent 65%)" }} />
        <div className="max-w-2xl mx-auto text-center relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8" style={{ background: "rgba(13,148,136,0.12)", border: "1px solid rgba(13,148,136,0.35)", color: "#0D9488" }}>
              <Scissors size={14} />
              <span>الخطوة التالية</span>
            </motion.div>

            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-4" style={{ color: "#F8FAFC" }}>
              جاهز لتسجيل صالونك؟
            </motion.h2>
            <motion.p variants={fadeUp} className="mb-2" style={{ color: "#D4AF37", fontWeight: 700 }}>
              ابدأ الآن — مكانك في المنصة يُحجز مبكراً
            </motion.p>
            <motion.p variants={fadeUp} className="text-sm mb-10" style={{ color: "#94A3B8" }}>
              سجّل من المنصة — اختر الباقة، أكمل الدفع، ويُستكمل التفعيل بعد السداد
            </motion.p>

            {/* Register button */}
            <motion.div variants={fadeUp}>
              <a
                href={REGISTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-lg transition-all duration-200 hover:opacity-90 hover:scale-105"
                style={{ background: "#0D9488", color: "#fff", boxShadow: "0 0 40px rgba(13,148,136,0.4)" }}
              >
                <span>سجّل طلبك الآن</span>
                <ArrowLeft size={22} />
              </a>
            </motion.div>

            {/* Steps micro */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 mt-10 text-xs" style={{ color: "#64748B" }}>
              {["① تسجيل", "② اختيار الباقة", "③ دفع + تفعيل"].map((s, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Check size={10} style={{ color: "#0D9488" }} /> {s}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      {/* @section: footer */}
      <footer className="relative z-10 py-8 px-6 text-center" style={{ borderTop: "1px solid rgba(13,148,136,0.15)", background: "rgba(0,0,0,0.2)" }}>
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm" style={{ color: "#475569" }}>
          <span style={{ color: "#0D9488", fontWeight: 700 }}>www.halaqmap.com</span>
          <span>لا عمولة</span>
          <span>·</span>
          <span>لا وسيط</span>
          <span>·</span>
          <span>حضور رسمي</span>
        </div>
        <p className="text-xs mt-3" style={{ color: "#334155" }}>
          حلاق ماب — حضور رقمي أوضح، ووصول أسرع للعملاء
        </p>
      </footer>
    </div>
  );
}
