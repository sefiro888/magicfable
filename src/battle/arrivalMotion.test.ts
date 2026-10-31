import { describe, expect, it } from 'vitest'
import { ARRIVAL_LANDING, arrivalMotion } from './arrivalMotion'

describe('entrada de una unidad', () => {
  it('cae desde lo alto, toca suelo al aterrizar y queda asentada al final', () => {
    const start = arrivalMotion('fury', 0.12, false)
    const landing = arrivalMotion('fury', ARRIVAL_LANDING, false)
    const end = arrivalMotion('fury', 1, false)
    expect(start.height).toBeGreaterThan(2)
    expect(landing.height).toBeCloseTo(0, 5)
    expect(end.height).toBeCloseTo(0, 5)
    expect(end.scale).toBeCloseTo(1, 5)
  })

  it('acelera al caer, como un peso, en vez de frenar', () => {
    const early = arrivalMotion('fury', 0.2, false).height - arrivalMotion('fury', 0.25, false).height
    const late = arrivalMotion('fury', 0.5, false).height - arrivalMotion('fury', 0.55, false).height
    expect(late).toBeGreaterThan(early)
  })

  it('las facciones de crecimiento brotan de la losa sin caer', () => {
    expect(arrivalMotion('nature', 0.15, false).height).toBeLessThan(0.1)
    expect(arrivalMotion('nature', 0.15, false).scale).toBeLessThan(0.6)
  })

  it('una estructura cae a plomo aunque su facción brote', () => {
    expect(arrivalMotion('nature', 0.12, true).height).toBeGreaterThan(2)
  })

  it('no se ve antes de abrirse el sello', () => {
    expect(arrivalMotion('fury', 0.05, false).visible).toBe(false)
  })
})
