const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const env = fs.readFileSync(".env.local", "utf8")
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim()
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim()

async function main() {
  if (!key || key.startsWith("sb_secret_xxx")) {
    console.log("SUPABASE_SERVICE_ROLE_KEY tidak valid atau masih placeholder.")
    console.log("Lakukan manual di Supabase Dashboard:")
    console.log("1. Authentication > Settings > Confirm email = OFF")
    console.log("ATAU jalankan SQL:")
    console.log("UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;")
    return
  }

  console.log("Confirming user emails...")
  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data: users } = await supabase.auth.admin.listUsers()
  if (!users?.users) { console.log("No users found"); return }

  for (const u of users.users) {
    if (!u.email_confirmed_at) {
      const { error } = await supabase.auth.admin.updateUserById(u.id, { email_confirm: true })
      console.log(u.email, error ? "GAGAL: " + error.message : "CONFIRMED")
    } else {
      console.log(u.email, "- already confirmed")
    }
  }
}

main()
