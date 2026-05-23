import { Link } from 'react-router-dom';
import { RegistrationForm } from '@/components/RegistrationForm';
import { RegistrationErrorBoundary } from '@/components/RegistrationErrorBoundary';
import { ROUTE_PATHS } from '@/lib/index';
import { PARTNER_REGISTER_INTRO_PARAGRAPHS } from '@/lib/partnerMarketingCopy';
import { PLATFORM_PARTNER_SMART_TRACKING_HEADLINE } from '@/config/platformSmartTracking';
import {
  SOFTWARE_PACKAGE_FOUNDATION_LABEL_AR,
  SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR,
} from '@/config/subscriptionPricing';

export default function Register() {
  return (
    <div className="min-h-screen bg-slate-950" dir="rtl">
      <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-14">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">B2B · ISIC4 474151</p>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight text-pretty">
            {PLATFORM_PARTNER_SMART_TRACKING_HEADLINE}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            {SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR} — مبنية على{' '}
            <span className="text-slate-200">{SOFTWARE_PACKAGE_FOUNDATION_LABEL_AR}</span>{' '}
            لشركاء حلاق ماب.
          </p>
          <div className="mt-6 space-y-3 text-sm leading-relaxed text-slate-400">
            {PARTNER_REGISTER_INTRO_PARAGRAPHS.map((para, i) => (
              <p key={i} className="text-pretty">
                {para}
              </p>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-medium">
            <Link to={ROUTE_PATHS.PARTNER_WHY} className="text-slate-300 hover:text-white underline-offset-4 hover:underline">
              لماذا تنضم؟ — اقرأ قبل إكمال الطلب
            </Link>
            <Link to={ROUTE_PATHS.PARTNER_STORY} className="text-slate-300 hover:text-white underline-offset-4 hover:underline">
              القصة والمسار
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-center text-xl font-bold text-white sm:text-2xl">نموذج التسجيل</h2>
          <RegistrationErrorBoundary>
            <RegistrationForm />
          </RegistrationErrorBoundary>
        </section>

        <footer className="mx-auto mt-12 max-w-3xl text-center">
          <p className="text-slate-500 mb-4 text-sm">
            بالتسجيل، أنت توافق على{' '}
            <Link
              to={ROUTE_PATHS.SUBSCRIPTION_POLICY}
              className="text-slate-300 hover:text-white underline underline-offset-2 mx-1"
            >
              سياسة رخصة النفاذ الرقمية (نظام الاستجابة الذكية)
            </Link>
            و
            <Link
              to={ROUTE_PATHS.PARTNER_PRIVACY}
              className="text-slate-300 hover:text-white underline underline-offset-2 mr-1"
            >
              سياسة خصوصية الشركاء
            </Link>
          </p>
          <p className="text-sm text-slate-500">
            لديك حساب بالفعل؟{' '}
            <Link to={ROUTE_PATHS.HOME} className="text-slate-300 hover:text-white font-semibold mr-1">
              العودة للرئيسية
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
