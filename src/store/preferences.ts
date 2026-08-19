import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type GraphicsQuality = 'low' | 'medium' | 'high'
export type ScenarioId = 'aether-citadel' | 'sanctuary' | 'caldera'
export type AiDifficulty = 'easy' | 'normal' | 'hard'

export interface PreferencesState {
  masterVolume: number
  musicVolume: number
  effectsVolume: number
  muted: boolean
  reducedMotion: boolean
  aiDelayMs: number
  aiDifficulty: AiDifficulty
  selectedDeckId: string
  graphicsQuality: GraphicsQuality
  /** Escenario 3D de la batalla. */
  scenario: ScenarioId
  /** Multiplicador de velocidad de las animaciones de partida (1 = normal). */
  animationSpeed: 1 | 1.5 | 2
  /**
   * Sustituye el verde de "casilla de despliegue" por ámbar. El rojo de
   * "casilla amenazada" (una unidad rival ya la alcanza) puede aparecer en
   * el tablero a la vez que el verde de despliegue, en casillas distintas
   * pero visibles juntas — justo el par rojo/verde más difícil de
   * distinguir para el daltonismo más común (deuteranopia/protanopia). El
   * resto de colores del tablero (azul de mover, dorado de objetivo) ya no
   * chocan entre sí.
   */
  colorblindMode: boolean
  setVolume: (channel: 'masterVolume' | 'musicVolume' | 'effectsVolume', value: number) => void
  setMuted: (muted: boolean) => void
  setReducedMotion: (reduced: boolean) => void
  setAiDelay: (delay: number) => void
  setAiDifficulty: (difficulty: AiDifficulty) => void
  setSelectedDeck: (deckId: string) => void
  setGraphicsQuality: (quality: GraphicsQuality) => void
  setScenario: (scenario: ScenarioId) => void
  setAnimationSpeed: (speed: 1 | 1.5 | 2) => void
  setColorblindMode: (enabled: boolean) => void
  reset: () => void
}

const defaults = {
  masterVolume: 0.75,
  musicVolume: 0.35,
  effectsVolume: 0.7,
  muted: false,
  reducedMotion: false,
  aiDelayMs: 520,
  aiDifficulty: 'normal' as AiDifficulty,
  selectedDeckId: 'furia-caldera',
  graphicsQuality: 'medium' as GraphicsQuality,
  scenario: 'aether-citadel' as ScenarioId,
  animationSpeed: 1 as const,
  colorblindMode: false,
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaults,
      setVolume: (channel, value) => set({ [channel]: Math.max(0, Math.min(1, value)) }),
      setMuted: (muted) => set({ muted }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setAiDelay: (aiDelayMs) => set({ aiDelayMs }),
      setAiDifficulty: (aiDifficulty) => set({ aiDifficulty }),
      setSelectedDeck: (selectedDeckId) => set({ selectedDeckId }),
      setGraphicsQuality: (graphicsQuality) => set({ graphicsQuality }),
      setScenario: (scenario) => set({ scenario }),
      setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
      setColorblindMode: (colorblindMode) => set({ colorblindMode }),
      reset: () => set(defaults),
    }),
    {
      name: 'cronicas-nexo-preferences',
      version: 4,
      migrate: (persisted) => ({ ...defaults, ...(persisted as Partial<PreferencesState>) }),
    },
  ),
)
