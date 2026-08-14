import type { CardDefinition } from '../../game'
import { withBase } from '../../utils/assets'
import styles from '../BattlePage.module.css'

interface DragGhostProps {
  card: CardDefinition
  pointer: { readonly x: number; readonly y: number }
  /** La casilla bajo el cursor admite esta carta: el fantasma lo confirma en verde. */
  overValidCell: boolean
}

/**
 * Miniatura de la carta que sigue al cursor mientras se arrastra al tablero.
 *
 * Va en un `position: fixed` sobre todo lo demás y sin capturar el puntero:
 * si lo capturara, el tablero dejaría de recibir el `pointermove` y no sabría
 * sobre qué casilla se está soltando.
 */
export function DragGhost({ card, pointer, overValidCell }: DragGhostProps) {
  return (
    <div
      className={styles.dragGhost}
      data-valid={overValidCell || undefined}
      style={{ left: pointer.x, top: pointer.y }}
      aria-hidden="true"
    >
      <img src={withBase(card.art.webp)} alt="" />
      <span>{card.name}</span>
    </div>
  )
}
