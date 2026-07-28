-- ============================================
-- Blitz CRM - Initial Schema & Final RLS
-- Jalankan di Supabase SQL Editor (sekali)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: schools (Stock Database)
-- ============================================
CREATE TABLE IF NOT EXISTS schools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  regional TEXT DEFAULT '',
  total_students INTEGER DEFAULT 0,
  total_teachers INTEGER DEFAULT 0,
  latitude DECIMAL DEFAULT 0,
  longitude DECIMAL DEFAULT 0,
  contact_person TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ============================================
-- Table: visits (Kunjungan Harian)
-- ============================================
CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  user_id UUID DEFAULT auth.uid(),
  user_name TEXT DEFAULT '',
  school_name TEXT NOT NULL,
  visit_date DATE DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('Selesai', 'Proses', 'Dijadwalkan')) DEFAULT 'Dijadwalkan',
  notes TEXT DEFAULT '',
  pic_name TEXT DEFAULT '',
  pic_phone TEXT DEFAULT '',
  total_students INTEGER DEFAULT 0,
  total_teachers INTEGER DEFAULT 0,
  has_bilingual BOOLEAN DEFAULT FALSE,
  latitude DECIMAL DEFAULT NULL,
  longitude DECIMAL DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ============================================
-- Table: pipelines (Kanban)
-- ============================================
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  school_name TEXT NOT NULL,
  contact_person TEXT DEFAULT '',
  total_students INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  stage TEXT CHECK (stage IN ('Prospect', 'Presentasi', 'Proposal', 'MoU', 'Not This Time')) DEFAULT 'Prospect',
  offer_price INTEGER DEFAULT NULL,
  deal_price INTEGER DEFAULT NULL,
  last_action TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- UNIQUE constraint on pipelines.school_id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pipelines_school_id_unique'
  ) THEN
    ALTER TABLE pipelines ADD CONSTRAINT pipelines_school_id_unique UNIQUE (school_id);
  END IF;
END $$;

-- ============================================
-- Table: school_photos (Galeri Foto)
-- ============================================
CREATE TABLE IF NOT EXISTS school_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  school_name TEXT DEFAULT '',
  uploaded_by UUID DEFAULT auth.uid(),
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_photos ENABLE ROW LEVEL SECURITY;

-- Drop old policies first
DROP POLICY IF EXISTS "schools_select_owned_or_visited" ON schools;
DROP POLICY IF EXISTS "schools_insert_auth" ON schools;
DROP POLICY IF EXISTS "schools_update_own" ON schools;
DROP POLICY IF EXISTS "schools_delete_own" ON schools;
DROP POLICY IF EXISTS "visits_select_own" ON visits;
DROP POLICY IF EXISTS "visits_insert_own" ON visits;
DROP POLICY IF EXISTS "visits_update_own" ON visits;
DROP POLICY IF EXISTS "visits_delete_own" ON visits;
DROP POLICY IF EXISTS "pipelines_select_related" ON pipelines;
DROP POLICY IF EXISTS "pipelines_insert_auth" ON pipelines;
DROP POLICY IF EXISTS "pipelines_update_own" ON pipelines;
DROP POLICY IF EXISTS "pipelines_delete_own" ON pipelines;
DROP POLICY IF EXISTS "photos_select_related" ON school_photos;
DROP POLICY IF EXISTS "photos_insert_auth" ON school_photos;
DROP POLICY IF EXISTS "photos_delete_own" ON school_photos;
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

-- SCHOOLS: read own/visited, insert any auth, update/delete own
CREATE POLICY "schools_select_owned_or_visited" ON schools
  FOR SELECT USING (
    auth.uid() = created_by
    OR id IN (SELECT school_id FROM visits WHERE user_id = auth.uid())
  );
CREATE POLICY "schools_insert_auth" ON schools
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "schools_update_own" ON schools
  FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "schools_delete_own" ON schools
  FOR DELETE USING (auth.uid() = created_by);

-- VISITS: own only
CREATE POLICY "visits_select_own" ON visits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "visits_insert_own" ON visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "visits_update_own" ON visits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "visits_delete_own" ON visits
  FOR DELETE USING (auth.uid() = user_id);

-- PIPELINES: read related, insert any auth, update/delete own
CREATE POLICY "pipelines_select_related" ON pipelines
  FOR SELECT USING (
    auth.uid() = created_by
    OR school_id IN (SELECT id FROM schools WHERE created_by = auth.uid())
    OR school_id IN (SELECT school_id FROM visits WHERE user_id = auth.uid())
  );
CREATE POLICY "pipelines_insert_auth" ON pipelines
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "pipelines_update_own" ON pipelines
  FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "pipelines_delete_own" ON pipelines
  FOR DELETE USING (auth.uid() = created_by);

-- PHOTOS: read related, insert any auth, delete uploader/owner
CREATE POLICY "photos_select_related" ON school_photos
  FOR SELECT USING (
    school_id IN (SELECT id FROM schools WHERE created_by = auth.uid())
    OR school_id IN (SELECT school_id FROM visits WHERE user_id = auth.uid())
  );
CREATE POLICY "photos_insert_auth" ON school_photos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "photos_delete_own" ON school_photos
  FOR DELETE USING (
    uploaded_by = auth.uid()
    OR school_id IN (SELECT id FROM schools WHERE created_by = auth.uid())
  );

-- ============================================
-- Realtime
-- ============================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE schools;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE visits;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE pipelines;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE school_photos;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- Storage bucket + RLS untuk school-photos
-- ============================================
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('school-photos', 'school-photos', true, false)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "school_photos_select" ON storage.objects;
DROP POLICY IF EXISTS "school_photos_insert" ON storage.objects;
DROP POLICY IF EXISTS "school_photos_delete" ON storage.objects;

CREATE POLICY "school_photos_select" ON storage.objects
  FOR SELECT TO authenticated, anon
  USING (bucket_id = 'school-photos');

CREATE POLICY "school_photos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'school-photos');

CREATE POLICY "school_photos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'school-photos');

-- ============================================
-- Seed Data
-- ============================================
INSERT INTO schools (name, address, regional, total_students, total_teachers, latitude, longitude, contact_person) VALUES
  ('SMA Negeri 1 Jakarta', 'Jl. Budi Utomo No.7, Jakarta Pusat', 'Jakarta Pusat', 850, 52, -6.1640, 106.8340, 'Drs. H. Suyitno, M.Pd'),
  ('SMA Negeri 3 Bandung', 'Jl. Belitung No.8, Bandung', 'Bandung', 920, 58, -6.9120, 107.6090, 'Dra. Hj. Eha Julaeha, M.Pd'),
  ('SMA Negeri 5 Surabaya', 'Jl. Kusuma Bangsa No.21, Surabaya', 'Surabaya', 780, 48, -7.2575, 112.7520, 'Drs. H. M. Thoha, M.Pd'),
  ('MAN 1 Yogyakarta', 'Jl. C. Simanjuntak No.60, Yogyakarta', 'Yogyakarta', 650, 42, -7.7790, 110.3760, 'Drs. H. Wiranto P., M.Pd'),
  ('SMA Negeri 2 Medan', 'Jl. Karangsari No.435, Medan', 'Medan', 720, 45, 3.5770, 98.6700, 'Dra. Hj. Rosmawati, M.Si'),
  ('SMA Negeri 1 Denpasar', 'Jl. Kamboja No.4, Denpasar', 'Denpasar', 540, 36, -8.6570, 115.2160, 'Drs. I Wayan Sueta, M.Pd.H'),
  ('SMA Negeri 8 Makassar', 'Jl. Andi Mangerangi No.19, Makassar', 'Makassar', 680, 41, -5.1510, 119.4310, 'Drs. H. M. Arsyad, M.Pd'),
  ('SMA Negeri 3 Semarang', 'Jl. Pemuda No.149, Semarang', 'Semarang', 890, 55, -6.9850, 110.4150, 'Dra. Hj. Endang S., M.Pd'),
  ('SMAK 1 BPK Penabur Bandung', 'Jl. Jawa No.26, Bandung', 'Bandung', 600, 40, -6.9115, 107.6150, 'Drs. Sutrisno, M.Pd'),
  ('SMA Negeri 4 Tangerang', 'Jl. Perintis Kemerdekaan No.11, Tangerang', 'Tangerang', 760, 50, -6.1800, 106.6360, 'Drs. H. Ahmad Rifai, M.Pd')
ON CONFLICT (id) DO NOTHING;
