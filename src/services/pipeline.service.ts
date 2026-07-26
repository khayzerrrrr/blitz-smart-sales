import { createClient } from "@/lib/supabase/client"
import { DEFAULT_PROPOSAL_PRICE } from "@/lib/constants"

export interface PipelineRecord {
  id: string
  school_id: string
  school_name: string
  contact_person: string
  total_students: number
  stage: string
  offer_price: number | null
  deal_price: number | null
  last_action: string
  updated_at: string
  created_at: string
}

export type CreatePipelineInput = Omit<
  PipelineRecord,
  "id" | "created_at" | "updated_at"
>

export async function fetchPipelines(): Promise<PipelineRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("pipelines")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createPipeline(
  input: CreatePipelineInput
): Promise<PipelineRecord> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("pipelines")
    .insert([input])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as PipelineRecord
}

export async function checkPipelineExists(
  schoolId: string
): Promise<PipelineRecord | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("pipelines")
    .select("*")
    .eq("school_id", schoolId)
    .maybeSingle()

  if (error && error.code !== "PGRST116") throw new Error(error.message)
  return data ?? null
}

export async function updatePipelineStage(
  id: string,
  stage: string
): Promise<PipelineRecord> {
  const supabase = createClient()
  const updateData: Record<string, unknown> = {
    stage,
    updated_at: new Date().toISOString(),
  }

  if (stage === "Proposal") {
    updateData.offer_price = DEFAULT_PROPOSAL_PRICE
    updateData.deal_price = null
  } else if (stage === "MoU") {
    updateData.offer_price = null
    // Preserve existing deal_price when moving to MoU, don't overwrite
  } else {
    updateData.offer_price = null
    updateData.deal_price = null
  }

  const { data, error } = await supabase
    .from("pipelines")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as PipelineRecord
}

export async function updatePipelinePrice(
  id: string,
  field: "offer_price" | "deal_price",
  value: number
): Promise<PipelineRecord> {
  const supabase = createClient()
  const updateData: Record<string, unknown> = {
    [field]: value,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("pipelines")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as PipelineRecord
}
