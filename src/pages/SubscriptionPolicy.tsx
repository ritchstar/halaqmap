import { motion } from "framer-motion";
import { springPresets, fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { CheckCircle2, XCircle, AlertCircle, Phone, Mail, MessageSquare, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BARBER_DASHBOARD_DIAMOND_PORTAL_LINE,
  BARBER_DASHBOARD_GOLD_LINE,
  BARBER_DIAMOND_APPOINTMENTS_FROM_DASHBOARD_LINE,
  MAP_FEATURE_HERO,
  SHOP_OPEN_STATUS_FEATURE_BRONZE,
  SHOP_OPEN_STATUS_FEATURE_GOLD_DIAMOND,
} from "@/config/subscriptionPlanHero";
import { RATING_QR_PLAN_LINE } from "@/config/ratingQrInvite";
import {
  LEGAL_TRADE_NAME_AR,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
  PARTNER_SUPPORT_EMAIL,
  PARTNER_SUPPORT_PHONE_E164,
  PARTNER_SUPPORT_WHATSAPP_URL,
  getLegalCommercialRegistrationDisplay,
} from "@/config/partnerLegal";

type SubscriptionTierFeature = { kind: "map_hero" } | { kind: "text"; value: string };

export default function SubscriptionPolicy() {
  const commercialReg = getLegalCommercialRegistrationDisplay();
  const subscriptionTiers: Array<{
    name: string;
    price: string;
    period: string;
    color: string;
    features: SubscriptionTierFeature[];
  }> = [
    {
      name: "برونزي",
      price: "100",
      period: "ر.س / حزمة برمجية",
      color: "bg-gradient-to-br from-amber-700 to-amber-900",
      features: [
        { kind: "map_hero" },
        { kind: "text", value: "صورتان أساسيتان (خارجي وداخل) وأربع صور للبنر مع طلب الحزمة البرمجية" },
        { kind: "text", value: "جدول أسبوعي كامل لأوقات العمل مع الطلب (إلزامي ويُعرَض للعملاء)" },
        { kind: "text", value: "رقم الهاتف وبيانات التواصل من بطاقة المحل" },
        { kind: "text", value: "ظهور في نتائج البحث" },
        { kind: "text", value: "تحديث المعلومات الأساسية" },
        { kind: "text", value: SHOP_OPEN_STATUS_FEATURE_BRONZE },
      ],
    },
    {
      name: "ذهبي",
      price: "150",
      period: "ر.س / حزمة برمجية",
      color: "bg-gradient-to-br from-accent to-yellow-600",
      features: [
        { kind: "map_hero" },
        { kind: "text", value: RATING_QR_PLAN_LINE },
        { kind: "text", value: "كل مميزات البرونزي" },
        { kind: "text", value: "بنر موسع بصور متعددة" },
        { kind: "text", value: "إدارة صور المحل والبنر من لوحة التحكم بعد التفعيل" },
        { kind: "text", value: "جدول أسبوعي لأوقات العمل من لوحة التحكم (كل يوم على حدة)" },
        { kind: "text", value: "رابط واتساب مباشر" },
        { kind: "text", value: "شات مباشر مع العملاء" },
        { kind: "text", value: "جلسة شات خاصة لكل عميل تنتهي تلقائياً بعد 60 دقيقة لخصوصية أعلى" },
        { kind: "text", value: "أولوية في نتائج البحث" },
        { kind: "text", value: "إحصائيات المشاهدات" },
        { kind: "text", value: SHOP_OPEN_STATUS_FEATURE_GOLD_DIAMOND },
        { kind: "text", value: BARBER_DASHBOARD_GOLD_LINE },
        {
          kind: "text",
          value:
            "خدمة كبار السن والمرضى وذوي الاحتياجات (محل/منزل): تحكم كامل بعد التفعيل من لوحة التحكم — السعر المعروض، إظهار أو إخفاء الخدمة للعملاء، تقييد أيام الإعلان أو تركها مرنة، وملاحظة للعميل",
        },
      ],
    },
    {
      name: "ماسي",
      price: "200",
      period: "ر.س / حزمة برمجية",
      color: "bg-gradient-to-br from-primary to-cyan-600",
      features: [
        { kind: "map_hero" },
        { kind: "text", value: RATING_QR_PLAN_LINE },
        { kind: "text", value: "كل مميزات الذهبي" },
        { kind: "text", value: "شارة ماسية مميزة" },
        { kind: "text", value: "إدارة صور المحل والبنر من لوحة التحكم بعد التفعيل" },
        { kind: "text", value: "جدول أسبوعي لأوقات العمل من لوحة التحكم (كل يوم على حدة)" },
        { kind: "text", value: "أولوية قصوى في الظهور" },
        { kind: "text", value: BARBER_DASHBOARD_DIAMOND_PORTAL_LINE },
        { kind: "text", value: BARBER_DIAMOND_APPOINTMENTS_FROM_DASHBOARD_LINE },
        { kind: "text", value: "ترجمة تلقائية في الشات" },
        { kind: "text", value: "شات خاص لكل عميل مع ترجمة ذكية فورية للطرفين وانتهاء تلقائي بعد 60 دقيقة" },
        {
          kind: "text",
          value:
            "التنبيه على معالجة الترجمة: تُعرض بين المستخدم والصالون كمزوّد خدمة وفق سياسة الخصوصية — ليست ترجمة رسمية أو استشارة",
        },
        { kind: "text", value: "دعم فني مخصص 24/7" },
      ],
    },
  ];

  const paymentMethods = [
    {
      title: "شراء الحزمة البرمجية الرقمية (بوابة ميسر Moyasar)",
      description:
        "الطريقة المتاحة لشراء الحزم البرمجية الحالية: دفع لمرة واحدة عبر بوابة ميسر (Moyasar) المعتمدة وفق الأنظمة المعمول بها في المملكة — برونزي 100 ر.س، ذهبي 150 ر.س، ماسي 200 ر.س — لمدة 30 يوماً لكل حزمة، دون تجديد تلقائي أو خصم دوري.",
      icon: CheckCircle2,
      benefits: [
        "دفع لمرة واحدة مقابل حزمة برمجية شهرية (30 يوماً) — برونزي 100 · ذهبي 150 · ماسي 200 ر.س — كما في جدول الباقات أعلاه",
        "لا يخزن الموقع رقم البطاقة أو رمز الأمان — تتم المعالجة لدى مزود الدفع المعتمد",
        "إيصال إلكتروني وإشعار بريد بعد إتمام الدفع",
        "تفعيل تلقائي عبر نظام الرصد الذكي بعد نجاح الدفع ومعالجة الويب هوك",
      ],
    },
  ];

  const cancellationSteps = [
    {
      step: "1",
      title: "انتهاء صلاحية الحزمة البرمجية",
      description: "تنتهي صلاحية الإدراج تلقائياً في تاريخ انتهاء الحزمة البرمجية المدفوع مسبقاً دون تجديد تلقائي",
    },
    {
      step: "2",
      title: "شراء حزمة برمجية جديدة",
      description: "يمكن شراء حزمة برمجية جديدة أو استرداد كود تفعيل لمدة إضافية وفق المنتج المعروض",
    },
    {
      step: "3",
      title: "طلب إيقاف مبكر",
      description: "لطلبات خاصة بالإيقاف أو الحذف، تواصل مع الدعم — لا يترتب استرداد مالي بعد تفعيل الحزمة البرمجية",
    },
    {
      step: "4",
      title: "إخفاء من نظام الرصد الذكي",
      description: "بعد انتهاء الصلاحية يُخفى المحل من نتائج البحث حتى تجديد الحزمة البرمجية",
    },
  ];

  const refundPolicy = [
    {
      condition: "قبل تفعيل كود الحزمة البرمجية",
      refund: "مراجعة إدارية حسب الحالة",
      icon: AlertCircle,
      color: "text-yellow-500",
    },
    {
      condition: "بعد تفعيل الحزمة البرمجية",
      refund: "غير قابل للإلغاء أو الاسترداد",
      icon: XCircle,
      color: "text-red-500",
    },
    {
      condition: "خلل تقني بعد الدفع",
      refund: "استرداد كامل أو تفعيل يدوي",
      icon: CheckCircle2,
      color: "text-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <motion.div
        className="container mx-auto max-w-6xl"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            سياسة الحزم البرمجية الرقمية للإدراج البرمجي
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
            شروط شراء حزم الإدراج البرمجية
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            نلتزم بالشفافية الكاملة في بيع الحزم البرمجية الرقمية مسبقة الدفع. اقرأ هذه السياسة بعناية قبل الشراء أو التسجيل.
          </p>
        </motion.div>

        <motion.section variants={staggerItem} className="mb-16">
          <Card className="max-w-4xl mx-auto border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-xl text-center">طبيعة الخدمة والمنتج الرقمي</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                تُقرّ المنشأة المستفيدة (صالون الحلاقة) بأن المنتج المشترى عبر المنصة هو (حزمة برمجية لخدمات إدراج برمجية
                موحدة) على نظام الرصد الذكي التفاعلي لمنصة (حلاق ماب). هذا المنتج هو مساحة برمجية مخصصة ومطورة لعرض البيانات
                الجغرافية والمعلومات التشغيلية للصالون، وتحديثها تقنيًا لربطه وإدراج بياناته للباحثين في محيطه الجغرافي.
                تُعد هذه الحزم البرمجية منتجات رقمية مسبقة الدفع وغير قابلة للإلغاء أو الاسترداد بعد التفعيل، ولا تُعد هذه
                الخدمة بأي حال من الأحوال وساطة مالية أو تجارية أو تقديم خدمات حجز بالعمولة.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">أنواع باقات الحزم البرمجية والأسعار</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {subscriptionTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                variants={fadeInUp}
                transition={{ ...springPresets.gentle, delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
                  <div className={`absolute top-0 left-0 right-0 h-2 ${tier.color}`} />
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-primary">{tier.price}</span>
                      <span className="text-muted-foreground">ريال</span>
                    </div>
                    <CardDescription>{tier.period}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 list-none p-0 m-0">
                      {tier.features.map((feature, idx) =>
                        feature.kind === "map_hero" ? (
                          <li key={idx} className="mb-1 list-none">
                            <div className="rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/18 via-primary/[0.06] to-cyan-500/12 p-3 shadow-md shadow-primary/15">
                              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-3 sm:text-right">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan-600 text-white shadow-md ring-2 ring-primary/15">
                                  <MapPin className="h-6 w-6" strokeWidth={2.25} aria-hidden />
                                </div>
                                <div className="min-w-0 flex-1 space-y-0.5 text-center sm:text-right">
                                  <p className="text-sm font-bold text-foreground leading-snug">
                                    {MAP_FEATURE_HERO.title}
                                  </p>
                                  <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                                    {MAP_FEATURE_HERO.subtitle}
                                  </p>
                                </div>
                                <CheckCircle2
                                  className="h-5 w-5 shrink-0 text-primary"
                                  aria-label="مشمول"
                                />
                              </div>
                            </div>
                          </li>
                        ) : (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">{feature.value}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">طرق الدفع المتاحة</h2>
          <div className="max-w-2xl mx-auto">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={method.title}
                variants={fadeInUp}
                transition={{ ...springPresets.gentle, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <method.icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{method.title}</CardTitle>
                    </div>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {method.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-bold mb-4 text-center">عدم التجديد التلقائي</h2>
          <Card className="max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">دفع لمرة واحدة فقط</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      لا يوجد تجديد تلقائي شهري ولا خصم دوري من بطاقتك. كل عملية شراء تمثل حزمةً برمجية رقمياً مسبق الدفع بمدة
                      محددة.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">انتهاء الصلاحية</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      عند انتهاء مدة الحزمة البرمجية تتوقف صلاحية الإدراج عبر نظام الرصد الذكي حتى شراء حزمة برمجية جديدة أو استرداد كود تفعيل.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">انتهاء الحزمة البرمجية وإعادة الشراء</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cancellationSteps.map((item, index) => (
              <motion.div
                key={item.step}
                variants={fadeInUp}
                transition={{ ...springPresets.gentle, delay: index * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-primary">{item.step}</span>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">سياسة استرداد الأموال</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {refundPolicy.map((policy, index) => (
              <motion.div
                key={policy.condition}
                variants={fadeInUp}
                transition={{ ...springPresets.gentle, delay: index * 0.1 }}
              >
                <Card className="text-center h-full">
                  <CardHeader>
                    <policy.icon className={`w-12 h-12 mx-auto mb-3 ${policy.color}`} />
                    <CardTitle className="text-lg">{policy.condition}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-base px-4 py-1">
                      {policy.refund}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card className="mt-8 max-w-3xl mx-auto bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                <strong>ملاحظة هامة:</strong> الحزم البرمجية الرقمية مسبقة الدفع غير قابلة للإلغاء أو الاسترداد بعد تفعيل كود الحزمة البرمجية.
              </p>
            </CardContent>
          </Card>
          <Card className="mt-8 max-w-3xl mx-auto border-primary/25">
            <CardHeader>
              <CardTitle className="text-lg text-center">استرداد في حال خلل تقني بعد نجاح الدفع</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                في حال نجاح عملية الدفع وعدم تفعيل الحزمة البرمجية أو كود التفعيل بسبب خلل فني، يلتزم الموقع بمعالجة الطلب وإعادة
                كامل المبلغ للحساب المصدر خلال 7 إلى 14 يوم عمل، ما لم يفضل المشتري تفعيل الحزمة البرمجية يدوياً عبر التواصل مع
                الدعم الفني.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">تعليق الحساب عند عدم الدفع</h2>
          <Card className="max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    التعليق المؤقت (7 أيام)
                  </h3>
                  <p className="text-sm text-muted-foreground pr-7">
                    عند فشل الدفع، يتم تعليق الحساب مؤقتاً مع إخفاء البطاقة من نتائج البحث. يمكنك تحديث طريقة الدفع خلال هذه الفترة لاستعادة الخدمة.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    الإلغاء النهائي (بعد 7 أيام)
                  </h3>
                  <p className="text-sm text-muted-foreground pr-7">
                    إذا لم يُجدَّد الحزمة البرمجية بعد انتهاء الصلاحية، تتوقف خدمة الإدراج عبر نظام الرصد الذكي دون حذف تلقائي للبيانات إلا وفق طلب صريح.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    إعادة التفعيل
                  </h3>
                  <p className="text-sm text-muted-foreground pr-7">
                    يمكنك إعادة تفعيل الحساب في أي وقت بعد الإلغاء من خلال التسجيل مجدداً واختيار الباقة المناسبة.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">تعديل الباقة</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                  <CardTitle>الترقية إلى باقة أعلى</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  يمكنك الترقية في أي وقت. سيتم احتساب الفرق بشكل تناسبي للفترة المتبقية.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>تفعيل فوري للمميزات الجديدة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>دفع الفرق فقط للفترة المتبقية</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>لا توجد رسوم إضافية</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                  </div>
                  <CardTitle>التخفيض إلى باقة أقل</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  يمكنك التخفيض في نهاية الفترة الحالية. لن يتم استرداد الفرق للفترة المدفوعة.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>التطبيق في بداية الفترة القادمة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>الاحتفاظ بالمميزات حتى نهاية الفترة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>إشعار قبل التطبيق بـ3 أيام</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">التوضيح الضريبي وأمن المدفوعات</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">التوضيح الضريبي (ضريبة القيمة المضافة)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                  جميع قيم الحزم البرمجية الرقمية الموضحة هي مبالغ نهائية، ولا يتم تحصيل ضريبة قيمة مضافة (VAT) حالياً نظراً
                  لعدم وصول المؤسسة للحد الإلزامي للتسجيل الضريبي.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">أمن المدفوعات وبوابة الدفع</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                  يتم معالجة جميع المدفوعات عبر مزود خدمة دفع مرخص من البنك المركزي السعودي (SAMA)، ولا يقوم الموقع
                  بتخزين بيانات البطاقات الائتمانية لديه.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">الشروط والأحكام العامة</h2>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm">
                    تحتفظ منصة حلاق ماب بالحق في تعديل الأسعار والباقات مع إشعار مسبق لمدة 30 يوماً.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm">
                    يجب على الحلاق الالتزام بمعايير الجودة والاحترافية. قد يتم تعليق الحساب في حالة المخالفات.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm">
                    المنصة غير مسؤولة عن جودة الخدمات المقدمة من الحلاقين. العلاقة التعاقدية مباشرة بين الحلاق والعميل.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">4</span>
                  </div>
                  <p className="text-sm">
                    يشترط التأشير على تعهد المشترك بأن منشأته ممتثلة لاشتراطات الجهات ذات العلاقة لممارسة نشاط الحلاقة بشكل
                    رسمي، وأنه يتحمل كامل المسؤولية النظامية عن صحة هذا التعهد. تتم مراجعة هذا التعهد تقنياً، وتُرسل
                    تنبيهات تقنية عند رصد مخالفات أو تجاوزات في المعلومات المقدمة أو الصور أو محتوى الشات الكتابي،
                    ويجوز للمنصة رفض الطلب أو إيقاف الحزمة البرمجية فوراً وفق السياسة المعتمدة.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">5</span>
                  </div>
                  <p className="text-sm">
                    في حالة النزاعات، يتم الرجوع إلى الأنظمة واللوائح المعمول بها في المملكة العربية السعودية.
                  </p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem}>
          <h2 className="text-3xl font-bold mb-8 text-center">الدعم الفني والشكاوى</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">الهاتف</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">متاح من 10 صباحاً - 5 مساءً</p>
                <a href={`tel:+${PARTNER_SUPPORT_PHONE_E164}`} className="text-primary hover:underline font-medium">
                  +{PARTNER_SUPPORT_PHONE_E164}
                </a>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">واتساب</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">رد فوري خلال دقائق</p>
                <a
                  href={PARTNER_SUPPORT_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  راسلنا على واتساب
                </a>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">البريد الإلكتروني</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">رد خلال 24 ساعة</p>
                <a href={`mailto:${PARTNER_SUPPORT_EMAIL}`} className="text-primary hover:underline font-medium">
                  {PARTNER_SUPPORT_EMAIL}
                </a>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <motion.div variants={fadeInUp} className="mt-16 text-center space-y-6">
          <Card className="max-w-2xl mx-auto border-border/80">
            <CardHeader>
              <CardTitle className="text-base">البيانات التجارية للمنشأة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{LEGAL_TRADE_NAME_AR}</p>
              <p>
                الرقم الوطني الموحد للمنشأة:{' '}
                <span dir="ltr" className="font-mono">
                  {LEGAL_NATIONAL_UNIFIED_NUMBER}
                </span>
              </p>
              {commercialReg ? (
                <p>
                  رقم السجل التجاري: <span dir="ltr">{commercialReg}</span>
                </p>
              ) : null}
            </CardContent>
          </Card>
          <Card className="max-w-2xl mx-auto bg-muted/30">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                آخر تحديث: 4 مايو 2026 | جميع الحقوق محفوظة © 2026 حلاق ماب
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}