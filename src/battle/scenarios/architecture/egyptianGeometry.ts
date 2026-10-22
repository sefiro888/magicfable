import { ExtrudeGeometry, LatheGeometry, Shape, Vector2 } from 'three'
import type { BufferGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const cache = new Map<string, BufferGeometry>()

function physicalUV(geometry: BufferGeometry) {
  const position = geometry.getAttribute('position')
  const normal = geometry.getAttribute('normal')
  const uv = geometry.getAttribute('uv')
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index)
    const y = position.getY(index)
    const z = position.getZ(index)
    const nx = Math.abs(normal.getX(index))
    const ny = Math.abs(normal.getY(index))
    const nz = Math.abs(normal.getZ(index))
    if (ny >= nx && ny >= nz) uv.setXY(index, x * 1.1, z * 1.1)
    else uv.setXY(index, (nx >= nz ? z : x) * 1.1, y * 1.1)
  }
  geometry.computeBoundingBox()
  return geometry
}

/** El talud conserva caras inclinadas reales: los relieves siguen ese plano
 * para que no floten al orbitar alrededor del Tribunal. */
export function pylonGeometry(width: number, height: number, depth: number): BufferGeometry {
  const key = `pylon:${width}:${height}:${depth}`
  const cached = cache.get(key)
  if (cached) return cached
  const geometry = new RoundedBoxGeometry(width, height, depth, 5, 0.025)
  const position = geometry.getAttribute('position')
  for (let index = 0; index < position.count; index += 1) {
    const y = position.getY(index) + height / 2
    const taper = 1 - y / height * 0.18
    position.setXYZ(index, position.getX(index) * taper, y, position.getZ(index) * taper)
  }
  geometry.computeVertexNormals()
  physicalUV(geometry)
  cache.set(key, geometry)
  return geometry
}

export function cavettoGeometry(width: number, depth: number, height = 0.34): BufferGeometry {
  const key = `cavetto:${width}:${depth}:${height}`
  const cached = cache.get(key)
  if (cached) return cached
  const section = new Shape()
  section.moveTo(-depth / 2, 0)
  section.lineTo(depth / 2, 0)
  section.lineTo(depth / 2, height * 0.12)
  section.quadraticCurveTo(depth / 2 + height * 0.03, height * 0.58, depth / 2 + height * 0.5, height * 0.88)
  section.lineTo(depth / 2 + height * 0.59, height)
  section.lineTo(-depth / 2 - height * 0.22, height)
  section.closePath()
  const geometry = new ExtrudeGeometry(section, { depth: width, steps: 1, curveSegments: 12,
    bevelEnabled: true, bevelSize: 0.009, bevelThickness: 0.009, bevelSegments: 2 })
  geometry.rotateY(-Math.PI / 2)
  geometry.translate(width / 2, 0, 0)
  physicalUV(geometry)
  cache.set(key, geometry)
  return geometry
}

/** Perfil papiriforme: cuello ceñido, cáliz cóncavo y labio. Evita sustituir
 * un capitel egipcio por una columna griega recoloreada o un cono invertido. */
export function papyrusCapitalGeometry(radius: number, height: number): BufferGeometry {
  const key = `papyrus:${radius}:${height}`
  const cached = cache.get(key)
  if (cached) return cached
  const profile = [[0, 0], [radius * 0.59, 0], [radius * 0.6, height * 0.16],
    [radius * 0.64, height * 0.3], [radius * 0.75, height * 0.5], [radius * 0.92, height * 0.7],
    [radius, height * 0.87], [radius * 1.025, height * 0.94], [radius, height], [0, height]]
  const geometry = new LatheGeometry(profile.map(([r, y]) => new Vector2(r!, y!)), 64)
  const position = geometry.getAttribute('position')
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index)
    const z = position.getZ(index)
    const y = position.getY(index)
    const angle = Math.atan2(z, x)
    const petal = 1 - (0.5 + Math.cos(angle * 12) * 0.5) * 0.035 * Math.sin(y / height * Math.PI)
    position.setXYZ(index, x * petal, y, z * petal)
  }
  geometry.computeVertexNormals()
  physicalUV(geometry)
  cache.set(key, geometry)
  return geometry
}

export function bundledShaftGeometry(radius: number, height: number): BufferGeometry {
  const key = `bundle:${radius}:${height}`
  const cached = cache.get(key)
  if (cached) return cached
  const profile = [[0, 0], [radius * 1.12, 0], [radius * 1.12, 0.12], [radius, 0.19],
    [radius, height * 0.3], [radius * 0.98, height * 0.7], [radius * 0.91, height], [0, height]]
  const geometry = new LatheGeometry(profile.map(([r, y]) => new Vector2(r!, y!)), 64)
  const position = geometry.getAttribute('position')
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index)
    const y = position.getY(index)
    const z = position.getZ(index)
    const bundle = y > 0.19 && y < height * 0.97 ? 1 + Math.cos(Math.atan2(z, x) * 8) * 0.035 : 1
    position.setXYZ(index, x * bundle, y, z * bundle)
  }
  geometry.computeVertexNormals()
  physicalUV(geometry)
  cache.set(key, geometry)
  return geometry
}
