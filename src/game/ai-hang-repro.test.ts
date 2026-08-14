import { describe, expect, it } from 'vitest'
import { chooseNextAiAction, type AiDifficulty } from './ai'
import { STARTER_DECKS } from './decks'
import { applyAction, createMatch } from './engine'
import type { GameAction, MatchState, PlayerId } from './types'

/**
 * Reproducción del reporte del usuario: la IA rival se quedó "pensando" sin
 * terminar el turno más de 3 minutos, con Kaela (Furia) como jugador y
 * Malachar (Sombra) como IA, en el turno 12.
 *
 * Encontró el bug real: `ai.ts` tenía su propia copia (incompleta) de la
 * lista de hechizos que necesitan objetivo, sin Maldición Sombra
 * (`curse-drain-health`). La IA la elegía como su mejor jugada, la intentaba
 * lanzar sin objetivo, el motor la rechazaba, y como seguía siendo su mejor
 * jugada la repetía turno tras turno para siempre — cientos de turnos
 * consecutivos fallando la misma carta en la simulación de más abajo. Ya
 * arreglado (ver `spellNeedsPiece` en engine.ts, ahora fuente única) y con
 * regresión permanente en `ai.test.ts`.
 *
 * Se deja este banco como herramienta: detecta si una carta concreta falla
 * de forma repetida turno tras turno, sin confundirlo con un punto muerto
 * legítimo (dos manos sin nada que jugar cediendo turno sin fin, posible sin
 * penalización de fatiga — no es un bug, solo una partida muy larga).
 *
 *   RUN_AI_HANG=1 npx vitest run src/game/ai-hang-repro.test.ts
 */
const RUN = process.env.RUN_AI_HANG === '1'

const furiaIndex = STARTER_DECKS.findIndex((deck) => deck.commanderId.includes('kaela'))
const sombraIndex = STARTER_DECKS.findIndex((deck) => deck.commanderId.includes('malachar'))

/**
 * Ventana de turnos en la que, si SIEMPRE se repite un intento fallido de
 * jugar la misma carta, se considera un bucle real y no una coincidencia.
 * Distingue el bug de verdad (una carta que el motor rechaza siempre, y que
 * la IA sigue creyendo su mejor jugada turno tras turno) de un punto muerto
 * legítimo: sin penalización de fatiga, dos manos sin nada que jugar pueden
 * ceder turno indefinidamente sin que eso sea un error de nadie — ver
 * memoria del proyecto, «Sin penalización de fatiga».
 */
const FAILED_REPLAY_WINDOW = 20

const playFullGame = (difficulty: AiDifficulty, seed: number, maxSteps = 5000) => {
  let state: MatchState = createMatch(STARTER_DECKS[furiaIndex]!, STARTER_DECKS[sombraIndex]!, seed)
  const skipped: Record<PlayerId, Set<string>> = { player: new Set(), ai: new Set() }
  const actionLog: string[] = []
  /** Cuántas veces seguidas, turno tras turno, se ha fallado la MISMA carta. */
  let sameFailedCardStreak = 0
  let lastFailedCard: string | undefined
  for (let step = 0; step < maxSteps && !state.winner; step += 1) {
    const seat = state.activePlayer
    // Solo la IA usa chooseNextAiAction en producción; el jugador humano no
    // se simula aquí — para reproducir el turno rival basta con dejar que la
    // IA juegue ambos bandos, que es lo que hace runAiTurn/balance-sim.
    const action: GameAction = chooseNextAiAction(state, skipped[seat], difficulty, seat)
    const cardName = action.type === 'play-card' || action.type === 'play-resource'
      ? state.players[seat].hand.find((c) => c.instanceId === action.cardInstanceId)?.cardId
      : undefined
    const result = applyAction(state, action)
    actionLog.push(`[t${state.turn}] ${seat} → ${JSON.stringify(action)} card=${cardName} ok=${result.ok} err=${result.ok ? '' : result.error?.message}`)
    if (!result.ok) {
      if (cardName && cardName === lastFailedCard) {
        sameFailedCardStreak += 1
        if (sameFailedCardStreak > FAILED_REPLAY_WINDOW) {
          return { hung: true as const, state, actionLog: actionLog.slice(-40), step }
        }
      } else {
        sameFailedCardStreak = cardName ? 1 : 0
        lastFailedCard = cardName
      }
      if (action.type === 'play-card' || action.type === 'play-resource') {
        skipped[seat].add(action.cardInstanceId)
      } else {
        const forced = applyAction(state, { type: 'end-turn', playerId: seat })
        if (!forced.ok) return { hung: true as const, state, actionLog: actionLog.slice(-40), step }
        state = forced.state
        skipped[seat] = new Set()
      }
      continue
    }
    lastFailedCard = undefined
    sameFailedCardStreak = 0
    state = result.state
    if (action.type === 'end-turn') skipped[seat] = new Set()
  }
  // Llegar al tope de pasos sin que nadie ganó es, sin más contexto, un
  // punto muerto legítimo (posible sin fatiga) y no se marca como bucle.
  return { hung: false as const, state, actionLog: [], step: 0 }
}

describe.skipIf(!RUN)('reproducción: la IA se cuelga sin terminar el turno', () => {
  it('juega muchas partidas Kaela vs Malachar buscando un bucle real', () => {
    const hangs: { seed: number; difficulty: AiDifficulty; step: number; log: string[] }[] = []
    for (const difficulty of ['normal', 'hard'] as const) {
      for (let seed = 1; seed <= 300; seed += 1) {
        const result = playFullGame(difficulty, seed)
        if (result.hung) {
          hangs.push({ seed, difficulty, step: result.step, log: result.actionLog })
        }
      }
    }
    if (hangs.length > 0) {
      console.error(`${hangs.length} cuelgues encontrados de 600 partidas`)
      for (const hang of hangs.slice(0, 3)) {
        console.error(`\n=== seed=${hang.seed} difficulty=${hang.difficulty} step=${hang.step} ===`)
        console.error(hang.log.join('\n'))
      }
    }
    expect(hangs).toEqual([])
  }, 300_000)
})
