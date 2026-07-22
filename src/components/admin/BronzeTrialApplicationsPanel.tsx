import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, MapPin, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  adminBronzeTrialApplicationActionRemote,
  adminListBronzeTrialApplicationsRemote,
  type BronzeTrialApplicationRow,
} from '@/lib/bronzeTrialApplicationsAdminRemote';

type Props = { accessToken: string };

const STATUS_AR: Record<string, string> = {
  pending_email: 'بانتظار تأكيد البريد',
  pending_review: 'قيد المراجعة',
  approved: 'موافق عليه',
  rejected: 'مرفوض',
  cancelled: 'ملغى',
};

const PHOTO_LABELS = [
  'خارج — لوحة المحل',
  'خارج — واجهة 2',
  'داخل — صورة 1',
  'داخل — صورة 2',
] as const;

export function BronzeTrialApplicationsPanel({ accessToken }: Props) {
  const [rows, setRows] = useState<BronzeTrialApplicationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending_review');
  const [selected, setSelected] = useState<BronzeTrialApplicationRow | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [emailEdit, setEmailEdit] = useState('');
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; label: string } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await adminListBronzeTrialApplicationsRemote({
      accessToken,
      status: filter || undefined,
    });
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setRows(res.rows);
    setSelected((prev) => {
      if (!prev) return null;
      const next = res.rows.find((r) => r.id === prev.id) ?? null;
      if (next) setEmailEdit(next.email);
      return next;
    });
  }, [accessToken, filter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openRow = (row: BronzeTrialApplicationRow) => {
    setRejectReason(row.reject_reason || '');
    setEmailEdit(row.email);
    setSelected(row);
  };

  const act = async (
    action:
      | 'approve'
      | 'reject'
      | 'resend_code'
      | 'resend_confirm'
      | 'mark_email_confirmed'
      | 'update_email',
    row: BronzeTrialApplicationRow,
  ) => {
    if (action === 'reject' && !rejectReason.trim()) {
      toast.error('اكتب سبب الرفض قبل التنفيذ');
      return;
    }
    if (action === 'update_email') {
      const next = emailEdit.trim().toLowerCase();
      if (!next.includes('@')) {
        toast.error('أدخل بريداً صحيحاً قبل الحفظ');
        return;
      }
    }
    setBusyId(row.id);
    const res = await adminBronzeTrialApplicationActionRemote({
      accessToken,
      action,
      applicationId: row.id,
      reason: rejectReason,
      email: action === 'update_email' ? emailEdit : undefined,
    });
    setBusyId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    if (res.plaintextCode) {
      setLastCode(res.plaintextCode);
      toast.success('تم — انسخ الكود إن ظهر أدناه');
    } else if (action === 'update_email') {
      toast.success(
        res.confirmResent
          ? `تم تصحيح البريد إلى ${res.email} وإعادة إرسال رابط التأكيد`
          : `تم تصحيح البريد إلى ${res.email}`,
      );
    } else {
      toast.success('تم تنفيذ الإجراء');
    }
    if (action === 'approve' || action === 'reject') {
      setSelected(null);
    }
    void refresh();
  };

  const photos = selected
    ? [
        { url: selected.photo_exterior_sign_url, label: PHOTO_LABELS[0] },
        { url: selected.photo_exterior_2_url, label: PHOTO_LABELS[1] },
        { url: selected.photo_interior_1_url, label: PHOTO_LABELS[2] },
        { url: selected.photo_interior_2_url, label: PHOTO_LABELS[3] },
      ]
    : [];

  return (
    <Card className="border-sky-500/30">
      <CardHeader>
        <CardTitle>طابور طلبات التجربة البرونزية</CardTitle>
        <CardDescription>
          طلبات التقييم فقط — لا تسجّل حساباً. عند الموافقة يُرسل كود مربوط بنفس الإيميل. اضغط «معاينة»
          لفتح الطلب كاملاً في نافذة منبثقة.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label>تصفية الحالة</Label>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="pending_review">قيد المراجعة</option>
              <option value="pending_email">بانتظار تأكيد البريد</option>
              <option value="approved">موافق</option>
              <option value="rejected">مرفوض</option>
              <option value="">الكل</option>
            </select>
          </div>
          <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}>
            تحديث
          </Button>
        </div>

        {lastCode ? (
          <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
            <p className="text-sm font-semibold">آخر كود صادر — انسخه الآن</p>
            <Textarea value={lastCode} readOnly dir="ltr" className="font-mono text-sm" rows={2} />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void navigator.clipboard.writeText(lastCode)}
            >
              نسخ
            </Button>
          </div>
        ) : null}

        <div className="max-h-[28rem] overflow-auto rounded-md border text-sm">
          <table className="w-full text-right">
            <thead className="sticky top-0 bg-muted/60">
              <tr>
                <th className="p-2">الحالة</th>
                <th className="p-2">الصالون</th>
                <th className="p-2">البريد</th>
                <th className="p-2">المدينة</th>
                <th className="p-2">تاريخ</th>
                <th className="p-2">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/50 align-top">
                  <td className="p-2">
                    <Badge variant="secondary">{STATUS_AR[r.status] || r.status}</Badge>
                  </td>
                  <td className="p-2 font-medium">{r.salon_name}</td>
                  <td className="p-2 font-mono text-xs" dir="ltr">
                    {r.email}
                  </td>
                  <td className="p-2">
                    {r.city_ar} / {r.district_ar}
                  </td>
                  <td className="p-2 text-xs" dir="ltr">
                    {r.created_at?.slice(0, 16)}
                  </td>
                  <td className="p-2">
                    <Button type="button" size="sm" variant="secondary" onClick={() => openRow(r)}>
                      معاينة
                    </Button>
                  </td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={6} className="p-4 text-muted-foreground">
                    لا طلبات في هذا التصفية.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Dialog
          open={Boolean(selected)}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        >
          <DialogContent
            className="max-h-[92vh] max-w-4xl overflow-y-auto border-sky-500/30 bg-background p-0 sm:rounded-xl"
            dir="rtl"
          >
            {selected ? (
              <>
                <DialogHeader className="space-y-2 border-b border-border px-6 py-5 text-right">
                  <div className="flex flex-wrap items-center justify-between gap-2 pe-8">
                    <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
                      <Store className="h-5 w-5 text-sky-600" />
                      {selected.salon_name}
                    </DialogTitle>
                    <Badge variant="secondary">{STATUS_AR[selected.status] || selected.status}</Badge>
                  </div>
                  <DialogDescription className="text-base text-foreground/80">
                    {selected.establishment_name}
                    {selected.region_ar ? ` — ${selected.region_ar}` : ''} · {selected.city_ar} /{' '}
                    {selected.district_ar}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 px-6 py-5">
                  <div className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 text-sm sm:grid-cols-2">
                    <div className="sm:col-span-2 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">البريد (قابل للتصحيح قبل الموافقة)</p>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          dir="ltr"
                          className="font-mono"
                          value={emailEdit}
                          onChange={(e) => setEmailEdit(e.target.value)}
                          placeholder="email@example.com"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={
                            busyId === selected.id ||
                            emailEdit.trim().toLowerCase() === selected.email.trim().toLowerCase()
                          }
                          onClick={() => void act('update_email', selected)}
                        >
                          حفظ تصحيح البريد
                        </Button>
                      </div>
                      <p className="text-xs text-amber-800 dark:text-amber-200/90">
                        مهم: صحّح البريد أولاً ثم وافق — الكود يُربط بهذا الإيميل. لا تعتمد على تعديل الحساب بعد
                        الموافقة إن أمكن.
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">الجوال / واتساب</p>
                      <p className="text-base" dir="ltr">
                        {selected.phone} · WA {selected.whatsapp}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">تاريخ الطلب</p>
                      <p className="text-base" dir="ltr">
                        {selected.created_at?.slice(0, 19).replace('T', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">تأكيد البريد</p>
                      <p className="text-base" dir="ltr">
                        {selected.email_confirmed_at
                          ? selected.email_confirmed_at.slice(0, 19).replace('T', ' ')
                          : 'لم يُؤكَّد بعد'}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        الإحداثيات
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-mono text-base" dir="ltr">
                          {selected.latitude}, {selected.longitude}
                        </p>
                        <a
                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline"
                          href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          فتح على الخريطة
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                    {selected.notes ? (
                      <div className="sm:col-span-2">
                        <p className="mb-1 text-xs font-semibold text-muted-foreground">ملاحظات المتقدم</p>
                        <p className="whitespace-pre-wrap rounded-lg border border-border bg-background p-3 text-base leading-relaxed">
                          {selected.notes}
                        </p>
                      </div>
                    ) : null}
                    {selected.reject_reason ? (
                      <div className="sm:col-span-2">
                        <p className="mb-1 text-xs font-semibold text-rose-700">سبب الرفض السابق</p>
                        <p className="text-base text-rose-800">{selected.reject_reason}</p>
                      </div>
                    ) : null}
                    {selected.reviewed_by_admin_email ? (
                      <div className="sm:col-span-2 text-xs text-muted-foreground">
                        راجع بواسطة {selected.reviewed_by_admin_email}
                        {selected.reviewed_at
                          ? ` · ${selected.reviewed_at.slice(0, 19).replace('T', ' ')}`
                          : ''}
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-bold">صور المحل (اضغط للتكبير)</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {photos.map((photo) => (
                        <button
                          key={photo.label}
                          type="button"
                          className="group overflow-hidden rounded-xl border border-border bg-muted/20 text-right transition hover:border-sky-400/50"
                          onClick={() => setPreviewPhoto(photo)}
                        >
                          <img
                            src={photo.url}
                            alt={photo.label}
                            className="h-44 w-full object-cover transition group-hover:scale-[1.02]"
                          />
                          <p className="px-3 py-2 text-sm font-medium">{photo.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {(selected.status === 'pending_review' || selected.status === 'rejected') && (
                    <div className="space-y-2">
                      <Label htmlFor="bronze-reject-reason">سبب الرفض (إلزامي عند الرفض)</Label>
                      <Textarea
                        id="bronze-reject-reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        placeholder="مثال: الصور غير واضحة / الموقع غير مطابق…"
                      />
                    </div>
                  )}
                </div>

                <DialogFooter className="flex-col gap-2 border-t border-border px-6 py-4 sm:flex-row sm:justify-start">
                  {selected.status === 'pending_review' ? (
                    <>
                      <Button
                        disabled={busyId === selected.id}
                        onClick={() => void act('approve', selected)}
                      >
                        موافقة + إرسال كود
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={busyId === selected.id}
                        onClick={() => void act('reject', selected)}
                      >
                        رفض الطلب
                      </Button>
                    </>
                  ) : null}
                  {selected.status === 'pending_email' ? (
                    <>
                      <Button
                        disabled={busyId === selected.id}
                        onClick={() => void act('mark_email_confirmed', selected)}
                      >
                        تأكيد البريد يدوياً
                      </Button>
                      <Button
                        variant="outline"
                        disabled={busyId === selected.id}
                        onClick={() => void act('resend_confirm', selected)}
                      >
                        إعادة إرسال رابط التأكيد
                      </Button>
                    </>
                  ) : null}
                  {selected.status === 'approved' ? (
                    <Button
                      variant="outline"
                      disabled={busyId === selected.id}
                      onClick={() => void act('resend_code', selected)}
                    >
                      إعادة إرسال الكود
                    </Button>
                  ) : null}
                  <Button type="button" variant="ghost" onClick={() => setSelected(null)}>
                    إغلاق
                  </Button>
                </DialogFooter>
              </>
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(previewPhoto)}
          onOpenChange={(open) => {
            if (!open) setPreviewPhoto(null);
          }}
        >
          <DialogContent className="max-w-5xl border-none bg-black/95 p-3 sm:rounded-xl" dir="rtl">
            {previewPhoto ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-white">{previewPhoto.label}</DialogTitle>
                </DialogHeader>
                <img
                  src={previewPhoto.url}
                  alt={previewPhoto.label}
                  className="max-h-[80vh] w-full rounded-lg object-contain"
                />
                <div className="flex justify-end">
                  <Button asChild variant="secondary" size="sm">
                    <a href={previewPhoto.url} target="_blank" rel="noreferrer">
                      فتح الأصل
                    </a>
                  </Button>
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
