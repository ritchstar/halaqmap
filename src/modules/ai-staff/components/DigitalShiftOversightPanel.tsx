import { Globe, Moon, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DIGITAL_SHIFT_OVERSIGHT_SNAPSHOT } from '@/modules/ai-staff/registry';

type Props = {
  doctrineNotes?: string[];
};

export function DigitalShiftOversightPanel({ doctrineNotes = [] }: Props) {
  const snap = DIGITAL_SHIFT_OVERSIGHT_SNAPSHOT;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-indigo-400/30 bg-indigo-500/5">
          <CardHeader className="pb-2 pt-4">
            <CardDescription className="text-xs">رموز مناوبة نشطة الآن</CardDescription>
            <CardTitle className="text-2xl">{snap.activeNow.toLocaleString('ar-SA')}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-indigo-400/30 bg-indigo-500/5">
          <CardHeader className="pb-2 pt-4">
            <CardDescription className="text-xs">إجمالي المنشور (المملكة)</CardDescription>
            <CardTitle className="text-2xl">{snap.deployedTokensKingdomWide.toLocaleString('ar-SA')}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-end gap-2 text-sm">
            <Globe className="h-4 w-4 text-indigo-400" />
            توزيع اللغات (اعتراض العملاء)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-end gap-2">
          {snap.languages.map((lang) => (
            <Badge key={lang.code} variant="secondary" className="gap-1">
              {lang.label} · {lang.sharePercent}%
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card className="border-dashed border-muted-foreground/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">سياق قاعدة البيانات (migration {snap.migrationId})</CardTitle>
          <CardDescription className="text-xs">
            جداول المحفظة والمناوبة — إشراف إداري فقط · تكلفة الرد {snap.replyCostHalalas} هللة
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-end gap-1.5">
          {snap.walletSchema.map((table) => (
            <Badge key={table} variant="outline" className="font-mono text-[10px]">
              {table}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {doctrineNotes.length > 0 ? (
        <Card className="border-amber-400/25 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2 text-sm text-amber-900 dark:text-amber-100">
              <Shield className="h-4 w-4" />
              عقيدة التشغيل — حظر مالي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {doctrineNotes.map((note) => (
              <p key={note} className="flex items-start justify-end gap-2 text-xs leading-relaxed text-muted-foreground">
                <Moon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" aria-hidden />
                {note}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
