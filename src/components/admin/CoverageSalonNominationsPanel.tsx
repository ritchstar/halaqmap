/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import { Download, Loader2, MapPinned, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { COVERAGE_NOMINATE_TITLE_AR } from '@/config/coverageSalonNominateCopy';
import { getSupabaseClient } from '@/integrations/supabase/client';

type NominationItem = {
  id: string;
  status: string;
  salonName: string;
  contactPhone: string;
  latitude: number;
  longitude: number;
  photoUrl: string | null;
  createdAt: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  new: 'جديد',
  reviewed: 'مراجَع',
  contacted: 'تم التواصل',
  archived: 'مؤرشف',
};

async function authHeaders(): Promise<Record<string, string>> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) throw new Error('يجب تسجيل الدخول');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export function CoverageSalonNominationsPanel() {
  const [items, setItems] = useState<NominationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/admin-coverage-salon-nominations', { headers });
      const json = (await res.json()) as { ok?: boolean; items?: NominationItem[]; error?: string };
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'تعذّر تحميل الترشيحات');
      }
      setItems(json.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/admin-coverage-salon-nominations', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id, status }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || 'تعذّر التحديث');
      setItems((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير متوقع');
    } finally {
      setBusyId(null);
    }
  };

  const exportCsv = () => {
    const header = ['id', 'status', 'salon_name', 'contact_phone', 'latitude', 'longitude', 'photo_url', 'created_at'];
    const lines = [
      header.join(','),
      ...items.map((row) =>
        [
          row.id,
          row.status,
          `"${row.salonName.replace(/"/g, '""')}"`,
          row.contactPhone,
          row.latitude,
          row.longitude,
          row.photoUrl ?? '',
          row.createdAt ?? '',
        ].join(','),
      ),
    ];
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coverage-salon-nominations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card dir="rtl" className="border-cyan-200/60 bg-white/90">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <MapPinned className="h-5 w-5 text-cyan-600" />
              {COVERAGE_NOMINATE_TITLE_AR}
            </CardTitle>
            <CardDescription className="mt-1 text-slate-600">
              ملف تسويقي لترشيحات المستعلمين عند فراغ التغطية — لا يظهر في البحث العام.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              تحديث
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={exportCsv} disabled={!items.length}>
              <Download className="h-4 w-4" />
              تصدير CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-slate-500">
            <Loader2 className="me-2 h-5 w-5 animate-spin" />
            جارٍ التحميل…
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">لا ترشيحات بعد.</p>
        ) : (
          <div className="space-y-3">
            {items.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-right"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">{row.salonName}</p>
                    <p className="mt-1 text-sm text-slate-600" dir="ltr">
                      {row.contactPhone}
                    </p>
                  </div>
                  <Badge variant="outline">{STATUS_LABEL[row.status] ?? row.status}</Badge>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  الموقع: {row.latitude.toFixed(5)}, {row.longitude.toFixed(5)}
                  {row.createdAt ? ` · ${new Date(row.createdAt).toLocaleString('ar-SA')}` : ''}
                </p>
                {row.photoUrl ? (
                  <a
                    href={row.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs font-semibold text-cyan-700 underline"
                  >
                    فتح الصورة
                  </a>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {(['reviewed', 'contacted', 'archived'] as const).map((status) => (
                    <Button
                      key={status}
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === row.id || row.status === status}
                      onClick={() => void setStatus(row.id, status)}
                    >
                      {STATUS_LABEL[status]}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
