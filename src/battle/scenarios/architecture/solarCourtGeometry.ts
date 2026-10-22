import { ExtrudeGeometry, Shape } from 'three'
import type { BufferGeometry } from 'three'

let shrine: BufferGeometry | undefined

/** Fachada en talud con puerta de espesor completo.
 * El vano se recorta en el contorno para no simularlo con un rectángulo negro. */
export function solarShrineGeometry() {
  if (shrine) return shrine
  const shape = new Shape()
  shape.moveTo(-1.1, 0)
  shape.lineTo(-0.35, 0)
  shape.lineTo(-0.35, 1.03)
  shape.lineTo(0.35, 1.03)
  shape.lineTo(0.35, 0)
  shape.lineTo(1.1, 0)
  shape.lineTo(0.92, 1.5)
  shape.lineTo(-0.92, 1.5)
  shape.closePath()
  const geometry = new ExtrudeGeometry(shape, { depth: 1.7, bevelEnabled: true,
    bevelSize: 0.025, bevelThickness: 0.018, bevelSegments: 3 })
  geometry.translate(0, 0, -0.85)
  const p = geometry.getAttribute('position'), n = geometry.getAttribute('normal'), uv = geometry.getAttribute('uv')
  for (let i = 0; i < p.count; i += 1) uv.setXY(i,
    Math.abs(n.getX(i)) > 0.7 ? p.getZ(i) : p.getX(i),
    Math.abs(n.getY(i)) > 0.7 ? p.getZ(i) : p.getY(i))
  geometry.computeBoundingBox()
  shrine = geometry
  return shrine
}
