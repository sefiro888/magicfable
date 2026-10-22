import { DataTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, RGBAFormat, SRGBColorSpace } from 'three'

let cached: { map: DataTexture; bumpMap: DataTexture } | undefined

/** Fibra longitudinal y marcas de herramienta, sin juntas pintadas: el casco
 * ya tiene tracas físicas y no debe parecer una sola caja texturizada. */
export function timberMaps() {
  if (cached) return cached
  const width = 256
  const height = 128
  const color = new Uint8Array(width * height * 4)
  const bump = new Uint8Array(color.length)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width * Math.PI * 2
      const v = y / height * Math.PI * 2
      const fiber = Math.sin(v * 31 + Math.sin(u * 2) * 0.6 + Math.sin(v * 7) * 0.32)
      const raw = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
      const grain = raw - Math.floor(raw)
      const tone = 189 + fiber * 9 + (grain - 0.5) * 13
      const i = (y * width + x) * 4
      color[i] = tone
      color[i + 1] = tone - 9
      color[i + 2] = tone - 20
      bump[i] = bump[i + 1] = bump[i + 2] = 128 + fiber * 15 + (grain - 0.5) * 12
      color[i + 3] = bump[i + 3] = 255
    }
  }
  const texture = (data: Uint8Array, isColor: boolean) => {
    const map = new DataTexture(data, width, height, RGBAFormat)
    map.colorSpace = isColor ? SRGBColorSpace : NoColorSpace
    map.wrapS = map.wrapT = RepeatWrapping
    map.magFilter = LinearFilter
    map.minFilter = LinearMipmapLinearFilter
    map.generateMipmaps = true
    map.anisotropy = 4
    map.needsUpdate = true
    return map
  }
  cached = { map: texture(color, true), bumpMap: texture(bump, false) }
  return cached
}
