import { Html } from '@react-three/drei'
import { memo, useEffect, useState } from 'react'
import type { AnimationEvent } from '../game'
import { gridToWorldX, gridToWorldZ } from './grid/gridCoordinates'
import styles from './DamageNumbers.module.css'

interface FloatingNumber {
  readonly id: string
  readonly x: number
  readonly z: number
  readonly value: number
  readonly color: 'damage' | 'heal' | 'shield'
}

/** Cuánto dura la subida del número, en milisegundos. Debe casar con el CSS. */
const FLOAT_MS = 1200
/** Altura sobre la casilla a la que aparece, por encima de la chapa de la unidad. */
const SPAWN_HEIGHT = 1.0

let nextId = 0

/**
 * Números flotantes de daño, curación y escudo sobre la casilla afectada.
 *
 * Dos arreglos respecto a la primera versión:
 *
 * 1. Salían en el sitio equivocado. La posición era `[x, z + subida, 0]`, que
 *    usa la coordenada Z del tablero como ALTURA y deja la profundidad fija en
 *    0 — el número aparecía flotando sobre la fila central del tablero y a una
 *    altura proporcional a la fila, en vez de encima de la ficha golpeada.
 * 2. No se movían. El progreso se leía con `performance.now()` durante el
 *    render y la lista vivía en un ref, así que la animación solo avanzaba
 *    cuando React volvía a renderizar por otro motivo. Ahora la subida y el
 *    desvanecido los hace el CSS, que va por su cuenta y no cuesta renders.
 */
export const DamageNumbers = memo(function DamageNumbers({ event }: { event?: AnimationEvent }) {
  const [numbers, setNumbers] = useState<readonly FloatingNumber[]>([])

  useEffect(() => {
    if (!event || !event.to) return
    if (event.type !== 'damage' && event.type !== 'shield') return
    const value = event.amount ?? 0
    if (value <= 0) return
    const entry: FloatingNumber = {
      id: `num-${nextId++}`,
      x: gridToWorldX(event.to.x),
      z: gridToWorldZ(event.to.y),
      value,
      color: event.type === 'shield' ? 'shield' : 'damage',
    }
    setNumbers((current) => [...current, entry])
    const timer = window.setTimeout(
      () => setNumbers((current) => current.filter((item) => item.id !== entry.id)),
      FLOAT_MS,
    )
    return () => window.clearTimeout(timer)
  }, [event])

  return (
    <group>
      {numbers.map((num) => (
        <Html key={num.id} center position={[num.x, SPAWN_HEIGHT, num.z]} distanceFactor={8} zIndexRange={[16, 0]}>
          <div className={styles.number} data-color={num.color}>
            {num.color === 'shield' ? '+' : '−'}{num.value}
          </div>
        </Html>
      ))}
    </group>
  )
})
