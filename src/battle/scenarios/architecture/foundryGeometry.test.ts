import { expect, it } from 'vitest'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { BOARD_WORLD_HALF } from '../../grid/gridCoordinates'
import { foundryDeckGeometry, furnaceBodyGeometry, gearGeometry } from './foundryGeometry'

it('el andén sostiene el tablero y el horno conserva una boca atravesable', () => {
  const material = new MeshBasicMaterial()
  const deck = new Mesh(foundryDeckGeometry(), material)
  deck.updateMatrixWorld()
  for (const x of [-BOARD_WORLD_HALF, BOARD_WORLD_HALF]) {
    for (const z of [-BOARD_WORLD_HALF, BOARD_WORLD_HALF]) {
      const hit = new Raycaster(new Vector3(x, 1, z), new Vector3(0, -1, 0)).intersectObject(deck)[0]
      expect(hit?.point.y).toBeGreaterThan(-0.14)
      expect(hit?.point.y).toBeLessThan(-0.06)
    }
  }
  const furnace = new Mesh(furnaceBodyGeometry(), material)
  furnace.updateMatrixWorld()
  const ray = (x: number) => new Raycaster(new Vector3(x, 1, 3), new Vector3(0, 0, -1)).intersectObject(furnace)
  expect(ray(0)).toHaveLength(0)
  expect(ray(1.6).length).toBeGreaterThan(0)
  material.dispose()
})

it('los dos engranajes tienen vaciados reales y radios que transmiten al aro', () => {
  const material = new MeshBasicMaterial()
  for (const [radius, teeth] of [[0.98, 24], [0.49, 12]] as const) {
    const wheel = new Mesh(gearGeometry(radius, teeth), material)
    wheel.updateMatrixWorld()
    const ray = (angle: number) => new Raycaster(new Vector3(Math.cos(angle) * radius * 0.55,
      Math.sin(angle) * radius * 0.55, 1), new Vector3(0, 0, -1)).intersectObject(wheel)
    expect(ray(Math.PI / 6)).toHaveLength(0)
    expect(ray(0).length).toBeGreaterThan(0)
  }
  material.dispose()
})
