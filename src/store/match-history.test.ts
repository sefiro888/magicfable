import { beforeEach, describe, expect, it } from 'vitest'
import { createMatch, STARTER_DECKS } from '../game'
import type { BoardPiece, MatchState } from '../game'
import { useMatchStore } from './match'

const baseMatch = (): MatchState => createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 123)

const playerPiece = (instanceId: string, cardId: string, x: number, y: number): BoardPiece => ({
  instanceId, cardId, owner: 'player', position: { x, y },
  currentHealth: 5, attackModifier: 0, movedThisTurn: false, attackedThisTurn: false,
  enteredOnTurn: 0, statuses: [],
})

const aiPiece = (instanceId: string, cardId: string, x: number, y: number): BoardPiece => ({
  instanceId, cardId, owner: 'ai', position: { x, y },
  currentHealth: 5, attackModifier: 0, movedThisTurn: false, attackedThisTurn: false,
  enteredOnTurn: 0, statuses: [],
})

describe('store de partida: healthHistory y bestPlay', () => {
  beforeEach(() => {
    useMatchStore.getState().reset()
  })

  it('startMatch arranca healthHistory con una sola lectura y sin mejor jugada', () => {
    useMatchStore.getState().startMatch(STARTER_DECKS[0]!.id, 0)
    const state = useMatchStore.getState()
    expect(state.healthHistory).toHaveLength(1)
    expect(state.healthHistory[0]!.turn).toBe(1)
    expect(state.bestPlay).toBeUndefined()
  })

  it('cada acción resuelta añade una lectura de Vida de los dos Nexos', () => {
    const match = baseMatch()
    useMatchStore.setState({
      match: {
        ...match,
        board: [playerPiece('sabueso', 'sabueso-brasa', 3, 0)],
      },
      healthHistory: [{ turn: match.turn, player: match.players.player.nexusHealth, ai: match.players.ai.nexusHealth }],
    })
    // Alcanza el Nexo rival (fila -1) desde y=0 con Alcance 1.
    const result = useMatchStore.getState().dispatch({ type: 'attack-nexus', playerId: 'player', attackerId: 'sabueso' })
    expect(result).toBe(true)
    const history = useMatchStore.getState().healthHistory
    expect(history).toHaveLength(2)
    expect(history[1]!.ai).toBe(match.players.ai.nexusHealth - 2)
    expect(history[1]!.player).toBe(match.players.player.nexusHealth)
  })

  it('registra el golpe más dañino de la partida, atribuido a quien lo dio', () => {
    const match = baseMatch()
    useMatchStore.setState({
      match: {
        ...match,
        board: [
          playerPiece('ariete', 'ariete-volcanico', 2, 2),
          aiPiece('presa', 'sabueso-brasa', 2, 3),
        ],
      },
      healthHistory: [],
      bestPlay: undefined,
    })
    const result = useMatchStore.getState().dispatch({ type: 'attack-piece', playerId: 'player', attackerId: 'ariete', defenderId: 'presa' })
    expect(result).toBe(true)
    const bestPlay = useMatchStore.getState().bestPlay
    expect(bestPlay).toBeDefined()
    expect(bestPlay!.by).toBe('player')
    expect(bestPlay!.cardId).toBe('ariete-volcanico')
    expect(bestPlay!.amount).toBeGreaterThan(0)
  })

  it('un golpe menor no sustituye al mejor ya registrado', () => {
    const match = baseMatch()
    useMatchStore.setState({
      match: {
        ...match,
        board: [
          playerPiece('lancera', 'lancera-magma', 1, 2),
          aiPiece('debil', 'sabueso-brasa', 1, 3),
        ],
      },
      healthHistory: [],
      bestPlay: { turn: 1, amount: 99, cardId: 'dragon-caldera', by: 'ai' },
    })
    useMatchStore.getState().dispatch({ type: 'attack-piece', playerId: 'player', attackerId: 'lancera', defenderId: 'debil' })
    expect(useMatchStore.getState().bestPlay).toEqual({ turn: 1, amount: 99, cardId: 'dragon-caldera', by: 'ai' })
  })

  it('reset() limpia healthHistory y bestPlay para la siguiente partida', () => {
    useMatchStore.setState({
      healthHistory: [{ turn: 3, player: 20, ai: 15 }],
      bestPlay: { turn: 2, amount: 4, cardId: 'sabueso-brasa', by: 'player' },
    })
    useMatchStore.getState().reset()
    expect(useMatchStore.getState().healthHistory).toEqual([])
    expect(useMatchStore.getState().bestPlay).toBeUndefined()
  })
})
