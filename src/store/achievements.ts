import { STARTER_DECKS } from '../game'
import { currentStreak, type MatchRecord } from './records'

export interface Achievement {
  readonly id: string
  readonly name: string
  readonly description: string
  /** Icono decorativo (emoji o símbolo). */
  readonly icon: string
  readonly unlocked: boolean
  /** Progreso 0..1 hacia el desbloqueo, para mostrar una barra. */
  readonly progress: number
}

const factionOfDeck = (deckId: string): string | undefined =>
  STARTER_DECKS.find((deck) => deck.id === deckId)?.faction

const ratio = (value: number, goal: number): number => Math.max(0, Math.min(1, value / goal))

/** Evalúa el estado de los logros a partir del historial de partidas. */
export const evaluateAchievements = (records: readonly MatchRecord[]): readonly Achievement[] => {
  const wins = records.filter((record) => record.won)
  const factionsWon = new Set(wins.map((record) => factionOfDeck(record.deckId)).filter(Boolean))
  const factionsPlayed = new Set(records.map((record) => factionOfDeck(record.deckId)).filter(Boolean))
  const bestStreak = Math.max(0, currentStreak(records))
  const fastestWin = wins.reduce<number | undefined>(
    (best, record) => (best === undefined ? record.turns : Math.min(best, record.turns)),
    undefined,
  )
  const totalFactions = STARTER_DECKS.length

  const define = (id: string, name: string, description: string, icon: string, value: number, goal: number): Achievement => ({
    id, name, description, icon, unlocked: value >= goal, progress: ratio(value, goal),
  })

  return [
    define('primera-sangre', 'Primera sangre', 'Gana tu primera escaramuza.', '⚔️', wins.length, 1),
    define('veterano', 'Veterano del Nexo', 'Juega 10 escaramuzas.', '🛡️', records.length, 10),
    define('racha', 'Racha imparable', 'Encadena 3 victorias seguidas.', '🔥', bestStreak, 3),
    define('relampago', 'Victoria relámpago', 'Gana una partida en 8 turnos o menos.', '⚡', fastestWin !== undefined && fastestWin <= 8 ? 1 : 0, 1),
    define('explorador', 'Explorador de facciones', 'Juega con las seis facciones.', '🧭', factionsPlayed.size, totalFactions),
    define('maestro', 'Maestro del Nexo', 'Gana con las seis facciones.', '👑', factionsWon.size, totalFactions),
  ]
}
