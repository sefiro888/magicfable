import { useFrame } from '@react-three/fiber'
import { memo, useEffect, useRef } from 'react'
import type { Mesh, MeshBasicMaterial } from 'three'
import type { AnimationEvent } from '../game'
import { gridToWorldX, gridToWorldZ } from './grid/gridCoordinates'
import { useTransientEntries } from './useTransientEntries'

interface HitMark {
  readonly id: string
  readonly x: number
  readonly z: number
  readonly startTime: number
}

/** Cuánto tarda la marca en desvanecerse del todo, en milisegundos. */
const HIT_MARK_MS = 2200

let nextId = 0

/**
 * Marca de "aquí hubo un golpe" sobre la casilla afectada: un anillo que se
 * expande y se desvanece durante un par de segundos. Antes la única señal de
 * que algo había pasado en una casilla era el aviso de texto central, que
 * desaparece enseguida y no dice DÓNDE ocurrió — con varias piezas en juego,
 * costaba relacionar el aviso con la casilla concreta.
 *
 * Mismo patrón que `DamageNumbers`: una lista en estado de React, poblada por
 * un efecto que escucha `event`, con temporizadores que la limpian solos.
 */
export const RecentHits = memo(function RecentHits({ event, reducedMotion }: { event?: AnimationEvent; reducedMotion: boolean }) {
  const { entries: marks, append } = useTransientEntries<HitMark>(HIT_MARK_MS)

  useEffect(() => {
    if (reducedMotion || !event || !event.to) return
    if (event.type !== 'damage' && event.type !== 'destroy') return
    const entry: HitMark = {
      id: `hit-${nextId++}`,
      x: gridToWorldX(event.to.x),
      z: gridToWorldZ(event.to.y),
      startTime: performance.now(),
    }
    append(entry)
  }, [event, reducedMotion, append])

  if (reducedMotion) return null

  return (
    <>
      {marks.map((mark) => <HitRing key={mark.id} mark={mark} />)}
    </>
  )
})

function HitRing({ mark }: { mark: HitMark }) {
  const mesh = useRef<Mesh>(null)
  useFrame(() => {
    const node = mesh.current
    if (!node) return
    const progress = Math.min(1, (performance.now() - mark.startTime) / HIT_MARK_MS)
    const material = node.material as MeshBasicMaterial
    material.opacity = (1 - progress) * 0.55
    node.scale.setScalar(0.55 + progress * 0.6)
  })
  return (
    <mesh ref={mesh} position={[mark.x, 0.105, mark.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.34, 0.355, 32]} />
      <meshBasicMaterial color="#ff6b5b" transparent opacity={0.5} depthWrite={false} />
    </mesh>
  )
}
