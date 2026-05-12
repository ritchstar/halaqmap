import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, ImageIcon, RefreshCw, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import {
  adminPurgeOldPlatformLogsRemote,
  adminPurgePartnerPromoStorageRemote,
  adminPurgeRegistrationStorageRemote,
  fetchPlatformResourceSnapshot,
  formatBytesArabic,
  getConfiguredStorageQuotaGb,
  type PlatformResourceSnapshot,
} from '@/lib/adminResourceMetricsRemote';
import {
  PLATFORM_PROFESSIONAL_UPGRADE_STATUS_AR,
  PLATFORM_RESOURCE_GOVERNANCE_NOTE_AR,
} from '@/config/platformPlanStatus';

const PURGE_REG_PHRASE = 'مسح تخزين التسجيل';
const PURGE_PROMO_PHRASE = 'مسح فيديو الشركاء';

type Props = {
  isActive: boolean;
};

export function ResourceManagementSection({ isActive }: Props) {
  const [snap, setSnap] = useState<PlatformResourceSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [purgeRegPhrase, setPurgeRegPhrase] = useState('');
  const [purgePromoPhrase, setPurgePromoPhrase] = useState('');
  const [logDays, setLogDays] = useState('30');
  const [busy, setBusy] = useState<'reg' | 'promo' | 'logs' | null>(null);

  const quotaGb = useMemo(() => getConfiguredStorageQuotaGb(), []);
  const quotaBytes = quotaGb * 1024 * 1024 * 1024;

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetchPlatformResourceSnapshot();
    setLoading(false);
    if (!r.ok) {
      toast({ title: 'تعذر تحميل تقرير الموارد', description: r.error, variant: 'destructive' });
      setSnap(null);
      return;
    }
    setSnap(r.data);
  }, []);

  useEffect(() => {
    if (isActive) void load();
  }, [isActive, load]);

  const totalUsedBytes = snap
    ? snap.registration_uploads.approx_bytes + snap.partner_promo.approx_bytes
    : 0;
  const pct = Math.min(100, quotaBytes > 0 ? (totalUsedBytes / quotaBytes) * 100 : 0);

  const onPurgeReg = async () => {
    if (purgeRegPhrase.trim() !== PURGE_REG_PHRASE) {
      toast({
        title: 'عبارة التأكيد غير صحيحة',
        description: `اكتب بالضبط: ${PURGE_REG_PHRASE}`,
        variant: 'destructive',
      });
      return;
    }
    setBusy('reg');
    const r = await adminPurgeRegistrationStorageRemote();
    setBusy(null);
    setPurgeRegPhrase('');
    if (!r.ok) {
      toast({ title: 'تعذر المسح', description: r.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم مسح تخزين التسجيل', description: JSON.stringify(r.result) });
    void load();
  };

  const onPurgePromo = async () => {
    if (purgePromoPhrase.trim() !== PURGE_PROMO_PHRASE) {
      toast({
        title: 'عبارة التأكيد غير صحيحة',
        description: `اكتب بالضبط: ${PURGE_PROMO_PHRASE}`,
        variant: 'destructive',
      });
      return;
    }
    setBusy('promo');
    const r = await adminPurgePartnerPromoStorageRemote();
    setBusy(null);
    setPurgePromoPhrase('');
    if (!r.ok) {
      toast({ title: 'تعذر المسح', description: r.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم مسح تخزين partner-promo', description: JSON.stringify(r.result) });
    void load();
  };

  const onPurgeLogs = async () => {
    const d = Math.floor(Number.parseInt(logDays, 10));
    if (!Number.isFinite(d) || d < 1) {
      toast({ title: 'عدد الأيام غير صالح', variant: 'destructive' });
      return;
    }
    if (!window.confirm(`حذف سجلات أقدم من ${d} يوماً من جداول البحث وأمان الدفع؟`)) return;
    setBusy('logs');
    const r = await adminPurgeOldPlatformLogsRemote(d);
    setBusy(null);
    if (!r.ok) {
      toast({ title: 'تعذر تنظيف السجلات', description: r.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم تنظيف السجلات القديمة', description: JSON.stringify(r.result) });
    void load();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-1">مراقبة الموارد</h2>
        <p className="text-sm text-muted-foreground">{PLATFORM_RESOURCE_GOVERNANCE_NOTE_AR}</p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>حالة الخطة</AlertTitle>
        <AlertDescription>{PLATFORM_PROFESSIONAL_UPGRADE_STATUS_AR}</AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HardDrive className="h-5 w-5" />
              التخزين والسجلات (لقطة حية)
            </CardTitle>
            <CardDescription>
              الأحجام من metadata في Storage (تقريبية). الحصة الافتراضية للعرض: {quotaGb} جيجابايت — اضبط{' '}
              <span dir="ltr" className="font-mono text-xs">
                VITE_SUPABASE_STORAGE_QUOTA_GB
              </span>{' '}
              في البناء لمطابقة لوحة Supabase.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => void load()}>
            {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <RefreshCw className="ml-2 h-4 w-4" />}
            تحديث
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {snap ? (
            <>
              <div>
                <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">استهلاك تخزين مُقدَّر (حاويتان رئيسيتان)</span>
                  <span className="font-medium" dir="ltr">
                    {formatBytesArabic(totalUsedBytes)} / ~{quotaGb} GB
                  </span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border/80 p-4">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    registration-uploads
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>الكائنات: {snap.registration_uploads.object_count.toLocaleString('ar-SA')}</li>
                    <li>البنرات (مسار banners): {snap.registration_uploads.banner_object_count.toLocaleString('ar-SA')}</li>
                    <li>الحجم التقريبي: {formatBytesArabic(snap.registration_uploads.approx_bytes)}</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-border/80 p-4">
                  <p className="text-sm font-semibold">partner-promo</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>الكائنات: {snap.partner_promo.object_count.toLocaleString('ar-SA')}</li>
                    <li>الحجم التقريبي: {formatBytesArabic(snap.partner_promo.approx_bytes)}</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-lg border border-border/80 p-4">
                <p className="text-sm font-semibold mb-2">سجلات قاعدة البيانات</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>search_activity_logs: {snap.logs.search_activity_logs_count.toLocaleString('ar-SA')}</li>
                  <li>payment_security_events: {snap.logs.payment_security_events_count.toLocaleString('ar-SA')}</li>
                </ul>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              {loading ? 'جاري التحميل…' : 'لا توجد بيانات. اضغط «تحديث» أو نفّذ ترحيل قاعدة البيانات 66.'}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            تنظيف شامل (المالك فقط)
          </CardTitle>
          <CardDescription>
            يتطلب حساب bootstrap في JWT. يُنصح بنسخة احتياطية قبل المسح. مسح التسجيل يزيل كل مرفقات الطلبات من
            التخزين.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>تأكيد مسح حاوية تسجيل الشركاء (registration-uploads)</Label>
            <p className="text-xs text-muted-foreground">اكتب: {PURGE_REG_PHRASE}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input value={purgeRegPhrase} onChange={(e) => setPurgeRegPhrase(e.target.value)} dir="rtl" />
              <Button
                type="button"
                variant="destructive"
                disabled={busy !== null}
                onClick={() => void onPurgeReg()}
              >
                {busy === 'reg' ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                تنفيذ
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>تأكيد مسح حاوية الفيديو الترويجي (partner-promo)</Label>
            <p className="text-xs text-muted-foreground">
              قد يعطل الفيديو حتى إعادة الرفع. اكتب: {PURGE_PROMO_PHRASE}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input value={purgePromoPhrase} onChange={(e) => setPurgePromoPhrase(e.target.value)} dir="rtl" />
              <Button
                type="button"
                variant="destructive"
                disabled={busy !== null}
                onClick={() => void onPurgePromo()}
              >
                {busy === 'promo' ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                تنفيذ
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="log-retention-days">حذف سجلات أقدم من (أيام)</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <Input
                id="log-retention-days"
                type="number"
                min={1}
                max={3650}
                value={logDays}
                onChange={(e) => setLogDays(e.target.value)}
                className="sm:max-w-[120px]"
              />
              <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void onPurgeLogs()}>
                {busy === 'logs' ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                تنظيف السجلات القديمة
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              يحذف من search_activity_logs و payment_security_events ما هو أقدم من العدد المحدد.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
