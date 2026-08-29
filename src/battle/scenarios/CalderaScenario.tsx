import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, BackSide, DoubleSide, RepeatWrapping } from 'three'
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight } from 'three'
import type { AnimationEvent } from '../../game'
import type { GraphicsQuality } from '../../store/preferences'
import { BOARD_WORLD_HALF } from '../grid/gridCoordinates'
import { basaltTexture, forgeIronTexture, glowTexture, lavaFloorTexture } from '../textures'
import { usePageVisibility } from '../usePageVisibility'

interface CalderaScenarioProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  event?: AnimationEvent
}

/** Radio de la plataforma de fragua: el tablero más un andén de trabajo. */
const DECK_RADIUS = BOARD_WORLD_HALF + 1.15

const IRON = { color: '#4d423a', roughness: 0.5, metalness: 0.8, emissive: '#5a1c06', emissiveIntensity: 0.35 } as const

const repeated = (texture: ReturnType<typeof basaltTexture>, x: number, y: number) => {
  const copy = texture.clone()
  copy.needsUpdate = true
  copy.wrapS = RepeatWrapping
  copy.wrapT = RepeatWrapping
  copy.repeat.set(x, y)
  return copy
}

/**
 * El lago de lava. Es la fuente de luz del sitio: la textura se desplaza en
 * dos direcciones a distinta velocidad (la corriente no es uniforme) y su
 * emisión respira, así que el resplandor que sube hasta el tablero cambia solo.
 */
function LavaLake({ flare, reducedMotion }: { flare: { readonly current: number }; reducedMotion: boolean }) {
  const lava = useMemo(() => {
    const texture = lavaFloorTexture().clone()
    texture.needsUpdate = true
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(3, 3)
    return texture
  }, [])
  const material = useRef<MeshStandardMaterial>(null)
  const visible = usePageVisibility()
  useFrame(({ clock }, delta) => {
    const node = material.current
    if (!node) return
    const breathe = reducedMotion || !visible.current ? 0 : Math.sin(clock.elapsedTime * 0.7) * 0.25
    node.emissiveIntensity = 1.35 + breathe + flare.current * 0.9
    const map = node.map
    if (!map || reducedMotion || !visible.current) return
    map.offset.x += delta * 0.008
    map.offset.y -= delta * 0.013
  })
  return (
    <mesh position={[0, -2.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[30, 56]} />
      <meshStandardMaterial ref={material} map={lava} emissiveMap={lava} emissive="#ff7a2a" emissiveIntensity={1.35} roughness={0.8} metalness={0.1} />
    </mesh>
  )
}

/**
 * Plataforma de trabajo: disco de basalto ceñido por un zuncho de hierro, con
 * las vigas que lo sostienen sobre la lava. Nada de esto existía antes — la
 * Caldera reutilizaba la losa del Santuario con otro color.
 */
function ForgeDeck({ quality }: { quality: GraphicsQuality }) {
  const basalt = useMemo(() => repeated(basaltTexture(), 5, 5), [])
  const iron = useMemo(() => repeated(forgeIronTexture(), 8, 1), [])
  return (
    <group>
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={quality !== 'low'}>
        <circleGeometry args={[DECK_RADIUS, 48]} />
        <meshStandardMaterial map={basalt} color="#6b5b52" roughness={0.92} metalness={0.12} emissive="#3a1004" emissiveIntensity={0.35} />
      </mesh>
      {/* Zuncho de hierro: el canto de la plataforma, remachado. */}
      <mesh position={[0, -0.34, 0]}>
        <cylinderGeometry args={[DECK_RADIUS + 0.06, DECK_RADIUS + 0.06, 0.58, 48, 1, true]} />
        <meshStandardMaterial map={iron} {...IRON} side={DoubleSide} />
      </mesh>
      <mesh position={[0, -0.72, 0]}>
        <cylinderGeometry args={[DECK_RADIUS - 0.05, DECK_RADIUS - 0.75, 0.7, 32]} />
        <meshStandardMaterial map={basalt} color="#2a1a15" roughness={0.95} metalness={0.1} emissive="#5a1a06" emissiveIntensity={0.5} />
      </mesh>
      {/* Vigas radiales hacia la roca: la plataforma está colgada, no flotando. */}
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2 + 0.4
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * (DECK_RADIUS + 2.2), -1.35, Math.sin(angle) * (DECK_RADIUS + 2.2)]}
            rotation={[0, -angle, 0.14]}
          >
            <boxGeometry args={[5.4, 0.24, 0.36]} />
            <meshStandardMaterial map={iron} {...IRON} />
          </mesh>
        )
      })}
    </group>
  )
}

/**
 * Columnas prismáticas de basalto alrededor, de alturas muy distintas: son la
 * silueta que identifica el sitio de un vistazo, como los monolitos lo son en
 * el Santuario. Las más cercanas a la cámara se quedan bajas para no tapar.
 */
function BasaltColumns({ quality }: { quality: GraphicsQuality }) {
  const basalt = useMemo(() => repeated(basaltTexture(), 1, 3), [])
  const columns = useMemo(() => {
    const count = quality === 'low' ? 9 : 16
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 + 0.31
      // sin(angle) > 0 es el lado de la cámara: ahí las columnas son tocones.
      const towardCamera = Math.sin(angle) > -0.1
      return {
        angle,
        radius: DECK_RADIUS + 4.6 + (index % 4) * 2.2,
        height: towardCamera ? 0.8 + (index % 3) * 0.45 : 3.2 + (index % 5) * 1.9,
        width: 0.5 + (index % 3) * 0.2,
        tilt: ((index % 5) - 2) * 0.035,
        hot: index % 4 === 0,
      }
    })
  }, [quality])
  return (
    <group>
      {columns.map((column, index) => (
        <mesh
          key={index}
          position={[Math.cos(column.angle) * column.radius, column.height / 2 - 1.4, Math.sin(column.angle) * column.radius]}
          rotation={[column.tilt, column.angle, column.tilt * 0.7]}
        >
          <cylinderGeometry args={[column.width, column.width * 1.08, column.height, 6]} />
          <meshStandardMaterial
            map={basalt}
            color="#3b2a24"
            roughness={0.95}
            metalness={0.08}
            emissive={column.hot ? '#a83208' : '#2c0d03'}
            emissiveIntensity={column.hot ? 0.28 : 0.14}
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * El yunque colosal del fondo, tras el Nexo rival, con su martillo suspendido.
 * Ocupa el sitio que en el Santuario ocupa el dolmen: cada escenario tiene un
 * hito propio en el mismo lugar, para que la lectura del tablero no cambie.
 */
function GreatAnvil({ flare, quality, reducedMotion }: { flare: { readonly current: number }; quality: GraphicsQuality; reducedMotion: boolean }) {
  const hammer = useRef<Group>(null)
  const glow = useRef<Mesh>(null)
  const light = useRef<PointLight>(null)
  const iron = useMemo(() => repeated(forgeIronTexture(), 2, 1), [])
  const basalt = useMemo(() => repeated(basaltTexture(), 2, 2), [])
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    if (!visible.current) return
    const swing = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.55) * 0.16
    if (hammer.current) hammer.current.rotation.z = swing
    const heat = reducedMotion ? 0 : (Math.sin(clock.elapsedTime * 1.8) + 1) * 0.12
    if (glow.current) {
      const material = glow.current.material as MeshBasicMaterial
      material.opacity = 0.45 + heat + flare.current * 0.4
    }
    if (light.current) light.current.intensity = 26 + heat * 40 + flare.current * 40
  })
  const z = -(BOARD_WORLD_HALF + 4.2)
  return (
    <group position={[-4.6, -0.75, z]} rotation={[0, 0.5, 0]} scale={0.85}>
      {/* Cepo de piedra. */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[1.15, 1.45, 1.1, 10]} />
        <meshStandardMaterial map={basalt} color="#3a2a24" roughness={0.95} metalness={0.1} />
      </mesh>
      {/* Yunque: base, cintura y tabla, con el cuerno hacia el tablero. */}
      <mesh position={[0, 1.22, 0]}>
        <boxGeometry args={[2.5, 0.34, 1.3]} />
        <meshStandardMaterial map={iron} {...IRON} />
      </mesh>
      <mesh position={[0, 1.52, 0]}>
        <boxGeometry args={[1.5, 0.3, 0.95]} />
        <meshStandardMaterial map={iron} {...IRON} />
      </mesh>
      <mesh position={[0, 1.85, 0]}>
        <boxGeometry args={[3.1, 0.42, 1.15]} />
        <meshStandardMaterial map={iron} {...IRON} />
      </mesh>
      <mesh position={[1.85, 1.85, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.5, 1.1, 12]} />
        <meshStandardMaterial map={iron} {...IRON} />
      </mesh>
      {/* Pieza al rojo sobre la tabla: el foco cálido del fondo. */}
      <mesh position={[-0.5, 2.12, 0]}>
        <boxGeometry args={[1.1, 0.14, 0.5]} />
        <meshStandardMaterial color="#ff8a2c" emissive="#ff5a10" emissiveIntensity={2.6} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh ref={glow} position={[-0.5, 2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 24]} />
        <meshBasicMaterial map={glowTexture('ember')} transparent opacity={0.5} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Martillo colgado de una cadena, balanceándose muy despacio. */}
      <group ref={hammer} position={[-2.5, 4.4, 0]}>
        {Array.from({ length: 5 }, (_, index) => (
          <mesh key={index} position={[0, -index * 0.34, 0]} rotation={[index % 2 === 0 ? 0 : Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.15, 0.045, 6, 12]} />
            <meshStandardMaterial {...IRON} />
          </mesh>
        ))}
        <mesh position={[0, -1.9, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 1.5, 8]} />
          <meshStandardMaterial color="#4a3a2c" roughness={0.9} metalness={0.2} />
        </mesh>
        <mesh position={[0, -2.7, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.5, 0.85, 0.5]} />
          <meshStandardMaterial map={iron} {...IRON} />
        </mesh>
      </group>
      <pointLight ref={light} position={[-0.5, 2.6, 0.9]} color="#ff7a24" intensity={26} distance={14} decay={2} />
      {quality !== 'low' && (
        <Sparkles count={quality === 'high' ? 34 : 16} scale={[2.2, 1.6, 1.2]} size={2.6} speed={reducedMotion ? 0 : 1.1} color="#ffcf7a" opacity={0.85} position={[-0.5, 2.5, 0]} />
      )}
    </group>
  )
}

/** Chorro de vapor que sale de una fisura y se disipa al subir. */
function SteamVent({ position, delay, reducedMotion }: { position: readonly [number, number, number]; delay: number; reducedMotion: boolean }) {
  const puffs = useRef<Group>(null)
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    const node = puffs.current
    if (!node || reducedMotion || !visible.current) return
    node.children.forEach((child, index) => {
      // Cada bocanada recorre el mismo trayecto desfasada: sube, se ensancha y se apaga.
      const life = ((clock.elapsedTime * 0.35 + delay + index * 0.33) % 1)
      child.position.y = life * 4.2
      const spread = 1.1 + life * 3.4
      child.scale.set(spread, spread, 1)
      const sprite = child as unknown as { material: MeshBasicMaterial }
      sprite.material.opacity = Math.sin(life * Math.PI) * 0.55
    })
  })
  return (
    <group position={[position[0], position[1], position[2]]} ref={puffs}>
      {Array.from({ length: 3 }, (_, index) => (
        <sprite key={index} scale={[1, 1, 1]}>
          <spriteMaterial map={glowTexture('ember')} color="#e6ddd2" transparent opacity={0.4} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}

/** Cúpula de roca: la caldera es un INTERIOR, no un cielo abierto. */
function CaveDome() {
  const basalt = useMemo(() => repeated(basaltTexture(), 6, 3), [])
  return (
    <mesh>
      <sphereGeometry args={[62, 28, 18]} />
      <meshStandardMaterial map={basalt} color="#1a0d0a" side={BackSide} roughness={1} metalness={0} emissive="#2a0a03" emissiveIntensity={0.3} fog={false} />
    </mesh>
  )
}

/**
 * La Fragua de la Caldera, rehecha desde cero: una plataforma de basalto y
 * hierro colgada sobre un lago de lava, dentro de una cúpula de roca, con
 * columnas prismáticas alrededor y un yunque colosal al fondo. Antes era la
 * escenografía del Santuario pintada de naranja; ahora no comparte con él ni
 * una malla, y la diferencia se lee en un segundo: interior contra
 * intemperie, hierro contra piedra, luz que sube del suelo contra luna.
 */
export function CalderaScenario({ quality, reducedMotion, event }: CalderaScenarioProps) {
  const flare = useRef(0)
  useFrame((_, delta) => {
    flare.current = Math.max(0, flare.current - delta * 1.2)
  })
  useEffect(() => {
    if (event?.type === 'nexus-damage' || event?.type === 'victory' || event?.type === 'destroy') {
      flare.current = 1
    }
  }, [event])

  return (
    <>
      <color attach="background" args={['#180604']} />
      <fog attach="fog" args={['#2a0b04', 14, 40]} />
      {/* La luz clave viene de ABAJO: es la lava la que ilumina la sala.
          El relleno plano (ambiente + hemisférica) estaba tan alto que la
          roca perdía todo el modelado: en una cueva de lava el contraste es
          justo lo que da miedo, y el basalto tiene que quedar casi negro
          donde la lava no llega. Bajado a la mitad; los puntos de luz de la
          colada siguen aportando el rebote naranja de verdad, con posición,
          en vez de un lavado uniforme sin dirección. */}
      <ambientLight intensity={0.58} color="#ffa06a" />
      <hemisphereLight intensity={0.58} color="#ff8c46" groundColor="#ffb070" />
      <spotLight
        position={[-3, 9, 4]}
        intensity={62}
        angle={0.62}
        penumbra={0.9}
        castShadow={quality !== 'low'}
        color="#ffd2ac"
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-bias={-0.0006}
      />
      <pointLight position={[0, -1.6, 0]} color="#ff5a12" intensity={46} distance={18} decay={2} />
      <pointLight position={[5, 1.2, -4]} color="#ff3c0e" intensity={20} distance={12} />

      <CaveDome />
      <LavaLake flare={flare} reducedMotion={reducedMotion} />
      <BasaltColumns quality={quality} />
      <ForgeDeck quality={quality} />
      <GreatAnvil flare={flare} quality={quality} reducedMotion={reducedMotion} />
      {quality !== 'low' && (
        <>
          <SteamVent position={[-(DECK_RADIUS + 3.2), -2.2, 2.6]} delay={0} reducedMotion={reducedMotion} />
          <SteamVent position={[DECK_RADIUS + 4.1, -2.2, -1.4]} delay={0.45} reducedMotion={reducedMotion} />
          <SteamVent position={[2.2, -2.2, DECK_RADIUS + 4.4]} delay={0.72} reducedMotion={reducedMotion} />
          {/* Brasas: muchas y rápidas, lo contrario de las luciérnagas del Santuario. */}
          <Sparkles count={quality === 'high' ? 90 : 45} scale={[DECK_RADIUS * 2.6, 6, DECK_RADIUS * 2.6]} size={2.4} speed={reducedMotion ? 0 : 0.9} color="#ff9a3c" opacity={0.6} position={[0, 1.2, 0]} />
          <Sparkles count={quality === 'high' ? 40 : 18} scale={[DECK_RADIUS * 2, 2.4, DECK_RADIUS * 2]} size={3.4} speed={reducedMotion ? 0 : 0.5} color="#ffd486" opacity={0.4} position={[0, -1.4, 0]} />
        </>
      )}
    </>
  )
}
