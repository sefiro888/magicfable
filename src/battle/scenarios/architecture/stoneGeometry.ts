import { BufferGeometry, Color, ExtrudeGeometry, Float32BufferAttribute, LatheGeometry, Shape, Vector2 } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const cache = new Map<string, BufferGeometry>()
const noise = (x: number, y: number, z: number) => Math.sin(x * 29.1 + y * 53.7 + z * 17.3) * Math.cos(x * 61.7 - y * 31.9 + z * 47.1)

/** UV en unidades de piedra, no estiradas a una cara completa. Un dintel largo
 * no debe convertir el grano en rayas enormes ni cambiar de material al escalar. */
function dressStone(geometry: BufferGeometry, grainScale = 1.5, wear = true, cylinderRadius?: number) {
  const position = geometry.getAttribute('position')
  const normal = geometry.getAttribute('normal')
  const uv = geometry.getAttribute('uv')
  const colors: number[] = []
  const color = new Color()
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index)
    const y = position.getY(index)
    const z = position.getZ(index)
    const nx = Math.abs(normal.getX(index))
    const ny = Math.abs(normal.getY(index))
    const nz = Math.abs(normal.getZ(index))
    if (ny >= nx && ny >= nz) uv.setXY(index, x * grainScale, z * grainScale)
    else if (cylinderRadius !== undefined) uv.setXY(index, (Math.atan2(z, x) / (Math.PI * 2) + 0.5) * cylinderRadius * Math.PI * 2 * grainScale, y * grainScale)
    else if (nx >= nz) uv.setXY(index, z * grainScale, y * grainScale)
    else uv.setXY(index, x * grainScale, y * grainScale)
    const edge = 1 - Math.max(nx, ny, nz)
    const value = 0.91 + edge * 0.14 + noise(x * 8, y * 8, z * 8) * 0.025
    color.setRGB(value, value, value)
    colors.push(color.r, color.g, color.b)
    if (wear) {
      const chip = noise(x * 11, y * 11, z * 11) * 0.0018
      position.setXYZ(index, x + normal.getX(index) * chip, y + normal.getY(index) * chip, z + normal.getZ(index) * chip)
    }
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  position.needsUpdate = true
  uv.needsUpdate = true
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  return geometry
}

export function masonryBlockGeometry(width: number, height: number, depth: number, detail = 2): BufferGeometry {
  const key = `block:${width}:${height}:${depth}:${detail}`
  const stored = cache.get(key)
  if (stored) return stored
  // El bisel se mide en el mundo: escalar un cubo redondeado hacía que los
  // dinteles tuviesen extremos blandos y los bloques bajos parecieran jabón.
  const bevel = Math.min(0.022, width / 7, height / 7, depth / 7)
  const geometry = dressStone(new RoundedBoxGeometry(width, height, depth, detail, bevel))
  geometry.name = key
  cache.set(key, geometry)
  return geometry
}

/** Dovela cerrada y biselada. Las juntas recorren un arco real; no se dibuja
 * un círculo encima de dos cajas para fingir que existe una bóveda. */
export function archStoneGeometry(innerRadius: number, thickness: number, depth: number, segments: number): BufferGeometry {
  const key = `arch:${innerRadius}:${thickness}:${depth}:${segments}`
  const stored = cache.get(key)
  if (stored) return stored
  const shape = new Shape()
  const half = Math.PI / segments / 2 * 0.96
  const outer = innerRadius + thickness
  shape.moveTo(Math.sin(-half) * outer, Math.cos(-half) * outer)
  for (let step = 1; step <= 4; step += 1) {
    const angle = -half + step / 4 * half * 2
    shape.lineTo(Math.sin(angle) * outer, Math.cos(angle) * outer)
  }
  for (let step = 4; step >= 0; step -= 1) {
    const angle = -half + step / 4 * half * 2
    shape.lineTo(Math.sin(angle) * innerRadius, Math.cos(angle) * innerRadius)
  }
  shape.closePath()
  const geometry = new ExtrudeGeometry(shape, {
    depth, steps: 1, curveSegments: 4, bevelEnabled: true,
    bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2,
  })
  geometry.translate(0, 0, -depth / 2)
  dressStone(geometry)
  geometry.name = key
  cache.set(key, geometry)
  return geometry
}

export function flutedColumnGeometry(radius: number, height: number, broken = false): BufferGeometry {
  const key = `column:${radius}:${height}:${broken}`
  const stored = cache.get(key)
  if (stored) return stored
  const base = Math.min(0.2, height * 0.18)
  const capital = Math.min(0.21, height * 0.2)
  const profile: Vector2[] = [
    new Vector2(0, 0), new Vector2(radius * 1.45, 0),
    new Vector2(radius * 1.45, base * 0.275), new Vector2(radius * 1.3, base * 0.425),
    new Vector2(radius * 1.3, base * 0.6), new Vector2(radius * 1.08, base * 0.8),
    new Vector2(radius, base), new Vector2(radius, height * 0.23),
    new Vector2(radius * 1.025, height * 0.35), new Vector2(radius * 0.98, height * 0.58),
    new Vector2(radius * 0.92, height * 0.78),
  ]
  if (broken) {
    profile.push(new Vector2(radius * 0.9, height), new Vector2(0, height - 0.035))
  } else {
    profile.push(new Vector2(radius * 0.9, height - capital),
      new Vector2(radius * 1.06, height - capital * 0.76), new Vector2(radius * 1.2, height - capital * 0.52),
      new Vector2(radius * 1.45, height - capital * 0.33), new Vector2(radius * 1.45, height), new Vector2(0, height))
  }
  const geometry = new LatheGeometry(profile, 64)
  const position = geometry.getAttribute('position')
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index)
    const y = position.getY(index)
    const z = position.getZ(index)
    const angle = Math.atan2(z, x)
    const shaft = y > base && y < height * (broken ? 0.96 : 0.82)
    const flute = shaft ? 1 - (0.5 + Math.cos(angle * 16) * 0.5) * 0.065 : 1
    const cut = broken && y > height * 0.94
      ? Math.sin(angle * 3.1) * 0.045 + Math.cos(angle * 7.3) * 0.022 : 0
    position.setXYZ(index, x * flute, y + cut * Math.min(1, Math.hypot(x, z) / radius), z * flute)
  }
  geometry.computeVertexNormals()
  dressStone(geometry, 1.5, false, radius)
  geometry.name = key
  cache.set(key, geometry)
  return geometry
}

export function terraceGeometry(radius: number): BufferGeometry {
  const key = `terrace:${radius}`
  const stored = cache.get(key)
  if (stored) return stored
  const profile = [
    [0, -0.72], [radius - 0.25, -0.72], [radius - 0.13, -0.6],
    [radius - 0.13, -0.4], [radius + 0.04, -0.36], [radius + 0.04, -0.27],
    [radius - 0.015, -0.23], [radius - 0.015, -0.16],
    [radius + 0.05, -0.14], [radius + 0.05, -0.105], [radius, -0.075], [0, -0.075],
  ].map(([x, y]) => new Vector2(x, y))
  const geometry = dressStone(new LatheGeometry(profile, 96), 1.5, false, radius)
  geometry.name = key
  cache.set(key, geometry)
  return geometry
}

/** Estratos de roca con fracturas de distinto tamaño. El perfil pierde masa
 * por tramos; un cono regular convertía cada isla en un cucurucho perfecto. */
export function floatingCragGeometry(radius: number, depth: number, seed: number): BufferGeometry {
  const key = `crag:${radius}:${depth}:${seed}`
  const stored = cache.get(key)
  if (stored) return stored
  const sides = 36
  const rings = 8
  const vertices: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const radii = [1, 1.01, 0.88, 0.87, 0.63, 0.58, 0.28, 0.06]
  for (let row = 0; row < rings; row += 1) {
    for (let side = 0; side <= sides; side += 1) {
      const angle = side / sides * Math.PI * 2
      const fissure = Math.sin(angle * 7 + seed) * 0.07 + Math.cos(angle * 13 - seed * 2) * 0.025
      const overhang = Math.sin(angle * 3 + row * 1.7 + seed) * 0.065
      const r = radius * Math.max(0.035, radii[row]! + fissure * (1 - row / rings * 0.7) + overhang)
      const y = -0.55 - row / (rings - 1) * depth + Math.sin(angle * 9 + row) * depth * 0.018
      vertices.push(Math.cos(angle) * r, y, Math.sin(angle) * r)
      uvs.push(side / sides * radius * 4, row / (rings - 1) * depth)
      if (row < rings - 1 && side < sides) {
        const a = row * (sides + 1) + side
        const b = a + sides + 1
        indices.push(a, a + 1, b, a + 1, b + 1, b)
      }
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  dressStone(geometry, 1.5, false)
  geometry.name = key
  cache.set(key, geometry)
  return geometry
}
