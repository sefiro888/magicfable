import { expect, it } from 'vitest'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { BOARD_WORLD_HALF } from '../../grid/gridCoordinates'
import { seaArchGeometry, shoreFoamGeometry, shoreShelfGeometry } from './shoreGeometry'

it('la pizarra sostiene las esquinas y la espuma presenta su cara al cielo', () => {
  const material = new MeshBasicMaterial()
  const shelf = new Mesh(shoreShelfGeometry(0), material)
  shelf.updateMatrixWorld()
  for (const x of [-BOARD_WORLD_HALF, BOARD_WORLD_HALF]) {
    for (const z of [-BOARD_WORLD_HALF, BOARD_WORLD_HALF]) {
      const hit = new Raycaster(new Vector3(x, 1, z), new Vector3(0, -1, 0)).intersectObject(shelf)[0]
      expect(hit?.point.y).toBeGreaterThan(-0.13)
      expect(hit?.point.y).toBeLessThan(-0.06)
    }
  }
  for (const low of [false, true]) {
    const normal = shoreFoamGeometry(low).getAttribute('normal')
    for (let i = 0; i < normal.count; i += 1) expect(normal.getY(i)).toBeGreaterThan(0.99)
  }
  material.dispose()
})

it('el arco costero deja pasar el mar entre dos paredes reales', () => {
  const material = new MeshBasicMaterial()
  const arch = new Mesh(seaArchGeometry(), material)
  arch.updateMatrixWorld()
  const ray = (x: number) => new Raycaster(new Vector3(x, 0.85, 3), new Vector3(0, 0, -1)).intersectObject(arch)
  expect(ray(0)).toHaveLength(0)
  expect(ray(-1.2).length).toBeGreaterThan(0)
  expect(ray(1.2).length).toBeGreaterThan(0)
  material.dispose()
})
