/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * سطر صغير داخل بطاقة «حالة النشاط» يوضّح لصاحب النشاط أن كل تعديل
 * (اسم، وصف، لون خلفية، ساعات...) يُحفظ تلقائياً على الخادم — بدون زر
 * حفظ صريح، فبدونه يبدو وكأن الاختيار لم يُحفظ.
 */
import type { StoreLiveDeskSaveStatus } from '@/lib/storeLiveDeskSync';

const DOT_CLASS: Record<StoreLiveDeskSaveStatus, string> = {
  idle: 'bg-white/30',
  saving: 'bg-amber-400 animate-pulse',
  saved: 'bg-emerald-400',
  error: 'bg-red-400',
};

const LABEL_AR: Record<StoreLiveDeskSaveStatus, string> = {
  idle: 'كل تعديل يُحفظ تلقائياً',
  saving: 'جارٍ حفظ التعديل…',
  saved: 'تم حفظ آخر تعديل',
  error: 'تعذر حفظ آخر تعديل — تحقق من الاتصال',
};

export function StoreDeskSaveStatusLine({ status }: { status: StoreLiveDeskSaveStatus }) {
  return (
    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/60">
      <span className={`inline-block size-1.5 shrink-0 rounded-full ${DOT_CLASS[status]}`} />
      {LABEL_AR[status]}
    </p>
  );
}
