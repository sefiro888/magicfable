import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type GraphicsQuality = 'low' | 'medium' | 'high'
export type ScenarioId = 'aether-citadel' | 'sanctuary'

export interface PreferencesState {
  masterVolume: number
  musicVolume: number
  effectsVolume: number
  muted: boolean
  reducedMotion: boolean
  aiDelayMs: number
  selectedDeckId: string
  graphicsQuality: GraphicsQuality
  /** Escenario 3D de la batalla. */
  scenario: ScenarioId
  /** Multiplicador de velocidad de las animaciones de partida (1 = normal). */
  animationSpeed: 1 | 1.5 | 2
  setVolume: (channel: 'masterVolume' | 'musicVolume' | 'effectsVolume', value: number) => void
  setMuted: (muted: boolean) => void
  setReducedMotion: (reduced: boolean) => void
  setAiDelay: (delay: number) => void
  setSelectedDeck: (deckId: string) => void
  setGraphicsQuality: (quality: GraphicsQuality) => void
  setScenario: (scenario: ScenarioId) => void
  setAnimationSpeed: (speed: 1 | 1.5 | 2) => void
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
  graphicsQuality: 'medium' as GraphicsQuality,
  scenario: 'aether-citadel' as ScenarioId,
  animationSpeed: 1 as const,
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
      setGraphicsQuality: (graphicsQuality) => set({ graphicsQuality }),
      setScenario: (scenario) => set({ scenario }),
      setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
      reset: () => set(defaults),
    }),
    {
      name: 'cronicas-nexo-preferences',
      version: 3,
      migrate: (persisted) => ({ ...defaults, ...(persisted as Partial<PreferencesState>) }),
    },
  ),
)
