import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COMMANDER_BY_ID, STARTER_DECKS } from '../game'

/**
 * La Torre del Nexo: un combate contra cada facción, conservando la Vida que
 * te queda de un piso al siguiente.
 *
 * Es la primera modalidad con continuidad entre partidas del juego. La gracia
 * está en que la Vida no se recupera sola: ganar un piso barato importa tanto
 * como ganarlo. Entre piso y piso se elige una bendición, y ahí es donde entra
 * la cura — nunca completa, para que la Torre siga apretando.
 */

/**
 * Cuántos pisos tiene la Torre: todos los demás mazos y el espejo final contra
 * el tuyo. Se deriva del catálogo para que añadir una facción sume un piso en
 * vez de dejar un rival fuera sin que nadie se entere.
 */
export const TOWER_FLOORS = STARTER_DECKS.length

export type BlessingId = 'mend' | 'surge' | 'insight'

export interface Blessing {
  readonly id: BlessingId
  readonly name: string
  readonly description: string
}

export const BLESSINGS: Readonly<Record<BlessingId, Blessing>> = {
  mend: {
    id: 'mend',
    name: 'Restaurar el Nexo',
    description: 'Recupera 10 de Vida (sin pasar del máximo de tu comandante).',
  },
  surge: {
    id: 'surge',
    name: 'Oleada de Esencia',
    description: 'El rival del siguiente piso empieza con 4 de Vida menos.',
  },
  insight: {
    id: 'insight',
    name: 'Presagio',
    description: 'Recupera 4 de Vida y el rival del siguiente piso pierde 2.',
  },
}

/** Cuánta Vida devuelve cada bendición, y cuánta le quita al rival. */
export const blessingEffect = (id: BlessingId): { heal: number; enemyPenalty: number } => {
  switch (id) {
    case 'mend': return { heal: 10, enemyPenalty: 0 }
    case 'surge': return { heal: 0, enemyPenalty: 4 }
    case 'insight': return { heal: 4, enemyPenalty: 2 }
  }
}

export interface TowerRun {
  /** Mazo con el que se está subiendo; no se puede cambiar a mitad de Torre. */
  readonly deckId: string
  /** Piso actual, de 1 a TOWER_FLOORS. */
  readonly floor: number
  /** Vida con la que se entra al piso actual. */
  readonly health: number
  /** Penalización de Vida acumulada para el rival del piso actual. */
  readonly enemyPenalty: number
  /** Semilla de la Torre: los rivales salen siempre en el mismo orden. */
  readonly seed: number
  /** Comandantes ya derrotados, en orden. */
  readonly defeated: readonly string[]
  /** Hay un piso ganado pendiente de elegir bendición. */
  readonly awaitingBlessing: boolean
}

export interface TowerState {
  run?: TowerRun
  /** Mejor marca: piso más alto alcanzado alguna vez. */
  best: number
  start: (deckId: string, seed?: number) => void
  /** Registra el resultado del piso actual. */
  finishFloor: (won: boolean, healthLeft: number) => void
  chooseBlessing: (id: BlessingId) => void
  abandon: () => void
}

/**
 * Orden de rivales de una Torre. Los cinco comandantes que no son el tuyo,
 * barajados con la semilla de la partida, y tu propio comandante al final:
 * el último piso es un duelo espejo.
 */
export const towerOpponents = (deckId: string, seed: number): readonly string[] => {
  const propios = STARTER_DECKS.find((deck) => deck.id === deckId)
  const otros = STARTER_DECKS.filter((deck) => deck.id !== deckId).map((deck) => deck.id)
  // Baraja determinista: la misma semilla da siempre la misma Torre, así que
  // una racha se puede repetir y comentar («la Torre de la semilla 7»).
  const ordenados = [...otros]
  let state = (seed >>> 0) || 1
  for (let i = ordenados.length - 1; i > 0; i -= 1) {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0
    const j = state % (i + 1)
    const a = ordenados[i]!
    ordenados[i] = ordenados[j]!
    ordenados[j] = a
  }
  return propios ? [...ordenados, propios.id] : ordenados
}

/** Mazo rival del piso indicado (1..TOWER_FLOORS). */
export const opponentForFloor = (run: TowerRun, floor: number): string | undefined =>
  towerOpponents(run.deckId, run.seed)[floor - 1]

/** Nombre del comandante que espera en un piso, para la interfaz. */
export const commanderOfDeck = (deckId: string | undefined): string => {
  const deck = STARTER_DECKS.find((candidate) => candidate.id === deckId)
  return (deck && COMMANDER_BY_ID[deck.commanderId]?.name) ?? '—'
}

/** Vida máxima del comandante con el que se sube: techo de las curas. */
export const towerMaxHealth = (deckId: string): number => {
  const deck = STARTER_DECKS.find((candidate) => candidate.id === deckId)
  return (deck && COMMANDER_BY_ID[deck.commanderId]?.nexusHealth) ?? 35
}

export const useTower = create<TowerState>()(
  persist(
    (set) => ({
      run: undefined,
      best: 0,
      start: (deckId, seed) =>
        set({
          run: {
            deckId,
            floor: 1,
            health: towerMaxHealth(deckId),
            enemyPenalty: 0,
            seed: seed ?? (Date.now() >>> 0),
            defeated: [],
            awaitingBlessing: false,
          },
        }),
      finishFloor: (won, healthLeft) =>
        set((current) => {
          const run = current.run
          if (!run) return current
          if (!won) {
            // Caer en la Torre la termina: la gracia es que la Vida importe.
            return { run: undefined, best: Math.max(current.best, run.floor - 1) }
          }
          const opponent = opponentForFloor(run, run.floor)
          const defeated = opponent ? [...run.defeated, opponent] : run.defeated
          const best = Math.max(current.best, run.floor)
          if (run.floor >= TOWER_FLOORS) {
            // Torre completada: se guarda la marca y se cierra la subida.
            return { run: undefined, best: Math.max(best, TOWER_FLOORS) }
          }
          return {
            best,
            run: {
              ...run,
              health: Math.max(1, healthLeft),
              defeated,
              awaitingBlessing: true,
              enemyPenalty: 0,
            },
          }
        }),
      chooseBlessing: (id) =>
        set((current) => {
          const run = current.run
          if (!run || !run.awaitingBlessing) return current
          const { heal, enemyPenalty } = blessingEffect(id)
          return {
            run: {
              ...run,
              floor: run.floor + 1,
              health: Math.min(towerMaxHealth(run.deckId), run.health + heal),
              enemyPenalty,
              awaitingBlessing: false,
            },
          }
        }),
      abandon: () => set((current) => ({ run: undefined, best: current.best })),
    }),
    { name: 'cronicas-nexo-tower', version: 1 },
  ),
)
