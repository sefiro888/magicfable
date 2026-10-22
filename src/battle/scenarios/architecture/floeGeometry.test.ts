import { expect, it } from 'vitest'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { BOARD_WORLD_HALF } from '../../grid/gridCoordinates'
import { floeGeometry } from './floeGeometry'
import { glacierBankGeometry } from './glacierBankGeometry'

it('la placa sostiene la diagonal del tablero y su nieve no invade las casillas', () => {
  const material = new MeshBasicMaterial()
  const ice = new Mesh(floeGeometry('body'), material)
  const snow = new Mesh(floeGeometry('snow'), material)
  ice.updateMatrixWorld()
  snow.updateMatrixWorld()
  const down = new Vector3(0, -1, 0)
  for (const x of [-BOARD_WORLD_HALF, BOARD_WORLD_HALF]) {
    for (const z of [-BOARD_WORLD_HALF, BOARD_WORLD_HALF]) {
      const ray = new Raycaster(new Vector3(x, 1, z), down)
      const support = ray.intersectObject(ice)[0]
      expect(support?.point.y).toBeGreaterThan(-0.16)
      expect(support?.point.y).toBeLessThan(-0.06)
      expect(ray.intersectObject(snow)).toHaveLength(0)
    }
  }
  expect(new Raycaster(new Vector3(4.5, 1, 0), down).intersectObject(snow).length).toBeGreaterThan(0)
  material.dispose()
})

it('ambas orillas de hielo exponen su cara superior en alta y baja', () => {
  const material = new MeshBasicMaterial()
  for (const low of [false, true]) {
    for (const side of [-1, 1]) {
      const bank = new Mesh(glacierBankGeometry(side, low).ice, material)
      bank.updateMatrixWorld()
      const hit = new Raycaster(new Vector3(side * 6.4, 3, -4.7), new Vector3(0, -1, 0)).intersectObject(bank)[0]
      // Un devanado común a las dos orillas ocultaba la que invierte X.
      expect(hit?.point.y).toBeGreaterThan(0.3)
      expect(hit?.point.y).toBeLessThan(1.1)
      expect(hit?.face?.normal.y).toBeGreaterThan(0)
    }
  }
  material.dispose()
})
