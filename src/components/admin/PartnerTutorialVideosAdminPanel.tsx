import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Trash2, Upload, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  createTutorialVideo,
  deleteTutorialVideo,
  fetchTutorialVideosAdmin,
  requestTutorialVideoSignedUpload,
  setTutorialSectionEnabled,
  updateTutorialVideo,
  type TutorialVideoAdminRow,
} from '@/lib/partnerTutorialVideosAdminRemote';

type Props = { canView: boolean; canManage: boolean };

function extFromFileName(name: string): string | null {
  const m = /\.([a-zA-Z0-9]+)$/.exec(name.trim());
  return m ? m[1].toLowerCase() : null;
}

export function PartnerTutorialVideosAdminPanel({ canView, canManage }: Props) {
  const mounted = useRef(true);
  const [rows, setRows] = useState<TutorialVideoAdminRow[]>([]);
  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState('0');

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetchTutorialVideosAdmin();
    if (!mounted.current) return;
    if (res.ok === false) {
      setLoading(false);
      toast({ title: 'تعذر تحميل فيديوهات الشرح', description: res.error, variant: 'destructive' });
      return;
    }
    setRows(res.rows);
    setSectionEnabled(res.sectionEnabled);
    setLoading(false);
  }, []);

  const onToggleSection = async (enabled: boolean) => {
    if (!canManage) return;
    const r = await setTutorialSectionEnabled(enabled);
    if (r.ok === false) {
      toast({ title: 'تعذر تحديث إعداد العرض', description: r.error, variant: 'destructive' });
      return;
    }
    setSectionEnabled(r.sectionEnabled);
    toast({
      title: enabled ? 'تم تفعيل صفحة فيديوهات الشرح للزوار' : 'تم إخفاء صفحة فيديوهات الشرح نهائياً',
    });
  };

  useEffect(() => {
    if (!canView && !canManage) return;
    void refresh();
  }, [refresh, canView, canManage]);

  const onUpload = async () => {
    if (!canManage) return;
    if (!file || !title.trim()) {
      toast({ title: 'أدخل عنوان الفيديو واختر ملفاً', variant: 'destructive' });
      return;
    }
    const ext = extFromFileName(file.name);
    if (!ext || !['mp4', 'webm', 'mov'].includes(ext)) {
      toast({ title: 'يُقبل فقط mp4 أو webm أو mov', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const begin = await requestTutorialVideoSignedUpload(ext);
      if (begin.ok === false) {
        toast({ title: 'تعذر تجهيز الرفع', description: begin.error, variant: 'destructive' });
        return;
      }
      const put = await fetch(begin.signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || begin.contentType },
      });
      if (!put.ok) {
        toast({ title: 'فشل رفع الملف', description: `HTTP ${put.status}`, variant: 'destructive' });
        return;
      }
      const save = await createTutorialVideo({
        path: begin.path,
        title: title.trim(),
        description: description.trim(),
        sortOrder: Number.parseInt(sortOrder || '0', 10) || 0,
      });
      if (save.ok === false) {
        toast({ title: 'تعذر حفظ بيانات الفيديو', description: save.error, variant: 'destructive' });
        return;
      }
      toast({ title: 'تم رفع فيديو الشرح' });
      setFile(null);
      setTitle('');
      setDescription('');
      setSortOrder('0');
      await refresh();
    } finally {
      setUploading(false);
    }
  };

  if (!canView && !canManage) return null;

  return (
    <Card className="border-primary/25">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          فيديوهات شرح التراخيص (صفحة هبوط مستقلة)
        </CardTitle>
        <CardDescription>
          رفع وإدارة فيديوهات تعليم التراخيص على نفس حاوية الفيديو التقديمي (`partner-promo`) بشكل مستقل.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-primary/25 p-4">
          <div className="space-y-1 text-right">
            <p className="text-sm font-medium">عرض صفحة فيديوهات الشرح للزوار</p>
            <p className="text-xs text-muted-foreground">
              عند الإيقاف تُخفى الصفحة والرابط من مسار الخدمات البرمجية للمنصة نهائياً حتى إعادة التفعيل.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">مفعّل</span>
            <Switch checked={sectionEnabled} disabled={!canManage} onCheckedChange={(v) => void onToggleSection(v)} />
          </div>
        </div>
        {!canManage && canView ? (
          <p className="text-sm text-muted-foreground rounded-md border border-dashed p-3">وضع عرض فقط — لا تملك صلاحية تعديل فيديوهات الشرح.</p>
        ) : null}
        {canManage ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>عنوان الفيديو</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: شرح التسجيل والدفع خطوة بخطوة" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>وصف مختصر (اختياري)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>ترتيب العرض (Sort)</Label>
              <Input value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>ملف الفيديو</Label>
              <Input type="file" accept="video/mp4,video/webm,video/quicktime,.mov" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="md:col-span-2">
              <Button type="button" onClick={() => void onUpload()} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <Upload className="h-4 w-4 ml-2" />}
                رفع فيديو جديد
              </Button>
            </div>
          </div>
        ) : null}

        <div className="rounded-lg border p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">الفيديوهات الحالية</p>
            <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
              تحديث
            </Button>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">جاري التحميل…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد فيديوهات مضافة بعد.</p>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div key={row.id} className="rounded-md border p-3 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{row.title}</p>
                      <p className="text-xs text-muted-foreground">{row.description || 'بدون وصف'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">منشور</span>
                      <Switch
                        checked={row.is_published}
                        disabled={!canManage}
                        onCheckedChange={(checked) =>
                          void updateTutorialVideo({ id: row.id, isPublished: checked }).then(async (r) => {
                            if (r.ok === false) {
                              toast({ title: 'تعذر التحديث', description: r.error, variant: 'destructive' });
                              return;
                            }
                            await refresh();
                          })
                        }
                      />
                      {canManage ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            void deleteTutorialVideo(row.id).then(async (r) => {
                              if (r.ok === false) {
                                toast({ title: 'تعذر الحذف', description: r.error, variant: 'destructive' });
                                return;
                              }
                              toast({ title: 'تم حذف الفيديو' });
                              await refresh();
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4 ml-1" />
                          حذف
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {row.previewUrl ? (
                    <video src={row.previewUrl} controls className="w-full max-w-xl rounded-md border" />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

