import { Globe, Moon, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StaffMetricTile } from '@/components/admin/staff/StaffMetricTile';
import { StaffProfessionalCard } from '@/components/admin/staff/StaffProfessionalCard';
import { staffTheme } from '@/components/admin/staff/staffTheme';
import { Activity } from 'lucide-react';
import { DIGITAL_SHIFT_OVERSIGHT_SNAPSHOT } from '@/modules/ai-staff/registry';

type Props = {
  doctrineNotes?: string[];
};

export function DigitalShiftOversightPanel({ doctrineNotes = [] }: Props) {
  const snap = DIGITAL_SHIFT_OVERSIGHT_SNAPSHOT;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <StaffMetricTile
          title="رموز مناوبة نشطة الآن"
          value={snap.activeNow.toLocaleString('ar-SA')}
          icon={Activity}
          accent="violet"
        />
        <StaffMetricTile
          title="إجمالي المنشور (المملكة)"
          value={snap.deployedTokensKingdomWide.toLocaleString('ar-SA')}
          icon={Globe}
          accent="violet"
        />
      </div>

      <StaffProfessionalCard className="p-4">
        <h4 className={`${staffTheme.sectionTitle} mb-3 flex items-center justify-end gap-2 text-sm`}>
          <Globe className="h-4 w-4 text-slate-400" />
          توزيع اللغات (اعتراض العملاء)
        </h4>
        <div className="flex flex-wrap justify-end gap-2">
          {snap.languages.map((lang) => (
            <Badge key={lang.code} variant="secondary" className="gap-1 bg-slate-700 text-slate-300 border-slate-600">
              {lang.label} · {lang.sharePercent}%
            </Badge>
          ))}
        </div>
      </StaffProfessionalCard>

      <StaffProfessionalCard className="border-dashed p-4">
        <h4 className={`${staffTheme.sectionTitle} text-sm`}>
          سياق قاعدة البيانات (migration {snap.migrationId})
        </h4>
        <p className="mt-1 text-xs text-slate-400">
          جداول المحفظة والمناوبة — إشراف إداري فقط · تكلفة الرد {snap.replyCostHalalas} هللة
        </p>
        <div className="mt-3 flex flex-wrap justify-end gap-1.5">
          {snap.walletSchema.map((table) => (
            <Badge key={table} variant="outline" className="border-slate-600 font-mono text-[10px] text-slate-400">
              {table}
            </Badge>
          ))}
        </div>
      </StaffProfessionalCard>

      {doctrineNotes.length > 0 ? (
        <StaffProfessionalCard className="border-amber-800/40 p-4">
          <h4 className={`${staffTheme.sectionTitle} mb-3 flex items-center justify-end gap-2 text-sm text-amber-200`}>
            <Shield className="h-4 w-4" />
            عقيدة التشغيل — حظر مالي
          </h4>
          <div className="space-y-2">
            {doctrineNotes.map((note) => (
              <p key={note} className="flex items-start justify-end gap-2 text-xs leading-relaxed text-slate-400">
                <Moon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
                {note}
              </p>
            ))}
          </div>
        </StaffProfessionalCard>
      ) : null}
    </div>
  );
}
