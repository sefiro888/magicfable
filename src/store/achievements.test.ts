import { describe, expect, it } from 'vitest'
import { evaluateAchievements } from './achievements'
import { STARTER_DECKS } from '../game'
import type { MatchRecord } from './records'

const rec = (
  deckId: string,
  won: boolean,
  turns = 12,
  finishedAt = 1,
  options: { damageDealt?: number; mode?: 'ai' | 'pvp' } = {},
): MatchRecord => ({
  id: `${deckId}-${finishedAt}-${won}`,
  finishedAt,
  deckId,
  deckName: deckId,
  commanderName: 'C',
  opponentDeckName: 'X',
  won,
  turns,
  seconds: 100,
  damageDealt: options.damageDealt ?? 10,
  seed: finishedAt,
  mode: options.mode,
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

  it('«devastación total» exige 35 de daño en una sola partida, ganada o no', () => {
    expect(get([rec('furia-caldera', false, 12, 1, { damageDealt: 34 })], 'devastacion').unlocked).toBe(false)
    expect(get([rec('furia-caldera', false, 12, 1, { damageDealt: 35 })], 'devastacion').unlocked).toBe(true)
  })

  it('«guerra de desgaste» exige ganar una partida de 20 turnos o más', () => {
    expect(get([rec('furia-caldera', true, 19)], 'guerra-desgaste').unlocked).toBe(false)
    // Perder una partida larga no cuenta: tiene que ser una victoria.
    expect(get([rec('furia-caldera', false, 25)], 'guerra-desgaste').unlocked).toBe(false)
    expect(get([rec('furia-caldera', true, 20)], 'guerra-desgaste').unlocked).toBe(true)
  })

  it('«veterano curtido» exige 30 escaramuzas, ganadas o no', () => {
    const games = Array.from({ length: 29 }, (_, index) => rec('furia-caldera', false, 12, index + 1))
    expect(get(games, 'curtido').unlocked).toBe(false)
    games.push(rec('furia-caldera', false, 12, 30))
    expect(get(games, 'curtido').unlocked).toBe(true)
  })

  it('«racha legendaria» exige 5 victorias seguidas', () => {
    const four = Array.from({ length: 4 }, (_, index) => rec('furia-caldera', true, 12, index + 1))
    expect(get(four, 'racha-legendaria').unlocked).toBe(false)
    const five = [...four, rec('furia-caldera', true, 12, 5)]
    expect(get(five, 'racha-legendaria').unlocked).toBe(true)
  })

  it('«duelista» solo cuenta victorias en PvP, no contra la IA', () => {
    expect(get([rec('furia-caldera', true, 12, 1, { mode: 'ai' })], 'duelista').unlocked).toBe(false)
    expect(get([rec('furia-caldera', false, 12, 1, { mode: 'pvp' })], 'duelista').unlocked).toBe(false)
    expect(get([rec('furia-caldera', true, 12, 1, { mode: 'pvp' })], 'duelista').unlocked).toBe(true)
  })

  it('«cronista del Nexo» exige 25 victorias acumuladas', () => {
    const wins = Array.from({ length: 24 }, (_, index) => rec('furia-caldera', true, 12, index + 1))
    expect(get(wins, 'cronista').unlocked).toBe(false)
    wins.push(rec('furia-caldera', true, 12, 25))
    expect(get(wins, 'cronista').unlocked).toBe(true)
  })
})
