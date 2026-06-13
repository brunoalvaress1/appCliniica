// src/stores/useAuthStore.ts
import { create } from 'zustand'

interface User {
  id: string
  email: string
  nome: string
  tipo: string
}

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))