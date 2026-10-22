import { DataTexture, LinearFilter, NoColorSpace, PlaneGeometry, RGBAFormat } from 'three'
import type { GraphicsQuality } from '../../../store/preferences'
import { forgedMetalMaps } from '../../materials/forgedMetal'
import { kilnBrickMaps } from '../../materials/kilnBrick'
import { foundryDeckGeometry } from './foundryGeometry'

let apron: PlaneGeometry | undefined, edge: DataTexture | undefined
function apronGeometry() {
  if (apron) return apron
  apron = new PlaneGeometry(30, 30)
  apron.rotateX(-Math.PI / 2)
  const position = apron.getAttribute('position'), uv = apron.getAttribute('uv'), mask = uv.clone()
  for (let i = 0; i < position.count; i += 1) {
    uv.setXY(i, position.getX(i) * 0.4, position.getZ(i) * 0.4)
    mask.setXY(i, position.getX(i) / 30 + 0.5, position.getZ(i) / 30 + 0.5)
  }
  apron.setAttribute('uv1', mask)
  return apron
}
function edgeMask() {
  if (edge) return edge
  const size = 128, data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const radius = Math.hypot(x / (size - 1) * 2 - 1, y / (size - 1) * 2 - 1)
      const fade = Math.min(1, Math.max(0, (1 - radius) / 0.32))
      const i = (y * size + x) * 4
      data[i] = data[i + 1] = data[i + 2] = fade * fade * (3 - 2 * fade) * 255
      data[i + 3] = 255
    }
  }
  edge = new DataTexture(data, size, size, RGBAFormat)
  edge.channel = 1
  edge.colorSpace = NoColorSpace
  edge.minFilter = edge.magFilter = LinearFilter
  edge.needsUpdate = true
  return edge
}

/** El andén fabricado se apoya en el patio y sostiene
 * las cuatro esquinas; la periferia se funde con el paisaje sin disco circular. */
export function FoundryFloor({ quality }: { readonly quality: GraphicsQuality }) {
  return <>
    <mesh position={[0, -0.54, 0]} receiveShadow={quality !== 'low'}>
      <primitive object={apronGeometry()} attach="geometry" />
      <meshStandardMaterial {...kilnBrickMaps()} color="#868b85" bumpScale={0.018}
        roughness={0.98} alphaMap={edgeMask()} transparent depthWrite={false} />
    </mesh>
    <mesh name="foundry-steel-deck" receiveShadow={quality !== 'low'} castShadow={quality === 'high'}>
      <primitive object={foundryDeckGeometry()} attach="geometry" />
      <meshStandardMaterial {...forgedMetalMaps('iron')} color="#8d908a" bumpScale={0.025} roughness={0.86} metalness={0.35} />
    </mesh>
  </>
}
