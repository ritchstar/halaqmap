import { useRef, useState } from 'react';
import { Camera, Loader2, Upload, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PARTNER_PROSPECT_UNKNOWN_LABEL } from '@/lib/adminCommandCenter';
import type { ScannedPartnerLead } from '@/lib/partnerProspectScanTypes';
import { fileToScanPayload, scanPartnerProspectImage } from '@/lib/partnerProspectScanRemote';
import { createPartnerProspect } from '@/lib/partnerProspectsRemote';
import { toast } from '@/hooks/use-toast';

type DraftLead = ScannedPartnerLead & { id: string; selected: boolean };

type Props = {
  canManage: boolean;
  onImported?: () => void;
};

function leadKey(lead: ScannedPartnerLead, index: number): string {
  return `${lead.phone}-${index}`;
}

export function PartnerProspectBulkScanPanel({ canManage, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [drafts, setDrafts] = useState<DraftLead[]>([]);
  const [progress, setProgress] = useState('');

  const scanFiles = async (files: FileList | File[]) => {
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
      setProgress(`تحليل ${i + 1} / ${list.length}…`);
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
      toast({ title: 'لم يُستخرج أي رقم', description: 'جرّب لقطة أوضح للاسم ورقم الواتساب.' });
    } else {
      toast({ title: `تم استخراج ${merged.size} lead`, description: 'راجع القائمة ثم أضِف إلى pipeline.' });
    }
  };

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
      const result = await createPartnerProspect({
        name: lead.name.trim() || 'محل حلاق',
        city: lead.city?.trim() || PARTNER_PROSPECT_UNKNOWN_LABEL,
        region: lead.region?.trim() || PARTNER_PROSPECT_UNKNOWN_LABEL,
        phone: lead.phone,
        channel: 'whatsapp',
        source: 'import',
        sourceMeta: { scanImport: true },
      });
      if (result.ok) okCount += 1;
      else failCount += 1;
    }

    setImporting(false);
    setDrafts((prev) => prev.filter((d) => !d.selected || failCount > 0));

    if (okCount > 0) {
      toast({ title: `أُضيف ${okCount} lead`, description: failCount ? `${failCount} فشل` : undefined });
      onImported?.();
    }
    if (failCount > 0 && okCount === 0) {
      toast({
        title: 'تعذّرت الإضافة',
        description: 'تحقق من صلاحيات قاعدة البيانات (ترحيل 96) ثم أعد المحاولة.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 space-y-3" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold flex items-center gap-2">
            <Camera className="h-4 w-4 text-emerald-600" />
            استيراد جماعي من الصور
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            صوّر لقطة شاشة (خرائط، انستقرام، قائمة محلات…) — يُستخرج الاسم ورقم الواتساب تلقائياً. يكفي الرقم للمراسلة لاحقاً من pipeline.
          </p>
        </div>
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canManage || scanning || importing}
          onClick={() => inputRef.current?.click()}
        >
          {scanning ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <Upload className="h-4 w-4 ml-2" />}
          {scanning ? progress || 'جاري التحليل…' : 'رفع صور'}
        </Button>
      </div>

      {drafts.length > 0 ? (
        <div className="space-y-2">
          <div className="max-h-52 overflow-y-auto rounded-lg border border-border bg-background divide-y">
            {drafts.map((lead) => (
              <label
                key={lead.id}
                className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-muted/40"
              >
                <Checkbox
                  checked={lead.selected}
                  onCheckedChange={(v) =>
                    setDrafts((prev) =>
                      prev.map((d) => (d.id === lead.id ? { ...d, selected: v === true } : d)),
                    )
                  }
                />
                <span className="font-medium truncate flex-1">{lead.name}</span>
                <span className="text-muted-foreground tabular-nums shrink-0" dir="ltr">
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
