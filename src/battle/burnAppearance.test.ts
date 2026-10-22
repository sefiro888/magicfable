import { describe, expect, it } from 'vitest'
import { isScorchImpact, scorchAppearance } from './burnAppearance'

describe('huella de fuego sobre la carta', () => {
  it('exige daño real y distingue la llama del golpe físico y del hielo', () => {
    expect(isScorchImpact({ id: 'flame', type: 'damage', amount: 2, cardId: 'dragon-caldera', durationMs: 300 })).toBe(true)
    expect(isScorchImpact({ id: 'ash', type: 'damage', amount: 2, effectId: 'ash-rain', durationMs: 300 })).toBe(true)
    expect(isScorchImpact({ id: 'blocked', type: 'shield', amount: 2, effectId: 'dragon-flame', durationMs: 300 })).toBe(false)
    expect(isScorchImpact({ id: 'zero', type: 'damage', amount: 0, effectId: 'dragon-flame', durationMs: 300 })).toBe(false)
    expect(isScorchImpact({ id: 'ice', type: 'damage', amount: 2, effectId: 'glacial-impact', durationMs: 300 })).toBe(false)
    expect(isScorchImpact({ id: 'metal', type: 'damage', amount: 2, effectId: 'heavy-impact', durationMs: 300 })).toBe(false)
    expect(isScorchImpact({ id: 'slash', type: 'damage', amount: 2, effectId: 'sword-slash', durationMs: 300 })).toBe(false)
    expect(isScorchImpact({ id: 'flash', type: 'damage', amount: 2, effectId: 'holy-flash', durationMs: 300 })).toBe(false)
  })

  it('apaga las brasas antes que el hollín y elimina la marca completa', () => {
    expect(scorchAppearance(0)).toEqual({ embers: 1, char: 1 })
    expect(scorchAppearance(1500).embers).toBe(0)
    expect(scorchAppearance(1500).char).toBeGreaterThan(0.9)
    expect(scorchAppearance(8000)).toEqual({ embers: 0, char: 0 })
  })
})
