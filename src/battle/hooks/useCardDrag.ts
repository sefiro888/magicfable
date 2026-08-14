import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Distancia en píxeles que hay que recorrer para que un gesto cuente como
 * arrastre y no como clic. Sin este umbral, cualquier temblor del ratón al
 * pulsar una carta cancelaría el clic de toda la vida.
 */
const DRAG_THRESHOLD = 8

export interface CardDrag {
  /** Carta que se está arrastrando ahora mismo, si el gesto ya pasó el umbral. */
  draggingId?: string
  /** Posición del puntero en pantalla, para pintar la carta fantasma. */
  pointer?: { readonly x: number; readonly y: number }
  /** Empieza a seguir un gesto sobre una carta de la mano. */
  start: (instanceId: string, event: React.PointerEvent) => void
  /**
   * True (una sola vez) si el gesto que acaba de terminar fue un arrastre.
   * La pantalla la consulta para no procesar además el clic que el navegador
   * dispara al soltar, que si no alternaría la selección de la carta.
   */
  consumeDragged: () => boolean
}

export interface CardDragOptions {
  /** Se llama al soltar tras un arrastre real. Devuelve dónde se soltó. */
  onDrop: (instanceId: string) => void
  /** Se llama en cuanto el gesto pasa a ser un arrastre de verdad. */
  onDragStart?: (instanceId: string) => void
  /** Se llama siempre al terminar, haya sido arrastre o no. */
  onDragEnd?: () => void
}

/**
 * Arrastrar una carta de la mano hasta una casilla del tablero.
 *
 * Convive con el clic-clic de siempre en vez de sustituirlo: quien prefiera
 * seleccionar y luego pulsar la casilla puede seguir haciéndolo, y en táctil
 * las dos formas funcionan porque todo va con eventos de puntero.
 */
export const useCardDrag = ({ onDrop, onDragStart, onDragEnd }: CardDragOptions): CardDrag => {
  const [draggingId, setDraggingId] = useState<string>()
  const [pointer, setPointer] = useState<{ x: number; y: number }>()
  /** Gesto en curso: id de la carta y punto donde se pulsó. */
  const gesture = useRef<{ instanceId: string; startX: number; startY: number; dragging: boolean } | undefined>(undefined)
  /** Marca de «el último gesto fue un arrastre», para descartar el clic posterior. */
  const dragged = useRef(false)

  const start = useCallback((instanceId: string, event: React.PointerEvent) => {
    // Solo el botón principal: el secundario abre la inspección de la carta.
    if (event.button !== 0) return
    gesture.current = { instanceId, startX: event.clientX, startY: event.clientY, dragging: false }
  }, [])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const current = gesture.current
      if (!current) return
      const distance = Math.hypot(event.clientX - current.startX, event.clientY - current.startY)
      if (!current.dragging && distance < DRAG_THRESHOLD) return
      if (!current.dragging) {
        current.dragging = true
        setDraggingId(current.instanceId)
        onDragStart?.(current.instanceId)
      }
      setPointer({ x: event.clientX, y: event.clientY })
    }
    const onUp = () => {
      const current = gesture.current
      gesture.current = undefined
      if (!current) return
      if (current.dragging) {
        dragged.current = true
        onDrop(current.instanceId)
      }
      setDraggingId(undefined)
      setPointer(undefined)
      onDragEnd?.()
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [onDrop, onDragStart, onDragEnd])

  const consumeDragged = useCallback(() => {
    const was = dragged.current
    dragged.current = false
    return was
  }, [])

  return { draggingId, pointer, start, consumeDragged }
}
