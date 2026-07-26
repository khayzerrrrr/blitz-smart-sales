# PRD: Blitz CRM - Aplikasi Manajemen Kunjungan & Pipeline Penjualan Sekolah
**Versi:** 1.0.0
**Status:** Final (Siap Eksekusi AI)
**Target AI:** DeepSeek V4 Pro
**Lingkungan:** Next.js 14, Supabase, Vercel, Tailwind CSS, Shadcn/ui

---

## 1. Ringkasan & Tujuan Proyek
**Blitz CRM** adalah platform *Customer Relationship Management* berbasis web modern yang ditujukan untuk tim Sales/Pemasaran di bidang pendidikan. Aplikasi ini dirancang untuk mendigitalisasi seluruh alur kerja lapangan, mulai dari pencatatan kunjungan harian, pemetaan wilayah, dokumentasi foto, pengelolaan pipeline prospek (Kanban), hingga analisis performa dashboard.

**Prinsip Utama Pengembangan:**
1. **Frontend-First:** Membangun UI/UX yang sangat bagus, responsif, dan elegan dengan data *Mock* (Dummy) terlebih dahulu.
2. **Zero-Conflict:** Menggunakan Arsitektur tipe aman (TypeScript) dan state management modern untuk meminimalisir bug.
3. **Serverless Modern:** Integrasi penuh dengan Supabase (Database, Auth, Storage, Realtime) dan Deployment ke Vercel.

---

## 2. Arsitektur Teknologi (Tech Stack)

### A. Frontend (Prioritas Utama & Pembangunan Awal)
*   **Framework:** Next.js 14 (App Router) + TypeScript.
*   **Styling UI:** Tailwind CSS (Dark Mode sebagai default, dengan palet warna aksen Oranye `#F97316`) + **Shadcn/ui** (Radix UI based).
*   **State Management & Data Fetching:**
    *   **Zustand:** Untuk Global State (Theme, User Auth Status).
    *   **TanStack Query (React Query):** Untuk manajemen *Server State* (Data fetching, caching, dan invalidation).
*   **Form Handling & Validasi:** React Hook Form + Zod (Validasi schema di Frontend dan Backend).
*   **Interaksi Lanjutan:** 
    *   Framer Motion: Untuk transisi halaman dan *micro-interactions*.
    *   `@dnd-kit/core`: Untuk fitur Drag & Drop di Pipeline Kanban.
*   **Peta Digital:** React-Leaflet (menggunakan OpenStreetMap untuk visualisasi lokasi sekolah).
*   **Date/Time Handling:** date-fns.

### B. Backend, Database, & Auth (Menggunakan Supabase)
*   **Database:** PostgreSQL (Dikelola penuh oleh Supabase).
*   **Authentication:** Supabase Auth (Email/Password, JWT) dengan Row Level Security (RLS).
*   **Storage:** Supabase Storage (Bucket untuk menyimpan dan mengelola Foto Sekolah).
*   **Realtime:** Supabase Realtime (Untuk update otomatis pada fitur Kanban dan Dashboard).

### C. Deployment & Infrastruktur
*   **Hosting:** Vercel (Otomatis CI/CD dari GitHub).
*   **Environment Variables:** Semua kunci rahasia (Supabase URL, Anon Key) dikelola melalui Dashboard Vercel.

---

## 3. Skema Database & Keamanan (Supabase PostgreSQL)

AI harus membuat skema SQL berikut langsung di Supabase SQL Editor, atau menulisnya ke dalam file `supabase/migrations/init.sql` untuk dieksekusi nanti.

```sql
-- Mengaktifkan Ekstensi UUID
create extension if not exists "uuid-ossp";

-- Tabel: Data Sekolah
create table schools (
  id uuid default uuid_generate_v4() primary key,
  created_by uuid references auth.users(id) not null,
  name text not null,
  address text,
  latitude numeric,
  longitude numeric,
  regional text,
  contact_person text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabel: Kunjungan Harian (Relasi Many-to-One ke Schools)
create table visits (
  id uuid default uuid_generate_v4() primary key,
  school_id uuid references schools(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  visit_date date default CURRENT_DATE,
  status text check (status in ('Selesai', 'Proses', 'Dijadwalkan')) default 'Proses',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabel: Pipeline Kanban (Relasi One-to-One ke Schools)
create table pipelines (
  id uuid default uuid_generate_v4() primary key,
  school_id uuid references schools(id) on delete cascade unique not null,
  stage text check (stage in ('Prospek', 'Nego', 'Closed')) default 'Prospek',
  last_action text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabel: Metadata Foto Sekolah (File fisik disimpan di Supabase Storage)
create table school_photos (
  id uuid default uuid_generate_v4() primary key,
  school_id uuid references schools(id) on delete cascade not null,
  uploaded_by uuid references auth.users(id) not null,
  storage_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- KUNCI UTAMA KEMANAN: Row Level Security (RLS)
-- AI harus mengaktifkan RLS dan membuat policy berikut:
alter table schools enable row level security;
alter table visits enable row level security;
alter table pipelines enable row level security;
alter table school_photos enable row level security;

-- Contoh Policy untuk Sales (Hanya bisa CRUD data miliknya sendiri)
create policy "Sales dapat melihat sekolah miliknya" on schools for select using (auth.uid() = created_by);
create policy "Sales dapat insert sekolah" on schools for insert with check (auth.uid() = created_by);
create policy "Sales dapat update sekolah miliknya" on schools for update using (auth.uid() = created_by);
-- (Lanjutkan policy serupa untuk tabel visits, pipelines, dan photos).
4. Struktur Folder & File Project (Wajib Diikuti AI)
AI diinstruksikan untuk membuat struktur folder yang sangat rapi sesuai dengan Next.js App Router. Ketika AI membuat file, patuhi struktur ini:
blitzcrm-new-v2/
├── .env.local                    # Supabase keys & Env variables
├── .gitignore
├── package.json                  # Generated by npx create-next-app
├── tailwind.config.ts            # Customized with Shadcn ui
├── components.json               # Shadcn config
├── src/
│   ├── app/
│   │   ├── (auth)/               # Route group for Login (No Sidebar)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/          # Route group for Main App (With Sidebar)
│   │   │   ├── layout.tsx        # Sidebar & Topbar Global
│   │   │   ├── page.tsx          # Dashboard Pemasaran
│   │   │   ├── kunjungan/        # Modul Kunjungan
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx # Detail/Edit Kunjungan
│   │   │   ├── peta/             # Modul Peta
│   │   │   │   └── page.tsx
│   │   │   ├── foto/             # Modul Foto Sekolah
│   │   │   │   └── page.tsx
│   │   │   ├── sekolah/          # Modul Data Sekolah
│   │   │   │   └── page.tsx
│   │   │   ├── kanban/           # Modul Pipeline
│   │   │   │   └── page.tsx
│   │   │   └── akun/             # Modul Manajemen Akun
│   │   │       └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css           # Global CSS Tailwind
│   │   └── layout.tsx            # Root Layout
│   ├── components/
│   │   ├── ui/                   # Komponen Shadcn/ui (button, input, table, card, etc)
│   │   ├── layout/               # Global UI Components
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   └── features/             # Modul Spesifik Components
│   │       ├── VisitForm.tsx
│   │       ├── SchoolTable.tsx
│   │       ├── KanbanBoard.tsx
│   │       ├── SchoolMap.tsx
│   │       └── PhotoGallery.tsx
│   ├── hooks/                    # Custom Hooks
│   │   └── useSchools.ts
│   ├── lib/
│   │   ├── utils.ts              # Helper function (cn() for Tailwind)
│   │   ├── supabase/
│   │   │   ├── client.ts         # Supabase Browser Client
│   │   │   └── server.ts         # Supabase Server Actions Client
│   │   └── validations/          # Zod Schemas
│   │       ├── school-schema.ts
│   │       └── visit-schema.ts
│   ├── services/                 # API Wrappers (Calling Supabase)
│   │   ├── school.service.ts
│   │   ├── visit.service.ts
│   │   └── pipeline.service.ts
│   ├── store/                    # Zustand Stores
│   │   ├── useAuthStore.ts
│   │   └── useThemeStore.ts
│   └── types/                    # Global TypeScript Definitions
│       └── index.ts
└── README.md

5. Rincian Modul & Sub-Fitur (Functional Requirement)

Modul Utama	Sub-Fitur	Deskripsi & Data Yang Dibutuhkan
1. Kunjungan Harian	Daftar Kunjungan	Tabel data berisi: Tanggal, Nama Sekolah, Sales, Status. Harus ada filter tanggal dan tombol "Tambah Kunjungan".
Isi Form Kunjungan	Modal/Page form input: Pilih Sekolah, Tanggal Kunjungan, Catatan Hasil (textarea), Status (dropdown). Validasi Zod: Semua wajib diisi.
Riwayat Kunjungan	Tabel riwayat dengan filter berdasarkan Nama Sekolah dan Rentang Tanggal.
2. Peta Sekolah	Lihat Peta Kunjungan	Render Leaflet map. Tampilkan Marker/Pin untuk setiap koordinat sekolah yang ada di database.
Detail Sekolah di Peta	Saat marker diklik, muncul Popup berisi info Nama Sekolah, Alamat, dan tombol "Lihat Detail".
3. Foto Sekolah	Galeri Foto	Grid layout gambar thumbnail. Data yang ditampilkan: Nama File, Tanggal Upload, dan Nama Pengupload.
Pratinjau Foto	Klik gambar akan membuka Lightbox/Modal untuk melihat gambar ukuran penuh.
4. Data Sekolah	Daftar Sekolah	Tabel master data dengan kolom: Nama Sekolah, Regional, Kontak, Terakhir Dikunjungi, Aksi (Edit/Hapus).
Tambah & Edit Sekolah	Modal Form untuk input: Nama, Alamat, Lat/Long (bisa diisi manual atau via drag marker peta), Regional, Kontak.
Pencarian Sekolah	Search bar real-time berdasarkan Nama Sekolah atau Regional.
5. Pipeline Kanban	Papan Kanban	3 kolom (Prospek, Nego, Closed). Setiap kartu berisi Nama Sekolah dan Kontak.
Geser Prospek	Implementasi Drag & Drop menggunakan @dnd-kit/core. Saat dipindah kolom, status di Supabase otomatis update via TanStack Query.
Tambah Prospek Baru	Tombol 'Add Card' di kolom untuk membuat kartu prospek baru langsung.
6. Dashboard Pemasaran	Ringkasan Harian	Menampilkan Card Statistik: Total Kunjungan Hari Ini, Total Prospek, Konversi Closed.
Filter Regional	Dropdown filter untuk menampilkan grafik performa spesifik per Regional.
7. Manajemen Akun	Login & Logout	Halaman login clean minimalis. Proses auth via Supabase Auth.
Kelola Akun & Peran	Hanya bisa diakses oleh Admin. Tabel daftar user Sales, beserta tombol tambah user baru dan ubah role.
6. Pedoman UI/UX "Sangat Bagus" (Wajib Dipatuhi AI)
Untuk memastikan hasil akhir memukau dan minim bug:

Palet Warna (Dark Mode First):

Background: bg-slate-950 (Very dark slate).

Sidebar & Card: bg-slate-900 atau bg-slate-800/50 dengan border border-slate-800.

Text: text-slate-50 atau text-slate-400 untuk sub-teks.

Aksen Utama: #F97316 (Orange/Coral) untuk tombol "Simpan", "Tambah", dan Logo. (Gunakan class Tailwind khusus: bg-orange-500 hover:bg-orange-600).

Mobile-First & Responsive: Gunakan grid Tailwind (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) dan komponen Shadcn/ui yang sudah responsif secara otomatis.

Advanced Feedback (Zero User Confusion):

Loading State: Setiap tombol yang melakukan submit data harus berubah menjadi spinner loading (gunakan state isLoading di React Query/Hook). Mencegah double-click crash.

Toast Notification: Gunakan komponen sonner atau react-hot-toast. Saat data berhasil disimpan, muncul Toast Sukses. Saat error, muncul Toast Error.

Error Boundaries & Empty States:

Jika tabel data kosong (misal: belum ada kunjungan), AI Wajib menampilkan ilustrasi "Belum ada data" (bisa menggunakan SVG lucu atau text center) dan tombol aksi untuk mengisi data.

Wrap komponen Map di dalam ErrorBoundary agar jika API peta gagal load, aplikasi tidak crash total.

7. Rencana Pengembangan Tahap Demi Tahap (Untuk DeepSeek V4 Pro)
AI WAJIB mengerjakan tugas secara berurutan. DILARANG lompat ke Fase 3/4 sebelum Fase 1 Selesai 100%.

🟢 FASE 0: Setup Lingkungan Awal (Terminal)
Inisialisasi Next.js dengan perintah npx create-next-app@latest . (Pilih TypeScript, Tailwind, ESLint, App Router, @/ alias).

Install dependencies utama:
npm install @supabase/supabase-js @supabase/ssr @tanstack/react-query @tanstack/react-query-devtools zustand react-hook-form zod @hookform/resolvers react-leaflet leaflet framer-motion @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities clsx tailwind-merge

Init Shadcn/ui: npx shadcn@latest init (Pilih: New York, Zinc, CSS variables).

Tambahkan komponen Shadcn: npx shadcn@latest add button card input table dialog form select toast avatar.

Create file .env.local dengan placeholder:

text
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
🔵 FASE 1: Build UI Frontend 100% (Dengan Mock Data)
Instruksi untuk AI: Lakukan ini tanpa menyentuh Supabase sama sekali. Fokus pada visual.

Bangun src/components/layout/Sidebar.tsx dan src/components/layout/Topbar.tsx. Masukkan menu: Kunjungan, Peta, Foto, Sekolah, Kanban, Akun.

Buat file src/data/mockData.ts. Isi dengan array JSON dummy untuk schools, visits, pipelines.

Bangun semua page.tsx di folder (dashboard) menggunakan data dummy tersebut.

Pastikan Form (Tambah/Edit) menggunakan react-hook-form + zod dan memunculkan Toast Notification saat tombol Simpan ditekan.

Self-Check AI: Pastikan aplikasi bisa di-run (npm run dev) tanpa error, Sidebar berfungsi, navigasi antar halaman mulus, dan UI terlihat sangat elegan di tema Dark Mode.

🟡 FASE 2: Setup Supabase, RLS & Auth
Instruksi untuk AI: Aktifkan "Serverless" backend.

Setup Skema SQL di Supabase (copy dari bagian 3 PRD ini) menggunakan SQL Editor Supabase.

Implementasikan Supabase Client di src/lib/supabase/client.ts dan src/lib/supabase/server.ts.

Aktifkan Auth di Supabase dashboard (Providers: Email) dan atur Redirect URLs untuk localhost:3000.

Implementasikan Login Page (src/app/(auth)/login/page.tsx) untuk login menggunakan Supabase Auth.

🟣 FASE 3: Integrasi Data Live & Realtime
Instruksi untuk AI: Ganti Mock Data dengan Database.

Buat service files (school.service.ts, visit.service.ts) yang berfungsi memanggil Supabase.

Ganti fungsi fetch data di halaman dengan useQuery (TanStack Query). Hapus impor mockData.ts.

Uji fitur "Simpan Data". Pastikan data baru masuk ke PostgreSQL Supabase.

Implementasikan Supabase Realtime untuk komponen Kanban. Saat kartu di-drag-drop, subscription akan membuat kartu di dashboard user lain berpindah otomatis tanpa refresh.

⚫ FASE 4: QA (Quality Assurance) & Deployment ke Vercel
Instruksi untuk AI: Tahap "Zero Major Bug".

Lakukan E2E Testing (Manual atau Playwright): Login -> Buat Data Sekolah Baru -> Upload Foto -> Geser Kanban ke Closed.

Tambahkan Error Boundary di src/app/(dashboard)/layout.tsx agar error tidak mem-blow up seluruh aplikasi.

Push kode ke GitHub. Buka Vercel, import Repo, tambahkan Environment Variables (Supabase URL & Anon Key), dan Deploy.

8. Instruksi Khusus Untuk AI (DeepSeek V4 Pro) Saat Bekerja:
Prinsip "DRY" (Don't Repeat Yourself): Saat membuat komponen input form, gunakan Reusable Form Field dari Shadcn/ui.

TypeScript Strict: Jangan gunakan any! Definisikan tipe interface untuk data sekolah, kunjungan, dan user di src/types/index.ts (seperti: export interface School { id: string; name: string; ... }).

Coding Style: Gunakan nama function yang deskriptif. Contoh: handleCreateNewSchool atau fetchVisitsByDate.

Jika Buntu: Jika ada error atau kode tidak berjalan, DeepSeek V4 Pro harus melakukan self-debug dengan membaca log terminal dan memperbaikinya sendiri sesuai arsitektur di atas.

Selamat bekerja, DeepSeek V4 Pro!