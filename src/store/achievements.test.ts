import { describe, expect, it } from 'vitest'
import { evaluateAchievements } from './achievements'
import { STARTER_DECKS } from '../game'
import type { MatchRecord } from './records'

const rec = (deckId: string, won: boolean, turns = 12, finishedAt = 1): MatchRecord => ({
  id: `${deckId}-${finishedAt}-${won}`,
  finishedAt,
  deckId,
  deckName: deckId,
  commanderName: 'C',
  opponentDeckName: 'X',
  won,
  turns,
  seconds: 100,
  damageDealt: 10,
  seed: finishedAt,
})

const get = (records: readonly MatchRecord[], id: string) =>
  evaluateAchievements(records).find((achievement) => achievement.id === id)!

describe('logros', () => {
  it('sin partidas, nada está desbloqueado', () => {
    expect(evaluateAchievements([]).every((achievement) => !achievement.unlocked)).toBe(true)
  })

  it('desbloquea «primera sangre» con la primera victoria', () => {
    expect(get([rec('furia-caldera', false)], 'primera-sangre').unlocked).toBe(false)
    expect(get([rec('furia-caldera', true)], 'primera-sangre').unlocked).toBe(true)
  })

  it('«relámpago» exige ganar en 8 turnos o menos', () => {
    expect(get([rec('furia-caldera', true, 9)], 'relampago').unlocked).toBe(false)
    expect(get([rec('furia-caldera', true, 8)], 'relampago').unlocked).toBe(true)
  })

  it('«maestro» requiere ganar con las seis facciones', () => {
    const wins = STARTER_DECKS.map((deck, index) => rec(deck.id, true, 12, index + 1))
    expect(get(wins, 'maestro').unlocked).toBe(true)
    expect(get(wins.slice(0, 5), 'maestro').unlocked).toBe(false)
    expect(get(wins.slice(0, 3), 'maestro').progress).toBeCloseTo(3 / STARTER_DECKS.length)
  })
})
