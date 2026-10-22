import { DataTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, RGBAFormat, SRGBColorSpace } from 'three'

let cached: { map: DataTexture; bumpMap: DataTexture; roughnessMap: DataTexture } | undefined
const hash = (x: number, y: number) => {
  const raw = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return raw - Math.floor(raw)
}

/** Ladrillo refractario gris tostado: el horno
 * contiene calor, no lava libre. El mortero hundido no usa el color de altura. */
export function kilnBrickMaps() {
  if (cached) return cached
  const size = 512
  const color = new Uint8Array(size * size * 4), height = new Uint8Array(color.length), roughness = new Uint8Array(color.length)
  for (let y = 0; y < size; y += 1) {
    const row = Math.floor(y / 64)
    for (let x = 0; x < size; x += 1) {
      const phase = x + (row % 2) * 64
      const bx = phase % 128, by = y % 64
      const edge = Math.min(bx, 128 - bx, by, 64 - by)
      const grain = hash(x, y), block = hash(Math.floor(phase / 128) % 4, row)
      const mortar = Math.min(1, Math.max(0, (edge - 1.5 - grain * 0.8) / 1.8))
      const worked = block * 23 + grain * 16 + Math.sin(x * 0.13 + y * 0.19) * 3
      const i = (y * size + x) * 4
      color[i] = 62 * (1 - mortar) + (113 + worked) * mortar
      color[i + 1] = 60 * (1 - mortar) + (98 + worked) * mortar
      color[i + 2] = 55 * (1 - mortar) + (83 + worked) * mortar
      height[i] = height[i + 1] = height[i + 2] = 84 + mortar * 57 + grain * 10
      roughness[i] = roughness[i + 1] = roughness[i + 2] = 232 + grain * 18
      color[i + 3] = height[i + 3] = roughness[i + 3] = 255
    }
  }
  const texture = (data: Uint8Array, isColor: boolean) => {
    const result = new DataTexture(data, size, size, RGBAFormat)
    result.colorSpace = isColor ? SRGBColorSpace : NoColorSpace
    result.wrapS = result.wrapT = RepeatWrapping
    result.magFilter = LinearFilter
    result.minFilter = LinearMipmapLinearFilter
    result.generateMipmaps = true
    result.anisotropy = 8
    result.needsUpdate = true
    return result
  }
  cached = { map: texture(color, true), bumpMap: texture(height, false), roughnessMap: texture(roughness, false) }
  return cached
}
