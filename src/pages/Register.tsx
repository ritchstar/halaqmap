import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { RegistrationForm } from '@/components/RegistrationForm';
import { ROUTE_PATHS, SubscriptionTier } from '@/lib/index';
import { IMAGES } from '@/assets/images';
import { motion } from 'framer-motion';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

const subscriptionPlans = [
  {
    tier: SubscriptionTier.BRONZE,
    name: 'برونزي',
    price: 100,
    color: 'from-amber-700 to-amber-900',
    borderColor: 'border-amber-700/30',
    features: [
      { text: '4 صور مصغرة للمحل', included: true },
      { text: 'عرض الموقع على الخريطة', included: true },
      { text: 'رقم الهاتف للتواصل', included: true },
      { text: 'معلومات أساسية (الاسم، العنوان، ساعات العمل)', included: true },
      { text: 'بنر موسع للمحل', included: false },
      { text: 'رابط واتساب مباشر', included: false },
      { text: 'شات مباشر مع العملاء', included: false },
      { text: 'نظام حجز المواعيد', included: false },
      { text: 'شارة التحقق الماسية', included: false },
      { text: 'أولوية الظهور في النتائج', included: false },
      { text: 'ترجمة تلقائية في الشات', included: false },
    ],
  },
  {
    tier: SubscriptionTier.GOLD,
    name: 'ذهبي',
    price: 150,
    color: 'from-accent to-amber-600',
    borderColor: 'border-accent/50',
    popular: true,
    features: [
      { text: '4 صور مصغرة للمحل', included: true },
      { text: 'عرض الموقع على الخريطة', included: true },
      { text: 'رقم الهاتف للتواصل', included: true },
      { text: 'معلومات أساسية (الاسم، العنوان، ساعات العمل)', included: true },
      { text: 'بنر موسع للمحل', included: true },
      { text: 'رابط واتساب مباشر', included: true },
      { text: 'شات مباشر مع العملاء', included: true },
      { text: 'نظام حجز المواعيد', included: false },
      { text: 'شارة التحقق الماسية', included: false },
      { text: 'أولوية الظهور في النتائج', included: false },
      { text: 'ترجمة تلقائية في الشات', included: false },
    ],
  },
  {
    tier: SubscriptionTier.DIAMOND,
    name: 'ماسي',
    price: 200,
    color: 'from-primary to-cyan-600',
    borderColor: 'border-primary/50',
    features: [
      { text: '4 صور مصغرة للمحل', included: true },
      { text: 'عرض الموقع على الخريطة', included: true },
      { text: 'رقم الهاتف للتواصل', included: true },
      { text: 'معلومات أساسية (الاسم، العنوان، ساعات العمل)', included: true },
      { text: 'بنر موسع للمحل', included: true },
      { text: 'رابط واتساب مباشر', included: true },
      { text: 'شات مباشر مع العملاء', included: true },
      { text: 'نظام حجز المواعيد', included: true },
      { text: 'شارة التحقق الماسية', included: true },
      { text: 'أولوية الظهور في النتائج', included: true },
      { text: 'ترجمة تلقائية في الشات', included: true },
    ],
  },
];

export default function Register() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={springPresets.gentle}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url(${IMAGES.HALAQMAP_BARBER_BANNER_1_45})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="container mx-auto px-4 py-16 relative z-10">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={springPresets.gentle}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-l from-accent via-primary to-accent bg-clip-text text-transparent">
              انضم إلى منصة حلاق ماب
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              أول منصة عربية ذكية تربط الحلاقين المحترفين بالعملاء عبر نظام خرائط متقدم.
              اختر الباقة المناسبة لك وابدأ في جذب المزيد من العملاء اليوم.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mb-16"
          >
            <motion.h2
              variants={staggerItem}
              className="text-3xl font-bold text-center mb-8 text-foreground"
            >
              اختر باقتك المثالية
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {subscriptionPlans.map((plan, index) => (
                <motion.div
                  key={plan.tier}
                  variants={staggerItem}
                  whileHover={{ scale: 1.02, y: -8 }}
                  transition={springPresets.snappy}
                  className={`relative rounded-2xl border-2 ${plan.borderColor} bg-card/50 backdrop-blur-sm overflow-hidden`}
                  style={{
                    boxShadow: plan.popular
                      ? '0 8px 30px -6px color-mix(in srgb, var(--accent) 25%, transparent)'
                      : '0 4px 20px -4px color-mix(in srgb, var(--primary) 10%, transparent)',
                  }}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-l from-accent to-amber-600 text-accent-foreground text-center py-2 text-sm font-semibold">
                      الأكثر شعبية
                    </div>
                  )}
                  <div className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                    <div
                      className={`inline-block px-6 py-2 rounded-full bg-gradient-to-l ${plan.color} text-white font-bold text-lg mb-4`}
                    >
                      {plan.name}
                    </div>
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-xl text-muted-foreground mr-2">ريال / شهرياً</span>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                          )}
                          <span
                            className={`text-sm ${
                              feature.included ? 'text-foreground' : 'text-muted-foreground/60'
                            }`}
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...springPresets.gentle, delay: 0.3 }}
            className="max-w-4xl mx-auto bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-8 md:p-12"
            style={{
              boxShadow: '0 8px 30px -6px color-mix(in srgb, var(--primary) 15%, transparent)',
            }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
              نموذج التسجيل
            </h2>
            <RegistrationForm />
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...springPresets.gentle, delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground mb-4">
              بالتسجيل، أنت توافق على
              <Link
                to={ROUTE_PATHS.SUBSCRIPTION_POLICY}
                className="text-primary hover:text-primary/80 transition-colors mx-2 underline"
              >
                سياسة الاشتراك والإلغاء
              </Link>
              و
              <Link
                to={ROUTE_PATHS.PRIVACY}
                className="text-primary hover:text-primary/80 transition-colors mr-2 underline"
              >
                سياسة الخصوصية
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              لديك حساب بالفعل؟
              <Link
                to={ROUTE_PATHS.HOME}
                className="text-accent hover:text-accent/80 transition-colors mr-2 font-semibold"
              >
                العودة للرئيسية
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
