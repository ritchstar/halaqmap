-- Admin Role Assignments (Template)
-- المتطلب: تنفيذ migration 58_admin_role_templates.sql أولاً.
-- عدّل الإيميلات أدناه ثم نفّذ السكربت بالكامل.

BEGIN;

-- 1) Super Admin
UPDATE public.platform_admin_roles
SET
  permissions = public.platform_admin_permissions_template('super_admin'),
  updated_at = now(),
  display_name = COALESCE(display_name, 'Super Admin')
WHERE lower(trim(email)) = lower(trim('owner@yourcompany.com'));

-- 2) Finance Admin
UPDATE public.platform_admin_roles
SET
  permissions = public.platform_admin_permissions_template('finance_admin'),
  updated_at = now(),
  display_name = COALESCE(display_name, 'Finance Admin')
WHERE lower(trim(email)) = lower(trim('finance@yourcompany.com'));

-- 3) Subscriber Support
UPDATE public.platform_admin_roles
SET
  permissions = public.platform_admin_permissions_template('subscriber_support'),
  updated_at = now(),
  display_name = COALESCE(display_name, 'Subscriber Support')
WHERE lower(trim(email)) = lower(trim('support@yourcompany.com'));

-- 4) Payment Operations
UPDATE public.platform_admin_roles
SET
  permissions = public.platform_admin_permissions_template('payment_ops'),
  updated_at = now(),
  display_name = COALESCE(display_name, 'Payment Operations')
WHERE lower(trim(email)) = lower(trim('payments-ops@yourcompany.com'));

COMMIT;

-- للتحقق بعد التنفيذ:
-- SELECT email, is_active, permissions
-- FROM public.platform_admin_roles
-- WHERE lower(trim(email)) IN (
--   lower(trim('owner@yourcompany.com')),
--   lower(trim('finance@yourcompany.com')),
--   lower(trim('support@yourcompany.com')),
--   lower(trim('payments-ops@yourcompany.com'))
-- )
-- ORDER BY email;

