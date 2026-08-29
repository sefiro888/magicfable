import { useEffect, useRef, useState } from 'react'
import type { AnimationEvent, PlayerId } from '../../game'
import { playSynthCue, type SoundCue } from '../../services/audio'
import { useMatchStore } from '../../store/match'
import type { PreferencesState } from '../../store/preferences'

/** Traduce un evento del motor a su señal sonora. `me` es el bando que controla este navegador. */
const cueForEvent = (event: AnimationEvent, me: PlayerId): SoundCue | undefined => {
  switch (event.type) {
    case 'draw': return 'draw'
    case 'resource': return 'resource'
    case 'mana-flow': return undefined
    case 'summon': return 'summon'
    case 'spell': return 'spell'
    case 'move': return 'move'
    case 'attack': return 'attack'
    case 'damage': return 'impact'
    case 'nexus-damage': return 'impact'
    case 'shield': return 'shield'
    case 'destroy': return 'destroy'
    case 'freeze': return 'freeze'
    case 'reveal': return 'reveal'
    case 'turn': return 'turn'
    case 'victory': return event.actorId === me ? 'victory' : 'defeat'
    default: return undefined
  }
}

/**
 * Ritmo de reproducción por tipo de evento: la contabilidad (robos, fuentes,
 * flujo de maná) corre más deprisa que los golpes para que los turnos fluyan
 * sin perder la lectura de las acciones importantes.
 */
const EVENT_PACE: Readonly<Partial<Record<AnimationEvent['type'], number>>> = {
  draw: 0.6,
  resource: 0.6,
  'mana-flow': 0.5,
  reveal: 0.85,
  turn: 0.9,
}

/**
 * Categoría visual del aviso central, para colorearlo y darle un icono según
 * lo que de verdad ocurrió (el usuario pedía que un hechizo o un golpe se
 * notaran de un vistazo, no solo leyendo el texto). Se deriva del propio
 * texto ya redactado por `actionDescription` en vez de duplicar esa lógica
 * aquí — barato y no exige tocar la forma del store.
 */
export type EventBannerKind = 'damage' | 'spell' | 'summon' | 'nexus' | 'info'

const bannerKindFor = (text: string): EventBannerKind => {
  if (text.startsWith('¡Hechizo!')) return 'spell'
  if (text.includes('golpea el Nexo')) return 'nexus'
  if (text.includes('inflige') || /\(−\d+\)/.test(text)) return 'damage'
  if (text.includes('entra en juego')) return 'summon'
  return 'info'
}

export interface EventDirector {
  /** Aviso grande de cambio de turno («Tu turno» / «Turno rival»). */
  banner?: string
  /** Aviso central de la última acción ocurrida, tomado de la crónica de batalla. */
  eventBanner: string | undefined
  /** Categoría del aviso central actual, para colorearlo (ver `bannerKindFor`). */
  eventBannerKind: EventBannerKind
  /** Carta que el escrutinio acaba de revelar, para el aviso flotante. */
  revealedCardId?: string
  /** Cuántas cartas hay que ordenar ahora mismo (0 = no hay escrutinio abierto). */
  scryAmount: number
  scryOrder: readonly string[]
  setScryAmount: (amount: number) => void
  setScryOrder: React.Dispatch<React.SetStateAction<readonly string[]>>
  /** Limpia los avisos al empezar una partida nueva (revancha o repetición). */
  resetBanners: () => void
}

/**
 * Reproduce la cola de animaciones del motor: sonido, temporización y los
 * canales laterales que abren interfaz (escrutinio, revelaciones, avisos).
 *
 * Vive fuera de BattlePage porque no depende de nada del render de la
 * pantalla: solo del store de partida, de las preferencias y de qué bando
 * controla este navegador.
 */
export const useEventDirector = (me: PlayerId, preferences: PreferencesState): EventDirector => {
  const currentEvent = useMatchStore((state) => state.currentEvent)
  const pendingCount = useMatchStore((state) => state.pendingAnimations.length)
  const history = useMatchStore((state) => state.history)
  const [banner, setBanner] = useState<string>()
  const [eventBanner, setEventBanner] = useState<string>()
  const [eventBannerKind, setEventBannerKind] = useState<EventBannerKind>('info')
  const [revealedCardId, setRevealedCardId] = useState<string>()
  const [scryAmount, setScryAmount] = useState(0)
  const [scryOrder, setScryOrder] = useState<readonly string[]>([])
  /** Longitud de historial ya anunciada: evita reanunciar entradas viejas al recargar una partida guardada. */
  const lastHistoryLength = useRef(history.length)

  // 1) Si no hay evento en reproducción, avanza la cola.
  useEffect(() => {
    if (!currentEvent && pendingCount > 0) {
      useMatchStore.getState().advanceEvent()
    }
  }, [currentEvent, pendingCount])

  // 2) Reproduce el evento actual: sonido, canales laterales y temporización.
  useEffect(() => {
    if (!currentEvent) return
    const state = useMatchStore.getState()
    const cue = cueForEvent(currentEvent, me)
    if (cue && !preferences.muted) {
      playSynthCue(cue)
    }
    // Los canales laterales actualizan estado de React fuera del cuerpo del
    // efecto para no encadenar renders síncronos.
    const sideChannel = window.setTimeout(() => {
      if (currentEvent.type === 'turn') {
        setBanner(currentEvent.actorId === me ? 'Tu turno' : 'Turno rival')
      }
      if (currentEvent.type === 'spell' && currentEvent.effectId === 'scry-top-cards' && currentEvent.actorId === me) {
        const amount = Math.min(currentEvent.amount ?? 1, state.match?.players[me].deck.length ?? 0)
        if (amount > 0) {
          setScryAmount(amount)
          setScryOrder(state.match?.players[me].deck.slice(0, amount).map((card) => card.instanceId) ?? [])
        }
      }
      if (currentEvent.type === 'reveal' && currentEvent.actorId === me) {
        const revealed = state.match?.players[me].deck.find((card) => card.instanceId === currentEvent.targetId)
        if (revealed) setRevealedCardId(revealed.cardId)
      }
    }, 0)
    const pace = EVENT_PACE[currentEvent.type] ?? 1
    const duration = preferences.reducedMotion
      ? 40
      : Math.max(70, (currentEvent.durationMs * pace) / preferences.animationSpeed)
    const timer = window.setTimeout(() => useMatchStore.getState().finishEvent(), duration)
    return () => {
      window.clearTimeout(sideChannel)
      window.clearTimeout(timer)
    }
  }, [currentEvent, preferences.animationSpeed, preferences.effectsVolume, preferences.masterVolume, preferences.muted, preferences.reducedMotion, me])

  useEffect(() => {
    if (!banner) return
    const timer = window.setTimeout(() => setBanner(undefined), 1400)
    return () => window.clearTimeout(timer)
  }, [banner])

  // ── Aviso central de eventos: anuncia cada acción según ocurre ────────────
  // Reutiliza el mismo texto que ya se anota en «Crónica de batalla», para no
  // mantener dos redacciones distintas del mismo suceso.
  useEffect(() => {
    if (history.length <= lastHistoryLength.current) {
      lastHistoryLength.current = history.length
      return undefined
    }
    const latest = history[history.length - 1]
    lastHistoryLength.current = history.length
    if (!latest || latest === 'Has cedido el turno.' || latest === 'Se cede el turno.') return undefined
    // setState se difiere fuera del cuerpo del efecto: mismo patrón que ya usa
    // el director de animaciones un poco más arriba para sus canales laterales.
    const sideChannel = window.setTimeout(() => {
      setEventBanner(latest)
      setEventBannerKind(bannerKindFor(latest))
    }, 0)
    return () => window.clearTimeout(sideChannel)
  }, [history])

  useEffect(() => {
    if (!eventBanner) return
    const timer = window.setTimeout(() => setEventBanner(undefined), 1900)
    return () => window.clearTimeout(timer)
  }, [eventBanner])

  useEffect(() => {
    if (!revealedCardId) return
    const timer = window.setTimeout(() => setRevealedCardId(undefined), 2600)
    return () => window.clearTimeout(timer)
  }, [revealedCardId])

  const resetBanners = () => {
    lastHistoryLength.current = 0
    setEventBanner(undefined)
  }

  return {
    banner,
    eventBanner,
    eventBannerKind,
    revealedCardId,
    scryAmount,
    scryOrder,
    setScryAmount,
    setScryOrder,
    resetBanners,
  }
}
