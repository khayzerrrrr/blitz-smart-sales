"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus, GripVertical, User, DollarSign, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Pipeline } from "@/types"

export type PipelineStage = Pipeline["stage"]

export const columns: {
  id: PipelineStage
  title: string
  color: string
}[] = [
  { id: "Prospect", title: "Prospect", color: "border-blue-500/50 bg-blue-500/5" },
  { id: "Presentasi", title: "Presentasi", color: "border-amber-500/50 bg-amber-500/5" },
  { id: "Proposal", title: "Proposal", color: "border-orange-500/50 bg-orange-500/5" },
  { id: "MoU", title: "MoU", color: "border-emerald-500/50 bg-emerald-500/5" },
  { id: "Not This Time", title: "Not This Time", color: "border-border/50 bg-slate-500/5" },
]



function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`
}

function SortableCard({
  pipeline,
  proposalPrice,
  dealPrice,
  onProposalPriceChange,
  onDealPriceChange,
  isDragging,
}: {
  pipeline: Pipeline
  proposalPrice: number
  dealPrice: number
  onProposalPriceChange: (id: string, price: number) => void
  onDealPriceChange: (id: string, price: number) => void
  isDragging?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: pipeline.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  const isProposal = pipeline.stage === "Proposal"
  const isMoU = pipeline.stage === "MoU"
  const potentialRevenue = proposalPrice * pipeline.totalStudents
  const realizedRevenue = dealPrice * pipeline.totalStudents

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-border bg-muted p-3 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "ring-2 ring-orange-500 shadow-lg"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab text-muted-foreground hover:text-muted-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {pipeline.schoolName}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <User className="size-3" />
            <span className="truncate">{pipeline.contactPerson}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {pipeline.totalStudents} siswa
          </p>
          {pipeline.lastAction && (
            <p className="mt-2 text-xs text-muted-foreground">
              {pipeline.lastAction}
            </p>
          )}

          {isProposal && (
            <div className="mt-3 space-y-2 rounded-md border border-orange-500/20 bg-orange-500/5 p-2.5">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <DollarSign className="size-3 text-orange-400" />
                  <span>Harga Penawaran/Bulan (Rp)</span>
                </div>
                <Input
                  type="number"
                  value={proposalPrice || ""}
                  placeholder="65000"
                  onChange={(e) =>
                    onProposalPriceChange(pipeline.id, Number(e.target.value) || 0)
                  }
                  className="h-8 border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="rounded bg-card/80 px-2 py-1.5 text-xs">
                <p className="text-muted-foreground">Potensi Revenue:</p>
                <p className="mt-0.5 font-mono font-semibold text-orange-400">
                  {formatRupiah(proposalPrice)} x {pipeline.totalStudents} = {formatRupiah(potentialRevenue)}
                </p>
              </div>
            </div>
          )}

          {isMoU && (
            <div className="mt-3 space-y-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2.5">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TrendingUp className="size-3 text-emerald-400" />
                  <span>Harga Deal/Bulan (Rp)</span>
                </div>
                <Input
                  type="number"
                  value={dealPrice || ""}
                  placeholder="Isi harga deal..."
                  onChange={(e) =>
                    onDealPriceChange(pipeline.id, Number(e.target.value) || 0)
                  }
                  className="h-8 border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="rounded bg-card/80 px-2 py-1.5 text-xs">
                <p className="text-muted-foreground">Realized Revenue Bulanan:</p>
                <p className="mt-0.5 font-mono font-semibold text-emerald-400">
                  {formatRupiah(dealPrice)} x {pipeline.totalStudents} = {formatRupiah(realizedRevenue)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DraggableOverlay({ pipeline }: { pipeline: Pipeline }) {
  return (
    <div className="rounded-lg border border-orange-500 bg-muted p-3 shadow-xl rotate-2 scale-105">
      <div className="flex items-start gap-2">
        <GripVertical className="size-4 mt-0.5 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {pipeline.schoolName}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <User className="size-3" />
            <span className="truncate">{pipeline.contactPerson}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface KanbanBoardProps {
  pipelines: Pipeline[]
  onStageChange?: (id: string, newStage: PipelineStage) => void
  onAddCard?: (stage: PipelineStage) => void
  getProposalPrice: (id: string) => number
  getDealPrice: (id: string) => number
  onProposalPriceChange: (id: string, price: number) => void
  onDealPriceChange: (id: string, price: number) => void
}

export function KanbanBoard({
  pipelines,
  onStageChange,
  onAddCard,
  getProposalPrice,
  getDealPrice,
  onProposalPriceChange,
  onDealPriceChange,
}: KanbanBoardProps) {
  const [activeDrag, setActiveDrag] = useState<Pipeline | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const getItemsByStage = (stage: PipelineStage) =>
    pipelines.filter((p) => p.stage === stage)

  const handleDragStart = (event: DragStartEvent) => {
    const dragged = pipelines.find((p) => p.id === event.active.id)
    if (dragged) setActiveDrag(dragged)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null)
    const { active, over } = event
    if (!over) return

    const draggedItem = pipelines.find((p) => p.id === active.id)
    if (!draggedItem) return

    const overItem = pipelines.find((p) => p.id === over.id)
    const overColumn = columns.find((c) => c.id === over.id)

    let newStage: PipelineStage | null = null

    if (overItem) {
      newStage = overItem.stage
    } else if (overColumn) {
      newStage = overColumn.id
    }

    if (newStage && newStage !== draggedItem.stage) {
      onStageChange?.(draggedItem.id, newStage)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 xl:gap-6 grid-cols-5">
        {columns.map((col) => (
          <div key={col.id} className="flex flex-col min-w-0">
            <div className={cn("rounded-t-xl border border-b-0 px-3 py-2.5", col.color)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-semibold text-foreground truncate">
                    {col.title}
                  </h3>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {getItemsByStage(col.id).length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-orange-400"
                  onClick={() => onAddCard?.(col.id)}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 rounded-b-xl border border-border bg-card/50 p-2.5 min-h-[400px]">
              <SortableContext
                items={getItemsByStage(col.id).map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {getItemsByStage(col.id).map((p) => (
                    <SortableCard
                      key={p.id}
                      pipeline={p}
                      proposalPrice={getProposalPrice(p.id)}
                      dealPrice={getDealPrice(p.id)}
                      onProposalPriceChange={onProposalPriceChange}
                      onDealPriceChange={onDealPriceChange}
                    />
                  ))}
                  {getItemsByStage(col.id).length === 0 && (
                    <p className="py-8 text-center text-[11px] text-muted-foreground">
                      Belum ada kartu.
                    </p>
                  )}
                </div>
              </SortableContext>
            </div>
          </div>
        ))}
      </div>
      <DragOverlay>
        {activeDrag && <DraggableOverlay pipeline={activeDrag} />}
      </DragOverlay>
    </DndContext>
  )
}
