/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import { Activity, ExternalLink, Megaphone, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TIKTOK_ADS_CAMPAIGN_LINKS,
  TIKTOK_ADS_CLEAN_LANDING_URLS,
  TIKTOK_PIXEL_LABEL_AR,
} from '@/config/tiktokPixel';
import {
  clearTikTokEventLog,
  getTikTokPixelSnapshot,
  readTikTokEventLog,
  trackTikTokAdminPing,
  type TikTokTrackedEvent,
} from '@/lib/tiktokPixel';
import { toast } from 'sonner';

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ar-SA-u-ca-gregory-nu-latn', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  } catch {
    return iso;
  }
}

export function TikTokPixelCampaignPanel() {
  const [snapshot, setSnapshot] = useState(() => getTikTokPixelSnapshot());
  const [events, setEvents] = useState<TikTokTrackedEvent[]>(() => readTikTokEventLog());

  const refresh = useCallback(() => {
    setSnapshot(getTikTokPixelSnapshot());
    setEvents(readTikTokEventLog());
  }, []);

  useEffect(() => {
    refresh();
    const onEvt = () => refresh();
    window.addEventListener('halaqmap:tiktok-pixel-event', onEvt);
    window.addEventListener('halaqmap:tiktok-pixel-event-cleared', onEvt);
    const iv = window.setInterval(refresh, 8_000);
    return () => {
      window.removeEventListener('halaqmap:tiktok-pixel-event', onEvt);
      window.removeEventListener('halaqmap:tiktok-pixel-event-cleared', onEvt);
      window.clearInterval(iv);
    };
  }, [refresh]);

  const sendTestHit = () => {
    if (!snapshot.configured) {
      toast.error('أضف `VITE_TIKTOK_PIXEL_ID` في Vercel ثم أعد النشر.');
      return;
    }
    const ok = trackTikTokAdminPing();
    refresh();
    if (ok) toast.success('أُرسل حدث اختبار إلى بكسل تيك توك');
    else toast.error('البكسل لم يُحمَّل بعد — انتظر ثوانٍ ثم أعد المحاولة.');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-card to-card">
        <CardHeader className="space-y-2">
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
            <Megaphone className="h-5 w-5 text-cyan-600" />
            {TIKTOK_PIXEL_LABEL_AR}
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            التحويل المعتمد هو دفع رخصة الإدراج (`CompletePayment`). طلب التسجيل
            (`CompleteRegistration`) إحالة وسيطة. الأرقام الكاملة تظهر في مدير أحداث تيك توك.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={snapshot.configured ? 'default' : 'destructive'}>
              {snapshot.configured ? 'المعرّف مضبوط' : 'المعرّف غير مضبوط'}
            </Badge>
            <Badge variant={snapshot.loaded ? 'default' : 'secondary'}>
              {snapshot.loaded ? 'البكسل محمّل' : 'بانتظار التحميل'}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground" dir="ltr">
              {snapshot.pixelId || 'VITE_TIKTOK_PIXEL_ID'}
            </span>
          </div>

          <ol className="list-decimal space-y-1 pe-5 text-sm leading-relaxed text-muted-foreground">
            <li>في Business Center: Assets ← Pixels ← Add a pixel، الاسم: حلاق ماب.</li>
            <li>انسخ Pixel ID والصقه في Vercel كـ `VITE_TIKTOK_PIXEL_ID` ثم Redeploy.</li>
            <li>
              في مدير الأحداث اربط `CompletePayment` كتحويل للحملة، و`CompleteRegistration` كهدف وسيط.
            </li>
            <li>روابط الإعلان بدون `#` — تيك توك يضيف `ttclid` تلقائياً.</li>
          </ol>

          <div className="rounded-md border border-cyan-500/30 bg-cyan-500/5 p-2.5 text-xs leading-relaxed">
            <p className="font-semibold text-cyan-900 dark:text-cyan-100">روابط هبوط (بدون #)</p>
            <ul className="mt-1 space-y-1 font-mono text-[0.7rem]" dir="ltr">
              <li>
                <a
                  className="text-primary underline"
                  href={TIKTOK_ADS_CLEAN_LANDING_URLS.partners}
                  target="_blank"
                  rel="noreferrer"
                >
                  {TIKTOK_ADS_CLEAN_LANDING_URLS.partners}
                </a>
              </li>
              <li>
                <a
                  className="text-primary underline"
                  href={TIKTOK_ADS_CLEAN_LANDING_URLS.register}
                  target="_blank"
                  rel="noreferrer"
                >
                  {TIKTOK_ADS_CLEAN_LANDING_URLS.register}
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={sendTestHit}>
              <Activity className="ms-1 h-4 w-4" />
              حدث اختبار
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={refresh}>
              <RefreshCw className="ms-1 h-4 w-4" />
              تحديث
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                clearTikTokEventLog();
                refresh();
              }}
            >
              <Trash2 className="ms-1 h-4 w-4" />
              مسح السجل المحلي
            </Button>
            <Button type="button" size="sm" variant="ghost" asChild>
              <a href={TIKTOK_ADS_CAMPAIGN_LINKS.eventsManager} target="_blank" rel="noreferrer">
                <ExternalLink className="ms-1 h-4 w-4" />
                مدير الأحداث
              </a>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            أحداث محلية: {snapshot.eventCount}
            {snapshot.lastEventAt ? ` · آخرها ${formatWhen(snapshot.lastEventAt)}` : ''}
          </p>
          {events.length > 0 ? (
            <ul className="max-h-40 space-y-1 overflow-auto text-xs">
              {events.slice(0, 12).map((row) => (
                <li key={row.id} className="rounded border bg-muted/40 px-2 py-1">
                  <span className="font-mono">{row.name}</span>
                  {row.detail ? <span className="text-muted-foreground"> · {row.detail}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
