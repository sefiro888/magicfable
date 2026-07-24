import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  applyAction,
  CARD_BY_ID,
  clearAnimationQueue,
  createMatch,
  nextRandom,
  STARTER_DECKS,
  type AnimationEvent,
  type GameAction,
  type MatchState,
  type SpellTarget,
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
  startMatch: (playerDeckId: string, seed?: number) => void
  /** Arranca la partida a partir de un MatchState ya construido (multijugador: lo crea el anfitrión y lo recibe el invitado). */
  startFromMatch: (match: MatchState) => void
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

/** Nombre de la carta en una casilla, tal como estaba justo antes de aplicar la acción. */
const pieceName = (state: MatchState, pieceId: string): string => {
  const piece = state.board.find((candidate) => candidate.instanceId === pieceId)
  return (piece && CARD_BY_ID[piece.cardId]?.name) ?? 'Una unidad'
}

const spellTargetName = (state: MatchState, target: SpellTarget | undefined): string | undefined => {
  if (!target) return undefined
  if (target.kind === 'piece') return pieceName(state, target.pieceId)
  if (target.kind === 'nexus') return 'el Nexo'
  return undefined
}

/**
 * Descripción legible de la acción, para el registro «Crónica de batalla» y
 * el aviso central de eventos. Se calcula con el estado ANTERIOR a aplicar
 * la acción: así las piezas que el efecto destruye o mueve aún están donde
 * el jugador las vio.
 */
const actionDescription = (state: MatchState, action: GameAction): string => {
  const player = state.players[action.playerId ?? state.activePlayer]
  if (action.type === 'play-resource') {
    const instance = player.hand.find((card) => card.instanceId === action.cardInstanceId)
    const name = instance ? CARD_BY_ID[instance.cardId]?.name : undefined
    return `${name ?? 'Una fuente'} entra en la reserva.`
  }
  if (action.type === 'play-card') {
    const instance = player.hand.find((card) => card.instanceId === action.cardInstanceId)
    const card = instance ? CARD_BY_ID[instance.cardId] : undefined
    const name = card?.name ?? 'Una carta'
    if (card && (card.type === 'unit' || card.type === 'structure')) return `${name} entra en juego.`
    const target = spellTargetName(state, action.target)
    return target ? `${name} alcanza a ${target}.` : `${name} se resuelve.`
  }
  if (action.type === 'move') return `${pieceName(state, action.pieceId)} se reposiciona.`
  if (action.type === 'attack-piece') return `${pieceName(state, action.attackerId)} ataca a ${pieceName(state, action.defenderId)}.`
  if (action.type === 'attack-nexus') return `${pieceName(state, action.attackerId)} golpea el Nexo enemigo.`
  if (action.type === 'draw') return 'Se roba una carta.'
  // Fraseo neutro para el bando no-'player': en solitario es la IA, pero en
  // multijugador es un rival humano de verdad, así que no se le llama «IA».
  return action.playerId === 'player' ? 'Has cedido el turno.' : 'Se cede el turno.'
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

/**
 * Sube esta versión siempre que cambie la forma de MatchState/PlayerState.
 * Sin `migrate`, zustand descarta silenciosamente cualquier partida
 * guardada con una versión distinta en vez de arriesgarse a hidratar un
 * estado incompleto.
 */
const MATCH_PERSIST_VERSION = 2

export const useMatchStore = create<MatchStore>()(
  persist(
    (set, get) => ({
  ...initialState,
  startMatch: (playerDeckId, seed) => {
    const playerIndex = Math.max(0, STARTER_DECKS.findIndex((deck) => deck.id === playerDeckId))
    const playerDeck = STARTER_DECKS[playerIndex]
    const matchSeed = seed ?? (Date.now() >>> 0)
    // El rival se elige a partir de la semilla entre las demás facciones: varía en
    // cada escaramuza, pero una revancha con la misma semilla repite el emparejamiento.
    // `matchSeed` suele ser Date.now(): dos partidas separadas por un intervalo
    // parecido (p. ej. el tiempo que tarda alguien en volver a jugar) generan
    // deltas de reloj parecidos, y `matchSeed % N` sobre esos deltas produce
    // rachas del mismo rival mucho más largas de lo que parece aleatorio. Se
    // pasa por nextRandom() (el mismo mezclador que ya usa el motor para barajar
    // el mazo) para romper esa correlación antes de elegir el índice.
    const opponents = STARTER_DECKS.filter((_, index) => index !== playerIndex)
    const opponentIndex = Math.floor(nextRandom(matchSeed).value * opponents.length)
    const aiDeck = opponents[opponentIndex] ?? opponents[0]
    if (!playerDeck || !aiDeck) throw new Error('Faltan mazos iniciales para crear la partida.')
    const match = createMatch(playerDeck, aiDeck, matchSeed)
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
  startFromMatch: (match) => {
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
    }),
    {
      name: 'cronicas-nexo-match',
      version: MATCH_PERSIST_VERSION,
      // Solo el estado necesario para retomar la partida: nunca la cola de
      // animaciones ni la selección en curso, que no tienen sentido tras recargar.
      partialize: (state) => ({
        match: state.match,
        history: state.history,
        startedAtMs: state.startedAtMs,
        elapsedSeconds: state.elapsedSeconds,
      }),
    },
  ),
)
