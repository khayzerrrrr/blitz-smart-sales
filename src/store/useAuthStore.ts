import { create } from "zustand"
import type { User } from "@/types"
import { mockUsers } from "@/data/mockData"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: mockUsers[0],
  isAuthenticated: true,
  login: (email: string) => {
    const found = mockUsers.find((u) => u.email === email)
    if (found) {
      set({ user: found, isAuthenticated: true })
    }
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}))
