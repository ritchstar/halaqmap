import { motion } from "framer-motion";
import { Shield, Lock, FileCheck, Database, Bell, Mail, Phone, Scale } from "lucide-react";

export default function PartnerPrivacy() {
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
        "- **المعالجون التقنيون (أمثلة):** مزود البنية السحابية لقاعدة البيانات والتخزين (Supabase)، واستضافة الواجهة والدوال (Vercel)، وقد يُستخدم مزود بريد إلكتروني لتشغيل إشعارات الترحيب أو التشغيل عند تفعيل الخدمة — دون بيع بياناتك لجهات تسويقية.\n" +
        "- **منطقة التخزين وسيادة البيانات:** يُضبَط مشروع **Supabase** لاستخدام منطقة **الشرق الأوسط على AWS** المعروضة في لوحة المشروع (مثل **الرياض me-central-1** أو ما يعادلها من مراكز المنطقة مثل **جدة** عند توفرها كخيار للمشروع)، لتقليل إخراج البيانات عن نطاق جغرافي مقارب للمملكة قدر الإمكان. قد تبقى بعض الخدمات المساعدة (مثل استضافة الواجهة أو الدوال) وفق مراكز المزود وعقوده — يُرجى طلب توضيح إضافي عبر الدعم عند الحاجة.\n\n" +
        "النصوص التفصيلية الرسمية تُحدَّث من الجهة؛ يُنصح بمراجعة بوابة الهيئة دورياً.",
    },
    {
      icon: Database,
      title: "البيانات التي نجمعها من الشريك",
      content:
        "- بيانات النشاط: اسم الصالون، وسائل التواصل، العنوان والإحداثيات.\n- بيانات التشغيل: جدول العمل، الخدمات والأسعار، صور المحل والبنر.\n- المستندات النظامية: السجل التجاري، الرخصة البلدية، الشهادات الصحية.\n- بيانات الاشتراك والدفع: طريقة الدفع وإيصال التحويل (عند التحويل البنكي).\n- بيانات الإسناد التسويقي: UTM ومُعرّفات النقر (عند توفرها) لتحليل أداء الحملات.",
    },
    {
      icon: FileCheck,
      title: "كيف نستخدم بيانات الشريك",
      content:
        "- مراجعة الطلب والتحقق من أهليته قبل الاعتماد.\n- إنشاء وإدارة ملف الصالون ولوحة التحكم بعد التفعيل.\n- تشغيل الميزات المتفق عليها حسب الباقة (ظهور، بنر، شات، تقييمات، إلخ).\n- الامتثال القانوني وحماية المنصة من الاحتيال أو إساءة الاستخدام.\n- قياس الأداء التسويقي وتحسين جودة الاستقطاب (دون بيع بياناتك).",
    },
    {
      icon: Lock,
      title: "الحماية والاحتفاظ",
      content:
        "- نقل البيانات عبر اتصالات مشفرة (TLS).\n- تقييد الوصول للبيانات حسب الصلاحيات التشغيلية.\n- الاحتفاظ بالبيانات للفترة اللازمة للتشغيل أو الالتزام النظامي.\n- يحق للشريك طلب تحديث أو تصحيح بياناته عبر قنوات الدعم.",
    },
    {
      icon: Bell,
      title: "التحديثات",
      content:
        "قد نحدث سياسة خصوصية الشركاء عند تغير المتطلبات التنظيمية أو التشغيلية. أي تحديث جوهري يُعلن داخل المنصة أو عبر القنوات المعتمدة للتواصل مع الشريك.",
    },
    {
      icon: Mail,
      title: "التواصل",
      content:
        "لاستفسارات خصوصية الشركاء أو طلبات تعديل البيانات:\n\n**البريد:** admin@halaqmap.com\n**الهاتف:** 0559602685",
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

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
            آخر تحديث: 17 أبريل 2026
          </div>
        </div>
      </div>
    </div>
  );
}
