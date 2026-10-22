import type { GraphicsQuality } from '../../../store/preferences'
import { stoneMaps } from '../../materials/stoneMaterial'
import { fossilBoneMaps } from '../../materials/fossilBone'
import { CourtyardGround } from './CourtyardGround'
import { ancientRibGeometry, ravineRockGeometry } from './bestiaryGeometry'
import { shoreShelfGeometry } from './shoreGeometry'

/** Vestigios de escala colosal integrados en caliza,
 * sin convertir las cartas en miniaturas ni llenar el campo de esqueletos. */
export function BestiaryRemains({ quality }: { readonly quality: GraphicsQuality }) {
  const granite = stoneMaps('granite')
  return <>
    <CourtyardGround quality={quality} finish="granite" tint="#7c8779" />
    {[0, 1].map((layer) => <mesh key={layer} receiveShadow={quality !== 'low'} castShadow={quality === 'high'}>
      <primitive object={shoreShelfGeometry(layer)} attach="geometry" />
      <meshStandardMaterial {...granite} color={layer ? '#647368' : '#899184'} roughness={0.91} bumpScale={0.04} />
    </mesh>)}
    {[[-6.3, -0.47, -3.6, 0.12, 1], [6.3, -0.47, -4.2, Math.PI - 0.2, 0.85]].map(([x, y, z, turn, scale], i) =>
      <group key={i} position={[x!, y!, z!]} rotation={[0, turn!, 0]} scale={scale!}>
        <mesh name={`bestiary-ancient-rib-${i}`} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
          <primitive object={ancientRibGeometry(quality === 'low')} attach="geometry" />
          <meshStandardMaterial {...fossilBoneMaps()} color="#ece5cc" roughness={0.84} bumpScale={0.018} vertexColors />
        </mesh>
      </group>)}
    {[-1, 1].map((side) => <mesh key={side} position={[side * 6.8, -0.55, -5.8]}
      scale={[1.7, 0.65, 1.25]} rotation={[0, side * 0.37, 0]} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
      <primitive object={ravineRockGeometry(11 + side, quality === 'low')} attach="geometry" />
      <meshStandardMaterial {...granite} color="#657065" roughness={0.95} bumpScale={0.035} />
    </mesh>)}
  </>
}
