import { motion } from 'framer-motion';
import { Scale, Copyright, CreditCard, ShieldAlert, Phone, Mail, FileText, Server, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib';
import { renderLegalContentBlocks } from '@/lib/legalPageRender';
import { HonorBoard } from '@/components/b2b/HonorBoard';
import { PlatformIdentityCard } from '@/components/PlatformIdentityCard';
import {
  END_USER_EXPERIENCE_POLICY_CONTENT,
  END_USER_EXPERIENCE_POLICY_TITLE,
} from '@/config/endUserExperiencePolicy';
import {
  PLATFORM_IDENTITY_LEGAL_DISCLAIMER_AR,
  PLATFORM_IDENTITY_PARAGRAPH_AR,
} from '@/config/platformIdentity';

export default function TermsOfService() {
  const sections = [
    {
      icon: Scale,
      title: 'المقدمة وقبول الشروط',
      content:
        'مرحبًا بك في **حلاق ماب**. باستخدامك للمنصة (الموقع الإلكتروني أو التطبيق أو أي واجهة رسمية تابعة لنا) فإنك تقر بأنك اطلعت على هذه الشروط ووافقت على الالتزام بها. إذا لم توافق، يُرجى عدم استخدام المنصة.\n\n' +
        'تُدار المنصة وفق الأنظمة المعمول بها في المملكة العربية السعودية.',
    },
    {
      icon: Server,
      title: 'هوية المنصّة — مزوّد حلول تقنية لا وسيط تجاري',
      content:
        PLATFORM_IDENTITY_PARAGRAPH_AR + '\n\n' + PLATFORM_IDENTITY_LEGAL_DISCLAIMER_AR,
    },
    {
      icon: Users,
      title: END_USER_EXPERIENCE_POLICY_TITLE,
      content: END_USER_EXPERIENCE_POLICY_CONTENT,
    },
    {
      icon: Copyright,
      title: 'الملكية الفكرية وحماية المنصّة',
      content:
        '**مؤسسة أحمد بن عبدالله بن سراء التجارية** و/أو الجهة المعتمدة لتشغيل منصة حلاق ماب تحتفظ بكافة الحقوق في **البرمجيات والشفرة المصدرية والتصميمات والعلامات التجارية والمحتوى التقني والواجهات** الخاصة بالمنصة، بما في ذلك ما يُعرَض من بنية، خوارزميات بحث، قواعد بيانات منظمة، وواجهات المستخدم، ضمن ما يحميه نظام الملكية الفكرية والأنظمة ذات الصلة في المملكة العربية السعودية.\n\n' +
        '- يُحظر نسخ المنصّة أو محتواها أو استنساخها أو إعادة هندستها أو استخراج البيانات بطريقة تُخلّ بالحقوق التجارية أو التقنية للمنصّة.\n' +
        '- لا يمنحك استخدام المنصّة أي حقوق ملكية؛ يقتصر استخدامك على **حق استخدام محدود وغير حصري** للوصول إلى الخدمات وفق هذه الشروط.\n' +
        '- أي انتهاك للملكية الفكرية قد يعرّضك للمساءلة المدنية أو الجزائية وفق الأنظمة.',
    },
    {
      icon: CreditCard,
      title: 'اتفاقية رخصة النفاذ الرقمية للشركاء (نظام الاستجابة الذكية)',
      content:
        'خدمات **الشركاء من الحلاقين والصالونات** تُقدَّم عبر **شراء حزم رخصة رقمية مسبقة الدفع** لخدمات الإدراج البرمجية الموحدة على منصة حلاق ماب، وفق الباقة المختارة (برونزية، ذهبية، ماسية).\n\n' +
        '- **منطق الرخصة:** حضور جغرافي غير ثابت يُفعَّل ظهور المزود برمجياً حصراً عند وجود طلب نشط في محيطه (الظهور عند الطلب · On-Demand Visibility). لا التزام بظهور دائم على الخريطة، بل كفاءة استهداف ودقة ربط.\n' +
        '- يُعدّ إتمام الدفع أو استرداد كود التفعيل إقرارًا بشراء منتج رقمي (حزمة رخصة نفاذ) بمدة محددة — **دون تجديد تلقائي أو خصم دوري**.\n' +
        '- تتضمن الباقات صلاحية الاستجابة البرمجية ضمن نظام الاستجابة الذكية وأدوات إدارة الملف والتقييمات وميزات إضافية وفق ما تعلنه المنصّة.\n' +
        '- **انتهاء الصلاحية:** تنتهي صلاحية النفاذ في تاريخ انتهاء حزمة الرخصة المدفوع؛ يمكن شراء حزمة رخصة جديدة أو استرداد كود لمدة إضافية.\n' +
        '- **التعليق أو الإيقاف:** يحق للمنصّة تعليق أو تقييد الخدمة عند مخالفة الشروط أو انتهاء حزمة الرخصة أو لأسباب أمنية أو امتثالية.\n' +
        '- للتفاصيل، راجع **سياسة رخصة النفاذ الرقمية (نظام الاستجابة الذكية)** و**خصوصية الشركاء** في مسار الخدمات البرمجية للمنصة. لا تُعد المنصّة وساطة مالية أو تجارية أو تقديم حجز بالعمولة.',
    },
    {
      icon: ShieldAlert,
      title: 'سلوك المستخدم والمسؤولية',
      content:
        '- يجب استخدام المنصّة بشكل قانوني وبما لا يضر بالآخرين أو بسمعة المنصّة.\n' +
        '- المحتوى الذي يقدمه الشركاء (صور، أوصاف، أسعار معروضة) يقع ضمن مسؤوليتهم ضمن حدود ما تسمح به المنصّة والأنظمة.\n' +
        '- المنصّة تُقدَّم «كما هي» ضمن حدود الجهد المعقول؛ لا نضمن خلوّ الخدمة من الانقطاعات النادرة أو أخطاء الطرف الثالث (مثل مزوّدي خدمات الموقع أو الدفع).',
    },
    {
      icon: FileText,
      title: 'تعديل الشروط',
      content:
        'يجوز تحديث هذه الشروط من وقت لآخر. يُعلَن عن التحديثات الجوهرية عبر المنصّة أو بالوسائل المناسبة. استمرارك في الاستخدام بعد التحديث يُعد قبولًا للشروط المعدّلة حيث ينطبق ذلك قانونًا.',
    },
    {
      icon: Phone,
      title: 'التواصل',
      content:
        'للاستفسارات المتعلقة بهذه الشروط:\n\n**البريد:** admin@halaqmap.com\n**الهاتف:** 0559602685\n\n**آخر تحديث:** مايو 2026',
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
              <Scale className="w-10 h-10 text-primary" />
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent">
              شروط الاستخدام
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              الحقوق، والملكية الفكرية، واتفاقية حزمة الرخصة للشركاء في منصة حلاق ماب.
            </p>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-16" dir="rtl">
        <div className="max-w-4xl mx-auto mb-12">
          <PlatformIdentityCard />
        </div>

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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mt-14 flex flex-wrap gap-4 justify-center"
        >
          <NavLink
            to={ROUTE_PATHS.USER_PRIVACY_POLICY}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors"
          >
            سياسة الخصوصية
          </NavLink>
          <NavLink
            to={ROUTE_PATHS.SUBSCRIPTION_POLICY}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors"
          >
            سياسة رخصة النفاذ الرقمية — الشركاء (نظام الاستجابة الذكية)
          </NavLink>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mt-12"
        >
          <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 rounded-2xl p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4 text-foreground">استفسارات قانونية أو تجارية</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  للتواصل بخصوص هذه الشروط أو الملكية الفكرية يمكنك مراسلتنا.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="mailto:admin@halaqmap.com?subject=%D8%B4%D8%B1%D9%88%D8%B7%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AE%D8%AF%D8%A7%D9%85"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    البريد الإلكتروني
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

        <div className="max-w-4xl mx-auto mt-14">
          <HonorBoard context="legal" variant="legal" />
        </div>
      </div>
    </div>
  );
}
