import { useMemo } from 'react'
import type { GraphicsQuality } from '../../../store/preferences'
import { StoneColumns, StoneMasonry, StoneVault, type StoneBlock } from './StoneArchitecture'

const COURT_FLOOR = -2.25
const BACK = -7.35
const WHITE_STONE = '#deded7'
const LOWER_COLUMNS = [[-3.2, COURT_FLOOR, BACK + 0.02], [3.2, COURT_FLOOR, BACK + 0.02],
  [-4.25, COURT_FLOOR, BACK + 0.02], [4.25, COURT_FLOOR, BACK + 0.02]] as const
const WEST_COLUMNS = [[-5.22, -0.7, -3.45], [-5.22, -0.7, -1.85]] as const
const EAST_COLUMNS = [[5.22, -0.7, -3.45], [5.22, -0.7, -1.85]] as const

/** La basílica ocupa una terraza inferior real. Desde la cámara de juego un
 * portal de cuatro metros sobre la losa desaparecía por encima del lienzo;
 * aquí su remate queda a y=1,7 y la profundidad se lee en el patio excavado. */
export function CitadelBasilica({ quality }: { readonly quality: GraphicsQuality }) {
  const blocks = useMemo<readonly StoneBlock[]>(() => {
    const result: StoneBlock[] = []
    const block = (position: StoneBlock['position'], size: StoneBlock['size'], shade?: number) => result.push({ position, size, shade })
    // Patio de llegada, zócalos y escalinata: los apoyos no terminan en el aire.
    block([0, COURT_FLOOR - 0.2, BACK + 0.15], [10.8, 0.4, 3.3])
    block([0, COURT_FLOOR - 0.47, BACK + 0.15], [11.05, 0.18, 3.5], 0.9)
    block([0, COURT_FLOOR - 0.85, BACK + 0.15], [10.4, 0.6, 3.0], 0.83)
    for (let row = 0; row < 6; row += 1) {
      for (const side of [-1, 1]) {
        // Jambas aparejadas en vez de pilares lisos de una sola caja.
        block([side * 1.78, COURT_FLOOR + 0.17 + row * 0.34, BACK], [0.59, 0.325, 0.88])
      }
    }
    for (const side of [-1, 1]) {
      block([side * 1.78, COURT_FLOOR + 0.1, BACK], [0.85, 0.2, 1.12], 0.96)
      block([side * 1.78, -0.18, BACK], [0.83, 0.15, 1.08])
    }
    // Entablamento bajo con tres perfiles distintos, sin enormes bandas de oro.
    block([0, 1.67, BACK], [9.5, 0.22, 1.05])
    block([0, 1.83, BACK], [9.8, 0.1, 1.22])
    block([0, 1.95, BACK], [9.6, 0.12, 1.12], 0.97)
    for (let index = 0; index < 24; index += 1) {
      block([-4.5 + index * 0.39, 1.52, BACK + 0.48], [0.12, 0.13, 0.16], 0.96)
    }
    // Un friso articulado rompe la gran losa uniforme que domina el encuadre
    // de juego; los relieves bajos no invaden el espacio visual del Nexo.
    for (let index = 0; index < 12; index += 1) {
      block([-4.29 + index * 0.78, 1.68, BACK + 0.565], [0.51, 0.14, 0.06], 0.83)
    }
    // Los laterales se adelantan: altos en los flancos sin cruzar casillas.
    for (const side of [-1, 1]) {
      block([side * 5.22, -0.88, -2.65], [1.28, 0.35, 3.1])
      block([side * 5.22, -1.14, -2.65], [1.45, 0.17, 3.28], 0.87)
      block([side * 5.22, 2.24, -2.65], [0.88, 0.18, 2.8])
      block([side * 5.22, 2.4, -2.65], [1.12, 0.13, 2.98])
      block([side * 5.22, 2.54, -2.65], [1.01, 0.14, 2.88], 0.97)
    }
    return result
  }, [])
  return <group>
    <StoneMasonry quality={quality} blocks={blocks} color={WHITE_STONE} />
    <StoneMasonry quality={quality} color="#31566a" blocks={[
      { position: [0, 1.68, BACK + 0.53], size: [9.32, 0.085, 0.025] },
      { position: [-5.22, 2.25, -1.24], size: [0.84, 0.07, 0.025] },
    ]} />
    <StoneMasonry quality={quality} color="#763f50" blocks={[
      { position: [5.22, 2.25, -1.24], size: [0.84, 0.07, 0.025] },
    ]} />
    <StoneColumns quality={quality} positions={LOWER_COLUMNS} radius={0.24} height={3.78} color={WHITE_STONE} />
    <StoneColumns quality={quality} positions={WEST_COLUMNS} radius={0.22} height={2.85} color={WHITE_STONE} />
    <StoneColumns quality={quality} positions={EAST_COLUMNS} radius={0.22} height={2.85} color={WHITE_STONE} />
    <group position={[0, -0.18, BACK]}>
      <StoneVault quality={quality} radius={1.48} thickness={0.32} depth={0.88} color={WHITE_STONE} />
    </group>
  </group>
}
