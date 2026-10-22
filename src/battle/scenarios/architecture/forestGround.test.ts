import { expect, it } from 'vitest'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { BOARD_WORLD_HALF } from '../../grid/gridCoordinates'
import { forestGroundGeometry } from './ForestGround'

it('el terreno del claro sostiene las cuatro esquinas sin sobresalir de las losas', () => {
  const material = new MeshBasicMaterial()
  for (const low of [false, true]) {
    const ground = new Mesh(forestGroundGeometry(low), material)
    ground.updateMatrixWorld()
    for (const x of [-BOARD_WORLD_HALF, BOARD_WORLD_HALF]) {
      for (const z of [-BOARD_WORLD_HALF, BOARD_WORLD_HALF]) {
        const hit = new Raycaster(new Vector3(x, 1, z), new Vector3(0, -1, 0)).intersectObject(ground)[0]
        // El disco anterior cortaba la diagonal y dejaba las casillas sin suelo.
        expect(hit?.point.y).toBeGreaterThan(-0.13)
        expect(hit?.point.y).toBeLessThan(-0.06)
        expect(hit?.face?.normal.y).toBeGreaterThan(0.98)
      }
    }
  }
  material.dispose()
})
