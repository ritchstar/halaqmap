import { motion } from "framer-motion";
import { Shield, Lock, Eye, UserCheck, Cookie, Bell, Mail, Phone, Scale, MessageSquare } from "lucide-react";

export default function Privacy() {
  const sections = [
    {
      icon: Shield,
      title: "التزامنا بالخصوصية",
      content: "هذه الصفحة مخصصة لخصوصية مستخدم المنصة (الزائر الباحث عن صالون). في حلاق ماب نلتزم بحماية خصوصيتك وجعل تجربة البحث آمنة وواضحة."
    },
    {
      icon: Scale,
      title: "الامتثال لنظام حماية البيانات الشخصية (السعودية)",
      content:
        "نصمّم تجربة المستخدم وفق مبادئ **نظام حماية البيانات الشخصية** في المملكة العربية السعودية والإرشادات ذات الصلة الصادرة عن **هيئة حماية البيانات الشخصية** التابعة للهيئة السعودية للبيانات والذكاء الاصطناعي «سدايا».\n\n" +
        "- **الشفافية والغرض:** نوضح في هذه الصفحة أغراض المعالجة بقدر ما يلزم لتجربة البحث والخريطة.\n" +
        "- **التقليل:** نجمع الحد الأدنى من البيانات اللازمة للتشغيل.\n" +
        "- **الأمان:** نطبّق ضوابط تقنية وتنظيمية معقولة (منها التشفير أثناء النقل TLS، وقيود الوصول في البنية السحابية).\n" +
        "- **حقوق أصحاب البيانات:** يمكنك طلب الاطلاع أو التصحيح أو الحذف ضمن ما يسمح به النظام والتشغيل، عبر قنوات التواصل أدناه.\n" +
        "- **الشكوى للجهة:** يحق لك تقديم شكوى إلى هيئة حماية البيانات الشخصية عبر بوابتها الرسمية: https://dgp.sdaia.gov.sa/\n\n" +
        "هذا الملخص لا يغني عن الاطلاع على النصوص القانونية المعتمدة لدى الجهة أو عن استشارة قانونية عند الحاجة.",
    },
    {
      icon: Eye,
      title: "جمع البيانات",
      content: "بالنسبة للمستخدم، نجمع الحد الأدنى اللازم للتشغيل:\n\n- بيانات الموقع الجغرافي عند الإذن فقط لعرض الصالونات القريبة\n- لا نطلب إنشاء حساب للمستخدم العادي لتصفح النتائج\n- لا نطلب منك رفع مستندات أو بيانات مالية ضمن تجربة المستخدم"
    },
    {
      icon: Lock,
      title: "استخدام البيانات",
      content: "نستخدم بيانات المستخدم للأغراض التالية فقط:\n\n- عرض النتائج الأقرب والأكثر صلة بموقعك\n- تحسين جودة التجربة والأداء العام للمنصة\n- منع إساءة الاستخدام وتحسين الأمان والموثوقية"
    },
    {
      icon: MessageSquare,
      title: "الشات والترجمة (الباقة الماسية)",
      content:
        "عند استخدام **الشات الكتابي** مع صالون على حلاق ماب، تُعالَج رسائلك في سياق التشغيل والأمان وفق هذه السياسة. في **الباقة الماسية** قد تُعرض طبقة **ترجمة آلية** تهدف إلى تسهيل التواصل **بينك وبين الصالون كمزوّد خدمة** داخل المنصة؛ لا تُعدّ الترجمة استشارة أو وثيقة رسمية، وقد تُسجَّل محتويات المحادثة بقدر ما يلزم للتشغيل والامتثال والحد الأدنى من الاحتفاظ. راجع أيضاً سياسة الشركاء عند الحاجة.",
    },
    {
      icon: Shield,
      title: "حماية البيانات",
      content: "نتخذ إجراءات أمنية صارمة لحماية بياناتك:\n\n- تشفير جميع البيانات أثناء النقل والتخزين (SSL/TLS)\n- خوادم آمنة مع جدران حماية متقدمة\n- الوصول المحدود للبيانات (فقط للموظفين المصرح لهم)\n- نسخ احتياطية منتظمة ومشفرة\n- مراقبة مستمرة للأنشطة المشبوهة\n- عدم مشاركة بياناتك مع أطراف ثالثة دون موافقتك الصريحة"
    },
    {
      icon: UserCheck,
      title: "حقوق المستخدم",
      content: "لديك الحقوق التالية فيما يتعلق ببياناتك:\n\n- **الوصول:** طلب نسخة من البيانات المرتبطة بك\n- **التصحيح:** طلب تحديث البيانات غير الدقيقة\n- **الحذف:** طلب حذف البيانات ضمن ما يسمح به النظام\n- **الاعتراض:** الاعتراض على معالجة بياناتك في الحالات المسموح بها\n\nلطلب أي إجراء متعلق بخصوصيتك يمكنك التواصل معنا عبر وسائل الدعم."
    },
    {
      icon: Cookie,
      title: "ملفات تعريف الارتباط",
      content: "نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربتك:\n\n- **ملفات ضرورية:** لتشغيل المنصة بشكل صحيح (الجلسات، الأمان حيث ينطبق)\n- **ملفات الأداء:** عند تفعيل أدوات تحليل خارجية معتمدة لدينا، تُستخدم وفق سياسة المزود ومع إعدادات الخصوصية المناسبة\n- **ملفات التفضيلات:** لحفظ إعداداتك (مثل الموقع الأخير عند الموافقة)\n\nيمكنك التحكم في ملفات تعريف الارتباط من إعدادات متصفحك. ملاحظة: تعطيل بعض الملفات قد يؤثر على وظائف المنصة."
    },
    {
      icon: Bell,
      title: "التحديثات على السياسة",
      content: "قد نقوم بتحديث هذه السياسة من وقت لآخر. عند وجود تحديث جوهري سنعرض إشعارًا واضحًا داخل المنصة مع تحديث تاريخ آخر مراجعة.\n\n**آخر تحديث:** 17 أبريل 2026"
    },
    {
      icon: Mail,
      title: "معلومات الاتصال",
      content: "إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية أو ممارساتنا، يرجى التواصل معنا:\n\n**البريد الإلكتروني:** admin@halaqmap.com\n**الهاتف:** 0559602685\n**العنوان:** الرياض، المملكة العربية السعودية\n\nفريق الدعم متاح من السبت إلى الخميس، من 9 صباحاً إلى 6 مساءً (بتوقيت الرياض). سنرد على استفساراتك خلال 48 ساعة عمل."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(13,148,136,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(212,175,55,0.1),transparent_50%)]" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6"
            >
              <Shield className="w-10 h-10 text-primary" />
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent">
              سياسة الخصوصية
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              سياسة خصوصية المستخدمين في حلاق ماب: كيف نجمع الحد الأدنى من البيانات، وكيف نستخدمها لحماية التجربة.
            </p>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                        {section.title}
                      </h2>
                      
                      <div className="prose prose-lg max-w-none">
                        {section.content.split('\n').map((paragraph, pIndex) => {
                          if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                            return (
                              <h3 key={pIndex} className="text-lg font-semibold text-foreground mt-4 mb-2">
                                {paragraph.replace(/\*\*/g, '')}
                              </h3>
                            );
                          }
                          if (paragraph.startsWith('- ')) {
                            return (
                              <li key={pIndex} className="text-muted-foreground leading-relaxed mr-6">
                                {paragraph.substring(2).split('**').map((part, i) => 
                                  i % 2 === 0 ? part : <strong key={i} className="text-foreground">{part}</strong>
                                )}
                              </li>
                            );
                          }
                          if (paragraph.trim()) {
                            return (
                              <p key={pIndex} className="text-muted-foreground leading-relaxed mb-4">
                                {paragraph.split('**').map((part, i) => 
                                  i % 2 === 0 ? part : <strong key={i} className="text-foreground">{part}</strong>
                                )}
                              </p>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mt-16"
        >
          <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 rounded-2xl p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Phone className="w-7 h-7 text-primary" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  هل لديك أسئلة؟
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  فريقنا جاهز لمساعدتك في أي استفسار يتعلق بالخصوصية أو حماية البيانات. لا تتردد في التواصل معنا.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="mailto:admin@halaqmap.com?subject=%D8%B7%D9%84%D8%A8%20%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9%20%D8%A3%D9%88%20%D8%AD%D9%82%D9%88%D9%82%20%D8%A8%D9%8A%D8%A7%D9%86%D8%A7%D8%AA"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors duration-200"
                  >
                    <Mail className="w-5 h-5" />
                    راسلنا عبر البريد
                  </a>
                  <a
                    href="tel:+966559602685"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground rounded-xl font-semibold hover:bg-muted transition-colors duration-200"
                  >
                    <Phone className="w-5 h-5" />
                    اتصل بنا
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}