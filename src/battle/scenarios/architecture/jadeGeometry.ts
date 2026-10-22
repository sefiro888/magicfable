import { BufferGeometry, ExtrudeGeometry, Float32BufferAttribute, Path, Shape } from 'three'

const cache = new Map<string, BufferGeometry>()

export function jadeRoofHeight(x: number, z: number) {
  const hip = Math.max(Math.abs(z) / 1.7, Math.max(0, (Math.abs(x) - 0.7) / 2.1))
  const edge = Math.min(1, hip)
  return Math.pow(1 - edge, 1.45) * 0.96 + Math.pow(edge, 9) * 0.19
}

/** Cuatro faldones con caballete longitudinal y alero
 * que remonta; revolucionar cuatro segmentos dejaba una pirámide de pagoda. */
export function jadeRoofGeometry(low: boolean) {
  const key = `roof:${low}`
  const stored = cache.get(key)
  if (stored) return stored
  const across = low ? 28 : 56, depth = low ? 20 : 40
  const positions: number[] = [], uv: number[] = [], indices: number[] = []
  for (let j = 0; j <= depth; j += 1) {
    for (let i = 0; i <= across; i += 1) {
      const x = (i / across * 2 - 1) * 2.8, z = (j / depth * 2 - 1) * 1.7
      positions.push(x, jadeRoofHeight(x, z), z)
      uv.push(x * 0.75, z * 0.65)
      if (i < across && j < depth) {
        const k = j * (across + 1) + i
        indices.push(k, k + across + 1, k + 1, k + 1, k + across + 1, k + across + 2)
      }
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  cache.set(key, geometry)
  return geometry
}

export function moonGateGeometry() {
  const stored = cache.get('gate')
  if (stored) return stored
  const shape = new Shape()
  shape.moveTo(-1.6, -0.1)
  shape.lineTo(1.6, -0.1)
  shape.lineTo(1.6, 2.65)
  shape.lineTo(-1.6, 2.65)
  shape.closePath()
  const hole = new Path()
  hole.absarc(0, 1.12, 1.03, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  const geometry = new ExtrudeGeometry(shape, { depth: 0.37, bevelEnabled: true,
    bevelSize: 0.035, bevelThickness: 0.025, bevelSegments: 3, curveSegments: 48 })
  geometry.translate(0, 0, -0.185)
  geometry.computeBoundingBox()
  cache.set('gate', geometry)
  return geometry
}

export function jadeTerraceGeometry() {
  const stored = cache.get('terrace')
  if (stored) return stored
  const shape = new Shape()
  const points = [[-5, -4], [-4, -5], [4, -5], [5, -4], [5, 4], [4, 5], [-4, 5], [-5, 4]] as const
  points.forEach(([x, y], i) => i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y))
  shape.closePath()
  const geometry = new ExtrudeGeometry(shape, { depth: 0.4, bevelEnabled: true,
    bevelSize: 0.04, bevelThickness: 0.025, bevelSegments: 3 })
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, -0.54, 0)
  const uv = geometry.getAttribute('uv'), p = geometry.getAttribute('position'), n = geometry.getAttribute('normal')
  for (let i = 0; i < p.count; i += 1) {
    uv.setXY(i, p.getX(i) * 0.8, (Math.abs(n.getY(i)) > 0.7 ? p.getZ(i) : p.getY(i)) * 0.8)
  }
  geometry.computeBoundingBox()
  cache.set('terrace', geometry)
  return geometry
}
