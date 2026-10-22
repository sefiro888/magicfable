import { CanvasTexture, SRGBColorSpace } from 'three'

let sky: CanvasTexture | undefined
const clamp = (value: number) => Math.min(1, Math.max(0, value))
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t) }
const hash = (x: number, y: number) => {
  const value = Math.sin(x * 127.1 + y * 311.7 + 79.3) * 43758.5453
  return value - Math.floor(value)
}
function noise(u: number, v: number, scale: number) {
  const x = u * scale
  const y = v * scale
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const at = (dx: number, dy: number) => hash(((ix + dx) % scale + scale) % scale, iy + dy)
  return mix(mix(at(0, 0), at(1, 0), smooth(x - ix)), mix(at(0, 1), at(1, 1), smooth(x - ix)), smooth(y - iy))
}

/** Mar de nubes horneado una vez. El relieve del banco procede de un campo
 * coherente y luz lateral; no hay ruido costoso a pantalla completa por frame.
 * La mitad inferior se pinta también: la cámara mira hacia el vacío, no al cénit. */
export function citadelSkyTexture() {
  if (sky) return sky
  const width = 512
  const height = 256
  const field = new Float32Array(width * height)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width
      const v = y / height
      field[y * width + x] = noise(u, v, 12) * 0.53 + noise(u, v, 24) * 0.26
        + noise(u, v, 48) * 0.14 + noise(u, v, 96) * 0.07
    }
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')!
  const image = context.createImageData(width, height)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width
      const v = y / height
      const amount = field[y * width + x]!
      const horizon = Math.exp(-Math.pow((v - 0.51) / 0.09, 2))
      const sunlight = Math.pow((Math.cos((u - 0.7) * Math.PI * 2) + 1) / 2, 4)
      const below = smooth((v - 0.52) * 7)
      const density = smooth((amount - 0.38) * 5) * below
      const gradient = field[y * width + (x + width - 3) % width]! - amount
      const lit = clamp(0.72 + gradient * 6 + (amount - 0.5) * 0.55)
      const base = [mix(75, 126, smooth(v * 2)), mix(99, 154, smooth(v * 2)), mix(134, 179, smooth(v * 2))]
      const cloud = [mix(98, 229, lit), mix(121, 231, lit), mix(151, 231, lit)]
      const offset = (y * width + x) * 4
      for (let channel = 0; channel < 3; channel += 1) {
        const warmth = [35, 16, -7][channel]!
        image.data[offset + channel] = clamp((mix(base[channel]!, cloud[channel]!, density)
          + horizon * sunlight * warmth + below * sunlight * [10, 5, -3][channel]!) / 255) * 255
      }
      image.data[offset + 3] = 255
    }
  }
  context.putImageData(image, 0, 0)
  sky = new CanvasTexture(canvas)
  sky.colorSpace = SRGBColorSpace
  return sky
}
