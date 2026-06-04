import type { PartnerTierComparisonColumn } from '@/config/partnerProductHubCopy';

type Props = {
  columns: readonly PartnerTierComparisonColumn[];
  title?: string;
  subtitle?: string;
};

export function PartnerTierComparisonGrid({
  columns,
  title = 'ماذا يضيف الماسي وإضافة المكتب؟',
  subtitle = 'قارن بين مستويات الرخصة — المناوب والمكتب متاحان مع إضافة المكتب الخاص على الماسي فقط',
}: Props) {
  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-xl font-black text-slate-950 md:text-2xl">{title}</h2>
        {subtitle ? <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-600">{subtitle}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((tier) => (
          <div
            key={tier.id}
            className={`relative rounded-[1.5rem] border bg-white/94 p-5 shadow-[0_18px_42px_rgba(148,163,184,0.12)] ${tier.color} ${tier.recommended ? 'shadow-[0_18px_46px_rgba(139,92,246,0.14)]' : ''}`}
          >
            {tier.recommended ? (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-violet-200 bg-white/94 px-3 py-0.5 text-[0.6rem] font-black text-violet-700 shadow-[0_8px_20px_rgba(139,92,246,0.10)]">
                الأكثر قيمةً
              </div>
            ) : null}
            <p className="mb-1 text-xl">{tier.badge}</p>
            <p className={`mb-3 text-sm font-black ${tier.badgeColor}`}>{tier.name}</p>
            <div className="space-y-1.5">
              {tier.features.map((feature) => (
                <p key={feature} className="text-[0.72rem] leading-relaxed text-slate-700">
                  {feature}
                </p>
              ))}
            </div>
            <p className="mt-3 text-[0.62rem] text-slate-500">{tier.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
