import { Copy, Download, ExternalLink, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  absoluteAmbassadorKitHref,
  AMBASSADOR_SLIDES_PDF_FILENAME,
  AMBASSADOR_TRAINING_PDF_FILENAME,
  getAmbassadorMarketingKitGroups,
  HALAQMAP_X_URL,
  type AmbassadorKitLink,
} from '@/config/ambassadorMarketingKit';
import { toast } from '@/components/ui/sonner';

async function copyText(label: string, text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`تم نسخ: ${label}`);
  } catch {
    toast.error('تعذّر النسخ من المتصفح');
  }
}

function KitLinkRow({ link }: { link: AmbassadorKitLink }) {
  const absolute = absoluteAmbassadorKitHref(link);
  const isHashPage = link.kind === 'page';

  return (
    <li className="rounded-xl border border-white/8 bg-black/25 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-100">{link.titleAr}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{link.descriptionAr}</p>
          <p className="mt-2 break-all font-mono text-[10px] text-slate-500" dir="ltr">
            {absolute}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          {isHashPage ? (
            <Button asChild size="sm" variant="outline" className="h-8 border-white/15 px-2 text-[11px]">
              <Link to={link.href}>فتح</Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="h-8 border-white/15 px-2 text-[11px]">
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.kind === 'pdf' ? (
                  <Download className="ml-1 h-3.5 w-3.5" aria-hidden />
                ) : (
                  <ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden />
                )}
                {link.kind === 'pdf' ? 'تحميل' : 'فتح'}
              </a>
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-[11px] text-slate-400"
            onClick={() => copyText(link.titleAr, absolute)}
          >
            <Copy className="ml-1 h-3.5 w-3.5" aria-hidden />
            نسخ
          </Button>
        </div>
      </div>
    </li>
  );
}

/** حقيبة التسويق — تظهر في رئيسية دخول السفير ولوحته. */
export function AmbassadorMarketingKitPanel({ compact }: { compact?: boolean }) {
  const groups = getAmbassadorMarketingKitGroups();

  return (
    <section className="space-y-4" aria-labelledby="amb-kit-heading">
      <div className={compact ? '' : 'text-center'}>
        <div
          className={
            compact
              ? 'mb-2 flex items-center gap-2'
              : 'mb-3 inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-200'
          }
        >
          <FileText className="h-4 w-4 text-teal-300" aria-hidden />
          <h2 id="amb-kit-heading" className={compact ? 'text-sm font-bold text-white' : ''}>
            حقيبة التسويق الميداني
          </h2>
        </div>
        {!compact ? (
          <p className="mx-auto max-w-md text-xs leading-relaxed text-slate-400">
            شرائح وصفحات داعمة + ملفات PDF للتحميل + حساب X. انسخ الرابط أو افتح الصفحة أمام الصالون.
          </p>
        ) : null}
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0f0f14]/90 p-3">
        <p className="mb-2 text-[11px] text-slate-500">تسمية ملفات PDF المتوقعة في المجلد:</p>
        <ul className="space-y-1 font-mono text-[10px] text-slate-400" dir="ltr">
          <li>{AMBASSADOR_TRAINING_PDF_FILENAME}</li>
          <li>{AMBASSADOR_SLIDES_PDF_FILENAME}</li>
        </ul>
        <p className="mt-2 text-[10px] text-slate-500">
          المسار: <code className="text-slate-400">public/docs/ambassadors/</code>
        </p>
        <a
          href={HALAQMAP_X_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-300 hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          X · @halaqmap
        </a>
      </div>

      {groups.map((group) => (
        <div key={group.id} className="rounded-2xl border border-white/10 bg-[#0f0f14]/95 p-4">
          <h3 className="text-sm font-bold text-teal-100">{group.titleAr}</h3>
          <p className="mt-1 mb-3 text-[11px] leading-relaxed text-slate-500">{group.blurbAr}</p>
          <ul className="space-y-2">
            {group.links.map((link) => (
              <KitLinkRow key={link.id} link={link} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
