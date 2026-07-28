"use client"

import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  initAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ isLoading: loading }),

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, session: null, isLoading: false })
  },

  initAuth: async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    set({
      session,
      user: session?.user ?? null,
      isLoading: false,
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        isLoading: false,
      })
    })
  },
}))
