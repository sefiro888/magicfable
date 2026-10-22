import { DataTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, RGBAFormat, SRGBColorSpace } from 'three'

let cached: DataTexture | undefined
const random = (x: number, y: number) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return value - Math.floor(value)
}

/** R: fracturas, G: escarcha, B: aire atrapado. Son datos independientes del
 * color: una grieta no puede convertirse en una veta blanca emisiva. */
export function iceField(): DataTexture {
  if (cached) return cached
  const size = 512
  const data = new Uint8Array(size * size * 4)
  const cells = 5
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size * cells
      const v = y / size * cells
      const cellX = Math.floor(u)
      const cellY = Math.floor(v)
      let first = Infinity
      let second = Infinity
      for (let cy = cellY - 1; cy <= cellY + 1; cy += 1) {
        for (let cx = cellX - 1; cx <= cellX + 1; cx += 1) {
          const sx = (cx + cells) % cells
          const sy = (cy + cells) % cells
          const px = cx + 0.2 + random(sx, sy) * 0.6
          const py = cy + 0.2 + random(sx + 31, sy + 17) * 0.6
          const distance = Math.hypot(u - px, v - py)
          if (distance < first) { second = first; first = distance }
          else if (distance < second) second = distance
        }
      }
      const separation = second - first
      // No rodear cada celda con una aureola: convertía el lago en adoquines.
      const continuity = Math.min(1, Math.max(0, Math.sin(u * 7 + v * 3) * 1.8 + 0.6))
      const fissure = Math.max(0, 1 - separation / 0.009) * continuity
      const frost = Math.max(0, 1 - separation / 0.045) * 0.035
        + (0.5 + 0.5 * Math.sin(u * Math.PI * 2 / cells + Math.cos(v * Math.PI * 2 / cells))) * 0.085
      const grain = random(x, y)
      const i = (y * size + x) * 4
      data[i] = fissure * 255
      data[i + 1] = Math.min(1, frost + grain * 0.07) * 255
      data[i + 2] = grain > 0.992 ? (grain - 0.992) / 0.008 * 255 : 0
      data[i + 3] = 255
    }
  }
  const texture = new DataTexture(data, size, size, RGBAFormat)
  texture.colorSpace = NoColorSpace
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.magFilter = LinearFilter
  texture.minFilter = LinearMipmapLinearFilter
  texture.generateMipmaps = true
  texture.anisotropy = 8
  texture.needsUpdate = true
  cached = texture
  return texture
}

let body: DataTexture | undefined
let snow: DataTexture | undefined
export function iceBodyMap(): DataTexture {
  if (body) return body
  const size = 256
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size * Math.PI * 2
      const v = y / size * Math.PI * 2
      const strata = Math.sin(v * 35 + Math.sin(u * 3) * 0.65)
      const broad = Math.sin(u * 3 + Math.cos(v * 2)) * 0.5 + 0.5
      const tone = broad * 22 + strata * 1.5 + random(x, y) * 14
      const i = (y * size + x) * 4
      data[i] = 141 + tone
      data[i + 1] = 166 + tone
      data[i + 2] = 180 + tone
      data[i + 3] = 255
    }
  }
  body = new DataTexture(data, size, size, RGBAFormat)
  body.colorSpace = SRGBColorSpace
  body.wrapS = body.wrapT = RepeatWrapping
  body.magFilter = LinearFilter
  body.minFilter = LinearMipmapLinearFilter
  body.generateMipmaps = true
  body.anisotropy = 8
  body.needsUpdate = true
  return body
}

/** Escarcha barrida por el viento: interrumpe la orla, en lugar de dibujar
 * un marco blanco perfectamente continuo alrededor del campo. */
export function windSnowMask(): DataTexture {
  if (snow) return snow
  const size = 128
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const noise = (frequency: number) => {
        const u = x / size * frequency
        const v = y / size * frequency
        const ix = Math.floor(u)
        const iy = Math.floor(v)
        const tx = (u - ix) * (u - ix) * (3 - 2 * (u - ix))
        const ty = (v - iy) * (v - iy) * (3 - 2 * (v - iy))
        const sample = (dx: number, dy: number) => random((ix + dx) % frequency, (iy + dy) % frequency)
        const a = sample(0, 0) * (1 - tx) + sample(1, 0) * tx
        const b = sample(0, 1) * (1 - tx) + sample(1, 1) * tx
        return a * (1 - ty) + b * ty
      }
      const field = noise(3) * 0.5 + noise(7) * 0.32 + noise(19) * 0.18
      const blend = Math.min(1, Math.max(0, (field - 0.36) / 0.24))
      const alpha = blend * blend * (3 - 2 * blend)
      const i = (y * size + x) * 4
      data[i] = data[i + 1] = data[i + 2] = alpha * 255
      data[i + 3] = 255
    }
  }
  snow = new DataTexture(data, size, size, RGBAFormat)
  snow.colorSpace = NoColorSpace
  snow.wrapS = snow.wrapT = RepeatWrapping
  snow.magFilter = snow.minFilter = LinearFilter
  snow.needsUpdate = true
  return snow
}
