import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { memo, useRef } from 'react'
import type { Group } from 'three'
import type { AnimationEvent } from '../game'
import { gridToWorldX, gridToWorldZ } from './grid/gridCoordinates'
import styles from './DamageNumbers.module.css'

interface FloatingNumber {
  id: string
  x: number
  z: number
  value: number
  color: 'damage' | 'heal' | 'shield'
  startTime: number
}

/**
 * Números flotantes de daño/curación que aparecen sobre las cartas dañadas.
 * Se crean a partir de eventos de daño y flotan hacia arriba desapareciendo.
 */
export const DamageNumbers = memo(function DamageNumbers({ event }: { event?: AnimationEvent }) {
  const group = useRef<Group>(null)
  const numbersRef = useRef<FloatingNumber[]>([])
  const nextId = useRef(0)

  // Crear un número flotante cuando llega un evento de daño.
  if (event && (event.type === 'damage' || event.type === 'shield') && event.to) {
    const now = performance.now()
    const color: 'damage' | 'heal' | 'shield' = event.type === 'shield' ? 'shield' : 'damage'
    const value = event.amount ?? 0
    if (value > 0) {
      numbersRef.current.push({
        id: `num-${nextId.current++}`,
        x: gridToWorldX(event.to.x),
        z: gridToWorldZ(event.to.y),
        value,
        color,
        startTime: now,
      })
    }
  }

  // Animar y limpiar números obsoletos.
  useFrame(() => {
    const now = performance.now()
    const duration = 1200
    numbersRef.current = numbersRef.current.filter((num) => {
      const elapsed = now - num.startTime
      return elapsed < duration
    })
  })

  return (
    <group ref={group}>
      {numbersRef.current.map((num) => {
        const elapsed = performance.now() - num.startTime
        const progress = Math.min(1, elapsed / 1200)
        const opacity = progress > 0.7 ? (1 - progress) / 0.3 : 1
        const y = progress * 1.8 // Flota 1.8 unidades hacia arriba.

        return (
          <Html
            key={num.id}
            position={[num.x, num.z + y, 0]}
            scale={1}
            distanceFactor={8}
            zIndexRange={[16, 0]}
          >
            <div className={styles.number} data-color={num.color} style={{ opacity }}>
              {num.color === 'shield' ? '+' : '−'}{num.value}
            </div>
          </Html>
        )
      })}
    </group>
  )
})
