import { BufferGeometry, ExtrudeGeometry, Float32BufferAttribute, Path, Shape } from 'three'
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'

const cache = new Map<string, BufferGeometry>()

export function shoreRadius(angle: number) {
  const c = Math.abs(Math.cos(angle)), s = Math.abs(Math.sin(angle))
  return 5.18 / Math.pow(c ** 5 + s ** 5, 0.2)
    * (1 + Math.sin(angle * 7 + 0.4) * 0.022 + Math.sin(angle * 13 - 0.7) * 0.012)
}

function worldUv(geometry: BufferGeometry) {
  const p = geometry.getAttribute('position'), n = geometry.getAttribute('normal'), uv = geometry.getAttribute('uv')
  for (let i = 0; i < p.count; i += 1) {
    if (Math.abs(n.getY(i)) > 0.7) uv.setXY(i, p.getX(i), p.getZ(i))
    else uv.setXY(i, Math.abs(n.getX(i)) > 0.7 ? p.getZ(i) : p.getX(i), p.getY(i))
  }
  geometry.computeBoundingBox()
  return geometry
}

/** Estratos bajos e irregulares, con una superficie que sostiene la diagonal.
 * La forma cuadrada erosionada relaciona las losas con la geología, sin otro
 * disco flotante ni un aro de espuma geométrico. */
export function shoreShelfGeometry(layer: number) {
  const key = `shelf:${layer}`
  const stored = cache.get(key)
  if (stored) return stored
  const shape = new Shape()
  for (let i = 0; i < 96; i += 1) {
    const a = i / 96 * Math.PI * 2
    const radius = shoreRadius(a) + layer * 0.16 + Math.sin(a * 19 + layer) * layer * 0.025
    const x = Math.cos(a) * radius, y = Math.sin(a) * radius
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  const geometry = new ExtrudeGeometry(shape, { depth: 0.31, bevelEnabled: true,
    bevelSize: 0.035, bevelThickness: 0.02, bevelSegments: 2, steps: 1 })
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(layer * 0.035, -0.435 - layer * 0.285, layer * -0.02)
  worldUv(geometry)
  cache.set(key, geometry)
  return geometry
}

export function shoreFoamGeometry(low: boolean) {
  const key = `foam:${low}`
  const stored = cache.get(key)
  if (stored) return stored
  const positions: number[] = [], uv: number[] = [], indices: number[] = []
  const segments = low ? 96 : 192
  for (let i = 0; i <= segments; i += 1) {
    const angle = i / segments * Math.PI * 2
    for (let ring = 0; ring <= 1; ring += 1) {
      const radius = shoreRadius(angle) + 0.22 + ring * 2.05
      positions.push(Math.cos(angle) * radius, -0.745, Math.sin(angle) * radius)
      uv.push(i / segments, ring)
    }
    if (i < segments) {
      const k = i * 2
      indices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3)
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  cache.set(key, geometry)
  return geometry
}

export function seaArchGeometry() {
  const stored = cache.get('arch')
  if (stored) return stored
  const shape = new Shape()
  shape.moveTo(-1.85, -0.4)
  shape.lineTo(-1.68, 0.5)
  shape.lineTo(-1.82, 1.1)
  shape.lineTo(-1.46, 1.5)
  shape.lineTo(-1.53, 2.35)
  shape.lineTo(-0.98, 2.63)
  shape.lineTo(-0.62, 2.55)
  shape.lineTo(-0.19, 2.82)
  shape.lineTo(0.24, 2.65)
  shape.lineTo(0.85, 2.72)
  shape.lineTo(1.48, 2.3)
  shape.lineTo(1.37, 1.65)
  shape.lineTo(1.69, 1.18)
  shape.lineTo(1.52, 0.56)
  shape.lineTo(1.82, -0.4)
  shape.closePath()
  const opening = new Path()
  opening.moveTo(-0.7, -0.18)
  opening.lineTo(0.77, -0.18)
  opening.bezierCurveTo(0.68, 0.3, 0.75, 0.96, 0.52, 1.34)
  opening.bezierCurveTo(0.25, 1.86, -0.27, 1.88, -0.58, 1.34)
  opening.bezierCurveTo(-0.83, 0.89, -0.63, 0.32, -0.7, -0.18)
  shape.holes.push(opening)
  const raw = new ExtrudeGeometry(shape, { depth: 1.14, bevelEnabled: true,
    bevelSize: 0.09, bevelThickness: 0.065, bevelSegments: 3, curveSegments: 16 })
  raw.translate(0, 0, -0.57)
  // Subdividir antes de erosionar rompe la pared plana del extruido sin
  // deformar solo su contorno: ese contorno parecía una pieza de puzle.
  let geometry: BufferGeometry = new TessellateModifier(0.3, 5).modify(raw)
  raw.dispose()
  const position = geometry.getAttribute('position')
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i), y = position.getY(i), z = position.getZ(i)
    const rock = Math.sin(x * 3.7 + Math.sin(y * 4.1) * 0.8) * 0.065
      + Math.sin(y * 17 + x * 1.3) * 0.026
      + Math.sin(x * 11.1 + y * 7.3 + z * 4.7) * 0.018
    position.setXYZ(i, x + Math.sin(y * 4.7 + z * 2.3) * 0.055,
      y + Math.sin(x * 5.3 + z) * 0.035, z + rock * (z > 0 ? 1 : -1))
  }
  geometry.deleteAttribute('normal')
  const welded = mergeVertices(geometry, 0.0001)
  geometry.dispose()
  geometry = welded
  geometry.computeVertexNormals()
  worldUv(geometry)
  cache.set('arch', geometry)
  return geometry
}

export function beaconRibGeometry() {
  const stored = cache.get('rib')
  if (stored) return stored
  const shape = new Shape()
  shape.moveTo(0.91, 0)
  shape.bezierCurveTo(0.93, 0.9, 0.48, 1.5, 0.57, 2.2)
  shape.bezierCurveTo(0.58, 2.56, 0.68, 2.86, 0.8, 3.08)
  shape.quadraticCurveTo(0.57, 2.99, 0.45, 2.63)
  shape.bezierCurveTo(0.14, 1.77, 0.62, 1.1, 0.6, 0)
  shape.closePath()
  const geometry = new ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: true,
    bevelSize: 0.045, bevelThickness: 0.045, bevelSegments: 3, curveSegments: 24 })
  geometry.translate(0, 0, -0.08)
  worldUv(geometry)
  cache.set('rib', geometry)
  return geometry
}
