import { describe, expect, it } from 'vitest'
import { chooseNextAiAction, type AiDifficulty } from './ai'
import { STARTER_DECKS } from './decks'
import { applyAction, createMatch } from './engine'
import type { GameAction, MatchState, PlayerId } from './types'

/**
 * Banco de pruebas de FUERZA de la IA: enfrenta un nivel contra otro para
 * comprobar que «Difícil» de verdad gana más que «Normal».
 *
 * No forma parte del gate: solo corre con `RUN_AI_SIM=1`, porque juega cientos
 * de partidas completas y mide una tendencia, no una regla concreta.
 *
 *   RUN_AI_SIM=1 npx vitest run src/game/ai-strength-sim.test.ts
 *
 * Metodología: cada emparejamiento se juega en los DOS asientos con la misma
 * semilla, para que la ventaja de empezar no contamine el resultado.
 */

const RUN = process.env.RUN_AI_SIM === '1'
const SEEDS = Number(process.env.AI_SIM_SEEDS ?? 40)
const MAX_ACTIONS = 4000

/** Juega una partida entera con un nivel de IA distinto en cada asiento. */
const playMatch = (
  levels: Readonly<Record<PlayerId, AiDifficulty>>,
  seed: number,
): PlayerId | 'timeout' => {
  let state: MatchState = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, seed)
  const skipped: Record<PlayerId, Set<string>> = { player: new Set(), ai: new Set() }
  for (let step = 0; step < MAX_ACTIONS && !state.winner; step += 1) {
    const seat = state.activePlayer
    const action: GameAction = chooseNextAiAction(state, skipped[seat], levels[seat], seat)
    const result = applyAction(state, action)
    if (!result.ok) {
      // Acción rechazada: se descarta esa carta para este turno, como hace la
      // pantalla de batalla, y si no era una carta se cede el turno.
      if (action.type === 'play-card' || action.type === 'play-resource') {
        skipped[seat].add(action.cardInstanceId)
        continue
      }
      const forced = applyAction(state, { type: 'end-turn', playerId: seat })
      if (!forced.ok) break
      state = forced.state
      continue
    }
    state = result.state
    if (action.type === 'end-turn') {
      skipped[seat] = new Set()
    }
  }
  return state.winner ?? 'timeout'
}

/** Victorias de `challenger` sobre `baseline` jugando ambos asientos. */
const duel = (challenger: AiDifficulty, baseline: AiDifficulty) => {
  let challengerWins = 0
  let baselineWins = 0
  let timeouts = 0
  for (let seed = 1; seed <= SEEDS; seed += 1) {
    for (const challengerSeat of ['player', 'ai'] as const) {
      const other: PlayerId = challengerSeat === 'player' ? 'ai' : 'player'
      const winner = playMatch(
        { [challengerSeat]: challenger, [other]: baseline } as Record<PlayerId, AiDifficulty>,
        seed,
      )
      if (winner === 'timeout') timeouts += 1
      else if (winner === challengerSeat) challengerWins += 1
      else baselineWins += 1
    }
  }
  const decided = challengerWins + baselineWins
  return {
    challengerWins,
    baselineWins,
    timeouts,
    winRate: decided > 0 ? Math.round((challengerWins / decided) * 100) : 0,
  }
}

describe.skipIf(!RUN)('fuerza relativa de los niveles de IA', () => {
  it('difícil gana más que normal', () => {
    const result = duel('hard', 'normal')
    console.info(
      `hard vs normal → ${result.challengerWins}-${result.baselineWins} ` +
      `(${result.winRate}% para difícil, ${result.timeouts} sin decidir)`,
    )
    expect(result.winRate).toBeGreaterThan(50)
  }, 600_000)

  it('normal gana más que fácil', () => {
    const result = duel('normal', 'easy')
    console.info(
      `normal vs easy → ${result.challengerWins}-${result.baselineWins} ` +
      `(${result.winRate}% para normal, ${result.timeouts} sin decidir)`,
    )
    expect(result.winRate).toBeGreaterThan(50)
  }, 600_000)
})
