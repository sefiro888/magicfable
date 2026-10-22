import { expect, it } from 'vitest'
import { DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { solarVesselGeometry } from './solarCraftGeometry'

it('el cuenco solar tiene abertura, labio y fondo interior a ambas calidades', () => {
  for (const low of [true, false]) {
    const geometry = solarVesselGeometry(low)
    const material = new MeshBasicMaterial({ side: DoubleSide })
    const mesh = new Mesh(geometry, material)
    mesh.updateMatrixWorld(true)
    const center = new Raycaster(new Vector3(0, 2, 0), new Vector3(0, -1, 0)).intersectObject(mesh)[0]
    const lip = new Raycaster(new Vector3(0.5, 2, 0), new Vector3(0, -1, 0)).intersectObject(mesh)[0]
    expect(center?.point.y).toBeCloseTo(0.125, 3)
    expect(lip?.point.y).toBeGreaterThan(0.46)
    expect(geometry.boundingBox!.max.x - geometry.boundingBox!.min.x).toBeGreaterThan(1.08)
    material.dispose()
  }
})
