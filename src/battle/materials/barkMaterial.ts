import { DataTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, RGBAFormat, SRGBColorSpace } from 'three'

let cached: { map: DataTexture; bumpMap: DataTexture; roughnessMap: DataTexture } | undefined

/** Corteza original de roble: surcos longitudinales separados del color y
 * poro fino. El tallado naval de Fimbul no sirve como piel de un árbol vivo.
 * Los mapas de altura y rugosidad no comparten el espacio de color. */
export function barkMaps() {
  if (cached) return cached
  const size = 512
  const color = new Uint8Array(size * size * 4)
  const height = new Uint8Array(color.length)
  const roughness = new Uint8Array(color.length)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size * Math.PI * 2
      const v = y / size * Math.PI * 2
      const broad = Math.sin(u * 3 + Math.cos(v * 2) * 0.35) * 0.5 + 0.5
      const grooves = Math.pow(0.5 + 0.5 * Math.sin(u * 17 + Math.sin(v * 3 + Math.sin(u * 2)) * 0.7), 9)
      const cross = Math.pow(0.5 + 0.5 * Math.sin(v * 23 + Math.sin(u * 3) * 0.4), 20) * 0.13
      const raw = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
      const grain = raw - Math.floor(raw)
      const tone = 111 + broad * 17 - grooves * 18 - cross * 35 + grain * 24
      const i = (y * size + x) * 4
      color[i] = tone + 9
      color[i + 1] = tone + 3
      color[i + 2] = tone - 12
      height[i] = height[i + 1] = height[i + 2] = 153 - grooves * 78 - cross * 38 + grain * 12
      roughness[i] = roughness[i + 1] = roughness[i + 2] = 224 + grooves * 23
      color[i + 3] = height[i + 3] = roughness[i + 3] = 255
    }
  }
  const texture = (data: Uint8Array, isColor: boolean) => {
    const map = new DataTexture(data, size, size, RGBAFormat)
    map.colorSpace = isColor ? SRGBColorSpace : NoColorSpace
    map.wrapS = map.wrapT = RepeatWrapping
    map.magFilter = LinearFilter
    map.minFilter = LinearMipmapLinearFilter
    map.generateMipmaps = true
    map.anisotropy = 8
    map.needsUpdate = true
    return map
  }
  cached = { map: texture(color, true), bumpMap: texture(height, false), roughnessMap: texture(roughness, false) }
  return cached
}
