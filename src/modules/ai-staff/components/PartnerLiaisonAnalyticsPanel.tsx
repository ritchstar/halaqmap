import { BarChart3, MessageSquare, ThumbsDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StaffMetricTile } from '@/components/admin/staff/StaffMetricTile';
import { StaffProfessionalCard } from '@/components/admin/staff/StaffProfessionalCard';
import { staffTheme } from '@/components/admin/staff/staffTheme';
import { PARTNER_LIAISON_ANALYTICS_MOCK } from '@/modules/ai-staff/registry';

function sentimentBadge(sentiment: 'positive' | 'neutral' | 'friction') {
  if (sentiment === 'positive') {
    return <span className={staffTheme.badgeOk}>إيجابي</span>;
  }
  if (sentiment === 'friction') {
    return (
      <Badge variant="destructive" className="text-[10px]">
        <ThumbsDown className="ml-1 h-3 w-3" />
        احتكاك
      </Badge>
    );
  }
  return <span className={staffTheme.badgeNeutral}>محايد</span>;
}

export function PartnerLiaisonAnalyticsPanel() {
  const data = PARTNER_LIAISON_ANALYTICS_MOCK;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StaffMetricTile
          title="محادثات مُعالجة (7 أيام)"
          value={data.chatsHandled7d.toLocaleString('ar-SA')}
          icon={MessageSquare}
          accent="violet"
        />
        <StaffMetricTile
          title="مؤشر المشاعر المتوسط"
          value={`${data.avgSentimentScore}%`}
          icon={BarChart3}
          accent="violet"
        />
        <StaffMetricTile
          title="تقارير احتكاك ميداني"
          value={data.frictionReports7d.toLocaleString('ar-SA')}
          icon={ThumbsDown}
          accent="amber"
        />
      </div>

      <StaffProfessionalCard className="p-4">
        <h4 className={`${staffTheme.sectionTitle} text-sm`}>أنماط الاحتكاك التشغيلي الشائعة</h4>
        <p className="mt-1 text-xs text-slate-400">ملخص ميداني من مساعد الشركاء — بدون بيانات مالية</p>
        <div className="mt-3 space-y-2">
          {data.topFrictionThemes.map((row) => (
            <div
              key={row.themeAr}
              className="flex items-center justify-between gap-3 rounded-md border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-sm"
            >
              <span className="text-right leading-snug text-slate-200">{row.themeAr}</span>
              <Badge variant="outline" className="shrink-0 border-slate-600 tabular-nums text-slate-300">
                {row.count}
              </Badge>
            </div>
          ))}
        </div>
      </StaffProfessionalCard>

      <StaffProfessionalCard className="p-4">
        <h4 className={`${staffTheme.sectionTitle} text-sm`}>سجل المحادثات والمشاعر</h4>
        <div className="mt-3 max-h-64 space-y-3 overflow-y-auto">
          {data.recentChats.map((chat) => (
            <article
              key={chat.id}
              className="rounded-md border border-slate-700 bg-slate-800/60 p-3 text-right"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-100">{chat.salonLabel}</span>
                {sentimentBadge(chat.sentiment)}
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{chat.summaryAr}</p>
              <p className="mt-1 text-[10px] text-slate-500">
                {new Date(chat.handledAt).toLocaleString('ar-SA')}
              </p>
            </article>
          ))}
        </div>
      </StaffProfessionalCard>
    </div>
  );
}
