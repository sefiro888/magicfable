import { expect, it } from 'vitest'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { BOARD_WORLD_HALF } from '../../grid/gridCoordinates'
import { jadeRoofGeometry, jadeRoofHeight, jadeTerraceGeometry, moonGateGeometry } from './jadeGeometry'

it('la puerta lunar tiene paso circular real y la terraza sostiene las cuatro esquinas', () => {
  const material = new MeshBasicMaterial()
  const gate = new Mesh(moonGateGeometry(), material)
  gate.updateMatrixWorld()
  const ray = (x: number, y: number) => new Raycaster(new Vector3(x, y, 3), new Vector3(0, 0, -1)).intersectObject(gate)
  expect(ray(0, 1.12)).toHaveLength(0)
  expect(ray(0.8, 1.8).length).toBeGreaterThan(0)
  expect(ray(1.4, 1.12).length).toBeGreaterThan(0)
  const terrace = new Mesh(jadeTerraceGeometry(), material)
  terrace.updateMatrixWorld()
  for (const x of [-BOARD_WORLD_HALF, BOARD_WORLD_HALF]) for (const z of [-BOARD_WORLD_HALF, BOARD_WORLD_HALF]) {
    const hit = new Raycaster(new Vector3(x, 1, z), new Vector3(0, -1, 0)).intersectObject(terrace)[0]
    expect(hit?.point.y).toBeGreaterThan(-0.15)
    expect(hit?.point.y).toBeLessThan(-0.08)
  }
  material.dispose()
})

it('los faldones remontan en el alero y conservan su perfil en calidad baja', () => {
  expect(jadeRoofHeight(0, 0)).toBeGreaterThan(jadeRoofHeight(0, 0.9))
  expect(jadeRoofHeight(0, 1.7)).toBeGreaterThan(jadeRoofHeight(0, 1.5))
  for (const low of [false, true]) {
    const roof = jadeRoofGeometry(low), p = roof.getAttribute('position'), n = roof.getAttribute('normal')
    expect(roof.boundingBox?.min.x).toBeCloseTo(-2.8)
    expect(roof.boundingBox?.max.x).toBeCloseTo(2.8)
    for (let i = 0; i < p.count; i += 1) {
      expect(p.getY(i)).toBeCloseTo(jadeRoofHeight(p.getX(i), p.getZ(i)), 5)
      expect(n.getY(i)).toBeGreaterThan(0)
    }
  }
})
