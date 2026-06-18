import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Copy,
  Eye,
  Loader2,
  MessageSquare,
  RefreshCw,
  Store,
  Wifi,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { BarberPortalSession } from '@/lib/barberPortalLoginRemote';
import {
  fetchOwnerSalonWatchRemote,
  type OwnerSalonWatchAlert,
  type OwnerSalonWatchSnapshot,
} from '@/lib/ownerSalonWatchRemote';
import { isPollingTabActive, POLL_MS } from '@/lib/pollingPolicy';
import { buildBarberOwnerWatchPageUrl } from '@/lib/ownerSalonWatchLinks';

type Props = {
  barberData: BarberPortalSession;
};

function severityBadgeVariant(severity: OwnerSalonWatchAlert['severity']): 'default' | 'secondary' | 'destructive' {
  if (severity === 'urgent') return 'destructive';
  if (severity === 'watch') return 'default';
  return 'secondary';
}

function severityLabelAr(severity: OwnerSalonWatchAlert['severity']): string {
  if (severity === 'urgent') return 'عاجل';
  if (severity === 'watch') return 'مراقبة';
  return 'معلومة';
}

function formatTimeAr(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
}

function AlertList({ items, emptyText }: { items: OwnerSalonWatchAlert[]; emptyText: string }) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground leading-relaxed">{emptyText}</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((item, idx) => (
        <li
          key={`${item.createdAt}-${idx}`}
          className="rounded-xl border border-border/70 bg-background/60 px-3 py-3 sm:px-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={severityBadgeVariant(item.severity)} className="text-[10px] sm:text-xs">
              {severityLabelAr(item.severity)}
            </Badge>
            <span className="text-[11px] text-muted-foreground">{formatTimeAr(item.createdAt)}</span>
          </div>
          <p className="mt-2 text-sm font-semibold">{item.titleAr}</p>
          {item.bodyAr ? (
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.bodyAr}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function BarberOwnerWatchPanel({ barberData }: Props) {
  const [snapshot, setSnapshot] = useState<OwnerSalonWatchSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSnapshot = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      else setRefreshing(true);
      const res = await fetchOwnerSalonWatchRemote({
        barberId: barberData.id,
        email: barberData.email,
      });
      if (!opts?.silent) setLoading(false);
      setRefreshing(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setError(null);
      setSnapshot(res.snapshot);
    },
    [barberData.email, barberData.id],
  );

  useEffect(() => {
    void loadSnapshot();
  }, [loadSnapshot]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!isPollingTabActive()) return;
      void loadSnapshot({ silent: true });
    }, POLL_MS.OWNER_SALON_WATCH);
    return () => window.clearInterval(interval);
  }, [loadSnapshot]);

  if (loading && !snapshot) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" aria-hidden />
        <span className="sr-only">جاري تحميل غرفة المراقبة…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="border-amber-500/35 bg-gradient-to-l from-amber-500/10 via-violet-500/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            غرفة المراقبة — قراءة فقط
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            تابع حالة صالونك من بعيد دون التدخل في محادثات الزبائن. لا تُعرض نصوص الرسائل هنا — فقط
            مؤشرات التشغيل والتنبيهات.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-amber-500/40 bg-amber-500/15 text-amber-950 dark:text-amber-100">
              <Wifi className="ml-1 h-3 w-3" />
              مراقبة حية
            </Badge>
            {snapshot ? (
              <span className="text-xs text-muted-foreground">
                آخر تحديث: {formatTimeAr(snapshot.collectedAt)}
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 shrink-0 border-amber-500/35"
              onClick={async () => {
                const link = buildBarberOwnerWatchPageUrl();
                if (!link) {
                  toast.error('تعذر توليد الرابط من المتصفح.');
                  return;
                }
                try {
                  await navigator.clipboard.writeText(link);
                  toast.success('تم نسخ رابط غرفة المراقبة — احفظه في مفضلة جوالك.');
                } catch {
                  toast.error('تعذر النسخ من المتصفح.');
                }
              }}
            >
              <Copy className="h-4 w-4" />
              نسخ رابط المراقبة
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              disabled={refreshing}
              onClick={() => void loadSnapshot({ silent: true })}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث الآن
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {snapshot ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-xs">
                  <Store className="h-4 w-4" />
                  حالة المحل
                </CardDescription>
                <CardTitle className="text-xl">
                  {snapshot.shopOpen ? 'مفتوح للعملاء' : 'مغلق للعملاء'}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-xs">
                  <MessageSquare className="h-4 w-4" />
                  محادثات نشطة
                </CardDescription>
                <CardTitle className="text-xl">{snapshot.activeConversations}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">محادثات بدأت اليوم</CardDescription>
                <CardTitle className="text-xl">{snapshot.conversationsStartedToday}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-xs">
                  <Activity className="h-4 w-4" />
                  نبض تشغيلي
                </CardDescription>
                <CardTitle className="text-xl">
                  {snapshot.operationalPulse
                    ? severityLabelAr(snapshot.operationalPulse.severity)
                    : 'لا بيانات بعد'}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {snapshot.operationalPulse ? (
            <Card className="border-violet-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">ملخص النبض التشغيلي</CardTitle>
                <CardDescription className="text-xs">
                  آخر تقرير: {formatTimeAr(snapshot.operationalPulse.reportedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-relaxed">{snapshot.operationalPulse.summaryAr}</p>
                <div className="flex flex-wrap gap-2">
                  {snapshot.operationalPulse.walletLow ? (
                    <Badge variant="destructive">رصيد منخفض</Badge>
                  ) : null}
                  {snapshot.operationalPulse.stagnant ? (
                    <Badge variant="default">ركود في الطلب</Badge>
                  ) : null}
                  {snapshot.operationalPulse.listingDaysRemaining != null ? (
                    <Badge variant="secondary">
                      {snapshot.operationalPulse.listingDaysRemaining} يوم إدراج
                    </Badge>
                  ) : null}
                  <Badge variant="outline">احتكاك: {snapshot.operationalPulse.frictionScore}%</Badge>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">تنبيهات المناوب</CardTitle>
              <CardDescription className="text-sm">توصيات نشطة من المناوب الذكي — بدون تفاصيل زبون.</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertList items={snapshot.alerts} emptyText="لا تنبيهات نشطة حالياً." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">سجل الأحداث</CardTitle>
              <CardDescription className="text-sm">آخر الأحداث التشغيلية المسجّلة للصالون.</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertList items={snapshot.recentEvents} emptyText="لا أحداث مسجّلة بعد." />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
