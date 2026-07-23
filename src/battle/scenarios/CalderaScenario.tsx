import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending } from 'three'
import type { Group, Mesh, MeshStandardMaterial, PointLight } from 'three'
import type { AnimationEvent } from '../../game'
import type { GraphicsQuality } from '../../store/preferences'
import { usePageVisibility } from '../usePageVisibility'
import { glowTexture, lavaFloorTexture } from '../textures'
import { SCENERY_SCALE } from '../grid/gridCoordinates'
import { Sanctuary } from '../Sanctuary'

interface CalderaScenarioProps {
  quality: GraphicsQuality
  reducedMotion: boolean
  event?: AnimationEvent
}

/** Lago de lava bajo las ruinas: roca agrietada con vetas incandescentes que respiran. */
function LavaPool({ reducedMotion, flare }: { reducedMotion: boolean; flare: number }) {
  const material = useRef<MeshStandardMaterial>(null)
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    if (!material.current) return
    const breathe = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.9) * 0.18
    material.current.emissiveIntensity = (reducedMotion || !visible.current ? 1.1 : 1.1 + breathe) + flare * 0.6
  })
  const texture = lavaFloorTexture()
  return (
    <mesh position={[0, -2.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[11.2, 48]} />
      <meshStandardMaterial
        ref={material}
        map={texture}
        emissiveMap={texture}
        emissive="#ff8a3d"
        emissiveIntensity={1.1}
        roughness={0.85}
        metalness={0.1}
      />
    </mesh>
  )
}

/** Roca volcánica flotando en el abismo de brasa: bloque irregular con bamboleo y giro lentos. */
function VolcanicRock({
  position,
  scale,
  speed,
  reducedMotion,
}: {
  position: readonly [number, number, number]
  scale: number
  speed: number
  reducedMotion: boolean
}) {
  const mesh = useRef<Mesh>(null)
  const visible = usePageVisibility()
  useFrame(({ clock }) => {
    if (!mesh.current || reducedMotion || !visible.current) return
    const t = clock.elapsedTime * speed
    mesh.current.position.y = position[1] + Math.sin(t) * 0.22
    mesh.current.rotation.x = t * 0.3
    mesh.current.rotation.z = t * 0.22
  })
  return (
    <mesh ref={mesh} position={[position[0], position[1], position[2]]} scale={scale} castShadow={false}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#241210" roughness={0.95} metalness={0.05} emissive="#7a2a10" emissiveIntensity={0.5} />
    </mesh>
  )
}

/** Anillo de rocas volcánicas suspendidas alrededor de las ruinas. */
function VolcanicDebris({ quality, reducedMotion }: { quality: GraphicsQuality; reducedMotion: boolean }) {
  const rocks = useMemo(
    () =>
      Array.from({ length: quality === 'low' ? 4 : 7 }, (_, index) => {
        const angle = (index / (quality === 'low' ? 4 : 7)) * Math.PI * 2 + index * 1.7
        const radius = 7.4 + (index % 3) * 1.4
        return {
          position: [Math.cos(angle) * radius, -0.6 + (index % 3) * 0.5, Math.sin(angle) * radius] as const,
          scale: 0.22 + (index % 4) * 0.09,
          speed: 0.18 + (index % 3) * 0.08,
        }
      }),
    [quality],
  )
  return (
    <>
      {rocks.map((rock, index) => (
        <VolcanicRock key={index} position={rock.position} scale={rock.scale} speed={rock.speed} reducedMotion={reducedMotion} />
      ))}
    </>
  )
}

/** Brasas ascendentes: partículas cálidas que suben desde el lago de lava. */
function RisingEmbers({ quality, reducedMotion }: { quality: GraphicsQuality; reducedMotion: boolean }) {
  if (quality === 'low') return null
  return (
    <Sparkles
      count={quality === 'high' ? 70 : 40}
      scale={[10.5, 4.2, 10.5]}
      size={2.2}
      speed={reducedMotion ? 0 : 0.5}
      color="#ff9a4a"
      opacity={0.55}
      position={[0, 0.4, 0]}
    />
  )
}

/** Brasas grandes en primer plano, con el mismo halo cálido que usan las cartas de Furia. */
function EmberMotes({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<Group>(null)
  const light = useRef<PointLight>(null)
  const visible = usePageVisibility()
  const motes = useMemo(
    () => [
      { x: -6.8, z: 3.4, scale: 1.3 },
      { x: 6.2, z: -3.8, scale: 1.6 },
      { x: 3.6, z: 6.4, scale: 1.1 },
      { x: -4.4, z: -6.6, scale: 1.4 },
    ],
    [],
  )
  useFrame(({ clock }) => {
    if (!light.current) return
    const flicker = reducedMotion || !visible.current ? 0 : Math.sin(clock.elapsedTime * 3.4) * 6
    light.current.intensity = 24 + flicker
  })
  const texture = glowTexture('ember')
  return (
    <group ref={group}>
      {motes.map((mote, index) => (
        <sprite key={index} position={[mote.x, 0.5, mote.z]} scale={[mote.scale, mote.scale, 1]}>
          <spriteMaterial map={texture} transparent opacity={0.5} blending={AdditiveBlending} depthWrite={false} />
        </sprite>
      ))}
      <pointLight ref={light} position={[0, 0.7, 0]} color="#ff6a20" intensity={24} distance={9} decay={2} />
    </group>
  )
}

/**
 * La Fragua de la Caldera: las mismas ruinas del Santuario suspendidas sobre
 * un lago de lava vivo, con rocas volcánicas flotando en el abismo y brasas
 * que ascienden desde el fuego. La lava respira y se aviva con cada golpe al
 * Nexo, igual que el portal de Aether Citadel reacciona a los impactos.
 */
export function CalderaScenario({ quality, reducedMotion, event }: CalderaScenarioProps) {
  const flare = event?.type === 'nexus-damage' || event?.type === 'victory' ? 1 : 0
  return (
    <>
      <color attach="background" args={['#1a0805']} />
      <fog attach="fog" args={['#2a0c05', 9, 28]} />
      <ambientLight intensity={1.25} color="#ffb187" />
      <hemisphereLight intensity={0.9} color="#ffd8a0" groundColor="#3a0f06" />
      {/* Fogonazo cenital de fragua, cálido e intenso. */}
      <spotLight position={[-3, 9, 4]} intensity={78} angle={0.6} penumbra={0.85} castShadow={quality !== 'low'} color="#ffcaa0" />
      {/* Brasas laterales: rojo profundo y naranja incandescente. */}
      <pointLight position={[4, 1.6, -4]} color="#ff4a1e" intensity={26 + flare * 14} distance={10} />
      <pointLight position={[-4, 1.6, 4]} color="#ff9838" intensity={22 + flare * 12} distance={10} />
      <pointLight position={[0, 0.6, 0]} color="#ff6a20" intensity={12 + flare * 10} distance={6} />
      <LavaPool reducedMotion={reducedMotion} flare={flare} />
      <VolcanicDebris quality={quality} reducedMotion={reducedMotion} />
      <EmberMotes reducedMotion={reducedMotion} />
      <RisingEmbers quality={quality} reducedMotion={reducedMotion} />
      {/* Sanctuary se diseñó para la huella 5×5: se reescala a la huella actual. */}
      <group scale={SCENERY_SCALE}>
        <Sanctuary quality={quality} reducedMotion={reducedMotion} event={event} />
      </group>
    </>
  )
}
