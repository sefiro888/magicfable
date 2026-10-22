import { expect, it } from 'vitest'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { sacredWheelGeometry, ghatRiverGeometry, ghatTerraceGeometry } from './wheelGeometry'

it('la rueda une el cubo y el aro mediante radios con vanos atravesables', () => {
  const material = new MeshBasicMaterial()
  const wheel = new Mesh(sacredWheelGeometry(), material)
  wheel.updateMatrixWorld()
  const ray = (r: number, angle: number) => new Raycaster(new Vector3(Math.cos(angle) * r,
    Math.sin(angle) * r, 2), new Vector3(0, 0, -1)).intersectObject(wheel)
  expect(ray(0, 0).length).toBeGreaterThan(0)
  expect(ray(0.7, 0).length).toBeGreaterThan(0)
  expect(ray(0.7, Math.PI / 8)).toHaveLength(0)
  expect(ray(1.3, Math.PI / 8).length).toBeGreaterThan(0)
  material.dispose()
})

it('el río se desvanece antes de sus cantos y la terraza llega por debajo del agua', () => {
  const river = ghatRiverGeometry().clone()
  river.rotateX(-Math.PI / 2)
  river.computeBoundingBox()
  expect(river.boundingBox?.max.z).toBeGreaterThan(23)
  expect(river.boundingBox?.min.z).toBeLessThan(-23)
  expect(river.boundingBox?.min.x).toBeLessThan(-23)
  expect(river.boundingBox?.max.x).toBeGreaterThan(23)
  expect(ghatTerraceGeometry().boundingBox?.min.y).toBeLessThan(-1.4)
  expect(ghatTerraceGeometry().boundingBox?.max.y).toBeCloseTo(-0.115)
  river.dispose()
})
