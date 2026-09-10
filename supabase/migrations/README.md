# Supabase migrations — halaqmap

## قاعدة إلزامية بعد ترحيل 74

ترحيل `74_prepare_data_api_explicit_grants_defaults.sql` يلغي المنح الافتراضية لـ `anon` و`authenticated` و`service_role` على **أي جدول جديد** في `public`:

```sql
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM anon, authenticated, service_role;
```

**أي `CREATE TABLE` جديد بعد ترحيل 74 يجب أن يتضمّن في نفس الملف عبارات `GRANT` صريحة لكل دور يُفترض أن يصل للجدول** (عادة `service_role` على الأقل، و`authenticated` إن لزم مع سياسة RLS).

بدون `GRANT`، الجدول **غير قابل للوصول عبر PostgREST/Data API من أي دور — بما في ذلك `service_role` نفسه**، حتى لو وُجدت سياسات RLS تسمح نظرياً.

**مثال واقعي:** ترحيل 89 أنشأ `security_events` و`security_block_list` بسياسات RLS فقط دون `GRANT` — ففشلت استدعاءات `api/_lib/securityGuard.ts` وملفات الأمن الأخرى حتى أُصلح ذلك في `20260910180000` و`20260910190000`.

## تسمية الملفات

- التسلسل الرقمي: `NN_description.sql` (حتى 205)
- بالتاريخ: `YYYYMMDDHHMMSS_description.sql` (للترتيب بعد الملفات الموجودة)

## إصلاح سجل الترحيلات

إذا طُبّق SQL يدوياً على الإنتاج عبر SQL Editor قبل دفعه إلى Git:

```bash
supabase migration repair <version> --status applied
```
