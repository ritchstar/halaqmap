/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أبواب الخدمات البرمجية اللاحقة — واجهة المتجر فقط.
 */
import { Link } from 'react-router-dom';
import { STORE_COMMISSION_COPY, STORE_LATER_SERVICES_COPY } from '@/config/storeFront';
import { ROUTE_PATHS } from '@/lib/routePaths';

type Props = {
  onOpenForm?: (event: { preventDefault: () => void }) => void;
  /** داخل قسم له عنوان سابق — بلا تكرار للعنوان. */
  nested?: boolean;
};

const doorClassName =
  'flex h-full flex-col rounded-2xl border border-white/12 bg-[#0b1a24]/70 p-5 transition hover:border-[#e8c547]/40';

export function StoreLaterServicesSection({ onOpenForm, nested = false }: Props) {
  return (
    <div>
      {nested ? null : (
        <>
          <h2 className="text-2xl font-extrabold text-[#f4efe4]">{STORE_LATER_SERVICES_COPY.titleAr}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
            {STORE_LATER_SERVICES_COPY.leadAr}
          </p>
        </>
      )}
      {nested ? (
        <p className="max-w-3xl text-sm leading-relaxed text-white/70">{STORE_LATER_SERVICES_COPY.leadAr}</p>
      ) : null}
      <ul className="mt-5 grid gap-3 md:grid-cols-3">
        {STORE_LATER_SERVICES_COPY.doors.map((door) => {
          const body = (
            <>
              <p className="text-sm font-bold text-[#e8c547]">{door.kickerAr}</p>
              <p className="mt-1 text-lg font-extrabold text-[#f4efe4]">{door.titleAr}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/70">{door.bodyAr}</p>
              <p className="mt-4 text-sm font-bold text-[#e8c547]">{door.ctaAr}</p>
            </>
          );
          return (
            <li key={door.id}>
              {door.action === 'packages' ? (
                <a href={STORE_LATER_SERVICES_COPY.packagesHref} className={doorClassName}>
                  {body}
                </a>
              ) : (
                <Link
                  to={ROUTE_PATHS.STORE_REQUEST}
                  className={doorClassName}
                  onClick={onOpenForm}
                >
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-white/55">{STORE_LATER_SERVICES_COPY.outNoteAr}</p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
        <p className="text-xs font-bold tracking-[0.14em] text-white/45">{STORE_COMMISSION_COPY.kickerAr}</p>
        <p className="mt-1 text-base font-extrabold text-white/80">{STORE_COMMISSION_COPY.titleAr}</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/55">{STORE_COMMISSION_COPY.leadAr}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a href={STORE_COMMISSION_COPY.halaqHref} className="text-white/70 underline-offset-4 hover:text-[#e8c547] hover:underline">
            {STORE_COMMISSION_COPY.halaqLabelAr}
          </a>
          <a href={STORE_COMMISSION_COPY.coiffeurHref} className="text-white/70 underline-offset-4 hover:text-[#e8c547] hover:underline">
            {STORE_COMMISSION_COPY.coiffeurLabelAr}
          </a>
        </div>
      </div>
    </div>
  );
}
