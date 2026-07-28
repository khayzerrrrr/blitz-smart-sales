const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")
const https = require("https")

const envPath = path.resolve(__dirname, "../.env.local")
const env = fs.readFileSync(envPath, "utf8")
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim()
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim()

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  // 1. Check bucket
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucket = buckets.find((b) => b.name === "school-photos")
  if (!bucket) {
    const { error } = await supabase.storage.createBucket("school-photos", { public: true })
    if (error) { console.log("CREATE BUCKET ERROR:", error.message); return }
    console.log("Bucket created: school-photos")
  } else {
    console.log("Bucket: school-photos (public:", bucket.public, ")")
  }

  // 2. Login as admin
  const { error: loginErr } = await supabase.auth.signInWithPassword({
    email: "admin@blitzcrm.com", password: "admin123",
  })
  if (loginErr) { console.log("LOGIN ERROR:", loginErr.message); return }
  console.log("Logged in: admin@blitzcrm.com")

  // 3. Test upload
  const buf = Buffer.from("test")
  const { error: upErr } = await supabase.storage
    .from("school-photos")
    .upload("test-conn.txt", buf, { contentType: "text/plain", upsert: true })
  if (upErr) { console.log("UPLOAD TEST ERROR:", upErr.message) }
  else { console.log("Upload test: OK") }

  // 4. Get public URL
  const { data: pub } = supabase.storage.from("school-photos").getPublicUrl("test-conn.txt")
  console.log("Public URL:", pub.publicUrl)

  // 5. Verify URL
  const accessible = await new Promise((resolve) => {
    https.get(pub.publicUrl, (res) => {
      resolve(res.statusCode === 200)
    }).on("error", () => resolve(false))
  })
  console.log("URL accessible:", accessible)

  // 6. Cleanup
  await supabase.storage.from("school-photos").remove(["test-conn.txt"])
  console.log("Cleanup done")
  await supabase.auth.signOut()
}

main().catch(console.error)
