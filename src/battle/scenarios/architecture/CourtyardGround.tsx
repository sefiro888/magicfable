import { DataTexture, LinearFilter, NoColorSpace, PlaneGeometry, RGBAFormat } from 'three'
import type { GraphicsQuality } from '../../../store/preferences'
import { stoneMaps, type StoneFinish } from '../../materials/stoneMaterial'

let ground: PlaneGeometry | undefined, mask: DataTexture | undefined
function groundGeometry() {
  if (ground) return ground
  ground = new PlaneGeometry(30, 30)
  ground.rotateX(-Math.PI / 2)
  const p = ground.getAttribute('position'), uv = ground.getAttribute('uv'), edge = uv.clone()
  for (let i = 0; i < p.count; i += 1) {
    uv.setXY(i, p.getX(i) * 0.4, p.getZ(i) * 0.4)
    edge.setXY(i, p.getX(i) / 30 + 0.5, p.getZ(i) / 30 + 0.5)
  }
  ground.setAttribute('uv1', edge)
  return ground
}
function edgeMask() {
  if (mask) return mask
  const size = 128, data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const r = Math.hypot(x / (size - 1) * 2 - 1, y / (size - 1) * 2 - 1)
    const t = Math.min(1, Math.max(0, (1 - r) / 0.32)), i = (y * size + x) * 4
    data[i] = data[i + 1] = data[i + 2] = t * t * (3 - 2 * t) * 255
    data[i + 3] = 255
  }
  mask = new DataTexture(data, size, size, RGBAFormat)
  mask.channel = 1
  mask.colorSpace = NoColorSpace
  mask.minFilter = mask.magFilter = LinearFilter
  mask.needsUpdate = true
  return mask
}

/** El patio sostiene la arquitectura cercana y se pierde gradualmente en el
 * paisaje. Una máscara independiente evita repetir su borde con la piedra. */
export function CourtyardGround({ quality, finish, tint }: {
  readonly quality: GraphicsQuality
  readonly finish: StoneFinish
  readonly tint: string
}) {
  return <mesh position={[0, -0.54, 0]} receiveShadow={quality !== 'low'}>
    <primitive object={groundGeometry()} attach="geometry" />
    <meshStandardMaterial {...stoneMaps(finish)} color={tint} bumpScale={0.018}
      roughness={0.95} alphaMap={edgeMask()} transparent depthWrite={false} />
  </mesh>
}
