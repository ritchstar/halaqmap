/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * زر «اقرأ عن المنتج» يُضاف في صفحات هبوط المنتجات المنشورة.
 * يحيل الزائر إلى صفحة القراءة التفصيلية المستقلة (/*\/read).
 * لا يُستورد من App ولا يُستخدم في صفحات حلانا1.
 */
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

type Props = {
  to: string;
  labelAr?: string;
};

export function StoreProductReadLink({ to, labelAr = 'اقرأ عن المنتج' }: Props) {
  return (
    <Link
      to={to}
      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/60 underline-offset-4 hover:text-white/90 hover:underline"
    >
      <BookOpen className="h-4 w-4 shrink-0" />
      {labelAr}
    </Link>
  );
}
