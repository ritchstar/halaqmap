-- =====================================================
-- مجتمع ماب — رسائل + فيديوهات YouTube + مؤشر القراءة
-- (طلب المستخدم: 92_map_community_core — الرقم 92 مستخدم مسبقاً)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.map_community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  author_display_name text NOT NULL DEFAULT '',
  author_role text NOT NULL DEFAULT 'barber'
    CHECK (author_role IN ('barber', 'admin', 'ai', 'system')),
  content text NOT NULL CHECK (char_length(trim(content)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  is_hidden boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_map_community_messages_created
  ON public.map_community_messages (created_at DESC);

CREATE TABLE IF NOT EXISTS public.map_community_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid REFERENCES public.barbers (id) ON DELETE SET NULL,
  barber_display_name text NOT NULL DEFAULT '',
  title text NOT NULL,
  youtube_url text NOT NULL,
  duration_seconds integer,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_published boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_map_community_videos_created
  ON public.map_community_videos (created_at DESC)
  WHERE is_published = true;

CREATE TABLE IF NOT EXISTS public.map_community_read_cursors (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.map_community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_community_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_community_read_cursors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_map_community_messages" ON public.map_community_messages;
CREATE POLICY "public_read_map_community_messages"
  ON public.map_community_messages FOR SELECT
  USING (is_hidden = false);

DROP POLICY IF EXISTS "authenticated_insert_map_community_messages" ON public.map_community_messages;
CREATE POLICY "authenticated_insert_map_community_messages"
  ON public.map_community_messages FOR INSERT TO authenticated
  WITH CHECK (
    public.is_jwt_platform_admin()
    OR EXISTS (
      SELECT 1
      FROM public.barbers b
      WHERE b.user_id = auth.uid()
        AND b.is_active = true
    )
  );

DROP POLICY IF EXISTS "public_read_map_community_videos" ON public.map_community_videos;
CREATE POLICY "public_read_map_community_videos"
  ON public.map_community_videos FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "authenticated_insert_map_community_videos" ON public.map_community_videos;
CREATE POLICY "authenticated_insert_map_community_videos"
  ON public.map_community_videos FOR INSERT TO authenticated
  WITH CHECK (
    public.is_jwt_platform_admin()
    OR EXISTS (
      SELECT 1
      FROM public.barbers b
      WHERE b.user_id = auth.uid()
        AND b.is_active = true
        AND b.is_verified = true
    )
  );

DROP POLICY IF EXISTS "map_community_read_cursors_select_own" ON public.map_community_read_cursors;
CREATE POLICY "map_community_read_cursors_select_own"
  ON public.map_community_read_cursors FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "map_community_read_cursors_upsert_own" ON public.map_community_read_cursors;
CREATE POLICY "map_community_read_cursors_upsert_own"
  ON public.map_community_read_cursors FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "map_community_read_cursors_update_own" ON public.map_community_read_cursors;
CREATE POLICY "map_community_read_cursors_update_own"
  ON public.map_community_read_cursors FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT ON public.map_community_messages TO anon, authenticated;
GRANT SELECT ON public.map_community_videos TO anon, authenticated;
GRANT INSERT ON public.map_community_messages TO authenticated;
GRANT INSERT ON public.map_community_videos TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.map_community_read_cursors TO authenticated;

-- ─── Seed starter content (YouTube embeds — no Storage) ────────────────────

INSERT INTO public.map_community_messages (author_display_name, author_role, content, created_at)
VALUES
  (
    'مساعد ماب',
    'ai',
    'يا هلا يا مبدعين. موضوع اليوم: وش أكثر شيء يخلي الزبون يرجع لنفس الحلاق؟ جودة القصّة، سرعة الرد، ولا طريقة الاستقبال؟',
    now() - interval '8 minutes'
  ),
  (
    'حلاق الرياض الذهبي',
    'barber',
    'بالنسبة لي طريقة الاستقبال تفرق كثير، بعدها جودة القصة تثبت الزبون.',
    now() - interval '5 minutes'
  ),
  (
    'ستايل برو جدة',
    'barber',
    '@مساعد_ماب كيف أصور شغلي بطريقة تقنع الزبون؟',
    now() - interval '3 minutes'
  );

INSERT INTO public.map_community_videos (barber_display_name, title, youtube_url, duration_seconds, view_count, created_at)
VALUES
  (
    'حلاق الرياض الذهبي',
    'قصّة تدرّج ناعم قبل العيد',
    'https://www.youtube.com/watch?v=StpZcRarCyQ',
    58,
    1200,
    now() - interval '2 days'
  ),
  (
    'ستايل برو جدة',
    'ترتيب لحية كلاسيكي',
    'https://www.youtube.com/watch?v=9V6tWC4Szc4',
    45,
    840,
    now() - interval '3 days'
  ),
  (
    'نجد للعناية الرجالية',
    'تنظيف خط الرقبة باحتراف',
    'https://www.youtube.com/watch?v=AUH7Mvv5Lh4',
    52,
    690,
    now() - interval '4 days'
  ),
  (
    'صالون المدينة',
    'طريقة تصوير نتيجة قبل/بعد',
    'https://www.youtube.com/watch?v=2OEL4P1Rz04',
    60,
    1800,
    now() - interval '5 days'
  );

COMMENT ON TABLE public.map_community_messages IS 'Map Chat — رسائل مجتمع ماب للشركاء.';
COMMENT ON TABLE public.map_community_videos IS 'معرض فيديوهات مجتمع ماب — روابط YouTube فقط.';
COMMENT ON TABLE public.map_community_read_cursors IS 'آخر وقت قراءة لكل عضو — لإبراز المحتوى الجديد.';
