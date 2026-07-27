-- ============================================
-- Blitz CRM - Database Schema v2
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

-- Add created_by to existing tables if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schools' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE schools ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

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
  stage TEXT CHECK (stage IN ('Prospect', 'Presentasi', 'Proposal', 'MoU', 'Not This Time')) DEFAULT 'Prospect',
  offer_price INTEGER DEFAULT NULL,
  deal_price INTEGER DEFAULT NULL,
  last_action TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Add UNIQUE constraint on school_id if missing
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
  uploaded_by TEXT DEFAULT '',
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ============================================
-- Enable Row Level Security
-- ============================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_photos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- Schools: authenticated users can read all, only creator can insert/update/delete
DROP POLICY IF EXISTS "Enable all for authenticated" ON schools;
DROP POLICY IF EXISTS "Enable all for authenticated" ON visits;
DROP POLICY IF EXISTS "Enable all for authenticated" ON pipelines;
DROP POLICY IF EXISTS "Enable all for authenticated" ON school_photos;

CREATE POLICY "Schools are readable by authenticated users" ON schools FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Schools are insertable by authenticated users" ON schools FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Schools are updatable by authenticated users" ON schools FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Schools are deletable by authenticated users" ON schools FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Visits are readable by authenticated users" ON visits FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Visits are insertable by authenticated users" ON visits FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Visits are updatable by authenticated users" ON visits FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Visits are deletable by authenticated users" ON visits FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Pipelines are readable by authenticated users" ON pipelines FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Pipelines are insertable by authenticated users" ON pipelines FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Pipelines are updatable by authenticated users" ON pipelines FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Pipelines are deletable by authenticated users" ON pipelines FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Photos are readable by authenticated users" ON school_photos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Photos are insertable by authenticated users" ON school_photos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Photos are deletable by authenticated users" ON school_photos FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- Enable Realtime for pipelines + photos
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE pipelines;
ALTER PUBLICATION supabase_realtime ADD TABLE school_photos;

-- ============================================
-- Seed Data: Insert sample stock schools
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
