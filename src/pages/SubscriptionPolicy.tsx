import { motion } from "framer-motion";
import { springPresets, fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { CheckCircle2, XCircle, AlertCircle, Phone, Mail, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SubscriptionPolicy() {
  const subscriptionTiers = [
    {
      name: "برونزي",
      price: "100",
      period: "شهرياً",
      color: "bg-gradient-to-br from-amber-700 to-amber-900",
      features: [
        "4 صور مصغرة للمحل",
        "عرض الموقع ورقم الهاتف",
        "ظهور في نتائج البحث",
        "تحديث المعلومات الأساسية"
      ]
    },
    {
      name: "ذهبي",
      price: "150",
      period: "شهرياً",
      color: "bg-gradient-to-br from-accent to-yellow-600",
      features: [
        "كل مميزات البرونزي",
        "بنر موسع بصور متعددة",
        "رابط واتساب مباشر",
        "شات مباشر مع العملاء",
        "أولوية في نتائج البحث",
        "إحصائيات المشاهدات"
      ]
    },
    {
      name: "ماسي",
      price: "200",
      period: "شهرياً",
      color: "bg-gradient-to-br from-primary to-cyan-600",
      features: [
        "كل مميزات الذهبي",
        "شارة ماسية مميزة",
        "أولوية قصوى في الظهور",
        "نظام حجز المواعيد",
        "ترجمة تلقائية في الشات",
        "تقييمات ذكية عبر QR Code",
        "دعم فني مخصص 24/7"
      ]
    }
  ];

  const paymentMethods = [
    {
      title: "الاشتراك الشهري",
      description: "دفع شهري متكرر عبر بطاقة الائتمان أو مدى",
      icon: CheckCircle2,
      benefits: [
        "تجديد تلقائي كل شهر",
        "إمكانية الإلغاء في أي وقت",
        "لا توجد رسوم إضافية",
        "فوترة واضحة وشفافة"
      ]
    },
    {
      title: "التحويل البنكي (6 أشهر)",
      description: "دفع مقدم لمدة 6 أشهر مع خصم 10%",
      icon: CheckCircle2,
      benefits: [
        "خصم 10% على الإجمالي",
        "تفعيل فوري بعد التحقق",
        "صالح لمدة 6 أشهر كاملة",
        "إيصال رسمي معتمد"
      ]
    }
  ];

  const cancellationSteps = [
    {
      step: "1",
      title: "تقديم طلب الإلغاء",
      description: "تواصل مع الدعم الفني عبر الواتساب أو البريد الإلكتروني"
    },
    {
      step: "2",
      title: "فترة الإشعار",
      description: "يجب تقديم الطلب قبل 7 أيام من موعد التجديد القادم"
    },
    {
      step: "3",
      title: "تأكيد الإلغاء",
      description: "ستتلقى رسالة تأكيد بإلغاء الاشتراك خلال 24 ساعة"
    },
    {
      step: "4",
      title: "انتهاء الخدمة",
      description: "ستستمر الخدمة حتى نهاية الفترة المدفوعة"
    }
  ];

  const refundPolicy = [
    {
      condition: "خلال 7 أيام من الاشتراك",
      refund: "استرداد كامل 100%",
      icon: CheckCircle2,
      color: "text-green-500"
    },
    {
      condition: "من 8 إلى 14 يوم",
      refund: "استرداد 50%",
      icon: AlertCircle,
      color: "text-yellow-500"
    },
    {
      condition: "بعد 14 يوم",
      refund: "لا يوجد استرداد",
      icon: XCircle,
      color: "text-red-500"
    }
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
            سياسة الاشتراك والإلغاء
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
            شروط وأحكام الاشتراك
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            نلتزم بالشفافية الكاملة في جميع تعاملاتنا المالية. اقرأ سياسة الاشتراك بعناية قبل التسجيل.
          </p>
        </motion.div>

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">أنواع الباقات والأسعار</h2>
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
                    <ul className="space-y-3">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
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
          <h2 className="text-3xl font-bold mb-8 text-center">طرق الدفع المتاحة</h2>
          <div className="grid md:grid-cols-2 gap-6">
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
          <h2 className="text-3xl font-bold mb-4 text-center">التجديد التلقائي</h2>
          <Card className="max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">تجديد تلقائي للاشتراك الشهري</h3>
                    <p className="text-sm text-muted-foreground">
                      يتم تجديد الاشتراك الشهري تلقائياً في نفس التاريخ من كل شهر باستخدام طريقة الدفع المسجلة.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">إشعار قبل التجديد</h3>
                    <p className="text-sm text-muted-foreground">
                      سنرسل لك إشعاراً قبل 3 أيام من موعد التجديد عبر البريد الإلكتروني والواتساب.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">فشل الدفع</h3>
                    <p className="text-sm text-muted-foreground">
                      في حالة فشل الدفع، سيتم تعليق الحساب مؤقتاً لمدة 7 أيام. بعدها سيتم إلغاء الاشتراك تلقائياً.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">إجراءات إلغاء الاشتراك</h2>
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
                <strong>ملاحظة هامة:</strong> سياسة الاسترداد تنطبق فقط على الاشتراك الشهري. التحويلات البنكية لـ6 أشهر غير قابلة للاسترداد بعد التفعيل.
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
                    إذا لم يتم تحديث الدفع خلال 7 أيام، سيتم إلغاء الاشتراك نهائياً وحذف جميع البيانات المرتبطة بالحساب.
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
          <h2 className="text-3xl font-bold mb-8 text-center">الشروط والأحكام العامة</h2>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm">
                    جميع الأسعار المذكورة بالريال السعودي وتشمل ضريبة القيمة المضافة (15%).
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm">
                    تحتفظ منصة حلاق ماب بالحق في تعديل الأسعار والباقات مع إشعار مسبق لمدة 30 يوماً.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm">
                    يجب على الحلاق الالتزام بمعايير الجودة والاحترافية. قد يتم تعليق الحساب في حالة المخالفات.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">4</span>
                  </div>
                  <p className="text-sm">
                    المنصة غير مسؤولة عن جودة الخدمات المقدمة من الحلاقين. العلاقة التعاقدية مباشرة بين الحلاق والعميل.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">5</span>
                  </div>
                  <p className="text-sm">
                    يجب تقديم مستندات صحيحة وسارية المفعول (سجل تجاري، رخصة بلدية). المستندات المزورة تؤدي لإلغاء فوري.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">6</span>
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
          <h2 className="text-3xl font-bold mb-8 text-center">تواصل مع الدعم الفني</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">الهاتف</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">متاح من 9 صباحاً - 11 مساءً</p>
                <a href="tel:+966501234567" className="text-primary hover:underline font-medium">
                  +966 50 123 4567
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
                <a href="https://wa.me/966501234567" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                  راسلنا الآن
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
                <a href="mailto:support@halaqmap.com" className="text-primary hover:underline font-medium">
                  support@halaqmap.com
                </a>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <motion.div variants={fadeInUp} className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-muted/30">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                آخر تحديث: 7 أبريل 2026 | جميع الحقوق محفوظة © 2026 حلاق ماب
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}