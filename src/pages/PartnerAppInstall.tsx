/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Download,
  ExternalLink,
  LayoutDashboard,
  LogIn,
  Share2,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HalaqmapBrandMark } from '@/components/HalaqmapBrandMark';
import {
  PARTNER_ANDROID_PLAY_STORE_URL,
  PARTNER_APP_DISPLAY_NAME_AR,
  PARTNER_APP_TAGLINE_AR,
} from '@/config/partnerAppShell';
import { usePartnerAppInstallPrompt } from '@/hooks/usePartnerAppInstallPrompt';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { readBarberAuthSession } from '@/lib/barberPortalSession';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { toast } from '@/components/ui/sonner';

const PARTNER_MANIFEST_HREF = '/manifest-partner.json';

/**
 * صفحة تثبيت تطبيق الصالون (PWA أولاً) + جسر سريع للوحة التحكم.
 * Manifest الشريك يُفعَّل هنا فقط حتى يبدأ التطبيق على /partners/app.
 */
export default function PartnerAppInstall() {
  useDocumentTitle(PARTNER_APP_DISPLAY_NAME_AR);
  const { canPrompt, installed, prompting, promptInstall, isIos } = usePartnerAppInstallPrompt();
  const session = useMemo(() => readBarberAuthSession(), []);

  useEffect(() => {
    const existing = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    const prevHref = existing?.href || '/manifest.json';
    let link = existing;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = PARTNER_MANIFEST_HREF;
    return () => {
      if (link) link.href = prevHref.includes('manifest-partner') ? '/manifest.json' : prevHref;
    };
  }, []);

  const handleInstall = async () => {
    const result = await promptInstall();
    if (result === 'accepted') {
      toast.success('تم تثبيت تطبيق الصالون — افتحه من شاشتك الرئيسية');
    } else if (result === 'unavailable') {
      toast.message(
        isIos
          ? 'على آيفون: شارك ← «إضافة إلى الشاشة الرئيسية»'
          : 'استخدم قائمة المتصفح ← «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»',
      );
    }
  };

  return (
    <div
      className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.16),transparent_40%),linear-gradient(165deg,#042f2e_0%,#0a4f4a_45%,#071426_100%)] text-slate-100"
      dir="rtl"
    >
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8 sm:py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <HalaqmapBrandMark className="h-20 w-20 rounded-[1.35rem] ring-2 ring-teal-300/40 shadow-xl shadow-teal-500/25" />
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-teal-200/80" dir="ltr">
              HALAQ MAP · SALON APP
            </p>
            <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">{PARTNER_APP_DISPLAY_NAME_AR}</h1>
            <p className="mt-2 text-sm leading-relaxed text-teal-50/80">{PARTNER_APP_TAGLINE_AR}</p>
          </div>
        </div>

        {installed ? (
          <Alert className="border-emerald-400/35 bg-emerald-500/10 text-emerald-50">
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              التطبيق مثبت أو يعمل كغلاف مستقل. استخدم الأزرار أدناه لدخول اللوحة فوراً.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-3">
          {!installed ? (
            <Button
              type="button"
              size="lg"
              className="h-12 gap-2 bg-gradient-to-l from-teal-600 to-cyan-600 text-base font-bold shadow-lg shadow-teal-500/25"
              disabled={prompting}
              onClick={() => void handleInstall()}
            >
              <Download className="h-5 w-5" />
              {canPrompt
                ? prompting
                  ? 'جاري التثبيت…'
                  : 'تثبيت التطبيق من المتصفح'
                : 'تعليمات التثبيت على الجهاز'}
            </Button>
          ) : null}

          {PARTNER_ANDROID_PLAY_STORE_URL ? (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 gap-2 border-teal-300/35 bg-white/5 text-teal-50 hover:bg-white/10"
            >
              <a href={PARTNER_ANDROID_PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                تحميل من Google Play
              </a>
            </Button>
          ) : (
            <p className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-center text-[11px] text-teal-100/70">
              نسخة Google Play قيد التجهيز — ثبّت الآن من المتصفح بتحديث فوري من المنصة.
            </p>
          )}

          <Button
            asChild
            size="lg"
            variant="secondary"
            className="h-12 gap-2 bg-white/10 text-white hover:bg-white/15"
          >
            <Link to={session ? ROUTE_PATHS.BARBER_DASHBOARD : ROUTE_PATHS.BARBER_LOGIN}>
              {session ? (
                <>
                  <LayoutDashboard className="h-5 w-5" />
                  فتح لوحة التحكم
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  تسجيل دخول الصالون
                </>
              )}
            </Link>
          </Button>
        </div>

        <ul className="space-y-3 rounded-2xl border border-white/12 bg-black/25 p-4 text-sm">
          {[
            {
              icon: Bell,
              title: 'إشعارات فورية',
              body: 'تنبيهات الرسائل والمواعيد حتى بعد إغلاق التبويب — عبر Web Push.',
            },
            {
              icon: LayoutDashboard,
              title: 'دخول سريع للوحة',
              body: 'اختصار من الشاشة الرئيسية مباشرة إلى بوابة الصالون.',
            },
            {
              icon: ShieldCheck,
              title: 'الدفع في المتصفح فقط',
              body: 'شراء الرخص والعقود يُفتح في متصفح آمن خارج الغلاف — بلا عمولة متاجر.',
            },
            {
              icon: Share2,
              title: 'تحديث فوري',
              body: 'الغلاف خفيف ويعرض آخر نسخة من المنصة دون انتظار رفع تطبيق جديد كل مرة.',
            },
          ].map((item) => (
            <li key={item.title} className="flex gap-3">
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" />
              <div>
                <p className="font-bold text-white">{item.title}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-teal-50/75">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>

        {isIos ? (
          <Alert className="border-cyan-400/30 bg-cyan-500/10 text-cyan-50">
            <Share2 className="h-4 w-4" />
            <AlertDescription className="text-xs leading-relaxed">
              على آيفون/سفاري: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية» لتثبيت تطبيق الصالون.
            </AlertDescription>
          </Alert>
        ) : !canPrompt && !installed ? (
          <Alert className="border-white/15 bg-white/5 text-slate-100">
            <Download className="h-4 w-4" />
            <AlertDescription className="text-xs leading-relaxed">
              من Chrome/Edge على أندرويد: القائمة ⋮ ← «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».
            </AlertDescription>
          </Alert>
        ) : null}

        <p className="text-center text-[11px] text-teal-100/55">
          الزبائن يستمرون على تجربة الويب السريعة — هذا الغلاف مخصّص للصالون (B2B).
        </p>
      </div>
    </div>
  );
}
