-- =====================================================
-- جدول التصنيفات
-- =====================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  name_en TEXT,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS categories_is_active_idx ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS categories_sort_order_idx ON public.categories(sort_order);

-- تفعيل RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- السياسات
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Trigger لتحديث updated_at
CREATE TRIGGER on_category_updated
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- إدراج تصنيفات افتراضية
INSERT INTO public.categories (name, name_en, icon, sort_order) VALUES
  ('قص شعر', 'Haircut', '✂️', 1),
  ('حلاقة ذقن', 'Beard Trim', '🪒', 2),
  ('صبغة شعر', 'Hair Coloring', '🎨', 3),
  ('تصفيف شعر', 'Hair Styling', '💇', 4),
  ('عناية بالبشرة', 'Skin Care', '🧴', 5),
  ('مساج', 'Massage', '💆', 6)
ON CONFLICT (name) DO NOTHING;