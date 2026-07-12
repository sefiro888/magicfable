import type { AnimationEvent } from '../../game'
import type { GraphicsQuality } from '../../store/preferences'
import { SCENERY_SCALE } from '../grid/gridCoordinates'
import { Sanctuary } from '../Sanctuary'

interface SanctuaryScenarioProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  event?: AnimationEvent
}

/**
 * El Santuario de las Runas Quebradas como escenario completo: escenografía
 * + su atmósfera nocturna (fondo, niebla y luces). Se conserva como
 * alternativa seleccionable a Aether Citadel.
 */
export function SanctuaryScenario({ quality, reducedMotion, event }: SanctuaryScenarioProps) {
  return (
    <>
      <color attach="background" args={['#070b1c']} />
      <fog attach="fog" args={['#0a0f22', 10, 30]} />
      <ambientLight intensity={1.45} color="#bfc7de" />
      <hemisphereLight intensity={0.85} color="#c9dcff" groundColor="#4a3420" />
      <spotLight position={[-4, 8, 5]} intensity={66} angle={0.58} penumbra={0.8} castShadow={quality !== 'low'} color="#ffe3b2" />
      <pointLight position={[4, 2, -4]} color="#50bfff" intensity={20} distance={9} />
      <pointLight position={[-4, 2, 4]} color="#ffb46a" intensity={16} distance={9} />
      {/* Sanctuary se diseñó para la huella 5×5: se reescala a la huella actual. */}
      <group scale={SCENERY_SCALE}>
        <Sanctuary quality={quality} reducedMotion={reducedMotion} event={event} />
      </group>
    </>
  )
}
