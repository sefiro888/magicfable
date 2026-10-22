import { useEffect, useMemo } from 'react'
import { DataTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, PlaneGeometry, RepeatWrapping, RGBAFormat, SRGBColorSpace } from 'three'
import type { GraphicsQuality } from '../../../store/preferences'

const smooth = (low: number, high: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - low) / (high - low)))
  return t * t * (3 - 2 * t)
}

/** Patio posterior excavado para que el pilono pueda conservar su escala.
 * El tablero permanece sobre suelo plano: la depresión empieza fuera de él. */
export function desertGroundHeight(x: number, z: number) {
  const court = smooth(5.2, 6.5, -z) * (1 - smooth(3.8, 6.6, Math.abs(x))) * (1 - smooth(10, 13, -z))
  const dune = Math.sin(x * 0.42 + Math.sin(z * 0.3)) * Math.cos(z * 0.37) * 0.055
  return -0.65 - court * 1.55 + dune * (1 - court)
}

let maps: { color: DataTexture; height: DataTexture; edge: DataTexture } | undefined
function sandMaps() {
  if (maps) return maps
  const size = 512
  const color = new Uint8Array(size * size * 4)
  const height = new Uint8Array(color.length)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size * Math.PI * 2
      const v = y / size * Math.PI * 2
      const ripple = Math.sin(v * 42 + Math.sin(u * 2) * 0.8 + Math.sin(v * 5) * 0.45)
      const noise = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
      const grain = noise - Math.floor(noise)
      const broad = Math.sin(u * 2 + Math.cos(v * 3)) * 0.5 + 0.5
      const i = (y * size + x) * 4
      color[i] = 191 + broad * 18 + grain * 9 + ripple * 2
      color[i + 1] = 161 + broad * 16 + grain * 8 + ripple * 2
      color[i + 2] = 109 + broad * 13 + grain * 7 + ripple
      color[i + 3] = 255
      height[i] = height[i + 1] = height[i + 2] = 128 + ripple * 29 + (grain - 0.5) * 17
      height[i + 3] = 255
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
  const mask = new Uint8Array(edgeSize * edgeSize * 4)
  for (let y = 0; y < edgeSize; y += 1) {
    for (let x = 0; x < edgeSize; x += 1) {
      const radius = Math.hypot(x / (edgeSize - 1) * 2 - 1, y / (edgeSize - 1) * 2 - 1)
      const value = (1 - smooth(0.6, 1, radius)) * 255
      const i = (y * edgeSize + x) * 4
      mask[i] = mask[i + 1] = mask[i + 2] = value
      mask[i + 3] = 255
    }
  }
  const edge = new DataTexture(mask, edgeSize, edgeSize, RGBAFormat)
  edge.channel = 1
  edge.colorSpace = NoColorSpace
  edge.magFilter = edge.minFilter = LinearFilter
  edge.needsUpdate = true
  maps = { color: make(color, true), height: make(height, false), edge }
  return maps
}

/** Arena mate con crestas de viento y costra granular,
 * desvanecida al paisaje. La máscara usa UV aparte para no escalarse con grano. */
export function DesertGround({ quality }: { readonly quality: GraphicsQuality }) {
  const maps = sandMaps()
  const geometry = useMemo(() => {
    const ground = new PlaneGeometry(30, 30, quality === 'low' ? 40 : 80, quality === 'low' ? 40 : 80)
    ground.rotateX(-Math.PI / 2)
    const position = ground.getAttribute('position')
    const uv = ground.getAttribute('uv')
    const maskUV = uv.clone()
    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index)
      const z = position.getZ(index)
      position.setY(index, desertGroundHeight(x, z))
      uv.setXY(index, x * 0.15, z * 0.15)
      maskUV.setXY(index, x / 30 + 0.5, z / 30 + 0.5)
    }
    ground.setAttribute('uv1', maskUV)
    ground.computeVertexNormals()
    return ground
  }, [quality])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <mesh receiveShadow={quality !== 'low'}>
    <primitive object={geometry} attach="geometry" />
    <meshStandardMaterial map={maps.color} bumpMap={maps.height} alphaMap={maps.edge}
      bumpScale={0.025} roughness={0.98} metalness={0} transparent depthWrite={false} />
  </mesh>
}
