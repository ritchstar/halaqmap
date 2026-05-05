import { motion } from "framer-motion";
import { Shield, Lock, FileCheck, Database, Bell, Mail, Scale, CreditCard } from "lucide-react";
import {
  LEGAL_TRADE_NAME_AR,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
  PARTNER_SUPPORT_EMAIL,
  PARTNER_SUPPORT_PHONE_E164,
  PARTNER_SUPPORT_WHATSAPP_URL,
  getLegalCommercialRegistrationDisplay,
} from "@/config/partnerLegal";

export default function PartnerPrivacy() {
  const commercialReg = getLegalCommercialRegistrationDisplay();
  const sections = [
    {
      icon: Shield,
      title: "نطاق هذه السياسة",
      content:
        "هذه السياسة مخصصة للشركاء (الحلاقين/الصالونات) المتقدمين عبر مسار الشركاء. توضح كيف نجمع بيانات طلب الاشتراك، وكيف نستخدمها ونحميها ضمن إجراءات الاعتماد والتشغيل على المنصة.",
    },
    {
      icon: Scale,
      title: "الامتثال لنظام حماية البيانات الشخصية والجهة الرقابية",
      content:
        "تُعالَج بيانات الشركاء وفق **نظام حماية البيانات الشخصية** في المملكة العربية السعودية والإرشادات ذات الصلة من **هيئة حماية البيانات الشخصية** (الهيئة السعودية للبيانات والذكاء الاصطناعي «سدايا»).\n\n" +
        "- **مبدأ التقليل:** نقتصر على **الحد الأدنى** من البيانات اللازمة لمراجعة الاشتراك وتشغيل الخدمة والامتثال.\n" +
        "- **حقوق أصحاب البيانات:** يمكن للشريك طلب الاطلاع أو التصحيح أو الحذف ضمن ما يسمح به النظام وطبيعة التشغيل، عبر قنوات التواصل أدناه أو المسارات المعتمدة في لوحة التحكم حسب الباقة.\n" +
        "- **الشكوى للجهة:** يحق تقديم شكوى إلى هيئة حماية البيانات الشخصية عبر: https://dgp.sdaia.gov.sa/\n" +
        "- **المعالجون التقنيون (أمثلة):** مزود البنية السحابية لقاعدة البيانات والتخزين (Supabase)، واستضافة الواجهة والدوال (Vercel)، و**بوابة الدفع ميسر (Moyasar)** لمعالجة المدفوعات الإلكترونية، وقد يُستخدم مزود بريد إلكتروني لتشغيل إشعارات الترحيب أو التشغيل عند تفعيل الخدمة — دون بيع بياناتك لجهات تسويقية.\n" +
        "- **منطقة التخزين وسيادة البيانات:** يُضبَط مشروع **Supabase** لاستخدام منطقة **الشرق الأوسط على AWS** المعروضة في لوحة المشروع (مثل **الرياض me-central-1** أو ما يعادلها من مراكز المنطقة مثل **جدة** عند توفرها كخيار للمشروع)، لتقليل إخراج البيانات عن نطاق جغرافي مقارب للمملكة قدر الإمكان. قد تبقى بعض الخدمات المساعدة (مثل استضافة الواجهة أو الدوال) وفق مراكز المزود وعقوده — يُرجى طلب توضيح إضافي عبر الدعم عند الحاجة.\n\n" +
        "النصوص التفصيلية الرسمية تُحدَّث من الجهة؛ يُنصح بمراجعة بوابة الهيئة دورياً.",
    },
    {
      icon: Database,
      title: "البيانات التي نجمعها من الشريك",
      content:
        "- بيانات النشاط: اسم الصالون، وسائل التواصل، العنوان والإحداثيات.\n- بيانات التشغيل: جدول العمل، الخدمات والأسعار، صور المحل والبنر.\n- إعدادات خدمة كبار السن والمرضى وذوي الاحتياجات (للذهبي/الماسي): السعر المعروض، إظهار أو إخفاء الخدمة للعملاء، أيام الإعلان، وملاحظة للعميل — عند حفظها من لوحة التحكم.\n- التعهد النظامي عند التسجيل: التأشير على تعهد المشترك بأن منشأته مرخصة من الجهات ذات العلاقة لممارسة نشاط الحلاقة بشكل رسمي، مع تحمّله مسؤولية صحة هذا التعهد.\n- بيانات الاشتراك والدفع: طريقة الدفع وإيصال التحويل (عند التحويل البنكي)، ومُعرّفات المعاملة عند الدفع بالبطاقة عبر بوابة ميسر.\n- بيانات الإسناد التسويقي: UTM ومُعرّفات النقر (عند توفرها) لتحليل أداء الحملات.",
    },
    {
      icon: CreditCard,
      title: "مشاركة البيانات مع بوابة الدفع (طرف ثالث)",
      content:
        "نحن نشارك بيانات الدفع الضرورية فقط مع بوابة الدفع (Moyasar) لإتمام المعاملات المالية والتحقق من عمليات الاحتيال.\n\nلا تُخزَّن بيانات البطاقة الائتمانية كاملة لدى حلاق ماب؛ تتم معالجة الدفع وفق أمن وشروط مزود الخدمة المعتمد.",
    },
    {
      icon: FileCheck,
      title: "كيف نستخدم بيانات الشريك",
      content:
        "- مراجعة الطلب والتحقق من أهليته قبل الاعتماد.\n- إنشاء وإدارة ملف الصالون ولوحة التحكم بعد التفعيل.\n- تشغيل الميزات المتفق عليها حسب الباقة (ظهور، بنر، شات، تقييمات، إلخ).\n- في الباقة الماسية: معالجة **ترجمة آلية** لمحتوى الشات الكتابي **بين العميل والصالون** كمزوّد خدمة — تُنفَّذ وفق سياسة الخصوصية وبحد أدنى للاحتفاظ اللازم للتشغيل والأمان؛ الترجمة تسهّل الفهم فقط وليست وثيقة رسمية.\n- الامتثال القانوني وحماية المنصة من الاحتيال أو إساءة الاستخدام.\n- قياس الأداء التسويقي وتحسين جودة الاستقطاب (دون بيع بياناتك).",
    },
    {
      icon: Lock,
      title: "الحماية والاحتفاظ",
      content:
        "- نقل البيانات عبر اتصالات مشفرة (TLS).\n- تقييد الوصول للبيانات حسب الصلاحيات التشغيلية.\n- **طلب الاشتراك:** قد تُحفظ حقول النموذج (بما فيها **بيان التعهد النظامي** الذي يؤكد الترخيص الرسمي) في سجل الطلب لدى الإدارة للمدة اللازمة للمراجعة والتشغيل والامتثال، دون رفع أو حفظ مرفقات وثائق حكومية إلزامية ضمن هذا المسار.\n- الاحتفاظ بالبيانات للفترة اللازمة للتشغيل أو الالتزام النظامي، مع إمكانية الحذف أو التصحيح وفق المسارات المعتمدة.\n- يحق للشريك طلب تحديث أو تصحيح بياناته عبر قنوات الدعم.",
    },
    {
      icon: Bell,
      title: "التحديثات",
      content:
        "قد نحدث سياسة خصوصية الشركاء عند تغير المتطلبات التنظيمية أو التشغيلية. أي تحديث جوهري يُعلن داخل المنصة أو عبر القنوات المعتمدة للتواصل مع الشريك.",
    },
    {
      icon: Mail,
      title: "الدعم الفني والشكاوى والخصوصية",
      content:
        `للاستفسارات المتعلقة بخصوصية بيانات الشركاء، أو طلبات التصحيح/الحذف ضمن ما يسمح به النظام، أو الشكاوى التشغيلية:\n\n` +
        `**البريد:** ${PARTNER_SUPPORT_EMAIL}\n` +
        `**الهاتف:** +${PARTNER_SUPPORT_PHONE_E164}\n` +
        `**واتساب:** ${PARTNER_SUPPORT_WHATSAPP_URL}`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(13,148,136,0.15),transparent_50%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent">
              سياسة خصوصية الشركاء
            </h1>
            <p className="text-lg text-muted-foreground">
              صفحة مستقلة لخصوصية بيانات الحلاقين والصالونات ضمن مسار الشركاء.
            </p>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-2">{section.title}</h2>
                    <div className="space-y-2">
                      {section.content.split("\n").map((line, i) => (
                        <p key={i} className="text-muted-foreground leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          <div className="rounded-2xl border border-border bg-card p-6 text-right">
            <h2 className="text-lg font-bold mb-3">البيانات التجارية للمنشأة</h2>
            <p className="text-sm font-medium text-foreground mb-2">{LEGAL_TRADE_NAME_AR}</p>
            <p className="text-sm text-muted-foreground mb-2">
              الرقم الوطني الموحد للمنشأة:{' '}
              <span dir="ltr" className="font-mono">
                {LEGAL_NATIONAL_UNIFIED_NUMBER}
              </span>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {commercialReg ? (
                <>
                  رقم السجل التجاري: <span dir="ltr">{commercialReg}</span>
                </>
              ) : (
                <>
                  رقم السجل التجاري: يُعرض عند ضبط{' '}
                  <code className="rounded bg-muted px-1 text-xs" dir="ltr">
                    VITE_LEGAL_COMMERCIAL_REGISTRATION
                  </code>{' '}
                  في بيئة البناء، أو عبر طلب الدعم الفني.
                </>
              )}
            </p>
            <h3 className="text-base font-semibold mb-2">الدعم الفني والشكاوى</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-none p-0 m-0">
              <li>
                بريد:{' '}
                <a href={`mailto:${PARTNER_SUPPORT_EMAIL}`} className="text-primary underline-offset-2 hover:underline">
                  {PARTNER_SUPPORT_EMAIL}
                </a>
              </li>
              <li>
                واتساب:{' '}
                <a
                  href={PARTNER_SUPPORT_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-2 hover:underline"
                  dir="ltr"
                >
                  {PARTNER_SUPPORT_WHATSAPP_URL}
                </a>
              </li>
              <li dir="ltr">
                هاتف:{' '}
                <a href={`tel:+${PARTNER_SUPPORT_PHONE_E164}`} className="text-primary underline-offset-2 hover:underline">
                  +{PARTNER_SUPPORT_PHONE_E164}
                </a>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
            آخر تحديث: 4 مايو 2026
          </div>
        </div>
      </div>
    </div>
  );
}
