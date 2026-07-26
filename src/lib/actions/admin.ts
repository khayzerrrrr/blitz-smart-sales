"use server"

import { createClient } from "@supabase/supabase-js"

function getServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key.startsWith("sb_secret_xxx")) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured. Set it in Vercel Environment Variables.")
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function listUsersAction() {
  const supabase = getServiceClient()
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) throw new Error(error.message)
  return data.users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    name: u.user_metadata?.name ?? u.email?.split("@")[0] ?? "User",
    role: u.user_metadata?.role ?? "sales",
    created_at: u.created_at,
  }))
}

export async function createUserAction(email: string, password: string, name: string, role: string) {
  const supabase = getServiceClient()
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  })
  if (error) throw new Error(error.message)
  return data.user
}
