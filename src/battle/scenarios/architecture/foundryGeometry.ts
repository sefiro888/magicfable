import { ExtrudeGeometry, Path, Shape } from 'three'
import type { BufferGeometry } from 'three'

const cache = new Map<string, BufferGeometry>()

function carve(shape: Shape, depth: number, bevel: number) {
  return new ExtrudeGeometry(shape, { depth, steps: 1, bevelEnabled: true,
    bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 24 })
}

/** Dientes y vaciados están en la silueta real: un
 * cilindro con radios pegados seguía pareciendo una rueda lisa al girar. */
export function gearGeometry(radius: number, teeth: number) {
  const key = `gear:${radius}:${teeth}`
  const stored = cache.get(key)
  if (stored) return stored
  const outline = new Shape()
  for (let tooth = 0; tooth < teeth; tooth += 1) {
    for (let corner = 0; corner < 8; corner += 1) {
      const angle = (tooth + corner / 8) / teeth * Math.PI * 2
      const r = radius * (corner >= 2 && corner <= 5 ? 1.055 : 0.945)
      const x = Math.cos(angle) * r, y = Math.sin(angle) * r
      if (tooth === 0 && corner === 0) outline.moveTo(x, y)
      else outline.lineTo(x, y)
    }
  }
  outline.closePath()
  const hub = new Path()
  hub.absarc(0, 0, radius * 0.12, 0, Math.PI * 2, true)
  outline.holes.push(hub)
  for (let sector = 0; sector < 6; sector += 1) {
    const a = sector / 6 * Math.PI * 2 + 0.12, b = (sector + 1) / 6 * Math.PI * 2 - 0.12
    const hole = new Path()
    hole.moveTo(Math.cos(a) * radius * 0.3, Math.sin(a) * radius * 0.3)
    hole.lineTo(Math.cos(a) * radius * 0.75, Math.sin(a) * radius * 0.75)
    hole.absarc(0, 0, radius * 0.75, a, b, false)
    hole.lineTo(Math.cos(b) * radius * 0.3, Math.sin(b) * radius * 0.3)
    hole.absarc(0, 0, radius * 0.3, b, a, true)
    hole.closePath()
    outline.holes.push(hole)
  }
  const geometry = carve(outline, 0.15, 0.012)
  geometry.translate(0, 0, -0.075)
  geometry.computeBoundingBox()
  cache.set(key, geometry)
  return geometry
}

export function furnaceBodyGeometry() {
  const stored = cache.get('furnace')
  if (stored) return stored
  const shape = new Shape()
  shape.moveTo(-2.55, -0.3)
  shape.lineTo(-2.55, 2.75)
  shape.lineTo(-1.8, 3.1)
  shape.lineTo(1.8, 3.1)
  shape.lineTo(2.55, 2.75)
  shape.lineTo(2.55, -0.3)
  shape.closePath()
  const mouth = new Path()
  mouth.moveTo(-0.95, -0.1)
  mouth.lineTo(0.95, -0.1)
  mouth.lineTo(0.95, 1.1)
  mouth.absarc(0, 1.1, 0.95, 0, Math.PI, false)
  mouth.closePath()
  shape.holes.push(mouth)
  const geometry = carve(shape, 1.8, 0.035)
  geometry.translate(0, 0, -0.9)
  const uv = geometry.getAttribute('uv'), position = geometry.getAttribute('position'), normal = geometry.getAttribute('normal')
  for (let i = 0; i < position.count; i += 1) {
    uv.setXY(i, (Math.abs(normal.getX(i)) > 0.7 ? position.getZ(i) : position.getX(i)) * 0.5, position.getY(i) * 0.5)
  }
  geometry.computeBoundingBox()
  cache.set('furnace', geometry)
  return geometry
}

export function furnaceArchStone(index: number) {
  const key = `arch:${index}`
  const stored = cache.get(key)
  if (stored) return stored
  const shape = new Shape()
  const a = index / 11 * Math.PI + 0.009, b = (index + 1) / 11 * Math.PI - 0.009
  shape.moveTo(Math.cos(a) * 0.97, Math.sin(a) * 0.97 + 1.1)
  shape.lineTo(Math.cos(a) * 1.23, Math.sin(a) * 1.23 + 1.1)
  shape.absarc(0, 1.1, 1.23, a, b, false)
  shape.lineTo(Math.cos(b) * 0.97, Math.sin(b) * 0.97 + 1.1)
  shape.absarc(0, 1.1, 0.97, b, a, true)
  shape.closePath()
  const geometry = carve(shape, 0.18, 0.018)
  geometry.translate(0, 0, 0.8)
  cache.set(key, geometry)
  return geometry
}

export function foundryDeckGeometry() {
  const stored = cache.get('deck')
  if (stored) return stored
  const shape = new Shape()
  const points = [[-5, -4.3], [-4.3, -5], [4.3, -5], [5, -4.3],
    [5, 4.3], [4.3, 5], [-4.3, 5], [-5, 4.3]] as const
  points.forEach(([x, y], i) => i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y))
  shape.closePath()
  const geometry = carve(shape, 0.35, 0.025)
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, -0.48, 0)
  const uv = geometry.getAttribute('uv'), position = geometry.getAttribute('position'), normal = geometry.getAttribute('normal')
  for (let i = 0; i < position.count; i += 1) {
    if (Math.abs(normal.getY(i)) > 0.7) uv.setXY(i, position.getX(i) * 0.6, position.getZ(i) * 0.6)
    else uv.setXY(i, position.getX(i) * 0.6, position.getY(i) * 0.6)
  }
  geometry.computeBoundingBox()
  cache.set('deck', geometry)
  return geometry
}
