import { Activity, Loader2, Radar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PULSE_MAP_CONFIG, PULSE_MAP_COLORS } from '@/config/pulseMapConfig';
import type { PulseMapPayload } from '@/modules/pulse-map/types';

const WINDOW_OPTIONS = [30, 60, 120, 240, 480] as const;

type Props = {
  payload: PulseMapPayload | null;
  loading?: boolean;
  refreshing?: boolean;
  windowMinutes: number;
  onWindowMinutesChange: (minutes: number) => void;
  onRefresh: () => void;
  showCities: boolean;
  showPulses: boolean;
  onShowCitiesChange: (value: boolean) => void;
  onShowPulsesChange: (value: boolean) => void;
  compact?: boolean;
};

export function PulseMapAdminControls({
  payload,
  loading,
  refreshing,
  windowMinutes,
  onWindowMinutesChange,
  onRefresh,
  showCities,
  showPulses,
  onShowCitiesChange,
  onShowPulsesChange,
  compact = false,
}: Props) {
  const admin = payload?.admin;
  const syncLabel = payload?.collectedAt
    ? new Date(payload.collectedAt).toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '…';

  const activeCities = admin?.citySignals.filter((c) => c.demand || c.link) ?? [];

  return (
    <aside
      className="flex flex-col rounded-2xl border border-violet-400/25 bg-black/60 p-4 backdrop-blur-md lg:min-h-[min(44rem,72vh)]"
      dir="rtl"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Radar className="h-4 w-4 text-violet-300" />
          <p className="text-sm font-black text-violet-100">أدوات الاستعلام</p>
        </div>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[0.58rem] font-bold text-emerald-200">
          إدارة
        </span>
      </div>

      <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
        <p className="text-[0.62rem] font-semibold text-slate-500">نافذة الزمن</p>
        <Select
          value={String(windowMinutes)}
          onValueChange={(v) => onWindowMinutesChange(Number.parseInt(v, 10))}
        >
          <SelectTrigger className="h-9 border-white/15 bg-white/5 text-xs">
            <SelectValue placeholder="اختر النافذة" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {WINDOW_OPTIONS.map((m) => (
              <SelectItem key={m} value={String(m)}>
                آخر {m} دقيقة
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-violet-400/30 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20"
          disabled={refreshing}
          onClick={onRefresh}
        >
          {refreshing ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="ml-2 h-4 w-4" />
          )}
          تحديث يدوي
        </Button>
        <p className="text-[0.58rem] tabular-nums text-slate-500">آخر مزامنة · {syncLabel}</p>
      </div>

      <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
        <p className="text-[0.62rem] font-semibold text-slate-500">عرض الخريطة</p>
        <ToggleRow label="مدن المنصة" checked={showCities} onCheckedChange={onShowCitiesChange} />
        <ToggleRow label="نبضات حية" checked={showPulses} onCheckedChange={onShowPulsesChange} />
      </div>

      <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
        <p className="text-[0.62rem] font-semibold text-slate-500">أحداث خام (نافذة {admin?.windowMinutes ?? windowMinutes} د)</p>
        <RawRow label="عمليات بحث" value={admin?.raw.searches ?? '—'} />
        <RawRow label="محادثات خاصة" value={admin?.raw.conversations ?? '—'} />
        <RawRow label="حجوزات" value={admin?.raw.bookings ?? '—'} />
      </div>

      <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
        <p className="text-[0.62rem] font-semibold text-slate-500">إحصائيات النبض</p>
        <StatRow
          color={PULSE_MAP_COLORS.demand.fill}
          label={PULSE_MAP_CONFIG.legendDemandAr}
          value={payload?.stats.demandCount ?? 0}
        />
        <StatRow
          color={PULSE_MAP_COLORS.link.fill}
          label={PULSE_MAP_CONFIG.legendLinkAr}
          value={payload?.stats.linkCount ?? 0}
        />
      </div>

      {!compact ? (
        <div className="mt-4 flex min-h-0 flex-1 flex-col border-t border-white/10 pt-4">
          <p className="text-[0.62rem] font-semibold text-slate-500">
            مدن نشطة ({activeCities.length})
          </p>
          <div className="mt-2 max-h-[min(16rem,28vh)] flex-1 space-y-1.5 overflow-y-auto pr-1">
            {loading && activeCities.length === 0 ? (
              <p className="text-[0.62rem] text-slate-500">جاري التحميل…</p>
            ) : activeCities.length === 0 ? (
              <p className="text-[0.62rem] text-slate-500">لا نشاط في النافذة المحددة.</p>
            ) : (
              activeCities.map((city) => (
                <div
                  key={city.slotId}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-2"
                >
                  <span className="truncate text-[0.65rem] font-medium text-slate-200">{city.nameAr}</span>
                  <div className="flex shrink-0 items-center gap-1">
                    {city.demand ? (
                      <span
                        className="rounded px-1.5 py-0.5 text-[0.55rem] font-bold text-amber-100"
                        style={{ background: `${PULSE_MAP_COLORS.demand.fill}33` }}
                      >
                        مستخدم
                      </span>
                    ) : null}
                    {city.link ? (
                      <span
                        className="rounded px-1.5 py-0.5 text-[0.55rem] font-bold text-teal-100"
                        style={{ background: `${PULSE_MAP_COLORS.link.fill}33` }}
                      >
                        حلاق
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="mt-auto pt-3 text-[0.62rem] text-slate-500">
          <Activity className="ml-1 inline h-3 w-3" />
          جاري التحميل…
        </p>
      ) : null}
    </aside>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
      <span className="text-[0.65rem] text-slate-300">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function RawRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-1.5">
      <span className="text-[0.62rem] text-slate-400">{label}</span>
      <span className="text-sm font-bold tabular-nums text-white">{value}</span>
    </div>
  );
}

function StatRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <span className="text-[0.65rem] text-slate-400">{label}</span>
      </div>
      <span className="text-base font-bold tabular-nums text-white">{value}</span>
    </div>
  );
}
