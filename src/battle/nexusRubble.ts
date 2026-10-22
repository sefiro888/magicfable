import { BufferGeometry, Float32BufferAttribute, Quaternion, Uint16BufferAttribute, Vector2, Vector3, Euler } from 'three'

const LAYERS = [
  { top: 0.98, bottom: 1.2, height: 0.22, y: 0.04 },
  { top: 0.62, bottom: 0.82, height: 0.3, y: 0.26 },
  { top: 0.74, bottom: 0.6, height: 0.12, y: 0.46 },
] as const
interface RubbleChunk {
  readonly centre: Vector3
  readonly destination: Vector3
  readonly rotation: Quaternion
  readonly kick: number
}
const random = (seed: number) => {
  const value = Math.sin(seed * 78.233 + 12.9898) * 43758.5453
  return value - Math.floor(value)
}

/** Celdas de fractura compactas: los triángulos largos parecían astillas de
 * madera al volcar. Los pesos rígidos mueven 30 bloques en cuatro dibujos. */
export function createNexusRubble() {
  const faces: { a: Vector3; b: Vector3; c: Vector3; bone: number; material: number }[] = []
  const chunks: RubbleChunk[] = []
  for (const [layerIndex, layer] of LAYERS.entries()) {
    const contour = Array.from({ length: 8 }, (_, index) => {
      const angle = (index + layerIndex * 2) * Math.PI / 4 + Math.PI / 8
      return new Vector2(Math.sin(angle), Math.cos(angle))
    })
    const polygons: Vector2[][] = []
    const sites = Array.from({ length: 10 }, (_, index) => {
      const angle = index * Math.PI * 2 / 7 + layerIndex * 0.8
      const radius = index < 7 ? 0.68 + random(index + 81 + layerIndex) * 0.16 : 0.22
      return new Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius)
    })
    for (const site of sites) {
      let polygon = contour.map((point) => point.clone())
      for (const other of sites) {
        if (site === other) continue
        const normal = other.clone().sub(site)
        const offset = (other.lengthSq() - site.lengthSq()) / 2
        const clipped: Vector2[] = []
        for (let index = 0; index < polygon.length; index += 1) {
          const a = polygon[index]!
          const b = polygon[(index + 1) % polygon.length]!
          const da = a.dot(normal) - offset
          const db = b.dot(normal) - offset
          if (da <= 0) clipped.push(a)
          if ((da < 0) !== (db < 0)) clipped.push(a.clone().lerp(b, da / (da - db)))
        }
        polygon = clipped
      }
      if (polygon.length >= 3) polygons.push(polygon)
    }
    for (const polygon of polygons) {
      const [a, b, c] = polygon as [Vector2, Vector2, Vector2, ...Vector2[]]
      if (b.clone().sub(a).cross(c.clone().sub(a)) > 0) polygon.reverse()
      const top = polygon.map((p) => new Vector3(p.x * layer.top, layer.y + layer.height / 2, p.y * layer.top))
      const bottom = polygon.map((p) => new Vector3(p.x * layer.bottom, layer.y - layer.height / 2, p.y * layer.bottom))
      const corners = [...top, ...bottom]
      const centre = corners.reduce((sum, p) => sum.add(p), new Vector3()).multiplyScalar(1 / corners.length)
      const index = chunks.length
      const seed = index + 1
      const rotation = new Quaternion().setFromEuler(new Euler(
        (random(seed) - 0.5) * (layerIndex === 0 ? 0.65 : 1.35),
        (random(seed + 43) - 0.5) * 0.9,
        (random(seed + 87) - 0.5) * (layerIndex === 0 ? 0.6 : 1.4),
      ))
      const reach = 0.1 + random(seed + 12) * 0.25
      const destination = centre.clone().add(new Vector3(
        centre.x * reach + (random(seed + 61) - 0.5) * 0.2,
        0,
        centre.z * reach + (random(seed + 23) - 0.5) * 0.2,
      ))
      const minY = Math.min(...corners.map((point) => point.clone().sub(centre).applyQuaternion(rotation).y))
      destination.y = -0.065 - minY + layerIndex * 0.025
      chunks.push({ centre, destination, rotation, kick: 0.1 + random(seed + 32) * 0.17 })
      const face = (p: Vector3, q: Vector3, r: Vector3, material: number) => {
        faces.push({ a: p, b: q, c: r, bone: index + 1, material })
      }
      for (let index = 1; index < polygon.length - 1; index += 1) {
        face(top[0]!, top[index]!, top[index + 1]!, layerIndex)
        face(bottom[0]!, bottom[index + 1]!, bottom[index]!, layerIndex)
      }
      for (let edge = 0; edge < polygon.length; edge += 1) {
        const next = (edge + 1) % polygon.length
        const p = polygon[edge]!
        const q = polygon[next]!
        const midpoint = p.clone().lerp(q, 0.5)
        const outer = contour.some((start, i) => {
          const end = contour[(i + 1) % contour.length]!
          return Math.abs(end.clone().sub(start).cross(midpoint.clone().sub(start))) < 0.0001
        })
        const material = outer ? layerIndex : 3
        face(top[edge]!, bottom[edge]!, bottom[next]!, material)
        face(top[edge]!, bottom[next]!, top[next]!, material)
      }
    }
  }
  faces.sort((a, b) => a.material - b.material)
  const positions: number[] = []
  const uv: number[] = []
  const bones: number[] = []
  const weights: number[] = []
  const geometry = new BufferGeometry()
  let activeMaterial = 0
  let groupStart = 0
  const append = (a: Vector3, b: Vector3, c: Vector3, bone: number, depth: number) => {
    if (depth) {
      const ab = a.clone().lerp(b, 0.5)
      const bc = b.clone().lerp(c, 0.5)
      const ca = c.clone().lerp(a, 0.5)
      append(a, ab, ca, bone, depth - 1)
      append(ab, b, bc, bone, depth - 1)
      append(ca, bc, c, bone, depth - 1)
      append(ab, bc, ca, bone, depth - 1)
      return
    }
    for (const p of [a, b, c]) {
      // El ruido depende de la posición compartida, no de la cara: no abre
      // agujeros entre la tapa y el corte al dar irregularidad a la piedra.
      const noise = (random(p.x * 9.3 + p.y * 13.7 + p.z * 17.9) - 0.5) * 0.006
      positions.push(p.x + noise, p.y + noise, p.z - noise)
      uv.push(p.x * 2 + p.y, p.z * 2 + p.y)
      bones.push(bone, 0, 0, 0)
      weights.push(1, 0, 0, 0)
    }
  }
  for (const face of faces) {
    if (face.material !== activeMaterial) {
      geometry.addGroup(groupStart, positions.length / 3 - groupStart, activeMaterial)
      activeMaterial = face.material
      groupStart = positions.length / 3
    }
    append(face.a, face.b, face.c, face.bone, 2)
  }
  geometry.addGroup(groupStart, positions.length / 3 - groupStart, activeMaterial)
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute(bones, 4))
  geometry.setAttribute('skinWeight', new Float32BufferAttribute(weights, 4))
  geometry.computeVertexNormals()
  return { geometry, chunks }
}
