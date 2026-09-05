import { writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { runAiTurn } from './ai'
import { CARD_BY_ID } from './cards'
import { COMMANDER_BY_ID, STARTER_DECKS } from './decks'
import { createMatch } from './engine'
import type { MatchState, PlayerId } from './types'

/**
 * Banco de pruebas de EQUILIBRIO entre facciones.
 *
 * No forma parte del gate: solo corre con `RUN_BALANCE=1` porque tarda unos
 * segundos y no comprueba una regla concreta, sino que mide tendencias.
 *
 *   RUN_BALANCE=1 npx vitest run src/game/balance-sim.test.ts
 *
 * Metodología (importa para poder fiarse del resultado):
 * - Los DOS bandos los juega la MISMA IA (`runAiTurn`, parametrizada por
 *   asiento). Así cualquier diferencia de victorias es del mazo, no de que un
 *   lado juegue mejor que el otro.
 * - Cada emparejamiento se juega en los dos asientos con la misma semilla,
 *   para cancelar la ventaja de mover primero.
 * - Limitación conocida: la IA es buena en combate y despliegue, pero no
 *   planifica a varios turnos vista. Los mazos de control (Arcano) rinden por
 *   debajo de lo que rendirían con un humano competente; leer sus cifras como
 *   suelo, no como verdad absoluta.
 */

const RUN = process.env.RUN_BALANCE === '1'
const SEEDS = Number(process.env.BALANCE_SEEDS ?? 30)
const MAX_HALF_TURNS = 400

interface Outcome {
  readonly winnerSeat: PlayerId | 'timeout'
  readonly turns: number
}

const playMatch = (playerDeck: number, aiDeck: number, seed: number): Outcome => {
  let state: MatchState = createMatch(STARTER_DECKS[playerDeck]!, STARTER_DECKS[aiDeck]!, seed)
  for (let halfTurns = 0; halfTurns < MAX_HALF_TURNS && !state.winner; halfTurns += 1) {
    const before = state
    state = runAiTurn(state, state.activePlayer)
    // Si la IA no consigue avanzar el estado, la partida está atascada.
    if (state === before) break
  }
  return { winnerSeat: state.winner ?? 'timeout', turns: state.turn }
}

describe.skipIf(!RUN)('equilibrio entre facciones', () => {
  it('mide victorias por facción, enfrentamientos directos y duración', () => {
    const names = STARTER_DECKS.map((deck) => deck.name)
    const count = STARTER_DECKS.length
    const wins = new Array<number>(count).fill(0)
    const played = new Array<number>(count).fill(0)
    const turnSamples: number[] = []
    const headToHead: string[] = []
    let timeouts = 0

    for (let a = 0; a < count; a += 1) {
      for (let b = a + 1; b < count; b += 1) {
        let aWins = 0
        let decided = 0
        for (let index = 0; index < SEEDS; index += 1) {
          const seed = (0x9e3779b9 + index * 0x85ebca6b) >>> 0
          for (const [first, second] of [[a, b], [b, a]] as const) {
            const outcome = playMatch(first, second, seed)
            turnSamples.push(outcome.turns)
            if (outcome.winnerSeat === 'timeout') {
              timeouts += 1
              continue
            }
            const winner = outcome.winnerSeat === 'player' ? first : second
            wins[winner] = (wins[winner] ?? 0) + 1
            played[a] = (played[a] ?? 0) + 1
            played[b] = (played[b] ?? 0) + 1
            decided += 1
            if (winner === a) aWins += 1
          }
        }
        const pct = (value: number) => Math.round((value / Math.max(1, decided)) * 100)
        headToHead.push(
          `${`${names[a]} vs ${names[b]}`.padEnd(50)} ${String(pct(aWins)).padStart(3)}% - ${pct(decided - aWins)}%`,
        )
      }
    }

    const sorted = [...turnSamples].sort((left, right) => left - right)
    const average = turnSamples.reduce((sum, value) => sum + value, 0) / turnSamples.length
    const ranking = names
      .map((name, index) => ({ name, rate: (wins[index]! / Math.max(1, played[index]!)) * 100, wins: wins[index]!, played: played[index]! }))
      .sort((left, right) => right.rate - left.rate)

    const lines = [
      `SIMULACIÓN DE EQUILIBRIO — ${process.env.BALANCE_LABEL ?? 'estado actual'}`,
      `${turnSamples.length} partidas · ${SEEDS} semillas · IA idéntica en ambos bandos`,
      '',
      '=== VICTORIAS POR FACCIÓN (ordenado) ===',
      ...ranking.map((row) => `${row.name.padEnd(24)} ${row.rate.toFixed(0).padStart(3)}%  (${row.wins}/${row.played})`),
      '',
      '=== ENFRENTAMIENTOS DIRECTOS ===',
      ...headToHead,
      '',
      '=== DURACIÓN ===',
      `timeouts=${timeouts}`,
      `turnos: media=${average.toFixed(1)} mediana=${sorted[Math.floor(sorted.length / 2)]} min=${sorted[0]} max=${sorted.at(-1)}`,
    ]
    writeFileSync(process.env.BALANCE_OUT ?? 'balance-result.txt', lines.join('\n'), 'utf8')

    // Red de seguridad mínima: si casi ninguna partida termina, el dato no vale.
    expect(timeouts).toBeLessThan(turnSamples.length * 0.1)
  }, 900_000)

  it('desglosa la composición de cada mazo para explicar el porqué', () => {
    const lines = ['COMPOSICIÓN DE MAZOS (solo cartas que no son fuente)', '']
    for (const deck of STARTER_DECKS) {
      let cards = 0
      let attack = 0
      let health = 0
      let cost = 0
      let units = 0
      let structures = 0
      let instants = 0
      let guards = 0
      for (const entry of deck.cards) {
        const card = CARD_BY_ID[entry.cardId]
        if (!card || card.type === 'mana') continue
        const copies = entry.count
        cards += copies
        cost += (card.cost.generic + Object.values(card.cost.colored).reduce<number>((sum, value) => sum + (value ?? 0), 0)) * copies
        attack += (card.attack ?? 0) * copies
        health += (card.health ?? card.resistance ?? 0) * copies
        if (card.type === 'unit') units += copies
        if (card.type === 'structure') structures += copies
        if (card.type === 'instant') instants += copies
        if (card.keywords.includes('guard')) guards += copies
      }
      const commander = COMMANDER_BY_ID[deck.commanderId]
      lines.push(
        `${deck.name}  (${commander?.name})`,
        `  cartas=${cards}  unidades=${units} estructuras=${structures} instantes=${instants} guardias=${guards}`,
        `  ATQ total=${attack}  VIDA total=${health}  coste total=${cost}`,
        `  por carta: ATQ=${(attack / cards).toFixed(2)} VIDA=${(health / cards).toFixed(2)} coste=${(cost / cards).toFixed(2)}`,
        `  eficiencia: (ATQ+VIDA)/coste = ${((attack + health) / cost).toFixed(2)}`,
        '',
      )
    }
    writeFileSync(process.env.BALANCE_DECKS_OUT ?? 'balance-decks.txt', lines.join('\n'), 'utf8')
    expect(STARTER_DECKS.length).toBe(16)
  })
})
