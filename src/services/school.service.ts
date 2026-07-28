import { createClient } from "@/lib/supabase/client"

export interface SchoolRecord {
  id: string
  name: string
  address: string
  regional: string
  total_students: number
  total_teachers: number
  latitude: number
  longitude: number
  contact_person: string
  created_by: string
  created_at: string
  updated_at: string
}

export type CreateSchoolInput = Omit<
  SchoolRecord,
  "id" | "created_by" | "created_at" | "updated_at"
>

async function getUserId(): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export async function fetchAllSchools(): Promise<SchoolRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function fetchMySchools(): Promise<SchoolRecord[]> {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) return fetchAllSchools()

  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .eq("created_by", userId)
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createSchool(
  input: CreateSchoolInput
): Promise<SchoolRecord> {
  const supabase = createClient()
  const userId = await getUserId()
  const { data, error } = await supabase
    .from("schools")
    .insert([{ ...input, created_by: userId }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as SchoolRecord
}

export async function createSchoolsBatch(
  inputs: CreateSchoolInput[]
): Promise<SchoolRecord[]> {
  const supabase = createClient()
  const userId = await getUserId()
  const records = inputs.map((i) => ({ ...i, created_by: userId }))
  const { data, error } = await supabase
    .from("schools")
    .insert(records)
    .select()

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateSchool(
  id: string,
  input: Partial<CreateSchoolInput>
): Promise<SchoolRecord> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("schools")
    .update(input)
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as SchoolRecord
}

export async function deleteSchool(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("schools").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

export async function deleteSchoolsBatch(ids: string[]): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("schools").delete().in("id", ids)
  if (error) throw new Error(error.message)
}
