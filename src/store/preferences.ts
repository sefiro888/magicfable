import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PreferencesState {
  masterVolume: number
  musicVolume: number
  effectsVolume: number
  muted: boolean
  reducedMotion: boolean
  aiDelayMs: number
  selectedDeckId: string
  setVolume: (channel: 'masterVolume' | 'musicVolume' | 'effectsVolume', value: number) => void
  setMuted: (muted: boolean) => void
  setReducedMotion: (reduced: boolean) => void
  setAiDelay: (delay: number) => void
  setSelectedDeck: (deckId: string) => void
  reset: () => void
}

const defaults = {
  masterVolume: 0.75,
  musicVolume: 0.35,
  effectsVolume: 0.7,
  muted: false,
  reducedMotion: false,
  aiDelayMs: 520,
  selectedDeckId: 'furia-caldera',
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaults,
      setVolume: (channel, value) => set({ [channel]: Math.max(0, Math.min(1, value)) }),
      setMuted: (muted) => set({ muted }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setAiDelay: (aiDelayMs) => set({ aiDelayMs }),
      setSelectedDeck: (selectedDeckId) => set({ selectedDeckId }),
      reset: () => set(defaults),
    }),
    { name: 'cronicas-nexo-preferences', version: 1 },
  ),
)
