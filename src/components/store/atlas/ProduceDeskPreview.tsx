/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة صندوق خضارنا1: التذكرة المكتوبة بعد إرسال الطلب.
 */
export function ProduceDeskPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className="store-atlas__phone w-full max-w-none rounded-[18px]" dir="rtl">
      <div className="store-atlas__phone-bar" />
      <div className={compact ? 'px-3 py-3' : 'px-4 py-4'}>
        <p className="store-atlas__meta font-extrabold text-[var(--atlas-teal)]">لوحة الصندوق</p>
        <p className="store-atlas__card-title mt-1">وصل طلب جديد</p>
        <div className="mt-3 rounded-xl border border-[var(--atlas-line)] bg-[#061018] p-3">
          <p className="text-sm font-extrabold">جار الحي · 05xxxxxxxx</p>
          <p className="store-atlas__meta mt-1 text-[var(--atlas-muted)]">توصيل للبيت · صندوق اليوم</p>
          <ul className="store-atlas__body mt-3 space-y-1">
            <li>طماطم · 1 كيلو</li>
            <li>رمان · حبتان</li>
          </ul>
          <p className="mt-3 text-sm font-extrabold text-[var(--atlas-teal)]">الإجمالي يظهر عند الصندوق</p>
        </div>
      </div>
    </div>
  );
}
