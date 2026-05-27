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
        <h2 className="text-xl font-black text-white md:text-2xl">{title}</h2>
        {subtitle ? <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-400">{subtitle}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((tier) => (
          <div
            key={tier.id}
            className={`relative rounded-2xl border p-5 ${tier.color} ${tier.recommended ? 'shadow-[0_0_30px_rgba(139,92,246,0.15)]' : ''}`}
          >
            {tier.recommended ? (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-3 py-0.5 text-[0.6rem] font-black text-white">
                الأكثر قيمةً
              </div>
            ) : null}
            <p className="mb-1 text-xl">{tier.badge}</p>
            <p className={`mb-3 text-sm font-black ${tier.badgeColor}`}>{tier.name}</p>
            <div className="space-y-1.5">
              {tier.features.map((feature) => (
                <p key={feature} className="text-[0.72rem] leading-relaxed text-slate-300">
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
