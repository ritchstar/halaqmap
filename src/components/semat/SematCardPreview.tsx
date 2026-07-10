import type { ReactNode } from 'react';
import QRCode from 'react-qr-code';
import { Scissors, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEMAT_CARD_PRODUCT_NAME_AR } from '@/config/sematCardLegalPolicy';
import {
  SEMAT_BEARD_STYLE_OPTIONS,
  SEMAT_HAIR_PRESET_OPTIONS,
} from '@/config/sematCardFormOptions';
import { buildAbsoluteHashRoute } from '@/config/siteOrigin';
import { ROUTE_PATHS } from '@/lib';

export type SematCardPreviewProps = {
  displayName: string;
  hairPreset: string;
  hairDetail: string;
  beardStyle: string;
  notes: string;
  publicId: string;
  /** معاينة قبل الدفع: غباش على QR وبعض الحقول */
  locked?: boolean;
  referenceImageUrl?: string | null;
  className?: string;
};

function labelFor(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function SematCardPreview({
  displayName,
  hairPreset,
  hairDetail,
  beardStyle,
  notes,
  publicId,
  locked = true,
  referenceImageUrl,
  className,
}: SematCardPreviewProps) {
  const scanPath = ROUTE_PATHS.SEMAT_SCAN.replace(':publicId', encodeURIComponent(publicId));
  const scanUrl = buildAbsoluteHashRoute(scanPath);
  const hairLabel = labelFor(SEMAT_HAIR_PRESET_OPTIONS, hairPreset);
  const beardLabel = labelFor(SEMAT_BEARD_STYLE_OPTIONS, beardStyle);

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-[380px] overflow-hidden rounded-2xl border border-amber-400/35',
        'bg-gradient-to-b from-[#1a1a1f] via-[#0c0c10] to-[#08080b]',
        'shadow-[0_24px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)]',
        className,
      )}
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-amber-300/70 to-transparent" />
      <div className="pointer-events-none absolute -left-16 top-8 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative px-5 pb-5 pt-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-amber-400/80">HALAQMAP</p>
            <p className="mt-1 text-xs text-slate-400">{SEMAT_CARD_PRODUCT_NAME_AR}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10">
            <Sparkles className="h-5 w-5 text-amber-300" aria-hidden />
          </div>
        </div>

        <h3
          className={cn(
            'mb-6 text-2xl font-black text-white',
            locked && 'select-none blur-[5px]',
          )}
        >
          {displayName.trim() || '—'}
        </h3>

        <div className="space-y-3">
          <SpecRow
            icon={<Scissors className="h-4 w-4" aria-hidden />}
            title="شعر الرأس"
            body={[hairLabel, hairDetail.trim()].filter(Boolean).join(' · ')}
            locked={locked}
          />
          <SpecRow
            icon={<span className="text-xs font-bold">ذقن</span>}
            title="اللحية"
            body={beardLabel}
            locked={locked}
          />
          {notes.trim() ? (
            <SpecRow
              icon={<span className="text-xs font-bold">ملاحظة</span>}
              title="ملاحظات"
              body={notes.trim()}
              locked={locked}
            />
          ) : null}
        </div>

        {referenceImageUrl ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <img
              src={referenceImageUrl}
              alt="مرجع بصري للقصة"
              className={cn('h-28 w-full object-cover', locked && 'blur-[6px] brightness-75')}
            />
          </div>
        ) : null}

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-slate-500">امسح لعرض التفاصيل للحلاق</p>
            {locked ? (
              <p className="mt-1 text-xs font-semibold text-amber-200/90">معاينة — QR مغطى حتى التفعيل</p>
            ) : (
              <p className="mt-1 break-all text-[9px] text-slate-500" dir="ltr">
                {scanUrl}
              </p>
            )}
          </div>
          <div
            className={cn(
              'relative shrink-0 rounded-lg bg-white p-2',
              locked && 'select-none',
            )}
          >
            <QRCode value={scanUrl} size={88} level="M" bgColor="#ffffff" fgColor="#0a0a0a" />
            {locked ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/45 backdrop-blur-[6px]">
                <span className="rotate-[-18deg] text-[10px] font-black tracking-wide text-amber-100/95">
                  حلاق ماب
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecRow({
  icon,
  title,
  body,
  locked,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  locked?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-500/10 text-amber-300">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-slate-500">{title}</p>
        <p className={cn('text-sm leading-relaxed text-slate-100', locked && 'blur-[3px]')}>{body}</p>
      </div>
    </div>
  );
}
