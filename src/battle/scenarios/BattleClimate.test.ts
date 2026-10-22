import { expect, it } from 'vitest'
import { battleStrain } from './BattleClimate'

it('la presión sigue el Nexo crítico, respeta su vida máxima y disminuye al curarlo', () => {
  const healthy = { health: 35, maxHealth: 35 }, critical = { health: 4, maxHealth: 40 }
  expect(battleStrain(3, [healthy, critical])).toBeCloseTo(0.648)
  expect(battleStrain(3, [critical, healthy])).toBeCloseTo(0.648)
  expect(battleStrain(3, [healthy, { ...critical, health: 40 }])).toBe(0)
})

it('una partida larga sana conserva calma y los extremos quedan acotados', () => {
  const healthy = [{ health: 35, maxHealth: 35 }]
  expect(battleStrain(1, healthy)).toBe(0)
  expect(battleStrain(100, healthy)).toBeCloseTo(0.28)
  expect(battleStrain(100, [{ health: -5, maxHealth: 35 }])).toBe(1)
  expect(battleStrain(1, [{ health: 40, maxHealth: 35 }])).toBe(0)
})
