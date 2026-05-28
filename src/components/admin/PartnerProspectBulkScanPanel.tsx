import { useCallback, useRef, useState } from 'react';
import { ImagePlus, Loader2, Upload, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PARTNER_PROSPECT_UNKNOWN_LABEL } from '@/lib/adminCommandCenter';
import type { ScannedPartnerLead } from '@/lib/partnerProspectScanTypes';
import { fileToScanPayload, scanPartnerProspectImage } from '@/lib/partnerProspectScanRemote';
import { createPartnerProspect } from '@/lib/partnerProspectsRemote';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type DraftLead = ScannedPartnerLead & { id: string; selected: boolean };

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

export function PartnerProspectBulkScanPanel({ canManage, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [drafts, setDrafts] = useState<DraftLead[]>([]);
  const [progress, setProgress] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const scanFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!canManage) return;
      const list = [...files].filter((f) => f.type.startsWith('image/'));
      if (list.length === 0) {
        toast({ title: 'اختر صوراً (JPEG/PNG/WebP)', variant: 'destructive' });
        return;
      }

      setScanning(true);
      const merged = new Map<string, DraftLead>();
      let index = 0;

      for (let i = 0; i < list.length; i++) {
        const file = list[i]!;
        setProgress(`قراءة ${i + 1} / ${list.length}…`);
        try {
          const payload = await fileToScanPayload(file);
          const result = await scanPartnerProspectImage(payload.base64, payload.mime);
          if (!result.ok) {
            toast({ title: `تعذّر تحليل ${file.name}`, description: result.error, variant: 'destructive' });
            continue;
          }
          for (const lead of result.leads) {
            if (!lead.phone) continue;
            if (merged.has(lead.phone)) continue;
            merged.set(lead.phone, { ...lead, id: leadKey(lead, index++), selected: true });
          }
        } catch {
          toast({ title: `تعذّر قراءة ${file.name}`, variant: 'destructive' });
        }
      }

      setDrafts([...merged.values()]);
      setScanning(false);
      setProgress('');
      if (merged.size === 0) {
        toast({
          title: 'لم يُستخرج أي lead',
          description: 'تأكد أن الجدول يظهر: الاسم، الحي/المنطقة، ورقم الهاتف.',
        });
      } else {
        toast({
          title: `تم استخراج ${merged.size} lead`,
          description: 'راجع الاسم والعنوان والرقم ثم أضِف إلى pipeline.',
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
        sourceMeta: { scanImport: true },
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

  const openPicker = () => {
    if (!canManage || scanning || importing) return;
    inputRef.current?.click();
  };

  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 space-y-3" dir="rtl">
      <input
        ref={inputRef}
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

      <button
        type="button"
        disabled={!canManage || scanning || importing}
        onClick={openPicker}
        onDragOver={(e) => {
          e.preventDefault();
          if (canManage) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) void scanFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 transition-colors',
          dragOver
            ? 'border-emerald-500 bg-emerald-500/15'
            : 'border-emerald-500/40 bg-background/60 hover:border-emerald-500/70 hover:bg-emerald-500/10',
          (!canManage || scanning || importing) && 'cursor-not-allowed opacity-60',
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
          {scanning ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <ImagePlus className="h-7 w-7" />
          )}
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold text-sm">
            {scanning ? progress || 'جاري قراءة الصورة…' : 'اضغط أو اسحب صورة الجدول هنا'}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
            يُستخرج تلقائياً: <strong>اسم الصالون</strong>، <strong>الحي/المنطقة</strong>،{' '}
            <strong>رقم الواتساب</strong> — مثل جداول Google Sheets أو لقطات الشاشة.
          </p>
        </div>
        {!scanning ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
            <Upload className="h-3.5 w-3.5" />
            رفع صور
          </span>
        ) : null}
      </button>

      {drafts.length > 0 ? (
        <div className="space-y-2">
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

function inferCityFromLead(lead: ScannedPartnerLead): string | undefined {
  const blob = `${lead.city ?? ''} ${lead.region ?? ''} ${lead.address ?? ''}`;
  const known = ['الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام', 'الخبر', 'الظهران', 'تبوك', 'أبها', 'الطائف'];
  return known.find((c) => blob.includes(c));
}

function resultErrorHint(): string {
  return 'تحقق من صلاحيات قاعدة البيانات ثم أعد المحاولة.';
}
