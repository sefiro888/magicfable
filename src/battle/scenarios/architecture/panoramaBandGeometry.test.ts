import { expect, it } from 'vitest'
import { panoramaBandGeometry } from './panoramaBandGeometry'

it('la banda distante mantiene verticales, radio constante y no introduce tapas', () => {
  const geometry = panoramaBandGeometry(), p = geometry.getAttribute('position')
  geometry.computeBoundingBox()
  expect(geometry.parameters.openEnded).toBe(true)
  expect(geometry.boundingBox!.max.y).toBe(-8)
  expect(geometry.boundingBox!.min.y).toBe(-70)
  for (let i = 0; i < p.count; i += 1) {
    expect(Math.hypot(p.getX(i), p.getZ(i))).toBeCloseTo(50, 4)
  }
  expect(p.getX(0)).toBeCloseTo(p.getX(129), 6)
  expect(p.getZ(0)).toBeCloseTo(p.getZ(129), 6)
})
