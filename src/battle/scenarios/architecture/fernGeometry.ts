import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three'

const cache = new Map<boolean, BufferGeometry>()

/** Frondes pinnadas con foliolos plegados y nervio en relieve: la silueta
 * botánica evita sustituir helechos por bolas verdes. */
export function fernGeometry(low: boolean): BufferGeometry {
  const stored = cache.get(low)
  if (stored) return stored
  const positions: number[] = []
  const colors: number[] = []
  const indices: number[] = []
  const fronds = low ? 5 : 7
  const pairs = low ? 8 : 13
  const point = new Vector3()
  for (let arm = 0; arm < fronds; arm += 1) {
    const angle = arm / fronds * Math.PI * 2 + Math.sin(arm * 5.3) * 0.13
    const length = 0.87 + (Math.sin(arm * 3.7) + 1) * 0.12
    const rise = 0.47 + (Math.cos(arm * 2.9) + 1) * 0.11
    for (let segment = 0; segment < 12; segment += 1) {
      const start = positions.length / 3
      for (const [t, side] of [[segment / 12, -1], [segment / 12, 1], [(segment + 1) / 12, -1], [(segment + 1) / 12, 1]]) {
        const z = t! * length
        const x = side! * 0.005 * (1 - t! * 0.75)
        positions.push(x * Math.cos(angle) + z * Math.sin(angle), Math.sin(t! * Math.PI * 0.75) * rise,
          z * Math.cos(angle) - x * Math.sin(angle))
        colors.push(0.24, 0.34, 0.12)
      }
      indices.push(start, start + 2, start + 1, start + 1, start + 2, start + 3)
    }
    for (let pair = 0; pair < pairs; pair += 1) {
      const t = 0.12 + pair / pairs * 0.85
      const z = t * length
      const y = Math.sin(t * Math.PI * 0.75) * rise
      const leaflet = Math.pow(Math.sin(t * Math.PI), 0.7) * 0.25
      for (const side of [-1, 1]) {
        const start = positions.length / 3
        const outline = [[0, y, z], [side * leaflet * 0.42, y + 0.015, z + 0.015],
          [side * leaflet, y - 0.025, z + leaflet * 0.32],
          [side * leaflet * 0.55, y + 0.03, z + 0.063], [0, y + 0.006, z + 0.024]]
        for (let vertex = 0; vertex < outline.length; vertex += 1) {
          const position = outline[vertex]!
          point.set(position[0]!, position[1]!, position[2]!)
          const rotatedX = point.x * Math.cos(angle) + point.z * Math.sin(angle)
          const rotatedZ = point.z * Math.cos(angle) - point.x * Math.sin(angle)
          positions.push(rotatedX, point.y, rotatedZ)
          const vein = vertex === 1 || vertex === 3 ? 0.11 : 0
          const age = 0.92 + Math.sin(pair * 2.7 + arm) * 0.07
          colors.push((0.29 + vein) * age, (0.43 + vein) * age, (0.2 + vein * 0.5) * age)
        }
        indices.push(start, start + 1, start + 3, start + 1, start + 2, start + 3,
          start, start + 3, start + 4)
      }
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  cache.set(low, geometry)
  return geometry
}
