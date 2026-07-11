import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Loader2, Radio, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAdminPlatformRadarFullScreenPathFor } from '@/config/adminAuth';
import { isProductAnalyticsEnabled } from '@/lib/analytics/productAnalytics';
import {
  fetchAdminLiveActivity,
  type LiveActivityPayload,
  type LiveActivityWindow,
} from '@/lib/adminLiveActivityRemote';
import { useLocation } from 'react-router-dom';

const POLL_MS = 22_000;

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-center">
      <p className="font-mono text-lg font-bold tabular-nums text-teal-200">{value}</p>
      <p className="mt-0.5 text-[0.65rem] leading-snug text-slate-400">{label}</p>
    </div>
  );
}

function WindowCard({ title, w }: { title: string; w: LiveActivityWindow }) {
  return (
    <Card className="border-white/10 bg-slate-950/60 text-slate-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-white">{title}</CardTitle>
        <CardDescription className="text-slate-500">آخر {w.minutes} دقيقة — من قاعدة البيانات</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Metric label="حجوزات" value={w.bookings} />
        <Metric label="مدفوعات مكتملة" value={w.paymentsCompleted} />
        <Metric label="مدفوعات فاشلة" value={w.paymentsFailed} />
        <Metric label="محادثات بدأت" value={w.conversationsStarted} />
        <Metric label="ملفات جديدة" value={w.newProfiles} />
        <Metric label="تسجيل شركاء" value={w.registrationSubmissions} />
        <Metric label="اهتمام شركاء" value={w.interestSignups} />
        <Metric label="أحداث أمنية" value={w.securityEvents} />
      </CardContent>
    </Card>
  );
}

type Props = {
  isActive: boolean;
};

export function AdminLiveActivitySection({ isActive }: Props) {
  const location = useLocation();
  const [data, setData] = useState<LiveActivityPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetchAdminLiveActivity();
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError(null);
    setData(res.body);
  };

  useEffect(() => {
    if (!isActive) return;
    void load();
    const id = window.setInterval(() => {
      void load();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [isActive]);

  const radarPath = getAdminPlatformRadarFullScreenPathFor(location.pathname);
  const posthogOn = isProductAnalyticsEnabled();

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Activity className="h-5 w-5 text-teal-300" aria-hidden />
            نشاط حي للمنصة
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-400">
            حقيقة المنتج من قاعدة البيانات + عدّاد متصل الآن (Presence بدون جغرافيا). سجل البحث
            الجغرافي متوقف نهائياً.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
            className="border-white/15 text-slate-200"
          >
            {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <RefreshCw className="ml-2 h-4 w-4" />}
            تحديث
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link to={radarPath}>رادار النبض</Link>
          </Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {error}
        </p>
      ) : null}

      <Card className="border-teal-400/25 bg-teal-500/8 text-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-teal-100">
            <Radio className="h-4 w-4" aria-hidden />
            متصل الآن
          </CardTitle>
          <CardDescription className="text-teal-200/60">
            نافذة {data?.onlineWindowSeconds ?? 180} ثانية · آخر نبضة مرئية من المتصفح
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!data?.online.presenceTableReady ? (
            <p className="text-sm text-amber-100/90">
              جدول Presence غير جاهز بعد — طبّق migration{' '}
              <code className="rounded bg-black/30 px-1">140_platform_presence</code> على Supabase.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <Metric label="الإجمالي" value={data.online.total} />
              <Metric label="زائر" value={data.online.anon} />
              <Metric label="شريك" value={data.online.barber} />
              <Metric label="أدمن" value={data.online.admin} />
              <Metric label="سفير" value={data.online.ambassador} />
            </div>
          )}
          {data?.generatedAt ? (
            <p className="mt-3 text-[0.65rem] text-slate-500">
              آخر توليد: {new Date(data.generatedAt).toLocaleString('ar-SA')}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {data ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <WindowCard title="١٥ دقيقة" w={data.windows.m15} />
          <WindowCard title="ساعة" w={data.windows.h1} />
          <WindowCard title="٢٤ ساعة" w={data.windows.h24} />
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          جاري التحميل…
        </div>
      ) : null}

      <Card className="border-white/10 bg-slate-950/50 text-slate-100">
        <CardHeader>
          <CardTitle className="text-base">تكامل التحليلات</CardTitle>
          <CardDescription className="text-slate-500">
            الأرقام أعلاه من قاعدة البيانات. PostHog وVercel يكمّلان سلوك الصفحات بعد ضبط المفاتيح.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-300">
          <p>
            PostHog (عميل):{' '}
            <span className={posthogOn ? 'text-teal-300' : 'text-amber-200'}>
              {posthogOn ? 'مفعّل عبر VITE_POSTHOG_KEY' : 'غير مفعّل — أضف المفتاح في Vercel'}
            </span>
          </p>
          <p>
            Vercel Analytics / Speed Insights: تُركَّب في التطبيق — فعّلهما من لوحة مشروع Vercel.
          </p>
          <p className="text-xs text-slate-500">
            Session replay معطّل افتراضياً. لا يُرسل مسار الأدمن الكامل إلى PostHog.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
