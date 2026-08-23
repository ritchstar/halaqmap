/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { toast } from '@/components/ui/sonner';
import {
  adminListStoreAffiliatesRemote,
  adminStoreAffiliateActionRemote,
  storeAffiliateAdminErrorAr,
  type StoreAffiliateAdminRow,
} from '@/lib/adminStoreAffiliateRemote';

type Props = { accessToken: string };

const STATUS_AR: Record<string, string> = {
  pending_review: 'قيد المراجعة',
  approved: 'معتمد',
  declined: 'اعتذار',
};

export function StoreAffiliateApplicationsPanel({ accessToken }: Props) {
  const [rows, setRows] = useState<StoreAffiliateAdminRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending_review');
  const [selected, setSelected] = useState<StoreAffiliateAdminRow | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await adminListStoreAffiliatesRemote({
      accessToken,
      status: filter || undefined,
    });
    setLoading(false);
    if (!res.ok) {
      toast.error(storeAffiliateAdminErrorAr(res.error));
      return;
    }
    setRows(res.rows);
    setSelected((prev) => {
      if (!prev) return null;
      return res.rows.find((row) => row.id === prev.id) ?? null;
    });
  }, [accessToken, filter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openRow = (row: StoreAffiliateAdminRow) => {
    setDeclineReason(row.review_note || '');
    setSelected(row);
  };

  const act = async (action: 'approve' | 'decline', row: StoreAffiliateAdminRow) => {
    if (action === 'decline' && declineReason.trim().length < 4) {
      toast.error('اكتب سبب الاعتذار قبل التنفيذ');
      return;
    }
    setBusyId(row.id);
    const res = await adminStoreAffiliateActionRemote({
      accessToken,
      action,
      applicationId: row.id,
      reason: declineReason,
    });
    setBusyId(null);
    if (!res.ok) {
      toast.error(storeAffiliateAdminErrorAr(res.error));
      return;
    }
    toast.success(action === 'approve' ? 'تم اعتماد مسوّق المتجر' : 'تم الاعتذار عن الطلب');
    setSelected(null);
    void refresh();
  };

  return (
    <Card className="border-amber-500/35">
      <CardHeader>
        <CardTitle>طابور مسوّقي منتجات المتجر</CardTitle>
        <CardDescription>
          بوابة مستقلة عن سفراء حلاق ماب ومسوّقات كوافير ماب. الموافقة تفتح الرابط السري. لا استهداف صالونات ولا شقق
          مخدومة من هنا.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label>تصفية الحالة</Label>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="pending_review">قيد المراجعة</option>
              <option value="approved">معتمد</option>
              <option value="declined">اعتذار</option>
              <option value="">الكل</option>
            </select>
          </div>
          <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}>
            تحديث
          </Button>
        </div>

        <div className="max-h-[28rem] overflow-auto rounded-md border text-sm">
          <table className="w-full text-right">
            <thead className="sticky top-0 bg-muted/60">
              <tr>
                <th className="p-2">الحالة</th>
                <th className="p-2">الاسم</th>
                <th className="p-2">الإيميل</th>
                <th className="p-2">المدينة</th>
                <th className="p-2">تاريخ</th>
                <th className="p-2">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border/50 align-top">
                  <td className="p-2">
                    <Badge variant="secondary">{STATUS_AR[row.status] || row.status}</Badge>
                  </td>
                  <td className="p-2 font-medium">{row.display_name}</td>
                  <td className="p-2 font-mono text-xs" dir="ltr">
                    {row.email}
                  </td>
                  <td className="p-2 max-w-[12rem] truncate" title={row.city || ''}>
                    {row.city || '—'}
                  </td>
                  <td className="p-2 text-xs" dir="ltr">
                    {(row.updated_at || row.created_at)?.slice(0, 16)}
                  </td>
                  <td className="p-2">
                    <Button type="button" size="sm" variant="secondary" onClick={() => openRow(row)}>
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
            className="max-h-[92vh] max-w-3xl overflow-y-auto border-amber-500/30 bg-background p-0 sm:rounded-xl"
            dir="rtl"
          >
            {selected ? (
              <>
                <DialogHeader className="space-y-2 border-b border-border px-6 py-5 text-right">
                  <div className="flex flex-wrap items-center justify-between gap-2 pe-8">
                    <DialogTitle className="text-xl font-extrabold">{selected.display_name}</DialogTitle>
                    <Badge variant="secondary">{STATUS_AR[selected.status] || selected.status}</Badge>
                  </div>
                  <DialogDescription className="text-base text-foreground/80">
                    الرمز:{' '}
                    <span className="font-mono font-semibold" dir="ltr">
                      {selected.code}
                    </span>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 px-6 py-5 text-sm">
                  <div className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">الإيميل</p>
                      <p className="text-base font-mono" dir="ltr">
                        {selected.email}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">الجوال</p>
                      <p className="text-base font-mono" dir="ltr">
                        {selected.phone || '—'}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">المدينة أو النطاق</p>
                      <p className="text-base leading-relaxed">{selected.city || '—'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">خطة التسويق</p>
                      <p dir="rtl" className="chat-arabic-text whitespace-pre-wrap rounded-lg border border-border bg-background p-3 text-base leading-relaxed">
                        {selected.channel_plan || '—'}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">الخبرة</p>
                      <p dir="rtl" className="chat-arabic-text whitespace-pre-wrap rounded-lg border border-border bg-background p-3 text-base leading-relaxed">
                        {selected.experience || '—'}
                      </p>
                    </div>
                    {selected.review_note ? (
                      <div className="sm:col-span-2">
                        <p className="mb-1 text-xs font-semibold text-rose-700">سبب الاعتذار</p>
                        <p className="text-base text-rose-800">{selected.review_note}</p>
                      </div>
                    ) : null}
                    {selected.reviewed_by ? (
                      <div className="sm:col-span-2 text-xs text-muted-foreground">
                        راجعه {selected.reviewed_by}
                        {selected.reviewed_at ? ` · ${selected.reviewed_at.slice(0, 19).replace('T', ' ')}` : ''}
                      </div>
                    ) : null}
                  </div>
                  {selected.status === 'pending_review' ? (
                    <div className="space-y-2">
                      <Label htmlFor="store-aff-decline-reason">سبب الاعتذار (إلزامي عند الاعتذار)</Label>
                      <Textarea
                        id="store-aff-decline-reason"
                        value={declineReason}
                        onChange={(event) => setDeclineReason(event.target.value)}
                        rows={3}
                        placeholder="مثال: القناة غير واضحة / لا علاقة بمنتجات المتجر…"
                      />
                    </div>
                  ) : null}
                </div>
                <DialogFooter className="flex-col gap-2 border-t border-border px-6 py-4 sm:flex-row sm:justify-start">
                  {selected.status === 'pending_review' ? (
                    <>
                      <Button disabled={busyId === selected.id} onClick={() => void act('approve', selected)}>
                        اعتماد
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={busyId === selected.id}
                        onClick={() => void act('decline', selected)}
                      >
                        اعتذار
                      </Button>
                    </>
                  ) : null}
                  <Button type="button" variant="ghost" onClick={() => setSelected(null)}>
                    إغلاق
                  </Button>
                </DialogFooter>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
