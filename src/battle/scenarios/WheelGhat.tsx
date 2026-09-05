import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { AdditiveBlending, BackSide, DoubleSide, RepeatWrapping } from 'three'
import type { Group, SpriteMaterial } from 'three'

import type { AnimationEvent } from '../../game'
import type { GraphicsQuality } from '../../store/preferences'
import { BOARD_WORLD_HALF } from '../grid/gridCoordinates'
import { desertSkyTexture, glowTexture, nightWaterTexture, sandstoneTexture } from '../textures'
import { usePageVisibility } from '../usePageVisibility'

interface WheelGhatProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  /** Último evento visual en reproducción; el sitio reacciona con discreción. */
  event?: AnimationEvent
}

/**
 * La Escalinata de la Rueda: el ghat de un templo al amanecer, con la gran
 * rueda de piedra y las lámparas bajando por el agua. Es el sitio de Samsara,
 * que jugaba prestada en la Necrópolis de Duna — una cosmología india metida
 * en un patio funerario egipcio.
 *
 * QUÉ LO IDENTIFICA. La rueda tallada. Es la forma de la facción (la rueda que
 * no se detiene) hecha piedra, y además es RADIAL: en el juego no hay ninguna
 * otra cosa que lo sea, ni en los suelos ni en el decorado. Y lo segundo, las
 * lámparas de aceite bajando por la corriente, que es a la vez el detalle más
 * reconocible de un ghat y la mejor pieza de movimiento del sitio.
 *
 * POR QUÉ NO ES DUNA, que era la pregunta a resolver: Duna es una necrópolis
 * —piedra seca, tumbas, un tribunal que juzga a los muertos— y esto es un sitio
 * VIVO, con agua corriendo, flores frescas y lámparas encendidas cada mañana.
 * Allí la arena entierra; aquí el río se lleva y devuelve.
 *
 * ENCUADRE. Esto se escribió con las cuentas hechas DESDE EL PRINCIPIO, que es
 * lo que no hice en los tres escenarios anteriores:
 *
 *   Con la cámara en z=8,8 y 37 grados de picado, el borde superior del cuadro
 *   cae en el suelo alrededor de z=-11. NO SE VE NADA DE CIELO. Lo alto y
 *   lejano no cabe: un edificio de 7 metros a 26 de fondo se dibuja entero
 *   fuera de cuadro. Lo que se ve es lo CERCANO Y BAJO — entre 6 y 12 de fondo
 *   y por debajo de unos 4 de alto. En x el margen es `(8,8 + |z|) · 0,45`.
 *
 * Por eso aquí no hay ni un gopuram ni una torre: todo el decorado está a ras,
 * y la pieza que carga con la identidad es una rueda apoyada en el suelo.
 */

/** Radio de la terraza sobre la que se juega. */
const TERRACE_RADIUS = BOARD_WORLD_HALF + 2.85

/**
 * Cúpula del cielo. Reutiliza el cielo del desierto a propósito y sin
 * disimulo: con este encuadre no se ve, así que fabricarle una textura propia
 * sería gastar por gastar. Lo que separa este sitio de Duna está en el suelo,
 * en el agua y en la luz, no en un cielo que nadie mira.
 */
function SkyDome() {
  return (
    <mesh rotation={[0, 2.6, 0]}>
      <sphereGeometry args={[70, 32, 20]} />
      <meshBasicMaterial map={desertSkyTexture()} side={BackSide} fog={false} />
    </mesh>
  )
}

/**
 * LA RUEDA. El hito del sitio, y la única forma radial del juego fuera de las
 * losas.
 *
 * Se apoya de canto en el suelo, ligeramente inclinada hacia atrás, como las
 * ruedas de piedra que flanquean estos templos. Va montada pieza a pieza —
 * llanta, contra-llanta, ocho radios, cubo y las cuentas de la moldura —
 * porque una rueda es exactamente eso y cualquier atajo se nota: un toro con
 * unas rayas encima parecería un salvavidas.
 */
function SunWheel({
  position,
  rotation,
  radius,
}: {
  position: readonly [number, number, number]
  rotation: number
  radius: number
}) {
  const stone = sandstoneTexture()
  const spokes = 8
  return (
    // Inclinada hacia atrás: una rueda de piedra de tres metros no se sostiene
    // perfectamente vertical, y ese ladeo es lo que la asienta en el suelo.
    <group position={[...position]} rotation={[-0.14, rotation, 0]}>
      {/* Llanta exterior y contra-llanta: dos aros concéntricos, que es como
          se labran de verdad. */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[radius, radius * 0.11, 10, 40]} />
        <meshStandardMaterial map={stone} bumpMap={stone} bumpScale={2.4} color="#c49472" roughness={0.92} metalness={0.03} />
      </mesh>
      <mesh castShadow receiveShadow>
        <torusGeometry args={[radius * 0.78, radius * 0.06, 8, 32]} />
        <meshStandardMaterial map={stone} color="#b8886a" roughness={0.92} metalness={0.03} />
      </mesh>
      {/* Ocho radios, cada uno con su ensanchamiento en el arranque. */}
      {Array.from({ length: spokes }, (_, index) => {
        const angle = (index / spokes) * Math.PI * 2
        return (
          <group key={index} rotation={[0, 0, angle]}>
            <mesh position={[0, radius * 0.45, 0]} castShadow>
              <boxGeometry args={[radius * 0.075, radius * 0.9, radius * 0.1]} />
              <meshStandardMaterial map={stone} color="#bd8d6e" roughness={0.9} metalness={0.03} />
            </mesh>
            {/* Voluta del arranque: el ensanche junto al cubo. */}
            <mesh position={[0, radius * 0.24, 0]} castShadow>
              <cylinderGeometry args={[radius * 0.075, radius * 0.075, radius * 0.13, 8]} />
              <meshStandardMaterial map={stone} color="#cc9a78" roughness={0.88} metalness={0.03} />
            </mesh>
          </group>
        )
      })}
      {/* Cubo y su tapa saliente. */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.2, radius * 0.2, radius * 0.16, 14]} />
        <meshStandardMaterial map={stone} color="#c49472" roughness={0.9} metalness={0.03} />
      </mesh>
      <mesh position={[0, 0, radius * 0.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.09, radius * 0.12, radius * 0.1, 12]} />
        <meshStandardMaterial map={stone} color="#d8a882" roughness={0.86} metalness={0.03} />
      </mesh>
      {/* Cuentas de la moldura sobre la llanta: es el detalle que separa una
          rueda labrada de un aro liso, y se ve incluso a esta distancia. */}
      {Array.from({ length: spokes * 3 }, (_, index) => {
        const angle = (index / (spokes * 3)) * Math.PI * 2
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius, radius * 0.12]}
            castShadow
          >
            <sphereGeometry args={[radius * 0.045, 6, 5]} />
            <meshStandardMaterial map={stone} color="#d8a882" roughness={0.88} metalness={0.03} />
          </mesh>
        )
      })}
    </group>
  )
}

/**
 * La escalinata que baja al agua y el propio canal.
 *
 * Los peldaños van hacia ABAJO, que es lo único que este encuadre en picado
 * enseña bien: una escalera que sube se ve de canto y no dice nada, una que
 * baja se lee entera. Es la razón de que el sitio sea un ghat y no un templo.
 */
function GhatSteps({ reducedMotion }: { reducedMotion: boolean }) {
  const stone = useMemo(() => {
    const clone = sandstoneTexture().clone()
    clone.needsUpdate = true
    clone.wrapS = RepeatWrapping
    clone.wrapT = RepeatWrapping
    clone.repeat.set(8, 1)
    return clone
  }, [])
  const water = useMemo(() => {
    const clone = nightWaterTexture().clone()
    clone.needsUpdate = true
    clone.wrapS = RepeatWrapping
    clone.wrapT = RepeatWrapping
    clone.repeat.set(6, 3)
    return clone
  }, [])
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    if (reducedMotion || !visible.current) return
    // El río CORRE: el mapa se desplaza en una sola dirección. Un canal no
    // tiene oleaje de ida y vuelta como el mar del Rompiente.
    water.offset.setX(clock.elapsedTime * 0.026)
  })
  const steps = [0, 1, 2, 3, 4]
  return (
    // A 7,5 y no a 12,5. En el primer intento la escalinata arrancaba en -12,5
    // y el agua caía en -19,5: las dos POR DETRÁS del borde superior del
    // encuadre, que en el suelo cae hacia z=-11. El agua y las lámparas —la
    // mejor pieza de movimiento del sitio— se dibujaban y no las veía nadie.
    // Volví a saltarme mi propia cuenta, y van cuatro.
    //
    // Estar por debajo del suelo NO salva: lo que decide es el ángulo desde la
    // cámara. El agua a 19,5 de fondo y 2,4 por debajo daba -17,9 grados, y el
    // borde superior está en -18,7. Acercada a 13 da -21,6 y entra holgada.
    <group position={[0, 0, -7.5]}>
      {steps.map((step) => (
        <mesh key={step} position={[0, -0.62 - step * 0.26, -step * 0.62]} receiveShadow castShadow>
          <boxGeometry args={[26 - step * 0.8, 0.26, 0.66]} />
          <meshStandardMaterial map={stone} bumpMap={stone} bumpScale={2} color={step % 2 === 0 ? '#c09070' : '#b58868'} roughness={0.94} metalness={0.02} />
        </mesh>
      ))}
      {/* El agua, al pie de la escalinata. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.94, -5.5]} receiveShadow>
        <planeGeometry args={[46, 14]} />
        <meshStandardMaterial
          map={water}
          color="#4a7a86"
          roughness={0.16}
          metalness={0.04}
          emissive="#16323e"
          emissiveIntensity={0.55}
        />
      </mesh>
    </group>
  )
}

/**
 * Las lámparas de aceite bajando por la corriente. Es la vida del sitio.
 *
 * Cada una lleva su hoja, su llama y su reflejo, y todas van a velocidades
 * distintas: si bajaran a la vez se leerían como una fila pintada. Al llegar
 * al final del tramo vuelven al principio, así que el río no se acaba nunca.
 */
function FloatingLamps({ reducedMotion, quality }: { reducedMotion: boolean; quality: GraphicsQuality }) {
  const group = useRef<Group>(null)
  const flames = useRef<SpriteMaterial[]>([])
  const lamps = useMemo(
    () =>
      Array.from({ length: quality === 'high' ? 14 : 7 }, (_, index) => ({
        x: ((index * 37) % 100) / 100 * 30 - 15,
        z: ((index * 53) % 100) / 100 * 5.5 - 2,
        speed: 0.5 + ((index * 29) % 100) / 100 * 0.5,
        phase: ((index * 71) % 100) / 100 * Math.PI * 2,
      })),
    [quality],
  )
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    const node = group.current
    if (!node || !visible.current) return
    const t = clock.elapsedTime
    node.children.forEach((child, index) => {
      const lamp = lamps[index]
      if (!lamp) return
      if (!reducedMotion) {
        // Bajan a lo ancho del canal y vuelven a entrar por el otro lado.
        const recorrido = 34
        child.position.x = ((lamp.x + t * lamp.speed + recorrido) % recorrido) - recorrido / 2
        child.rotation.y = t * 0.2 + lamp.phase
      }
      const flame = flames.current[index]
      // La llama de una lámpara de aceite tiembla deprisa y sin ritmo fijo.
      if (flame) flame.opacity = 0.55 + Math.sin(t * 5.5 + lamp.phase) * 0.16 + Math.sin(t * 11 + lamp.phase) * 0.08
    })
  })
  if (quality === 'low') return null
  return (
    <group ref={group} position={[0, -1.86, -13.4]}>
      {lamps.map((lamp, index) => (
        <group key={index} position={[lamp.x, 0.06, lamp.z]}>
          {/* La hoja sobre la que flota: un disco muy plano y verde. */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.3, 10]} />
            <meshStandardMaterial color="#4e7a4a" roughness={0.8} metalness={0} side={DoubleSide} />
          </mesh>
          {/* El cuenco de barro. */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.16, 0.11, 0.1, 10]} />
            <meshStandardMaterial color="#a8663c" roughness={0.9} metalness={0.02} emissive="#5a2408" emissiveIntensity={0.4} />
          </mesh>
          <sprite position={[0, 0.2, 0]} scale={[1.3, 1.3, 1]}>
            <spriteMaterial
              ref={(m) => {
                if (m) flames.current[index] = m
              }}
              map={glowTexture('ember')}
              transparent
              opacity={0.6}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </sprite>
        </group>
      ))}
    </group>
  )
}

/**
 * Deepstambha: la columna de lámparas de bronce del patio.
 *
 * Tres pisos de brazos, cada uno con su cuenco encendido. Corta a propósito
 * (2,9 de alto): más alta se saldría por arriba del encuadre.
 */
function LampColumn({ position, glowRef }: { position: readonly [number, number, number]; glowRef: RefObject<number> }) {
  const halo = useRef<SpriteMaterial>(null)
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    if (!visible.current || !halo.current) return
    halo.current.opacity = 0.4 + Math.sin(clock.elapsedTime * 1.6) * 0.1 + glowRef.current * 0.3
  })
  const tiers = [1.15, 1.85, 2.5]
  return (
    <group position={[...position]}>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.5, 0.32, 12]} />
        <meshStandardMaterial map={sandstoneTexture()} color="#b8886a" roughness={0.92} metalness={0.02} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.15, 2.7, 10]} />
        <meshStandardMaterial color="#7d6a3c" roughness={0.5} metalness={0.05} emissive="#3a2a08" emissiveIntensity={0.4} />
      </mesh>
      {tiers.map((y, tier) => (
        <group key={y} position={[0, y, 0]} rotation={[0, tier * 0.4, 0]}>
          {Array.from({ length: 4 }, (_, arm) => {
            const angle = (arm / 4) * Math.PI * 2
            const reach = 0.46 - tier * 0.07
            return (
              <group key={arm} position={[Math.cos(angle) * reach, 0, Math.sin(angle) * reach]}>
                <mesh rotation={[0, -angle, Math.PI / 2]}>
                  <cylinderGeometry args={[0.03, 0.03, reach * 2, 6]} />
                  <meshStandardMaterial color="#7d6a3c" roughness={0.5} metalness={0.05} />
                </mesh>
                {/* El cuenco y su llama. */}
                <mesh position={[0, 0.07, 0]}>
                  <cylinderGeometry args={[0.09, 0.06, 0.07, 8]} />
                  <meshStandardMaterial color="#8f7a44" roughness={0.5} metalness={0.05} emissive="#6a3a08" emissiveIntensity={0.6} />
                </mesh>
                <mesh position={[0, 0.15, 0]}>
                  <coneGeometry args={[0.035, 0.11, 6]} />
                  <meshBasicMaterial color="#ffcf7a" transparent opacity={0.9} blending={AdditiveBlending} depthWrite={false} />
                </mesh>
              </group>
            )
          })}
        </group>
      ))}
      <sprite position={[0, 1.9, 0]} scale={[4.4, 4.4, 1]}>
        <spriteMaterial ref={halo} map={glowTexture('ember')} transparent opacity={0.45} blending={AdditiveBlending} depthWrite={false} />
      </sprite>
    </group>
  )
}

/**
 * Guirnaldas de caléndula colgadas entre postes, meciéndose.
 *
 * La curva de cada guirnalda se dibuja con las propias flores: se colocan
 * siguiendo una parábola, y son más las de los extremos y menos las del centro
 * porque una cuerda colgada se comba. Sin esa comba parecería una barra.
 */
function Garlands({ reducedMotion, quality }: { reducedMotion: boolean; quality: GraphicsQuality }) {
  const group = useRef<Group>(null)
  const tendidos = useMemo(
    () => [
      { from: [-7.4, 2.5, -7.6] as const, to: [-2.6, 2.5, -9.4] as const, sag: 0.62, phase: 0 },
      { from: [2.6, 2.5, -9.4] as const, to: [7.4, 2.5, -7.6] as const, sag: 0.58, phase: 2.2 },
    ],
    [],
  )
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    const node = group.current
    if (!node || reducedMotion || !visible.current) return
    const t = clock.elapsedTime
    node.children.forEach((child, index) => {
      const tendido = tendidos[index]
      if (!tendido) return
      child.rotation.z = Math.sin(t * 0.5 + tendido.phase) * 0.035
    })
  })
  if (quality === 'low') return null
  const cuentas = 16
  return (
    <group ref={group}>
      {tendidos.map((tendido, index) => (
        <group key={index}>
          {Array.from({ length: cuentas }, (_, bead) => {
            const t = bead / (cuentas - 1)
            const x = tendido.from[0] + (tendido.to[0] - tendido.from[0]) * t
            const z = tendido.from[2] + (tendido.to[2] - tendido.from[2]) * t
            // Parábola: cero en los extremos y máximo en el centro.
            const y = tendido.from[1] - Math.sin(t * Math.PI) * tendido.sag
            const naranja = bead % 3 !== 2
            return (
              <mesh key={bead} position={[x, y, z]}>
                <sphereGeometry args={[0.075 + (bead % 3) * 0.012, 7, 6]} />
                <meshStandardMaterial
                  color={naranja ? '#ff8f2e' : '#e8d44a'}
                  roughness={0.86}
                  metalness={0}
                  emissive={naranja ? '#7a3208' : '#6a5c08'}
                  emissiveIntensity={0.42}
                />
              </mesh>
            )
          })}
          {/* Los dos postes de los que cuelga. */}
          {[tendido.from, tendido.to].map((end, side) => (
            <mesh key={side} position={[end[0], 1.25, end[2]]} castShadow>
              <cylinderGeometry args={[0.07, 0.09, 2.5, 8]} />
              <meshStandardMaterial color="#8f6a44" roughness={0.88} metalness={0.02} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/** El patio de arenisca más allá de la terraza. */
function CourtyardGround() {
  const stone = useMemo(() => {
    const clone = sandstoneTexture().clone()
    clone.needsUpdate = true
    clone.wrapS = RepeatWrapping
    clone.wrapT = RepeatWrapping
    clone.repeat.set(14, 14)
    return clone
  }, [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]} receiveShadow>
      <circleGeometry args={[50, 56]} />
      <meshStandardMaterial map={stone} bumpMap={stone} bumpScale={2.2} color="#8a6a5a" roughness={0.94} metalness={0.02} />
    </mesh>
  )
}

/** La terraza donde se juega, con su canto moldurado. */
function Terrace() {
  const stone = sandstoneTexture()
  return (
    <group>
      <mesh position={[0, -0.26, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[TERRACE_RADIUS, TERRACE_RADIUS * 0.97, 0.46, 56]} />
        <meshStandardMaterial map={stone} bumpMap={stone} bumpScale={2.4} color="#bd8d6e" roughness={0.92} metalness={0.02} />
      </mesh>
      {/* Moldura: el vuelo que separa la terraza del suelo del patio. */}
      <mesh position={[0, -0.04, 0]} castShadow>
        <cylinderGeometry args={[TERRACE_RADIUS * 1.03, TERRACE_RADIUS * 1.03, 0.1, 56]} />
        <meshStandardMaterial map={stone} color="#d2a17e" roughness={0.88} metalness={0.02} />
      </mesh>
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[TERRACE_RADIUS * 1.08, TERRACE_RADIUS * 1.14, 0.24, 56]} />
        <meshStandardMaterial map={stone} color="#9a7256" roughness={0.95} metalness={0.02} />
      </mesh>
    </group>
  )
}

export function WheelGhat({ quality, reducedMotion, event }: WheelGhatProps) {
  const glowRef = useRef(0)
  useEffect(() => {
    if (event?.type === 'nexus-damage' || event?.type === 'victory') glowRef.current = 1
  }, [event])
  useFrame((_, delta) => {
    glowRef.current = Math.max(0, glowRef.current - delta * 1.1)
  })

  return (
    <>
      <color attach="background" args={['#2a2438']} />
      {/* Bruma del amanecer sobre el río. Empieza en 12, ANTES de todo el
          decorado (ruedas a 8, lámparas a 10,5, escalinata a 12,5): si empezara
          después, esas piezas quedarían fuera de ella y recortadas.

          Y es FRÍA, no cálida. En el primer intento la puse del color de la
          arenisca y, sumada a una luz también cálida sobre una piedra ya de por
          sí anaranjada, la escena entera salió del mismo óxido: suelo, terraza,
          tablero y ruedas indistinguibles. La bruma de un río al amanecer es
          azulada, y esa frialdad es justo lo que devuelve la profundidad. */}
      <fog attach="fog" args={['#9aa4b8', 12, 58]} />

      {/* LUZ. Sol de amanecer bajo por la izquierda, a unos 34 grados sobre el
          horizonte: por debajo de 30 el tablero recibiría demasiado poco (a 14
          grados llega solo el 24% de la intensidad sobre una superficie
          horizontal) y por encima de 45 se perdería el modelado del mandala,
          que es un relieve MUY plano y necesita luz con dirección para verse.

          Relleno en 1,02 contra 3 de clave: un 34%. El total se queda en 4,02,
          por debajo del ~4,3 donde el mapeado ACES desatura hacia el blanco —
          y aquí importa, porque la arenisca rosada es un material claro.

          EL RELLENO VA FRÍO, y esto no es un adorno. La primera versión lo
          tenía cálido como la clave, y con una piedra que ya es anaranjada el
          resultado fue una escena de un solo tono en la que no se distinguía
          nada. El sol calienta lo que ilumina; lo que queda en sombra lo
          alumbra el CIELO, que es azul. Ese contraste es lo único que da
          volumen aquí, porque no hay ni un material frío en todo el sitio
          salvo el agua. */}
      <ambientLight intensity={0.44} color="#93a4cc" />
      <hemisphereLight intensity={0.34} color="#aabfe0" groundColor="#5e3a24" />
      <directionalLight
        position={[-12, 9, -5]}
        intensity={3}
        color="#ffd4a0"
        castShadow={quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0006}
      />
      {/* Rebote índigo desde el río, por el lado contrario. */}
      <directionalLight position={[10, 3, 7]} intensity={0.34} color="#7d8ad0" />

      <SkyDome />
      <CourtyardGround />
      <GhatSteps reducedMotion={reducedMotion} />
      <FloatingLamps reducedMotion={reducedMotion} quality={quality} />
      <Terrace />

      {/* Las dos ruedas, a los lados. A 8 de fondo la profundidad es 16,8 y el
          margen en x llega a 7,5, así que 6,2 las deja dentro con holgura. La
          de la derecha es algo menor: dos piezas idénticas y simétricas se leen
          como un decorado copiado, y basta un 15% de diferencia para que
          parezcan dos ruedas y no una duplicada. */}
      <SunWheel position={[-6.2, 1.7, -8]} rotation={0.42} radius={2.15} />
      <SunWheel position={[6.4, 1.5, -8.6]} rotation={-0.36} radius={1.85} />

      <LampColumn position={[-3.4, -0.5, -10.8]} glowRef={glowRef} />
      <LampColumn position={[3.6, -0.5, -11.2]} glowRef={glowRef} />
      <Garlands reducedMotion={reducedMotion} quality={quality} />

      {quality !== 'low' && (
        <Sparkles
          count={quality === 'high' ? 34 : 15}
          scale={[TERRACE_RADIUS * 2.2, 2, TERRACE_RADIUS * 2.2]}
          position={[0, 0.9, 0]}
          size={2.2}
          speed={reducedMotion ? 0 : 0.16}
          color="#ffd08a"
          opacity={0.38}
        />
      )}
    </>
  )
}
