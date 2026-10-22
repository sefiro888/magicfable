import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, IcosahedronGeometry, Vector3 } from 'three'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'

const cache = new Map<string, BufferGeometry>()

export function ravineRockGeometry(seed: number, low: boolean) {
  const key = `rock:${seed}:${low}`, stored = cache.get(key)
  if (stored) return stored
  const rough = new IcosahedronGeometry(1, low ? 2 : 4), p = rough.getAttribute('position')
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    const fracture = Math.sin(x * 7 + y * 13 + seed) * Math.cos(z * 9 - seed) * 0.11
    const ledge = Math.sin(y * 18 + x * 1.7 + z * 2.3) * 0.06
    p.setXYZ(i, x * (1.25 + ledge) + fracture,
      (y + 1) * 0.65 + fracture * 0.18, z * (0.84 + ledge) + fracture * 0.7)
  }
  const geometry = mergeVertices(rough, 0.0001)
  rough.dispose()
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  cache.set(key, geometry)
  return geometry
}

/** Un hueso continuo, ovalado y afinado, con extremos
 * cerrados: encadenar conos dejaba uniones de juguete en la luz lateral. */
export function ancientRibGeometry(low: boolean) {
  const key = `rib:${low}`, stored = cache.get(key)
  if (stored) return stored
  const curve = new CatmullRomCurve3([
    new Vector3(-1.1, 0, 0), new Vector3(-1.32, 1.1, 0.1),
    new Vector3(-0.65, 2.25, 0.12), new Vector3(0.45, 2.8, 0),
    new Vector3(1.4, 2.55, -0.1), new Vector3(2, 1.8, -0.15),
  ])
  const segments = low ? 40 : 80, sides = low ? 12 : 20
  const frames = curve.computeFrenetFrames(segments, false)
  const positions: number[] = [], uv: number[] = [], indices: number[] = [], colors: number[] = []
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments, center = curve.getPointAt(t)
    const radius = 0.2 * Math.pow(1 - t, 0.7) + 0.055 + 0.09 * Math.exp(-Math.pow(t / 0.11, 2))
    for (let j = 0; j <= sides; j += 1) {
      const a = j / sides * Math.PI * 2
      const flute = 1 + Math.sin(a * 9 + t * 4) * 0.035 + Math.sin(t * 73 + a * 3) * 0.012
      const point = center.clone().addScaledVector(frames.normals[i]!, Math.cos(a) * radius * 1.16 * flute)
        .addScaledVector(frames.binormals[i]!, Math.sin(a) * radius * 0.84 * flute)
      positions.push(point.x, point.y, point.z)
      uv.push(j / sides, t * 5)
      const stain = 0.8 + Math.min(1, t * 6) * 0.18 + Math.sin(a * 3 + t * 29) * 0.025
      colors.push(stain, stain * 0.985, stain * 0.94)
      if (i < segments && j < sides) {
        const k = i * (sides + 1) + j
        indices.push(k, k + 1, k + sides + 1, k + 1, k + sides + 2, k + sides + 1)
      }
    }
  }
  for (const end of [0, segments]) {
    const center = curve.getPointAt(end / segments), offset = positions.length / 3
    positions.push(center.x, center.y, center.z)
    uv.push(0.5, end / segments * 5)
    colors.push(0.72, 0.7, 0.64)
    for (let j = 0; j < sides; j += 1) {
      const k = end * (sides + 1) + j
      if (end === 0) indices.push(offset, k + 1, k)
      else indices.push(offset, k, k + 1)
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  cache.set(key, geometry)
  return geometry
}
