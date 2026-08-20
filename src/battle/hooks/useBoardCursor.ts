import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BOARD_SIZE, CARD_BY_ID, type BoardPiece, type PlayerId, type Position } from '../../game'

export interface BoardCursorOptions {
  /** El cursor solo responde mientras haya partida jugable (sin modales encima). */
  enabled: boolean
  /** Bando que controla este navegador: decide hacia dónde apunta «arriba». */
  me: PlayerId
  board: readonly BoardPiece[]
  /** Casilla propuesta al activar el cursor por primera vez (p. ej. tu comandante). */
  home?: Position
  onCell: (position: Position) => void
  onPiece: (pieceId: string) => void
  onNexus: (playerId: PlayerId) => void
}

export interface BoardCursor {
  /** Casilla enfocada, o undefined si el cursor de teclado está apagado. */
  cell?: Position
  /** Texto para el lector de pantalla: qué hay ahora mismo bajo el cursor. */
  announcement: string
  /** Apaga el cursor (lo llaman Escape y el fin de partida). */
  clear: () => void
}

const clamp = (value: number) => Math.max(0, Math.min(BOARD_SIZE - 1, value))

/** «D4»: columna por letra y fila por número, como en un tablero de ajedrez. */
export const cellName = (position: Position): string =>
  `${String.fromCharCode(65 + position.x)}${position.y + 1}`

const same = (a: Position, b: Position) => a.x === b.x && a.y === b.y

/** Qué se anuncia al lector de pantalla para la casilla enfocada. */
export const describeCell = (
  cell: Position,
  board: readonly BoardPiece[],
  me: PlayerId,
): string => {
  const piece = board.find((candidate) => same(candidate.position, cell))
  if (!piece) return `${cellName(cell)}, casilla vacía.`
  const card = CARD_BY_ID[piece.cardId]
  const side = piece.owner === me ? 'tuya' : 'rival'
  const attack = card?.attack === undefined ? undefined : Math.max(0, card.attack + piece.attackModifier)
  const stats = attack === undefined
    ? `${piece.currentHealth} de vida`
    : `${attack} de ataque y ${piece.currentHealth} de vida`
  return `${cellName(cell)}, ${card?.name ?? 'unidad'}, ${side}, ${stats}.`
}

/**
 * Cursor de teclado sobre el tablero 3D. Hasta ahora el tablero solo se podía
 * operar con el ratón (raycasting de Three.js): la mano ya era accesible, pero
 * mover, atacar y desplegar exigían apuntar y hacer clic.
 *
 * Las flechas mueven el cursor, Enter/Espacio hacen lo mismo que un clic en esa
 * casilla (seleccionar una unidad, moverla, atacar o soltar la carta elegida de
 * la mano) y N ataca al Nexo rival. Escape lo apaga.
 *
 * El sentido de las flechas se corrige según el bando: el invitado de una
 * partida en línea ve el tablero girado 180°, así que su «arriba» es la fila
 * contraria — sin esto, jugar con teclado desde ese lado iría al revés.
 */
export const useBoardCursor = (options: BoardCursorOptions): BoardCursor => {
  const { enabled, me, board, home, onCell, onPiece, onNexus } = options
  const [cell, setCell] = useState<Position>()
  /** La posición viva se guarda además en un ref: el manejador de teclado la
      necesita para ACTUAR (Enter), y un actualizador de estado no puede tener
      efectos secundarios —en StrictMode se ejecuta dos veces y jugaría dos. */
  const cellRef = useRef<Position | undefined>(undefined)
  // Los manejadores se leen desde un ref para que el efecto de teclado no se
  // vuelva a suscribir en cada render de la partida (cambian en cada jugada).
  const handlers = useRef({ onCell, onPiece, onNexus, board, home, me })
  useEffect(() => {
    handlers.current = { onCell, onPiece, onNexus, board, home, me }
  })

  const clear = useCallback(() => {
    cellRef.current = undefined
    setCell(undefined)
  }, [])

  // Al apagarse (modal abierto, fin de partida) el cursor se olvida: el valor
  // que se expone ya se filtra por `enabled`, aquí solo se limpia el ref para
  // que al volver no reaparezca en la casilla de hace dos jugadas.
  useEffect(() => {
    if (!enabled) cellRef.current = undefined
  }, [enabled])

  useEffect(() => {
    if (!enabled) return undefined
    const move = (next: Position) => {
      cellRef.current = next
      setCell(next)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target as HTMLElement | null
      // Nunca robar las flechas a un campo de texto o a un desplegable.
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return
      const current = handlers.current
      // Fila 0 es la del rival del anfitrión y se dibuja arriba en pantalla, así
      // que para el bando 'player' subir es restar; el invitado ve la escena
      // girada 180°, con los dos ejes invertidos respecto a él.
      const away = current.me === 'player' ? -1 : 1
      const right = current.me === 'player' ? 1 : -1
      const start = () => current.home ?? { x: 3, y: current.me === 'player' ? BOARD_SIZE - 1 : 0 }
      const deltas: Readonly<Record<string, Position>> = {
        ArrowUp: { x: 0, y: away },
        ArrowDown: { x: 0, y: -away },
        ArrowLeft: { x: -right, y: 0 },
        ArrowRight: { x: right, y: 0 },
      }
      const delta = deltas[event.key]
      if (delta) {
        event.preventDefault()
        // Al tomar el mando del tablero, el cursor se lleva también el foco: si
        // se quedara en la carta de la mano que se acaba de elegir con clic, el
        // siguiente Enter iría a ese botón (alternando su selección) en vez de
        // a la casilla enfocada.
        const focused = document.activeElement
        if (focused instanceof HTMLElement && focused !== document.body) focused.blur()
        const position = cellRef.current
        move(position ? { x: clamp(position.x + delta.x), y: clamp(position.y + delta.y) } : start())
        return
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        const position = cellRef.current
        if (!position) {
          move(start())
          return
        }
        const piece = current.board.find((candidate) => same(candidate.position, position))
        if (piece) current.onPiece(piece.instanceId)
        else current.onCell(position)
        return
      }
      // Escape apaga el cursor (la pantalla ya lo usa además para deshacer la
      // selección: las dos cosas se cancelan a la vez, que es lo esperable).
      if (event.key === 'Escape') {
        cellRef.current = undefined
        setCell(undefined)
        return
      }
      if (event.key.toLowerCase() === 'n' && cellRef.current) {
        event.preventDefault()
        current.onNexus(current.me === 'player' ? 'ai' : 'player')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])

  const visible = enabled ? cell : undefined
  const announcement = useMemo(() => (visible ? describeCell(visible, board, me) : ''), [visible, board, me])

  return { cell: visible, announcement, clear }
}
