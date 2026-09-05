import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { AdditiveBlending, BackSide, DoubleSide, RepeatWrapping } from 'three'
import type { Group, Mesh, MeshStandardMaterial, SpriteMaterial } from 'three'

import type { AnimationEvent } from '../../game'
import type { GraphicsQuality } from '../../store/preferences'
import { BOARD_WORLD_HALF } from '../grid/gridCoordinates'
import { coastSkyTexture, glowTexture, mossStoneTexture, nightWaterTexture, wetSandTexture } from '../textures'
import { usePageVisibility } from '../usePageVisibility'

interface TidalShoreProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  /** Último evento visual en reproducción; el sitio reacciona con discreción. */
  event?: AnimationEvent
}

/**
 * El Rompiente de Nerith: la plataforma de roca que el mar descubre al bajar
 * la marea, al final de la tarde. Es el sitio de Marea, que hasta ahora jugaba
 * prestada en el Fiordo.
 *
 * Lo que lo separa de los otros seis escenarios es el MOVIMIENTO. La Caldera
 * late, el Fiordo está quieto, el Claro respira; aquí todo va y viene con un
 * ritmo largo y regular, porque eso es una marea. Las olas entran, la espuma
 * sube por la roca y se retira, el haz del faro barre. Ningún otro escenario
 * tiene un ciclo así, y es justo la mecánica de la facción hecha decorado.
 *
 * ESCALA. El tablero mide poco más de 7 unidades de lado (media huella 3,68).
 * Todo se mide contra eso: la plataforma llega a 6,4 de radio, el faro está a
 * 17 de distancia y mide 9 de alto.
 *
 * ENCUADRE. La cámara mira 37 grados en picado con un campo que deja apenas
 * unos grados de cielo por encima del horizonte. Consecuencias que condicionan
 * todo lo que hay aquí:
 *  - Lo alto no se ve. El faro se planta LEJOS y a un lado, nunca al fondo
 *    centrado, o quedaría cortado por el borde superior.
 *  - Nada se coloca en el arco cercano a la cámara (z positivo grande), porque
 *    caería entre el jugador y el tablero. Es el fallo que ya tapó el tablero
 *    en el Claro con un tronco y en el Santuario con los monolitos.
 */

/** Radio de la plataforma de roca sobre la que se juega. */
const SHELF_RADIUS = BOARD_WORLD_HALF + 2.7

/** Dónde empieza el mar abierto. */
const SEA_INNER = SHELF_RADIUS + 1.6

/**
 * Cúpula del cielo. Va con `fog={false}`: si la niebla marina se comiera
 * también el cielo, el atardecer —que es todo el color de la escena— se
 * volvería una pared gris.
 *
 * Con `side={BackSide}` basta para verla desde dentro. NO añadir además
 * `scale={[-1,1,1]}`: las dos cosas invierten la geometría y juntas se
 * cancelan, dejando la cúpula invisible sin que salte ningún error.
 */
function SkyDome() {
  return (
    <mesh rotation={[0, 0.6, 0]}>
      <sphereGeometry args={[74, 40, 24]} />
      <meshBasicMaterial map={coastSkyTexture()} side={BackSide} fog={false} />
    </mesh>
  )
}

/**
 * El mar abierto: un anillo enorme alrededor de la plataforma.
 *
 * El oleaje no deforma geometría — sería carísimo para lo poco que se nota a
 * esta distancia. Se hace desplazando el mapa de la textura en dos ritmos
 * distintos, que es lo que da la sensación de que la superficie no se repite.
 */
function OpenSea({ reducedMotion }: { reducedMotion: boolean }) {
  const material = useRef<MeshStandardMaterial>(null)
  const water = useMemo(() => {
    const texture = nightWaterTexture()
    const clone = texture.clone()
    clone.needsUpdate = true
    clone.wrapS = RepeatWrapping
    clone.wrapT = RepeatWrapping
    clone.repeat.set(9, 9)
    return clone
  }, [])
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    if (reducedMotion || !visible.current || !material.current) return
    const t = clock.elapsedTime
    water.offset.set(Math.sin(t * 0.014) * 0.1, t * 0.021)
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <ringGeometry args={[SEA_INNER, 72, 96, 1]} />
      <meshStandardMaterial
        ref={material}
        map={water}
        color="#2c6f80"
        // Muy poca rugosidad para que la luz rasante del sol se estire sobre el
        // agua. Metalness se queda casi a cero: no hay mapa de entorno en
        // ninguna escena, y subirla apagaría el material en vez de brillarlo.
        roughness={0.14}
        metalness={0.04}
        emissive="#123842"
        emissiveIntensity={0.5}
      />
    </mesh>
  )
}

/**
 * El camino de luz del sol sobre el agua: la franja que va del horizonte hasta
 * la orilla. Es lo que ata el cielo con el mar; sin ella el sol del fondo se
 * queda pegado como una calcomanía.
 */
function SunGlitter({ reducedMotion }: { reducedMotion: boolean }) {
  const material = useRef<MeshStandardMaterial>(null)
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    if (reducedMotion || !visible.current || !material.current) return
    material.current.opacity = 0.4 + Math.sin(clock.elapsedTime * 0.5) * 0.08
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.46, -34]}>
      <planeGeometry args={[13, 58]} />
      <meshStandardMaterial
        ref={material}
        color="#ffd9a0"
        transparent
        opacity={0.42}
        blending={AdditiveBlending}
        depthWrite={false}
        emissive="#ffcf90"
        emissiveIntensity={0.8}
      />
    </mesh>
  )
}

/**
 * La plataforma de roca del tablero, con su orla de arena mojada.
 *
 * Tres piezas y no una: la roca de arriba donde se juega, el canto que le da
 * grosor, y la arena que la rodea. Sin el canto, la plataforma se leería como
 * una pegatina plana sobre el mar.
 */
function RockShelf() {
  const stone = mossStoneTexture()
  const sand = useMemo(() => {
    const texture = wetSandTexture()
    const clone = texture.clone()
    clone.needsUpdate = true
    clone.wrapS = RepeatWrapping
    clone.wrapT = RepeatWrapping
    clone.repeat.set(5, 5)
    return clone
  }, [])
  return (
    <group>
      {/* Arena de la orilla: llega hasta donde empieza el mar. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.44, 0]} receiveShadow>
        <circleGeometry args={[SEA_INNER + 0.4, 64]} />
        <meshStandardMaterial map={sand} color="#b6ab8e" roughness={0.72} metalness={0.02} />
      </mesh>
      {/* Cara superior de la roca. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[SHELF_RADIUS, 64]} />
        <meshStandardMaterial map={stone} bumpMap={stone} bumpScale={2.4} color="#6c7f88" roughness={0.5} metalness={0.03} />
      </mesh>
      {/* Canto: el grosor de la plataforma, más oscuro por estar a la sombra. */}
      <mesh position={[0, -0.24, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[SHELF_RADIUS, SHELF_RADIUS * 0.94, 0.45, 64]} />
        <meshStandardMaterial map={stone} bumpMap={stone} bumpScale={3} color="#4e5f68" roughness={0.62} metalness={0.03} />
      </mesh>
    </group>
  )
}

/**
 * La rompiente: el anillo de espuma que sube por el borde de la plataforma y
 * se retira. Es el corazón del sitio.
 *
 * Sube y baja con un seno muy lento (un ciclo cada ~11 segundos). Ese ritmo
 * está elegido para que se note sin distraer: más rápido parecería hervir, y
 * más lento no se leería como movimiento durante una jugada.
 */
function Surf({ reducedMotion, surgeRef }: { reducedMotion: boolean; surgeRef: RefObject<number> }) {
  const foam = useRef<Mesh>(null)
  const material = useRef<MeshStandardMaterial>(null)
  const visible = usePageVisibility()
  useFrame(({ clock }, delta) => {
    if (reducedMotion || !visible.current || !foam.current || !material.current) return
    // El golpe al Nexo levanta la marejada y esta baja sola: el sitio acusa lo
    // que pasa en la partida sin robarle protagonismo al aviso de daño.
    surgeRef.current = Math.max(0, surgeRef.current - delta * 0.9)
    const wave = Math.sin(clock.elapsedTime * 0.57)
    const scale = 1 + wave * 0.035 + surgeRef.current * 0.05
    foam.current.scale.set(scale, 1, scale)
    material.current.opacity = 0.5 + wave * 0.22 + surgeRef.current * 0.25
  })
  return (
    <mesh ref={foam} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
      <ringGeometry args={[SHELF_RADIUS - 0.15, SEA_INNER + 0.5, 72, 1]} />
      <meshStandardMaterial
        ref={material}
        color="#eafaf6"
        transparent
        opacity={0.55}
        depthWrite={false}
        roughness={0.5}
        metalness={0}
        emissive="#bfe8e2"
        emissiveIntensity={0.35}
        side={DoubleSide}
      />
    </mesh>
  )
}

/**
 * El faro, a lo lejos y a un lado. Es el emblema de la facción (la Guardiana
 * del Faro, el Faro de Hueso) y lo que hace que el sitio se reconozca de un
 * vistazo.
 *
 * Dónde va, que no es trivial:
 *  - A la DERECHA (x positivo). El sol entra desde x negativo, así que puesto
 *    a la izquierda la cámara solo veía su cara en sombra: una silueta negra.
 *    Al otro lado le da de frente.
 *  - LEJOS y poco desviado (12 de lado, 24 de fondo). El campo horizontal da
 *    unos 24 grados a cada lado; más abierto y se sale del encuadre sin que
 *    nadie lo vea.
 *  - Nunca del lado de la cámara, donde taparía el tablero como ya pasó con
 *    los troncos del Claro.
 */
function Lighthouse({ reducedMotion, quality }: { reducedMotion: boolean; quality: GraphicsQuality }) {
  const beam = useRef<Group>(null)
  const lamp = useRef<SpriteMaterial>(null)
  const stone = mossStoneTexture()
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    if (reducedMotion || !visible.current) return
    const t = clock.elapsedTime
    // Una vuelta cada ~13 segundos: la cadencia real de un faro, lenta.
    if (beam.current) beam.current.rotation.y = t * 0.48
    // La lámpara palpita al pasar el haz, no de forma constante.
    if (lamp.current) lamp.current.opacity = 0.5 + Math.abs(Math.sin(t * 0.48)) * 0.4
  })
  return (
    <group position={[12, 0, -24]}>
      {/* Islote sobre el que se levanta. */}
      <mesh position={[0, -0.9, 0]} receiveShadow>
        <cylinderGeometry args={[3.4, 4.6, 1.6, 16]} />
        <meshStandardMaterial map={stone} bumpMap={stone} bumpScale={3} color="#7c8d96" roughness={0.9} metalness={0.02} emissive="#2a4652" emissiveIntensity={0.4} flatShading />
      </mesh>
      {/* Fuste: cónico, que es lo que hace que se lea como faro y no como torre. */}
      <mesh position={[0, 3.4, 0]} castShadow>
        <cylinderGeometry args={[0.75, 1.35, 7.2, 18]} />
        <meshStandardMaterial map={stone} color="#d8d2c4" roughness={0.82} metalness={0.02} />
      </mesh>
      {/* Franja roja: sin ella el fuste blanco se pierde contra el cielo claro. */}
      <mesh position={[0, 4.4, 0]}>
        <cylinderGeometry args={[0.79, 0.9, 1.5, 18]} />
        <meshStandardMaterial color="#b8543c" roughness={0.85} metalness={0.02} />
      </mesh>
      {/* Galería y linterna. */}
      <mesh position={[0, 7.2, 0]} castShadow>
        <cylinderGeometry args={[1.05, 1.05, 0.24, 18]} />
        <meshStandardMaterial color="#3c4750" roughness={0.8} metalness={0.04} />
      </mesh>
      <mesh position={[0, 7.9, 0]}>
        <cylinderGeometry args={[0.66, 0.66, 1.2, 14]} />
        <meshStandardMaterial color="#ffe9b8" emissive="#ffd98a" emissiveIntensity={1.6} roughness={0.4} metalness={0} />
      </mesh>
      <mesh position={[0, 8.75, 0]}>
        <coneGeometry args={[0.95, 0.8, 14]} />
        <meshStandardMaterial color="#33404a" roughness={0.85} metalness={0.04} />
      </mesh>
      {/* Resplandor de la lámpara, que es lo que se ve desde lejos. */}
      <sprite position={[0, 7.9, 0]} scale={[7, 7, 1]}>
        <spriteMaterial ref={lamp} map={glowTexture('gold')} transparent opacity={0.6} blending={AdditiveBlending} depthWrite={false} fog={false} />
      </sprite>
      {/* El haz que barre. En calidad baja se quita: es lo primero que sobra. */}
      {quality !== 'low' && (
        <group ref={beam} position={[0, 7.9, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2]} position={[9, 0, 0]}>
            <coneGeometry args={[2.1, 18, 4, 1, true]} />
            <meshBasicMaterial
              color="#ffe6b0"
              transparent
              opacity={0.1}
              blending={AdditiveBlending}
              depthWrite={false}
              side={DoubleSide}
              fog={false}
            />
          </mesh>
        </group>
      )}
    </group>
  )
}

/**
 * Farallones: las rocas que asoman del agua alrededor. Dan escala y rompen la
 * línea del horizonte.
 *
 * Se descarta el sector cercano a la cámara (`sin(angle) > 0.1`). La cámara
 * mira desde z positivo, así que ese arco cae ENTRE el jugador y el tablero, y
 * plantar ahí una roca de tres metros tapa media partida.
 */
function SeaStacks({ quality }: { quality: GraphicsQuality }) {
  const stone = mossStoneTexture()
  const stacks = useMemo(() => {
    const wanted = quality === 'low' ? 5 : 11
    const planted: { position: readonly [number, number, number]; height: number; radius: number; tilt: number }[] = []
    for (let index = 0; index < wanted * 3 && planted.length < wanted; index += 1) {
      const angle = (index / (wanted * 3)) * Math.PI * 2 + (index % 3) * 0.11
      if (Math.sin(angle) > 0.1) continue
      const radius = SEA_INNER + 3.5 + (index % 4) * 3.2
      const height = 1.5 + (index % 5) * 1.1
      planted.push({
        position: [Math.cos(angle) * radius, height / 2 - 0.9, Math.sin(angle) * radius] as const,
        height,
        radius: 0.6 + (index % 3) * 0.4,
        tilt: ((index % 4) - 1.5) * 0.05,
      })
    }
    return planted
  }, [quality])
  return (
    <group>
      {stacks.map((stack, index) => (
        <group key={index} position={stack.position} rotation={[stack.tilt, index * 0.8, stack.tilt * 0.6]}>
          <mesh castShadow receiveShadow>
            {/* Se estrecha hacia arriba: el oleaje come la base, y esa cintura
                es lo que distingue un farallón de un pilar. */}
            <cylinderGeometry args={[stack.radius * 0.78, stack.radius, stack.height, 7]} />
            {/* Color claro y un emisivo frío de relleno: estas rocas están
                A CONTRALUZ (el sol viene de detrás de ellas), así que sin
                ayuda la cámara solo vería su silueta. */}
            <meshStandardMaterial map={stone} bumpMap={stone} bumpScale={3.4} color="#8fa2ab" roughness={0.92} metalness={0.02} emissive="#2a4652" emissiveIntensity={0.45} flatShading />
          </mesh>
          {/* Collar de espuma en la línea de flotación. */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -stack.height / 2 + 0.42, 0]}>
            <ringGeometry args={[stack.radius, stack.radius * 1.7, 14, 1]} />
            <meshBasicMaterial color="#e4f6f2" transparent opacity={0.34} depthWrite={false} side={DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * Gaviotas: dos o tres siluetas dando vueltas muy arriba y muy lejos.
 *
 * Son planos con una V dibujada por geometría, no sprites: a esta distancia lo
 * único que se lee es la silueta, y una V que gira despacio basta para que la
 * escena parezca habitada.
 */
function Gulls({ reducedMotion, quality }: { reducedMotion: boolean; quality: GraphicsQuality }) {
  const flock = useRef<Group>(null)
  const birds = useMemo(
    () =>
      Array.from({ length: quality === 'high' ? 4 : 2 }, (_, index) => ({
        radius: 13 + index * 4.5,
        height: 5.5 + (index % 3) * 1.8,
        speed: 0.1 + (index % 3) * 0.035,
        phase: index * 1.9,
      })),
    [quality],
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
      child.position.set(
        Math.cos(angle) * bird.radius,
        bird.height + Math.sin(t * 0.6 + bird.phase) * 0.5,
        Math.sin(angle) * bird.radius - 6,
      )
      // Se orienta hacia donde vuela, o parecería que va de lado.
      child.rotation.y = -angle
    })
  })
  if (quality === 'low') return null
  return (
    <group ref={flock}>
      {birds.map((bird, index) => (
        <group key={index} position={[bird.radius, bird.height, 0]}>
          {[-1, 1].map((side) => (
            <mesh key={side} rotation={[0, 0, side * 0.5]} position={[side * 0.18, 0, 0]}>
              <planeGeometry args={[0.38, 0.06]} />
              <meshBasicMaterial color="#e8eef2" side={DoubleSide} transparent opacity={0.85} fog={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

export function TidalShore({ quality, reducedMotion, event }: TidalShoreProps) {
  const surgeRef = useRef(0)
  useEffect(() => {
    if (event?.type === 'nexus-damage' || event?.type === 'victory') surgeRef.current = 1
  }, [event])

  return (
    <>
      <color attach="background" args={['#1b3a4e']} />
      {/* Bruma marina. En el Fiordo el fallo fue que la niebla se comía las
          montañas; aquí me pasé al contrario y la puse a empezar en 30, cuando
          los farallones están entre 13 y 28: se quedaban fuera de ella, sin
          niebla que los integrara y a contraluz, o sea como recortes negros
          pegados al horizonte. Empezando en 16 la bruma los envuelve y pasan a
          ser fondo, que es lo suyo. */}
      <fog attach="fog" args={['#7d8f8a', 16, 78]} />

      {/* LUZ. Sol de tarde por la izquierda, en línea con el faro.
          Primer intento: lo puse a [-16, 4.5, -9], o sea a 14 grados sobre el
          horizonte, buscando luz rasante que luciera el relieve de las losas.
          Salió una escena casi negra, y la cuenta explica por qué: sobre una
          superficie HORIZONTAL como el tablero, una luz a 14 grados aporta el
          coseno de 76 grados, un 24% de su intensidad. Sobrecorregí la lección
          de Duna (donde el problema era el contrario, un sol casi vertical).
          A 32 grados el tablero recibe ya un 53% y la luz sigue teniendo
          dirección de sobra para modelar.

          Relleno en 1,08 contra 3,1 de clave: un 35%. El total se queda por
          debajo de 4,3, que es donde el mapeado ACES empieza a desaturar hacia
          el blanco sobre materiales claros y se lleva por delante la textura. */}
      <ambientLight intensity={0.46} color="#9fc4d4" />
      <hemisphereLight intensity={0.34} color="#bfe0ea" groundColor="#4a4436" />
      <directionalLight
        position={[-14, 10, -8]}
        intensity={3.3}
        color="#ffd6a2"
        castShadow={quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0006}
      />
      {/* Rebote frío del mar por el lado contrario, para que la cara en sombra
          no se vaya a negro. */}
      <directionalLight position={[12, 5, 8]} intensity={0.34} color="#7fc4d8" />

      <SkyDome />
      <OpenSea reducedMotion={reducedMotion} />
      <SunGlitter reducedMotion={reducedMotion} />
      <RockShelf />
      <Surf reducedMotion={reducedMotion} surgeRef={surgeRef} />
      <SeaStacks quality={quality} />
      <Lighthouse reducedMotion={reducedMotion} quality={quality} />
      <Gulls reducedMotion={reducedMotion} quality={quality} />

      {quality !== 'low' && (
        <Sparkles
          count={quality === 'high' ? 40 : 18}
          scale={[SHELF_RADIUS * 2.2, 2, SHELF_RADIUS * 2.2]}
          position={[0, 0.9, 0]}
          size={2.2}
          speed={reducedMotion ? 0 : 0.2}
          color="#d8f4ef"
          opacity={0.34}
        />
      )}
    </>
  )
}
