import { expect, it } from 'vitest'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { ancientRibGeometry } from './bestiaryGeometry'

it('la costilla conserva volumen curvo y extremos cerrados en ambas calidades', () => {
  const material = new MeshBasicMaterial()
  for (const low of [false, true]) {
    const geometry = ancientRibGeometry(low), rib = new Mesh(geometry, material)
    rib.updateMatrixWorld()
    // Mirar desde debajo de la base debe encontrar su cierre en la cota del
    // extremo, antes del arco alto: un tubo abierto dejaría pasar ese rayo.
    const hit = new Raycaster(new Vector3(-1.1, -1, 0), new Vector3(0, 1, 0)).intersectObject(rib)[0]
    expect(hit).toBeDefined()
    expect(hit!.point.y).toBeLessThan(0.25)
    expect(geometry.boundingBox?.max.y).toBeGreaterThan(2.7)
    expect(geometry.boundingBox?.max.y).toBeLessThan(3)
    expect(geometry.boundingBox?.max.x).toBeGreaterThan(1.9)
  }
  material.dispose()
})
