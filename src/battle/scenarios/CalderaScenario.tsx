import type { AnimationEvent } from '../../game'
import type { GraphicsQuality } from '../../store/preferences'
import { SCENERY_SCALE } from '../grid/gridCoordinates'
import { Sanctuary } from '../Sanctuary'

interface CalderaScenarioProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  event?: AnimationEvent
}

/**
 * La Fragua de la Caldera: la misma escenografía de runas quebradas, pero
 * inmersa en una atmósfera volcánica. Reutiliza la geometría del Santuario con
 * una paleta de brasa y fuego —fondo, niebla y luces cálidas— para ofrecer un
 * tercer escenario distinto sin nuevos modelos 3D.
 */
export function CalderaScenario({ quality, reducedMotion, event }: CalderaScenarioProps) {
  return (
    <>
      <color attach="background" args={['#1a0805']} />
      <fog attach="fog" args={['#2a0c05', 9, 28]} />
      <ambientLight intensity={1.25} color="#ffb187" />
      <hemisphereLight intensity={0.9} color="#ffd8a0" groundColor="#3a0f06" />
      {/* Fogonazo cenital de fragua, cálido e intenso. */}
      <spotLight position={[-3, 9, 4]} intensity={78} angle={0.6} penumbra={0.85} castShadow={quality !== 'low'} color="#ffcaa0" />
      {/* Brasas laterales: rojo profundo y naranja incandescente. */}
      <pointLight position={[4, 1.6, -4]} color="#ff4a1e" intensity={26} distance={10} />
      <pointLight position={[-4, 1.6, 4]} color="#ff9838" intensity={22} distance={10} />
      <pointLight position={[0, 0.6, 0]} color="#ff6a20" intensity={12} distance={6} />
      {/* Sanctuary se diseñó para la huella 5×5: se reescala a la huella actual. */}
      <group scale={SCENERY_SCALE}>
        <Sanctuary quality={quality} reducedMotion={reducedMotion} event={event} />
      </group>
    </>
  )
}
