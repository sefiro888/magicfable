import { memo, useMemo, useRef } from 'react'
import { AdditiveBlending, NormalBlending, type Group } from 'three'
import { useFrame } from '@react-three/fiber'

import { glowTexture } from './textures'
import type { BoardTileStyle, GlowTint } from './textures'
import { BOARD_WORLD_SIZE } from './grid/gridCoordinates'
import { usePageVisibility } from './usePageVisibility'
import type { GraphicsQuality } from '../store/preferences'

/**
 * Lo que se mueve POR ENCIMA del tablero, con dirección.
 *
 * La atmósfera que había era un único `Sparkles` por escena: partículas que
 * titilan en el sitio, sin ir a ninguna parte. Sirve para insinuar polvo en
 * suspensión, pero no da vida — y era lo mismo en las seis escenas, solo que
 * recoloreado, así que la nieve del Fiordo se comportaba igual que las pavesas
 * de la Caldera.
 *
 * Aquí las partículas VAN a algún sitio: la brasa sube, la nieve cae de lado,
 * la arena barre en horizontal y la hoja baja dando vueltas. La dirección es
 * lo que distingue un sitio de otro mucho más que el color, porque delata de
 * dónde sopla el aire y cuánto pesa lo que flota.
 *
 * Coste: un solo `useFrame` para todas las partículas del grupo, moviendo las
 * mallas hijas directamente. Nada de estado de React por partícula — esto se
 * actualiza sesenta veces por segundo durante toda la partida.
 */

interface DriftLook {
  /** Cuántas partículas en calidad alta (en media baja a la mitad). */
  count: number
  color: string
  /** Tamaño del punto, en unidades de mundo. */
  size: number
  /** Velocidad en cada eje, en unidades por segundo. */
  vx: number
  vy: number
  vz: number
  /** Altura del volumen por el que se mueven, sobre el tablero. */
  height: number
  /** Base del volumen. */
  y: number
  opacity: number
  /** `true` para lo que emite luz propia (brasas, motas); `false` para lo
   *  que solo la refleja (nieve, hoja, arena) — sumar una hoja al fondo la
   *  volvería fosforescente. */
  glowing: boolean
  /** Degradado del punto. El `color` lo multiplica encima, así que esto solo
   *  decide la forma y la caída del borde. */
  tint: GlowTint
  /** Cuánto bambolea la partícula al avanzar: la hoja mucho, la brasa poco. */
  wobble: number
}

const DRIFT: Readonly<Record<BoardTileStyle, DriftLook>> = {
  // Pavesas: suben rápido y casi rectas, con la corriente de calor.
  basalt: { count: 34, color: '#ff8a3d', size: 0.05, vx: 0.12, vy: 0.62, vz: -0.05, height: 2.2, y: 0.1, opacity: 0.75, glowing: true, tint: 'ember', wobble: 0.35 },
  // Nieve: cae despacio y muy de lado, porque en el fiordo no hay nada que
  // frene el viento.
  ice: { count: 52, color: '#eaf6ff', size: 0.035, vx: 0.55, vy: -0.3, vz: 0.1, height: 2.4, y: 0.15, opacity: 0.7, glowing: false, tint: 'arcane', wobble: 0.5 },
  // Arena: barre en horizontal, casi sin subir ni bajar.
  sand: { count: 44, color: '#f0d9a8', size: 0.04, vx: 0.85, vy: 0.04, vz: 0.12, height: 1.1, y: 0.12, opacity: 0.45, glowing: false, tint: 'gold', wobble: 0.25 },
  // Bruma del santuario: se desplaza tan despacio que casi no se nota, y es
  // lo que hace que el sitio parezca quieto en vez de muerto.
  moss: { count: 20, color: '#9fc4d8', size: 0.11, vx: 0.09, vy: 0.02, vz: 0.05, height: 1, y: 0.18, opacity: 0.3, glowing: true, tint: 'arcane', wobble: 0.6 },
  // Motas al amanecer: suben flotando, sin prisa, por los haces de luz.
  stone: { count: 28, color: '#ffe6b0', size: 0.045, vx: 0.05, vy: 0.14, vz: 0.03, height: 1.8, y: 0.2, opacity: 0.5, glowing: true, tint: 'gold', wobble: 0.7 },
  // Pavesas de fundición: suben rápido y rectas por la corriente del horno.
  // Van más deprisa que las de la Caldera porque aquí el tiro es forzado, no
  // natural: esto es una fábrica, no un volcán.
  forge: { count: 36, color: '#ffb347', size: 0.042, vx: 0.1, vy: 0.78, vz: -0.04, height: 2.4, y: 0.1, opacity: 0.72, glowing: true, tint: 'ember', wobble: 0.28 },
  // Espuma: viene del mar, o sea de la fila del fondo hacia la cámara, y sube
  // un poco al avanzar. Es la única deriva del juego que va hacia el jugador,
  // y eso basta para que el sitio se lea como una orilla y no como un patio.
  tide: { count: 38, color: '#dff7f2', size: 0.045, vx: 0.18, vy: 0.06, vz: 0.42, height: 1.3, y: 0.12, opacity: 0.5, glowing: false, tint: 'arcane', wobble: 0.45 },
  // Hojas: bajan dando tumbos. Son las más lentas y las que más se bambolean.
  forest: { count: 30, color: '#cbe89a', size: 0.06, vx: 0.22, vy: -0.16, vz: 0.08, height: 2.2, y: 0.2, opacity: 0.6, glowing: false, tint: 'nature', wobble: 1.1 },
}

/** Media huella del volumen: las partículas se reparten por todo el tablero. */
const SPAN = BOARD_WORLD_SIZE * 0.56

export const BoardDrift = memo(function BoardDrift({
  terrainStyle,
  quality,
  reducedMotion,
}: {
  terrainStyle: BoardTileStyle
  quality: GraphicsQuality
  reducedMotion: boolean
}) {
  const group = useRef<Group>(null)
  const look = DRIFT[terrainStyle]
  const total = quality === 'high' ? look.count : Math.round(look.count * 0.5)

  // Fase y desfase de cada partícula, fijos: el bamboleo tiene que ser
  // distinto en cada una o todas se moverían a la vez, que es lo que delata
  // que son un sistema y no cosas sueltas.
  const seeds = useMemo(
    () =>
      Array.from({ length: total }, (_, index) => ({
        x: (((index * 37) % 100) / 100 - 0.5) * SPAN * 2,
        y: ((index * 53) % 100) / 100,
        z: (((index * 71) % 100) / 100 - 0.5) * SPAN * 2,
        phase: ((index * 29) % 100) / 100 * Math.PI * 2,
      })),
    [total],
  )

  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    const node = group.current
    // Con la pestaña oculta el reloj sigue corriendo pero nadie mira: mover
    // las partículas es gasto puro.
    if (!node || reducedMotion || !visible.current) return
    const t = clock.elapsedTime
    node.children.forEach((child, index) => {
      const seed = seeds[index]
      if (!seed) return
      // Envolvente: cada eje avanza y vuelve a empezar con un módulo, así el
      // flujo no se acaba nunca y no hace falta reciclar partículas a mano.
      const wrap = (base: number, speed: number, extent: number) =>
        (((base + t * speed) % extent) + extent) % extent
      const bob = Math.sin(t * 0.9 + seed.phase) * look.wobble * 0.12
      child.position.set(
        wrap(seed.x + SPAN, look.vx, SPAN * 2) - SPAN + bob,
        look.y + wrap(seed.y * look.height, look.vy, look.height),
        wrap(seed.z + SPAN, look.vz, SPAN * 2) - SPAN + bob * 0.6,
      )
    })
  })

  if (quality === 'low') return null
  return (
    <group ref={group}>
      {seeds.map((seed, index) => (
        <sprite key={index} position={[seed.x, look.y + seed.y * look.height, seed.z]} scale={[look.size, look.size, 1]}>
          <spriteMaterial
            map={glowTexture(look.tint)}
            color={look.color}
            transparent
            opacity={look.opacity}
            depthWrite={false}
            blending={look.glowing ? AdditiveBlending : NormalBlending}
          />
        </sprite>
      ))}
    </group>
  )
})
