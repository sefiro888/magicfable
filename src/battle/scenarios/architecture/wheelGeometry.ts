import { ExtrudeGeometry, LatheGeometry, Path, PlaneGeometry, Shape, Vector2 } from 'three'
import type { BufferGeometry } from 'three'
import { jadeTerraceGeometry } from './jadeGeometry'

const cache = new Map<string, BufferGeometry>()

/** Los vacíos dejan ocho radios labrados unidos al
 * cubo y a la llanta; no son tablas superpuestas delante de un aro hueco. */
export function sacredWheelGeometry() {
  const cached = cache.get('wheel')
  if (cached) return cached
  const shape = new Shape()
  shape.absarc(0, 0, 1.4, 0, Math.PI * 2, false)
  for (let i = 0; i < 8; i += 1) {
    const start = i * Math.PI / 4 + 0.095, end = (i + 1) * Math.PI / 4 - 0.095
    const hole = new Path()
    hole.moveTo(Math.cos(start) * 0.34, Math.sin(start) * 0.34)
    hole.absarc(0, 0, 0.34, start, end, false)
    hole.lineTo(Math.cos(end) * 1.1, Math.sin(end) * 1.1)
    hole.absarc(0, 0, 1.1, end, start, true)
    hole.closePath()
    shape.holes.push(hole)
  }
  const geometry = new ExtrudeGeometry(shape, { depth: 0.24, bevelEnabled: true,
    bevelSize: 0.025, bevelThickness: 0.018, bevelSegments: 3, curveSegments: 48 })
  geometry.translate(0, 0, -0.12)
  const uv = geometry.getAttribute('uv'), p = geometry.getAttribute('position')
  for (let i = 0; i < p.count; i += 1) uv.setXY(i, p.getX(i) * 0.7, p.getY(i) * 0.7)
  cache.set('wheel', geometry)
  return geometry
}

export function ghatRiverGeometry() {
  const cached = cache.get('river')
  if (cached) return cached
  // El shader desvanece a radio23 antes de llegar a los bordes del plano.
  // El primer río rectangular exponía sus cuatro cantos sobre el paisaje.
  const geometry = new PlaneGeometry(48, 48)
  cache.set('river', geometry)
  return geometry
}

export function ghatTerraceGeometry() {
  const cached = cache.get('terrace')
  if (cached) return cached
  const geometry = jadeTerraceGeometry().clone(), p = geometry.getAttribute('position')
  for (let i = 0; i < p.count; i += 1) p.setY(i, -0.115 + (p.getY(i) + 0.115) * 3.2)
  const uv = geometry.getAttribute('uv'), n = geometry.getAttribute('normal')
  for (let i = 0; i < p.count; i += 1) uv.setXY(i,
    (Math.abs(n.getX(i)) > 0.7 ? p.getZ(i) : p.getX(i)) * 0.8,
    (Math.abs(n.getY(i)) > 0.7 ? p.getZ(i) : p.getY(i)) * 0.8)
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  cache.set('terrace', geometry)
  return geometry
}

export function chhatriRoofGeometry() {
  const cached = cache.get('chhatri')
  if (cached) return cached
  const profile = [[0, 1], [0.08, 0.97], [0.1, 0.83], [0.18, 0.8],
    [0.2, 0.72], [0.35, 0.68], [0.52, 0.56], [0.69, 0.39],
    [0.79, 0.22], [0.83, 0.08], [1.05, 0.05], [1.08, -0.04],
    [0.79, -0.1], [0, -0.1]]
  const geometry = new LatheGeometry(profile.map(([x, y]) => new Vector2(x, y)), 64)
  cache.set('chhatri', geometry)
  return geometry
}

export function carvedGhatColumnGeometry() {
  const cached = cache.get('column')
  if (cached) return cached
  const profile = [[0, 0], [0.2, 0], [0.2, 0.12], [0.14, 0.15],
    [0.13, 0.25], [0.11, 0.32], [0.1, 1.25], [0.14, 1.31],
    [0.16, 1.4], [0.22, 1.46], [0.22, 1.56], [0, 1.56]]
  const geometry = new LatheGeometry(profile.map(([x, y]) => new Vector2(x, y)), 24)
  cache.set('column', geometry)
  return geometry
}
