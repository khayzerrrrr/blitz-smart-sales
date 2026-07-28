"use server"

import { createClient } from "@supabase/supabase-js"

function getServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key.startsWith("sb_secret_xxx")) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.")
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function setupTestAccounts() {
  const supabase = getServiceClient()
  const results: string[] = []

  const users = [
    { email: "admin@blitzcrm.com", password: "admin123", name: "Reza Pahrul", role: "admin" },
    { email: "sales@blitzcrm.com", password: "sales123", name: "Andi Prasetyo", role: "sales" },
    { email: "sales2@blitzcrm.com", password: "sales123", name: "Budi Santoso", role: "sales" },
  ]

  for (const u of users) {
    try {
      const { error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { name: u.name, role: u.role },
      })
      if (error) {
        if (error.message?.includes("already been registered")) {
          results.push(`${u.email} - sudah ada, skip`)
        } else {
          results.push(`${u.email} - GAGAL: ${error.message}`)
        }
      } else {
        results.push(`${u.email} - BERHASIL dibuat (role: ${u.role})`)
      }
    } catch (err) {
      results.push(`${u.email} - ERROR: ${err instanceof Error ? err.message : "unknown"}`)
    }
  }

  return results
}
