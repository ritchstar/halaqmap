-- إعادة ربط cover_image بأول بنر مميز للحلاقين الحاليين (قبل إصلاح الاعتماد)
UPDATE public.barbers b
SET
  cover_image = trim(b.featured_images->>0),
  updated_at = now()
WHERE jsonb_typeof(b.featured_images) = 'array'
  AND jsonb_array_length(b.featured_images) > 0
  AND length(trim(COALESCE(b.featured_images->>0, ''))) > 0
  AND (
    b.cover_image IS NULL
    OR trim(b.cover_image) = ''
    OR trim(b.cover_image) IS DISTINCT FROM trim(b.featured_images->>0)
  );
