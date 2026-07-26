-- ============================================
-- Blitz CRM - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: schools (Stock Database)
-- ============================================
CREATE TABLE IF NOT EXISTS schools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  user_id UUID DEFAULT '00000000-0000-0000-0000-000000000000',
  user_name TEXT DEFAULT 'Dummy User',
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
-- RLS Policies (allow public access for now)
-- IMPORTANT: Change these to auth.uid() later!
-- ============================================
CREATE POLICY "Enable all for authenticated" ON schools FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON pipelines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON school_photos FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Enable Realtime for pipelines table
-- ============================================
-- Run this separately after creating the table:
-- ALTER PUBLICATION supabase_realtime ADD TABLE pipelines;

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
