import { create } from "zustand"
import { mockPipelines } from "@/data/mockData"
import type { Pipeline } from "@/types"

const DEFAULT_PRICE = 65000

interface PipelineStore {
  pipelines: Pipeline[]
  prices: Record<string, number>
  setPipelines: (pipelines: Pipeline[]) => void
  updatePipeline: (id: string, updater: (p: Pipeline) => Pipeline) => void
  addPipeline: (pipeline: Pipeline) => void
  setPrice: (id: string, price: number) => void
  getPrice: (id: string) => number
  getTotalRevenue: () => number
  getMarketingRevenue: () => number
}

export const usePipelineStore = create<PipelineStore>((set, get) => {
  const initialPrices: Record<string, number> = {}
  for (const p of mockPipelines) {
    if (p.stage === "Proposal") {
      initialPrices[p.id] = p.pricePerStudentMonth ?? DEFAULT_PRICE
    } else {
      initialPrices[p.id] = 0
    }
  }

  return {
    pipelines: mockPipelines,
    prices: initialPrices,

    setPipelines: (pipelines) => set({ pipelines }),

    updatePipeline: (id, updater) =>
      set((state) => ({
        pipelines: state.pipelines.map((p) =>
          p.id === id ? updater(p) : p
        ),
      })),

    addPipeline: (pipeline) =>
      set((state) => ({
        pipelines: [pipeline, ...state.pipelines],
      })),

    setPrice: (id, price) =>
      set((state) => ({
        prices: { ...state.prices, [id]: price },
        pipelines: state.pipelines.map((p) =>
          p.id === id ? { ...p, pricePerStudentMonth: price } : p
        ),
      })),

    getPrice: (id) => get().prices[id] ?? 0,

    getTotalRevenue: () => {
      const { pipelines, prices } = get()
      return pipelines
        .filter((p) => p.stage === "Proposal")
        .reduce((sum, p) => {
          const price = prices[p.id] ?? p.pricePerStudentMonth ?? DEFAULT_PRICE
          return sum + price * p.totalStudents
        }, 0)
    },

    getMarketingRevenue: () => {
      return Math.round(get().getTotalRevenue() * 0.1)
    },
  }
})
