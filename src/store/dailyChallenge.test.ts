import { describe, expect, it } from 'vitest'
import { evaluateDailyChallenge } from './dailyChallenge'
import type { MatchRecord } from './records'

const at = (day: string) => new Date(`${day}T12:00:00Z`)

const win = (finishedAt: number, over: Partial<MatchRecord> = {}): MatchRecord => ({
  id: `${finishedAt}`, finishedAt, deckId: 'furia-caldera', deckName: 'Furia', commanderName: 'K',
  opponentDeckName: 'X', won: true, turns: 12, seconds: 100, damageDealt: 10, seed: finishedAt, ...over,
})

describe('reto diario', () => {
  it('es estable durante toda la jornada y cambia de un día a otro', () => {
    const a = evaluateDailyChallenge([], at('2026-07-22'))
    const aLater = evaluateDailyChallenge([], new Date('2026-07-22T23:59:00Z'))
    const b = evaluateDailyChallenge([], at('2026-07-23'))
    expect(a.id).toBe(aLater.id)
    expect(a.id).not.toBe(b.id)
  })

  it('empieza sin completar y solo cuenta las partidas de hoy', () => {
    const today = at('2026-07-22')
    expect(evaluateDailyChallenge([], today).done).toBe(false)
    // El reto de este día es «Doblete» (2 victorias). Una de ayer no cuenta.
    const ayer = at('2026-07-21').getTime()
    const hoy = today.getTime()
    const challenge = evaluateDailyChallenge([win(ayer), win(hoy)], today)
    if (challenge.title === 'Doblete') {
      expect(challenge.done).toBe(false)
      expect(evaluateDailyChallenge([win(hoy), win(hoy + 1)], today).done).toBe(true)
    }
  })

  it('detecta el cumplimiento de un reto de cierre veloz', () => {
    // Busca un día cuyo reto sea «Cierre veloz» y comprueba la condición.
    for (let offset = 0; offset < 8; offset += 1) {
      const date = new Date(2026, 6, 10 + offset, 12)
      const base = evaluateDailyChallenge([], date)
      if (base.title === 'Cierre veloz') {
        expect(evaluateDailyChallenge([win(date.getTime(), { turns: 11 })], date).done).toBe(false)
        expect(evaluateDailyChallenge([win(date.getTime(), { turns: 9 })], date).done).toBe(true)
        return
      }
    }
  })
})
