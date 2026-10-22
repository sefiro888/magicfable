import { Color, Float32BufferAttribute } from 'three'
import type { BufferGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const stones = new Map<string, BufferGeometry>()

export function megalithFaceProfile(t: number, width: number, depth: number, seed: number) {
  return {
    taper: 0.96 - t * 0.22 + Math.sin(t * 8 + seed) * 0.14 + Math.sin(t * 19 + seed) * 0.035,
    driftX: Math.sin(t * 5.1 + seed) * width * 0.08,
    driftZ: Math.cos(t * 6.3 - seed) * depth * 0.04,
  }
}

/** Granito tallado y erosionado, apoyado en y=0. El perfil compartido evita
 * que los grabados floten delante de la piedra; el desgaste más acusado se
 * concentra en aristas y coronación para conservar la lectura de las runas. */
export function megalithGeometry(width: number, height: number, depth: number, seed: number, broken = false): BufferGeometry {
  const key = `${width}:${height}:${depth}:${seed}:${broken}`
  const cached = stones.get(key)
  if (cached) return cached
  const geometry = new RoundedBoxGeometry(width, height, depth, 5, Math.min(width, height, depth) * 0.085)
  const positions = geometry.getAttribute('position')
  const normals = geometry.getAttribute('normal')
  const uv = geometry.getAttribute('uv')
  const colors: number[] = []
  const color = new Color()
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index)
    const y = positions.getY(index)
    const z = positions.getZ(index)
    const t = (y + height / 2) / height
    const edge = Math.max(Math.abs(x) / (width / 2), Math.abs(z) / (depth / 2))
    const grain = Math.sin(x * 17.3 + y * 9.7 + seed) * Math.cos(z * 23.9 - y * 13.1 + seed)
    const nx = Math.abs(normals.getX(index))
    const ny = Math.abs(normals.getY(index))
    const nz = Math.abs(normals.getZ(index))
    if (ny >= nx && ny >= nz) uv.setXY(index, x * 1.4, z * 1.4)
    else if (nx >= nz) uv.setXY(index, z * 1.4, y * 1.4)
    else uv.setXY(index, x * 1.4, y * 1.4)
    const chip = Math.max(0, edge - 0.75) * (0.03 + (grain + 1) * 0.035)
    const { taper, driftX, driftZ } = megalithFaceProfile(t, width, depth, seed)
    const crown = t > 0.83 ? (t - 0.83) / 0.17 : 0
    const cut = crown * (Math.sin(x * 7 + seed) * 0.15 + Math.cos(z * 11 - seed) * 0.1 - Math.max(0, Math.sin(x * 13 + z * 9 + seed)) * 0.06)
      + (broken ? crown * (x / width * 0.18 + z / depth * 0.16) * Math.min(height, 1.4) : 0)
    positions.setXYZ(index, x * taper + driftX - normals.getX(index) * chip,
      y + height / 2 + cut - normals.getY(index) * chip, z * taper + driftZ - normals.getZ(index) * chip)
    const damp = Math.max(0, 1 - t / 0.32) * 0.24
    const moss = Math.max(0, Math.sin(x * 8 + seed) * Math.cos(z * 9 - t * 7)) * Math.max(0, 0.65 - t) * 0.38
    const shade = 0.88 - damp + grain * 0.035
    color.setRGB(shade - moss * 0.6, shade + moss * 0.2, shade - moss * 0.5)
    colors.push(color.r, color.g, color.b)
  }
  positions.needsUpdate = true
  uv.needsUpdate = true
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  stones.set(key, geometry)
  return geometry
}
