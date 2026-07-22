import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Resultado de una escaramuza terminada, tal y como se guarda en el historial local. */
export interface MatchRecord {
  /** Identificador propio del registro; también sirve de clave de render. */
  readonly id: string
  /** Marca de tiempo en milisegundos del momento en que terminó la partida. */
  readonly finishedAt: number
  readonly deckId: string
  readonly deckName: string
  readonly commanderName: string
  readonly opponentDeckName: string
  readonly won: boolean
  readonly turns: number
  readonly seconds: number
  readonly damageDealt: number
  /** Semilla de la partida: permite repetirla con «/battle?seed=N». */
  readonly seed: number
}

/** Recuento agregado que se muestra junto al historial. */
export interface RecordSummary {
  readonly played: number
  readonly won: number
  readonly lost: number
  /** Porcentaje entero de victorias; 0 cuando aún no se ha jugado nada. */
  readonly winRate: number
}

const MAX_RECORDS = 50

interface RecordsState {
  records: readonly MatchRecord[]
  addRecord: (record: Omit<MatchRecord, 'id'>) => void
  clear: () => void
}

export const useRecords = create<RecordsState>()(
  persist(
    (set) => ({
      records: [],
      addRecord: (record) =>
        set((current) => ({
          // Las partidas más recientes van primero y la lista se recorta para no crecer sin límite.
          records: [
            { ...record, id: `${record.finishedAt}-${record.seed}` },
            ...current.records,
          ].slice(0, MAX_RECORDS),
        })),
      clear: () => set({ records: [] }),
    }),
    { name: 'cronicas-nexo-records', version: 1 },
  ),
)

export const summarizeRecords = (records: readonly MatchRecord[]): RecordSummary => {
  const won = records.filter((record) => record.won).length
  return {
    played: records.length,
    won,
    lost: records.length - won,
    winRate: records.length === 0 ? 0 : Math.round((won / records.length) * 100),
  }
}

/**
 * Racha en curso a partir de las partidas más recientes (records[0] es la
 * última). Positiva si son victorias, negativa si son derrotas, 0 sin partidas.
 */
export const currentStreak = (records: readonly MatchRecord[]): number => {
  if (records.length === 0) return 0
  const winning = records[0]!.won
  let streak = 0
  for (const record of records) {
    if (record.won !== winning) break
    streak += 1
  }
  return winning ? streak : -streak
}

/** Victorias y derrotas por mazo, ordenadas de más a menos jugadas. */
export const summarizeByDeck = (
  records: readonly MatchRecord[],
): readonly { deckId: string; deckName: string; played: number; won: number }[] => {
  const byDeck = new Map<string, { deckId: string; deckName: string; played: number; won: number }>()
  for (const record of records) {
    const entry = byDeck.get(record.deckId) ?? {
      deckId: record.deckId,
      deckName: record.deckName,
      played: 0,
      won: 0,
    }
    byDeck.set(record.deckId, {
      ...entry,
      played: entry.played + 1,
      won: entry.won + (record.won ? 1 : 0),
    })
  }
  return [...byDeck.values()].sort((left, right) => right.played - left.played || left.deckName.localeCompare(right.deckName))
}
