import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Megaphone,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GOOGLE_ADS_CAMPAIGN_LINKS,
  GOOGLE_ADS_CONVERSION_ID,
  GOOGLE_ADS_TAG_LABEL_AR,
} from '@/config/googleAdsTag';
import {
  clearGoogleAdsEventLog,
  getGoogleAdsTagSnapshot,
  readGoogleAdsEventLog,
  trackGoogleAdsEvent,
  type GoogleAdsTrackedEvent,
} from '@/lib/googleAdsTag';
import { toast } from 'sonner';

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ar-SA', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  } catch {
    return iso;
  }
}

export function GoogleAdsCampaignPanel() {
  const [snapshot, setSnapshot] = useState(() => getGoogleAdsTagSnapshot());
  const [events, setEvents] = useState<GoogleAdsTrackedEvent[]>(() => readGoogleAdsEventLog());

  const refresh = useCallback(() => {
    setSnapshot(getGoogleAdsTagSnapshot());
    setEvents(readGoogleAdsEventLog());
  }, []);

  useEffect(() => {
    refresh();
    const onEvt = () => refresh();
    window.addEventListener('halaqmap:google-ads-event', onEvt);
    window.addEventListener('halaqmap:google-ads-event-cleared', onEvt);
    const iv = window.setInterval(refresh, 8_000);
    return () => {
      window.removeEventListener('halaqmap:google-ads-event', onEvt);
      window.removeEventListener('halaqmap:google-ads-event-cleared', onEvt);
      window.clearInterval(iv);
    };
  }, [refresh]);

  const pageViews = useMemo(
    () => events.filter((e) => e.name === 'page_view').length,
    [events],
  );
  const otherEvents = useMemo(
    () => events.filter((e) => e.name !== 'page_view').length,
    [events],
  );

  const sendTestHit = () => {
    trackGoogleAdsEvent('admin_tag_ping', {
      detail: 'اختبار من لوحة الأدمن',
    });
    refresh();
    toast.success('أُرسل حدث اختبار إلى Google Tag');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card">
        <CardHeader className="space-y-2">
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
            <Megaphone className="h-5 w-5 text-amber-600" />
            {GOOGLE_ADS_TAG_LABEL_AR}
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            كود التتبع (`gtag`) مدمج في الموقع. الأرقام الكاملة للحملة (نقرات، تكلفة، تحويلات
            معتمدة) تظهر في حساب Google Ads؛ هنا نعرض حالة التركيب وآخر الأحداث المرصودة من
            المنصة.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatusTile
              label="حالة الوسم"
              value={snapshot.loaded ? 'نشط' : 'غير محمّل'}
              ok={snapshot.loaded}
            />
            <StatusTile label="معرّف التحويل" value={GOOGLE_ADS_CONVERSION_ID} mono />
            <StatusTile label="حجم dataLayer" value={String(snapshot.dataLayerSize)} />
            <StatusTile
              label="آخر حدث محلي"
              value={snapshot.lastEventAt ? formatWhen(snapshot.lastEventAt) : '—'}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricTile label="مشاهدات مسجّلة (محلي)" value={pageViews} />
            <MetricTile label="أحداث أخرى (محلي)" value={otherEvents} />
            <MetricTile label="إجمالي السجل المحلي" value={events.length} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
              تحديث
            </Button>
            <Button type="button" size="sm" className="gap-2" onClick={sendTestHit}>
              <Activity className="h-4 w-4" />
              إرسال حدث اختبار
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 text-rose-700"
              onClick={() => {
                clearGoogleAdsEventLog();
                refresh();
                toast.message('تم مسح السجل المحلي');
              }}
            >
              <Trash2 className="h-4 w-4" />
              مسح السجل المحلي
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            نتائج الحملة في Google Ads
          </CardTitle>
          <CardDescription>
            افتح الحساب الرسمي لمراجعة النقرات والتكلفة ومعدّل التحويل لرمز{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs" dir="ltr">
              {GOOGLE_ADS_CONVERSION_ID}
            </code>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <a href={GOOGLE_ADS_CAMPAIGN_LINKS.adsHome} target="_blank" rel="noreferrer">
            <Button type="button" variant="secondary" className="gap-2">
              نظرة عامة
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
          <a href={GOOGLE_ADS_CAMPAIGN_LINKS.campaigns} target="_blank" rel="noreferrer">
            <Button type="button" variant="secondary" className="gap-2">
              الحملات
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
          <a href={GOOGLE_ADS_CAMPAIGN_LINKS.conversions} target="_blank" rel="noreferrer">
            <Button type="button" variant="secondary" className="gap-2">
              التحويلات
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
          <a href={GOOGLE_ADS_CAMPAIGN_LINKS.reports} target="_blank" rel="noreferrer">
            <Button type="button" variant="secondary" className="gap-2">
              التقارير
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">سجل الأحداث من الموقع</CardTitle>
          <CardDescription>
            آخر التفاعلات التي أرسلها الوسم من هذا المتصفح (مشاهدات الصفحات وأحداث الاختبار /
            التحويل).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              لا أحداث بعد — تصفّح الموقع أو أرسل حدث اختبار أعلاه.
            </p>
          ) : (
            <div className="max-h-[22rem] overflow-auto rounded-lg border">
              <table className="w-full text-right text-sm">
                <thead className="sticky top-0 bg-muted/80">
                  <tr>
                    <th className="p-2 font-semibold">الوقت</th>
                    <th className="p-2 font-semibold">الحدث</th>
                    <th className="p-2 font-semibold">المسار</th>
                    <th className="p-2 font-semibold">ملاحظة</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((row) => (
                    <tr key={row.id} className="border-t border-border/60">
                      <td className="p-2 whitespace-nowrap text-xs" dir="ltr">
                        {formatWhen(row.at)}
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary">{row.name}</Badge>
                      </td>
                      <td className="p-2 font-mono text-xs" dir="ltr">
                        {row.path || '—'}
                      </td>
                      <td className="p-2 text-muted-foreground">{row.detail || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusTile({
  label,
  value,
  ok,
  mono,
}: {
  label: string;
  value: string;
  ok?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3">
      <p className="mb-1 text-xs font-semibold text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        {ok === true ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : null}
        {ok === false ? <XCircle className="h-4 w-4 shrink-0 text-rose-600" /> : null}
        <p className={`text-sm font-bold ${mono ? 'font-mono' : ''}`} dir={mono ? 'ltr' : undefined}>
          {value}
        </p>
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 text-center">
      <p className="text-3xl font-black tabular-nums">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
