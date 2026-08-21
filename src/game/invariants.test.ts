import { describe, expect, it } from 'vitest'
import { runAiTurn } from './ai'
import { CARD_BY_ID } from './cards'
import { STARTER_DECKS } from './decks'
import { createMatch } from './engine'
import { BOARD_SIZE } from './board'
import type { MatchState } from './types'

/**
 * Cazador de bugs por simulación: juega partidas enteras con la IA en los dos
 * asientos y, DESPUÉS DE CADA TURNO, comprueba que el estado sigue siendo
 * legal. No mide equilibrio (para eso está balance-sim); busca estados
 * imposibles — dos unidades en la misma casilla, vida negativa, una carta que
 * aparece en dos zonas a la vez — que en una partida normal solo se verían
 * como «algo raro» sin poder reproducirlo.
 *
 * Corre en el gate con pocas semillas para que sea rápido; con más semillas a
 * mano cuando se toque el motor:
 *
 *   SIM_SEEDS=40 npx vitest run src/game/invariants.test.ts
 */

const SEEDS = Number(process.env.SIM_SEEDS ?? 6)
const MAX_HALF_TURNS = 300

/** Todas las cartas que existen ahora mismo, sin importar de quién ni dónde. */
const todasLasCartas = (state: MatchState): string[] => {
  const ids: string[] = []
  for (const id of ['player', 'ai'] as const) {
    const player = state.players[id]
    ids.push(
      ...player.hand.map((card) => card.instanceId),
      ...player.deck.map((card) => card.instanceId),
      ...player.discard.map((card) => card.instanceId),
      ...player.resources.map((resource) => resource.instanceId),
    )
  }
  ids.push(...state.board.map((piece) => piece.instanceId))
  return ids
}

/** Todo lo que debe cumplirse siempre, pase lo que pase en la partida. */
const checkInvariants = (state: MatchState, contexto: string) => {
  const ocupadas = new Set<string>()
  for (const piece of state.board) {
    const donde = `${contexto} · ${piece.cardId} en (${piece.position.x},${piece.position.y})`
    // Dentro del tablero.
    expect(piece.position.x, `${donde}: x fuera del tablero`).toBeGreaterThanOrEqual(0)
    expect(piece.position.x, `${donde}: x fuera del tablero`).toBeLessThan(BOARD_SIZE)
    expect(piece.position.y, `${donde}: y fuera del tablero`).toBeGreaterThanOrEqual(0)
    expect(piece.position.y, `${donde}: y fuera del tablero`).toBeLessThan(BOARD_SIZE)
    // Una casilla, una unidad.
    const casilla = `${piece.position.x},${piece.position.y}`
    expect(ocupadas.has(casilla), `${donde}: dos unidades en la misma casilla`).toBe(false)
    ocupadas.add(casilla)
    // Viva: una pieza con 0 o menos de Vida tendría que haber salido del tablero.
    expect(piece.currentHealth, `${donde}: sigue en juego con ${piece.currentHealth} de Vida`).toBeGreaterThan(0)
    // Y su carta existe de verdad.
    expect(CARD_BY_ID[piece.cardId], `${donde}: cardId desconocido`).toBeDefined()
  }

  for (const id of ['player', 'ai'] as const) {
    const player = state.players[id]
    expect(player.nexusHealth, `${contexto}: Nexo de ${id} en negativo`).toBeGreaterThanOrEqual(0)
    // Ninguna carta puede estar en dos sitios a la vez: mano, mazo, descarte,
    // fuentes en juego y unidades del tablero son zonas exclusivas.
    const enJuego = state.board.filter((piece) => piece.owner === id).map((piece) => piece.instanceId)
    const todas = [
      ...player.hand.map((card) => card.instanceId),
      ...player.deck.map((card) => card.instanceId),
      ...player.discard.map((card) => card.instanceId),
      ...player.resources.map((resource) => resource.instanceId),
      ...enJuego,
    ]
    expect(new Set(todas).size, `${contexto}: ${id} tiene la misma carta en dos zonas`).toBe(todas.length)
  }

  // Ni una sola carta duplicada en todo el juego: el mismo instanceId no puede
  // estar dos veces ni siquiera en zonas de jugadores distintos (hay efectos
  // que roban cartas al rival, así que se comprueba en global, no por bando).
  const universo = todasLasCartas(state)
  expect(new Set(universo).size, `${contexto}: hay cartas duplicadas en la partida`).toBe(universo.length)

  // Si hay ganador, su rival está a cero: no se gana «por otra cosa».
  if (state.winner) {
    const perdedor = state.winner === 'player' ? 'ai' : 'player'
    expect(state.players[perdedor].nexusHealth, `${contexto}: hay ganador con el Nexo rival vivo`).toBe(0)
  }
}

describe('invariantes del estado de partida', () => {
  it('ninguna partida simulada llega a un estado imposible', () => {
    let partidas = 0
    for (let seed = 1; seed <= SEEDS; seed += 1) {
      const a = seed % STARTER_DECKS.length
      const b = (seed * 3 + 1) % STARTER_DECKS.length
      if (a === b) continue
      let state: MatchState = createMatch(STARTER_DECKS[a]!, STARTER_DECKS[b]!, seed * 7919)
      checkInvariants(state, `semilla ${seed} · inicio`)
      /**
       * Ninguna carta del mazo inicial puede evaporarse: puede cambiar de zona
       * (mano, descarte, tablero, fuentes) pero tiene que seguir existiendo.
       *
       * Lo que sí puede aparecer son fichas NUEVAS: «Aniquilación del Vacío»
       * genera fuentes de Esencia por cada punto de Resistencia que destruye,
       * con id propio. Por eso se comprueba que no falte ninguna de las
       * originales en vez de que el total no cambie — un total fijo daba falso
       * positivo con esa carta.
       */
      const originales = new Set(todasLasCartas(state))
      for (let half = 0; half < MAX_HALF_TURNS && !state.winner; half += 1) {
        const before = state
        state = runAiTurn(state, state.activePlayer)
        checkInvariants(state, `semilla ${seed} · medio turno ${half}`)
        const presentes = new Set(todasLasCartas(state))
        const perdidas = [...originales].filter((id) => !presentes.has(id))
        expect(perdidas, `semilla ${seed} · medio turno ${half}: cartas desaparecidas de la partida`).toEqual([])
        if (state === before) break
      }
      partidas += 1
    }
    expect(partidas).toBeGreaterThan(0)
  })
})
