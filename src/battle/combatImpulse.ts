import type { AnimationEvent, BoardPiece } from '../game'
import { gridToWorldX, gridToWorldZ, nexusWorldZ } from './grid/gridCoordinates'

/**
 * Golpe físico de una ficha: la embestida del atacante hacia su objetivo y el
 * retroceso del que lo recibe. Hasta ahora un ataque solo se veía por los
 * números de daño flotantes — las dos fichas se quedaban quietas, así que no
 * había forma de saber quién estaba pegando a quién sin leer la crónica.
 */
export interface Impulse {
  /** Id del evento que lo provocó: cambiar de id es lo que dispara la animación. */
  readonly key: string
  readonly kind: 'lunge' | 'recoil'
  /** Dirección normalizada en el plano del tablero. */
  readonly dx: number
  readonly dz: number
}

/** Dirección unitaria de un punto a otro; hacia el fondo si coinciden. */
const direction = (fromX: number, fromZ: number, toX: number, toZ: number) => {
  const dx = toX - fromX
  const dz = toZ - fromZ
  const length = Math.hypot(dx, dz)
  return length < 0.0001 ? { dx: 0, dz: -1 } : { dx: dx / length, dz: dz / length }
}

/**
 * Qué fichas se mueven por el evento que se está reproduciendo, y hacia dónde.
 *
 * El atacante embiste en la dirección de su objetivo (contra el Nexo rival no
 * viene casilla de destino: se apunta al Nexo). El que recibe daño retrocede
 * alejándose de la casilla de la que vino el golpe — por eso el motor marca
 * `from` en los eventos de daño de combate; sin ese dato, el retroceso se
 * calculaba «hacia fuera del centro» y en medio tablero salía al revés.
 */
export const impulsesForEvent = (
  event: AnimationEvent | undefined,
  board: readonly BoardPiece[],
): ReadonlyMap<string, Impulse> => {
  const map = new Map<string, Impulse>()
  if (!event) return map
  const pieceAt = (id?: string) => board.find((candidate) => candidate.instanceId === id)

  if (event.type === 'attack' && event.actorId) {
    const attacker = pieceAt(event.actorId)
    if (attacker) {
      const from = { x: gridToWorldX(attacker.position.x), z: gridToWorldZ(attacker.position.y) }
      const to = event.to
        ? { x: gridToWorldX(event.to.x), z: gridToWorldZ(event.to.y) }
        : { x: 0, z: nexusWorldZ(attacker.owner === 'player' ? 'ai' : 'player') }
      const { dx, dz } = direction(from.x, from.z, to.x, to.z)
      map.set(attacker.instanceId, { key: event.id, kind: 'lunge', dx, dz })
    }
  }

  if ((event.type === 'damage' || event.type === 'destroy') && event.targetId) {
    const defender = pieceAt(event.targetId)
    if (defender) {
      const to = { x: gridToWorldX(defender.position.x), z: gridToWorldZ(defender.position.y) }
      const from = event.from
        ? { x: gridToWorldX(event.from.x), z: gridToWorldZ(event.from.y) }
        : { x: 0, z: 0 }
      const { dx, dz } = direction(from.x, from.z, to.x, to.z)
      map.set(defender.instanceId, { key: event.id, kind: 'recoil', dx, dz })
    }
  }

  return map
}
