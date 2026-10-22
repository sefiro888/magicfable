import type { GraphicsQuality } from '../../../store/preferences'
import { stoneMaps } from '../../materials/stoneMaterial'
import { seaArchGeometry, shoreShelfGeometry } from './shoreGeometry'

/** Estratos mojados y un arco excavado por el mar;
 * conservar la cavidad real evita otra roca cónica pintada como acantilado. */
export function CoastalSlate({ quality }: { readonly quality: GraphicsQuality }) {
  const maps = stoneMaps('granite')
  return <>
    {[0, 1, 2].map((layer) => <mesh key={layer} name={`shore-shelf-${layer}`}
      receiveShadow={quality !== 'low'} castShadow={quality === 'high'}>
      <primitive object={shoreShelfGeometry(layer)} attach="geometry" />
      <meshStandardMaterial {...maps} color={layer === 0 ? '#728080' : '#4a5a61'}
        bumpScale={0.035} roughness={layer === 0 ? 0.5 : 0.72} metalness={0.015} />
    </mesh>)}
    <mesh name="shore-sea-arch" position={[-7.1, -0.78, -5.5]} rotation={[0, 0.32, 0]}
      castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
      <primitive object={seaArchGeometry()} attach="geometry" />
      <meshStandardMaterial {...maps} color="#6b7776" bumpScale={0.055} roughness={0.76} metalness={0.01} />
    </mesh>
  </>
}
