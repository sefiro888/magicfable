import type { GraphicsQuality } from '../../../store/preferences'
import { iceBodyMap, iceField, windSnowMask } from '../../materials/iceField'
import { packedSnowTexture } from '../../textures'
import { glacierBankGeometry } from './glacierBankGeometry'

export function GlacierFlanks({ quality }: { readonly quality: GraphicsQuality }) {
  return <>{[-1, 1].map((side) => {
    const geometry = glacierBankGeometry(side, quality === 'low')
    return <group key={side}>
      <mesh name={`fimbul-bank-${side}`} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
        <primitive object={geometry.ice} attach="geometry" />
        <meshPhysicalMaterial color="#b8cbd6" map={iceBodyMap()} roughness={0.38} metalness={0} clearcoat={0.25}
          clearcoatRoughness={0.3} bumpMap={iceField()} bumpScale={0.018} envMapIntensity={0.45} />
      </mesh>
      <mesh receiveShadow={quality !== 'low'}>
        <primitive object={geometry.snow} attach="geometry" />
        <meshStandardMaterial color="#b9cbd5" map={packedSnowTexture()} roughness={0.98} vertexColors
          alphaMap={windSnowMask()} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
    </group>
  })}</>
}
