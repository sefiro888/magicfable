import { useFrame } from '@react-three/fiber'
import { memo, useEffect, useRef, useState } from 'react'
import type { Mesh, MeshBasicMaterial } from 'three'
import type { AnimationEvent } from '../game'
import { gridToWorldX, gridToWorldZ } from './grid/gridCoordinates'

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
  const [marks, setMarks] = useState<readonly HitMark[]>([])

  useEffect(() => {
    if (reducedMotion || !event || !event.to) return
    if (event.type !== 'damage' && event.type !== 'destroy') return
    const entry: HitMark = {
      id: `hit-${nextId++}`,
      x: gridToWorldX(event.to.x),
      z: gridToWorldZ(event.to.y),
      startTime: performance.now(),
    }
    // Diferido con setTimeout(0): llamar a setState directamente en el cuerpo
    // del efecto dispara el aviso de renders en cascada (mismo patrón que ya
    // usa el director de animaciones de BattlePage.tsx para sus canales laterales).
    const spawn = window.setTimeout(() => setMarks((current) => [...current, entry]), 0)
    const remove = window.setTimeout(
      () => setMarks((current) => current.filter((mark) => mark.id !== entry.id)),
      HIT_MARK_MS,
    )
    return () => {
      window.clearTimeout(spawn)
      window.clearTimeout(remove)
    }
  }, [event, reducedMotion])

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
    <mesh ref={mesh} position={[mark.x, 0.03, mark.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.27, 0.4, 28]} />
      <meshBasicMaterial color="#ff6b5b" transparent opacity={0.5} depthWrite={false} />
    </mesh>
  )
}
