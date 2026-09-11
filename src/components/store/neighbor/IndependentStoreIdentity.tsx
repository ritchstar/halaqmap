/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يوضّح أن الصفحة خاصة ببائع واحد — ليست سوقاً مشتركاً.
 */
import { cn } from '@/lib/utils';

export function IndependentStoreIdentity({
  shopName,
  compact = false,
  className,
}: {
  shopName: string;
  compact?: boolean;
  className?: string;
}) {
  const name = shopName.trim() || 'هذا النشاط';
  if (compact) {
    return (
      <p className={cn('neighbor-store-identity neighbor-store-identity--compact', className)} role="note">
        طلبك من <strong>{name}</strong> — صفحة خاصة بصاحب النشاط
      </p>
    );
  }
  return (
    <aside
      className={cn('neighbor-store-identity', className)}
      role="note"
      aria-label="هوية النشاط المستقل"
    >
      <p className="neighbor-store-identity__title">تتسوق الآن من صفحة خاصة</p>
      <p className="neighbor-store-identity__body">
        أنت على صفحة <strong>{name}</strong> — يدير صاحب النشاط منتجاته وأسعاره وتوفره وخيارات التوصيل أو
        الاستلام مباشرة. هذه ليست سوقاً مشتركة بين عدة بائعين.
      </p>
    </aside>
  );
}
