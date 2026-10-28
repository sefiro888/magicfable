import { BufferGeometry, Float32BufferAttribute } from 'three'

const cache = new Map<string, { ice: BufferGeometry; snow: BufferGeometry }>()

export function glacierBankPoint(side: number, u: number, t: number): readonly [number, number, number] {
  const ridge = Math.pow(Math.sin(u * Math.PI), 0.72)
  const fracture = Math.sin(t * 21 + u * 5 + side) * 0.11
    + Math.sin(t * 43 - u * 9) * 0.045
  // Sin hundir los extremos, la cámara orbital mostraba un corte vertical
  // recto de nieve e hielo. El perfil se sumerge gradualmente en el lago.
  const endFade = Math.min(1, t / 0.15, (1 - t) / 0.15)
  const softenedEnd = endFade * endFade * (3 - 2 * endFade)
  const y = -0.86 + ridge * softenedEnd * (0.48 + 1.22 * Math.pow(1 - t, 1.3) + fracture)
  return [side * (4.85 + u * 3.1 * (1 - t * 0.46) + Math.sin(t * 13 + side) * 0.1), y, -6 + t * 10.4]
}

/** Costra del fiordo rota por presión, continua con el lago. El perfil
 * transversal y el frente erosionado sustituyen seis prismas aislados que
 * parecían bolos de plástico alrededor del campo. */
export function glacierBankGeometry(side: number, low: boolean) {
  const key = `${side}:${low}`
  const stored = cache.get(key)
  if (stored) return stored
  const across = low ? 10 : 18
  const length = low ? 32 : 64
  const vertices: number[] = []
  const uv: number[] = []
  const indices: number[] = []
  for (let z = 0; z <= length; z += 1) {
    for (let x = 0; x <= across; x += 1) {
      const point = glacierBankPoint(side, x / across, z / length)
      vertices.push(...point)
      uv.push(point[0] * 0.21, point[2] * 0.21)
      if (x < across && z < length) {
        const a = z * (across + 1) + x
        const b = a + 1
        const c = a + across + 1
        const d = c + 1
        if (side > 0) indices.push(a, c, b, b, c, d)
        else indices.push(a, b, c, b, d, c)
      }
    }
  }
  const ice = new BufferGeometry()
  ice.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  ice.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  ice.setIndex(indices)
  ice.computeVertexNormals()
  const normal = ice.getAttribute('normal')
  const caps: number[] = []
  for (let i = 0; i < vertices.length / 3; i += 1) {
    const height = Math.min(1, Math.max(0, (vertices[i * 3 + 1]! + 0.4) / 0.65))
    const slope = Math.min(1, Math.max(0, (normal.getY(i) - 0.45) / 0.5))
    // Desvanecido por vértice: recortar triángulos enteros serraba la nieve.
    caps.push(1, 1, 1, height * height * (3 - 2 * height) * slope)
  }
  const snow = new BufferGeometry()
  snow.setAttribute('position', ice.getAttribute('position').clone())
  snow.setAttribute('uv', ice.getAttribute('uv').clone())
  snow.setAttribute('color', new Float32BufferAttribute(caps, 4))
  snow.setIndex(indices)
  snow.computeVertexNormals()
  ice.computeBoundingBox()
  snow.computeBoundingBox()
  const result = { ice, snow }
  cache.set(key, result)
  return result
}
