import { describe, expect, it } from 'vitest'
import { runAiTurn } from './ai'
import { CARD_BY_ID } from './cards'
import { STARTER_DECKS } from './decks'
import {
  applyAction,
  createMatch,
  getValidAttacks,
  getValidDeploymentPositions,
  getValidMoves,
} from './engine'
import { planManaPayment } from './mana'
import type { GameAction, MatchState, SpellTarget } from './types'

function applyIfValid(state: MatchState, action: GameAction): MatchState {
  const result = applyAction(state, action)
  return result.ok ? result.state : state
}

function chooseSpellTarget(state: MatchState, cardId: string): SpellTarget {
  const card = CARD_BY_ID[cardId]
  const friendly = card?.effects.some(
    (effect) => effect.kind === 'passive' && effect.id === 'target-attack-until-end',
  )
  const target = state.board.find((piece) => piece.owner === (friendly ? 'player' : 'ai'))
  return target ? { kind: 'piece', pieceId: target.instanceId } : { kind: 'none' }
}

/** Heurística compacta para simular el lado humano sin saltarse ninguna regla. */
function runAutomatedPlayerTurn(initial: MatchState): MatchState {
  let state = initial
  const resource = state.players.player.hand.find(
    (instance) => CARD_BY_ID[instance.cardId]?.type === 'mana',
  )
  if (resource && !state.players.player.resourcePlayedThisTurn) {
    state = applyIfValid(state, {
      type: 'play-resource',
      playerId: 'player',
      cardInstanceId: resource.instanceId,
    })
  }

  const skipped = new Set<string>()
  for (let attempts = 0; attempts < 20 && !state.winner; attempts += 1) {
    const instance = state.players.player.hand.find((candidate) => {
      const card = CARD_BY_ID[candidate.cardId]
      return card && card.type !== 'mana' && !skipped.has(candidate.instanceId) &&
        planManaPayment(state.players.player.resources, card.cost).payable
    })
    if (!instance) break
    const card = CARD_BY_ID[instance.cardId]
    if (!card) break
    const pieceCard = card.type === 'unit' || card.type === 'structure'
    const position = pieceCard ? getValidDeploymentPositions(state, 'player')[0] : undefined
    if (pieceCard && !position) {
      skipped.add(instance.instanceId)
      continue
    }
    const action: GameAction = {
      type: 'play-card',
      playerId: 'player',
      cardInstanceId: instance.instanceId,
      position,
      target: pieceCard ? { kind: 'none' } : chooseSpellTarget(state, card.id),
    }
    const result = applyAction(state, action)
    if (!result.ok) skipped.add(instance.instanceId)
    else state = result.state
  }

  const pieceIds = state.board
    .filter((piece) => piece.owner === 'player')
    .map((piece) => piece.instanceId)
  for (const pieceId of pieceIds) {
    if (state.winner) break
    let attacks = getValidAttacks(state, pieceId)
    if (attacks.canAttackNexus) {
      state = applyIfValid(state, { type: 'attack-nexus', playerId: 'player', attackerId: pieceId })
      continue
    }
    const defenderId = attacks.pieceIds[0]
    if (defenderId) {
      state = applyIfValid(state, {
        type: 'attack-piece', playerId: 'player', attackerId: pieceId, defenderId,
      })
      continue
    }
    const move = [...getValidMoves(state, pieceId)].sort((left, right) => left.y - right.y)[0]
    if (move) state = applyIfValid(state, { type: 'move', playerId: 'player', pieceId, to: move })
    attacks = getValidAttacks(state, pieceId)
    if (attacks.canAttackNexus) {
      state = applyIfValid(state, { type: 'attack-nexus', playerId: 'player', attackerId: pieceId })
    } else if (attacks.pieceIds[0]) {
      state = applyIfValid(state, {
        type: 'attack-piece', playerId: 'player', attackerId: pieceId,
        defenderId: attacks.pieceIds[0],
      })
    }
  }
  return state.winner
    ? state
    : applyIfValid(state, { type: 'end-turn', playerId: 'player' })
}

describe('simulación integral de partida', () => {
  it('dos heurísticas completan una partida sin bloqueo', () => {
    const fury = STARTER_DECKS[0]
    const arcane = STARTER_DECKS[1]
    expect(fury).toBeDefined()
    expect(arcane).toBeDefined()
    let state = createMatch(fury!, arcane!, 0x4e45584f)

    for (let halfTurns = 0; halfTurns < 180 && !state.winner; halfTurns += 1) {
      state = state.activePlayer === 'player' ? runAutomatedPlayerTurn(state) : runAiTurn(state)
    }

    expect(state.winner).toMatch(/player|ai/)
    expect(state.phase).toBe('finished')
    expect(state.turn).toBeLessThan(181)
  })
})
