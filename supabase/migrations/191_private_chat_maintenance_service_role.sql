-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- كرون فيرسل يستدعي run_private_chat_maintenance بمفتاح service_role.
-- المنح السابق كان لـ authenticated فقط فيُرجع المسار 500.

GRANT EXECUTE ON FUNCTION public.run_private_chat_maintenance() TO service_role;

COMMENT ON FUNCTION public.run_private_chat_maintenance() IS
  'ينهي الجلسات الخاصة المنتهية تلقائياً. يُنفَّذ من كرون فيرسل بـ service_role ومن الجلسة المصدَّقة.';
