import { motion } from "framer-motion";
import { MapPin, Target, Eye, Zap, Shield, Award } from "lucide-react";
import { IMAGES } from "@/assets/images";
import {
  PLATFORM_ABOUT_FEATURE_QUALITY,
  PLATFORM_ABOUT_HERO_SUBTITLE,
  PLATFORM_MISSION_BODY,
  PLATFORM_VISION_BODY,
  PLATFORM_WHY_FEATURES_INTRO,
} from "@/config/platformGrowthNarrative";

export default function About() {
  const features = [
    {
      icon: MapPin,
      title: "تحديد موقع دقيق",
      description: "تقنية GPS لعرض الحلّاقين ضمن النطاق الذي تختاره — حسب توفر الشركاء في منطقتك.",
    },
    {
      icon: Shield,
      title: "خصوصية تامة",
      description: "لا نطلب تسجيل من المستخدمين، فقط حدد موقعك واعثر على حلاقك",
    },
    {
      icon: Zap,
      title: "سرعة وكفاءة",
      description: "واجهة سريعة وسهلة الاستخدام توفر لك الوقت والجهد",
    },
    {
      icon: Award,
      title: PLATFORM_ABOUT_FEATURE_QUALITY.title,
      description: PLATFORM_ABOUT_FEATURE_QUALITY.description,
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "حدد موقعك",
      description: "اضغط على زر تحديد الموقع للسماح للمنصة بمعرفة موقعك الحالي",
    },
    {
      step: "2",
      title: "تصفح الحلاقين القريبين",
      description: "شاهد قائمة الحلاقين المحترفين بالقرب منك مع التقييمات والمسافة",
    },
    {
      step: "3",
      title: "اختر وتواصل",
      description: "اختر الحلاق المناسب وتواصل معه مباشرة عبر الهاتف أو الواتساب",
    },
  ];

  const userPrinciples = [
    {
      title: "سهولة البدء",
      body: "لا تحتاج إلى إنشاء حساب. تبدأ مباشرة بتحديد موقعك واستكشاف الخيارات الأقرب.",
    },
    {
      title: "اختيار أوضح",
      body: "تستخدم الفلاتر والتقييمات والمسافة لاتخاذ قرار أسرع يناسب احتياجك الفعلي.",
    },
    {
      title: "تواصل مباشر",
      body: "تتواصل مع الصالون من القنوات المتاحة بدون خطوات معقدة أو إجراءات إضافية.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative py-24 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.BARBER_SHOP_5}
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent">
              من نحن
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">{PLATFORM_ABOUT_HERO_SUBTITLE}</p>
          </motion.div>
        </div>
      </motion.section>

      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold">
                <Target className="w-5 h-5" />
                <span>قصتنا</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground">
                رؤية تجمع بين التقنية والتقاليد
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                انطلقت حلاق ماب من فكرة بسيطة: كيف نسهّل العثور على حلاق محترف بالقرب منك؟ في عالم يتسارع فيه كل شيء، نريد حلاً ذكياً يحترم وقتك ويعزز تجربة الحلاقة دون مبالغة في الوعود.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                ننمو خطوة بخطوة: نبني جسراً بين الحرفة التقليدية والتكنولوجيا، ونعطي الأولوية لتكثيف الشركاء الحلّاقين على الخريطة ثم توسيع الوصول للمستخدمين بما يلائم كل منطقة — صدق التجربة قبل حجم الإعلان.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <img
                src={IMAGES.BARBER_WORK_2}
                alt=""
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent font-semibold mb-6">
              <Eye className="w-5 h-5" />
              <span>رؤيتنا ورسالتنا</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-6">نحو مستقبل رقمي للحلاقة</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-3xl border border-primary/20"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">رؤيتنا</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">{PLATFORM_VISION_BODY}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-accent/10 to-accent/5 p-8 rounded-3xl border border-accent/20"
            >
              <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">رسالتنا</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">{PLATFORM_MISSION_BODY}</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-6">ماذا ستستفيد كمستخدم؟</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {userPrinciples.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="bg-gradient-to-br from-background to-card p-6 sm:p-8 rounded-3xl border border-border text-right hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-lg font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-6">لماذا حلاق ماب؟</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{PLATFORM_WHY_FEATURES_INTRO}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card p-6 rounded-3xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-6">كيف تعمل المنصة؟</h2>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {howItWorks.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                >
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-3xl border border-primary/20 text-center">
                    <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                      {item.step}
                    </div>
                    <h4 className="text-xl font-bold text-foreground mb-3">{item.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-8 h-0.5 bg-primary/30 -translate-y-1/2" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <img
                src={IMAGES.BARBER_TOOLS_1}
                alt=""
                className="relative rounded-3xl shadow-2xl w-full h-[400px] object-cover mb-12"
              />
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-6">ابدأ استخدام حلاق ماب الآن</h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              تجربتك تبدأ بخطوة واحدة: حدد موقعك، راجع الخيارات القريبة، واختر الصالون الأنسب لك بسهولة.
            </p>
            <motion.a
              href="#/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-l from-primary to-accent text-primary-foreground rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span>ابدأ التصفح الآن</span>
              <Award className="w-5 h-5" />
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
