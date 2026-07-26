import { create } from "zustand"
import type { SchoolStock, Pipeline } from "@/types"
import { mockStockSchools, mockPipelines } from "@/data/mockData"

const DEFAULT_PROPOSAL_PRICE = 65000

interface AppStore {
  stockSchools: SchoolStock[]
  activeSchools: SchoolStock[]
  pipelines: Pipeline[]

  proposalPrices: Record<string, number>
  dealPrices: Record<string, number>

  setStockSchools: (schools: SchoolStock[]) => void
  addStockSchool: (school: SchoolStock) => void
  removeStockSchool: (id: string) => void
  addActiveSchool: (school: SchoolStock) => void

  setPipelines: (pipelines: Pipeline[]) => void
  updatePipeline: (id: string, updater: (p: Pipeline) => Pipeline) => void
  addPipeline: (pipeline: Pipeline) => void

  setProposalPrice: (id: string, price: number) => void
  getProposalPrice: (id: string) => number
  setDealPrice: (id: string, price: number) => void
  getDealPrice: (id: string) => number

  getTotalPotentialRevenue: () => number
  getTotalRealizedRevenue: () => number
  getTotalMarketingRevenue: () => number
}

export const useAppStore = create<AppStore>((set, get) => {
  const initialProposalPrices: Record<string, number> = {}
  const initialDealPrices: Record<string, number> = {}
  for (const p of mockPipelines) {
    if (p.stage === "Proposal") {
      initialProposalPrices[p.id] = p.pricePerStudentMonth ?? DEFAULT_PROPOSAL_PRICE
    } else {
      initialProposalPrices[p.id] = 0
    }
    if (p.stage === "MoU") {
      initialDealPrices[p.id] = p.dealPricePerStudentMonth ?? 0
    } else {
      initialDealPrices[p.id] = 0
    }
  }

  return {
    stockSchools: mockStockSchools,
    activeSchools: [],
    pipelines: mockPipelines,
    proposalPrices: initialProposalPrices,
    dealPrices: initialDealPrices,

    setStockSchools: (schools) => set({ stockSchools: schools }),

    addStockSchool: (school) =>
      set((state) => ({
        stockSchools: [...state.stockSchools, school],
      })),

    removeStockSchool: (id) =>
      set((state) => ({
        stockSchools: state.stockSchools.filter((s) => s.id !== id),
      })),

    addActiveSchool: (school) =>
      set((state) => ({
        activeSchools: [...state.activeSchools, school],
      })),

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

    setProposalPrice: (id, price) =>
      set((state) => ({
        proposalPrices: { ...state.proposalPrices, [id]: price },
        pipelines: state.pipelines.map((p) =>
          p.id === id ? { ...p, pricePerStudentMonth: price } : p
        ),
      })),

    getProposalPrice: (id) => get().proposalPrices[id] ?? 0,

    setDealPrice: (id, price) =>
      set((state) => ({
        dealPrices: { ...state.dealPrices, [id]: price },
        pipelines: state.pipelines.map((p) =>
          p.id === id ? { ...p, dealPricePerStudentMonth: price } : p
        ),
      })),

    getDealPrice: (id) => get().dealPrices[id] ?? 0,

    getTotalPotentialRevenue: () => {
      const { pipelines, proposalPrices } = get()
      return pipelines
        .filter((p) => p.stage === "Proposal")
        .reduce((sum, p) => {
          const price = proposalPrices[p.id] ?? p.pricePerStudentMonth ?? DEFAULT_PROPOSAL_PRICE
          return sum + price * p.totalStudents
        }, 0)
    },

    getTotalRealizedRevenue: () => {
      const { pipelines, dealPrices } = get()
      return pipelines
        .filter((p) => p.stage === "MoU")
        .reduce((sum, p) => {
          const price = dealPrices[p.id] ?? p.dealPricePerStudentMonth ?? 0
          return sum + price * p.totalStudents
        }, 0)
    },

    getTotalMarketingRevenue: () => {
      return Math.round(get().getTotalRealizedRevenue() * 0.1)
    },
  }
})
