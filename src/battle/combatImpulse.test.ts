import { describe, expect, it } from 'vitest'
import { impulsesForEvent } from './combatImpulse'
import type { AnimationEvent, BoardPiece } from '../game'

const piece = (instanceId: string, x: number, y: number, owner: 'player' | 'ai' = 'player'): BoardPiece => ({
  instanceId,
  cardId: 'sabueso-brasa',
  owner,
  position: { x, y },
  currentHealth: 3,
  attackModifier: 0,
  movedThisTurn: false,
  attackedThisTurn: false,
  enteredOnTurn: 1,
  statuses: [],
})

const board = [piece('att', 3, 4), piece('def', 3, 2, 'ai')]

const event = (partial: Partial<AnimationEvent> & { type: AnimationEvent['type'] }): AnimationEvent => ({
  id: 'e1',
  durationMs: 300,
  ...partial,
})

describe('impulso de combate', () => {
  it('el atacante embiste en la dirección de su objetivo', () => {
    const map = impulsesForEvent(
      event({ type: 'attack', actorId: 'att', targetId: 'def', from: { x: 3, y: 4 }, to: { x: 3, y: 2 } }),
      board,
    )
    const lunge = map.get('att')
    expect(lunge?.kind).toBe('lunge')
    // El objetivo está en una fila menor: la embestida va hacia -Z.
    expect(lunge?.dz).toBeLessThan(0)
    expect(Math.abs(lunge?.dx ?? 1)).toBeLessThan(0.001)
  })

  it('contra el Nexo, sin casilla de destino, apunta al Nexo rival', () => {
    const map = impulsesForEvent(event({ type: 'attack', actorId: 'att', targetId: 'ai-nexus' }), board)
    expect(map.get('att')?.kind).toBe('lunge')
    expect(map.get('att')?.dz).toBeLessThan(0)
  })

  it('el golpeado retrocede alejándose de quien le pegó', () => {
    const map = impulsesForEvent(
      event({ type: 'damage', targetId: 'def', from: { x: 3, y: 4 }, to: { x: 3, y: 2 }, amount: 2 }),
      board,
    )
    const recoil = map.get('def')
    expect(recoil?.kind).toBe('recoil')
    // El golpe vino de una fila mayor: el retroceso continúa hacia -Z.
    expect(recoil?.dz).toBeLessThan(0)
  })

  it('sin origen marcado no se inventa una dirección rara', () => {
    const map = impulsesForEvent(event({ type: 'damage', targetId: 'def', to: { x: 3, y: 2 } }), board)
    const recoil = map.get('def')
    expect(recoil).toBeDefined()
    expect(Number.isFinite(recoil?.dx ?? NaN)).toBe(true)
    expect(Number.isFinite(recoil?.dz ?? NaN)).toBe(true)
  })

  it('los eventos que no son golpes no mueven a nadie', () => {
    expect(impulsesForEvent(event({ type: 'draw' }), board).size).toBe(0)
    expect(impulsesForEvent(event({ type: 'turn', actorId: 'att' }), board).size).toBe(0)
    expect(impulsesForEvent(undefined, board).size).toBe(0)
  })

  it('un id desconocido no rompe nada', () => {
    expect(impulsesForEvent(event({ type: 'attack', actorId: 'fantasma' }), board).size).toBe(0)
  })
})
