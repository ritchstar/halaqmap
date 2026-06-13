import { useCallback, useEffect, useState } from 'react';
import { Bell, Radio, Smartphone, Volume2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BARBER_CHAT_ALERT_HOME_TONE_LABELS,
  BARBER_CHAT_ALERT_MESSAGE_TONE_LABELS,
  BARBER_CHAT_ALERT_VOLUME_LABELS,
  DEFAULT_BARBER_CHAT_ALERT_PREFS,
  readBarberChatAlertPrefs,
  writeBarberChatAlertPrefs,
  type BarberChatAlertPrefs,
} from '@/lib/barberDashboardChatAlertPrefs';
import { playBarberChatAlert } from '@/lib/barberDashboardChatAlertSound';
import {
  ensureBarberPushSubscription,
  fetchBarberChatPushConfig,
  removeBarberPushSubscription,
} from '@/lib/barberChatPushRemote';
import { registerAppServiceWorker } from '@/lib/registerAppServiceWorker';
import type { BarberCommunicationAlertsState } from '@/hooks/useBarberCommunicationAlerts';
import { toast } from 'sonner';

function realtimeStatusLabel(status: BarberCommunicationAlertsState['realtimeStatus']): string {
  if (status === 'connected') return 'متصل — فوري';
  if (status === 'loading') return 'جاري الاتصال…';
  if (status === 'polling_fallback') return 'احتياطي — استطلاع';
  if (status === 'unavailable') return 'غير متاح';
  return '—';
}

export function BarberChatAlertSettingsCard({
  barberId,
  barberEmail,
  alertState,
}: {
  barberId: string;
  barberEmail: string;
  alertState: BarberCommunicationAlertsState;
}) {
  const [prefs, setPrefs] = useState<BarberChatAlertPrefs>(() =>
    barberId ? readBarberChatAlertPrefs(barberId) : DEFAULT_BARBER_CHAT_ALERT_PREFS,
  );
  const [pushConfigured, setPushConfigured] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    if (!barberId) return;
    setPrefs(readBarberChatAlertPrefs(barberId));
  }, [barberId]);

  useEffect(() => {
    void fetchBarberChatPushConfig().then((res) => {
      if (res.ok) setPushConfigured(res.pushConfigured);
    });
  }, []);

  const save = (next: BarberChatAlertPrefs) => {
    setPrefs(next);
    writeBarberChatAlertPrefs(barberId, next);
  };

  const togglePush = useCallback(async (enabled: boolean) => {
    if (!barberId || !barberEmail) return;
    setPushBusy(true);
    try {
      if (!enabled) {
        await removeBarberPushSubscription({ barberId, email: barberEmail });
        save({ ...prefs, pushEnabled: false });
        toast.message('تم إيقاف إشعارات الجهاز');
        return;
      }
      await registerAppServiceWorker();
      const cfg = await fetchBarberChatPushConfig();
      if (!cfg.ok || !cfg.pushConfigured || !cfg.vapidPublicKey) {
        toast.error('إشعارات الجهاز غير مفعّلة على الخادم بعد.');
        return;
      }
      const sub = await ensureBarberPushSubscription({
        barberId,
        email: barberEmail,
        vapidPublicKey: cfg.vapidPublicKey,
      });
      if (!sub.ok) {
        toast.error(sub.error);
        return;
      }
      save({ ...prefs, pushEnabled: true });
      toast.success('تم تفعيل إشعارات الجهاز — قدر الإمكان عند إغلاق اللوحة.');
    } finally {
      setPushBusy(false);
    }
  }, [barberEmail, barberId, prefs]);

  return (
    <Card className="border-amber-500/25 bg-gradient-to-br from-amber-500/[0.06] to-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
          <Bell className="h-5 w-5 text-amber-600" />
          تنبيهات التواصل
          <Badge variant="outline" className="gap-1 text-[10px] font-normal">
            <Radio className="h-3 w-3" />
            {realtimeStatusLabel(alertState.realtimeStatus)}
          </Badge>
        </CardTitle>
        <CardDescription className="leading-relaxed">
          صوت فوري داخل اللوحة عند رسالة عميل أو طلب زيارة منزلية — مع إشعار للجهاز عند إغلاق
          التبويب. يتطلب الشات الحي جلسة حسابك على المنصة (وليس الرمز الموحّد فقط) لتفعيل
          `Realtime` الفوري؛ وإلا يُستخدم الاستطلاع الاحتياطي.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">تفعيل التنبيه الصوتي</p>
            <p className="text-xs text-muted-foreground">داخل لوحة التحكم عندما يكون التبويب ظاهراً.</p>
          </div>
          <Switch
            checked={prefs.enabled}
            onCheckedChange={(checked) => save({ ...prefs, enabled: checked === true })}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium">
              <Smartphone className="h-4 w-4" />
              إشعار الجهاز (`Web Push`)
            </p>
            <p className="text-xs text-muted-foreground">
              {pushConfigured
                ? 'يُرسل قدر الإمكان عند إغلاق اللوحة — يحتاج إذن المتصفح.'
                : 'غير مفعّل على الخادم — أضف مفاتيح VAPID في Vercel.'}
            </p>
          </div>
          <Switch
            checked={prefs.pushEnabled}
            disabled={!pushConfigured || pushBusy}
            onCheckedChange={(checked) => void togglePush(checked === true)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">مستوى الصوت</Label>
            <Select
              value={prefs.volume}
              disabled={!prefs.enabled}
              onValueChange={(value) =>
                save({
                  ...prefs,
                  volume: value as BarberChatAlertPrefs['volume'],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(BARBER_CHAT_ALERT_VOLUME_LABELS) as BarberChatAlertPrefs['volume'][]).map(
                  (key) => (
                    <SelectItem key={key} value={key}>
                      {BARBER_CHAT_ALERT_VOLUME_LABELS[key]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">كتم المحادثة المفتوحة</Label>
            <div className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3">
              <span className="text-sm">بدون صوت للجلسة المعروضة</span>
              <Switch
                checked={prefs.muteWhenChatOpen}
                disabled={!prefs.enabled}
                onCheckedChange={(checked) =>
                  save({ ...prefs, muteWhenChatOpen: checked === true })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">صوت رسالة عادية</Label>
            <Select
              value={prefs.messageTone}
              disabled={!prefs.enabled}
              onValueChange={(value) =>
                save({
                  ...prefs,
                  messageTone: value as BarberChatAlertPrefs['messageTone'],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.keys(BARBER_CHAT_ALERT_MESSAGE_TONE_LABELS) as BarberChatAlertPrefs['messageTone'][]
                ).map((key) => (
                  <SelectItem key={key} value={key}>
                    {BARBER_CHAT_ALERT_MESSAGE_TONE_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">صوت طلب زيارة منزلية</Label>
            <Select
              value={prefs.homeVisitTone}
              disabled={!prefs.enabled}
              onValueChange={(value) =>
                save({
                  ...prefs,
                  homeVisitTone: value as BarberChatAlertPrefs['homeVisitTone'],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.keys(BARBER_CHAT_ALERT_HOME_TONE_LABELS) as BarberChatAlertPrefs['homeVisitTone'][]
                ).map((key) => (
                  <SelectItem key={key} value={key}>
                    {BARBER_CHAT_ALERT_HOME_TONE_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!prefs.enabled}
            onClick={() => playBarberChatAlert('message', prefs)}
          >
            <Volume2 className="h-4 w-4" />
            تجربة رسالة
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!prefs.enabled}
            onClick={() => playBarberChatAlert('home_visit', prefs)}
          >
            <Volume2 className="h-4 w-4" />
            تجربة زيارة منزلية
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
