import { describe, expect, it } from 'vitest'
import { CARD_BY_ID, STARTER_DECKS, createMatch } from '../../game'
import type { BoardPiece, MatchState, PlayerId, Position } from '../../game'
import { describePendingActions, pendingTurnActions } from './pendingTurnActions'

const piece = (instanceId: string, cardId: string, owner: PlayerId, position: Position): BoardPiece => {
  const card = CARD_BY_ID[cardId]!
  return {
    instanceId, cardId, owner, position,
    currentHealth: card.health ?? card.resistance ?? 1,
    attackModifier: 0, movedThisTurn: false, attackedThisTurn: false,
    enteredOnTurn: 0, statuses: [],
  }
}

/** Partida en fase principal, turno del jugador, sin nada en mano ni en juego. */
const limpia = (): MatchState => {
  const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 4242)
  return {
    ...base,
    phase: 'main',
    activePlayer: 'player',
    board: [],
    players: {
      ...base.players,
      player: { ...base.players.player, hand: [], resourcePlayedThisTurn: true },
    },
  }
}

describe('acciones pendientes al ceder el turno', () => {
  it('sin nada que hacer, no avisa', () => {
    const pending = pendingTurnActions(limpia(), 'player')
    expect(pending.anything).toBe(false)
    expect(describePendingActions(pending)).toBe('')
  })

  it('cuenta las unidades que aún pueden actuar', () => {
    const state: MatchState = { ...limpia(), board: [piece('u1', 'sabueso-brasa', 'player', { x: 3, y: 6 })] }
    const pending = pendingTurnActions(state, 'player')
    expect(pending.readyUnits).toBe(1)
    expect(pending.anything).toBe(true)
    expect(describePendingActions(pending)).toContain('1 unidad sin actuar')
  })

  it('las unidades del rival no cuentan como tuyas', () => {
    const state: MatchState = { ...limpia(), board: [piece('e1', 'sabueso-brasa', 'ai', { x: 3, y: 1 })] }
    expect(pendingTurnActions(state, 'player').readyUnits).toBe(0)
  })

  it('avisa de la fuente de Esencia del turno sin jugar', () => {
    const base = limpia()
    const fuente = base.players.player.deck.find((card) => CARD_BY_ID[card.cardId]?.type === 'mana')!
    const state: MatchState = {
      ...base,
      players: {
        ...base.players,
        player: { ...base.players.player, hand: [fuente], resourcePlayedThisTurn: false },
      },
    }
    const pending = pendingTurnActions(state, 'player')
    expect(pending.sourceUnplayed).toBe(true)
    expect(describePendingActions(pending)).toContain('fuente de Esencia')
  })

  it('si ya jugaste fuente este turno, tener otra en la mano no avisa', () => {
    const base = limpia()
    const fuente = base.players.player.deck.find((card) => CARD_BY_ID[card.cardId]?.type === 'mana')!
    const state: MatchState = {
      ...base,
      players: {
        ...base.players,
        player: { ...base.players.player, hand: [fuente], resourcePlayedThisTurn: true },
      },
    }
    expect(pendingTurnActions(state, 'player').anything).toBe(false)
  })

  it('no avisa en el turno del rival, ni con la partida terminada', () => {
    const conUnidad: MatchState = { ...limpia(), board: [piece('u1', 'sabueso-brasa', 'player', { x: 3, y: 6 })] }
    expect(pendingTurnActions({ ...conUnidad, activePlayer: 'ai' }, 'player').anything).toBe(false)
    expect(pendingTurnActions({ ...conUnidad, winner: 'player' }, 'player').anything).toBe(false)
    expect(pendingTurnActions(undefined, 'player').anything).toBe(false)
  })

  it('el texto enumera en español y pide una segunda pulsación', () => {
    const texto = describePendingActions({ readyUnits: 2, playableCards: 1, sourceUnplayed: true, anything: true })
    expect(texto).toContain('no has jugado tu fuente de Esencia')
    expect(texto).toContain('2 unidades sin actuar')
    expect(texto).toContain('1 carta más')
    expect(texto).toContain(' y ')
    expect(texto).toContain('otra vez')
  })
})
