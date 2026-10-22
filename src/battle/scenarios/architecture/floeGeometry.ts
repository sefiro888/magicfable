import { ExtrudeGeometry, Path, Shape, ShapeGeometry } from 'three'
import type { BufferGeometry } from 'three'

const outline = [[-5.05, -3.6], [-5.18, -1.8], [-4.98, 0.3], [-5.1, 2.7], [-4.8, 3.8],
  [-3.8, 4.95], [-1.3, 5.04], [0.5, 4.91], [3.65, 5.1], [5.02, 3.7],
  [4.95, 1.5], [5.14, -0.7], [5, -3.8], [3.8, -5.04], [1, -4.92], [-3.6, -5.1]] as const
const cache = new Map<string, BufferGeometry>()

function floeShape() {
  const shape = new Shape()
  outline.forEach(([x, z], index) => index === 0 ? shape.moveTo(x, z) : shape.lineTo(x, z))
  shape.closePath()
  return shape
}

/** La placa cortada sostiene las cuatro esquinas. El antiguo disco cabía en
 * el ancho del tablero, pero no bajo su diagonal. La nieve solo ocupa la orla. */
export function floeGeometry(part: 'body' | 'surface' | 'snow'): BufferGeometry {
  const stored = cache.get(part)
  if (stored) return stored
  const shape = floeShape()
  let geometry: BufferGeometry
  if (part === 'surface') {
    geometry = new ShapeGeometry(shape)
  } else {
    if (part === 'snow') {
      const hole = new Path()
      // El hueco preserva tanto las cartas como el borde exterior del tablero.
      hole.moveTo(-4.06, -4.06)
      hole.lineTo(-4.06, 4.06)
      hole.lineTo(4.06, 4.06)
      hole.lineTo(4.06, -4.06)
      hole.closePath()
      shape.holes.push(hole)
    }
    geometry = new ExtrudeGeometry(shape, { depth: part === 'body' ? 0.6 : 0.075,
      bevelEnabled: true, bevelSize: part === 'body' ? 0.035 : 0.07,
      bevelThickness: 0.025, bevelSegments: 3, steps: 1 })
    geometry.rotateX(-Math.PI / 2)
    geometry.translate(0, part === 'body' ? -0.75 : -0.125, 0)
    const position = geometry.getAttribute('position')
    const normal = geometry.getAttribute('normal')
    const uv = geometry.getAttribute('uv')
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i)
      const y = position.getY(i)
      const z = position.getZ(i)
      const edge = Math.abs(normal.getY(i)) < 0.7
      uv.setXY(i, (edge && Math.abs(normal.getX(i)) > 0.7 ? z : x) * 0.35, (edge ? y * 3 : z) * 0.35)
    }
  }
  geometry.computeBoundingBox()
  cache.set(part, geometry)
  return geometry
}
