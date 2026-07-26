import { createClient } from "@/lib/supabase/client"

export interface VisitRecord {
  id: string
  school_id: string
  user_id: string
  user_name: string
  school_name: string
  visit_date: string
  status: string
  notes: string
  pic_name: string
  pic_phone: string
  total_students: number
  total_teachers: number
  has_bilingual: boolean
  created_at: string
}

export type CreateVisitInput = Omit<VisitRecord, "id" | "created_at">

export interface VisitFilters {
  date?: string
  status?: string
  search?: string
}

export async function fetchVisits(
  filters?: VisitFilters
): Promise<VisitRecord[]> {
  const supabase = createClient()
  let query = supabase.from("visits").select("*").order("visit_date", {
    ascending: false,
  })

  if (filters?.date) {
    query = query.eq("visit_date", filters.date)
  }
  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status)
  }
  if (filters?.search) {
    query = query.or(
      `school_name.ilike.%${filters.search}%,user_name.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createVisit(
  input: CreateVisitInput
): Promise<VisitRecord> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("visits")
    .insert([input])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as VisitRecord
}
