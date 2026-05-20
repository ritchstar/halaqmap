import { Activity, Radar, Users, Zap } from 'lucide-react';
import { usePlatformRadarData } from '@/modules/platform-radar/hooks/usePlatformRadarData';
import { cn } from '@/lib/utils';

type Props = {
  /** Cast-friendly full viewport mode — zero chrome */
  commandMode?: boolean;
  soundEnabled?: boolean;
  className?: string;
};

function MetricBlock({
  label,
  value,
  sub,
  accent = 'cyan',
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'cyan' | 'amber' | 'violet' | 'emerald';
}) {
  const ring =
    accent === 'amber'
      ? 'border-amber-400/40 shadow-[0_0_40px_rgba(251,191,36,0.15)]'
      : accent === 'violet'
        ? 'border-violet-400/40 shadow-[0_0_40px_rgba(167,139,250,0.12)]'
        : accent === 'emerald'
          ? 'border-emerald-400/40 shadow-[0_0_40px_rgba(52,211,153,0.12)]'
          : 'border-cyan-400/40 shadow-[0_0_40px_rgba(34,211,238,0.15)]';

  return (
    <div
      className={cn(
        'flex flex-col justify-center rounded-2xl border bg-black/40 p-[clamp(1rem,2.5vw,2rem)] backdrop-blur-sm',
        ring,
      )}
    >
      <p className="text-[clamp(1rem,2.2vw,1.75rem)] font-medium text-slate-300">{label}</p>
      <p className="mt-1 text-[clamp(2rem,5vw,4.5rem)] font-bold leading-none text-white tabular-nums">
        {value}
      </p>
      {sub ? (
        <p className="mt-2 text-[clamp(0.875rem,1.6vw,1.25rem)] text-slate-400">{sub}</p>
      ) : null}
    </div>
  );
}

export function PlatformRadar({ commandMode = false, soundEnabled = true, className }: Props) {
  const { snapshot, loading, error } = usePlatformRadarData({
    soundEnabled,
    pollMs: commandMode ? 25_000 : 30_000,
  });

  const stats = snapshot?.stats;
  const brief = snapshot?.brief;
  const ops = snapshot?.ops;

  return (
    <div
      className={cn(
        'platform-radar-root relative flex flex-col bg-[#030303] text-white',
        commandMode ? 'h-[100dvh] w-[100dvw] overflow-hidden p-0' : 'min-h-[32rem] rounded-2xl border border-white/10 p-4',
        className,
      )}
      dir="rtl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.08),transparent_55%)]"
      />
      <div
        aria-hidden
        className="platform-radar-pulse-ring pointer-events-none absolute left-1/2 top-[18%] h-[min(55vw,55vh)] w-[min(55vw,55vh)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/20"
      />

      <header
        className={cn(
          'relative z-10 flex shrink-0 items-center justify-between gap-4 border-b border-white/10',
          commandMode ? 'px-[clamp(1rem,3vw,2.5rem)] py-[clamp(0.75rem,2vh,1.5rem)]' : 'px-2 py-3',
        )}
      >
        <div className="flex items-center gap-3">
          <span className="platform-radar-live-dot h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.8)]" />
          <div className="text-right">
            <p className="text-[clamp(0.75rem,1.4vw,1rem)] uppercase tracking-[0.2em] text-cyan-300/90">
              Command Center
            </p>
            <h1 className="flex items-center justify-end gap-2 text-[clamp(1.25rem,3vw,2.25rem)] font-bold text-white">
              <Radar className="h-[clamp(1.25rem,2.5vw,2rem)] w-[clamp(1.25rem,2.5vw,2rem)] text-cyan-300" />
              Platform Radar
            </h1>
          </div>
        </div>
        <p className="text-[clamp(0.875rem,1.5vw,1.125rem)] text-slate-400 tabular-nums">
          {loading ? '…' : snapshot?.loadedAt ? new Date(snapshot.loadedAt).toLocaleTimeString('ar-SA') : '—'}
        </p>
      </header>

      <main
        className={cn(
          'relative z-10 grid flex-1 gap-[clamp(0.75rem,2vw,1.5rem)] overflow-hidden',
          commandMode
            ? 'p-[clamp(1rem,3vw,2.5rem)] grid-rows-[auto_1fr] grid-cols-1 lg:grid-cols-12'
            : 'p-2 grid-cols-1 md:grid-cols-2',
        )}
      >
        {error ? (
          <p className="col-span-full rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-[clamp(1rem,2vw,1.25rem)] text-red-100">
            {error}
          </p>
        ) : null}

        <section
          className={cn(
            'grid gap-[clamp(0.5rem,1.5vw,1rem)]',
            commandMode ? 'lg:col-span-12 grid-cols-2 md:grid-cols-3 xl:grid-cols-6' : 'col-span-full grid-cols-2 md:grid-cols-3',
          )}
        >
          <MetricBlock label="الحلاقون" value={stats?.totalBarbers ?? '—'} sub="إجمالي السجل" />
          <MetricBlock
            label="اشتراكات نشطة"
            value={stats?.activeSubscriptions ?? '—'}
            sub={`${stats?.goldBarbers ?? 0} ذهبي · ${stats?.diamondBarbers ?? 0} ماسي`}
            accent="emerald"
          />
          <MetricBlock label="المستخدمون" value={stats?.totalUsers ?? '—'} accent="violet" />
          <MetricBlock
            label="إيراد مكتمل"
            value={stats?.totalRevenue != null ? `${stats.totalRevenue.toLocaleString('ar-SA')} ر.س` : '—'}
            accent="amber"
          />
          <MetricBlock
            label="مدفوعات معلّقة"
            value={stats?.pendingPayments ?? '—'}
            accent="amber"
          />
          <MetricBlock
            label="طلبات معلّقة"
            value={stats?.pendingRequests ?? '—'}
            sub={`${stats?.totalAppointments ?? 0} موعد`}
          />
        </section>

        <section
          className={cn(
            'flex flex-col rounded-2xl border border-cyan-500/25 bg-black/35 p-[clamp(1rem,2vw,1.75rem)]',
            commandMode ? 'lg:col-span-5 min-h-0' : '',
          )}
        >
          <h2 className="mb-3 flex items-center justify-end gap-2 text-[clamp(1.1rem,2.2vw,1.75rem)] font-bold text-cyan-100">
            <Zap className="h-5 w-5" />
            نبض السوق — بحث 24س
          </h2>
          <p className="mb-4 text-[clamp(1rem,1.8vw,1.35rem)] leading-relaxed text-slate-200">
            {brief?.searchDemandLine ?? '—'}
          </p>
          <ul className="m-0 flex-1 list-none space-y-3 overflow-auto p-0">
            {(brief?.topDistricts24h ?? []).slice(0, 6).map((d) => (
              <li
                key={`${d.districtName}-${d.topCity}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <span className="text-[clamp(1.25rem,2.5vw,2rem)] font-bold tabular-nums text-cyan-200">
                  {d.searchCount}
                </span>
                <span className="text-[clamp(1rem,2vw,1.5rem)] font-medium text-white">
                  {d.districtName}
                  {d.topCity ? ` · ${d.topCity}` : ''}
                </span>
              </li>
            ))}
            {!brief?.topDistricts24h?.length && !loading ? (
              <li className="text-[clamp(1rem,1.8vw,1.25rem)] text-slate-500">لا بيانات بحث بعد</li>
            ) : null}
          </ul>
          {(brief?.recruitmentAlerts ?? []).length > 0 ? (
            <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-950/30 p-4">
              <p className="text-[clamp(1rem,1.8vw,1.25rem)] font-semibold text-amber-100">
                {brief?.recruitmentAlertsLine ?? 'تنبيهات استقطاب'}
              </p>
              <ul className="mt-2 list-none space-y-2 p-0">
                {brief!.recruitmentAlerts.slice(0, 3).map((a) => (
                  <li key={a.label} className="text-[clamp(0.95rem,1.6vw,1.2rem)] text-amber-50/90">
                    • {a.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section
          className={cn(
            'flex flex-col gap-[clamp(0.75rem,1.5vw,1rem)]',
            commandMode ? 'lg:col-span-4 min-h-0' : '',
          )}
        >
          <div className="rounded-2xl border border-violet-500/30 bg-black/35 p-[clamp(1rem,2vw,1.75rem)]">
            <h2 className="mb-3 flex items-center justify-end gap-2 text-[clamp(1.1rem,2.2vw,1.75rem)] font-bold text-violet-100">
              <Activity className="h-5 w-5" />
              نبض التشغيل
            </h2>
            <p className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-white">
              {ops?.urgentCount24h ?? 0}{' '}
              <span className="text-[clamp(1rem,2vw,1.35rem)] font-normal text-slate-400">عاجل / 24س</span>
            </p>
            {ops?.latestDigestSummary ? (
              <p className="mt-3 text-[clamp(1rem,1.8vw,1.25rem)] leading-relaxed text-slate-300">
                {ops.latestDigestSummary}
              </p>
            ) : null}
          </div>

          <div className="grid flex-1 grid-cols-2 gap-[clamp(0.5rem,1vw,1rem)]">
            <MetricBlock
              label="فشل مدفوعات"
              value={brief?.failedPayments24h ?? '—'}
              accent="amber"
            />
            <MetricBlock
              label="طلبات عالقة"
              value={brief?.pendingSubmissions24h ?? '—'}
              accent="amber"
            />
            <MetricBlock
              label="أحداث أمن"
              value={brief?.securityEvents7d ?? '—'}
              sub="7 أيام"
              accent="violet"
            />
            <MetricBlock
              label="Supabase ping"
              value={brief?.supabasePingMs != null ? `${brief.supabasePingMs}ms` : '—'}
              accent="cyan"
            />
          </div>
        </section>

        <section
          className={cn(
            'flex flex-col justify-center rounded-2xl border border-emerald-500/25 bg-black/35 p-[clamp(1rem,2vw,1.75rem)] text-center',
            commandMode ? 'lg:col-span-3' : 'col-span-full',
          )}
        >
          <Users className="mx-auto mb-3 h-[clamp(2rem,4vw,3rem)] w-[clamp(2rem,4vw,3rem)] text-emerald-300" />
          <p className="text-[clamp(1rem,2vw,1.35rem)] text-slate-400">سجلات بحث ممسوحة</p>
          <p className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-none text-emerald-100 tabular-nums">
            {brief?.logsScanned24h ?? '—'}
          </p>
          <p className="mt-2 text-[clamp(0.95rem,1.6vw,1.15rem)] text-slate-500">
            {soundEnabled ? '🔊 نبض صوتي عند تغيّر البيانات' : 'الصوت معطّل'}
          </p>
        </section>
      </main>
    </div>
  );
}
