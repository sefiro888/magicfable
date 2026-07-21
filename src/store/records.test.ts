import { beforeEach, describe, expect, it } from 'vitest'
import { summarizeByDeck, summarizeRecords, useRecords, type MatchRecord } from './records'

const record = (values: Partial<MatchRecord> = {}): Omit<MatchRecord, 'id'> => ({
  finishedAt: 1_000,
  deckId: 'furia-caldera',
  deckName: 'Furia de la Caldera',
  commanderName: 'Kaela',
  opponentDeckName: 'Secretos del Arcano',
  won: true,
  turns: 12,
  seconds: 180,
  damageDealt: 25,
  seed: 42,
  ...values,
})

describe('historial de partidas', () => {
  beforeEach(() => {
    useRecords.getState().clear()
  })

  it('guarda las partidas más recientes primero', () => {
    const { addRecord } = useRecords.getState()
    addRecord(record({ finishedAt: 1, seed: 1 }))
    addRecord(record({ finishedAt: 2, seed: 2 }))
    expect(useRecords.getState().records.map((entry) => entry.seed)).toEqual([2, 1])
  })

  it('limita el historial a 50 entradas', () => {
    const { addRecord } = useRecords.getState()
    for (let index = 0; index < 60; index += 1) {
      addRecord(record({ finishedAt: index, seed: index }))
    }
    const stored = useRecords.getState().records
    expect(stored).toHaveLength(50)
    // La más nueva se conserva y las más viejas se descartan.
    expect(stored[0]?.seed).toBe(59)
    expect(stored.at(-1)?.seed).toBe(10)
  })

  it('resume victorias, derrotas y porcentaje', () => {
    const entries = [
      { ...record({ won: true }), id: 'a' },
      { ...record({ won: true }), id: 'b' },
      { ...record({ won: false }), id: 'c' },
      { ...record({ won: false }), id: 'd' },
    ]
    expect(summarizeRecords(entries)).toEqual({ played: 4, won: 2, lost: 2, winRate: 50 })
  })

  it('devuelve un resumen vacío sin partidas, sin dividir por cero', () => {
    expect(summarizeRecords([])).toEqual({ played: 0, won: 0, lost: 0, winRate: 0 })
  })

  it('agrupa por mazo y ordena por partidas jugadas', () => {
    const entries: MatchRecord[] = [
      { ...record({ deckId: 'furia-caldera', deckName: 'Furia', won: true }), id: 'a' },
      { ...record({ deckId: 'furia-caldera', deckName: 'Furia', won: false }), id: 'b' },
      { ...record({ deckId: 'orden-celestial', deckName: 'Orden', won: true }), id: 'c' },
    ]
    expect(summarizeByDeck(entries)).toEqual([
      { deckId: 'furia-caldera', deckName: 'Furia', played: 2, won: 1 },
      { deckId: 'orden-celestial', deckName: 'Orden', played: 1, won: 1 },
    ])
  })
})
