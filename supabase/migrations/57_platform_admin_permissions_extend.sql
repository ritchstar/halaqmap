-- توسيع صلاحيات لوحة الإدارة: بوابات الدفع + تعامل فردي مع المشترك + فوترة الشريك
-- توافق رجعي: نسخ من الصلاحيات العريضة السابقة عند غياب المفتاح الجديد.

UPDATE public.platform_admin_roles
SET permissions = permissions || jsonb_build_object(
  'view_payment_settings', COALESCE((permissions->>'view_payment_settings')::boolean, (permissions->>'view_settings')::boolean, false),
  'manage_payment_settings', COALESCE((permissions->>'manage_payment_settings')::boolean, (permissions->>'view_settings')::boolean, false),
  'manage_subscriber_comms', COALESCE((permissions->>'manage_subscriber_comms')::boolean, (permissions->>'manage_barbers')::boolean, false),
  'manage_subscriber_lifecycle', COALESCE((permissions->>'manage_subscriber_lifecycle')::boolean, (permissions->>'manage_barbers')::boolean, false),
  'manage_partner_billing', COALESCE((permissions->>'manage_partner_billing')::boolean, (permissions->>'review_payments')::boolean, false)
);

ALTER TABLE public.platform_admin_roles
  ALTER COLUMN permissions SET DEFAULT jsonb_build_object(
    'view_overview', true,
    'view_requests', false,
    'review_requests', false,
    'view_barbers', false,
    'manage_barbers', false,
    'view_payments', false,
    'review_payments', false,
    'view_command_center', false,
    'manage_command_center', false,
    'view_messages', false,
    'view_settings', false,
    'manage_admins', false,
    'view_payment_settings', false,
    'manage_payment_settings', false,
    'manage_subscriber_comms', false,
    'manage_subscriber_lifecycle', false,
    'manage_partner_billing', false
  );
