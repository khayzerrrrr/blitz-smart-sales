-- ============================================
-- Blitz CRM - FINAL RLS Migration
-- Copy & Run in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. Add created_by to schools if missing
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schools' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE schools ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- 2. Add user_id FK to visits if missing
-- ============================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'visits' AND column_name = 'user_id'
    AND column_default LIKE '%00000000%')
  THEN
    ALTER TABLE visits ALTER COLUMN user_id DROP DEFAULT;
    ALTER TABLE visits ALTER COLUMN user_id SET DEFAULT auth.uid();
  END IF;
END $$;

-- ============================================
-- 3. Add created_by to pipelines
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE pipelines ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid();
  END IF;
END $$;

-- ============================================
-- 4. Add latitude/longitude to visits
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'visits' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE visits ADD COLUMN latitude DECIMAL DEFAULT NULL;
    ALTER TABLE visits ADD COLUMN longitude DECIMAL DEFAULT NULL;
  END IF;
END $$;

-- ============================================
-- 5. Ensure school_photos table exists
-- ============================================
CREATE TABLE IF NOT EXISTS school_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  school_name TEXT DEFAULT '',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ============================================
-- 6. Add UNIQUE constraint on pipelines.school_id
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pipelines_school_id_unique'
  ) THEN
    ALTER TABLE pipelines ADD CONSTRAINT pipelines_school_id_unique UNIQUE (school_id);
  END IF;
END $$;

-- ============================================
-- 7. STRICT ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_photos ENABLE ROW LEVEL SECURITY;

-- Drop all old policies
DROP POLICY IF EXISTS "Schools are readable by authenticated users" ON schools;
DROP POLICY IF EXISTS "Schools are insertable by authenticated users" ON schools;
DROP POLICY IF EXISTS "Schools are updatable by authenticated users" ON schools;
DROP POLICY IF EXISTS "Schools are deletable by authenticated users" ON schools;
DROP POLICY IF EXISTS "Visits are readable by authenticated users" ON visits;
DROP POLICY IF EXISTS "Visits are insertable by authenticated users" ON visits;
DROP POLICY IF EXISTS "Visits are updatable by authenticated users" ON visits;
DROP POLICY IF EXISTS "Visits are deletable by authenticated users" ON visits;
DROP POLICY IF EXISTS "Pipelines are readable by authenticated users" ON pipelines;
DROP POLICY IF EXISTS "Pipelines are insertable by authenticated users" ON pipelines;
DROP POLICY IF EXISTS "Pipelines are updatable by authenticated users" ON pipelines;
DROP POLICY IF EXISTS "Pipelines are deletable by authenticated users" ON pipelines;
DROP POLICY IF EXISTS "Photos are readable by authenticated users" ON school_photos;
DROP POLICY IF EXISTS "Photos are insertable by authenticated users" ON school_photos;
DROP POLICY IF EXISTS "Photos are deletable by authenticated users" ON school_photos;
DROP POLICY IF EXISTS "Enable all for authenticated" ON schools;
DROP POLICY IF EXISTS "Enable all for authenticated" ON visits;
DROP POLICY IF EXISTS "Enable all for authenticated" ON pipelines;
DROP POLICY IF EXISTS "Enable all for authenticated" ON school_photos;

-- === SCHOOLS RLS ===
-- Read: only schools created by you OR schools you have visited
CREATE POLICY "schools_select_owned_or_visited" ON schools
  FOR SELECT USING (
    auth.uid() = created_by
    OR id IN (SELECT school_id FROM visits WHERE user_id = auth.uid())
  );
-- Insert: any authenticated user
CREATE POLICY "schools_insert_auth" ON schools
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Update: only creator
CREATE POLICY "schools_update_own" ON schools
  FOR UPDATE USING (auth.uid() = created_by);
-- Delete: only creator
CREATE POLICY "schools_delete_own" ON schools
  FOR DELETE USING (auth.uid() = created_by);

-- === VISITS RLS ===
-- Read: only your own visits
CREATE POLICY "visits_select_own" ON visits
  FOR SELECT USING (auth.uid() = user_id);
-- Insert: only as yourself
CREATE POLICY "visits_insert_own" ON visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Update: only your own visits
CREATE POLICY "visits_update_own" ON visits
  FOR UPDATE USING (auth.uid() = user_id);
-- Delete: only your own visits
CREATE POLICY "visits_delete_own" ON visits
  FOR DELETE USING (auth.uid() = user_id);

-- === PIPELINES RLS ===
-- Read: pipelines where you created the pipeline or the underlying school
CREATE POLICY "pipelines_select_related" ON pipelines
  FOR SELECT USING (
    auth.uid() = created_by
    OR school_id IN (SELECT id FROM schools WHERE created_by = auth.uid())
    OR school_id IN (SELECT school_id FROM visits WHERE user_id = auth.uid())
  );
-- Insert: authenticated users
CREATE POLICY "pipelines_insert_auth" ON pipelines
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Update: creator
CREATE POLICY "pipelines_update_own" ON pipelines
  FOR UPDATE USING (auth.uid() = created_by);
-- Delete: creator
CREATE POLICY "pipelines_delete_own" ON pipelines
  FOR DELETE USING (auth.uid() = created_by);

-- === SCHOOL PHOTOS RLS ===
-- Read: photos for schools you own or visited
CREATE POLICY "photos_select_related" ON school_photos
  FOR SELECT USING (
    school_id IN (SELECT id FROM schools WHERE created_by = auth.uid())
    OR school_id IN (SELECT school_id FROM visits WHERE user_id = auth.uid())
  );
-- Insert: authenticated users
CREATE POLICY "photos_insert_auth" ON school_photos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Delete: uploader or school owner
CREATE POLICY "photos_delete_own" ON school_photos
  FOR DELETE USING (
    uploaded_by = auth.uid()
    OR school_id IN (SELECT id FROM schools WHERE created_by = auth.uid())
  );

-- ============================================
-- 8. Realtime for pipelines + photos
-- ============================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE pipelines;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE school_photos;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- DONE
-- ============================================
