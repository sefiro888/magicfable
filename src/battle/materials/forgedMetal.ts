import { DataTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, RGBAFormat, SRGBColorSpace } from 'three'

type Finish = 'iron' | 'bronze'
interface Maps { readonly map: DataTexture; readonly bumpMap: DataTexture; readonly roughnessMap: DataTexture }
const cache = new Map<Finish, Maps>()
const hash = (x: number, y: number) => {
  const raw = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return raw - Math.floor(raw)
}

/** Color, poro de fundición y aceite se separan:
 * usar una chapa naranja como relieve hinchaba el óxido como metal nuevo. */
export function forgedMetalMaps(finish: Finish): Maps {
  const stored = cache.get(finish)
  if (stored) return stored
  const size = 512
  const albedo = new Uint8Array(size * size * 4)
  const height = new Uint8Array(albedo.length), roughness = new Uint8Array(albedo.length)
  const base = finish === 'iron' ? [126, 131, 132] : [149, 118, 74]
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size * Math.PI * 2, v = y / size * Math.PI * 2
      const worked = Math.sin(u * 3 + Math.cos(v * 2) * 0.6) * Math.cos(v * 5 + Math.sin(u) * 0.2)
      const grain = hash(x, y)
      const pit = grain < 0.035 ? (0.035 - grain) / 0.035 : 0
      const scratch = Math.pow(Math.max(0, Math.sin(v * 51 + Math.sin(u * 3) * 0.45)), 28)
        * Math.pow(0.5 + Math.sin(u * 5 + v) * 0.5, 3)
      const oil = Math.max(0, Math.sin(u * 2 + v * 3) * Math.cos(v * 4 - u) - 0.45)
      const value = worked * 9 + grain * 10 - pit * 37 + scratch * 13 - oil * 20
      const i = (y * size + x) * 4
      albedo[i] = base[0]! + value
      albedo[i + 1] = base[1]! + value
      albedo[i + 2] = base[2]! + value
      height[i] = height[i + 1] = height[i + 2] = 138 + worked * 9 - pit * 40 - scratch * 13
      roughness[i] = roughness[i + 1] = roughness[i + 2] = (finish === 'iron' ? 184 : 155) + grain * 20 + pit * 22 - oil * 60
      albedo[i + 3] = height[i + 3] = roughness[i + 3] = 255
    }
  }
  const texture = (data: Uint8Array, color: boolean) => {
    const result = new DataTexture(data, size, size, RGBAFormat)
    result.colorSpace = color ? SRGBColorSpace : NoColorSpace
    result.wrapS = result.wrapT = RepeatWrapping
    result.magFilter = LinearFilter
    result.minFilter = LinearMipmapLinearFilter
    result.generateMipmaps = true
    result.anisotropy = 8
    result.needsUpdate = true
    return result
  }
  const maps = { map: texture(albedo, true), bumpMap: texture(height, false), roughnessMap: texture(roughness, false) }
  cache.set(finish, maps)
  return maps
}
