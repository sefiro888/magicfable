import { describe, expect, it } from 'vitest'
import { materialOf } from './ImpactDebris'

describe('material visual de los fragmentos', () => {
  it('distingue un autómata metálico de una unidad de cristal', () => {
    expect(materialOf('automata-de-taller')).toBe('metal')
    expect(materialOf('centinela-cristal')).toBe('crystal')
  })

  it('usa piedra cuando no se conoce la carta', () => {
    expect(materialOf()).toBe('stone')
  })
})
