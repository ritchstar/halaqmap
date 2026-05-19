import { BarChart3, MessageSquare, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PARTNER_LIAISON_ANALYTICS_MOCK } from '@/modules/ai-staff/registry';

function sentimentBadge(sentiment: 'positive' | 'neutral' | 'friction') {
  if (sentiment === 'positive') {
    return (
      <Badge className="gap-1 bg-emerald-600/90 text-[10px]">
        <ThumbsUp className="h-3 w-3" />
        إيجابي
      </Badge>
    );
  }
  if (sentiment === 'friction') {
    return (
      <Badge variant="destructive" className="gap-1 text-[10px]">
        <ThumbsDown className="h-3 w-3" />
        احتكاك
      </Badge>
    );
  }
  return <Badge variant="secondary" className="text-[10px]">محايد</Badge>;
}

export function PartnerLiaisonAnalyticsPanel() {
  const data = PARTNER_LIAISON_ANALYTICS_MOCK;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-violet-400/25 bg-violet-500/5">
          <CardHeader className="pb-2 pt-4">
            <CardDescription className="text-xs">محادثات مُعالجة (7 أيام)</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MessageSquare className="h-5 w-5 text-violet-400" />
              {data.chatsHandled7d.toLocaleString('ar-SA')}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-violet-400/25 bg-violet-500/5">
          <CardHeader className="pb-2 pt-4">
            <CardDescription className="text-xs">مؤشر المشاعر المتوسط</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BarChart3 className="h-5 w-5 text-violet-400" />
              {data.avgSentimentScore}%
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-amber-400/25 bg-amber-500/5">
          <CardHeader className="pb-2 pt-4">
            <CardDescription className="text-xs">تقارير احتكاك ميداني</CardDescription>
            <CardTitle className="text-2xl text-amber-700 dark:text-amber-200">
              {data.frictionReports7d.toLocaleString('ar-SA')}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">أنماط الاحتكاك التشغيلي الشائعة</CardTitle>
          <CardDescription className="text-xs">ملخص ميداني من مساعد الشركاء — بدون بيانات مالية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.topFrictionThemes.map((row) => (
            <div
              key={row.themeAr}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm"
            >
              <span className="text-right leading-snug">{row.themeAr}</span>
              <Badge variant="outline" className="shrink-0 tabular-nums">
                {row.count}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">سجل المحادثات والمشاعر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-64 overflow-y-auto">
          {data.recentChats.map((chat) => (
            <article
              key={chat.id}
              className="rounded-lg border border-border/50 bg-background/60 p-3 text-right"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground">{chat.salonLabel}</span>
                {sentimentBadge(chat.sentiment)}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{chat.summaryAr}</p>
              <p className="mt-1 text-[10px] text-muted-foreground/80">
                {new Date(chat.handledAt).toLocaleString('ar-SA')}
              </p>
            </article>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
