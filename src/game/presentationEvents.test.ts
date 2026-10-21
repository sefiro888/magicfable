import { describe, expect, it } from 'vitest'
import { CARD_BY_ID } from './cards'
import { STARTER_DECKS } from './decks'
import { applyAction, createMatch } from './engine'
import type { BoardPiece, MatchState } from './types'

const piece = (id: string, cardId: string, owner: 'player' | 'ai', y: number, health?: number): BoardPiece => ({
  instanceId: id, cardId, owner, position: { x: 3, y }, currentHealth: health ?? CARD_BY_ID[cardId]!.health!,
  attackModifier: 0, movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [],
})
const match = (board: readonly BoardPiece[]): MatchState => ({
  ...createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42), terrain: [], animations: [], board,
})

describe('datos que necesita la presentación después de resolver el combate', () => {
  it('conserva origen y víctima cuando el golpe ya ha retirado a la defensora', () => {
    const state = match([piece('attacker', 'gigante-magma', 'player', 4), piece('target', 'sabueso-brasa', 'ai', 3)])
    const result = applyAction(state, { type: 'attack-piece', playerId: 'player', attackerId: 'attacker', defenderId: 'target' })
    expect(result.ok).toBe(true)
    expect(result.state.board.some((candidate) => candidate.instanceId === 'target')).toBe(false)
    expect(result.state.animations.find((event) => event.type === 'damage' && event.targetId === 'target'))
      .toMatchObject({ cardId: 'gigante-magma', faction: 'fury', targetCardId: 'sabueso-brasa' })
    expect(result.state.animations.find((event) => event.type === 'destroy'))
      .toMatchObject({ cardId: 'sabueso-brasa', faction: 'fury' })
  })

  it('el ataque al Nexo conserva su casilla de salida para que el recorrido exista', () => {
    const attacker = piece('attacker', 'dragon-caldera', 'player', 0)
    const result = applyAction(match([attacker]), { type: 'attack-nexus', playerId: 'player', attackerId: 'attacker' })
    expect(result.ok).toBe(true)
    expect(result.state.animations.find((event) => event.type === 'attack'))
      .toMatchObject({ from: attacker.position, cardId: attacker.cardId, faction: 'fury', targetId: 'ai-nexus' })
  })
})
