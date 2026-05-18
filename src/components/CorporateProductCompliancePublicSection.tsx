import { CorporateProductComplianceCard } from '@/components/admin/CorporateProductComplianceCard';

/**
 * وثيقة التعريف بالمنتج والامتثال الرقمي — الصفحة الرئيسية العامة.
 * جدول رسمي مرئي للمراجعين والتدقيق التجاري.
 */
export function CorporateProductCompliancePublicSection() {
  return (
    <section
      className="container mx-auto px-3 sm:px-4 pb-6 sm:pb-10"
      aria-labelledby="corporate-product-compliance-title"
    >
      <div className="max-w-4xl mx-auto">
        <CorporateProductComplianceCard variant="public" />
      </div>
    </section>
  );
}
