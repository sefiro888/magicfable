import { create } from 'zustand'
import {
  applyAction,
  CARD_BY_ID,
  clearAnimationQueue,
  createMatch,
  STARTER_DECKS,
  type AnimationEvent,
  type GameAction,
  type MatchState,
} from '../game'

interface MatchStore {
  match?: MatchState
  selectedHandId?: string
  selectedPieceId?: string
  inspectedCardId?: string
  message?: string
  history: readonly string[]
  aiThinking: boolean
  startedAtMs: number
  elapsedSeconds: number
  /** Cola de presentación: eventos ya resueltos por el motor pendientes de reproducirse. */
  pendingAnimations: readonly AnimationEvent[]
  /** Evento visual en reproducción en este instante. */
  currentEvent?: AnimationEvent
  startMatch: (playerDeckId: string) => void
  dispatch: (action: GameAction) => boolean
  replaceMatch: (match: MatchState, message?: string) => void
  advanceEvent: () => void
  finishEvent: () => void
  skipAnimations: () => void
  selectHand: (instanceId?: string) => void
  selectPiece: (instanceId?: string) => void
  inspect: (cardId?: string) => void
  setMessage: (message?: string) => void
  setAiThinking: (thinking: boolean) => void
  reset: () => void
}

const actionDescription = (state: MatchState, action: GameAction): string => {
  const player = state.players[action.playerId ?? state.activePlayer]
  if (action.type === 'play-resource' || action.type === 'play-card') {
    const instance = player.hand.find((card) => card.instanceId === action.cardInstanceId)
    const name = instance ? CARD_BY_ID[instance.cardId]?.name : undefined
    return action.type === 'play-resource' ? `${name ?? 'Una fuente'} entra en la reserva.` : `${name ?? 'Una carta'} entra en juego.`
  }
  if (action.type === 'move') return 'Una unidad cambia de posición.'
  if (action.type === 'attack-piece') return 'Las cartas chocan en el tablero.'
  if (action.type === 'attack-nexus') return 'El Nexo recibe un impacto directo.'
  if (action.type === 'draw') return 'Se roba una carta.'
  return action.playerId === 'player' ? 'Has cedido el turno.' : 'La IA termina su turno.'
}

const initialState = {
  history: [] as readonly string[],
  aiThinking: false,
  startedAtMs: 0,
  elapsedSeconds: 0,
  pendingAnimations: [] as readonly AnimationEvent[],
  currentEvent: undefined as AnimationEvent | undefined,
}

/** Extrae la cola de eventos del estado del motor y la deja limpia para el siguiente paso. */
const drainAnimations = (state: MatchState): { match: MatchState; events: readonly AnimationEvent[] } => ({
  match: clearAnimationQueue(state),
  events: state.animations,
})

export const useMatchStore = create<MatchStore>((set, get) => ({
  ...initialState,
  startMatch: (playerDeckId) => {
    const playerDeck = STARTER_DECKS.find((deck) => deck.id === playerDeckId) ?? STARTER_DECKS[0]
    const aiDeck = STARTER_DECKS.find((deck) => deck.id !== playerDeck?.id) ?? STARTER_DECKS[1]
    if (!playerDeck || !aiDeck) throw new Error('Faltan mazos iniciales para crear la partida.')
    const match = createMatch(playerDeck, aiDeck, 0x4e45584f)
    set({
      ...initialState,
      match: clearAnimationQueue(match),
      history: ['La escaramuza comienza. Robas cinco cartas.'],
      selectedHandId: undefined,
      selectedPieceId: undefined,
      inspectedCardId: undefined,
      message: undefined,
      startedAtMs: Date.now(),
    })
  },
  dispatch: (action) => {
    const match = get().match
    if (!match) return false
    const result = applyAction(match, action)
    if (!result.ok) {
      set({ message: result.error?.message ?? 'La acción no es válida.' })
      return false
    }
    const description = actionDescription(match, action)
    const { match: cleaned, events } = drainAnimations(result.state)
    set((current) => ({
      match: cleaned,
      message: undefined,
      history: [...current.history.slice(-9), description],
      pendingAnimations: [...current.pendingAnimations, ...events],
      elapsedSeconds: cleaned.winner ? Math.max(1, Math.round((Date.now() - current.startedAtMs) / 1000)) : current.elapsedSeconds,
    }))
    return true
  },
  replaceMatch: (match, message) => {
    const { match: cleaned, events } = drainAnimations(match)
    set((current) => ({
      match: cleaned,
      message,
      history: message ? [...current.history.slice(-9), message] : current.history,
      pendingAnimations: [...current.pendingAnimations, ...events],
      elapsedSeconds: cleaned.winner ? Math.max(1, Math.round((Date.now() - current.startedAtMs) / 1000)) : current.elapsedSeconds,
    }))
  },
  advanceEvent: () =>
    set((current) => ({
      currentEvent: current.pendingAnimations[0],
      pendingAnimations: current.pendingAnimations.slice(1),
    })),
  finishEvent: () => set({ currentEvent: undefined }),
  skipAnimations: () => set({ pendingAnimations: [], currentEvent: undefined }),
  selectHand: (selectedHandId) => set({ selectedHandId, selectedPieceId: undefined, message: undefined }),
  selectPiece: (selectedPieceId) => set({ selectedPieceId, selectedHandId: undefined, message: undefined }),
  inspect: (inspectedCardId) => set({ inspectedCardId }),
  setMessage: (message) => set({ message }),
  setAiThinking: (aiThinking) => set({ aiThinking }),
  reset: () => set({ match: undefined, selectedHandId: undefined, selectedPieceId: undefined, inspectedCardId: undefined, message: undefined, ...initialState }),
}))
