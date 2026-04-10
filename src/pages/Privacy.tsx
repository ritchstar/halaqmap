import { motion } from "framer-motion";
import { Shield, Lock, Eye, UserCheck, Cookie, Bell, Mail, Phone } from "lucide-react";

export default function Privacy() {
  const sections = [
    {
      icon: Shield,
      title: "التزامنا بالخصوصية",
      content: "في حلاق ماب، نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية. نؤمن بأن الخصوصية حق أساسي، ونعمل جاهدين لضمان أن تكون تجربتك معنا آمنة وموثوقة. هذه السياسة توضح كيفية جمعنا واستخدامنا وحماية معلوماتك."
    },
    {
      icon: Eye,
      title: "جمع البيانات",
      content: "نحن نجمع أنواعاً مختلفة من البيانات حسب نوع المستخدم:\n\n**للمستخدمين العاديين:**\n- بيانات الموقع الجغرافي فقط (عند الطلب) لعرض الحلاقين القريبين\n- لا نطلب أي تسجيل أو بيانات شخصية\n- لا نحتفظ بسجل تصفحك أو بحثك\n\n**للحلاقين المسجلين:**\n- معلومات المحل: الاسم، العنوان، رقم الهاتف، واتساب\n- الموقع الجغرافي الدقيق للمحل\n- المستندات الرسمية: السجل التجاري، الرخصة البلدية، الشهادات الصحية\n- صور المحل (خارجية وداخلية)\n- منيو الخدمات والأسعار\n- معلومات الدفع والاشتراك\n- بيانات التواصل مع العملاء (الرسائل، المواعيد)"
    },
    {
      icon: Lock,
      title: "استخدام البيانات",
      content: "نستخدم البيانات المجمعة للأغراض التالية:\n\n- **للمستخدمين:** عرض الحلاقين القريبين بناءً على موقعك الحالي فقط\n- **للحلاقين:** إنشاء وإدارة ملفك الشخصي على المنصة، عرض محلك للعملاء، معالجة الاشتراكات والمدفوعات، التواصل مع العملاء، إرسال الإشعارات المتعلقة بالحجوزات\n- **للمنصة:** تحسين الخدمة، تحليل الأداء، منع الاحتيال، الامتثال للمتطلبات القانونية"
    },
    {
      icon: Shield,
      title: "حماية البيانات",
      content: "نتخذ إجراءات أمنية صارمة لحماية بياناتك:\n\n- تشفير جميع البيانات أثناء النقل والتخزين (SSL/TLS)\n- خوادم آمنة مع جدران حماية متقدمة\n- الوصول المحدود للبيانات (فقط للموظفين المصرح لهم)\n- نسخ احتياطية منتظمة ومشفرة\n- مراقبة مستمرة للأنشطة المشبوهة\n- عدم مشاركة بياناتك مع أطراف ثالثة دون موافقتك الصريحة"
    },
    {
      icon: UserCheck,
      title: "حقوق المستخدم",
      content: "لديك الحقوق التالية فيما يتعلق ببياناتك:\n\n- **الوصول:** طلب نسخة من بياناتك المخزنة لدينا\n- **التصحيح:** تحديث أو تصحيح بياناتك غير الدقيقة\n- **الحذف:** طلب حذف بياناتك (مع مراعاة الالتزامات القانونية)\n- **التقييد:** تقييد معالجة بياناتك في حالات معينة\n- **النقل:** الحصول على بياناتك بصيغة قابلة للنقل\n- **الاعتراض:** الاعتراض على معالجة بياناتك لأغراض معينة\n\nللحلاقين المسجلين: يمكنك إدارة بياناتك من لوحة التحكم، أو التواصل معنا لأي طلب."
    },
    {
      icon: Cookie,
      title: "ملفات تعريف الارتباط",
      content: "نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربتك:\n\n- **ملفات ضرورية:** لتشغيل المنصة بشكل صحيح (تسجيل الدخول، الأمان)\n- **ملفات الأداء:** لتحليل استخدام المنصة وتحسينها (Google Analytics)\n- **ملفات التفضيلات:** لحفظ إعداداتك (اللغة، الموقع الأخير)\n\nيمكنك التحكم في ملفات تعريف الارتباط من إعدادات متصفحك. ملاحظة: تعطيل بعض الملفات قد يؤثر على وظائف المنصة."
    },
    {
      icon: Bell,
      title: "التحديثات على السياسة",
      content: "قد نقوم بتحديث سياسة الخصوصية من وقت لآخر لتعكس التغييرات في ممارساتنا أو المتطلبات القانونية. سنقوم بإشعارك بأي تغييرات جوهرية عبر:\n\n- إشعار بارز على المنصة\n- رسالة بريد إلكتروني (للحلاقين المسجلين)\n- تحديث تاريخ 'آخر تحديث' أعلى هذه الصفحة\n\nننصحك بمراجعة هذه السياسة بشكل دوري للبقاء على اطلاع بكيفية حماية معلوماتك.\n\n**آخر تحديث:** 7 أبريل 2026"
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
              نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. اقرأ سياستنا لفهم كيفية جمع واستخدام وحماية معلوماتك.
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
                            // Check if paragraph contains phone number
                            const hasPhoneNumber = paragraph.includes('الهاتف:');
                            return (
                              <p key={pIndex} className="text-muted-foreground leading-relaxed mb-4">
                                {paragraph.split('**').map((part, i) => {
                                  if (i % 2 === 0) {
                                    // Check if this part contains a phone number
                                    if (hasPhoneNumber && /\d{10}/.test(part)) {
                                      const parts = part.split(/\d{10}/);
                                      const phoneMatch = part.match(/\d{10}/);
                                      return (
                                        <>
                                          {parts[0]}
                                          {phoneMatch && <span dir="ltr">{phoneMatch[0]}</span>}
                                          {parts[1]}
                                        </>
                                      );
                                    }
                                    return part;
                                  }
                                  return <strong key={i} className="text-foreground">{part}</strong>;
                                })}
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
                    href="mailto:privacy@halaqmap.com"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors duration-200"
                  >
                    <Mail className="w-5 h-5" />
                    راسلنا عبر البريد
                  </a>
                  <a
                    href="tel:+966501234567"
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