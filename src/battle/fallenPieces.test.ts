import { describe, expect, it } from 'vitest'
import { piecesDying } from './FallenPieces'
import type { AnimationEvent, BoardPiece } from '../game'

const pieza = (instanceId: string): BoardPiece => ({
  instanceId,
  cardId: 'sabueso-brasa',
  owner: 'player',
  position: { x: 2, y: 3 },
  currentHealth: 1,
  attackModifier: 0,
  movedThisTurn: false,
  attackedThisTurn: false,
  enteredOnTurn: 1,
  statuses: [],
})

const evento = (type: AnimationEvent['type'], targetId?: string): AnimationEvent => ({
  id: `${type}-${targetId ?? ''}`,
  type,
  targetId,
  durationMs: 300,
})

const conocidas = (...ids: string[]) => new Map(ids.map((id) => [id, pieza(id)]))

describe('piezas que acaban de morir', () => {
  it('una pieza que sigue en el tablero no está muriendo', () => {
    const board = [pieza('a')]
    expect(piecesDying(conocidas('a'), board, [evento('destroy', 'a')])).toHaveLength(0)
  })

  it('desaparecer con una destrucción pendiente sí cuenta como muerte', () => {
    const muertas = piecesDying(conocidas('a', 'b'), [pieza('b')], [evento('destroy', 'a')])
    expect(muertas.map((piece) => piece.instanceId)).toEqual(['a'])
  })

  it('desaparecer SIN destrucción no dibuja ninguna caída', () => {
    // Volver a la mano o teletransportarse también saca la pieza del tablero:
    // ahí no debe caerse nada.
    expect(piecesDying(conocidas('a'), [], [evento('spell', 'a')])).toHaveLength(0)
    expect(piecesDying(conocidas('a'), [], [])).toHaveLength(0)
  })

  it('vale tanto el evento en curso como los que esperan en la cola', () => {
    const cola = [evento('attack', 'a'), evento('damage', 'a'), evento('destroy', 'a')]
    expect(piecesDying(conocidas('a'), [], cola)).toHaveLength(1)
  })

  it('devuelve la pieza entera, para poder dibujarla donde estaba', () => {
    const [muerta] = piecesDying(conocidas('a'), [], [evento('destroy', 'a')])
    expect(muerta?.cardId).toBe('sabueso-brasa')
    expect(muerta?.position).toEqual({ x: 2, y: 3 })
  })

  it('varias muertes a la vez se devuelven todas', () => {
    const muertas = piecesDying(conocidas('a', 'b', 'c'), [pieza('c')], [evento('destroy', 'a'), evento('destroy', 'b')])
    expect(muertas).toHaveLength(2)
  })
})
