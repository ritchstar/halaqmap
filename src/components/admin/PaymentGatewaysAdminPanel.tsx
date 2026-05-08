import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchPlatformPaymentSettingsAdmin,
  savePlatformPaymentSettingsAdmin,
  type PlatformPaymentMonitoring,
  type PlatformPaymentSettingsPayload,
} from '@/lib/platformPaymentSettingsRemote';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CreditCard, Loader2, RefreshCw, Shield } from 'lucide-react';

type Props = {
  canSave: boolean;
};

const emptySettings: PlatformPaymentSettingsPayload = {
  preferred_gateway: 'MOYASAR',
  display_payment_mode: 'test',
  enable_moyasar_card: true,
  enable_sab_gateway: false,
  enable_bank_transfer_semiannual: true,
  enable_internal_onboarding_email: true,
  enable_whatsapp_payment_notify: false,
  enable_resend_payment_receipt: true,
  enforce_price_currency_match: true,
  bank_display_name_ar: '',
  bank_beneficiary_name: '',
  bank_iban: '',
  updated_at: null,
  updated_by_email: null,
};

export function PaymentGatewaysAdminPanel({ canSave }: Props) {
  const mounted = useRef(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PlatformPaymentSettingsPayload>(emptySettings);
  const [monitoring, setMonitoring] = useState<PlatformPaymentMonitoring | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchPlatformPaymentSettingsAdmin();
      if (!mounted.current) return;
      if (r.ok === false) {
        toast({ title: 'تعذر تحميل إعدادات الدفع', description: r.error, variant: 'destructive' });
        setLoading(false);
        return;
      }
      setSettings(r.settings);
      setMonitoring(r.monitoring);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const patch = (partial: Partial<PlatformPaymentSettingsPayload>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleSave = async () => {
    if (!canSave) {
      toast({ title: 'لا تملك صلاحية الحفظ', description: 'يلزم صلاحية إعدادات المنصة.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const r = await savePlatformPaymentSettingsAdmin(settings);
      if (r.ok === false) {
        toast({ title: 'فشل الحفظ', description: r.error, variant: 'destructive' });
        return;
      }
      setSettings(r.settings);
      toast({ title: 'تم حفظ إعدادات بوابات الدفع' });
      void refresh();
    } finally {
      setSaving(false);
    }
  };

  const subTotal = monitoring
    ? Object.values(monitoring.subscriptionsByStatus).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5 text-primary" />
              بوابات الدفع والتحكم
            </CardTitle>
            <CardDescription className="mt-2 max-w-2xl leading-relaxed">
              تحكم في القنوات المعروضة للشركاء، أتمتة البريد وواتساب بعد الدفع، ومراقبة الاشتراكات وأحداث الأمان.
              المفاتيح السرية تبقى في متغيرات الخادم فقط.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="mr-2">تحديث</span>
            </Button>
            <Button type="button" size="sm" onClick={() => void handleSave()} disabled={saving || loading || !canSave}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span className={saving ? 'mr-2' : ''}>حفظ التغييرات</span>
            </Button>
          </div>
        </CardHeader>
        {!canSave && (
          <CardContent className="pt-0">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                عرض فقط — لحفظ التعديلات يلزم <strong>تعديل إعدادات بوابات الدفع</strong> أو (للتوافق الرجعي){' '}
                <strong>عرض الإعدادات العامة</strong> في صلاحيات المشرف.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">البوابة والوضع</CardTitle>
            <CardDescription>أي بوابة تُفضّل للبطاقات، ووضع العرض للفريق (لا يغيّر مفاتيح API تلقائياً).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>بوابة البطاقات المفضّلة</Label>
              <Select
                value={settings.preferred_gateway}
                onValueChange={(v) => patch({ preferred_gateway: v === 'SAB' ? 'SAB' : 'MOYASAR' })}
                disabled={!canSave || loading}
              >
                <SelectTrigger dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOYASAR">ميسر (Moyasar)</SelectItem>
                  <SelectItem value="SAB">بنك الأول (SAB) — عند التفعيل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>وضع العرض للإدارة</Label>
              <Select
                value={settings.display_payment_mode}
                onValueChange={(v) => patch({ display_payment_mode: v === 'live' ? 'live' : 'test' })}
                disabled={!canSave || loading}
              >
                <SelectTrigger dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test">اختبار (Sandbox)</SelectItem>
                  <SelectItem value="live">إنتاج (Live)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 p-3">
              <div>
                <p className="text-sm font-medium">دفع بالبطاقة عبر ميسر</p>
                <p className="text-xs text-muted-foreground">إظهار خيار ميسر في صفحة الدفع</p>
              </div>
              <Switch
                checked={settings.enable_moyasar_card}
                onCheckedChange={(c) => patch({ enable_moyasar_card: c })}
                disabled={!canSave || loading}
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 p-3">
              <div>
                <p className="text-sm font-medium">مسار بنك الأول (SAB)</p>
                <p className="text-xs text-muted-foreground">تفعيل العرض عند اكتمال ربط البنك</p>
              </div>
              <Switch
                checked={settings.enable_sab_gateway}
                onCheckedChange={(c) => patch({ enable_sab_gateway: c })}
                disabled={!canSave || loading}
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 p-3">
              <div>
                <p className="text-sm font-medium">تحويل بنكي (اشتراك نصف سنوي)</p>
                <p className="text-xs text-muted-foreground">إظهار قسم التحويل ورفع الإيصال</p>
              </div>
              <Switch
                checked={settings.enable_bank_transfer_semiannual}
                onCheckedChange={(c) => patch({ enable_bank_transfer_semiannual: c })}
                disabled={!canSave || loading}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-4 w-4 text-primary" />
              الأتمتة والأمان
            </CardTitle>
            <CardDescription>ما يحدث تلقائياً بعد تأكيد الدفع من الـ webhook الموثوق.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 p-3">
              <div>
                <p className="text-sm font-medium">بريد الترحيب (لوحة التحكم)</p>
                <p className="text-xs text-muted-foreground">استدعاء /api/send-barber-onboarding</p>
              </div>
              <Switch
                checked={settings.enable_internal_onboarding_email}
                onCheckedChange={(c) => patch({ enable_internal_onboarding_email: c })}
                disabled={!canSave || loading}
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 p-3">
              <div>
                <p className="text-sm font-medium">واتساب بعد الدفع</p>
                <p className="text-xs text-muted-foreground">يشترط تفعيل المزود في متغيرات Vercel</p>
              </div>
              <Switch
                checked={settings.enable_whatsapp_payment_notify}
                onCheckedChange={(c) => patch({ enable_whatsapp_payment_notify: c })}
                disabled={!canSave || loading}
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 p-3">
              <div>
                <p className="text-sm font-medium">رسالة تأكيد الدفع (Resend)</p>
                <p className="text-xs text-muted-foreground">البريد الصادر من الـ webhook مباشرة</p>
              </div>
              <Switch
                checked={settings.enable_resend_payment_receipt}
                onCheckedChange={(c) => patch({ enable_resend_payment_receipt: c })}
                disabled={!canSave || loading}
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <div>
                <p className="text-sm font-medium">فرض تطابق المبلغ والعملة</p>
                <p className="text-xs text-muted-foreground">يمنع التفعيل عند اختلاف السعر عن الباقة</p>
              </div>
              <Switch
                checked={settings.enforce_price_currency_match}
                onCheckedChange={(c) => patch({ enforce_price_currency_match: c })}
                disabled={!canSave || loading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">بيانات التحويل البنكي (للعرض في صفحة الدفع)</CardTitle>
          <CardDescription>
            إن تُركت فارغة تُستخدم قيم <span dir="ltr">VITE_BANK_TRANSFER_*</span> من بيئة البناء.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-3">
            <Label>اسم البنك (عربي)</Label>
            <Input
              value={settings.bank_display_name_ar}
              onChange={(e) => patch({ bank_display_name_ar: e.target.value })}
              disabled={!canSave || loading}
              placeholder="مثال: البنك الأول السعودي"
            />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label>اسم المستفيد</Label>
            <Input
              value={settings.bank_beneficiary_name}
              onChange={(e) => patch({ bank_beneficiary_name: e.target.value })}
              disabled={!canSave || loading}
              dir="ltr"
              className="text-left font-mono"
            />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label>الآيبان IBAN</Label>
            <Input
              value={settings.bank_iban}
              onChange={(e) => patch({ bank_iban: e.target.value.replace(/\s+/g, '') })}
              disabled={!canSave || loading}
              dir="ltr"
              className="text-left font-mono"
              placeholder="SA..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">مراقبة سريعة</CardTitle>
          {settings.updated_at && (
            <Badge variant="outline" className="font-normal">
              آخر تحديث: {new Date(settings.updated_at).toLocaleString('ar-SA')}
              {settings.updated_by_email ? ` — ${settings.updated_by_email}` : ''}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && !monitoring ? (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> جاري تحميل الإحصائيات…
            </p>
          ) : monitoring ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">اشتراكات ميسر (إجمالي سجلات)</p>
                  <p className="text-2xl font-bold">{subTotal}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">أحداث أمان (7 أيام)</p>
                  <p className="text-2xl font-bold">{monitoring.securityEventsLast7d}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">حرجة</p>
                  <p className="text-xl font-semibold text-destructive">
                    {monitoring.securityBySeverity.critical ?? 0}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">تنبيه</p>
                  <p className="text-xl font-semibold text-amber-600">
                    {monitoring.securityBySeverity.warning ?? 0}
                  </p>
                </div>
              </div>
              {Object.keys(monitoring.subscriptionsByStatus).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">اشتراكات البطاقة حسب الحالة</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(monitoring.subscriptionsByStatus).map(([k, v]) => (
                      <Badge key={k} variant="secondary">
                        {k}: {v}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {monitoring.securityByTypeTop.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">أكثر أحداث الأمان (7 أيام)</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {monitoring.securityByTypeTop.map((row) => (
                      <li key={row.event_type} dir="ltr" className="flex justify-between gap-4 border-b border-border/50 py-1">
                        <span className="font-mono text-xs">{row.event_type}</span>
                        <span>{row.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">لا بيانات مراقبة بعد.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
