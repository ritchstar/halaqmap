import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, Scissors } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib';
import { SEMAT_CARD_PRODUCT_NAME_AR } from '@/config/sematCardLegalPolicy';
import { readSematDraft } from '@/lib/sematCardDraft';
import {
  SEMAT_BEARD_STYLE_OPTIONS,
  SEMAT_HAIR_PRESET_OPTIONS,
} from '@/config/sematCardFormOptions';

function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

/**
 * صفحة مسح QR — عرض فقط.
 * حالياً تعرض مسودة الجلسة إن تطابق publicId؛ لاحقاً تُجلب من الخادم.
 */
export default function SematScanPage() {
  useDocumentTitle(`${SEMAT_CARD_PRODUCT_NAME_AR} · عرض للحلاق`);
  const { publicId = '' } = useParams<{ publicId: string }>();
  const draft = readSematDraft();
  const match = draft && draft.publicId === publicId ? draft : null;

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100" dir="rtl">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(20,184,166,0.1),transparent_50%)]" />

      <main className="relative z-10 container mx-auto max-w-lg px-4 py-10">
        <p className="mb-2 text-center text-[10px] font-bold tracking-wide text-teal-300/80">HALAQMAP · سمات</p>
        <h1 className="mb-2 text-center text-2xl font-black text-white">تفضيلات العميل</h1>
        <p className="mb-8 text-center text-sm leading-relaxed text-slate-400">
          هذه الصفحة للعرض فقط. تحقق من المقصود مع العميل عند الحاجة. الترجمة الآلية تُضاف لاحقاً.
        </p>

        {!match ? (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-500/5 p-6 text-center">
            <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-amber-300" aria-hidden />
            <p className="text-sm leading-relaxed text-slate-300">
              البطاقة غير متاحة على هذا الجهاز بعد. بعد ربط الخادم ستُفتح تفاصيل البطاقة المفعّلة من أي جوال.
            </p>
            <Link
              to={ROUTE_PATHS.SEMAT_LEGAL}
              className="mt-5 inline-block text-sm font-medium text-amber-200 underline-offset-4 hover:underline"
            >
              إنشاء بطاقة سمات
            </Link>
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0f0f14] p-6">
            <div className="flex items-center gap-3 border-b border-white/8 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-400/25 bg-teal-500/10">
                <Scissors className="h-5 w-5 text-teal-300" aria-hidden />
              </div>
              <div>
                <p className="text-xs text-slate-500">الاسم</p>
                <p className="text-xl font-bold text-white">{match.displayName}</p>
              </div>
            </div>
            <Field
              label="شعر الرأس"
              value={[
                optionLabel(SEMAT_HAIR_PRESET_OPTIONS, match.hairPreset),
                match.hairDetail,
              ]
                .filter(Boolean)
                .join(' · ')}
            />
            <Field
              label="اللحية"
              value={optionLabel(SEMAT_BEARD_STYLE_OPTIONS, match.beardStyle)}
            />
            {match.notes ? <Field label="ملاحظات" value={match.notes} /> : null}
          </div>
        )}
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs text-slate-500">{label}</p>
      <p className="text-base leading-relaxed text-slate-100">{value}</p>
    </div>
  );
}
