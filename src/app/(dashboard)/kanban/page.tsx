"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  fetchPipelines,
  updatePipelineStage,
  updatePipelinePrice,
  type PipelineRecord,
} from "@/services/pipeline.service"
import { KanbanBoard } from "@/components/features/KanbanBoard"
import type { PipelineStage } from "@/components/features/KanbanBoard"
import { toast } from "sonner"
import { DEFAULT_PROPOSAL_PRICE } from "@/lib/constants"

export default function KanbanPage() {
  const queryClient = useQueryClient()

  const { data: pipelines = [], isLoading } = useQuery({
    queryKey: ["pipelines"],
    queryFn: fetchPipelines,
    refetchInterval: 30000,
  })

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      updatePipelineStage(id, stage),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] })
      toast.success(`Kartu dipindah ke ${variables.stage}`)
    },
    onError: (err: Error) => {
      toast.error(`Gagal update stage: ${err.message}`)
    },
  })

  const priceMutation = useMutation({
    mutationFn: ({
      id,
      field,
      value,
    }: {
      id: string
      field: "offer_price" | "deal_price"
      value: number
    }) => updatePipelinePrice(id, field, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] })
    },
    onError: (err: Error) => {
      toast.error(`Gagal update harga: ${err.message}`)
    },
  })

  const addCardLocally = useCallback(
    (stage: PipelineStage) => {
      const tempId = `local-${crypto.randomUUID().slice(0, 8)}`
      queryClient.setQueryData<PipelineRecord[]>(["pipelines"], (old = []) => [
        {
          id: tempId,
          school_id: crypto.randomUUID(),
          school_name: "Prospek Baru",
          contact_person: "Kontak Person",
          total_students: 0,
          stage,
          offer_price: stage === "Proposal" ? DEFAULT_PROPOSAL_PRICE : null,
          deal_price: null,
          last_action: "Kartu baru (lokal)",
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
        ...old,
      ])
      toast.success("Kartu baru ditambahkan!")
    },
    [queryClient]
  )

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("pipelines-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pipelines" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pipelines"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  const handleStageChange = useCallback(
    (id: string, newStage: PipelineStage) => {
      stageMutation.mutate({ id, stage: newStage })
    },
    [stageMutation]
  )

  const handleAddCard = useCallback(
    (stage: PipelineStage) => {
      addCardLocally(stage)
    },
    [addCardLocally]
  )

  const handleProposalPriceChange = useCallback(
    (id: string, price: number) => {
      priceMutation.mutate({ id, field: "offer_price", value: price })
    },
    [priceMutation]
  )

  const handleDealPriceChange = useCallback(
    (id: string, price: number) => {
      priceMutation.mutate({ id, field: "deal_price", value: price })
    },
    [priceMutation]
  )

  const getProposalPrice = useCallback(
    (id: string) => {
      const p = pipelines.find((p) => p.id === id)
      return p?.offer_price ?? 0
    },
    [pipelines]
  )

  const getDealPrice = useCallback(
    (id: string) => {
      const p = pipelines.find((p) => p.id === id)
      return p?.deal_price ?? 0
    },
    [pipelines]
  )

  const mappedPipelines = pipelines.map((p) => ({
    id: p.id,
    schoolId: p.school_id,
    schoolName: p.school_name,
    contactPerson: p.contact_person,
    stage: p.stage as PipelineStage,
    lastAction: p.last_action,
    pricePerStudentMonth: p.offer_price,
    dealPricePerStudentMonth: p.deal_price,
    totalStudents: p.total_students,
    updatedAt: p.updated_at,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Pipeline Kanban
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola prospek, proposal, MoU, dan pipeline penjualan sekolah.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Memuat data pipeline...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <KanbanBoard
            pipelines={mappedPipelines}
            onStageChange={handleStageChange}
            onAddCard={handleAddCard}
            getProposalPrice={getProposalPrice}
            getDealPrice={getDealPrice}
            onProposalPriceChange={handleProposalPriceChange}
            onDealPriceChange={handleDealPriceChange}
          />
        </div>
      )}
    </div>
  )
}
