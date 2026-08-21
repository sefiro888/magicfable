import type { AnimationEvent } from '../../game'
import type { GraphicsQuality } from '../../store/preferences'
import { RunicSanctuary } from './RunicSanctuary'

interface SanctuaryScenarioProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  event?: AnimationEvent
}

/**
 * El Santuario de las Runas Quebradas. La escenografía trae su propia
 * atmósfera (fondo, niebla y luces de noche cerrada), así que aquí no queda
 * más que montarla; ya no hace falta reescalar nada porque está construida
 * sobre la huella real del tablero.
 */
export function SanctuaryScenario({ quality, reducedMotion, event }: SanctuaryScenarioProps) {
  return <RunicSanctuary quality={quality} reducedMotion={reducedMotion} event={event} />
}
