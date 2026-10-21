import { Environment, Lightformer } from '@react-three/drei'
import type { GraphicsQuality } from '../store/preferences'
import { memo } from 'react'

/**
 * Entorno de reflexión propio, sin HDR externo. Los paneles amplios dibujan
 * reflejos legibles en biseles y metales; la intensidad contenida conserva
 * las sombras y el contraste de la luz direccional de cada escenario.
 * Se captura una vez y no añade luces ni geometría visibles al mundo.
 */
export const MaterialEnvironment = memo(function MaterialEnvironment({ quality }: { quality: GraphicsQuality }) {
  return <Environment frames={1} resolution={quality === 'high' ? 128 : quality === 'medium' ? 64 : 32}
    environmentIntensity={0.3} background={false}>
    <Lightformer form="rect" color="#e0e7ed" intensity={2.2} position={[0, 1.5, 7]} target={[0, 0, 0]} scale={[8, 4, 1]} />
    <Lightformer form="rect" color="#ecd4ac" intensity={1.4} position={[-6, 3, 3]} target={[0, 0, 0]} scale={[3, 5, 1]} />
    <Lightformer form="rect" color="#a9c2df" intensity={0.8} position={[4, 6, -3]} target={[0, 0, 0]} scale={[5, 2, 1]} />
  </Environment>
})
