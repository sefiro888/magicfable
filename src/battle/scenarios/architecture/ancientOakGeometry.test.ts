import { expect, it } from 'vitest'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { ancientOakGeometry } from './ancientOakGeometry'

it('la cavidad del roble tiene profundidad real y conserva sus paredes en ambas calidades', () => {
  const material = new MeshBasicMaterial()
  for (const low of [false, true]) {
    const tree = new Mesh(ancientOakGeometry(low), material)
    tree.updateMatrixWorld()
    const ray = (x: number) => new Raycaster(new Vector3(x, 0.65, 4), new Vector3(0, 0, -1)).intersectObject(tree)[0]
    expect(ray(0.12)?.point.z).toBeLessThan(0)
    expect(ray(1.05)?.point.z).toBeGreaterThan(0.2)
  }
  material.dispose()
})
