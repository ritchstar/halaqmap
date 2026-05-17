import { motion } from 'framer-motion';
import { MapPin, Shield, Lock, Eye, UserCheck, Bell, Mail, Phone } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib';
import { renderLegalContentBlocks } from '@/lib/legalPageRender';

/**
 * سياسة خصوصية المستخدمين — موقع جغرافي لحظي فقط (بدون تخزين)، وعدم مشاركة مع أطراف خارجية.
 * للنسخة التفصيلية (PDPL وغيرها) انظر ROUTE_PATHS.PRIVACY_DETAILED.
 */
export default function UserPrivacyPolicy() {
  const sections = [
    {
      icon: Shield,
      title: 'الامتثال لنظام حماية البيانات الشخصية (PDPL)',
      content:
        'نلتزم بمبادئ **نظام حماية البيانات الشخصية** في المملكة العربية السعودية والإرشادات ذات الصلة من **هيئة حماية البيانات الشخصية (سدايا)**.\n\n' +
        'فيما يخص **بيانات الموقع الجغرافي**، نعالجها **لحظياً (Instantaneous / Real-Time)** عند موافقتك فقط، ولأغراض محددة موضّحة أدناه — **دون تخزينها في قاعدة بيانات** و**دون تتبع تاريخي** لمسارك أو تحركاتك.',
    },
    {
      icon: Eye,
      title: 'جمع البيانات',
      content:
        'بالنسبة لمستخدم المنصة (الزائر)، نجمع **الحد الأدنى** اللازم للتشغيل:\n\n' +
        '- **بيانات الموقع الجغرافي اللحظي عند الإذن فقط لعرض الصالونات القريبة**\n' +
        '- بيانات تقنية عامة للجلسة والأمان (مثل نوع المتصفح أو عنوان IP بقدر ما يلزم لحماية الخدمة)\n' +
        '- لا نطلب إنشاء حساب للمستخدم العادي لتصفح النتائج الأساسية\n' +
        '- لا نطلب منك رفع مستندات أو بيانات مالية ضمن تجربة التصفح العامة للخريطة',
    },
    {
      icon: MapPin,
      title: 'الموقع الجغرافي اللحظي — المعالجة والاستخدام',
      content:
        'عندما تمنح إذن الموقع من المتصفح أو الجهاز، تُستخدم إحداثياتك **لحظياً** **فقط** من أجل:\n\n' +
        '- عرض الصالونات والحلاقين **الأقرب إليك** على الخريطة أو في القائمة، وحساب المسافة أو ترتيب النتائج ضمن جلسة التصفح الحالية.\n' +
        '- تحسين تجربة البحث ضمن نطاق جغرافي تختاره (مثل دائرة البحث) **أثناء استخدامك النشط للمنصة**.\n\n' +
        '**لا نقوم ببيع موقعك أو مشاركته مع أطراف خارجية** لأغراض إعلانية أو تسويقية أو إعادة بيع البيانات.',
    },
    {
      icon: Lock,
      title: 'المعالجة اللحظية — دون تخزين أو تتبع تاريخي',
      content:
        '- معالجة بيانات الموقع **لحظية (Instantaneous / Real-Time)** داخل جلسة التصفح أو التطبيق فقط.\n' +
        '- **تنتهي المعالجة فوراً** عند إغلاق المتصفح أو التطبيق أو انتهاء الجلسة، وفق آلية الجهاز والمتصفح.\n' +
        '- **لا نُخزّن** إحداثيات موقعك التاريخية في قاعدة بيانات لدينا، و**لا نُنشئ ملفاً تتبعياً** لمسارك الجغرافي أو تحركاتك السابقة.\n' +
        '- قد تمر بيانات التشغيل الضرورية عبر مزوّدي بنية تحتية (استضافة، خرائط) **كمعالجين** وبحدّ ما يلزم لتقديم الخدمة فقط، دون استخدام موقعك لاستهدافك إعلانياً من جانبنا.',
    },
    {
      icon: Eye,
      title: 'الشفافية',
      content:
        'إذا لم تمنح إذن الموقع، يمكنك غالبًا مواصلة التصفح مع محدودية (مثل إدخال منطقة يدويًا أو استخدام الخريطة بدون دقة موقعك الفورية — حسب إتاحة الواجهة).',
    },
    {
      icon: Lock,
      title: 'الأمان',
      content:
        '- نطبّق إجراءات تقنية معقولة مثل التشفير أثناء النقل (TLS) حيث ينطبق.\n' +
        '- نحدّ من وصول البيانات للصلاحيات الضرورية للتشغيل.\n' +
        '- **لا نعتمد على تخزين دائم لإحداثيات موقعك** في بنيتنا لأغراض عرض «الأقرب إليك»؛ المعالجة مرتبطة بجلسة الاستخدام الحالية.',
    },
    {
      icon: UserCheck,
      title: 'حقوقك',
      content:
        'يمكنك **سحب إذن الموقع** من إعدادات المتصفح أو الجهاز في أي وقت.\n\n' +
        'وفق نظام حماية البيانات الشخصية، يمكنك — ضمن ما يسمح به النظام والتشغيل — طلب **الاطلاع** أو **التصحيح** أو **الحذف** للبيانات الشخصية التي نعالجها ونحتفظ بها (ولا تشمل بيانات الموقع اللحظي غير المخزّنة). للشكاوى: https://dgp.sdaia.gov.sa/\n\n' +
        'لطلبات الخصوصية تواصل معنا عبر القنوات أدناه.',
    },
    {
      icon: Bell,
      title: 'تحديث هذه السياسة',
      content:
        'قد نحدّث هذه الصفحة. عند تغيير جوهري قد نُظهر إشعارًا مناسبًا في المنصّة.\n\n**آخر تحديث:** مايو 2026',
    },
    {
      icon: Mail,
      title: 'التواصل',
      content:
        '**البريد:** admin@halaqmap.com\n**الهاتف:** 0559602685\n\nنسعد بتوضيح أي نقطة تتعلق بخصوصيتك أو بيانات الموقع.',
    },
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

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              معالجة **لحظية** لبيانات الموقع عند الإذن فقط — لعرض أقرب صالون، **دون تخزين أو تتبع تاريخي**، وفق نظام حماية البيانات الشخصية (PDPL).
            </p>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-16" dir="rtl">
        <div className="max-w-4xl mx-auto space-y-12">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
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

                      <div className="max-w-none space-y-1">{renderLegalContentBlocks(section.content)}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mt-10 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center"
        >
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            للاطلاع على **النسخة التفصيلية** لسياسة الخصوصية بما يشمل الامتثال لنظام حماية البيانات الشخصية والملاحق ذات الصلة:
          </p>
          <NavLink
            to={ROUTE_PATHS.PRIVACY_DETAILED}
            className="inline-flex items-center justify-center text-primary font-semibold hover:underline touch-manipulation"
          >
            سياسة الخصوصية التفصيلية
          </NavLink>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mt-14"
        >
          <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 rounded-2xl p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Phone className="w-7 h-7 text-primary" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4 text-foreground">هل لديك سؤال عن الخصوصية؟</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  راسلنا وسنرد في أقرب وقت عمل.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="mailto:admin@halaqmap.com?subject=%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    راسلنا
                  </a>
                  <a
                    href="tel:+966559602685"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-xl font-semibold hover:bg-muted transition-colors"
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
