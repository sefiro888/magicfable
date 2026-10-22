import { ExtrudeGeometry, Shape } from 'three'
import type { BufferGeometry } from 'three'

let cached: BufferGeometry | undefined
/** Andén irregular de esquinas cortadas: deja ver el lago sin recurrir al
 * disco ancho y sostiene las cuatro esquinas del tablero. */
export function sanctuaryIslandGeometry(): BufferGeometry {
  if (cached) return cached
  const outline = new Shape()
  const points = [[-4.9, -3.6], [-5, -1.1], [-4.87, 1.7], [-4.95, 3.75], [-3.7, 4.95],
    [-1.3, 4.86], [1.5, 4.97], [3.75, 4.9], [4.94, 3.6], [4.87, 1.2], [5.01, -1.5],
    [4.9, -3.7], [3.65, -4.93], [1.2, -4.85], [-1.6, -4.97], [-3.7, -4.9]] as const
  points.forEach(([x, y], index) => index === 0 ? outline.moveTo(x, y) : outline.lineTo(x, y))
  outline.closePath()
  const geometry = new ExtrudeGeometry(outline, { depth: 0.55, bevelEnabled: true,
    bevelSize: 0.055, bevelThickness: 0.035, bevelSegments: 3, steps: 1 })
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, -0.67, 0)
  const position = geometry.getAttribute('position')
  const normal = geometry.getAttribute('normal')
  const uv = geometry.getAttribute('uv')
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index)
    const y = position.getY(index)
    const z = position.getZ(index)
    if (Math.abs(normal.getY(index)) > 0.7) uv.setXY(index, x * 1.3, z * 1.3)
    else uv.setXY(index, (Math.abs(normal.getX(index)) > 0.7 ? z : x) * 1.3, y * 1.3)
  }
  geometry.computeBoundingBox()
  cached = geometry
  return cached
}
