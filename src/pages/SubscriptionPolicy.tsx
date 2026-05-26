import { motion } from "framer-motion";
import { LegalObserverChat } from "@/components/LegalObserverChat";
import { springPresets, fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { CheckCircle2, XCircle, AlertCircle, Phone, Mail, MessageSquare, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MAP_FEATURE_HERO,
} from "@/config/subscriptionPlanHero";
import { LISTING_LICENSE_LEGAL_FOOTNOTE } from "@/config/listingLicenseCards";
import {
  SUBSCRIPTION_POLICY_EXPIRY,
  SUBSCRIPTION_POLICY_PACKAGE_RENEWAL,
  SUBSCRIPTION_POLICY_TIERS,
  SUBSCRIPTION_POLICY_TIERS_INTRO,
} from "@/config/subscriptionPolicyTiers";
import {
  LEGAL_TRADE_NAME_AR,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
  PARTNER_SUPPORT_EMAIL,
  PARTNER_SUPPORT_PHONE_E164,
  PARTNER_SUPPORT_WHATSAPP_URL,
  getLegalCommercialRegistrationDisplay,
} from "@/config/partnerLegal";
import { HonorBoard } from "@/components/b2b/HonorBoard";
import { PlatformIdentityCard } from "@/components/PlatformIdentityCard";
import {
  PLATFORM_IDENTITY_LEGAL_DISCLAIMER_AR,
} from "@/config/platformIdentity";


export default function SubscriptionPolicy() {
  const commercialReg = getLegalCommercialRegistrationDisplay();
  const subscriptionTiers = SUBSCRIPTION_POLICY_TIERS;

  const paymentMethods = [
    {
      title: "شراء حزمة رخصة النفاذ الرقمية (بوابة ميسر Moyasar)",
      description:
        "الطريقة المتاحة لشراء حزم الرخصة الحالية: دفع لمرة واحدة عبر بوابة ميسر (Moyasar) المعتمدة وفق الأنظمة المعمول بها في المملكة — برونزي 100 ر.س، ذهبي 150 ر.س، ماسي 200 ر.س — لمدة 30 يوماً لكل حزمة، دون تجديد تلقائي أو خصم دوري. للماسية: إضافة «المناوب الرقمي الذكي» إضافة برمجية متقدمة (Add-on) اختيارية +25 ر.س/حزمة — منفصلة عن الرخصة التقنية.",
      icon: CheckCircle2,
      benefits: [
        "دفع لمرة واحدة مقابل حزمة رخصة شهرية (30 يوماً) — برونزي 100 · ذهبي 150 · ماسي 200 ر.س — كما في جدول الباقات أعلاه",
        "لا يخزن الموقع رقم البطاقة أو رمز الأمان — تتم المعالجة لدى مزود الدفع المعتمد",
        "إيصال إلكتروني وإشعار بريد بعد إتمام الدفع",
        "تفعيل تلقائي عبر نظام الرصد الذكي بعد نجاح الدفع ومعالجة الويب هوك",
      ],
    },
  ];

  const cancellationSteps = [
    {
      step: "1",
      title: "انتهاء صلاحية حزمة الرخصة",
      description: "تنتهي صلاحية الإدراج تلقائياً في تاريخ انتهاء حزمة الرخصة المدفوع مسبقاً دون تجديد تلقائي",
    },
    {
      step: "2",
      title: "شراء حزمة رخصة جديدة",
      description: "يمكن شراء حزمة رخصة جديدة أو استرداد كود تفعيل لمدة إضافية وفق المنتج المعروض",
    },
    {
      step: "3",
      title: "طلب إيقاف مبكر",
      description: "لطلبات خاصة بالإيقاف أو الحذف، تواصل مع الدعم — لا يترتب استرداد مالي بعد تفعيل حزمة الرخصة",
    },
    {
      step: "4",
      title: "إخفاء من نظام الرصد الذكي",
      description: "بعد انتهاء الصلاحية يُخفى المحل من نتائج البحث حتى تجديد حزمة الرخصة",
    },
  ];

  const refundPolicy = [
    {
      condition: "قبل تفعيل كود حزمة الرخصة",
      refund: "مراجعة إدارية حسب الحالة",
      icon: AlertCircle,
      color: "text-yellow-500",
    },
    {
      condition: "بعد تفعيل حزمة الرخصة",
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
    <div className="min-h-screen bg-background">
      {/* هيرو تكتيكي */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(20,184,166,0.12),transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-background" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
            ✦ سياسة رخصة النفاذ الرقمية
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent">
            شروط شراء حزم رخصة النفاذ الرقمية
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            نلتزم بالشفافية الكاملة في بيع حزم الرخصة الرقمية مسبقة الدفع. اقرأ هذه السياسة بعناية قبل الشراء أو التسجيل.
          </p>
          <p className="mt-4 text-sm font-semibold text-primary/90 max-w-2xl mx-auto">
            قبل الشراء — استشر الناظر القانوني ⚖️
          </p>
          <div className="mt-8 mx-auto h-px max-w-xs bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="mt-8 max-w-3xl mx-auto text-right">
            <LegalObserverChat page="سياسة الاشتراك" />
          </div>
        </div>
      </div>

      <div className="py-8 px-4">
      <motion.div
        className="container mx-auto max-w-6xl"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp} className="text-center mb-12">
        </motion.div>

        <motion.section variants={staggerItem} className="mb-12">
          <div className="max-w-4xl mx-auto">
            <PlatformIdentityCard />
          </div>
        </motion.section>

        <motion.section variants={staggerItem} className="mb-16">
          <Card className="max-w-4xl mx-auto border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-xl text-center">طبيعة الخدمة والمنتج الرقمي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                تُقرّ المنشأة المستفيدة (صالون الحلاقة) بأن المنتج المشترى عبر المنصة هو (حزمة رخصة لخدمات إدراج برمجية
                موحدة) على نظام الرصد الذكي التفاعلي لمنصة (حلاق ماب). هذا المنتج هو مساحة برمجية مخصصة ومطورة لعرض البيانات
                الجغرافية والمعلومات التشغيلية للصالون، وتحديثها تقنيًا لربطه وإدراج بياناته للباحثين في محيطه الجغرافي.
                تُعد هذه حزم الرخصة منتجات رقمية مسبقة الدفع وغير قابلة للإلغاء أو الاسترداد بعد التفعيل.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                {PLATFORM_IDENTITY_LEGAL_DISCLAIMER_AR}
              </p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-black mb-4 text-center text-white">أنواع باقات حزم رخصة النفاذ والأسعار</h2>
          <p className="text-sm text-muted-foreground text-center max-w-3xl mx-auto mb-8 leading-relaxed">
            {SUBSCRIPTION_POLICY_TIERS_INTRO}
          </p>
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
                      <span className="text-4xl font-bold text-primary">{tier.priceSar}</span>
                      <span className="text-muted-foreground">ريال</span>
                    </div>
                    <CardDescription>{tier.periodLabelAr}</CardDescription>
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
          <Card className="mt-8 max-w-4xl mx-auto border-primary/20 bg-muted/30">
            <CardContent className="pt-6">
              <p className="text-xs leading-relaxed text-muted-foreground text-justify">{LISTING_LICENSE_LEGAL_FOOTNOTE}</p>
            </CardContent>
          </Card>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-black mb-8 text-center text-white">طرق الدفع المتاحة</h2>
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
          <h2 className="text-3xl font-black mb-4 text-center text-white">عدم التجديد التلقائي</h2>
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
                      عند انتهاء مدة حزمة رخصة النفاذ تتوقف صلاحية الاستجابة البرمجية ضمن نظام الاستجابة الذكية حتى شراء حزمة جديدة أو استرداد كود تفعيل.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-black mb-8 text-center text-white">انتهاء حزمة رخصة النفاذ وإعادة الشراء</h2>
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
          <h2 className="text-3xl font-black mb-8 text-center text-white">سياسة استرداد الأموال</h2>
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
                <strong>ملاحظة هامة:</strong> حزم الرخصة الرقمية مسبقة الدفع غير قابلة للإلغاء أو الاسترداد بعد تفعيل كود حزمة الرخصة.
              </p>
            </CardContent>
          </Card>
          <Card className="mt-8 max-w-3xl mx-auto border-primary/25">
            <CardHeader>
              <CardTitle className="text-lg text-center">استرداد في حال خلل تقني بعد نجاح الدفع</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                في حال نجاح عملية الدفع وعدم تفعيل حزمة الرخصة أو كود التفعيل بسبب خلل فني، يلتزم الموقع بمعالجة الطلب وإعادة
                كامل المبلغ للحساب المصدر خلال 7 إلى 14 يوم عمل، ما لم يفضل المشتري تفعيل حزمة الرخصة يدوياً عبر التواصل مع
                الدعم الفني.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-black mb-8 text-center text-white">{SUBSCRIPTION_POLICY_EXPIRY.title}</h2>
          <Card className="max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {SUBSCRIPTION_POLICY_EXPIRY.items.map((item, idx) => (
                  <div key={item.title}>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      {idx === 0 ? (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      ) : idx === 1 ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground pr-7">{item.body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-black mb-4 text-center text-white">{SUBSCRIPTION_POLICY_PACKAGE_RENEWAL.title}</h2>
          <p className="text-sm text-muted-foreground text-center max-w-3xl mx-auto mb-8 leading-relaxed">
            {SUBSCRIPTION_POLICY_PACKAGE_RENEWAL.lead}
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {SUBSCRIPTION_POLICY_PACKAGE_RENEWAL.items.map((item) => (
              <Card key={item.title} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        <Separator className="my-16" />

        <motion.section variants={staggerItem} className="mb-16">
          <h2 className="text-3xl font-black mb-8 text-center text-white">التوضيح الضريبي وأمن المدفوعات</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">التوضيح الضريبي (ضريبة القيمة المضافة)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                  جميع قيم حزم الرخصة الرقمية الموضحة هي مبالغ نهائية، ولا يتم تحصيل ضريبة قيمة مضافة (VAT) حالياً نظراً
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
          <h2 className="text-3xl font-black mb-8 text-center text-white">الشروط والأحكام العامة</h2>
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
                    ويجوز للمنصة رفض الطلب أو إيقاف حزمة الرخصة فوراً وفق السياسة المعتمدة.
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

        {/* ══ الدعم الفني — تصميم تقني متوهج ══ */}
        <motion.section variants={staggerItem} className="relative overflow-hidden rounded-3xl" dir="rtl"
          style={{
            background: 'linear-gradient(160deg,#040d1a 0%,#020810 50%,#040d1a 100%)',
            border: '1px solid rgba(20,184,166,0.14)',
          }}
        >
          {/* إضاءة يمين ويسار — عرض تقني */}
          <div className="pointer-events-none absolute inset-0">
            {/* يمين */}
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-teal-500/14 blur-[100px]" />
            <div className="absolute bottom-0 right-0 h-48 w-64 rounded-full bg-cyan-400/10 blur-[70px]" />
            {/* يسار */}
            <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-violet-500/14 blur-[100px]" />
            <div className="absolute bottom-0 left-0 h-48 w-64 rounded-full bg-indigo-400/10 blur-[70px]" />
            {/* وسط علوي */}
            <div className="absolute top-0 left-1/2 h-32 w-96 -translate-x-1/2 rounded-full bg-teal-400/6 blur-[80px]" />
            {/* خط مسح متحرك */}
            <motion.div
              className="absolute inset-y-0 w-[30%] opacity-40"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(20,184,166,0.06),transparent)' }}
              animate={{ x: ['-100%', '450%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
            />
            {/* نقاط شبكية خلفية */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'radial-gradient(circle,rgba(20,184,166,1) 1px,transparent 1px)', backgroundSize: '32px 32px' }}
            />
          </div>

          <div className="relative px-8 py-12">
            {/* الرأسية */}
            <div className="mb-10 text-center">
              <motion.div
                variants={fadeInUp}
                className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-teal-300"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
                </span>
                قنوات الدعم · متاحة الآن
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                className="text-3xl font-black text-white md:text-4xl"
                style={{ textShadow: '0 0 40px rgba(20,184,166,0.25)' }}
              >
                طرق الدعم المتاحة
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-2 text-sm text-slate-400">
                فريق حلاق ماب جاهز عبر ثلاث قنوات — اختر الأنسب لك
              </motion.p>
            </div>

            {/* الكروت */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                {
                  icon: Phone,
                  label: 'الهاتف',
                  badge: '10 ص – 5 م',
                  value: `+${PARTNER_SUPPORT_PHONE_E164}`,
                  href: `tel:+${PARTNER_SUPPORT_PHONE_E164}`,
                  accentFrom: '#0f766e', accentTo: '#14b8a6',
                  border: 'rgba(20,184,166,0.35)', glow: 'rgba(20,184,166,0.20)',
                  desc: 'تحدّث مباشرة مع فريق الدعم',
                },
                {
                  icon: MessageSquare,
                  label: 'واتساب',
                  badge: 'رد فوري',
                  value: 'راسلنا على واتساب',
                  href: PARTNER_SUPPORT_WHATSAPP_URL,
                  accentFrom: '#166534', accentTo: '#22c55e',
                  border: 'rgba(34,197,94,0.35)', glow: 'rgba(34,197,94,0.20)',
                  desc: 'أسرع قناة — رد خلال دقائق',
                  external: true,
                },
                {
                  icon: Mail,
                  label: 'البريد الإلكتروني',
                  badge: 'خلال 24 ساعة',
                  value: PARTNER_SUPPORT_EMAIL,
                  href: `mailto:${PARTNER_SUPPORT_EMAIL}`,
                  accentFrom: '#1e1b4b', accentTo: '#818cf8',
                  border: 'rgba(129,140,248,0.35)', glow: 'rgba(129,140,248,0.20)',
                  desc: 'للاستفسارات التفصيلية والوثائق',
                },
              ].map((ch, i) => (
                <motion.a
                  key={ch.label}
                  href={ch.href}
                  target={ch.external ? '_blank' : undefined}
                  rel={ch.external ? 'noopener noreferrer' : undefined}
                  variants={fadeInUp}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl p-6 text-center no-underline transition-all duration-300"
                  style={{
                    border: `1px solid ${ch.border}`,
                    background: `linear-gradient(155deg,${ch.accentFrom}22 0%,#040d1a 55%,${ch.accentTo}10 100%)`,
                    boxShadow: `0 0 30px ${ch.glow},inset 0 1px 0 ${ch.border}`,
                  }}
                >
                  {/* توهج hover */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: `radial-gradient(ellipse 80% 80% at 50% 50%,${ch.accentTo}12,transparent)` }}
                  />

                  {/* الأيقونة */}
                  <div
                    className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg,${ch.accentFrom}40,${ch.accentTo}28)`,
                      border: `1px solid ${ch.border}`,
                      boxShadow: `0 0 20px ${ch.glow}`,
                    }}
                  >
                    <ch.icon className="h-6 w-6" style={{ color: ch.accentTo }} />
                    {/* نبض */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{ border: `1px solid ${ch.accentTo}`, opacity: 0 }}
                      animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6 }}
                    />
                  </div>

                  {/* البادج */}
                  <div
                    className="rounded-full px-2.5 py-0.5 text-[0.6rem] font-bold"
                    style={{ background: `${ch.accentTo}20`, color: ch.accentTo, border: `1px solid ${ch.border}` }}
                  >
                    {ch.badge}
                  </div>

                  {/* النص */}
                  <div>
                    <p className="text-base font-black text-white">{ch.label}</p>
                    <p className="mt-0.5 text-[0.7rem] text-slate-400">{ch.desc}</p>
                  </div>

                  {/* القيمة */}
                  <p
                    className="break-all text-sm font-bold transition-colors group-hover:underline"
                    style={{ color: ch.accentTo }}
                  >
                    {ch.value}
                  </p>
                </motion.a>
              ))}
            </div>

            {/* خط تقني سفلي */}
            <div className="mt-10 flex items-center justify-between gap-4">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to right,transparent,rgba(20,184,166,0.25),transparent)' }} />
              <p className="text-[0.65rem] font-bold tracking-widest text-slate-600">HALAQ MAP · SUPPORT NETWORK</p>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to left,transparent,rgba(20,184,166,0.25),transparent)' }} />
            </div>
          </div>
        </motion.section>

        <motion.div variants={fadeInUp} className="mt-16 max-w-4xl mx-auto">
          <HonorBoard context="legal" variant="legal" />
        </motion.div>

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
    </div>
  );
}