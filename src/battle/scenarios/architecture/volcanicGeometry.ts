import { BufferGeometry, Float32BufferAttribute } from 'three'

let mesa: BufferGeometry | undefined

/** El borde mínimo supera la diagonal del tablero. Los estratos continúan
 * bajo la colada, sin punta de isla flotante ni aros industriales. */
export function volcanicMesaGeometry(): BufferGeometry {
  if (mesa) return mesa
  const sides = 72
  const heights = [-0.085, -0.2, -0.62, -0.71, -1.35, -1.43, -2.85, -3.8]
  const radii = [5.85, 5.91, 5.88, 6.05, 5.99, 6.18, 6.54, 6.99]
  const vertices: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  for (let ring = 0; ring < heights.length; ring += 1) {
    for (let side = 0; side <= sides; side += 1) {
      const angle = side / sides * Math.PI * 2
      const fracture = Math.sin(angle * 7 + 0.4) * 0.22 + Math.cos(angle * 3) * 0.15
      const radius = radii[ring]! + fracture * (1 + ring * 0.2)
      const y = heights[ring]! + (ring === 0 ? 0 : Math.sin(angle * 13 + ring) * 0.045)
      vertices.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
      uvs.push(side / sides * 22, -y * 1.4)
      if (ring < heights.length - 1 && side < sides) {
        const a = ring * (sides + 1) + side
        const b = a + sides + 1
        indices.push(a, a + 1, b, a + 1, b + 1, b)
      }
    }
  }
  // UV planas independientes: las del canto estiraban los poros radialmente.
  const center = vertices.length / 3
  vertices.push(0, heights[0]!, 0)
  uvs.push(0, 0)
  for (let side = 0; side <= sides; side += 1) {
    const x = vertices[side * 3]!
    const z = vertices[side * 3 + 2]!
    vertices.push(x, heights[0]!, z)
    uvs.push(x * 0.7, z * 0.7)
    if (side < sides) indices.push(center, center + side + 2, center + side + 1)
  }
  const bottom = vertices.length / 3
  vertices.push(0, heights.at(-1)!, 0)
  uvs.push(0, 0)
  const last = (heights.length - 1) * (sides + 1)
  for (let side = 0; side < sides; side += 1) indices.push(bottom, last + side, last + side + 1)
  mesa = new BufferGeometry()
  mesa.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  mesa.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  mesa.setIndex(indices)
  mesa.computeVertexNormals()
  return mesa
}
