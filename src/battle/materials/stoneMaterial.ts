import { CanvasTexture, NoColorSpace, RepeatWrapping, SRGBColorSpace } from 'three'

export type StoneFinish = 'marble' | 'limestone' | 'basalt' | 'sandstone'

interface StoneMaps {
  readonly map: CanvasTexture
  readonly bumpMap: CanvasTexture
  readonly roughnessMap: CanvasTexture
}

const cache = new Map<StoneFinish, StoneMaps>()
const SIZE = 512
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (value: number) => value * value * (3 - 2 * value)
const clamp = (value: number) => Math.min(1, Math.max(0, value))
const hash = (x: number, y: number, seed: number) => {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 43.2) * 43758.5453
  return value - Math.floor(value)
}

/** Ruido periódico: el relieve continúa entre bloques sin costuras claras en
 * cada repetición. Las vetas largas y los poros usan escalas independientes. */
function noise(u: number, v: number, frequency: number, seed: number) {
  const x = u * frequency
  const y = v * frequency
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const sample = (dx: number, dy: number) => hash(((ix + dx) % frequency + frequency) % frequency, ((iy + dy) % frequency + frequency) % frequency, seed)
  return mix(mix(sample(0, 0), sample(1, 0), smooth(x - ix)), mix(sample(0, 1), sample(1, 1), smooth(x - ix)), smooth(y - iy))
}

function texture(pixels: Uint8ClampedArray, color: boolean) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const context = canvas.getContext('2d')
  if (!context) throw new Error('No se pudo generar el material de piedra.')
  const image = context.createImageData(SIZE, SIZE)
  image.data.set(pixels)
  context.putImageData(image, 0, 0)
  const result = new CanvasTexture(canvas)
  result.wrapS = result.wrapT = RepeatWrapping
  result.colorSpace = color ? SRGBColorSpace : NoColorSpace
  result.anisotropy = 4
  return result
}

/** Mapas propios de color, microrelieve y rugosidad. Una veta de mármol es una
 * inclusión mineral, no una grieta negra; no se convierte en un surco profundo. */
export function stoneMaps(finish: StoneFinish): StoneMaps {
  const stored = cache.get(finish)
  if (stored) return stored
  const albedo = new Uint8ClampedArray(SIZE * SIZE * 4)
  const height = new Uint8ClampedArray(albedo.length)
  const roughness = new Uint8ClampedArray(albedo.length)
  const seed = { marble: 17, limestone: 29, basalt: 41, sandstone: 53 }[finish]
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const u = x / SIZE
      const v = y / SIZE
      const broad = noise(u, v, 4, seed)
      const medium = noise(u, v, 16, seed + 1)
      const grain = noise(u, v, 128, seed + 2)
      const fine = hash(x, y, seed + 3)
      let value: number
      let relief: number
      let matte: number
      let warmth: number
      if (finish === 'marble') {
        const bend = noise(u, v, 8, seed + 4)
        const vein = Math.pow(1 - Math.abs(Math.sin(Math.PI * 2 * (u * 2 + v + (broad - 0.5) * 0.24 + (bend - 0.5) * 0.06))), 40)
        value = 0.89 + broad * 0.07 - vein * (0.055 + medium * 0.05) + (grain - 0.5) * 0.025
        relief = 0.53 + (grain - 0.5) * 0.15 + (fine - 0.5) * 0.035 - vein * 0.035
        matte = 0.62 + broad * 0.12 + vein * 0.09
        warmth = vein * 0.012
      } else if (finish === 'limestone') {
        const pore = Math.pow(clamp((0.35 - grain) / 0.35), 3)
        value = 0.8 + broad * 0.1 + (medium - 0.5) * 0.055 - pore * 0.16
        relief = 0.56 + (medium - 0.5) * 0.09 + (grain - 0.5) * 0.13 - pore * 0.3
        matte = 0.91 - pore * 0.08
        warmth = 0.023
      } else if (finish === 'basalt') {
        const crystal = Math.pow(clamp((grain - 0.6) / 0.4), 3)
        value = 0.65 + broad * 0.1 + (grain - 0.5) * 0.13 + crystal * 0.13
        relief = 0.5 + (medium - 0.5) * 0.16 + (grain - 0.5) * 0.3
        matte = 0.9 - crystal * 0.28
        warmth = -0.008
      } else {
        const bedding = Math.sin(Math.PI * 2 * (v * 14 + (noise(u, v, 4, seed + 5) - 0.5) * 0.7))
        value = 0.79 + broad * 0.1 + bedding * 0.03 + (grain - 0.5) * 0.07
        relief = 0.5 + bedding * 0.06 + (grain - 0.5) * 0.2 + (fine - 0.5) * 0.07
        matte = 0.94 + (medium - 0.5) * 0.06
        warmth = 0.04
      }
      const offset = (y * SIZE + x) * 4
      albedo[offset] = clamp(value + warmth) * 255
      albedo[offset + 1] = clamp(value) * 255
      albedo[offset + 2] = clamp(value - warmth) * 255
      height.fill(clamp(relief) * 255, offset, offset + 3)
      roughness.fill(clamp(matte) * 255, offset, offset + 3)
      albedo[offset + 3] = height[offset + 3] = roughness[offset + 3] = 255
    }
  }
  const maps = { map: texture(albedo, true), bumpMap: texture(height, false), roughnessMap: texture(roughness, false) }
  cache.set(finish, maps)
  return maps
}
