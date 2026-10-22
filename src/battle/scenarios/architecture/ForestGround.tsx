import { DataTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, PlaneGeometry, RepeatWrapping, RGBAFormat, SRGBColorSpace } from 'three'
import type { GraphicsQuality } from '../../../store/preferences'

const smooth = (a: number, b: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
export function forestGroundHeight(x: number, z: number) {
  const terrace = 1 - smooth(3.95, 5.6, Math.max(Math.abs(x), Math.abs(z)))
  const earth = Math.sin(x * 0.77 + Math.cos(z * 0.4) * 0.15) * Math.cos(z * 0.9) * 0.08
  return -0.64 + terrace * 0.555 + earth * (1 - terrace)
}

const geometries = new Map<boolean, PlaneGeometry>()
export function forestGroundGeometry(low: boolean) {
  const stored = geometries.get(low)
  if (stored) return stored
  const ground = new PlaneGeometry(32, 32, low ? 64 : 128, low ? 64 : 128)
  ground.rotateX(-Math.PI / 2)
  const position = ground.getAttribute('position')
  const uv = ground.getAttribute('uv')
  const mask = uv.clone()
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index)
    const z = position.getZ(index)
    position.setY(index, forestGroundHeight(x, z))
    uv.setXY(index, x * 0.2, z * 0.2)
    mask.setXY(index, x / 32 + 0.5, z / 32 + 0.5)
  }
  ground.setAttribute('uv1', mask)
  ground.computeVertexNormals()
  ground.computeBoundingBox()
  geometries.set(low, ground)
  return ground
}

let maps: { color: DataTexture; height: DataTexture; roughness: DataTexture; edge: DataTexture } | undefined
const hash = (x: number, y: number) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return value - Math.floor(value)
}
function noise(u: number, v: number, frequency: number) {
  const x = u * frequency
  const y = v * frequency
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const tx = smooth(0, 1, x - ix)
  const ty = smooth(0, 1, y - iy)
  const sample = (dx: number, dy: number) => hash((ix + dx) % frequency, (iy + dy) % frequency)
  const a = sample(0, 0) * (1 - tx) + sample(1, 0) * tx
  const b = sample(0, 1) * (1 - tx) + sample(1, 1) * tx
  return a * (1 - ty) + b * ty
}
function soilMaps() {
  if (maps) return maps
  const size = 512
  const color = new Uint8Array(size * size * 4)
  const height = new Uint8Array(color.length)
  const roughness = new Uint8Array(color.length)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size
      const v = y / size
      const broad = noise(u, v, 4)
      const grain = hash(x, y)
      const medium = noise(u, v, 16)
      const moss = Math.max(0, noise(u, v, 8) - 0.55) * 0.7
      const tone = 60 + broad * 12 + medium * 14 + grain * 15
      const leaf = grain > 0.985 ? (grain - 0.985) / 0.015 : 0
      const i = (y * size + x) * 4
      color[i] = tone + 12 - moss * 20 + leaf * 30
      color[i + 1] = tone - 3 + moss * 8 + leaf * 21
      color[i + 2] = tone - 13 - moss * 5 + leaf * 8
      height[i] = height[i + 1] = height[i + 2] = 128 + (medium - 0.5) * 35 + grain * 14 + leaf * 9
      roughness[i] = roughness[i + 1] = roughness[i + 2] = 242 - moss * 18
      color[i + 3] = height[i + 3] = roughness[i + 3] = 255
    }
  }
  const make = (data: Uint8Array, isColor: boolean) => {
    const texture = new DataTexture(data, size, size, RGBAFormat)
    texture.colorSpace = isColor ? SRGBColorSpace : NoColorSpace
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.magFilter = LinearFilter
    texture.minFilter = LinearMipmapLinearFilter
    texture.generateMipmaps = true
    texture.anisotropy = 4
    texture.needsUpdate = true
    return texture
  }
  const edgeSize = 128
  const data = new Uint8Array(edgeSize * edgeSize * 4)
  for (let y = 0; y < edgeSize; y += 1) {
    for (let x = 0; x < edgeSize; x += 1) {
      const radius = Math.hypot(x / (edgeSize - 1) * 2 - 1, y / (edgeSize - 1) * 2 - 1)
      const i = (y * edgeSize + x) * 4
      data[i] = data[i + 1] = data[i + 2] = (1 - smooth(0.65, 1, radius)) * 255
      data[i + 3] = 255
    }
  }
  const edge = new DataTexture(data, edgeSize, edgeSize, RGBAFormat)
  edge.channel = 1
  edge.colorSpace = NoColorSpace
  edge.magFilter = edge.minFilter = LinearFilter
  edge.needsUpdate = true
  maps = { color: make(color, true), height: make(height, false), roughness: make(roughness, false), edge }
  return maps
}

/** El pavimento hundido queda sostenido por una terraza
 * de tierra, no por otro disco que deje sus esquinas en el aire. La máscara
 * lejana tiene UV propio para conservar el tamaño del mantillo. */
export function ForestGround({ quality }: { readonly quality: GraphicsQuality }) {
  const soil = soilMaps()
  return <mesh receiveShadow={quality !== 'low'}>
    <primitive object={forestGroundGeometry(quality === 'low')} attach="geometry" />
    <meshStandardMaterial map={soil.color} bumpMap={soil.height} roughnessMap={soil.roughness}
      alphaMap={soil.edge} bumpScale={0.025} roughness={1} transparent depthWrite={false} />
  </mesh>
}
