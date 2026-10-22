import { describe, expect, it } from 'vitest'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { BOARD_WORLD_HALF } from '../../grid/gridCoordinates'
import { greatAnvilGeometry } from './greatAnvilGeometry'
import { volcanicMesaGeometry } from './volcanicGeometry'
import { sanctuaryIslandGeometry } from './sanctuaryIslandGeometry'

describe('apoyos y siluetas de Caldera', () => {
  it('la meseta sostiene las cuatro esquinas del tablero y muestra su canto exterior', () => {
    const material = new MeshBasicMaterial()
    const rock = new Mesh(volcanicMesaGeometry(), material)
    rock.updateMatrixWorld()
    for (const x of [-BOARD_WORLD_HALF, BOARD_WORLD_HALF]) {
      for (const z of [-BOARD_WORLD_HALF, BOARD_WORLD_HALF]) {
        const hits = new Raycaster(new Vector3(x, 1, z), new Vector3(0, -1, 0)).intersectObject(rock)
        expect(hits[0]?.point.y).toBeCloseTo(-0.085, 3)
      }
    }
    // Con el devanado invertido, el canto desaparecía visto desde fuera.
    const wall = new Raycaster(new Vector3(12, -1, 0), new Vector3(-1, 0, 0)).intersectObject(rock)
    expect(wall[0]?.point.x).toBeGreaterThan(5)
    material.dispose()
  })

  it('el hueco de la mesa está abierto y el cuerno continúa horizontalmente', () => {
    const parts = greatAnvilGeometry()
    const material = new MeshBasicMaterial()
    const table = new Mesh(parts.face, material)
    table.updateMatrixWorld()
    const down = new Vector3(0, -1, 0)
    expect(new Raycaster(new Vector3(-1.06, 2, 0), down).intersectObject(table)).toHaveLength(0)
    expect(new Raycaster(new Vector3(-1.3, 2, 0), down).intersectObject(table).length).toBeGreaterThan(0)
    parts.horn.computeBoundingBox()
    expect(parts.horn.boundingBox!.max.x).toBeGreaterThan(2.3)
    expect(parts.horn.boundingBox!.max.y).toBeCloseTo(1.62, 2)
    material.dispose()
  })
})

describe('apoyo de la isla del Santuario', () => {
  it('los recortes de la costa no dejan en el aire las esquinas del tablero', () => {
    const material = new MeshBasicMaterial()
    const island = new Mesh(sanctuaryIslandGeometry(), material)
    island.updateMatrixWorld()
    for (const x of [-BOARD_WORLD_HALF, BOARD_WORLD_HALF]) {
      for (const z of [-BOARD_WORLD_HALF, BOARD_WORLD_HALF]) {
        const hits = new Raycaster(new Vector3(x, 1, z), new Vector3(0, -1, 0)).intersectObject(island)
        expect(hits[0]?.point.y).toBeCloseTo(-0.085, 3)
      }
    }
    material.dispose()
  })
})
