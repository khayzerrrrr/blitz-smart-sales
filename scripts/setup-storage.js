const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

const envPath = path.resolve(__dirname, "../.env.local")
const env = fs.readFileSync(envPath, "utf8")
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim()
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim()

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  // 1. Ensure bucket exists and is public
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucket = buckets.find((b) => b.name === "school-photos")
  if (!bucket) {
    await supabase.storage.createBucket("school-photos", { public: true })
    console.log("✅ Bucket created: school-photos")
  } else {
    await supabase.storage.updateBucket("school-photos", { public: true })
    console.log("✅ Bucket exists, set to public")
  }

  // 2. Login as admin
  const { error: loginErr } = await supabase.auth.signInWithPassword({
    email: "admin@blitzcrm.com",
    password: "admin123",
  })
  if (loginErr) {
    console.log("❌ LOGIN ERROR:", loginErr.message)
    return
  }
  console.log("✅ Logged in: admin@blitzcrm.com")

  // 3. Test upload
  const buf = Buffer.from("test")
  const { error: upErr } = await supabase.storage
    .from("school-photos")
    .upload("test-conn.txt", buf, { contentType: "text/plain", upsert: true })
  if (upErr) {
    console.log("❌ UPLOAD ERROR:", upErr.message)
    console.log("\n⚠️  Storage RLS policy belum ada.")
    console.log("Buka https://supabase.com/dashboard/project/svhqpggynlscezwhvgef/sql/new")
    console.log("Paste SQL berikut lalu jalankan:\n---")
    console.log(`
-- 1. Bucket sudah ada, pastikan public
UPDATE storage.buckets SET public = true WHERE id = 'school-photos';

-- 2. Hapus policy lama
DROP POLICY IF EXISTS "school_photos_select" ON storage.objects;
DROP POLICY IF EXISTS "school_photos_insert" ON storage.objects;
DROP POLICY IF EXISTS "school_photos_delete" ON storage.objects;

-- 3. Buat policy baru
CREATE POLICY "school_photos_select" ON storage.objects
  FOR SELECT TO authenticated, anon
  USING (bucket_id = 'school-photos');

CREATE POLICY "school_photos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'school-photos');

CREATE POLICY "school_photos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'school-photos');
`)
    return
  }
  console.log("✅ Upload test: OK")

  // Cleanup
  await supabase.storage.from("school-photos").remove(["test-conn.txt"])
  await supabase.auth.signOut()
  console.log("✅ Semua beres, storage siap!")
}

main().catch(console.error)
