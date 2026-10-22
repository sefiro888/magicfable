import type { GraphicsQuality } from '../../../store/preferences'
import { barkMaps } from '../../materials/barkMaterial'
import { ancientOakGeometry } from './ancientOakGeometry'

/** La cavidad pertenece a la madera y conserva profundidad desde la cámara
 * de foto; fundir ramas y raíz evita tubos abiertos o juntas superpuestas. */
export function AncientOak({ quality }: { readonly quality: GraphicsQuality }) {
  return <mesh name="grove-ancient-oak" position={[0, -0.2, -7.6]}
    castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
    <primitive object={ancientOakGeometry(quality === 'low')} attach="geometry" />
    <meshStandardMaterial {...barkMaps()} color="#a99b89" bumpScale={0.06} roughness={0.96} vertexColors />
  </mesh>
}
