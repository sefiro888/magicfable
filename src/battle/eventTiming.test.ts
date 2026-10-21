import { describe, expect, it } from 'vitest'
import { eventDuration } from './eventTiming'
import type { AnimationEvent } from '../game'

const attack: AnimationEvent = { id: 'attack', type: 'attack', durationMs: 400 }

describe('reloj visual compartido', () => {
  it('conserva todo el recorrido al acelerar o ralentizar', () => {
    expect(eventDuration(attack, { animationSpeed: 2, reducedMotion: false })).toBe(200)
    expect(eventDuration(attack, { animationSpeed: 0.5, reducedMotion: false })).toBe(800)
  })
  it('acorta la contabilidad sin alterar el ritmo de los golpes', () => {
    expect(eventDuration({ ...attack, type: 'draw' }, { animationSpeed: 1, reducedMotion: false })).toBe(240)
    expect(eventDuration(attack, { animationSpeed: 1, reducedMotion: false })).toBe(400)
  })
  it('mantiene un mínimo visible y una duración breve con movimiento reducido', () => {
    expect(eventDuration({ ...attack, durationMs: 20 }, { animationSpeed: 2, reducedMotion: false })).toBe(70)
    expect(eventDuration(attack, { animationSpeed: 1, reducedMotion: true })).toBe(40)
  })
})
