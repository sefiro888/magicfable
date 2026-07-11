import { Float, Sparkles, Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, DoubleSide } from 'three'
import type { Group, Mesh, MeshStandardMaterial, PointLight } from 'three'
import type { AnimationEvent } from '../game'
import { glowTexture, monolithTexture, sanctuaryFloorTexture } from './textures'

export type GraphicsQuality = 'low' | 'medium' | 'high'

interface SanctuaryProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  /** Último evento visual en reproducción; el escenario reacciona con discreción. */
  event?: AnimationEvent
}

/** Plataforma central de piedra con runas grabadas y grietas de energía. */
function Platform({ quality }: { quality: GraphicsQuality }) {
  const floor = useMemo(() => sanctuaryFloorTexture(), [])
  return (
    <group>
      <mesh position={[0, -0.5, 0]} receiveShadow={quality !== 'low'}>
        <cylinderGeometry args={[5.05, 5.5, 0.92, 10]} />
        <meshStandardMaterial color="#141827" roughness={0.85} metalness={0.12} emissive="#080b14" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, -0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={quality !== 'low'}>
        <circleGeometry args={[5.05, 48]} />
        <meshStandardMaterial
          map={floor}
          emissiveMap={floor}
          emissive="#8ab8d8"
          emissiveIntensity={0.24}
          roughness={0.82}
          metalness={0.14}
        />
      </mesh>
      {/* Resplandor del abismo bajo la plataforma. */}
      <mesh position={[0, -1.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8.6, 40]} />
        <meshBasicMaterial
          map={glowTexture('arcane')}
          transparent
          opacity={0.34}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/** Anillo rúnico flotante que rodea el tablero y late en los cambios de turno. */
function RuneRing({ event, reducedMotion }: { event?: AnimationEvent; reducedMotion: boolean }) {
  const ring = useRef<Mesh>(null)
  const pulseStart = useRef(-10)
  useEffect(() => {
    if (event && (event.type === 'turn' || event.type === 'victory')) {
      pulseStart.current = performance.now()
    }
  }, [event])
  useFrame(({ clock }) => {
    const node = ring.current
    if (!node) return
    if (!reducedMotion) node.rotation.z = clock.elapsedTime * 0.045
    const since = (performance.now() - pulseStart.current) / 1000
    const pulse = since < 1.4 ? Math.sin(Math.min(1, since / 1.4) * Math.PI) : 0
    const material = node.material as MeshStandardMaterial
    material.emissiveIntensity = 0.85 + pulse * 2.4
    node.scale.setScalar(1 + pulse * 0.012)
  })
  return (
    <mesh ref={ring} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[5.14, 5.36, 72]} />
      <meshStandardMaterial
        color="#3a3421"
        emissive="#d7b467"
        emissiveIntensity={0.85}
        transparent
        opacity={0.85}
        side={DoubleSide}
        roughness={0.5}
        metalness={0.4}
      />
    </mesh>
  )
}

const MONOLITHS: readonly {
  angle: number
  radius: number
  height: number
  tilt: number
  broken: boolean
}[] = [
  { angle: 0.35, radius: 7.6, height: 3.9, tilt: 0.1, broken: false },
  { angle: 1.18, radius: 8.2, height: 2.6, tilt: -0.16, broken: true },
  { angle: 2.05, radius: 7.4, height: 4.5, tilt: 0.05, broken: false },
  { angle: 2.9, radius: 8.6, height: 3.1, tilt: 0.2, broken: true },
  { angle: 3.85, radius: 7.8, height: 4.1, tilt: -0.08, broken: false },
  { angle: 4.6, radius: 8.3, height: 2.3, tilt: 0.24, broken: true },
  { angle: 5.5, radius: 7.5, height: 3.6, tilt: -0.14, broken: false },
]

/** Monolitos quebrados alrededor de la arena, con runas talladas que brillan tenuemente. */
function Monoliths({ quality, reducedMotion }: { quality: GraphicsQuality; reducedMotion: boolean }) {
  return (
    <group>
      {MONOLITHS.map((monolith, index) => {
        const x = Math.cos(monolith.angle) * monolith.radius
        const z = Math.sin(monolith.angle) * monolith.radius
        const texture = monolithTexture(0x4d4f4e + index * 97)
        return (
          <group key={index} position={[x, monolith.height / 2 - 1.05, z]} rotation={[0, -monolith.angle + Math.PI / 2, monolith.tilt]}>
            <mesh castShadow={quality === 'high'}>
              <boxGeometry args={[0.86, monolith.height, 0.5]} />
              <meshStandardMaterial
                map={texture}
                emissiveMap={texture}
                emissive="#79c8ef"
                emissiveIntensity={0.32}
                roughness={0.9}
                metalness={0.08}
              />
            </mesh>
            {monolith.broken && quality !== 'low' && (
              <Float speed={reducedMotion ? 0 : 1.3} rotationIntensity={reducedMotion ? 0 : 0.28} floatIntensity={reducedMotion ? 0 : 0.5}>
                <mesh position={[0.14, monolith.height * 0.62 + 0.42, 0]} rotation={[0.4, 0.7, 0.2]}>
                  <boxGeometry args={[0.5, 0.62, 0.4]} />
                  <meshStandardMaterial
                    map={texture}
                    emissiveMap={texture}
                    emissive="#79c8ef"
                    emissiveIntensity={0.45}
                    roughness={0.9}
                  />
                </mesh>
              </Float>
            )}
          </group>
        )
      })}
    </group>
  )
}

/** Brasero con llama de dos planos cruzados y luz parpadeante. */
function Brazier({
  position,
  seedOffset,
  quality,
  reducedMotion,
  flare,
}: {
  position: [number, number, number]
  seedOffset: number
  quality: GraphicsQuality
  reducedMotion: boolean
  flare: number
}) {
  const light = useRef<PointLight>(null)
  const flame = useRef<Group>(null)
  useFrame(({ clock }) => {
    const time = clock.elapsedTime * (reducedMotion ? 0.2 : 1)
    const flicker = 0.82 + Math.sin(time * 7.3 + seedOffset) * 0.1 + Math.sin(time * 13.7 + seedOffset * 2) * 0.08
    if (light.current) light.current.intensity = (5.2 + flare * 9) * flicker
    if (flame.current) {
      flame.current.scale.setScalar((0.9 + flare * 0.5) * (0.92 + flicker * 0.12))
      flame.current.rotation.y = time * 0.9 + seedOffset
    }
  })
  const ember = glowTexture('ember')
  return (
    <group position={position}>
      <mesh castShadow={quality === 'high'}>
        <cylinderGeometry args={[0.34, 0.2, 0.5, 8]} />
        <meshStandardMaterial color="#1a1610" roughness={0.7} metalness={0.5} emissive="#492107" emissiveIntensity={0.6} />
      </mesh>
      <group ref={flame} position={[0, 0.52, 0]}>
        {[0, Math.PI / 2].map((rotation) => (
          <mesh key={rotation} rotation={[0, rotation, 0]}>
            <planeGeometry args={[0.62, 0.98]} />
            <meshBasicMaterial map={ember} transparent opacity={0.9} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
          </mesh>
        ))}
      </group>
      {quality !== 'low' && (
        <Sparkles count={quality === 'high' ? 14 : 8} scale={[0.7, 1.6, 0.7]} size={2.2} speed={reducedMotion ? 0 : 0.9} color="#ffb066" opacity={0.8} position={[0, 1.1, 0]} />
      )}
      <pointLight ref={light} position={[0, 0.9, 0]} color="#ff9040" intensity={5.2} distance={6.5} decay={2} />
    </group>
  )
}

/** Ruinas lejanas flotando sobre el abismo. */
function FloatingRuins({ quality, reducedMotion }: { quality: GraphicsQuality; reducedMotion: boolean }) {
  const group = useRef<Group>(null)
  useFrame(({ clock }) => {
    const node = group.current
    if (!node || reducedMotion) return
    const time = clock.elapsedTime
    node.children.forEach((child, index) => {
      child.position.y = child.userData.baseY + Math.sin(time * 0.22 + index * 1.7) * 0.35
      child.rotation.y = child.userData.baseRotation + time * 0.014 * (index % 2 === 0 ? 1 : -1)
    })
  })
  const slabs = useMemo(
    () => [
      { position: [-13.5, 1.4, -9] as const, size: [3.4, 1.1, 2.2] as const },
      { position: [12.5, 2.6, -11.5] as const, size: [2.6, 3.4, 1.8] as const },
      { position: [15, 0.4, 6.5] as const, size: [4.2, 0.9, 2.6] as const },
      { position: [-14.8, 3.1, 7.8] as const, size: [2.2, 2.6, 1.9] as const },
      { position: [1.5, 4.9, -16.5] as const, size: [5.2, 1.4, 2.4] as const },
    ],
    [],
  )
  if (quality === 'low') return null
  return (
    <group ref={group}>
      {slabs.map((slab, index) => (
        <mesh
          key={index}
          position={[slab.position[0], slab.position[1], slab.position[2]]}
          rotation={[0.06 * (index - 2), index * 1.2, 0.05 * (index - 1)]}
          userData={{ baseY: slab.position[1], baseRotation: index * 1.2 }}
        >
          <boxGeometry args={[slab.size[0], slab.size[1], slab.size[2]]} />
          <meshStandardMaterial color="#0e1120" roughness={0.95} metalness={0.05} emissive="#131a30" emissiveIntensity={0.35} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * El Santuario de las Runas Quebradas: escenografía completa.
 * Presupuesto visual: el escenario ambienta; nunca compite con las cartas.
 */
export function Sanctuary({ quality, reducedMotion, event }: SanctuaryProps) {
  const flare = event?.type === 'nexus-damage' || event?.type === 'victory' ? 1 : 0
  return (
    <group>
      <Platform quality={quality} />
      <RuneRing event={event} reducedMotion={reducedMotion} />
      <Monoliths quality={quality} reducedMotion={reducedMotion} />
      <Brazier position={[-3.32, -0.02, 3.32]} seedOffset={0} quality={quality} reducedMotion={reducedMotion} flare={flare} />
      <Brazier position={[3.32, -0.02, 3.32]} seedOffset={2.1} quality={quality} reducedMotion={reducedMotion} flare={flare} />
      <Brazier position={[-3.32, -0.02, -3.32]} seedOffset={4.4} quality={quality} reducedMotion={reducedMotion} flare={flare} />
      <Brazier position={[3.32, -0.02, -3.32]} seedOffset={6.2} quality={quality} reducedMotion={reducedMotion} flare={flare} />
      <FloatingRuins quality={quality} reducedMotion={reducedMotion} />
      {quality !== 'low' && (
        <>
          <Sparkles
            count={quality === 'high' ? 90 : 45}
            scale={[10.5, 3.4, 10.5]}
            size={1.7}
            speed={reducedMotion ? 0 : 0.32}
            color="#9fd8ff"
            opacity={0.5}
            position={[0, 1.8, 0]}
          />
          <Sparkles
            count={quality === 'high' ? 40 : 18}
            scale={[9, 2.2, 9]}
            size={2.4}
            speed={reducedMotion ? 0 : 0.5}
            color="#ffb066"
            opacity={0.42}
            position={[0, 0.9, 0]}
          />
        </>
      )}
      <Stars radius={42} depth={22} count={quality === 'high' ? 1500 : quality === 'medium' ? 800 : 300} factor={3.2} saturation={0.35} fade speed={reducedMotion ? 0 : 0.5} />
    </group>
  )
}
