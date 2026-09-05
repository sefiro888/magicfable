import { Sparkles, Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, DoubleSide, RepeatWrapping } from 'three'
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight } from 'three'
import type { AnimationEvent } from '../../game'
import type { GraphicsQuality } from '../../store/preferences'
import { BOARD_WORLD_HALF } from '../grid/gridCoordinates'
import { glowTexture, monolithTexture, mossStoneTexture, nightWaterTexture } from '../textures'
import { usePageVisibility } from '../usePageVisibility'

interface SanctuaryProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  /** Último evento visual en reproducción; el sitio reacciona con discreción. */
  event?: AnimationEvent
}

/** Radio de la isla de piedra: deja un anillo de suelo alrededor del tablero. */
// La isla daba 4,93 de radio (media huella 3,68 + 1,25) y el circulo de
// monolitos caia entre 4,38 y 4,98. Pero el tablero es CUADRADO: su media
// diagonal mide 3,68 x raiz de 2 = 5,20, o sea que por las esquinas llegaba
// mas lejos que las piedras y estas se plantaban encima de la zona de juego.
// Con 2,6 de margen el anillo queda en 5,58-6,14 y libra la diagonal.
const ISLAND_RADIUS = BOARD_WORLD_HALF + 2.6

/** Piedra del santuario: granito frío, apagado, nada de latón dorado. */
const STONE = { color: '#5d6673', roughness: 0.92, metalness: 0.05 } as const

/**
 * La isla: disco de roca con el suelo enlosado, un reborde tallado y la masa
 * irregular que se hunde en el agua.
 */
function Island({ quality }: { quality: GraphicsQuality }) {
  const stone = useMemo(() => {
    const texture = mossStoneTexture().clone()
    texture.needsUpdate = true
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(4, 4)
    return texture
  }, [])
  return (
    <group>
      {/* Suelo de la isla, justo bajo las casillas. */}
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={quality !== 'low'}>
        <circleGeometry args={[ISLAND_RADIUS, 56]} />
        <meshStandardMaterial map={stone} color="#b6bfcc" roughness={0.95} metalness={0.04} emissive="#1a2740" emissiveIntensity={0.35} />
      </mesh>
      {/* Reborde: el canto tallado de la plataforma. */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[ISLAND_RADIUS, ISLAND_RADIUS * 0.97, 0.9, 56]} />
        <meshStandardMaterial map={stone} {...STONE} />
      </mesh>
      {/* Base sumergida: se estrecha hacia el fondo del lago. */}
      <mesh position={[0, -1.6, 0]}>
        <cylinderGeometry args={[ISLAND_RADIUS * 0.97, ISLAND_RADIUS * 0.55, 1.4, 24]} />
        <meshStandardMaterial color="#2b3038" roughness={0.98} metalness={0.02} />
      </mesh>
      {/* Escalones sumergidos hacia el agua, en el lado de la cámara. */}
      {[0, 1, 2].map((step) => (
        <mesh key={step} position={[0, -0.35 - step * 0.3, ISLAND_RADIUS + 0.35 + step * 0.5]}>
          <boxGeometry args={[3.4 - step * 0.5, 0.3, 0.75]} />
          <meshStandardMaterial map={stone} {...STONE} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * El lago que rodea la isla. No hay reflejos reales (costarían un render
 * extra): el agua se sugiere con una textura de crestas que se desplaza muy
 * despacio y un material casi especular que recoge la luna.
 */
function Lake({ reducedMotion }: { reducedMotion: boolean }) {
  const water = useMemo(() => {
    const texture = nightWaterTexture().clone()
    texture.needsUpdate = true
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(9, 9)
    return texture
  }, [])
  // El oleaje se mueve desplazando la textura DESDE el material, no tocando el
  // valor de `water` del render: mutar algo creado en el render está prohibido,
  // pero llegar a ello por el ref del material dentro del bucle sí vale.
  const material = useRef<MeshStandardMaterial>(null)
  const visible = usePageVisibility()
  useFrame((_, delta) => {
    const map = material.current?.map
    if (!map || reducedMotion || !visible.current) return
    map.offset.x += delta * 0.006
    map.offset.y += delta * 0.011
  })
  return (
    <mesh position={[0, -0.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[46, 64]} />
      <meshStandardMaterial
        ref={material}
        map={water}
        color="#3a6ea8"
        roughness={0.34}
        metalness={0.18}
        emissive="#123a63"
        emissiveIntensity={0.85}
      />
    </mesh>
  )
}

interface StoneSpec {
  readonly angle: number
  readonly radius: number
  readonly height: number
  readonly width: number
  readonly tilt: number
  /** Piedra partida por la mitad: se dibuja solo el tocón y un trozo caído. */
  readonly broken: boolean
  readonly seed: number
}

/**
 * Anillo de monolitos. La mitad están rotos o inclinados a propósito: son «las
 * runas quebradas» del nombre, no una columnata intacta. Los glifos respiran
 * cada uno a su ritmo y destellan a la vez en los cambios de turno.
 */
function StandingStones({ stones, pulse, reducedMotion }: { stones: readonly StoneSpec[]; pulse: { readonly current: number }; reducedMotion: boolean }) {
  const group = useRef<Group>(null)
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    const node = group.current
    if (!node || !visible.current) return
    const time = clock.elapsedTime
    node.children.forEach((child, index) => {
      const mesh = child.children[0] as Mesh | undefined
      if (!mesh) return
      const material = mesh.material as MeshStandardMaterial
      const breath = reducedMotion ? 0.35 : 0.35 + Math.sin(time * 0.6 + index * 1.7) * 0.22
      material.emissiveIntensity = breath + pulse.current * 1.9
    })
  })
  return (
    <group ref={group}>
      {stones.map((stone, index) => {
        const x = Math.cos(stone.angle) * stone.radius
        const z = Math.sin(stone.angle) * stone.radius
        const height = stone.broken ? stone.height * 0.45 : stone.height
        return (
          <group key={index} position={[x, 0, z]} rotation={[0, -stone.angle, 0]}>
            <mesh position={[0, height / 2 - 0.15, 0]} rotation={[stone.tilt * 0.6, 0, stone.tilt]} castShadow={false}>
              <boxGeometry args={[stone.width, height, stone.width * 0.62]} />
              {/* El granito va en el mapa de color y las runas SOLO en el
                  emisivo: con la textura de monolito (casi negra) como mapa de
                  color, las piedras se veían como siluetas recortadas. */}
              <meshStandardMaterial
                map={mossStoneTexture()}
                emissiveMap={monolithTexture(stone.seed)}
                emissive="#6fe3d0"
                emissiveIntensity={0.35}
                color="#aab4c2"
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
            {stone.broken && (
              // El trozo que se desprendió, tumbado al pie de la piedra.
              <mesh position={[stone.width * 1.1, 0.12, stone.width * 0.4]} rotation={[Math.PI / 2 * 0.9, stone.seed % 3, 0.3]}>
                <boxGeometry args={[stone.width * 0.9, stone.height * 0.5, stone.width * 0.55]} />
                <meshStandardMaterial map={mossStoneTexture()} color="#96a0ae" roughness={0.95} metalness={0.04} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}

/**
 * Dolmen del fondo, detrás del Nexo rival: dos piedras y un dintel con un velo
 * de luz entre ellas. Sustituye al portal de maquinaria del escenario viejo —
 * aquí todo es piedra y luz, sin metal.
 */
function Dolmen({ pulse, quality, reducedMotion }: { pulse: { readonly current: number }; quality: GraphicsQuality; reducedMotion: boolean }) {
  const veil = useRef<Mesh>(null)
  const light = useRef<PointLight>(null)
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    if (!visible.current) return
    const wave = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.9) * 0.12
    if (veil.current) {
      const material = veil.current.material as MeshBasicMaterial
      material.opacity = 0.28 + wave + pulse.current * 0.35
    }
    if (light.current) light.current.intensity = 12 + wave * 20 + pulse.current * 26
  })
  const z = -(BOARD_WORLD_HALF + 2.9)
  return (
    <group position={[0, 0, z]}>
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, 1.75, 0]} rotation={[0, 0, x > 0 ? -0.03 : 0.04]}>
          <boxGeometry args={[0.72, 3.5, 0.66]} />
          <meshStandardMaterial map={mossStoneTexture()} emissiveMap={monolithTexture(0x4c494e54)} emissive="#6fe3d0" emissiveIntensity={0.55} color="#aab4c2" roughness={0.9} metalness={0.05} />
        </mesh>
      ))}
      <mesh position={[0, 3.72, 0]} rotation={[0, 0, 0.015]}>
        <boxGeometry args={[4.3, 0.6, 0.8]} />
        <meshStandardMaterial map={mossStoneTexture()} color="#6a7280" roughness={0.92} metalness={0.05} />
      </mesh>
      {/* Velo: la luz que cuelga entre las dos piedras. */}
      <mesh ref={veil} position={[0, 1.75, 0.02]}>
        <planeGeometry args={[2.6, 3.4]} />
        <meshBasicMaterial color="#7ff0dd" transparent opacity={0.3} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
      </mesh>
      <pointLight ref={light} position={[0, 1.9, 0.8]} color="#67e6d2" intensity={12} distance={12} decay={2} />
      {quality !== 'low' && (
        <Sparkles count={quality === 'high' ? 24 : 12} scale={[2.4, 3.2, 0.8]} size={2.2} speed={reducedMotion ? 0 : 0.4} color="#9ff5e6" opacity={0.7} position={[0, 1.8, 0.3]} />
      )}
    </group>
  )
}

/** Cuenco de piedra con fuego frío: la única luz «de mano» del santuario. */
function ColdBrazier({ position, reducedMotion }: { position: readonly [number, number, number]; reducedMotion: boolean }) {
  const flame = useRef<Mesh>(null)
  const light = useRef<PointLight>(null)
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    if (!visible.current || reducedMotion) return
    const t = clock.elapsedTime * 2.6 + position[0]
    const flicker = 1 + Math.sin(t) * 0.12 + Math.sin(t * 2.7) * 0.06
    if (flame.current) flame.current.scale.set(flicker, 1 + (flicker - 1) * 1.8, flicker)
    if (light.current) light.current.intensity = 9 + (flicker - 1) * 26
  })
  return (
    <group position={[position[0], position[1], position[2]]}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.13, 0.2, 0.45, 10]} />
        <meshStandardMaterial map={mossStoneTexture()} {...STONE} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.32, 0.18, 0.22, 12]} />
        <meshStandardMaterial map={mossStoneTexture()} {...STONE} />
      </mesh>
      <mesh ref={flame} position={[0, 0.75, 0]}>
        <coneGeometry args={[0.17, 0.5, 10]} />
        <meshBasicMaterial color="#8ff2ff" transparent opacity={0.75} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <sprite position={[0, 0.78, 0]} scale={[1.5, 1.5, 1]}>
        <spriteMaterial map={glowTexture('arcane')} transparent opacity={0.45} blending={AdditiveBlending} depthWrite={false} />
      </sprite>
      <pointLight ref={light} position={[0, 0.85, 0]} color="#7fe4ff" intensity={9} distance={6.5} decay={2} />
    </group>
  )
}

/** Luna baja sobre el horizonte, con su halo y su reflejo en el agua. */
function Moon() {
  return (
    <group position={[-13, 6.5, -34]}>
      <mesh>
        <sphereGeometry args={[3.1, 24, 18]} />
        <meshBasicMaterial color="#e8f0ff" fog={false} />
      </mesh>
      <sprite scale={[16, 16, 1]}>
        <spriteMaterial map={glowTexture('arcane')} transparent opacity={0.42} blending={AdditiveBlending} depthWrite={false} fog={false} />
      </sprite>
    </group>
  )
}

/** Jirones de niebla a ras de agua, alrededor de la isla. */
function LowMist({ quality, reducedMotion }: { quality: GraphicsQuality; reducedMotion: boolean }) {
  const group = useRef<Group>(null)
  const banks = useMemo(
    () =>
      Array.from({ length: quality === 'high' ? 9 : 5 }, (_, index) => ({
        angle: (index / (quality === 'high' ? 9 : 5)) * Math.PI * 2 + index * 0.9,
        radius: ISLAND_RADIUS + 1.6 + (index % 3) * 1.5,
        y: -0.62 + (index % 2) * 0.16,
        scale: 6 + (index % 4) * 2.2,
        speed: 0.008 + (index % 3) * 0.005,
      })),
    [quality],
  )
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    const node = group.current
    if (!node || reducedMotion || !visible.current) return
    node.children.forEach((child, index) => {
      const bank = banks[index]
      if (!bank) return
      const angle = bank.angle + clock.elapsedTime * bank.speed
      child.position.set(Math.cos(angle) * bank.radius, bank.y, Math.sin(angle) * bank.radius)
    })
  })
  if (quality === 'low') return null
  return (
    <group ref={group}>
      {banks.map((bank, index) => (
        <sprite
          key={index}
          position={[Math.cos(bank.angle) * bank.radius, bank.y, Math.sin(bank.angle) * bank.radius]}
          scale={[bank.scale, bank.scale * 0.3, 1]}
        >
          <spriteMaterial map={glowTexture('arcane')} transparent opacity={0.14} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}

/**
 * El Santuario de las Runas Quebradas, rehecho: un círculo megalítico en una
 * isla de piedra, de noche, en mitad de un lago quieto. Antes era una
 * plataforma celeste con balaustrada de latón, telescopio y un portal de
 * maquinaria — indistinguible de la Caldera, que reutilizaba la misma malla
 * recoloreada. Ahora no comparte ni una pieza con ella: piedra fría, agua,
 * luna y luz verdeazulada frente al hierro y la lava de la fragua.
 */
export function RunicSanctuary({ quality, reducedMotion, event }: SanctuaryProps) {
  const pulse = useRef(0)
  const stones = useMemo<readonly StoneSpec[]>(() => {
    const count = quality === 'low' ? 8 : 13
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 + 0.22
      // Las piedras del lado de la cámara (sin > 0) se quedan a media altura:
      // con la altura completa se plantaban delante del tablero y lo tapaban.
      const nearCamera = Math.sin(angle) > 0.12
      return {
        angle,
        radius: ISLAND_RADIUS - 0.7 + (index % 3) * 0.28,
        height: nearCamera ? 1.05 + (index % 3) * 0.3 : 2.1 + (index % 5) * 0.75,
        width: 0.42 + (index % 3) * 0.1,
        tilt: ((index % 4) - 1.5) * 0.045,
        broken: index % 3 === 1,
        seed: 0x52554e00 + index * 37,
      }
    })
  }, [quality])

  // El destello compartido de los glifos: sube de golpe con el evento y baja solo.
  useFrame((_, delta) => {
    pulse.current = Math.max(0, pulse.current - delta * 1.4)
  })
  useEffect(() => {
    if (event?.type === 'turn' || event?.type === 'nexus-damage' || event?.type === 'victory') {
      pulse.current = 1
    }
  }, [event])

  return (
    <>
      <color attach="background" args={['#050914']} />
      <fog attach="fog" args={['#0d1830', 18, 54]} />
      {/* Noche real: la luz general es escasa y fría, y la luna hace de clave.
          El relleno plano estaba en 1,65 contra los 2,6 de la luna — un 63%,
          demasiado para una noche: la piedra perdía el modelado y el musgo de
          las losas no se distinguía del granito. Bajado a 0,8 (poco menos de
          un tercio) para que la luna module de verdad. */}
      <ambientLight intensity={0.42} color="#8fa4c8" />
      <hemisphereLight intensity={0.38} color="#9fc4ff" groundColor="#26313f" />
      <directionalLight
        position={[-9, 11, -8]}
        intensity={2.8}
        color="#cfe2ff"
        castShadow={quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        // Sin acotar, la cámara de sombra usa el ±5 por defecto y recorta
        // todo lo que quede fuera del centro del tablero.
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-bias={-0.0006}
      />
      {/* Rebote frío desde el agua, para que las fichas no queden negras por debajo. */}
      <pointLight position={[0, -1.2, 4]} color="#3f7ad0" intensity={14} distance={16} />
      {/* Relleno frontal: sin él, todo lo que rodea al tablero queda como una
          silueta negra, porque la luna ilumina desde detrás de la escena. */}
      <directionalLight position={[2, 7, 14]} intensity={1.5} color="#9cc0ff" />

      <Stars radius={60} depth={26} count={quality === 'high' ? 2200 : quality === 'medium' ? 1100 : 400} factor={3.4} saturation={0.2} fade speed={reducedMotion ? 0 : 0.25} />
      <Moon />
      <Lake reducedMotion={reducedMotion} />
      <LowMist quality={quality} reducedMotion={reducedMotion} />
      <Island quality={quality} />
      <StandingStones stones={stones} pulse={pulse} reducedMotion={reducedMotion} />
      <Dolmen pulse={pulse} quality={quality} reducedMotion={reducedMotion} />
      <ColdBrazier position={[-(BOARD_WORLD_HALF + 1.1), 0, BOARD_WORLD_HALF + 1.1]} reducedMotion={reducedMotion} />
      <ColdBrazier position={[BOARD_WORLD_HALF + 1.1, 0, BOARD_WORLD_HALF + 1.1]} reducedMotion={reducedMotion} />
      {quality !== 'low' && (
        <>
          {/* Luciérnagas: pocas, lentas y bajas — el sitio está dormido. */}
          <Sparkles count={quality === 'high' ? 55 : 26} scale={[ISLAND_RADIUS * 2, 1.8, ISLAND_RADIUS * 2]} size={1.8} speed={reducedMotion ? 0 : 0.16} color="#9ff5d8" opacity={0.5} position={[0, 0.9, 0]} />
          <Sparkles count={quality === 'high' ? 26 : 12} scale={[ISLAND_RADIUS * 2.6, 0.9, ISLAND_RADIUS * 2.6]} size={2.6} speed={reducedMotion ? 0 : 0.1} color="#bcd8ff" opacity={0.3} position={[0, -0.4, 0]} />
        </>
      )}
    </>
  )
}
