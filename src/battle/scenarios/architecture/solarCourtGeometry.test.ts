import { expect, it } from 'vitest'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { solarShrineGeometry } from './solarCourtGeometry'

it('el santuario solar conserva el vano profundo y el dintel que carga sobre él', () => {
  const material = new MeshBasicMaterial()
  const shrine = new Mesh(solarShrineGeometry(), material)
  shrine.updateMatrixWorld()
  const ray = (x: number, y: number) => new Raycaster(new Vector3(x, y, 3), new Vector3(0, 0, -1)).intersectObject(shrine)
  expect(ray(0, 0.6)).toHaveLength(0)
  expect(ray(0.8, 0.6).length).toBeGreaterThan(0)
  expect(ray(0, 1.3).length).toBeGreaterThan(0)
  expect(solarShrineGeometry().boundingBox?.max.z).toBeGreaterThan(0.85)
  expect(solarShrineGeometry().boundingBox?.min.z).toBeLessThan(-0.85)
  material.dispose()
})
