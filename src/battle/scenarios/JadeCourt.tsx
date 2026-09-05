import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { AdditiveBlending, BackSide, DoubleSide, RepeatWrapping, Vector2 } from 'three'
import type { Group, MeshBasicMaterial, SpriteMaterial } from 'three'

import type { AnimationEvent } from '../../game'
import type { GraphicsQuality } from '../../store/preferences'
import { BOARD_WORLD_HALF } from '../grid/gridCoordinates'
import { dawnSkyTexture, glowTexture, lacquerTexture, marbleTexture, mossStoneTexture, roofTileTexture } from '../textures'
import { usePageVisibility } from '../usePageVisibility'

interface JadeCourtProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  /** Último evento visual en reproducción; el sitio reacciona con discreción. */
  event?: AnimationEvent
}

/**
 * La Corte de Jade: el patio de una corte celestial al amanecer. Es el sitio
 * de Jade, que jugaba prestada en la Ciudadela de Aether — una plaza de mármol
 * grecolatina, o sea el sitio más equivocado posible para una facción de laca
 * roja, oro imperial y aleros curvos.
 *
 * QUÉ LO HACE RECONOCIBLE, que es lo único que importa en un escenario: la
 * arquitectura china se identifica por UNA cosa antes que por el color, y es
 * la CURVA DEL ALERO. Un tejado que se comba hacia arriba en los bordes. Por
 * eso el tejado de aquí no es un cono ni una pirámide: es una superficie de
 * revolución generada a partir de un perfil cóncavo que se abre, baja, y
 * vuelve a levantarse en la punta (ver `roofProfile`). Es lo que separa un
 * pabellón de una caseta con sombrero.
 *
 * Lo segundo es la PUERTA DE LA LUNA: un vano circular perfecto abierto en un
 * muro blanco. No existe en ninguna otra arquitectura y, además, va a ras de
 * suelo, que es justo lo que este encuadre permite ver.
 *
 * ESCALA. El tablero mide poco más de 7 unidades de lado (media huella 3,68).
 * La terraza llega a 6,6; el pabellón está a 26 y mide 7,5; la puerta de la
 * luna, a 16 y mide 4,6.
 *
 * ENCUADRE, y esto es lo que gobierna TODO lo que hay aquí. Medido leyendo los
 * píxeles del lienzo, no estimado: con la cámara en z=8,8 y 37 grados de
 * picado, el borde superior del cuadro cae en el suelo alrededor de z=-11. NO
 * SE VE NADA DE CIELO. Consecuencias:
 *
 *   1. Lo ALTO Y LEJANO no cabe. Un edificio de 7 metros a 26 de fondo se
 *      dibuja entero por encima del borde y no lo ve nadie. La primera versión
 *      de este patio tenía ahí un pabellón y una puerta de la luna a 14, y las
 *      dos eran invisibles. Es el mismo error que me costó el faro del
 *      Rompiente y el horno del Patio del Gremio, y van tres.
 *   2. Lo que se ve de verdad es lo CERCANO Y BAJO: entre 6 y 12 de fondo, y
 *      por debajo de unos 4 de alto. Ahí es donde va el decorado que cuenta.
 *   3. En x el margen es `(8,8 + |z|) · 0,45`, del semiángulo horizontal de
 *      unos 24 grados.
 *   4. Y nada en el arco cercano a la cámara (z positivo grande): caería entre
 *      el jugador y el tablero.
 */

/** Radio de la terraza sobre la que se juega. */
const TERRACE_RADIUS = BOARD_WORLD_HALF + 2.9

/**
 * El perfil del alero, que es el corazón visual del sitio.
 *
 * Cada punto es (radio, altura). La secuencia hace tres cosas, en este orden:
 * sale del caballete y CAE deprisa, luego se tumba en una curva cada vez más
 * suave, y en los dos últimos puntos VUELVE A SUBIR. Ese repunte final es la
 * curva del alero; sin él sale una pirámide, con él sale un tejado chino.
 *
 * Se revoluciona con pocos segmentos radiales (cuatro) a propósito: así los
 * cuatro encuentros de faldón quedan como aristas marcadas, que es como se ve
 * un tejado a cuatro aguas de verdad.
 */
const roofProfile = (span: number, rise: number): Vector2[] =>
  [
    [0.06, 1],
    [0.22, 0.94],
    [0.4, 0.83],
    [0.56, 0.68],
    [0.71, 0.52],
    [0.84, 0.37],
    [0.93, 0.25],
    [1, 0.17],
    [1.06, 0.15],
    [1.12, 0.19],
    [1.16, 0.27],
  ].map(([r, h]) => new Vector2(r! * span, h! * rise))

/**
 * Cúpula del cielo. `fog={false}`: si la calima se comiera el cielo, el
 * amanecer se volvería una pared gris.
 *
 * Con `side={BackSide}` basta para verla desde dentro. NO añadir además
 * `scale={[-1,1,1]}`: las dos cosas invierten la geometría, juntas se cancelan
 * y la cúpula desaparece sin que salte ningún error.
 */
function SkyDome() {
  return (
    <mesh rotation={[0, 1.9, 0]}>
      <sphereGeometry args={[72, 40, 24]} />
      <meshBasicMaterial map={dawnSkyTexture()} side={BackSide} fog={false} />
    </mesh>
  )
}

/** Tejado vidriado con alero curvo. La pieza reutilizable del sitio. */
function GlazedRoof({
  span,
  rise,
  position,
  color = '#5f8f78',
}: {
  span: number
  rise: number
  position: readonly [number, number, number]
  color?: string
}) {
  const tiles = useMemo(() => {
    const clone = roofTileTexture().clone()
    clone.needsUpdate = true
    clone.wrapS = RepeatWrapping
    clone.wrapT = RepeatWrapping
    clone.repeat.set(3, 1)
    return clone
  }, [])
  const profile = useMemo(() => roofProfile(span, rise), [span, rise])
  return (
    <group position={[...position]}>
      <mesh castShadow receiveShadow>
        {/* Cuatro segmentos y un cuarto de vuelta de desfase: así un faldón
            queda de frente a la cámara en vez de una arista. */}
        <latheGeometry args={[profile, 4, Math.PI / 4]} />
        <meshStandardMaterial
          map={tiles}
          color={color}
          roughness={0.34}
          metalness={0.04}
          emissive="#16281f"
          emissiveIntensity={0.4}
          side={DoubleSide}
          flatShading
        />
      </mesh>
      {/* Perilla del caballete: el remate dorado de la cumbrera. */}
      <mesh position={[0, rise * 1.02, 0]} castShadow>
        <sphereGeometry args={[span * 0.075, 12, 10]} />
        <meshStandardMaterial color="#e2be60" roughness={0.3} metalness={0.05} emissive="#4a3208" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

/**
 * La Puerta de la Luna: un vano circular perfecto en un muro encalado.
 *
 * El muro se hace con CUATRO piezas alrededor del hueco (dos jambas y dos
 * antepechos) en vez de con una plancha agujereada: no hay forma de restar
 * geometría en Three.js sin librerías de más, y cuatro cajas bien medidas dan
 * exactamente el mismo vano por una fracción del coste.
 */
function MoonGate({ position, rotation }: { position: readonly [number, number, number]; rotation: number }) {
  const plaster = marbleTexture()
  const radius = 1.15
  const wallHeight = 3.4
  const wallWidth = 5
  const jamb = (wallWidth - radius * 2) / 2
  const overWall = wallHeight - radius * 2 - 0.5
  return (
    <group position={[...position]} rotation={[0, rotation, 0]}>
      {/* Jambas: los dos machones a los lados del vano. */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (radius + jamb / 2), wallHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[jamb, wallHeight, 0.55]} />
          <meshStandardMaterial map={plaster} color="#f2ece0" roughness={0.9} metalness={0.01} emissive="#4a3f30" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {/* Antepecho y dintel: lo que cierra el círculo por abajo y por arriba. */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[radius * 2, 0.5, 0.55]} />
        <meshStandardMaterial map={plaster} color="#f2ece0" roughness={0.9} metalness={0.01} emissive="#4a3f30" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, wallHeight - overWall / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[radius * 2, overWall, 0.55]} />
        <meshStandardMaterial map={plaster} color="#f2ece0" roughness={0.9} metalness={0.01} emissive="#4a3f30" emissiveIntensity={0.5} />
      </mesh>
      {/* El aro de piedra gris que enmarca el vano. Es lo que lo convierte en
          una puerta y no en un agujero. */}
      <mesh position={[0, radius + 0.5, 0]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[radius + 0.13, 0.16, 10, 40]} />
        <meshStandardMaterial map={mossStoneTexture()} color="#9aa39c" roughness={0.85} metalness={0.03} />
      </mesh>
      {/* Albardilla de teja vidriada rematando el muro, con su vuelo. */}
      <mesh position={[0, wallHeight + 0.12, 0]} castShadow>
        <boxGeometry args={[wallWidth + 0.5, 0.24, 0.95]} />
        <meshStandardMaterial map={roofTileTexture()} color="#5f8f78" roughness={0.36} metalness={0.04} />
      </mesh>
    </group>
  )
}

/**
 * El pabellón del fondo: cuatro columnas de laca y un tejado curvo.
 *
 * Va LEJOS y centrado-izquierda, dentro del cono del encuadre. Su tejado llega
 * a y=7,5, y a esa distancia (26 de fondo, 34,8 de profundidad) eso queda por
 * debajo del borde superior: se ve entero.
 */
function Pavilion({ position, rotation = 0 }: { position: readonly [number, number, number]; rotation?: number }) {
  const lacquer = lacquerTexture()
  const stone = mossStoneTexture()
  return (
    <group position={[...position]} rotation={[0, rotation, 0]}>
      {/* Basamento de piedra en dos escalones. */}
      <mesh position={[0, 0.3, 0]} receiveShadow castShadow>
        <boxGeometry args={[6.2, 0.6, 6.2]} />
        <meshStandardMaterial map={stone} bumpMap={stone} bumpScale={2} color="#b0aa9c" roughness={0.92} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.78, 0]} receiveShadow castShadow>
        <boxGeometry args={[5.4, 0.36, 5.4]} />
        <meshStandardMaterial map={stone} color="#c2bcae" roughness={0.9} metalness={0.02} />
      </mesh>
      {/* Cuatro columnas de laca roja. */}
      {[[-2.1, -2.1], [2.1, -2.1], [-2.1, 2.1], [2.1, 2.1]].map(([cx, cz]) => (
        <group key={`${cx},${cz}`} position={[cx!, 0, cz!]}>
          <mesh position={[0, 2.05, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.28, 2.5, 14]} />
            <meshStandardMaterial map={lacquer} color="#c4413a" roughness={0.42} metalness={0.04} emissive="#3a0e0a" emissiveIntensity={0.3} />
          </mesh>
          {/* Zapata dorada: la pieza que reparte el peso del alero sobre la
              columna. Sin ella la columna entra en el tejado a bocajarro. */}
          <mesh position={[0, 3.4, 0]} castShadow>
            <boxGeometry args={[0.65, 0.24, 0.65]} />
            <meshStandardMaterial color="#e2be60" roughness={0.34} metalness={0.05} emissive="#4a3208" emissiveIntensity={0.45} />
          </mesh>
        </group>
      ))}
      {/* Friso: la banda pintada que corre bajo el alero. */}
      <mesh position={[0, 3.72, 0]} castShadow>
        <boxGeometry args={[5.2, 0.38, 5.2]} />
        <meshStandardMaterial map={lacquer} color="#8f2a22" roughness={0.5} metalness={0.03} emissive="#3a0e0a" emissiveIntensity={0.34} />
      </mesh>
      <GlazedRoof span={4.4} rise={1.7} position={[0, 3.94, 0]} />
    </group>
  )
}

/**
 * Ding de bronce: el caldero ritual de tres patas, humeando incienso.
 *
 * El cuerpo va por revolución con un perfil que se ensancha y se cierra en la
 * boca — un ding no es un cilindro, es una panza. Y las asas van ARRIBA, sobre
 * el borde, que es donde las lleva de verdad y lo que lo distingue de una olla.
 */
function BronzeDing({
  position,
  scale = 1,
  surgeRef,
}: {
  position: readonly [number, number, number]
  scale?: number
  surgeRef: RefObject<number>
}) {
  const ember = useRef<MeshBasicMaterial>(null)
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    if (!visible.current || !ember.current) return
    // Latido lento del rescoldo, más el avivón del golpe al Nexo.
    ember.current.opacity = 0.42 + Math.sin(clock.elapsedTime * 0.7) * 0.1 + surgeRef.current * 0.4
  })
  const bodyProfile = useMemo(
    () =>
      [
        [0.02, 0],
        [0.34, 0.04],
        [0.46, 0.2],
        [0.5, 0.42],
        [0.46, 0.62],
        [0.42, 0.76],
        [0.47, 0.82],
        [0.47, 0.88],
      ].map(([r, h]) => new Vector2(r!, h!)),
    [],
  )
  return (
    <group position={[...position]} scale={scale}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[bodyProfile, 20]} />
        <meshStandardMaterial color="#4a5340" roughness={0.52} metalness={0.05} emissive="#1e2410" emissiveIntensity={0.3} side={DoubleSide} />
      </mesh>
      {/* Tres patas, repartidas a 120 grados. */}
      {[0, 1, 2].map((leg) => {
        const angle = (leg / 3) * Math.PI * 2
        return (
          <mesh
            key={leg}
            position={[Math.cos(angle) * 0.3, -0.24, Math.sin(angle) * 0.3]}
            rotation={[0, -angle, 0.12]}
            castShadow
          >
            <cylinderGeometry args={[0.055, 0.085, 0.5, 8]} />
            <meshStandardMaterial color="#3e4636" roughness={0.62} metalness={0.05} />
          </mesh>
        )
      })}
      {/* Dos asas sobre el borde: medio toro cada una, de canto. */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.42, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.13, 0.035, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#5a6349" roughness={0.5} metalness={0.05} />
        </mesh>
      ))}
      {/* La brasa del incienso, dentro. Aviva cuando golpean un Nexo: el sitio
          acusa lo que pasa en la partida sin robarle el aviso de daño. */}
      <mesh position={[0, 0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial ref={ember} color="#ff9a3c" transparent opacity={0.5} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}

/**
 * Farolillos colgados de una percha, meciéndose.
 *
 * El balanceo va con fases distintas por farolillo: si todos oscilaran a la
 * vez se leerían como un objeto solo, y lo que los hace parecer colgados de
 * cuerdas independientes es justo que no se sincronicen.
 */
function Lanterns({ reducedMotion, quality }: { reducedMotion: boolean; quality: GraphicsQuality }) {
  const group = useRef<Group>(null)
  const lamps = useRef<SpriteMaterial[]>([])
  const bodyProfile = useMemo(
    () =>
      [
        [0.04, 0],
        [0.2, 0.08],
        [0.28, 0.28],
        [0.28, 0.52],
        [0.2, 0.72],
        [0.05, 0.8],
      ].map(([r, h]) => new Vector2(r!, h!)),
    [],
  )
  const perchas = useMemo(
    () => [
      { position: [-3.2, 0, -10.6] as const, count: 3, phase: 0 },
      { position: [3.6, 0, -11.4] as const, count: 3, phase: 1.7 },
    ],
    [],
  )
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    const node = group.current
    if (!node || !visible.current) return
    const t = clock.elapsedTime
    let index = 0
    for (const percha of node.children) {
      for (const farol of percha.children) {
        if (!farol.name.startsWith('farol')) continue
        if (!reducedMotion) farol.rotation.z = Math.sin(t * 0.55 + index * 1.3) * 0.12
        const lamp = lamps.current[index]
        if (lamp) lamp.opacity = 0.42 + Math.sin(t * 0.9 + index * 2.1) * 0.14
        index += 1
      }
    }
  })
  if (quality === 'low') return null
  let lampIndex = 0
  return (
    <group ref={group}>
      {perchas.map((percha, pi) => (
        <group key={pi} position={[...percha.position]}>
          {/* El poste y el travesaño de los que cuelgan. */}
          <mesh position={[0, 1.9, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.14, 3.8, 10]} />
            <meshStandardMaterial map={lacquerTexture()} color="#a8342c" roughness={0.5} metalness={0.03} />
          </mesh>
          <mesh position={[0, 3.7, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 2.6, 8]} />
            <meshStandardMaterial color="#e2be60" roughness={0.36} metalness={0.05} emissive="#4a3208" emissiveIntensity={0.4} />
          </mesh>
          {Array.from({ length: percha.count }, (_, li) => {
            const x = (li - (percha.count - 1) / 2) * 0.95
            const current = lampIndex
            lampIndex += 1
            return (
              <group key={li} name={`farol-${li}`} position={[x, 3.62, 0]}>
                {/* Cordón. */}
                <mesh position={[0, -0.16, 0]}>
                  <cylinderGeometry args={[0.012, 0.012, 0.32, 5]} />
                  <meshStandardMaterial color="#3a2a18" roughness={0.9} metalness={0} />
                </mesh>
                {/* Cuerpo de seda: panza por revolución, no una esfera. */}
                <mesh position={[0, -0.72, 0]} castShadow>
                  <latheGeometry args={[bodyProfile, 14]} />
                  <meshStandardMaterial
                    color="#d8342c"
                    roughness={0.66}
                    metalness={0}
                    emissive="#ff5a2a"
                    emissiveIntensity={1.5}
                    side={DoubleSide}
                  />
                </mesh>
                {/* Aros de arriba y de abajo. */}
                {[-0.34, -0.78].map((y, ri) => (
                  <mesh key={ri} position={[0, y - 0.06, 0]}>
                    <cylinderGeometry args={[0.09, 0.09, 0.05, 10]} />
                    <meshStandardMaterial color="#e2be60" roughness={0.34} metalness={0.05} />
                  </mesh>
                ))}
                {/* Borla. */}
                <mesh position={[0, -0.96, 0]}>
                  <coneGeometry args={[0.05, 0.18, 6]} />
                  <meshStandardMaterial color="#e2be60" roughness={0.5} metalness={0.04} />
                </mesh>
                <sprite position={[0, -0.7, 0]} scale={[2.6, 2.6, 1]}>
                  <spriteMaterial
                    ref={(m) => {
                      if (m) lamps.current[current] = m
                    }}
                    map={glowTexture('ember')}
                    transparent
                    opacity={0.45}
                    blending={AdditiveBlending}
                    depthWrite={false}
                  />
                </sprite>
              </group>
            )
          })}
        </group>
      ))}
    </group>
  )
}

/**
 * Balaustrada de la terraza: postes rematados en bola con paneles calados
 * entre ellos. Rodea el borde del tablero y le da altura.
 *
 * Se descarta el sector cercano a la cámara (`sin(angle) > 0.12`): la cámara
 * mira desde z positivo, así que ese arco cae ENTRE el jugador y el tablero.
 */
function Balustrade({ quality }: { quality: GraphicsQuality }) {
  const stone = mossStoneTexture()
  const postes = useMemo(() => {
    const total = quality === 'low' ? 14 : 26
    const puestos: { angle: number }[] = []
    for (let index = 0; index < total; index += 1) {
      const angle = (index / total) * Math.PI * 2
      if (Math.sin(angle) > 0.12) continue
      puestos.push({ angle })
    }
    return puestos
  }, [quality])
  const radius = TERRACE_RADIUS + 0.28
  return (
    <group>
      {postes.map((poste, index) => (
        <group
          key={index}
          position={[Math.cos(poste.angle) * radius, 0, Math.sin(poste.angle) * radius]}
          rotation={[0, -poste.angle, 0]}
        >
          <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.16, 0.6, 0.16]} />
            <meshStandardMaterial map={stone} bumpMap={stone} bumpScale={1.6} color="#c6c0b2" roughness={0.9} metalness={0.02} />
          </mesh>
          {/* Remate en bola: el detalle que convierte un poste en balaustre. */}
          <mesh position={[0, 0.68, 0]} castShadow>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial map={stone} color="#d2ccbe" roughness={0.86} metalness={0.02} />
          </mesh>
          {/* Panel calado hacia el siguiente poste. */}
          <mesh position={[0, 0.34, 0.42]} castShadow receiveShadow>
            <boxGeometry args={[0.07, 0.34, 0.7]} />
            <meshStandardMaterial map={stone} color="#bab4a6" roughness={0.92} metalness={0.02} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Grullas: dos siluetas cruzando el patio muy alto, al fondo. */
function Cranes({ reducedMotion, quality }: { reducedMotion: boolean; quality: GraphicsQuality }) {
  const flock = useRef<Group>(null)
  const birds = useMemo(
    () => [
      { radius: 15, height: 5.2, speed: 0.085, phase: 0.4 },
      { radius: 19, height: 6.1, speed: 0.062, phase: 3.4 },
    ],
    [],
  )
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    const node = flock.current
    if (!node || reducedMotion || !visible.current) return
    const t = clock.elapsedTime
    node.children.forEach((child, index) => {
      const bird = birds[index]
      if (!bird) return
      const angle = bird.phase + t * bird.speed
      child.position.set(Math.cos(angle) * bird.radius, bird.height, Math.sin(angle) * bird.radius - 8)
      child.rotation.y = -angle
    })
  })
  if (quality === 'low') return null
  return (
    <group ref={flock}>
      {birds.map((bird, index) => (
        <group key={index} position={[bird.radius, bird.height, 0]}>
          {/* Cuello estirado hacia delante y patas hacia atrás: es la silueta
              de una grulla en vuelo, y lo que la distingue de una gaviota. */}
          <mesh position={[0.3, 0, 0]}>
            <boxGeometry args={[0.5, 0.035, 0.035]} />
            <meshBasicMaterial color="#f2ece0" fog={false} />
          </mesh>
          <mesh position={[-0.34, 0, 0]}>
            <boxGeometry args={[0.42, 0.025, 0.025]} />
            <meshBasicMaterial color="#2a2620" fog={false} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} rotation={[0, 0, side * 0.28]} position={[0, 0, side * 0.24]}>
              <planeGeometry args={[0.34, 0.42]} />
              <meshBasicMaterial color="#f2ece0" side={DoubleSide} transparent opacity={0.92} fog={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/** Losas grises del patio, más allá de la terraza vidriada. */
function CourtyardGround() {
  const stone = useMemo(() => {
    const clone = mossStoneTexture().clone()
    clone.needsUpdate = true
    clone.wrapS = RepeatWrapping
    clone.wrapT = RepeatWrapping
    clone.repeat.set(16, 16)
    return clone
  }, [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <circleGeometry args={[56, 64]} />
      <meshStandardMaterial map={stone} bumpMap={stone} bumpScale={2} color="#9e9a8e" roughness={0.92} metalness={0.02} />
    </mesh>
  )
}

/** La terraza de losa vidriada donde se juega, con su canto y su zócalo. */
function Terrace() {
  const stone = mossStoneTexture()
  return (
    <group>
      <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[TERRACE_RADIUS, TERRACE_RADIUS * 0.98, 0.44, 64]} />
        <meshStandardMaterial map={stone} bumpMap={stone} bumpScale={2.4} color="#b6b0a2" roughness={0.9} metalness={0.02} />
      </mesh>
      <mesh position={[0, -0.56, 0]} receiveShadow>
        <cylinderGeometry args={[TERRACE_RADIUS * 1.06, TERRACE_RADIUS * 1.12, 0.24, 64]} />
        <meshStandardMaterial map={stone} color="#8e8a7e" roughness={0.94} metalness={0.02} />
      </mesh>
    </group>
  )
}

export function JadeCourt({ quality, reducedMotion, event }: JadeCourtProps) {
  const surgeRef = useRef(0)
  useEffect(() => {
    if (event?.type === 'nexus-damage' || event?.type === 'victory') surgeRef.current = 1
  }, [event])
  useFrame((_, delta) => {
    surgeRef.current = Math.max(0, surgeRef.current - delta * 1.1)
  })

  return (
    <>
      <color attach="background" args={['#1d2436']} />
      {/* Calima del amanecer. Empieza en 18, ANTES de donde está el decorado
          (farolillos a 11, puerta de la luna a 16, pabellón a 26): si empezara
          después, esas piezas quedarían fuera de la niebla y recortadas contra
          el cielo. Es el fallo que cometí en el Rompiente. */}
      <fog attach="fog" args={['#8f9aa8', 18, 74]} />

      {/* LUZ. Sol de amanecer bajo por la derecha, a unos 33 grados sobre el
          horizonte. La cuenta que gobierna esto: sobre una superficie
          HORIZONTAL como el tablero llega la intensidad por el coseno del
          ángulo con la vertical, así que a 14 grados llegaría solo un 24% (lo
          que dejó el Rompiente casi negro) y a 33 llega un 54%.

          Relleno en 1,04 contra 2,9 de clave: un 36%. El total se queda en
          3,94, por debajo del ~4,3 donde el mapeado ACES empieza a desaturar
          hacia el blanco sobre materiales claros — y aquí hay mucho blanco
          (el muro encalado) y mucho dorado, así que ese techo importa. */}
      <ambientLight intensity={0.44} color="#c2cfe0" />
      <hemisphereLight intensity={0.36} color="#ffe8c8" groundColor="#4a4236" />
      <directionalLight
        position={[13, 9.5, -7]}
        intensity={2.9}
        color="#ffd9a8"
        castShadow={quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0006}
      />
      {/* Rebote frío desde el lado contrario. */}
      <directionalLight position={[-11, 4, 6]} intensity={0.24} color="#8fa8c8" />

      <SkyDome />
      <CourtyardGround />
      <Terrace />
      <Balustrade quality={quality} />

      {/* La puerta de la luna. Va girada hacia la cámara y no de canto: es un
          vano CIRCULAR, y de perfil un círculo se convierte en una raya. Y no
          más a la izquierda de x=-5,4: a esa profundidad (17,8) el margen
          horizontal es 8, pero el muro mide 5 de ancho, así que pasado ese
          punto empieza a salirse por el lado.

          Lleva relleno emisivo cálido porque el sol entra desde la derecha y
          la cara que ve la cámara queda a la sombra. Es el mismo problema del
          faro del Rompiente; allí lo resolví mudándolo de lado, pero aquí no
          puedo: al otro lado está el pabellón. */}
      <MoonGate position={[-5.4, -0.5, -9.6]} rotation={0.62} />
      <Pavilion position={[7.8, -0.5, -8.6]} rotation={-0.5} />
      <Lanterns reducedMotion={reducedMotion} quality={quality} />

      {/* Dos dings flanqueando la terraza, fuera del arco de la cámara. */}
      <BronzeDing position={[-4.6, -0.5, -9.4]} scale={1.25} surgeRef={surgeRef} />
      <BronzeDing position={[4.9, -0.5, -10.2]} scale={1.25} surgeRef={surgeRef} />
      <Cranes reducedMotion={reducedMotion} quality={quality} />

      {quality !== 'low' && (
        <Sparkles
          count={quality === 'high' ? 36 : 16}
          scale={[TERRACE_RADIUS * 2.2, 2.2, TERRACE_RADIUS * 2.2]}
          position={[0, 1, 0]}
          size={2.2}
          speed={reducedMotion ? 0 : 0.14}
          color="#ffe0a8"
          opacity={0.36}
        />
      )}
    </>
  )
}
