import { useCallback, useEffect, useState } from 'react';
import { Compass, Loader2, RefreshCw, Rocket, Target, TrendingUp } from 'lucide-react';
import { FounderGlassCard } from '@/components/admin/founder/FounderGlassCard';
import { founderTheme } from '@/components/admin/founder/founderTheme';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import {
  fetchGrowthArchitectSnapshot,
  type GrowthArchitectSnapshot,
  type GrowthRecommendation,
} from '@/lib/growthArchitectRemote';

type Props = {
  /** Activated once the Engineering Wing handshake is OK. */
  opsControllerEnabled: boolean;
};

function priorityBadge(priority: GrowthRecommendation['priority']) {
  if (priority === 'P0') {
    return (
      <Badge className="border-red-700/50 bg-red-950/60 text-red-200">P0 — حرجة</Badge>
    );
  }
  if (priority === 'P1') {
    return (
      <Badge className="border-amber-700/50 bg-amber-950/50 text-amber-200">P1 — عالية</Badge>
    );
  }
  return (
    <Badge className="border-sky-700/50 bg-sky-950/50 text-sky-200">P2 — مراقبة</Badge>
  );
}

function scopeIcon(scope: GrowthRecommendation['scope']) {
  if (scope === 'recruit_barbers') return <Target className="h-4 w-4 text-emerald-300" />;
  if (scope === 'ads_focus') return <Rocket className="h-4 w-4 text-amber-300" />;
  if (scope === 'expand_district') return <TrendingUp className="h-4 w-4 text-cyan-300" />;
  return <Compass className="h-4 w-4 text-slate-300" />;
}

function RecommendationCard({ rec }: { rec: GrowthRecommendation }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/55 px-3 py-3" dir="rtl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-right">
          <span className="font-medium text-slate-100">
            {rec.cityAr}
            {rec.districtAr ? ` · ${rec.districtAr}` : ''}
          </span>
          {scopeIcon(rec.scope)}
        </div>
        {priorityBadge(rec.priority)}
      </div>
      <p className="mt-2 text-right text-sm text-slate-300">{rec.rationaleAr}</p>
      <p className="mt-2 text-right text-sm font-medium text-emerald-200">
        ⮞ {rec.callToActionAr}
      </p>
      <div className="mt-2 flex flex-wrap justify-end gap-2 text-xs text-slate-400">
        <span>7 أيام: {rec.metric.searches7d}</span>
        <span>·</span>
        <span>24 ساعة: {rec.metric.searches24h}</span>
        <span>·</span>
        <span>صفر-نتيجة: {Math.round(rec.metric.zeroResultRatio * 100)}%</span>
      </div>
    </div>
  );
}

export function GrowthArchitectPanel({ opsControllerEnabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [snapshot, setSnapshot] = useState<GrowthArchitectSnapshot | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchGrowthArchitectSnapshot();
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSnapshot(result.snapshot);
  }, []);

  // Auto-load when Engineering Wing becomes OK.
  useEffect(() => {
    if (!opsControllerEnabled) {
      setSnapshot(null);
      return;
    }
    void refresh();
  }, [opsControllerEnabled, refresh]);

  return (
    <FounderGlassCard className="p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-emerald-700/40 text-emerald-100">
            Growth Architect — مهندس النمو
          </Badge>
          {snapshot?.activated ? (
            <Badge className="border-emerald-700/50 bg-emerald-950/50 text-emerald-200">
              نشط
            </Badge>
          ) : (
            <Badge className="border-slate-700/50 bg-slate-950/50 text-slate-300">
              في الانتظار
            </Badge>
          )}
        </div>
        <div className="flex-1 space-y-1 text-right">
          <h3 className={`${founderTheme.sectionTitle} flex items-center justify-end gap-2`}>
            <Compass className="h-5 w-5 text-emerald-300" />
            توصيات تكتيكية للنمو — مناطق الطلب المرتفع
          </h3>
          <p className="text-sm text-slate-400">
            يقرأ نبضات بحث المستخدمين (آخر 7 أيام) ويُنتج توصيات تجنيد حلاقين وإطلاق إعلانات.
          </p>
        </div>
      </div>

      {!opsControllerEnabled ? (
        <div className="rounded-lg border border-slate-700/60 bg-slate-950/40 px-3 py-4 text-right text-sm text-slate-400">
          مهندس النمو معطّل — يفعّل تلقائياً عند نجاح Handshake الجناح الهندسي.
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">جاري تحليل سجل البحث…</span>
        </div>
      ) : snapshot ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-right text-xs text-slate-400">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-slate-600"
              disabled={loading}
              onClick={() => void refresh()}
            >
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث التوصيات
            </Button>
            <span>
              بيانات تحليل: {snapshot.searchCount7d.toLocaleString('ar-SA')} بحث ·{' '}
              {snapshot.citiesAnalyzed} مدينة
            </span>
          </div>

          {snapshot.gateMessageAr ? (
            <div className="rounded-lg border border-amber-800/40 bg-amber-950/20 px-3 py-2 text-right text-xs text-amber-100">
              {snapshot.gateMessageAr}
            </div>
          ) : null}

          <div className="space-y-2">
            {snapshot.recommendations.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-700/60 bg-slate-950/40 px-3 py-4 text-right text-sm text-slate-400">
          لم تُحمَّل التوصيات بعد — اضغط تحديث.
        </div>
      )}
    </FounderGlassCard>
  );
}
