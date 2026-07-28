/**
 * Blitz CRM - Database Setup Script
 *
 * Usage:
 *   1. Copy supabase/migrations/000_initial.sql
 *      Paste into Supabase SQL Editor → Run
 *
 *   2. Set SUPABASE_SERVICE_ROLE_KEY in .env.local
 *      (Settings > API > service_role key)
 *
 *   3. Then run:
 *      node scripts/setup-db.js
 *
 * This script:
 *   - Confirms email for all users
 *   - Verifies the database connection
 */

const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

const envPath = path.resolve(__dirname, "../.env.local")
const env = fs.readFileSync(envPath, "utf8")

const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim()
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim()

if (!url) {
  console.error("NEXT_PUBLIC_SUPABASE_URL not found in .env.local")
  process.exit(1)
}

if (!key || key.startsWith("IsiServiceRoleKeyDisini") || key.startsWith("sb_secret_xxx")) {
  console.error("SUPABASE_SERVICE_ROLE_KEY masih placeholder atau tidak valid.")
  console.error("Isi dari: Supabase Dashboard → Settings → API → service_role key")
  process.exit(1)
}

async function main() {
  console.log("=== Blitz CRM - DB Setup ===\n")
  console.log(`URL: ${url}`)

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // 1. Test connection
  console.log("\n1. Testing connection...")
  const { data: health, error: healthErr } = await supabase.from("schools").select("count")
  if (healthErr) {
    console.error(`   Connection failed: ${healthErr.message}`)
    console.error("   Pastikan migration sudah dijalankan di Supabase SQL Editor.")
    process.exit(1)
  }
  console.log("   Connected!")

  // 2. List existing users
  console.log("\n2. Checking users...")
  const { data: users, error: usersErr } = await supabase.auth.admin.listUsers()
  if (usersErr) {
    console.error(`   Failed: ${usersErr.message}`)
    process.exit(1)
  }
  console.log(`   ${users.users.length} user(s) found`)

  // 3. Confirm emails
  console.log("\n3. Confirming user emails...")
  let confirmed = 0
  for (const u of users.users) {
    if (!u.email_confirmed_at) {
      const { error } = await supabase.auth.admin.updateUserById(u.id, {
        email_confirm: true,
      })
      if (error) {
        console.log(`   ${u.email}: GAGAL - ${error.message}`)
      } else {
        console.log(`   ${u.email}: CONFIRMED`)
        confirmed++
      }
    } else {
      console.log(`   ${u.email}: already confirmed`)
    }
  }

  // 4. Summary
  console.log("\n=== Setup Complete ===")
  console.log(`Users confirmed: ${confirmed}`)
  console.log("\nTest Accounts:")
  console.log("  admin@blitzcrm.com / admin123")
  console.log("  sales@blitzcrm.com / sales123")
  console.log("  sales2@blitzcrm.com / sales123")
}

main().catch(console.error)
