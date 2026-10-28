import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Object3D } from 'three'
import type { InstancedMesh, MeshStandardMaterial } from 'three'
import { CARD_BY_ID } from '../game'

type HitMaterial = 'stone' | 'metal' | 'crystal' | 'organic' | 'spirit'
export const materialOf = (cardId?: string): HitMaterial => {
  const card = cardId ? CARD_BY_ID[cardId] : undefined
  if (!card) return 'stone'
  if (/Autómata|Máquina|Armadura/.test(card.subtype ?? '') || card.faction === 'forja') return 'metal'
  if (card.type === 'structure') return /Cristal/.test(card.subtype ?? '') ? 'crystal' : 'stone'
  if (card.faction === 'void' || card.faction === 'shadow') return 'spirit'
  if (/Cristal|Elemental de hielo/.test(card.subtype ?? '') || card.faction === 'arcane' || card.faction === 'fimbul') return 'crystal'
  return /Gólem|Estatua/.test(card.subtype ?? '') ? 'stone' : 'organic'
}

/** Fragmentos físicos sin gore. Un solo dibujo instanciado evita multiplicar
 * llamadas de render cuando un hechizo golpea varias piezas seguidas. */
export function ImpactDebris({ at, cardId, durationMs, destruction = false }: {
  readonly at: readonly [number, number]
  readonly cardId?: string
  readonly durationMs: number
  readonly destruction?: boolean
}) {
  const material = materialOf(cardId)
  const particles = useRef<InstancedMesh>(null)
  const surface = useRef<MeshStandardMaterial>(null)
  const start = useRef<number | null>(null)
  const transform = useMemo(() => new Object3D(), [])
  const seeds = useMemo(() => Array.from({ length: destruction ? 14 : 8 }, (_, index) => {
    const angle = index * 2.39996
    return { x: Math.cos(angle), z: Math.sin(angle), speed: 0.32 + index % 4 * 0.11, size: 0.026 + index % 3 * 0.012 }
  }), [destruction])
  useFrame(() => {
    const mesh = particles.current
    if (!mesh) return
    if (start.current === null) start.current = performance.now()
    const t = Math.min(1, (performance.now() - start.current) / Math.max(1, durationMs))
    const burst = 1 - Math.pow(1 - t, 2)
    seeds.forEach((seed, index) => {
      const reach = burst * seed.speed * (destruction ? 1.4 : 1)
      transform.position.set(seed.x * reach, Math.max(0.11, 0.45 + t * seed.speed * 1.4 - t * t * 0.7), seed.z * reach)
      transform.rotation.set(t * 4 + index, index * 1.7, t * 3 + index)
      const size = seed.size * (1 - Math.max(0, (t - 0.65) / 0.35)) * (destruction ? 1.6 : 1)
      // Las esquirlas metálicas y cristalinas necesitan una silueta legible
      // desde la cámara de juego, sin añadir más llamadas de render.
      const emphasis = destruction ? material === 'metal' ? 2 : material === 'crystal' ? 1.4 : 1 : 1
      transform.scale.set(size * emphasis, size * emphasis * (material === 'metal' ? 0.35 : 0.75), size * emphasis * (material === 'crystal' ? 2.1 : 1))
      transform.updateMatrix()
      mesh.setMatrixAt(index, transform.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (surface.current) surface.current.opacity = Math.min(1, (1 - t) * 2)
  })
  if (material === 'spirit') return null
  const color = material === 'metal' ? '#9c8770' : material === 'crystal' ? '#bcdde0' : material === 'organic' ? '#4b4c2e' : '#7a746b'
  return <instancedMesh ref={particles} args={[undefined, undefined, seeds.length]} position={[at[0], 0, at[1]]} frustumCulled={false}>
    {material === 'metal' ? <boxGeometry /> : material === 'crystal' ? <tetrahedronGeometry /> : <dodecahedronGeometry args={[1, 0]} />}
    <meshStandardMaterial ref={surface} color={color} roughness={material === 'metal' ? 0.3 : material === 'crystal' ? 0.18 : 0.9}
      metalness={material === 'metal' ? 0.65 : 0.04} transparent opacity={1} depthWrite={false} />
  </instancedMesh>
}
