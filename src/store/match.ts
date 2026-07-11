import { create } from 'zustand'
import {
  applyAction,
  CARD_BY_ID,
  createMatch,
  STARTER_DECKS,
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
  startMatch: (playerDeckId: string) => void
  dispatch: (action: GameAction) => boolean
  replaceMatch: (match: MatchState, message?: string) => void
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
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  ...initialState,
  startMatch: (playerDeckId) => {
    const playerDeck = STARTER_DECKS.find((deck) => deck.id === playerDeckId) ?? STARTER_DECKS[0]
    const aiDeck = STARTER_DECKS.find((deck) => deck.id !== playerDeck?.id) ?? STARTER_DECKS[1]
    if (!playerDeck || !aiDeck) throw new Error('Faltan mazos iniciales para crear la partida.')
    const match = createMatch(playerDeck, aiDeck, 0x4e45584f)
    set({ match, history: ['La escaramuza comienza. Robas cinco cartas.'], selectedHandId: undefined, selectedPieceId: undefined, inspectedCardId: undefined, message: undefined, aiThinking: false, startedAtMs: Date.now(), elapsedSeconds: 0 })
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
    set((current) => ({
      match: result.state,
      message: undefined,
      history: [...current.history.slice(-9), description],
      elapsedSeconds: result.state.winner ? Math.max(1, Math.round((Date.now() - current.startedAtMs) / 1000)) : current.elapsedSeconds,
    }))
    return true
  },
  replaceMatch: (match, message) => set((current) => ({
    match,
    message,
    history: message ? [...current.history.slice(-9), message] : current.history,
    elapsedSeconds: match.winner ? Math.max(1, Math.round((Date.now() - current.startedAtMs) / 1000)) : current.elapsedSeconds,
  })),
  selectHand: (selectedHandId) => set({ selectedHandId, selectedPieceId: undefined, message: undefined }),
  selectPiece: (selectedPieceId) => set({ selectedPieceId, selectedHandId: undefined, message: undefined }),
  inspect: (inspectedCardId) => set({ inspectedCardId }),
  setMessage: (message) => set({ message }),
  setAiThinking: (aiThinking) => set({ aiThinking }),
  reset: () => set({ match: undefined, selectedHandId: undefined, selectedPieceId: undefined, inspectedCardId: undefined, message: undefined, history: [], aiThinking: false, startedAtMs: 0, elapsedSeconds: 0 }),
}))
