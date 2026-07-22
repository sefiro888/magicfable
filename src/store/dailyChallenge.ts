import { STARTER_DECKS } from '../game'
import type { MatchRecord } from './records'

export interface DailyChallenge {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly done: boolean
}

const FACTION_NAMES: Readonly<Record<string, string>> = {
  fury: 'Furia', arcane: 'Arcano', nature: 'Naturaleza', order: 'Orden', shadow: 'Sombra', void: 'Vacío',
}

const factionOfDeck = (deckId: string): string | undefined =>
  STARTER_DECKS.find((deck) => deck.id === deckId)?.faction

/** Número de día desde época (UTC), estable para toda la jornada. */
const dayNumber = (date: Date): number => Math.floor(date.getTime() / 86_400_000)

const sameDay = (timestamp: number, date: Date): boolean =>
  dayNumber(new Date(timestamp)) === dayNumber(date)

type Rule = {
  readonly id: string
  readonly build: (day: number) => { title: string; description: string; check: (todayWins: readonly MatchRecord[]) => boolean }
}

const RULES: readonly Rule[] = [
  {
    id: 'faction-win',
    build: (day) => {
      const faction = STARTER_DECKS[day % STARTER_DECKS.length]!.faction
      return {
        title: `Victoria de ${FACTION_NAMES[faction] ?? faction}`,
        description: `Gana una escaramuza con la facción ${FACTION_NAMES[faction] ?? faction}.`,
        check: (wins) => wins.some((record) => factionOfDeck(record.deckId) === faction),
      }
    },
  },
  {
    id: 'swift',
    build: () => ({
      title: 'Cierre veloz',
      description: 'Gana una partida en 10 turnos o menos.',
      check: (wins) => wins.some((record) => record.turns <= 10),
    }),
  },
  {
    id: 'double',
    build: () => ({
      title: 'Doblete',
      description: 'Gana dos escaramuzas hoy.',
      check: (wins) => wins.length >= 2,
    }),
  },
  {
    id: 'overwhelm',
    build: () => ({
      title: 'Aplastamiento',
      description: 'Gana una partida infligiendo 20 o más de daño.',
      check: (wins) => wins.some((record) => record.damageDealt >= 20),
    }),
  },
]

/** Reto del día (determinista por fecha) y si ya se cumplió con las partidas de hoy. */
export const evaluateDailyChallenge = (records: readonly MatchRecord[], date: Date = new Date()): DailyChallenge => {
  const day = dayNumber(date)
  const rule = RULES[day % RULES.length]!
  const built = rule.build(day)
  const todayWins = records.filter((record) => record.won && sameDay(record.finishedAt, date))
  return {
    id: `${rule.id}-${day}`,
    title: built.title,
    description: built.description,
    done: built.check(todayWins),
  }
}
