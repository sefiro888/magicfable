import { useMemo } from 'react'
import type { GraphicsQuality } from '../../../store/preferences'
import { StoneColumns, StoneMasonry, type StoneBlock } from './StoneArchitecture'
import { floatingCragGeometry, terraceGeometry } from './stoneGeometry'
import { stoneMaps } from '../../materials/stoneMaterial'

const ROTUNDA_COLUMNS = Array.from({ length: 12 }, (_, index) => {
  const angle = index / 12 * Math.PI * 2
  return [Math.cos(angle) * 0.92, 0, Math.sin(angle) * 0.92] as const
})
const CITY_COLUMNS = [-4.2, -3.4, -2.6, 2.3, 3.1, 3.9, 4.7].map((x) => [x, 0, 1.14] as const)

/** El arco enmarca otra cota de la ciudad, no un telón vacío. El basamento
 * distante queda por debajo del tablero y sus cubiertas asoman a través de
 * los vanos: la profundidad proviene de oclusión y perspectiva reales. */
export function CitadelLowerCity({ quality }: { readonly quality: GraphicsQuality }) {
  const stone = stoneMaps('limestone')
  const blocks = useMemo<readonly StoneBlock[]>(() => [
    { position: [-3.4, 1.13, -0.05], size: [2.7, 2.26, 1.8] },
    { position: [-3.4, 2.35, 0.2], size: [3.5, 0.18, 2.5] },
    { position: [-3.4, 2.55, 0.2], size: [3.7, 0.16, 2.7] },
    { position: [3.5, 1.13, -0.2], size: [3.0, 2.26, 1.8] },
    { position: [3.5, 2.35, 0.05], size: [3.7, 0.18, 2.5] },
    { position: [3.5, 2.55, 0.05], size: [3.9, 0.16, 2.7] },
    { position: [-4.4, 3.15, -1.4], size: [1.1, 1.2, 1.2] },
    { position: [-4.4, 3.82, -1.4], size: [1.35, 0.14, 1.45] },
    { position: [4.45, 3, -1.6], size: [1.2, 0.9, 1.35] },
    { position: [4.45, 3.52, -1.6], size: [1.4, 0.14, 1.55] },
  ], [])
  return <group position={[0.15, -6.3, -17.5]} rotation={[0, 0.12, 0]}>
    <mesh receiveShadow>
      <primitive attach="geometry" object={terraceGeometry(6)} />
      <meshStandardMaterial {...stone} color="#9bafbe" vertexColors roughness={0.95} bumpScale={0.02} />
    </mesh>
    <mesh>
      <primitive attach="geometry" object={floatingCragGeometry(5.8, 6, 41)} />
      <meshStandardMaterial {...stone} color="#62788c" vertexColors roughness={1} bumpScale={0.035} />
    </mesh>
    <StoneMasonry quality={quality} blocks={blocks} finish="limestone" color="#afbec7" />
    <StoneColumns quality={quality} radius={0.14} height={2.27} positions={CITY_COLUMNS} color="#b8c4ca" />
    <StoneColumns quality={quality} radius={0.12} height={2.9} positions={ROTUNDA_COLUMNS} color="#b8c4ca" />
    <mesh position={[0, 2.98, 0]}>
      <cylinderGeometry args={[1.2, 1.12, 0.18, 48]} />
      <meshStandardMaterial {...stone} color="#b8c4ca" roughness={0.9} />
    </mesh>
    <mesh position={[0, 3.08, 0]}>
      <sphereGeometry args={[1.16, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#6b948d" roughness={0.62} metalness={0.58} />
    </mesh>
    <mesh position={[0, 4.26, 0]}>
      <sphereGeometry args={[0.07, 12, 8]} />
      <meshStandardMaterial color="#b5a674" roughness={0.48} metalness={0.68} />
    </mesh>
  </group>
}
