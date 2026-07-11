import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, DoubleSide, MathUtils } from 'three'
import type { Group, Mesh, MeshBasicMaterial, PointLight } from 'three'
import type { AnimationEvent, Position } from '../game'
import { glowTexture } from './textures'

const boardX = (x: number) => (x - 2) * 1.18
const boardZ = (y: number) => (y - 2) * 1.18

const NEXUS_POSITION: Readonly<Record<string, readonly [number, number]>> = {
  'player-nexus': [0, 3.3],
  'ai-nexus': [0, -3.3],
}

/** Deduce el tono cromático del efecto a partir de su identificador declarativo. */
const toneOf = (effectId?: string): string => {
  const id = effectId ?? ''
  if (/(frost|ice|glacial|freeze|escarcha)/.test(id)) return '#a8ecff'
  if (/(fire|ember|fury|magma|caldera|ash|forge|rage|cinder|slag|basalt|siege|eruption|volcanic|heat)/.test(id)) return '#ff8a3d'
  if (/(arcane|rune|crystal|comet|glyph|time|mirror|astral|water|azur|library|portal|horizon|prism)/.test(id)) return '#79c8ff'
  return '#e9c474'
}

const glowFor = (tone: string) => (tone === '#ff8a3d' ? glowTexture('ember') : tone === '#e9c474' ? glowTexture('gold') : glowTexture('arcane'))

interface TimedProps {
  readonly durationMs: number
  readonly reducedMotion: boolean
}

const useProgress = ({ durationMs, reducedMotion }: TimedProps) => {
  const start = useRef<number | null>(null)
  const progress = useRef(reducedMotion ? 1 : 0)
  useFrame(() => {
    if (reducedMotion) return
    if (start.current === null) start.current = performance.now()
    progress.current = MathUtils.clamp((performance.now() - start.current) / Math.max(120, durationMs), 0, 1)
  })
  return progress
}

/** Columna de luz de invocación: la carta llega al Santuario. */
function SummonColumn({ cell, tone, timing }: { cell: Position; tone: string; timing: TimedProps }) {
  const progress = useProgress(timing)
  const column = useRef<Mesh>(null)
  const halo = useRef<Mesh>(null)
  useFrame(() => {
    const value = progress.current
    const fade = Math.sin(value * Math.PI)
    if (column.current) {
      column.current.scale.set(1, 0.2 + value * 1.6, 1)
      ;(column.current.material as MeshBasicMaterial).opacity = fade * 0.55
    }
    if (halo.current) {
      halo.current.scale.setScalar(0.4 + value * 1.7)
      ;(halo.current.material as MeshBasicMaterial).opacity = fade * 0.8
    }
  })
  if (timing.reducedMotion) return null
  return (
    <group position={[boardX(cell.x), 0, boardZ(cell.y)]}>
      <mesh ref={column} position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.34, 0.5, 1.7, 14, 1, true]} />
        <meshBasicMaterial color={tone} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
      </mesh>
      <mesh ref={halo} position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.52, 36]} />
        <meshBasicMaterial color={tone} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
      </mesh>
      <pointLight position={[0, 0.9, 0]} color={tone} intensity={9} distance={4} decay={2} />
    </group>
  )
}

/** Proyectil de ataque o hechizo entre dos casillas. */
function Projectile({ from, to, tone, timing, arc = 0.9 }: { from: readonly [number, number]; to: readonly [number, number]; tone: string; timing: TimedProps; arc?: number }) {
  const progress = useProgress(timing)
  const head = useRef<Group>(null)
  const trail = useRef<Mesh>(null)
  const texture = useMemo(() => glowFor(tone), [tone])
  useFrame(() => {
    const value = MathUtils.clamp(progress.current * 1.15, 0, 1)
    const x = MathUtils.lerp(from[0], to[0], value)
    const z = MathUtils.lerp(from[1], to[1], value)
    const y = 0.35 + Math.sin(value * Math.PI) * arc
    if (head.current) {
      head.current.position.set(x, y, z)
      const fade = value > 0.92 ? (1 - value) / 0.08 : 1
      head.current.scale.setScalar(0.9 * fade + 0.1)
    }
    if (trail.current) {
      trail.current.position.set(x, y, z)
      ;(trail.current.material as MeshBasicMaterial).opacity = 0.4 * (1 - value)
      trail.current.scale.setScalar(1 + value * 2.4)
    }
  })
  if (timing.reducedMotion) return null
  return (
    <>
      <group ref={head}>
        <sprite scale={[0.62, 0.62, 0.62]}>
          <spriteMaterial map={texture} transparent blending={AdditiveBlending} depthWrite={false} />
        </sprite>
        <pointLight color={tone} intensity={7} distance={3.4} decay={2} />
      </group>
      <mesh ref={trail} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.2, 24]} />
        <meshBasicMaterial color={tone} transparent opacity={0.4} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
      </mesh>
    </>
  )
}

/** Estallido de impacto: anillo expansivo, chispas y golpe de luz. */
function ImpactBurst({ cell, tone, timing, big = false }: { cell: readonly [number, number]; tone: string; timing: TimedProps; big?: boolean }) {
  const progress = useProgress(timing)
  const ring = useRef<Mesh>(null)
  const sparks = useRef<Group>(null)
  const light = useRef<PointLight>(null)
  const texture = useMemo(() => glowFor(tone), [tone])
  const directions = useMemo(
    () =>
      Array.from({ length: big ? 10 : 7 }, (_, index) => {
        const angle = (index / (big ? 10 : 7)) * Math.PI * 2 + 0.4
        return [Math.cos(angle), 0.5 + (index % 3) * 0.28, Math.sin(angle)] as const
      }),
    [big],
  )
  useFrame(() => {
    const value = progress.current
    const fade = 1 - value
    if (ring.current) {
      ring.current.scale.setScalar(0.25 + value * (big ? 3.4 : 2.2))
      ;(ring.current.material as MeshBasicMaterial).opacity = fade * 0.9
    }
    if (light.current) light.current.intensity = fade * (big ? 26 : 13)
    sparks.current?.children.forEach((spark, index) => {
      const direction = directions[index]!
      const reach = value * (big ? 1.5 : 1)
      spark.position.set(direction[0] * reach, direction[1] * reach * 0.8, direction[2] * reach)
      spark.scale.setScalar(Math.max(0.001, (1 - value) * 0.3))
    })
  })
  if (timing.reducedMotion) return null
  return (
    <group position={[cell[0], 0.16, cell[1]]}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.42, 36]} />
        <meshBasicMaterial color={tone} transparent opacity={0.9} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
      </mesh>
      <group ref={sparks}>
        {directions.map((_, index) => (
          <sprite key={index}>
            <spriteMaterial map={texture} transparent blending={AdditiveBlending} depthWrite={false} />
          </sprite>
        ))}
      </group>
      <pointLight ref={light} position={[0, 0.5, 0]} color={tone} intensity={13} distance={4.6} decay={2} />
    </group>
  )
}

/** Floración de hielo al congelar una unidad. */
function FreezeBloom({ cell, timing }: { cell: Position; timing: TimedProps }) {
  const progress = useProgress(timing)
  const group = useRef<Group>(null)
  useFrame(() => {
    const value = progress.current
    const grow = Math.min(1, value * 1.6)
    const fade = value > 0.7 ? (1 - value) / 0.3 : 1
    group.current?.children.forEach((child, index) => {
      child.scale.setScalar(Math.max(0.001, grow * (0.7 + (index % 3) * 0.2)))
      const material = (child as Mesh).material as MeshBasicMaterial
      material.opacity = 0.75 * fade
    })
  })
  if (timing.reducedMotion) return null
  const spikes = [0, 1, 2, 3, 4]
  return (
    <group ref={group} position={[boardX(cell.x), 0.1, boardZ(cell.y)]}>
      {spikes.map((index) => {
        const angle = (index / spikes.length) * Math.PI * 2
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.32, 0.16, Math.sin(angle) * 0.32]} rotation={[Math.PI * 0.06 * Math.cos(angle), 0, Math.PI * 0.06 * Math.sin(angle)]}>
            <coneGeometry args={[0.09, 0.5, 5]} />
            <meshBasicMaterial color="#bdf1ff" transparent opacity={0.75} blending={AdditiveBlending} depthWrite={false} />
          </mesh>
        )
      })}
    </group>
  )
}

/** Ascuas que ascienden cuando una carta es destruida. */
function DestroyEmbers({ cell, tone, timing }: { cell: Position; tone: string; timing: TimedProps }) {
  const progress = useProgress(timing)
  const group = useRef<Group>(null)
  const texture = useMemo(() => glowFor(tone), [tone])
  const seeds = useMemo(
    () => Array.from({ length: 9 }, (_, index) => ({
      x: Math.cos(index * 2.4) * 0.3,
      z: Math.sin(index * 1.7) * 0.3,
      speed: 0.7 + (index % 4) * 0.3,
    })),
    [],
  )
  useFrame(() => {
    const value = progress.current
    group.current?.children.forEach((child, index) => {
      const seed = seeds[index]!
      child.position.set(seed.x * (1 + value), 0.2 + value * seed.speed * 1.4, seed.z * (1 + value))
      child.scale.setScalar(Math.max(0.001, (1 - value) * 0.26))
    })
  })
  if (timing.reducedMotion) return null
  return (
    <group ref={group} position={[boardX(cell.x), 0, boardZ(cell.y)]}>
      {seeds.map((_, index) => (
        <sprite key={index}>
          <spriteMaterial map={texture} transparent blending={AdditiveBlending} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}

/** Onda expansiva sobre un Nexo herido. */
function NexusShock({ at, tone, timing }: { at: readonly [number, number]; tone: string; timing: TimedProps }) {
  const progress = useProgress(timing)
  const ring = useRef<Mesh>(null)
  const light = useRef<PointLight>(null)
  useFrame(() => {
    const value = progress.current
    const fade = 1 - value
    if (ring.current) {
      ring.current.scale.setScalar(0.3 + value * 3)
      ;(ring.current.material as MeshBasicMaterial).opacity = fade
    }
    if (light.current) light.current.intensity = fade * 34
  })
  if (timing.reducedMotion) return null
  return (
    <group position={[at[0], 0.45, at[1]]}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.66, 42]} />
        <meshBasicMaterial color={tone} transparent opacity={1} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
      </mesh>
      <pointLight ref={light} color={tone} intensity={34} distance={7} decay={2} />
    </group>
  )
}

/** Haz vertical de cierre de partida. */
function VictoryBeam({ tone, timing }: { tone: string; timing: TimedProps }) {
  const progress = useProgress(timing)
  const beam = useRef<Mesh>(null)
  useFrame(() => {
    const value = progress.current
    const fade = Math.sin(value * Math.PI)
    if (beam.current) {
      beam.current.scale.set(1 + value * 0.6, 1, 1 + value * 0.6)
      ;(beam.current.material as MeshBasicMaterial).opacity = fade * 0.5
    }
  })
  if (timing.reducedMotion) return null
  return (
    <mesh ref={beam} position={[0, 4, 0]}>
      <cylinderGeometry args={[1.4, 2.2, 8.5, 24, 1, true]} />
      <meshBasicMaterial color={tone} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
    </mesh>
  )
}

interface EventEffectsProps {
  readonly event: AnimationEvent
  readonly reducedMotion: boolean
}

/**
 * Traduce un AnimationEvent ya resuelto por el motor en su efecto visual.
 * Nunca decide reglas: solo representa lo que el motor ya decidió.
 */
export function EventEffects({ event, reducedMotion }: EventEffectsProps) {
  const timing: TimedProps = { durationMs: event.durationMs, reducedMotion }
  const tone = toneOf(event.effectId)
  switch (event.type) {
    case 'summon':
      return event.to ? <SummonColumn cell={event.to} tone={tone} timing={timing} /> : null
    case 'attack': {
      const target = event.targetId ? NEXUS_POSITION[event.targetId] : undefined
      const from: readonly [number, number] | undefined = event.from ? [boardX(event.from.x), boardZ(event.from.y)] : undefined
      const to: readonly [number, number] | undefined = event.to ? [boardX(event.to.x), boardZ(event.to.y)] : target
      return from && to ? <Projectile from={from} to={to} tone={tone} timing={timing} /> : null
    }
    case 'spell':
      return event.to ? (
        <ImpactBurst cell={[boardX(event.to.x), boardZ(event.to.y)]} tone={tone} timing={timing} />
      ) : null
    case 'damage':
      return event.to ? (
        <ImpactBurst cell={[boardX(event.to.x), boardZ(event.to.y)]} tone={tone} timing={timing} big={(event.amount ?? 0) >= 4} />
      ) : null
    case 'shield':
      return event.to ? (
        <ImpactBurst cell={[boardX(event.to.x), boardZ(event.to.y)]} tone="#a8ecff" timing={timing} />
      ) : null
    case 'freeze':
      return event.to ? <FreezeBloom cell={event.to} timing={timing} /> : null
    case 'destroy':
      return event.to ? <DestroyEmbers cell={event.to} tone={tone} timing={timing} /> : null
    case 'nexus-damage': {
      const at = event.targetId ? NEXUS_POSITION[event.targetId] : undefined
      return at ? <NexusShock at={at} tone={tone} timing={timing} /> : null
    }
    case 'victory':
      return <VictoryBeam tone={tone} timing={timing} />
    default:
      return null
  }
}
