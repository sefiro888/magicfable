import { DataTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, RGBAFormat, SRGBColorSpace } from 'three'

let cached: { map: DataTexture; bumpMap: DataTexture; roughnessMap: DataTexture } | undefined

/** Grietas capilares y mineralización propias, sin vetas de mármol que
 * conviertan el hueso antiguo en una pieza pulida de marfil nuevo. */
export function fossilBoneMaps() {
  if (cached) return cached
  const size = 256, color = new Uint8Array(size * size * 4), height = new Uint8Array(color.length), rough = new Uint8Array(color.length)
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const u = x / size * Math.PI * 2, v = y / size * Math.PI * 2
    const noise = Math.sin(x * 127.1 + y * 311.7) * 43758.5
    const grain = noise - Math.floor(noise)
    const line = Math.abs(Math.sin(u * 7 + Math.sin(v * 3) * 0.38 + Math.sin(v * 11) * 0.055))
    const crack = line < 0.019 && Math.sin(v * 2 + u * 3) > -0.35
    const stain = Math.max(0, Math.sin(u * 2 + Math.sin(v * 3)) * Math.cos(v * 2))
    const tint = 0.95 + grain * 0.05 - stain * 0.11 - (crack ? 0.25 : 0), i = (y * size + x) * 4
    color[i] = 207 * tint
    color[i + 1] = 201 * tint
    color[i + 2] = 178 * tint
    height[i] = height[i + 1] = height[i + 2] = (crack ? 74 : 132) + grain * 13
    rough[i] = rough[i + 1] = rough[i + 2] = 205 + stain * 25 + grain * 17
    color[i + 3] = height[i + 3] = rough[i + 3] = 255
  }
  const make = (data: Uint8Array, srgb = false) => {
    const texture = new DataTexture(data, size, size, RGBAFormat)
    texture.colorSpace = srgb ? SRGBColorSpace : NoColorSpace
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.magFilter = LinearFilter
    texture.minFilter = LinearMipmapLinearFilter
    texture.generateMipmaps = true
    texture.anisotropy = 8
    texture.needsUpdate = true
    return texture
  }
  cached = { map: make(color, true), bumpMap: make(height), roughnessMap: make(rough) }
  return cached
}
