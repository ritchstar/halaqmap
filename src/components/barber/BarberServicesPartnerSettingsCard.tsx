/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قائمة أسعار تفصيلية حرّة — ليست تصنيفات المنصة (زيارة منزلية / تجهيز عريس…).
 */
import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Scissors, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BarberPortalSession } from '@/lib/barberPortalLoginRemote';
import {
  deleteBarberServiceRemote,
  listBarberServicesRemote,
  upsertBarberServiceRemote,
  type BarberServiceRemoteRow,
} from '@/lib/barberServicesRemote';

type DraftRow = {
  id?: string;
  name: string;
  price: string;
  durationMinutes: string;
};

type Props = {
  barberId: string;
  barberData: BarberPortalSession;
  /** عند العرض داخل تبويب مستقل */
  embeddedInTab?: boolean;
};

const EXAMPLE_HINTS = ['قص شعر', 'حلاقة ذقن', 'صبغة شعر', 'تنظيف بشرة', 'حلاقة بالخيط'] as const;

function toDraft(row: BarberServiceRemoteRow): DraftRow {
  return {
    id: row.id,
    name: row.service_name,
    price: String(row.price ?? ''),
    durationMinutes: String(row.duration_minutes || 30),
  };
}

export function BarberServicesPartnerSettingsCard({ barberId, barberData, embeddedInTab = false }: Props) {
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await listBarberServicesRemote({
      barberId,
      email: barberData.email,
    });
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error);
      setRows([]);
      return;
    }
    setRows(res.services.map(toDraft));
    if (res.seeded > 0) {
      toast.success(`تم استيراد ${res.seeded} بنداً من طلب التسجيل — يمكنك تعديل الأسماء والأسعار.`);
    }
  }, [barberId, barberData.email]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const patchRow = (index: number, patch: Partial<DraftRow>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addEmptyRow = (presetName = '') => {
    if (rows.length >= 40) {
      toast.error('الحد الأقصى 40 بنداً في قائمة الأسعار.');
      return;
    }
    setRows((prev) => [
      ...prev,
      { name: presetName, price: '', durationMinutes: '30' },
    ]);
  };

  const saveRow = async (index: number) => {
    const row = rows[index];
    if (!row) return;
    const name = row.name.trim();
    if (!name) {
      toast.error('أدخل اسم الخدمة كما تريد أن يراها العميل.');
      return;
    }
    const price = Number(String(row.price).replace(/,/g, '.'));
    if (!Number.isFinite(price) || price < 0) {
      toast.error('أدخل سعراً صالحاً بالريال.');
      return;
    }
    const durationMinutes = Math.min(
      480,
      Math.max(5, Math.floor(Number(row.durationMinutes) || 30)),
    );

    setSavingIndex(index);
    const res = await upsertBarberServiceRemote({
      barberId,
      email: barberData.email,
      ...(row.id ? { id: row.id } : {}),
      serviceName: name,
      price,
      durationMinutes,
    });
    setSavingIndex(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(row.id ? 'تم تحديث البند.' : 'تمت إضافة البند إلى قائمتك.');
    setRows((prev) => prev.map((r, i) => (i === index ? toDraft(res.service) : r)));
  };

  const removeRow = async (index: number) => {
    const row = rows[index];
    if (!row) return;
    if (!row.id) {
      setRows((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    setDeletingId(row.id);
    const res = await deleteBarberServiceRemote({
      barberId,
      email: barberData.email,
      id: row.id,
    });
    setDeletingId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('تم حذف البند من قائمتك.');
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card
      className={
        embeddedInTab
          ? 'border-primary/35 bg-gradient-to-br from-primary/[0.06] to-card'
          : 'mb-6 border-primary/35 bg-gradient-to-br from-primary/[0.06] to-card'
      }
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Scissors className="h-5 w-5 text-primary" />
          قائمة أسعاري التفصيلية
        </CardTitle>
        <CardDescription className="space-y-2 leading-relaxed">
          <span className="block">
            هنا تكتب خدماتك الخاصة بأسمائها وأسعارها — مثل قص شعر، حلاقة ذقن، صبغة، تنظيف بشرة، أو قصة باسم معيّن، أو
            حلاقة بالخيط. الصلاحية مفتوحة: إضافة، تعديل، حذف.
          </span>
          <span className="block text-muted-foreground">
            هذا غير «الخدمات الأساسية» في الإعدادات (زيارة منزلية / تجهيز عريس / كبار السن) — تلك مفاتيح ظهور على
            المنصة فقط. المناوب الذكي يعتمد على قائمتك التفصيلية أدناه عند سؤال العميل عن الأسعار.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري تحميل قائمتك…
          </div>
        ) : rows.length === 0 ? (
          <div className="space-y-3 rounded-lg border border-dashed border-primary/30 bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">
              قائمتك فارغة. ابدأ بإضافة بنودك — يمكنك الضغط على مثال سريع ثم تعديل الاسم والسعر وحفظه.
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_HINTS.map((hint) => (
                <Button
                  key={hint}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addEmptyRow(hint)}
                >
                  + {hint}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((row, index) => (
              <li
                key={row.id ?? `new-${index}`}
                className="space-y-3 rounded-lg border border-border bg-background/70 p-3"
              >
                <div className="grid gap-3 sm:grid-cols-[1.4fr_0.7fr_0.7fr]">
                  <div className="space-y-1.5">
                    <Label className="text-xs">اسم الخدمة (كما تريده أنت)</Label>
                    <Input
                      value={row.name}
                      onChange={(e) => patchRow(index, { name: e.target.value })}
                      placeholder="مثال: قصة فيد كلاسيك / حلاقة بالخيط"
                      maxLength={80}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">السعر (ر.س)</Label>
                    <Input
                      dir="ltr"
                      inputMode="decimal"
                      className="text-left"
                      value={row.price}
                      onChange={(e) => patchRow(index, { price: e.target.value })}
                      placeholder="50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">المدة التقريبية (دقيقة)</Label>
                    <Input
                      dir="ltr"
                      inputMode="numeric"
                      className="text-left"
                      value={row.durationMinutes}
                      onChange={(e) => patchRow(index, { durationMinutes: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void saveRow(index)}
                    disabled={savingIndex === index}
                  >
                    {savingIndex === index ? (
                      <>
                        <Loader2 className="ml-1 h-3.5 w-3.5 animate-spin" />
                        جاري الحفظ
                      </>
                    ) : row.id ? (
                      'حفظ التعديل'
                    ) : (
                      'حفظ البند'
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => void removeRow(index)}
                    disabled={deletingId === row.id}
                  >
                    {deletingId === row.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="ml-1 h-3.5 w-3.5" />
                    )}
                    حذف
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => addEmptyRow()} disabled={loading}>
            <Plus className="ml-1 h-4 w-4" />
            إضافة بند جديد
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => void refresh()} disabled={loading}>
            تحديث القائمة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
