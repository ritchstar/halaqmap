import { motion } from 'framer-motion';
import { Shield, Server, MapPin, Lock, Eye, FileText, Phone, Mail } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib';
import { renderLegalContentBlocks } from '@/lib/legalPageRender';
import { PlatformIdentityCard } from '@/components/PlatformIdentityCard';
import { PlatformTlsTrustBadge } from '@/components/PlatformTlsTrustBadge';

export default function EphemeralProcessingGovernance() {
  const sections = [
    {
      icon: Shield,
      title: 'صفة هذه الصفحة',
      content:
        'هذه الصفحة بيان مرجعي تأسيسي يوضح **الأساس البرمجي المعتمد** الذي تُبنى عليه منصة **حلاق ماب** قبل التشغيل الفعلي فيما يتعلق ببيانات الموقع الجغرافي والمعالجة الجلسية.\n\n' +
        'وهي تقرر بوضوح أن المنصة لا تؤسس نموذجها التشغيلي على **تخزين تاريخي** لبيانات موقع المستخدم النهائي، ولا على **إنشاء سجل تتبعي** لحركته، ولا على **إعادة استخدام** هذه البيانات خارج حدود الحاجة التشغيلية المرتبطة بالجلسة أو الطلب الفعلي.',
    },
    {
      icon: MapPin,
      title: 'النطاق الفني للبيانات',
      content:
        'المقصود هنا هو بيانات الموقع الجغرافي التي قد يمنحها المستخدم عند الحاجة التشغيلية أثناء جلسة الاستخدام.\n\n' +
        '- تشمل الإحداثيات أو ما ينتج عنها من تصنيف لحظي للنتائج.\n' +
        '- ترتبط بسياق الطلب أو جلسة التصفح الحالية فقط.\n' +
        '- لا تُعامل داخل المنصة كأصل تاريخي مستقل للمستخدم.\n' +
        '- لا تُبنى منها قاعدة معرفة سلوكية أو تسويقية مرتبطة بهوية المستخدم النهائي.',
    },
    {
      icon: Server,
      title: 'المبدأ البرمجي الحاكم',
      content:
        'تُؤسَّس المنصة على مبدأ:\n\n' +
        '- `ephemeral processing`\n' +
        '- `session-scoped handling`\n' +
        '- `no historical persistence`\n\n' +
        'والمعنى العملي لذلك أن بيانات الموقع تُستخدم داخل حدود الطلب أو الجلسة بالقدر اللازم لتقديم الاستجابة المناسبة، ثم لا تُبنى عليها طبقة تشغيلية تاريخية دائمة داخل قاعدة بيانات المنصة، ولا تُستثمر لاحقاً في تكوين ملف زمني أو أرشيف موقع للمستخدم النهائي.',
    },
    {
      icon: Lock,
      title: 'الضمانات الهيكلية المعتمدة',
      content:
        '- لا إنشاء لسجل تاريخي مخصص لحركة المستخدم الجغرافية داخل قاعدة بيانات المنصة.\n' +
        '- لا إنشاء لملف تتبعي يربط بين جلسات متعددة للمستخدم النهائي على أساس الموقع.\n' +
        '- لا اعتماد تشغيلي على قنوات بث حي مبنية على سجل موقع المستخدم النهائي.\n' +
        '- لا تُستخدم بيانات الموقع كأساس لأرشفة تسويقية أو نمذجة سلوكية زمنية داخل المنصة.\n' +
        '- لا يُعاد توظيف هذه البيانات داخلياً بعد انتهاء الجلسة لتغذية توصيات تاريخية أو خرائط طلب متراكمة خاصة بالمستخدم النهائي.\n' +
        '- يقتصر أثر البيانات على تفعيل الاستجابة والعرض اللحظي ضمن الجلسة فقط.',
    },
    {
      icon: Eye,
      title: 'معنى إتلاف الأثر البرمجي بعد انتهاء الجلسة',
      content:
        'المقصود بهذا التعبير في السياق البرمجي ليس فقط غياب العرض للمستخدم، بل غياب بناءٍ تشغيلي دائم يحتفظ بأثر الموقع كسجل قابل للاسترجاع التاريخي داخل المنصة.\n\n' +
        '- تنتهي قيمة بيانات الموقع بانتهاء الجلسة أو الطلب.\n' +
        '- لا يبقى للمنصة سجل تاريخي داخلي يُعاد تشغيله لاحقاً لتحليل حركة المستخدم.\n' +
        '- لا تُعاد هيكلة الأثر الجغرافي بعد الجلسة في صورة أصل بيانات دائم تابع للمنصة.',
    },
    {
      icon: FileText,
      title: 'الحدود التقنية الواجب بيانها',
      content:
        'تلتزم المنصة بالدقة في التوصيف الفني، ولذلك توضح أن الحد الأدنى من البيانات قد يمر تقنياً عبر المتصفح أو الجهاز أو مزوّدي البنية أو السجلات القصيرة الأمد اللازمة للتشغيل.\n\n' +
        'غير أن هذا المرور لا يُوصَف داخل المنصة على أنه **أرشفة تشغيلية مستقلة**، ولا يُبنى عليه سجل تاريخي داخلي خاص بالمستخدم النهائي.',
    },
    {
      icon: Shield,
      title: 'الأثر على المنتج والتشغيل',
      content:
        '- الاستجابة والعرض يتمان لحظياً لخدمة الاستعلام الجاري فقط.\n' +
        '- لا يُبنى منطق المنتج على تخزين تاريخ الموقع للمستخدم النهائي.\n' +
        '- لا تُؤسس تحليلات الطلب داخل المنصة على سجل موقع تاريخي تابع للمستخدم النهائي.\n' +
        '- يبقى دور المنصة محصوراً في المعالجة والفلترة والعرض ضمن سياق الاستخدام الفعلي، لا إنشاء أرشيف جغرافي متراكم.',
    },
    {
      icon: Server,
      title: 'الوصف التأسيسي المعتمد قبل التشغيل',
      content:
        'بناءً على هذا الأساس، تُقدِّم منصة **حلاق ماب** نفسها برمجياً على أنها منصة تُدار فيها بيانات الموقع وفق **معالجة لحظية جلسية** عند الحاجة، دون حفظ تاريخي داخل قاعدة بيانات المنصة، ودون تأسيس بنية تشغيلية تُعيد استثمار الأثر الجغرافي كسجل دائم بعد انتهاء الجلسة.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/12 via-background to-background py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,rgba(20,184,166,0.12),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(212,175,55,0.07),transparent_50%)]" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-background" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
              ✦ مرجع تأسيسي تقني
            </div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl border border-primary/25 bg-primary/10 mb-6 shadow-[0_0_30px_rgba(20,184,166,0.15)]"
            >
              <Shield className="w-10 h-10 text-primary" />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent">
              حوكمة المعالجة اللحظية وإتلاف الأثر البرمجي
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              توضح هذه الصفحة الأساس البرمجي الذي تُبنى عليه منصة حلاق ماب قبل التشغيل الفعلي في ما يتعلق ببيانات
              الموقع والمعالجة الجلسية، وتبين على نحو صريح أن المنصة لا تعتمد نموذجًا يقوم على تخزين بيانات موقع
              المستخدم النهائي أو بناء سجل تاريخي لها أو محاولة إعادة استخدامها بعد انتهاء الطلب أو الجلسة.
            </p>
            <div className="mt-8 mx-auto h-px max-w-sm bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-16" dir="rtl">
        <div className="max-w-4xl mx-auto mb-8 space-y-6">
          <PlatformIdentityCard />
          <PlatformTlsTrustBadge variant="strip" />
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
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
            هذه الصفحة تُقرأ بوصفها مرجعًا تأسيسيًا تقنيًا مكمّلًا للنسخ القانونية والخصوصية العامة داخل المنصة.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
            <NavLink to={ROUTE_PATHS.USER_PRIVACY_POLICY} className="text-primary hover:underline underline-offset-4">
              سياسة الخصوصية (موجزة)
            </NavLink>
            <NavLink to={ROUTE_PATHS.PRIVACY_DETAILED} className="text-primary hover:underline underline-offset-4">
              سياسة الخصوصية التفصيلية
            </NavLink>
            <NavLink to={ROUTE_PATHS.TERMS_OF_SERVICE} className="text-primary hover:underline underline-offset-4">
              شروط الاستخدام
            </NavLink>
          </div>
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
                <h3 className="text-2xl font-bold mb-4 text-foreground">هل تحتاج نسخة مرجعية عند المراسلة؟</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  يمكن الاستناد إلى هذه الصفحة كمرجع عام يوضح الأساس البرمجي التأسيسي للمنصة في شأن المعالجة اللحظية
                  الجلسية وحدود الأثر البرمجي بعد انتهاء الطلب.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="mailto:admin@halaqmap.com?subject=%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%AD%D9%88%D9%84%20%D8%AD%D9%88%D9%83%D9%85%D8%A9%20%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D9%84%D8%AC%D8%A9%20%D8%A7%D9%84%D9%84%D8%AD%D8%B8%D9%8A%D8%A9"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    راسلنا عبر البريد
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
