/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import { Download, ExternalLink, Loader2, MapPinned, RefreshCw } from 'lucide-react';
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

function mapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function formatNominationTxtBlock(row: NominationItem, index: number): string {
  const when = row.createdAt ? new Date(row.createdAt).toLocaleString('ar-SA') : '—';
  const status = STATUS_LABEL[row.status] ?? row.status;
  return [
    `── ترشيح ${index + 1} ──`,
    `اسم الصالون: ${row.salonName}`,
    `رقم التواصل: ${row.contactPhone}`,
    `الحالة: ${status}`,
    `الإحداثيات: ${row.latitude.toFixed(6)}, ${row.longitude.toFixed(6)}`,
    `رابط الموقع على الخريطة: ${mapsUrl(row.latitude, row.longitude)}`,
    `رابط الصورة: ${row.photoUrl ?? 'لا توجد'}`,
    `وقت الترشيح: ${when}`,
    `المعرّف: ${row.id}`,
    '',
  ].join('\n');
}

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

  const exportTxt = () => {
    const body = [
      COVERAGE_NOMINATE_TITLE_AR,
      'ملف تسويقي — ترشيحات تغطية من المستعلمين',
      `تاريخ التصدير: ${new Date().toLocaleString('ar-SA')}`,
      `عدد الترشيحات: ${items.length}`,
      '',
      ...items.map((row, i) => formatNominationTxtBlock(row, i)),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ترشيحات-التغطية-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportOneTxt = (row: NominationItem) => {
    const body = [
      COVERAGE_NOMINATE_TITLE_AR,
      'ترشيح واحد لإرساله للمسوق',
      '',
      formatNominationTxtBlock(row, 0),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ترشيح-${row.salonName.replace(/[^\w\u0600-\u06FF-]+/g, '_').slice(0, 40)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card dir="rtl" className="border-cyan-300/70 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-black text-slate-950">
              <MapPinned className="h-5 w-5 text-cyan-700" />
              {COVERAGE_NOMINATE_TITLE_AR}
            </CardTitle>
            <CardDescription className="mt-1.5 text-sm font-medium leading-6 text-slate-700">
              ملف تسويقي لترشيحات المستعلمين عند فراغ التغطية — لا يظهر في البحث العام.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-slate-300 font-bold text-slate-800"
              onClick={() => void load()}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              تحديث
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-cyan-700 font-bold text-white hover:bg-cyan-800"
              onClick={exportTxt}
              disabled={!items.length}
            >
              <Download className="h-4 w-4" />
              تصدير TXT
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? <p className="mb-3 text-sm font-semibold text-rose-700">{error}</p> : null}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-sm font-medium text-slate-700">
            <Loader2 className="me-2 h-5 w-5 animate-spin text-cyan-700" />
            جارٍ التحميل…
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm font-medium text-slate-700">لا ترشيحات بعد.</p>
        ) : (
          <div className="space-y-3">
            {items.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border border-slate-300 bg-white p-4 text-right shadow-[0_1px_0_rgba(15,23,42,0.04)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-base font-black text-slate-950">{row.salonName}</p>
                    <p className="mt-1 text-sm font-bold tracking-wide text-slate-800" dir="ltr">
                      {row.contactPhone}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-slate-400 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-900"
                  >
                    {STATUS_LABEL[row.status] ?? row.status}
                  </Badge>
                </div>

                {row.createdAt ? (
                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    وقت الترشيح: {new Date(row.createdAt).toLocaleString('ar-SA')}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <a
                    href={mapsUrl(row.latitude, row.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-600 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-950 transition hover:bg-cyan-100"
                    title="فتح الموقع على الخريطة"
                  >
                    <MapPinned className="h-3.5 w-3.5" />
                    فتح الموقع على الخريطة
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                  <span className="text-[0.7rem] font-semibold text-slate-600" dir="ltr">
                    {row.latitude.toFixed(5)}, {row.longitude.toFixed(5)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {row.photoUrl ? (
                    <a
                      href={row.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-teal-600 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-950 hover:bg-teal-100"
                    >
                      فتح الصورة
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-8 bg-slate-800 text-xs font-bold text-white hover:bg-slate-900"
                    onClick={() => exportOneTxt(row)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    ملف TXT للمسوق
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(['reviewed', 'contacted', 'archived'] as const).map((status) => (
                    <Button
                      key={status}
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-slate-400 font-bold text-slate-900 disabled:text-slate-400"
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
