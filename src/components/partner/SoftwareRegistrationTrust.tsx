/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قسم ثقة — تسجيل مصنف حلاق ماب البرمجي لدى الهيئة السعودية للملكية الفكرية.
 */
import { FileText, ExternalLink } from 'lucide-react';
import {
  platformSoftwareRegistration,
  PLATFORM_SOFTWARE_REGISTRATION_DISCLAIMER_AR,
} from '@/config/platformSoftwareRegistration';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  id?: string;
};

export function SoftwareRegistrationTrust({ className, id = 'تسجيل-المصنف' }: Props) {
  const { workNameAr, authorityAr, registrationNumber, registrationDateAr, workTypeAr, publicCertificateUrl } =
    platformSoftwareRegistration;

  return (
    <section
      id={id}
      className={cn(
        'relative z-10 border-y border-white/10 bg-white/[0.03] py-12 md:py-16',
        className,
      )}
      dir="rtl"
      aria-labelledby={`${id}-heading`}
    >
      <div className="mx-auto max-w-4xl px-5">
        <div className="rounded-2xl border border-teal-400/25 bg-gradient-to-br from-teal-950/40 via-[#041018] to-[#020912] p-6 shadow-[0_20px_48px_rgba(2,9,18,0.45)] md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-teal-300/30 bg-teal-500/10"
              aria-hidden
            >
              <FileText className="h-7 w-7 text-teal-200/90" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 id={`${id}-heading`} className="text-xl font-black text-white md:text-2xl">
                {workNameAr} مصنف برمجي مسجل
              </h2>
              <p className="mt-1 text-sm font-semibold text-teal-100/90">لدى {authorityAr}</p>

              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <dt className="text-[0.68rem] font-bold text-slate-400">نوع المصنف</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-200">{workTypeAr}</dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <dt className="text-[0.68rem] font-bold text-slate-400">رقم التسجيل</dt>
                  <dd className="mt-1">
                    <bdi dir="ltr" className="inline-block font-mono text-sm font-bold tabular-nums text-teal-100">
                      {registrationNumber}
                    </bdi>
                  </dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:col-span-2">
                  <dt className="text-[0.68rem] font-bold text-slate-400">تاريخ التسجيل</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-200">
                    <bdi dir="ltr">{registrationDateAr}</bdi>
                  </dd>
                </div>
              </dl>

              <p className="mt-5 text-sm leading-7 text-slate-400">{PLATFORM_SOFTWARE_REGISTRATION_DISCLAIMER_AR}</p>

              {publicCertificateUrl ? (
                <a
                  href={publicCertificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-teal-300/35 bg-teal-500/10 px-5 py-2.5 text-sm font-bold text-teal-100 transition-colors hover:border-teal-300/55 hover:bg-teal-500/18"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                  عرض شهادة تسجيل المصنف
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
