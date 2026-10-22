import { BufferGeometry, Float32BufferAttribute, MeshBasicMaterial } from 'three'
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js'

const cache = new Map<boolean, BufferGeometry>()
const blend = (a: number, b: number, width: number) => {
  const h = Math.max(width - Math.abs(a - b), 0) / width
  return Math.min(a, b) - h * h * width * 0.25
}
const limb = (x: number, y: number, z: number, ax: number, ay: number, az: number,
  bx: number, by: number, bz: number, start: number, end: number) => {
  const dx = bx - ax, dy = by - ay, dz = bz - az
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy + (z - az) * dz) / (dx * dx + dy * dy + dz * dz)))
  return Math.hypot(x - ax - dx * t, y - ay - dy * t, z - az - dz * t) - (start + (end - start) * t)
}

/** Una superficie implícita funde contrafuertes y ramas. Ocho tubos
 * superpuestos dejaban bocas abiertas, uniones cortadas y aspecto de patas. */
export function ancientOakGeometry(low: boolean) {
  const stored = cache.get(low)
  if (stored) return stored
  const size = low ? 42 : 72
  const material = new MeshBasicMaterial()
  const field = new MarchingCubes(size, material, false, false, 50000)
  field.isolation = 0
  for (let k = 0; k < size; k += 1) {
    const z = (k / size * 2 - 1) * 3.5
    for (let j = 0; j < size; j += 1) {
      const y = (j / size * 2 - 1) * 5 + 4
      for (let i = 0; i < size; i += 1) {
        const x = (i / size * 2 - 1) * 4
        const dx = x - Math.sin(y * 0.63) * 0.18
        const dz = z - Math.sin(y * 0.44) * 0.16
        const angle = Math.atan2(dz, dx)
        const radius = 1.48 - Math.max(0, y) * 0.092
          + Math.pow(Math.max(0, Math.cos(angle * 5 + 0.7)), 6) * Math.exp(-Math.max(0, y) * 0.85) * 0.8
          + Math.sin(angle * 13 + Math.sin(y * 2.3) * 0.8) * 0.035
          + Math.sin(angle * 29 - y * 1.7) * 0.012
        let distance = Math.max(Math.hypot(dx, dz) - radius, -0.7 - y, y - 8.1)
        for (let root = 0; root < 5; root += 1) {
          const a = root * 2.39996 + 0.4
          const length = 2.35 + Math.sin(root * 3.7) * 0.35
          distance = blend(distance, limb(x, y, z, Math.cos(a) * 0.6, 0.6, Math.sin(a) * 0.6,
            Math.cos(a) * length, -0.4, Math.sin(a) * length, 0.62, 0.12), 0.5)
        }
        distance = blend(distance, limb(x, y, z, -0.15, 4.5, 0, -3.1, 6.5, -0.25, 0.62, 0.17), 0.5)
        distance = blend(distance, limb(x, y, z, 0.1, 5.4, 0, 3.15, 7.2, 0.4, 0.53, 0.14), 0.45)
        // El hueco atraviesa la madera hacia el frente, conservando laterales
        // gruesos y techo curvado. No dibuja una cara ni una mancha negra.
        const hollow = (Math.hypot((x - 0.12) / 0.65, (y - 0.45) / 1.42, (z - 0.9) / 1.5) - 1) * 0.65
        distance = Math.max(distance, -hollow)
        field.field[k * size * size + j * size + i] = -distance
      }
    }
  }
  field.update()
  const used = field.geometry.drawRange.count
  const raw = field.geometry.getAttribute('position')
  const rawNormal = field.geometry.getAttribute('normal')
  const positions: number[] = [], uv: number[] = [], colors: number[] = [], normals: number[] = []
  for (let i = 0; i < used; i += 1) {
    const x = raw.getX(i) * 4, y = raw.getY(i) * 5 + 4, z = raw.getZ(i) * 3.5
    positions.push(x, y, z)
    const nx = rawNormal.getX(i) / 4, ny = rawNormal.getY(i) / 5, nz = rawNormal.getZ(i) / 3.5
    const normalLength = Math.hypot(nx, ny, nz)
    normals.push(nx / normalLength, ny / normalLength, nz / normalLength)
    uv.push((Math.atan2(z, x) / (Math.PI * 2) + 0.5) * 2, y * 0.48)
    const moss = Math.max(0, Math.sin(x * 4.2 + z * 3.7) * Math.cos(y * 2.8)) * Math.max(0, 1 - y / 2) * 0.28
    colors.push(1 - moss * 0.7, 1 - moss * 0.25, 1 - moss * 0.8)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  field.geometry.dispose()
  material.dispose()
  cache.set(low, geometry)
  return geometry
}
