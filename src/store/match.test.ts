import { beforeEach, describe, expect, it } from 'vitest'
import { createMatch, STARTER_DECKS } from '../game'
import type { BoardPiece, MatchState } from '../game'
import { useMatchStore } from './match'

const aiPiece = (instanceId: string, cardId: string, x: number, y: number): BoardPiece => ({
  instanceId,
  cardId,
  owner: 'ai',
  position: { x, y },
  currentHealth: 3,
  attackModifier: 0,
  movedThisTurn: false,
  attackedThisTurn: false,
  enteredOnTurn: 0,
  statuses: [],
})

const playerPiece = (instanceId: string, cardId: string, x: number, y: number): BoardPiece => ({
  instanceId,
  cardId,
  owner: 'player',
  position: { x, y },
  currentHealth: 3,
  attackModifier: 0,
  movedThisTurn: false,
  attackedThisTurn: false,
  enteredOnTurn: 0,
  statuses: [],
})

const baseMatch = (): MatchState => createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 123)

const latest = () => {
  const history = useMatchStore.getState().history
  return history[history.length - 1]
}

describe('store de partida: descripciones del historial', () => {
  beforeEach(() => {
    useMatchStore.getState().reset()
  })

  it('startMatch anota el saludo inicial', () => {
    useMatchStore.getState().startMatch(STARTER_DECKS[0]!.id, 0)
    expect(useMatchStore.getState().history).toEqual(['La escaramuza comienza. Robas cinco cartas.'])
  })

  it('jugar una fuente nombra la carta real', () => {
    const match = baseMatch()
    useMatchStore.setState({
      match: {
        ...match,
        players: {
          ...match.players,
          player: { ...match.players.player, hand: [{ instanceId: 'src', cardId: 'fuente-furia' }], resourcePlayedThisTurn: false },
        },
      },
      history: [],
    })
    useMatchStore.getState().dispatch({ type: 'play-resource', playerId: 'player', cardInstanceId: 'src' })
    expect(latest()).toBe('Fuente de Furia entra en la reserva.')
  })

  it('desplegar una unidad dice que entra en juego', () => {
    const match = baseMatch()
    useMatchStore.setState({
      match: {
        ...match,
        players: {
          ...match.players,
          player: {
            ...match.players.player,
            hand: [{ instanceId: 'unit', cardId: 'sabueso-brasa' }],
            resources: [
              { instanceId: 'r1', cardId: 'fuente-furia', faction: 'fury', exhausted: false },
              { instanceId: 'r2', cardId: 'fuente-furia', faction: 'fury', exhausted: false },
            ],
          },
        },
      },
      history: [],
    })
    useMatchStore.getState().dispatch({ type: 'play-card', playerId: 'player', cardInstanceId: 'unit', position: { x: 3, y: 7 } })
    expect(latest()).toBe('Sabueso de Brasa entra en juego.')
  })

  it('lanzar un hechizo sobre una unidad nombra a ambas cartas', () => {
    const match = baseMatch()
    useMatchStore.setState({
      match: {
        ...match,
        players: {
          ...match.players,
          player: {
            ...match.players.player,
            hand: [{ instanceId: 'spell', cardId: 'lluvia-ceniza' }],
            resources: [
              { instanceId: 'r1', cardId: 'fuente-furia', faction: 'fury', exhausted: false },
              { instanceId: 'r2', cardId: 'fuente-furia', faction: 'fury', exhausted: false },
              { instanceId: 'r3', cardId: 'fuente-furia', faction: 'fury', exhausted: false },
            ],
          },
        },
        board: [aiPiece('target', 'sabueso-brasa', 3, 1)],
      },
      history: [],
    })
    useMatchStore.getState().dispatch({
      type: 'play-card',
      playerId: 'player',
      cardInstanceId: 'spell',
      target: { kind: 'piece', pieceId: 'target' },
    })
    expect(latest()).toBe('Lluvia de Ceniza alcanza a Sabueso de Brasa.')
  })

  it('mover una pieza la nombra', () => {
    const match = baseMatch()
    useMatchStore.setState({
      match: { ...match, board: [playerPiece('mover', 'sabueso-brasa', 3, 6)] },
      history: [],
    })
    useMatchStore.getState().dispatch({ type: 'move', playerId: 'player', pieceId: 'mover', to: { x: 3, y: 5 } })
    expect(latest()).toBe('Sabueso de Brasa se reposiciona.')
  })

  it('atacar una pieza nombra al atacante y al defensor', () => {
    const match = baseMatch()
    useMatchStore.setState({
      match: {
        ...match,
        board: [
          { ...playerPiece('atk', 'sabueso-brasa', 3, 6), movedThisTurn: true },
          aiPiece('def', 'duelista-prisma', 3, 5),
        ],
      },
      history: [],
    })
    useMatchStore.getState().dispatch({ type: 'attack-piece', playerId: 'player', attackerId: 'atk', defenderId: 'def' })
    expect(latest()).toBe('Sabueso de Brasa ataca a Duelista del Prisma.')
  })

  it('atacar el Nexo nombra al atacante', () => {
    const match = baseMatch()
    useMatchStore.setState({
      match: { ...match, board: [{ ...playerPiece('atk', 'sabueso-brasa', 3, 0), movedThisTurn: true }] },
      history: [],
    })
    useMatchStore.getState().dispatch({ type: 'attack-nexus', playerId: 'player', attackerId: 'atk' })
    expect(latest()).toBe('Sabueso de Brasa golpea el Nexo enemigo.')
  })

  it('el historial conserva como mucho las últimas 10 entradas', () => {
    const match = baseMatch()
    useMatchStore.setState({ match: { ...match, board: [playerPiece('mover', 'sabueso-brasa', 3, 6)] }, history: [] })
    // Alterna la pieza entre dos casillas: cada movimiento es una acción válida más para el historial.
    for (let i = 0; i < 12; i += 1) {
      const to = i % 2 === 0 ? { x: 3, y: 5 } : { x: 3, y: 6 }
      useMatchStore.getState().dispatch({ type: 'move', playerId: 'player', pieceId: 'mover', to })
      const current = useMatchStore.getState().match!
      useMatchStore.setState({
        match: { ...current, board: current.board.map((piece) => ({ ...piece, movedThisTurn: false })) },
      })
    }
    expect(useMatchStore.getState().history).toHaveLength(10)
  })
})
