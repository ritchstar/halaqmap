import { useCallback, useRef, useState, type ReactNode } from 'react';
import { FileSpreadsheet, ImagePlus, Loader2, Upload, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PARTNER_PROSPECT_UNKNOWN_LABEL } from '@/lib/adminCommandCenter';
import type { ScannedPartnerLead } from '@/lib/partnerProspectScanTypes';
import {
  isPartnerProspectSpreadsheetFile,
  parsePartnerProspectSpreadsheetFile,
} from '@/lib/partnerProspectExcelParse';
import { fileToScanPayload, scanPartnerProspectImage } from '@/lib/partnerProspectScanRemote';
import { createPartnerProspect } from '@/lib/partnerProspectsRemote';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type DraftLead = ScannedPartnerLead & { id: string; selected: boolean; sourceFile?: string };

type Props = {
  canManage: boolean;
  onImported?: () => void;
};

function leadKey(lead: ScannedPartnerLead, index: number): string {
  return `${lead.phone}-${index}`;
}

function locationLabel(lead: ScannedPartnerLead): string {
  const parts = [lead.region, lead.address, lead.city].filter(Boolean);
  const unique = [...new Set(parts)];
  return unique.join(' · ') || PARTNER_PROSPECT_UNKNOWN_LABEL;
}

function mergeDrafts(existing: DraftLead[], incoming: ScannedPartnerLead[], sourceFile?: string): DraftLead[] {
  const byPhone = new Map(existing.map((d) => [d.phone, d]));
  let index = existing.length;
  for (const lead of incoming) {
    if (!lead.phone || byPhone.has(lead.phone)) continue;
    const draft: DraftLead = { ...lead, id: leadKey(lead, index++), selected: true, sourceFile };
    byPhone.set(lead.phone, draft);
  }
  return [...byPhone.values()];
}

export function PartnerProspectBulkScanPanel({ canManage, onImported }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [parsingExcel, setParsingExcel] = useState(false);
  const [importing, setImporting] = useState(false);
  const [drafts, setDrafts] = useState<DraftLead[]>([]);
  const [progress, setProgress] = useState('');
  const [dragOver, setDragOver] = useState<'image' | 'excel' | null>(null);

  const scanFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!canManage) return;
      const list = [...files].filter((f) => f.type.startsWith('image/'));
      if (list.length === 0) {
        toast({ title: 'اختر صوراً (JPEG/PNG/WebP)', variant: 'destructive' });
        return;
      }

      setScanning(true);
      const merged: ScannedPartnerLead[] = [];
      const seen = new Set<string>();

      for (let i = 0; i < list.length; i++) {
        const file = list[i]!;
        setProgress(`قراءة صورة ${i + 1} / ${list.length}…`);
        try {
          const payload = await fileToScanPayload(file);
          const result = await scanPartnerProspectImage(payload.base64, payload.mime);
          if (!result.ok) {
            toast({ title: `تعذّر تحليل ${file.name}`, description: result.error, variant: 'destructive' });
            continue;
          }
          for (const lead of result.leads) {
            if (!lead.phone || seen.has(lead.phone)) continue;
            seen.add(lead.phone);
            merged.push(lead);
          }
        } catch {
          toast({ title: `تعذّر قراءة ${file.name}`, variant: 'destructive' });
        }
      }

      setDrafts((prev) => mergeDrafts(prev, merged));
      setScanning(false);
      setProgress('');
      if (merged.length === 0) {
        toast({
          title: 'لم يُستخرج أي lead من الصور',
          description: 'تأكد أن الجدول يظهر: الاسم، الحي/المنطقة، ورقم الهاتف.',
        });
      } else {
        toast({
          title: `تم استخراج ${merged.length} lead من الصور`,
          description: 'راجع القائمة ثم أضِف إلى pipeline.',
        });
      }
    },
    [canManage],
  );

  const parseExcelFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!canManage) return;
      const list = [...files].filter(isPartnerProspectSpreadsheetFile);
      if (list.length === 0) {
        toast({
          title: 'اختر ملف Excel أو CSV',
          description: 'الصيغ المدعومة: `.xlsx` و`.xls` و`.csv`',
          variant: 'destructive',
        });
        return;
      }

      setParsingExcel(true);
      let totalNew = 0;

      for (let i = 0; i < list.length; i++) {
        const file = list[i]!;
        setProgress(`قراءة Excel ${i + 1} / ${list.length}…`);
        try {
          const result = await parsePartnerProspectSpreadsheetFile(file);
          if (result.leads.length === 0) {
            toast({
              title: `لا صفوف في ${file.name}`,
              description: 'تأكد من أعمدة: اسم الصالون، الحي/المنطقة، رقم الهاتف.',
              variant: 'destructive',
            });
            continue;
          }
          setDrafts((prev) => {
            const before = prev.length;
            const next = mergeDrafts(prev, result.leads, file.name);
            totalNew += next.length - before;
            return next;
          });
          if (result.defaultCity) {
            toast({
              title: `ملف ${file.name}`,
              description: `المدينة الافتراضية: ${result.defaultCity} — ${result.leads.length} صف`,
            });
          }
        } catch {
          toast({ title: `تعذّر قراءة ${file.name}`, variant: 'destructive' });
        }
      }

      setParsingExcel(false);
      setProgress('');
      if (totalNew > 0) {
        toast({
          title: `تم تحميل ${totalNew} lead من Excel`,
          description: 'راجع المعاينة ثم أضِف المحدد إلى pipeline.',
        });
      }
    },
    [canManage],
  );

  const importSelected = async () => {
    const picked = drafts.filter((d) => d.selected);
    if (picked.length === 0) {
      toast({ title: 'حدّد lead واحداً على الأقل', variant: 'destructive' });
      return;
    }

    setImporting(true);
    let okCount = 0;
    let failCount = 0;

    for (const lead of picked) {
      const region = lead.region?.trim() || lead.address?.trim() || PARTNER_PROSPECT_UNKNOWN_LABEL;
      const result = await createPartnerProspect({
        name: lead.name.trim() || 'محل حلاق',
        city: lead.city?.trim() || inferCityFromLead(lead) || PARTNER_PROSPECT_UNKNOWN_LABEL,
        region,
        address: lead.address?.trim() || lead.region?.trim() || undefined,
        phone: lead.phone,
        channel: 'whatsapp',
        source: 'import',
        sourceMeta: {
          scanImport: !lead.sourceFile,
          excelImport: Boolean(lead.sourceFile),
          ...(lead.sourceFile ? { sourceFile: lead.sourceFile } : {}),
        },
      });
      if (result.ok) okCount += 1;
      else failCount += 1;
    }

    setImporting(false);
    if (okCount > 0) {
      setDrafts((prev) => prev.filter((d) => !d.selected));
    }

    if (okCount > 0) {
      toast({ title: `أُضيف ${okCount} lead`, description: failCount ? `${failCount} فشل` : undefined });
      onImported?.();
    }
    if (failCount > 0 && okCount === 0) {
      toast({ title: 'تعذّرت الإضافة', description: resultErrorHint(), variant: 'destructive' });
    }
  };

  const busy = scanning || parsingExcel || importing;

  return (
    <div className="space-y-4" dir="rtl">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files?.length) void scanFiles(files);
          e.target.value = '';
        }}
      />
      <input
        ref={excelInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files?.length) void parseExcelFiles(files);
          e.target.value = '';
        }}
      />

      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 space-y-3">
        <DropZone
          variant="image"
          dragOver={dragOver === 'image'}
          disabled={!canManage || busy}
          busy={scanning}
          progress={progress}
          icon={scanning ? <Loader2 className="h-7 w-7 animate-spin" /> : <ImagePlus className="h-7 w-7" />}
          title={scanning ? progress || 'جاري قراءة الصورة…' : 'لقطات جدول (صور)'}
          hint="يُستخرج بالذكاء الاصطناعي: اسم الصالون، الحي/المنطقة، رقم الواتساب."
          badgeLabel="رفع صور"
          onActivate={() => {
            if (!canManage || busy) return;
            imageInputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (canManage) setDragOver('image');
          }}
          onDragLeave={() => setDragOver((v) => (v === 'image' ? null : v))}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(null);
            const imgs = [...(e.dataTransfer.files ?? [])].filter((f) => f.type.startsWith('image/'));
            if (imgs.length) void scanFiles(imgs);
          }}
        />
      </div>

      <div className="rounded-xl border border-sky-500/25 bg-sky-500/5 p-4 space-y-3">
        <DropZone
          variant="excel"
          dragOver={dragOver === 'excel'}
          disabled={!canManage || busy}
          busy={parsingExcel}
          progress={progress}
          icon={parsingExcel ? <Loader2 className="h-7 w-7 animate-spin" /> : <FileSpreadsheet className="h-7 w-7" />}
          title={parsingExcel ? progress || 'جاري قراءة Excel…' : 'ملفات Excel للمناطق'}
          hint={
            'قالب `حلاق ماب`: صف عنوان ثم أعمدة (م، اسم الصالون، الحي، العنوان، رقم الهاتف، يدعم واتساب؟…). يُتخطى الصف إذا كان «أرضي». اسم الملف يحدد المدينة (`halaqmap_alahsa_barbers_FINAL.xlsx`).'
          }
          badgeLabel="رفع Excel / CSV"
          onActivate={() => {
            if (!canManage || busy) return;
            excelInputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (canManage) setDragOver('excel');
          }}
          onDragLeave={() => setDragOver((v) => (v === 'excel' ? null : v))}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(null);
            const sheets = [...(e.dataTransfer.files ?? [])].filter(isPartnerProspectSpreadsheetFile);
            if (sheets.length) void parseExcelFiles(sheets);
          }}
        />
      </div>

      {drafts.length > 0 ? (
        <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs font-semibold text-muted-foreground">معاينة قبل الإضافة ({drafts.length})</p>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-background divide-y">
            {drafts.map((lead) => (
              <label
                key={lead.id}
                className="flex items-start gap-3 px-3 py-2.5 text-sm cursor-pointer hover:bg-muted/40"
              >
                <Checkbox
                  className="mt-1"
                  checked={lead.selected}
                  onCheckedChange={(v) =>
                    setDrafts((prev) =>
                      prev.map((d) => (d.id === lead.id ? { ...d, selected: v === true } : d)),
                    )
                  }
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="font-medium truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{locationLabel(lead)}</p>
                  {lead.sourceFile ? (
                    <p className="text-[10px] text-sky-700 truncate" dir="ltr">
                      {lead.sourceFile}
                    </p>
                  ) : null}
                </div>
                <span className="text-xs font-semibold tabular-nums shrink-0 text-emerald-700" dir="ltr">
                  {lead.phone}
                </span>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setDrafts([])} disabled={importing}>
              مسح القائمة
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!canManage || importing}
              onClick={() => void importSelected()}
            >
              {importing ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <UserPlus className="h-4 w-4 ml-2" />}
              إضافة المحدد إلى pipeline
            </Button>
          </div>
        </div>
      ) : null}

      {!canManage ? (
        <p className="text-[11px] text-destructive">يتطلب صلاحية `manage_command_center`.</p>
      ) : null}
    </div>
  );
}

type DropZoneProps = {
  variant: 'image' | 'excel';
  dragOver: boolean;
  disabled: boolean;
  busy: boolean;
  progress: string;
  icon: ReactNode;
  title: string;
  hint: string;
  badgeLabel: string;
  onActivate: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
};

function DropZone({
  variant,
  dragOver,
  disabled,
  busy,
  icon,
  title,
  hint,
  badgeLabel,
  onActivate,
  onDragOver,
  onDragLeave,
  onDrop,
}: DropZoneProps) {
  const isExcel = variant === 'excel';
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onActivate}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-7 transition-colors',
        dragOver
          ? isExcel
            ? 'border-sky-500 bg-sky-500/15'
            : 'border-emerald-500 bg-emerald-500/15'
          : isExcel
            ? 'border-sky-500/40 bg-background/60 hover:border-sky-500/70 hover:bg-sky-500/10'
            : 'border-emerald-500/40 bg-background/60 hover:border-emerald-500/70 hover:bg-emerald-500/10',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full',
          isExcel ? 'bg-sky-500/15 text-sky-600' : 'bg-emerald-500/15 text-emerald-600',
        )}
      >
        {icon}
      </div>
      <div className="text-center space-y-1">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">{hint}</p>
      </div>
      {!busy ? (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
            isExcel
              ? 'border-sky-500/30 bg-sky-500/10 text-sky-700'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
          )}
        >
          <Upload className="h-3.5 w-3.5" />
          {badgeLabel}
        </span>
      ) : null}
    </button>
  );
}

function inferCityFromLead(lead: ScannedPartnerLead): string | undefined {
  const blob = `${lead.city ?? ''} ${lead.region ?? ''} ${lead.address ?? ''}`;
  const known = [
    'الرياض',
    'جدة',
    'مكة',
    'المدينة',
    'الدمام',
    'الخبر',
    'الظهران',
    'تبوك',
    'أبها',
    'الطائف',
    'بريدة',
    'الأحساء',
  ];
  return known.find((c) => blob.includes(c));
}

function resultErrorHint(): string {
  return 'تحقق من صلاحيات قاعدة البيانات ثم أعد المحاولة.';
}
