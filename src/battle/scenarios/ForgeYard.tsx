import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { AdditiveBlending, BackSide, DoubleSide, RepeatWrapping } from 'three'
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight, SpriteMaterial } from 'three'

import type { AnimationEvent } from '../../game'
import type { GraphicsQuality } from '../../store/preferences'
import { BOARD_WORLD_HALF } from '../grid/gridCoordinates'
import { basaltTexture, forgeIronTexture, forgeSkyTexture, glowTexture, lavaFloorTexture } from '../textures'
import { usePageVisibility } from '../usePageVisibility'

interface ForgeYardProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  /** Último evento visual en reproducción; el sitio reacciona con discreción. */
  event?: AnimationEvent
}

/**
 * El Patio del Gremio: la explanada de una fundición al anochecer, con el
 * horno encendido y el metal corriendo por su canal. Es el sitio de Forja, que
 * hasta ahora jugaba prestada en la Fragua de la Caldera.
 *
 * POR QUÉ NO ES LA CALDERA, que es la pregunta importante: las dos son fuego y
 * metal, y su propio dosier avisa del choque. La Caldera es VOLCÁNICA — roca
 * partida, lava suelta, calor que nadie gobierna. Esto es INDUSTRIAL: el mismo
 * calor pero encauzado en un canal, medido por un horno y sujeto con tornillos.
 * En la Caldera el fuego manda; aquí lo mandan. Todo lo que hay en esta escena
 * está fabricado y puesto en su sitio: ni una piedra suelta, ni una llama que
 * no salga por donde debe.
 *
 * ESCALA. El tablero mide poco más de 7 unidades de lado (media huella 3,68).
 * La plataforma llega a 6,5 de radio, el horno está a 21 y mide 8.
 *
 * ENCUADRE. La cámara mira 37 grados en picado y deja apenas unos grados de
 * cielo. Consecuencia directa: aquí se construye BAJO. Una fundición pide
 * chimeneas y puentes grúa, y los dos irían por encima del cuadro, así que lo
 * que carga con la identidad del sitio es el canal de colada, que va a ras de
 * suelo y se ve entero.
 */

/** Radio de la plataforma de acero sobre la que se juega. */
const DECK_RADIUS = BOARD_WORLD_HALF + 2.8

/**
 * Cúpula del cielo. `fog={false}` para que la niebla de humo no se coma
 * también el resplandor del horno, que es el color de la escena.
 *
 * Con `side={BackSide}` basta. NO añadir `scale={[-1,1,1]}` además: las dos
 * cosas invierten la geometría y juntas se cancelan, dejando la cúpula
 * invisible sin que salte ningún error.
 */
function SkyDome() {
  return (
    <mesh rotation={[0, -0.4, 0]}>
      <sphereGeometry args={[70, 40, 24]} />
      <meshBasicMaterial map={forgeSkyTexture()} side={BackSide} fog={false} />
    </mesh>
  )
}

/** La explanada de escoria que rodea la plataforma. */
function SlagGround() {
  const slag = useMemo(() => {
    const clone = basaltTexture().clone()
    clone.needsUpdate = true
    clone.wrapS = RepeatWrapping
    clone.wrapT = RepeatWrapping
    clone.repeat.set(14, 14)
    return clone
  }, [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]} receiveShadow>
      <circleGeometry args={[58, 64]} />
      <meshStandardMaterial map={slag} bumpMap={slag} bumpScale={2.4} color="#4a423a" roughness={0.94} metalness={0.03} />
    </mesh>
  )
}

/**
 * La plataforma de acero del tablero: la chapa donde se juega, su canto
 * remachado y un zócalo de hormigón debajo.
 *
 * Tres piezas y no una, igual que en el Rompiente: sin el canto la plataforma
 * se leería como una pegatina plana sobre el suelo.
 */
function SteelDeck() {
  const iron = useMemo(() => {
    const clone = forgeIronTexture().clone()
    clone.needsUpdate = true
    clone.wrapS = RepeatWrapping
    clone.wrapT = RepeatWrapping
    clone.repeat.set(6, 6)
    return clone
  }, [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <circleGeometry args={[DECK_RADIUS, 64]} />
        <meshStandardMaterial map={iron} bumpMap={iron} bumpScale={2.6} color="#736b5d" roughness={0.5} metalness={0.05} />
      </mesh>
      {/* Canto remachado. */}
      <mesh position={[0, -0.26, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[DECK_RADIUS, DECK_RADIUS * 0.98, 0.46, 64]} />
        <meshStandardMaterial map={iron} bumpMap={iron} bumpScale={3.2} color="#575046" roughness={0.58} metalness={0.05} />
      </mesh>
      {/* Zócalo de hormigón: mate y sin brillo, para que el acero de arriba se
          lea como acero por contraste. */}
      <mesh position={[0, -0.62, 0]} receiveShadow>
        <cylinderGeometry args={[DECK_RADIUS * 1.04, DECK_RADIUS * 1.1, 0.3, 64]} />
        <meshStandardMaterial color="#4e483f" roughness={0.96} metalness={0.01} />
      </mesh>
    </group>
  )
}

/**
 * El canal de colada: el metal fundido corriendo alrededor de la plataforma.
 *
 * Es lo que carga con la identidad del sitio. Va a ras de suelo a propósito —
 * el picado de la cámara deja fuera todo lo alto, así que lo que tiene que
 * contar qué sitio es esto tiene que estar abajo. Y es la diferencia con la
 * Caldera en una sola imagen: allí la lava está suelta por el suelo, aquí va
 * ENCAUZADA entre dos muretes.
 */
function PourChannel({ reducedMotion, glowRef }: { reducedMotion: boolean; glowRef: RefObject<number> }) {
  const material = useRef<MeshStandardMaterial>(null)
  const molten = useMemo(() => {
    const clone = lavaFloorTexture().clone()
    clone.needsUpdate = true
    clone.wrapS = RepeatWrapping
    clone.wrapT = RepeatWrapping
    clone.repeat.set(12, 1)
    return clone
  }, [])
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    if (!visible.current || !material.current) return
    if (!reducedMotion) {
      // El metal CORRE: el mapa se desplaza en una sola dirección, sin ir y
      // venir. Un canal de colada no tiene oleaje, tiene caudal.
      molten.offset.setX(-clock.elapsedTime * 0.035)
    }
    // El horno respira y el canal respira con él.
    material.current.emissiveIntensity = 1.5 + glowRef.current * 0.9
  })
  const inner = DECK_RADIUS + 0.9
  return (
    <group position={[0, -0.42, 0]}>
      {/* El metal. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[inner, inner + 1.1, 80, 1]} />
        <meshStandardMaterial
          ref={material}
          map={molten}
          color="#ff9236"
          emissiveMap={molten}
          emissive="#ff6a12"
          emissiveIntensity={1.5}
          roughness={0.4}
          metalness={0.02}
        />
      </mesh>
      {/* Los dos muretes que lo encauzan: sin ellos esto sería lava suelta, o
          sea la Caldera. */}
      {[inner - 0.12, inner + 1.22].map((radius, index) => (
        <mesh key={index} position={[0, 0.13, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[radius, radius, 0.3, 72, 1, true]} />
          <meshStandardMaterial
            map={forgeIronTexture()}
            color="#3f382f"
            roughness={0.86}
            metalness={0.04}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * El alto horno: el hito del sitio.
 *
 * A la DERECHA porque la luz clave entra desde la izquierda: puesto en el lado
 * de la luz, la cámara solo vería su cara en sombra, que es el fallo que dejó
 * al faro del Rompiente como una silueta negra hasta que lo mudé.
 *
 * Y a 8,5 de lado y 20 de fondo, no más abierto, por una cuenta que conviene
 * tener a mano para cualquier cosa que se plante aquí:
 *
 *   la cámara está en z=8,8, así que la PROFUNDIDAD de un objeto en z es
 *   8,8 + |z|. El semiángulo horizontal del encuadre ronda los 24 grados, o
 *   sea que el desvío máximo es `profundidad · tan(24°) ≈ profundidad · 0,45`.
 *
 * Con z=-20 la profundidad es 28,8 y el margen 12,9. En el primer intento puse
 * el horno en x=16 con z=-18 (margen 12) y se quedaba FUERA DE CUADRO: se
 * dibujaba entero y no lo veía nadie, igual que la aurora del Fiordo.
 */
function BlastFurnace({ reducedMotion, quality, glowRef }: { reducedMotion: boolean; quality: GraphicsQuality; glowRef: RefObject<number> }) {
  const iron = forgeIronTexture()
  const mouth = useRef<MeshBasicMaterial>(null)
  const halo = useRef<SpriteMaterial>(null)
  const light = useRef<PointLight>(null)
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    if (!visible.current) return
    // El fuelle: un ciclo lento y otro rápido encima, para que el latido no
    // sea un seno limpio y parezca una máquina y no una animación.
    const t = clock.elapsedTime
    const breath = reducedMotion ? 0.5 : 0.5 + Math.sin(t * 0.42) * 0.32 + Math.sin(t * 1.7) * 0.12
    glowRef.current = breath
    if (mouth.current) mouth.current.opacity = 0.65 + breath * 0.3
    if (halo.current) halo.current.opacity = 0.4 + breath * 0.34
    if (light.current) light.current.intensity = 26 + breath * 22
  })
  return (
    <group position={[8.5, 0, -20]}>
      {/* Cuerpo: tronco de cono, que es la silueta de un alto horno. */}
      <mesh position={[0, 2.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 2.5, 5.2, 14]} />
        {/* El emisivo no es decorativo: el horno está a 29 unidades y de noche,
            y sin él su chapa quedaría como una silueta gris. Al lado tiene una
            boca al rojo, así que estar teñido de naranja es lo correcto. */}
        <meshStandardMaterial map={iron} bumpMap={iron} bumpScale={3} color="#9a8a76" roughness={0.9} metalness={0.04} emissive="#7a3208" emissiveIntensity={0.6} />
      </mesh>
      {/* Anillos de refuerzo: es lo que lo hace leerse como caldera remachada. */}
      {[1.2, 2.6, 4].map((y, index) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[2.32 - index * 0.28, 2.32 - index * 0.28, 0.3, 14]} />
          <meshStandardMaterial map={iron} color="#7e7261" roughness={0.86} metalness={0.04} emissive="#6a2c08" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {/* Chimenea, corta a propósito: alta se saldría del encuadre. */}
      <mesh position={[0, 6.4, 0]} castShadow>
        <cylinderGeometry args={[0.85, 1.15, 2.4, 12]} />
        <meshStandardMaterial map={iron} color="#8a7e6c" roughness={0.9} metalness={0.04} emissive="#5a2408" emissiveIntensity={0.45} />
      </mesh>
      {/* La boca al rojo, mirando al tablero. */}
      <mesh position={[-1.5, 1.5, 1.4]} rotation={[0, -0.5, 0]}>
        <planeGeometry args={[2.4, 2.8]} />
        <meshBasicMaterial ref={mouth} color="#ffb04a" transparent opacity={0.8} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
      </mesh>
      <sprite position={[-1.6, 1.8, 1.6]} scale={[13, 13, 1]}>
        <spriteMaterial ref={halo} map={glowTexture('ember')} transparent opacity={0.5} blending={AdditiveBlending} depthWrite={false} />
      </sprite>
      {/* La luz que el horno echa de verdad sobre la explanada. */}
      {quality !== 'low' && (
        <pointLight ref={light} position={[-2.4, 2, 2.4]} color="#ff8a30" intensity={34} distance={34} decay={2} />
      )}
    </group>
  )
}

/**
 * Volantes de inercia a los lados: dos ruedas grandes girando despacio.
 *
 * Son la «vida» más legible de la escena, y van a media altura y a los lados
 * porque es donde el encuadre las deja verse enteras.
 */
function Flywheels({ reducedMotion, quality }: { reducedMotion: boolean; quality: GraphicsQuality }) {
  const wheels = useRef<Group>(null)
  const iron = forgeIronTexture()
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    const node = wheels.current
    if (!node || reducedMotion || !visible.current) return
    node.children.forEach((child, index) => {
      // Sentidos opuestos y velocidades distintas: dos ruedas girando igual
      // parecerían una copiada, no una máquina con partes.
      child.rotation.z = clock.elapsedTime * (index === 0 ? 0.34 : -0.23)
    })
  })
  if (quality === 'low') return null
  // Mismo cálculo que el horno: desvío máximo ≈ (8,8 + |z|) · 0,45. Los dos
  // estaban en x=±12 con z entre -3 y -6, o sea a 38 y 47 grados del eje:
  // giraban fuera de cuadro sin que se viera ni uno.
  const posiciones: readonly (readonly [number, number, number])[] = [
    [-8.5, 1.9, -18],
    [-3.5, 1.5, -26],
  ]
  return (
    <group ref={wheels}>
      {posiciones.map((position, index) => (
        <group key={index} position={position} rotation={[0, index === 0 ? 0.5 : -0.6, 0]}>
          {/* Llanta. */}
          <mesh castShadow>
            <torusGeometry args={[1.5, 0.19, 8, 26]} />
            <meshStandardMaterial map={iron} color="#7a7062" roughness={0.7} metalness={0.05} emissive="#3a1c08" emissiveIntensity={0.3} />
          </mesh>
          {/* Radios. */}
          {[0, 1, 2, 3, 4, 5].map((spoke) => (
            <mesh key={spoke} rotation={[0, 0, (spoke / 6) * Math.PI * 2]} castShadow>
              <boxGeometry args={[0.11, 2.9, 0.11]} />
              <meshStandardMaterial map={iron} color="#6b6154" roughness={0.74} metalness={0.05} emissive="#3a1c08" emissiveIntensity={0.28} />
            </mesh>
          ))}
          {/* Buje. */}
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.42, 12]} />
            <meshStandardMaterial map={iron} color="#8a8072" roughness={0.6} metalness={0.05} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * Válvulas de vapor: sueltan una bocanada de vez en cuando, cada una a su
 * ritmo. El desfase es lo que las hace parecer una instalación y no un efecto.
 */
function SteamVents({ reducedMotion, quality }: { reducedMotion: boolean; quality: GraphicsQuality }) {
  const group = useRef<Group>(null)
  const vents = useMemo(
    () => [
      { position: [-7.5, -0.3, -8] as const, period: 6.5, phase: 0 },
      { position: [8.5, -0.3, -10] as const, period: 8.2, phase: 3.1 },
      { position: [-10, -0.3, 1] as const, period: 7.4, phase: 5.4 },
    ],
    [],
  )
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    const node = group.current
    if (!node || reducedMotion || !visible.current) return
    const t = clock.elapsedTime
    node.children.forEach((child, index) => {
      const vent = vents[index]
      if (!vent) return
      // Cada bocanada dura ~1,6 s de su periodo; el resto la válvula calla.
      const local = ((t + vent.phase) % vent.period) / 1.6
      const active = local < 1
      const sprite = child as unknown as Mesh
      const material = (sprite as unknown as { material: SpriteMaterial }).material
      if (!active) {
        material.opacity = 0
        return
      }
      material.opacity = Math.sin(local * Math.PI) * 0.32
      sprite.position.y = vent.position[1] + local * 2.6
      sprite.scale.setScalar(1.4 + local * 3)
    })
  })
  if (quality === 'low') return null
  return (
    <group ref={group}>
      {vents.map((vent, index) => (
        <sprite key={index} position={[...vent.position]} scale={[1.4, 1.4, 1]}>
          <spriteMaterial map={glowTexture('gold')} color="#d8d2c6" transparent opacity={0} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}

/**
 * Pilas de lingotes y bidones alrededor del patio.
 *
 * Se descarta el sector cercano a la cámara (`sin(angle) > 0.1`): la cámara
 * mira desde z positivo, así que ese arco cae ENTRE el jugador y el tablero.
 * Es el fallo que ya tapó el tablero en el Claro con un tronco y en el
 * Santuario con los monolitos.
 */
function YardClutter({ quality }: { quality: GraphicsQuality }) {
  const iron = forgeIronTexture()
  const piezas = useMemo(() => {
    const wanted = quality === 'low' ? 6 : 14
    const planted: { position: readonly [number, number, number]; kind: number; scale: number; spin: number }[] = []
    for (let index = 0; index < wanted * 3 && planted.length < wanted; index += 1) {
      const angle = (index / (wanted * 3)) * Math.PI * 2 + (index % 3) * 0.13
      if (Math.sin(angle) > 0.1) continue
      const radius = DECK_RADIUS + 3.4 + (index % 5) * 2.1
      planted.push({
        position: [Math.cos(angle) * radius, -0.4, Math.sin(angle) * radius] as const,
        kind: index % 3,
        scale: 0.8 + (index % 4) * 0.22,
        spin: index * 0.7,
      })
    }
    return planted
  }, [quality])
  return (
    <group>
      {piezas.map((pieza, index) => (
        <group key={index} position={pieza.position} rotation={[0, pieza.spin, 0]} scale={pieza.scale}>
          {pieza.kind === 0 ? (
            // Pila de lingotes: tres tongadas cruzadas, como se apilan de verdad.
            [0, 1, 2].map((row) => (
              <mesh key={row} position={[0, 0.13 + row * 0.24, 0]} rotation={[0, row % 2 === 0 ? 0 : Math.PI / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.5, 0.22, 0.9]} />
                <meshStandardMaterial map={iron} color="#7f7567" roughness={0.66} metalness={0.05} emissive="#4a2208" emissiveIntensity={0.3} />
              </mesh>
            ))
          ) : pieza.kind === 1 ? (
            // Bidón.
            <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.42, 0.42, 1.1, 12]} />
              <meshStandardMaterial map={iron} bumpMap={iron} bumpScale={2} color="#6e6456" roughness={0.8} metalness={0.04} emissive="#4a2208" emissiveIntensity={0.26} />
            </mesh>
          ) : (
            // Yunque sobre su cepo: el objeto más reconocible del gremio.
            <group>
              <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.34, 0.4, 0.6, 10]} />
                <meshStandardMaterial color="#4a3a28" roughness={0.95} metalness={0.02} />
              </mesh>
              <mesh position={[0, 0.72, 0]} castShadow>
                <boxGeometry args={[0.9, 0.26, 0.36]} />
                <meshStandardMaterial map={iron} color="#8a8072" roughness={0.52} metalness={0.05} emissive="#5a2a0c" emissiveIntensity={0.34} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  )
}

export function ForgeYard({ quality, reducedMotion, event }: ForgeYardProps) {
  /** Latido del horno, compartido: el canal y la luz respiran con él. */
  const glowRef = useRef(0.5)
  const surgeRef = useRef(0)
  useEffect(() => {
    if (event?.type === 'nexus-damage' || event?.type === 'victory') surgeRef.current = 1
  }, [event])
  useFrame((_, delta) => {
    surgeRef.current = Math.max(0, surgeRef.current - delta * 1.1)
  })

  return (
    <>
      <color attach="background" args={['#14100c']} />
      {/* Humo en suspensión. Empieza en 14, ANTES de donde está el decorado
          (los volantes a 12, la chatarra a 10-20, el horno a 24): si empezara
          después, esas piezas quedarían fuera de la niebla y a contraluz, o sea
          recortadas en negro. Es el fallo que cometí en el Rompiente. */}
      <fog attach="fog" args={['#3a2b22', 14, 62]} />

      {/* LUZ. Clave cálida y alta por la izquierda, a unos 34 grados: por
          debajo de 30 el tablero recibiría demasiado poco (a 14 grados llega
          solo el 24% de la intensidad, que es lo que dejó el Rompiente casi
          negro en el primer intento) y por encima de 45 se perdería el
          modelado. El relleno se queda en 0,82 contra 2,6 de clave, un 32%,
          porque esto es de noche y el volumen lo tiene que dar el horno.

          El total de luz fija es bajo a propósito: la escena la termina de
          encender el `pointLight` del horno, que además late. Es lo que la
          separa de la Caldera, donde la luz viene de todas partes. */}
      <ambientLight intensity={0.42} color="#b08a68" />
      <hemisphereLight intensity={0.4} color="#c89a70" groundColor="#2a1c12" />
      <directionalLight
        position={[-13, 9, -6]}
        intensity={2.6}
        color="#ffcf9a"
        castShadow={quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0006}
      />

      <SkyDome />
      <SlagGround />
      <PourChannel reducedMotion={reducedMotion} glowRef={glowRef} />
      <SteelDeck />
      <YardClutter quality={quality} />
      <Flywheels reducedMotion={reducedMotion} quality={quality} />
      <BlastFurnace reducedMotion={reducedMotion} quality={quality} glowRef={glowRef} />
      <SteamVents reducedMotion={reducedMotion} quality={quality} />

      {quality !== 'low' && (
        <Sparkles
          count={quality === 'high' ? 46 : 20}
          scale={[DECK_RADIUS * 2.4, 2.6, DECK_RADIUS * 2.4]}
          position={[0, 1.1, 0]}
          size={2.4}
          speed={reducedMotion ? 0 : 0.4}
          color="#ffb347"
          opacity={0.5}
        />
      )}
    </>
  )
}
