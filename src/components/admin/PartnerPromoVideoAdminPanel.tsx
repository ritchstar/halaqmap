import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Trash2, Upload, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import {
  clearPartnerPromoVideo,
  commitPartnerPromoUpload,
  fetchPartnerPromoAdminStatus,
  requestPartnerPromoSignedUpload,
  setPartnerPromoEnabled,
  type PartnerPromoAdminStatus,
} from '@/lib/partnerPromoVideoAdminRemote';

type Props = {
  /** تحميل البيانات وعرض الحالة */
  canView: boolean;
  /** رفع وحذف وتفعيل */
  canManage: boolean;
};

function extFromFileName(name: string): string | null {
  const m = /\.([a-zA-Z0-9]+)$/.exec(name.trim());
  if (!m) return null;
  return m[1].toLowerCase();
}

export function PartnerPromoVideoAdminPanel({ canView, canManage }: Props) {
  const mounted = useRef(true);
  const [status, setStatus] = useState<PartnerPromoAdminStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!canView && !canManage) {
      if (mounted.current) setLoading(false);
      return;
    }
    if (mounted.current) setLoading(true);
    try {
      const s = await fetchPartnerPromoAdminStatus();
      if (mounted.current) {
        setStatus(s);
        setLoading(false);
      }
    } catch {
      if (mounted.current) {
        setStatus({ ok: false, enabled: false, videoUrl: null, objectPath: null, updatedAt: null, error: 'تعذر التحميل' });
        setLoading(false);
      }
    }
  }, [canManage, canView]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onUpload = async () => {
    if (!canManage || !file) {
      toast({ title: 'اختر ملف فيديو', variant: 'destructive' });
      return;
    }
    const ext = extFromFileName(file.name);
    if (!ext || !['mp4', 'webm', 'mov'].includes(ext)) {
      toast({ title: 'يُقبل فقط mp4 أو webm أو mov', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const begin = await requestPartnerPromoSignedUpload(ext);
      if (begin.ok === false) {
        toast({ title: 'تعذر تجهيز الرفع', description: begin.error, variant: 'destructive' });
        return;
      }
      const put = await fetch(begin.signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || begin.contentType,
        },
      });
      if (!put.ok) {
        toast({ title: 'فشل رفع الملف للتخزين', description: `HTTP ${put.status}`, variant: 'destructive' });
        return;
      }
      const committed = await commitPartnerPromoUpload(begin.path);
      if (!committed.ok) {
        toast({ title: 'تعذر حفظ الإعداد', description: committed.error, variant: 'destructive' });
        return;
      }
      setStatus(committed);
      setFile(null);
      toast({ title: 'تم رفع الفيديو', description: 'سيظهر لمسار الخدمات البرمجية للمنصة عند تفعيل العرض.' });
    } finally {
      setUploading(false);
    }
  };

  const onToggleEnabled = async (enabled: boolean) => {
    if (!canManage) return;
    const s = await setPartnerPromoEnabled(enabled);
    setStatus(s);
    if (!s.ok) {
      toast({ title: 'تعذر التحديث', description: s.error, variant: 'destructive' });
      return;
    }
    toast({ title: enabled ? 'تم تفعيل عرض الفيديو' : 'تم إيقاف عرض الفيديو' });
  };

  const onClear = async () => {
    if (!canManage) return;
    const s = await clearPartnerPromoVideo();
    setStatus(s);
    if (!s.ok) {
      toast({ title: 'تعذر المسح', description: s.error, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم حذف الفيديو من التخزين' });
  };

  if (!canView && !canManage) return null;

  return (
    <Card className="border-emerald-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Video className="h-5 w-5 text-primary" />
          فيديو مسار الخدمات البرمجية للمنصة (التخزين)
        </CardTitle>
        <CardDescription>
          ارفع ملفاً قصيراً (mp4 / webm / mov) — يُعرض تحت هيدر مسار الخدمات البرمجية للمنصة للزوار عند التفعيل. يتطلب تنفيذ ترحيل
          قاعدة البيانات رقم 47 على Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canManage && canView ? (
          <p className="text-sm text-muted-foreground rounded-md border border-dashed p-3">وضع عرض فقط — لا تملك صلاحية تعديل المحتوى التسويقي.</p>
        ) : null}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري التحميل…
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4">
              <div className="space-y-1 text-right">
                <p className="text-sm font-medium">عرض الفيديو للشركاء</p>
                <p className="text-xs text-muted-foreground">
                  {status?.objectPath ? `المسار: ${status.objectPath}` : 'لا يوجد ملف بعد'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">مفعّل</span>
                <Switch
                  checked={Boolean(status?.enabled)}
                  onCheckedChange={(v) => void onToggleEnabled(v)}
                  disabled={!canManage || !status?.objectPath}
                />
              </div>
            </div>

            {status?.videoUrl ? (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground mb-2">معاينة</p>
                <video key={status.videoUrl} className="aspect-video w-full max-w-md rounded-md border bg-black" src={status.videoUrl} controls playsInline />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="partner-promo-file">رفع فيديو جديد</Label>
              <Input
                id="partner-promo-file"
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                disabled={!canManage || uploading}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" className="gap-2" disabled={!canManage || uploading || !file} onClick={() => void onUpload()}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                رفع واستبدال
              </Button>
              <Button type="button" variant="destructive" className="gap-2" disabled={!canManage || uploading} onClick={() => void onClear()}>
                <Trash2 className="h-4 w-4" />
                حذف من التخزين
              </Button>
            </div>
            {status?.error && !loading ? (
              <p className="text-sm text-destructive">{status.error}</p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
