import { createClient } from "@/lib/supabase/client"

export interface PhotoRecord {
  id: string
  school_id: string
  school_name: string
  uploaded_by: string
  storage_path: string
  created_at: string
}

export type CreatePhotoInput = Omit<PhotoRecord, "id" | "created_at">

export async function fetchPhotos(): Promise<PhotoRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("school_photos")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createPhoto(
  input: CreatePhotoInput
): Promise<PhotoRecord> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("school_photos")
    .insert([input])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as PhotoRecord
}

export async function deletePhoto(id: string): Promise<void> {
  const supabase = createClient()
  const { data: photo } = await supabase
    .from("school_photos")
    .select("storage_path")
    .eq("id", id)
    .single()

  if (photo) {
    const path = photo.storage_path.replace("school-photos/", "")
    await supabase.storage.from("school-photos").remove([path])
  }

  const { error } = await supabase.from("school_photos").delete().eq("id", id)
  if (error) throw new Error(error.message)
}
