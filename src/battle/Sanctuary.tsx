import { Sparkles, Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, DoubleSide, Shape } from 'three'
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight } from 'three'
import type { AnimationEvent } from '../game'
import {
  cloudTexture,
  glowTexture,
  monolithTexture,
  nebulaTexture,
  portalSwirlTexture,
  runicCircleTexture,
  stoneFloorTexture,
} from './textures'

export type GraphicsQuality = 'low' | 'medium' | 'high'

interface SanctuaryProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  /** Último evento visual en reproducción; el escenario reacciona con discreción. */
  event?: AnimationEvent
}

/** Materiales compartidos de la cantería y el latón ceremonial. */
const STONE_SIDE = { color: '#38302a', roughness: 0.88, metalness: 0.1, emissive: '#181310', emissiveIntensity: 0.55 } as const
const BRASS = { color: '#8a6a30', roughness: 0.34, metalness: 0.85, emissive: '#3a2a10', emissiveIntensity: 0.35 } as const

/** Plataforma principal: losa redondeada flotante con cuatro lóbulos circulares. */
function PlatformDeck({ quality }: { quality: GraphicsQuality }) {
  const floor = useMemo(() => stoneFloorTexture(), [])
  const runic = useMemo(() => runicCircleTexture(), [])
  const deckShape = useMemo(() => {
    const shape = new Shape()
    const half = 4.2
    const radius = 1.15
    shape.moveTo(-half + radius, -half)
    shape.lineTo(half - radius, -half)
    shape.quadraticCurveTo(half, -half, half, -half + radius)
    shape.lineTo(half, half - radius)
    shape.quadraticCurveTo(half, half, half - radius, half)
    shape.lineTo(-half + radius, half)
    shape.quadraticCurveTo(-half, half, -half, half - radius)
    shape.lineTo(-half, -half + radius)
    shape.quadraticCurveTo(-half, -half, -half + radius, -half)
    return shape
  }, [])
  const lobes: readonly (readonly [number, number])[] = [
    [5.0, 0],
    [-5.0, 0],
    [0, 5.0],
    [0, -5.0],
  ]
  return (
    <group>
      {/* Cuerpo extruido de la losa principal. */}
      <mesh position={[0, -0.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[deckShape, { depth: 0.95, bevelEnabled: false }]} />
        <meshStandardMaterial {...STONE_SIDE} />
      </mesh>
      {/* Tapa superior con la piedra dorada. */}
      <mesh position={[0, -0.026, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={quality !== 'low'}>
        <shapeGeometry args={[deckShape, 24]} />
        <meshStandardMaterial
          map={floor}
          emissiveMap={floor}
          emissive="#e8c88e"
          emissiveIntensity={0.24}
          roughness={0.85}
          metalness={0.12}
        />
      </mesh>
      {/* Lóbulos laterales con círculos rúnicos. */}
      {lobes.map(([x, z], index) => (
        <group key={index} position={[x, 0, z]}>
          <mesh position={[0, -0.508, 0]}>
            <cylinderGeometry args={[2.05, 2.22, 0.955, 36]} />
            <meshStandardMaterial {...STONE_SIDE} />
          </mesh>
          <mesh position={[0, -0.028, 0]} rotation={[-Math.PI / 2, 0, index * 1.3]}>
            <circleGeometry args={[2.05, 36]} />
            <meshStandardMaterial
              map={floor}
              emissiveMap={floor}
              emissive="#e8c88e"
              emissiveIntensity={0.2}
              roughness={0.85}
              metalness={0.12}
            />
          </mesh>
          <mesh position={[0, -0.012, 0]} rotation={[-Math.PI / 2, 0, index * 0.8]}>
            <circleGeometry args={[1.5, 36]} />
            <meshBasicMaterial map={runic} transparent opacity={0.85} blending={AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      ))}
      {/* Fondo rocoso bajo la plataforma. */}
      <mesh position={[0, -1.75, 0]}>
        <cylinderGeometry args={[3.3, 1.1, 1.7, 10]} />
        <meshStandardMaterial color="#211d1b" roughness={0.95} metalness={0.05} emissive="#0d0b0a" emissiveIntensity={0.4} />
      </mesh>
      {/* Resplandor del abismo. */}
      <mesh position={[0, -2.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[9.4, 40]} />
        <meshBasicMaterial map={glowTexture('arcane')} transparent opacity={0.3} blending={AdditiveBlending} depthWrite={false} fog={false} />
      </mesh>
    </group>
  )
}

/** Balaustrada dorada con remates de cristal alrededor de cada lóbulo. */
function Balustrades({ quality }: { quality: GraphicsQuality }) {
  const lobes: readonly (readonly [number, number, number])[] = [
    [5.0, 0, 0],
    [-5.0, 0, Math.PI],
    [0, 5.0, Math.PI / 2],
    [0, -5.0, -Math.PI / 2],
  ]
  const arc = Math.PI * 0.72
  const postsPerArc = quality === 'low' ? 4 : 6
  return (
    <group>
      {lobes.map(([x, z, outward], lobeIndex) => (
        <group key={lobeIndex} position={[x, 0, z]}>
          {/* Pasamanos curvo. */}
          <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, -outward - arc / 2]}>
            <torusGeometry args={[1.98, 0.032, 6, 30, arc]} />
            <meshStandardMaterial {...BRASS} />
          </mesh>
          <mesh position={[0, 0.24, 0]} rotation={[-Math.PI / 2, 0, -outward - arc / 2]}>
            <torusGeometry args={[1.98, 0.022, 6, 30, arc]} />
            <meshStandardMaterial {...BRASS} />
          </mesh>
          {Array.from({ length: postsPerArc + 1 }, (_, index) => {
            const angle = outward - arc / 2 + (index / postsPerArc) * arc
            const px = Math.cos(angle) * 1.98
            const pz = Math.sin(angle) * 1.98
            const isEnd = index === 0 || index === postsPerArc
            return (
              <group key={index} position={[px, 0, pz]}>
                <mesh position={[0, 0.21, 0]}>
                  <boxGeometry args={[isEnd ? 0.14 : 0.07, 0.46, isEnd ? 0.14 : 0.07]} />
                  <meshStandardMaterial {...BRASS} />
                </mesh>
                {isEnd && (
                  <mesh position={[0, 0.54, 0]}>
                    <octahedronGeometry args={[0.072, 0]} />
                    <meshStandardMaterial color="#9fd8ff" emissive="#6cc4ff" emissiveIntensity={1.5} roughness={0.15} metalness={0.2} />
                  </mesh>
                )}
              </group>
            )
          })}
        </group>
      ))}
    </group>
  )
}

/** Pilonos de las esquinas: poste dorado con cristal flotante que se aviva con los golpes. */
function CrystalPylon({ position, flare, reducedMotion, quality }: { position: [number, number, number]; flare: number; reducedMotion: boolean; quality: GraphicsQuality }) {
  const crystal = useRef<Mesh>(null)
  const halo = useRef<Mesh>(null)
  const still = reducedMotion || quality === 'low'
  useFrame(({ clock }) => {
    const time = clock.elapsedTime
    if (crystal.current) {
      if (!still) {
        crystal.current.rotation.y = time * 0.8
        crystal.current.position.y = 0.86 + Math.sin(time * 1.7 + position[0]) * 0.035
      }
      const material = crystal.current.material as MeshStandardMaterial
      material.emissiveIntensity = 1.9 + flare * 2.6 + (still ? 0 : Math.sin(time * 2.3 + position[2]) * 0.35)
    }
    if (halo.current) {
      const material = halo.current.material as MeshBasicMaterial
      material.opacity = 0.5 + flare * 0.35
    }
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.17, 0.62, 0.17]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      <mesh position={[0, 0.64, 0]}>
        <boxGeometry args={[0.24, 0.07, 0.24]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      <mesh ref={crystal} position={[0, 0.86, 0]}>
        <octahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial color="#a8e0ff" emissive="#6cc4ff" emissiveIntensity={1.9} roughness={0.12} metalness={0.25} />
      </mesh>
      <sprite ref={halo} position={[0, 0.87, 0]} scale={[0.85, 0.85, 0.85]}>
        <spriteMaterial map={glowTexture('arcane')} transparent opacity={0.5} blending={AdditiveBlending} depthWrite={false} />
      </sprite>
    </group>
  )
}

/** Anillo de incrustación dorada alrededor del tablero; late en los cambios de turno. */
function InlayRing({ event, reducedMotion }: { event?: AnimationEvent; reducedMotion: boolean }) {
  const ring = useRef<Mesh>(null)
  const pulseStart = useRef(-10)
  useEffect(() => {
    if (event && (event.type === 'turn' || event.type === 'victory')) {
      pulseStart.current = performance.now()
    }
  }, [event])
  useFrame(() => {
    const node = ring.current
    if (!node) return
    const since = (performance.now() - pulseStart.current) / 1000
    const pulse = since < 1.4 && !reducedMotion ? Math.sin(Math.min(1, since / 1.4) * Math.PI) : 0
    const material = node.material as MeshStandardMaterial
    material.emissiveIntensity = 0.7 + pulse * 2.6
  })
  return (
    <mesh ref={ring} position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[3.26, 3.4, 64]} />
      <meshStandardMaterial
        color="#5a4620"
        emissive="#d7b467"
        emissiveIntensity={0.7}
        transparent
        opacity={0.9}
        side={DoubleSide}
        roughness={0.45}
        metalness={0.5}
      />
    </mesh>
  )
}

/** El gran portal arcano que domina el extremo rival. */
function PortalGate({ flare, reducedMotion, quality }: { flare: number; reducedMotion: boolean; quality: GraphicsQuality }) {
  const swirl = useRef<Mesh>(null)
  const swirlInner = useRef<Mesh>(null)
  const light = useRef<PointLight>(null)
  const pillarTexture = useMemo(() => monolithTexture(0x504f5254), [])
  useFrame((_, delta) => {
    if (!reducedMotion) {
      if (swirl.current) swirl.current.rotation.z -= delta * 0.55
      if (swirlInner.current) swirlInner.current.rotation.z += delta * 0.9
    }
    if (light.current) light.current.intensity = 16 + flare * 22
  })
  return (
    <group position={[0, -0.03, -5.7]} scale={0.68}>
      {/* Escalinata desde la losa. */}
      {[0, 1, 2].map((step) => (
        <mesh key={step} position={[0, 0.09 + step * 0.17, 1.62 - step * 0.42]}>
          <boxGeometry args={[3 - step * 0.35, 0.17, 0.46]} />
          <meshStandardMaterial {...STONE_SIDE} />
        </mesh>
      ))}
      {/* Base y pilares. */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[4.2, 0.85, 1.6]} />
        <meshStandardMaterial {...STONE_SIDE} />
      </mesh>
      {[-1.65, 1.65].map((x) => (
        <group key={x} position={[x, 2.2, 0]}>
          <mesh>
            <boxGeometry args={[0.56, 3.1, 0.56]} />
            <meshStandardMaterial map={pillarTexture} emissiveMap={pillarTexture} emissive="#79c8ef" emissiveIntensity={0.4} roughness={0.85} />
          </mesh>
          <mesh position={[0, 1.66, 0]}>
            <boxGeometry args={[0.7, 0.22, 0.7]} />
            <meshStandardMaterial {...BRASS} />
          </mesh>
          <mesh position={[0, 1.86, 0]}>
            <octahedronGeometry args={[0.13, 0]} />
            <meshStandardMaterial color="#a8e0ff" emissive="#6cc4ff" emissiveIntensity={2.4} roughness={0.15} />
          </mesh>
        </group>
      ))}
      {/* Arco superior con cristal maestro. */}
      <mesh position={[0, 3.95, 0]}>
        <boxGeometry args={[3.9, 0.44, 0.6]} />
        <meshStandardMaterial {...STONE_SIDE} />
      </mesh>
      <mesh position={[0, 4.25, 0]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#a8e0ff" emissive="#6cc4ff" emissiveIntensity={2.8} roughness={0.12} />
      </mesh>
      {/* Vórtice del portal. */}
      <mesh position={[0, 2.15, 0.05]}>
        <circleGeometry args={[1.42, 40]} />
        <meshBasicMaterial color="#050b1e" side={DoubleSide} />
      </mesh>
      <mesh ref={swirl} position={[0, 2.15, 0.12]}>
        <circleGeometry args={[1.36, 40]} />
        <meshBasicMaterial map={portalSwirlTexture()} transparent opacity={0.95} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
      </mesh>
      <mesh ref={swirlInner} position={[0, 2.15, 0.18]}>
        <circleGeometry args={[0.85, 32]} />
        <meshBasicMaterial map={portalSwirlTexture()} transparent opacity={0.7} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
      </mesh>
      <pointLight ref={light} position={[0, 2.2, 1.2]} color="#5db4ff" intensity={16} distance={11} decay={2} />
      {quality !== 'low' && (
        <Sparkles count={quality === 'high' ? 26 : 14} scale={[2.6, 2.6, 1]} size={2.4} speed={reducedMotion ? 0 : 0.7} color="#8ed2ff" opacity={0.75} position={[0, 2.15, 0.4]} />
      )}
    </group>
  )
}

/** Telescopio ceremonial de latón sobre el lóbulo oeste. */
function Telescope({ reducedMotion }: { reducedMotion: boolean }) {
  const head = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (head.current && !reducedMotion) {
      head.current.rotation.y = Math.sin(clock.elapsedTime * 0.08) * 0.25 + 0.5
    }
  })
  return (
    <group position={[-5.0, -0.03, -0.2]} scale={1.12}>
      {/* Trípode */}
      {[0, 1, 2].map((leg) => {
        const angle = (leg / 3) * Math.PI * 2
        return (
          <mesh key={leg} position={[Math.cos(angle) * 0.3, 0.34, Math.sin(angle) * 0.3]} rotation={[Math.sin(angle) * 0.42, 0, -Math.cos(angle) * 0.42]}>
            <cylinderGeometry args={[0.035, 0.05, 0.75, 8]} />
            <meshStandardMaterial {...BRASS} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.14, 12, 10]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      <group ref={head} position={[0, 0.78, 0]} rotation={[0, 0.5, 0]}>
        {/* Tubo principal apuntando al cielo */}
        <group rotation={[0, 0, 0.62]}>
          <mesh position={[0.55, 0.4, 0]} rotation={[0, 0, Math.PI / 2 - 0.62]}>
            <cylinderGeometry args={[0.13, 0.19, 1.65, 14]} />
            <meshStandardMaterial {...BRASS} />
          </mesh>
          {[0.35, 0.85].map((offset) => (
            <mesh key={offset} position={[offset * Math.cos(0.62), 0.25 + offset * Math.sin(0.62) + 0.1, 0]} rotation={[0, 0, Math.PI / 2 - 0.62]}>
              <torusGeometry args={[0.2, 0.028, 8, 20]} />
              <meshStandardMaterial color="#c8a050" roughness={0.28} metalness={0.9} emissive="#4a3512" emissiveIntensity={0.4} />
            </mesh>
          ))}
        </group>
        {/* Rueda de armazón decorativa */}
        <mesh position={[-0.15, 0.28, 0]} rotation={[0, 0, 0.3]}>
          <torusGeometry args={[0.3, 0.02, 6, 24]} />
          <meshStandardMaterial {...BRASS} />
        </mesh>
      </group>
    </group>
  )
}

/** Cielo cósmico: esfera de nebulosa, planetas y estrellas. */
function CosmicSky({ quality, reducedMotion }: { quality: GraphicsQuality; reducedMotion: boolean }) {
  const planets = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (planets.current && !reducedMotion) {
      planets.current.rotation.y = clock.elapsedTime * 0.004
    }
  })
  return (
    <group>
      <mesh>
        <sphereGeometry args={[55, 28, 20]} />
        <meshBasicMaterial map={nebulaTexture()} side={1} fog={false} />
      </mesh>
      <group ref={planets}>
        {/* Planeta azul */}
        <group position={[-12, 7, -21]}>
          <mesh>
            <sphereGeometry args={[1.05, 20, 16]} />
            <meshStandardMaterial color="#7d9bd8" emissive="#3c5ca8" emissiveIntensity={0.6} roughness={0.7} fog={false} />
          </mesh>
          <sprite scale={[4.2, 4.2, 1]}>
            <spriteMaterial map={glowTexture('arcane')} transparent opacity={0.35} blending={AdditiveBlending} depthWrite={false} fog={false} />
          </sprite>
        </group>
        {/* Luna pálida */}
        <group position={[10.5, 8, -22]}>
          <mesh>
            <sphereGeometry args={[0.55, 16, 12]} />
            <meshStandardMaterial color="#cfc4ae" emissive="#6a6050" emissiveIntensity={0.6} roughness={0.85} fog={false} />
          </mesh>
        </group>
        {/* Planeta rojizo lejano */}
        <group position={[4.5, 9.5, -24]}>
          <mesh>
            <sphereGeometry args={[0.42, 14, 10]} />
            <meshStandardMaterial color="#b8745a" emissive="#69331f" emissiveIntensity={0.7} roughness={0.8} fog={false} />
          </mesh>
        </group>
      </group>
      <Stars radius={46} depth={18} count={quality === 'high' ? 1600 : quality === 'medium' ? 900 : 350} factor={3} saturation={0.3} fade speed={reducedMotion ? 0 : 0.4} />
    </group>
  )
}

/** Bancos de nubes que flotan bajo la plataforma. */
function CloudBanks({ quality, reducedMotion }: { quality: GraphicsQuality; reducedMotion: boolean }) {
  const group = useRef<Group>(null)
  const clouds = useMemo(
    () =>
      Array.from({ length: quality === 'high' ? 11 : 7 }, (_, index) => ({
        angle: (index / (quality === 'high' ? 11 : 7)) * Math.PI * 2 + index * 0.7,
        radius: 8.5 + (index % 4) * 1.9,
        y: -2.4 + (index % 3) * 0.75,
        scale: 4.4 + (index % 4) * 1.6,
        speed: 0.006 + (index % 3) * 0.004,
      })),
    [quality],
  )
  useFrame(({ clock }) => {
    const node = group.current
    if (!node || reducedMotion) return
    node.children.forEach((child, index) => {
      const cloud = clouds[index]!
      const angle = cloud.angle + clock.elapsedTime * cloud.speed
      child.position.set(Math.cos(angle) * cloud.radius, cloud.y, Math.sin(angle) * cloud.radius)
    })
  })
  if (quality === 'low') return null
  return (
    <group ref={group}>
      {clouds.map((cloud, index) => (
        <sprite key={index} position={[Math.cos(cloud.angle) * cloud.radius, cloud.y, Math.sin(cloud.angle) * cloud.radius]} scale={[cloud.scale, cloud.scale * 0.45, 1]}>
          <spriteMaterial map={cloudTexture()} transparent opacity={0.42} depthWrite={false} fog={false} />
        </sprite>
      ))}
    </group>
  )
}

/** Islotes de roca lejanos para dar profundidad al abismo. */
function DistantRocks({ quality, reducedMotion }: { quality: GraphicsQuality; reducedMotion: boolean }) {
  const group = useRef<Group>(null)
  useFrame(({ clock }) => {
    const node = group.current
    if (!node || reducedMotion) return
    node.children.forEach((child, index) => {
      child.position.y = child.userData.baseY + Math.sin(clock.elapsedTime * 0.16 + index * 2.4) * 0.3
    })
  })
  if (quality === 'low') return null
  const rocks: readonly (readonly [number, number, number, number])[] = [
    [-15, -3.6, -10, 1.8],
    [14.5, -4.8, -13, 2.4],
    [16, -2.8, 8, 1.4],
  ]
  return (
    <group ref={group}>
      {rocks.map(([x, y, z, scale], index) => (
        <mesh key={index} position={[x, y, z]} scale={scale} rotation={[index, index * 2.1, 0]} userData={{ baseY: y }}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#141220" roughness={0.95} metalness={0.05} emissive="#1a1830" emissiveIntensity={0.3} fog={false} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * El Santuario de las Runas Quebradas, versión «plataforma celeste»:
 * losa flotante con balaustrada dorada, círculos rúnicos, portal arcano,
 * telescopio ceremonial y un cielo de nebulosas sobre un mar de nubes.
 */
export function Sanctuary({ quality, reducedMotion, event }: SanctuaryProps) {
  const flare = event?.type === 'nexus-damage' || event?.type === 'victory' ? 1 : 0
  return (
    <group>
      <CosmicSky quality={quality} reducedMotion={reducedMotion} />
      <CloudBanks quality={quality} reducedMotion={reducedMotion} />
      <DistantRocks quality={quality} reducedMotion={reducedMotion} />
      <PlatformDeck quality={quality} />
      <Balustrades quality={quality} />
      <InlayRing event={event} reducedMotion={reducedMotion} />
      <PortalGate flare={flare} reducedMotion={reducedMotion} quality={quality} />
      <Telescope reducedMotion={reducedMotion} />
      <CrystalPylon position={[-3.88, 0, 3.88]} flare={flare} reducedMotion={reducedMotion} quality={quality} />
      <CrystalPylon position={[3.88, 0, 3.88]} flare={flare} reducedMotion={reducedMotion} quality={quality} />
      <CrystalPylon position={[-3.88, 0, -3.88]} flare={flare} reducedMotion={reducedMotion} quality={quality} />
      <CrystalPylon position={[3.88, 0, -3.88]} flare={flare} reducedMotion={reducedMotion} quality={quality} />
      {quality !== 'low' && (
        <>
          <Sparkles
            count={quality === 'high' ? 80 : 40}
            scale={[10.5, 3.2, 10.5]}
            size={1.6}
            speed={reducedMotion ? 0 : 0.3}
            color="#9fd8ff"
            opacity={0.45}
            position={[0, 1.7, 0]}
          />
          <Sparkles
            count={quality === 'high' ? 34 : 16}
            scale={[8.5, 2, 8.5]}
            size={2.2}
            speed={reducedMotion ? 0 : 0.45}
            color="#e9c474"
            opacity={0.35}
            position={[0, 0.8, 0]}
          />
        </>
      )}
    </group>
  )
}
