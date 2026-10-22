import { DataTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RGBAFormat, SRGBColorSpace } from 'three'

let cached: { map: DataTexture; bumpMap: DataTexture; roughnessMap: DataTexture } | undefined

/** Cartuchos y cuenta radial originales; el relieve
 * vive en altura y rugosidad independientes, sin pintar resplandor en piedra. */
export function solarReliefMaps() {
  if (cached) return cached
  const size = 512, color = new Uint8Array(size * size * 4), height = new Uint8Array(color.length), rough = new Uint8Array(color.length)
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const u = (x / (size - 1) - 0.5) * 2, v = (y / (size - 1) - 0.5) * 2
    const r = Math.hypot(u, v), a = Math.atan2(v, u), sector = (a / (Math.PI * 2) + 1) * 20
    const edge = Math.min(Math.abs(r - 0.24), Math.abs(r - 0.39), Math.abs(r - 0.7), Math.abs(r - 0.88))
    const radial = Math.abs(Math.sin(a * 10))
    const cartouche = r > 0.42 && r < 0.68 && (radial < 0.07 || Math.abs(r - 0.48) < 0.009 || Math.abs(r - 0.62) < 0.009)
    const glyph = r > 0.49 && r < 0.61 && Math.abs(Math.sin(sector * Math.PI * 2 + r * 95)) < 0.11
    const core = r < 0.21 && (Math.abs(u) < 0.018 || Math.abs(v) < 0.018 || Math.abs(r - 0.14) < 0.012)
    const cut = edge < 0.009 || cartouche || glyph || core
    const mosaic = r > 0.73 && r < 0.84 && Math.sin(a * 40) > 0.2
    const grain = Math.sin(x * 123.7 + y * 279.1) * 43758.5
    const noise = grain - Math.floor(grain), i = (y * size + x) * 4
    const base = mosaic ? [75, 126, 119] : [219, 213, 193]
    color[i] = base[0]! * (cut ? 0.82 : 0.91 + noise * 0.1)
    color[i + 1] = base[1]! * (cut ? 0.82 : 0.91 + noise * 0.1)
    color[i + 2] = base[2]! * (cut ? 0.82 : 0.91 + noise * 0.1)
    height[i] = height[i + 1] = height[i + 2] = (cut ? 68 : mosaic ? 142 : 128) + noise * 12
    rough[i] = rough[i + 1] = rough[i + 2] = mosaic ? 125 + noise * 22 : 218 + noise * 20
    color[i + 3] = height[i + 3] = rough[i + 3] = 255
  }
  const make = (data: Uint8Array, srgb = false) => {
    const texture = new DataTexture(data, size, size, RGBAFormat)
    texture.colorSpace = srgb ? SRGBColorSpace : NoColorSpace
    texture.minFilter = LinearMipmapLinearFilter
    texture.magFilter = LinearFilter
    texture.generateMipmaps = true
    texture.anisotropy = 8
    texture.needsUpdate = true
    return texture
  }
  cached = { map: make(color, true), bumpMap: make(height), roughnessMap: make(rough) }
  return cached
}
