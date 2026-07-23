import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { CARD_BY_ID, type MatchState } from '../../game'
import styles from './GuidedTutorial.module.css'

type StepId = 'source' | 'unit' | 'act' | 'endTurn' | 'done'

interface Step {
  readonly id: StepId
  readonly title: string
  readonly body: string
}

const STEPS: readonly Step[] = [
  { id: 'source', title: 'Juega una fuente', body: 'Toca una fuente de Esencia de tu mano para añadirla a tu reserva. La necesitas para pagar el resto de tus cartas.' },
  { id: 'unit', title: 'Despliega una unidad', body: 'Elige una unidad de tu mano y colócala en tu fila, marcada en dorado sobre el tablero.' },
  { id: 'act', title: 'Muévela o atácala', body: 'Selecciona esa unidad en el tablero para ver a dónde puede moverse o a quién puede atacar.' },
  { id: 'endTurn', title: 'Termina tu turno', body: 'Cuando no te queden más jugadas, cede el turno al rival. Tus fuentes se recargarán en tu próximo turno.' },
]

interface Rect {
  readonly top: number
  readonly left: number
  readonly width: number
  readonly height: number
}

/** Recalcula la posición de un elemento del DOM mientras el paso esté activo. */
const useTrackedRect = (getElement: () => HTMLElement | null | undefined, active: boolean): Rect | undefined => {
  const [rect, setRect] = useState<Rect>()
  useEffect(() => {
    if (!active) return undefined
    let frame: number
    const measure = () => {
      const element = getElement()
      if (element) {
        const box = element.getBoundingClientRect()
        setRect({ top: box.top, left: box.left, width: box.width, height: box.height })
      } else {
        setRect(undefined)
      }
      frame = window.requestAnimationFrame(measure)
    }
    frame = window.requestAnimationFrame(measure)
    // El reset al desactivarse vive en la limpieza, no en el cuerpo del efecto:
    // evita el setState síncrono que penaliza la regla react-hooks/set-state-in-effect.
    return () => {
      window.cancelAnimationFrame(frame)
      setRect(undefined)
    }
  }, [active, getElement])
  return rect
}

interface GuidedTutorialProps {
  readonly match: MatchState
  readonly handBarRef: RefObject<HTMLElement | null>
  readonly endTurnRef: RefObject<HTMLButtonElement | null>
  readonly onFinish: () => void
}

/**
 * Coach interactivo para la primera partida: en vez de explicar las reglas de
 * golpe, señala la jugada concreta que toca hacer y avanza solo cuando el
 * motor confirma que ocurrió, no con un botón «siguiente».
 */
export function GuidedTutorial({ match, handBarRef, endTurnRef, onFinish }: GuidedTutorialProps) {
  const [index, setIndex] = useState(0)
  const step = STEPS[index]
  const player = match.players.player

  const startedResourcePlayed = useRef(player.resourcePlayedThisTurn)
  const startedBoardCount = useRef(match.board.filter((piece) => piece.owner === 'player').length)
  const startedActedIds = useRef(new Set(match.board.filter((piece) => piece.owner === 'player' && (piece.movedThisTurn || piece.attackedThisTurn)).map((piece) => piece.instanceId)))
  const startedTurn = useRef(match.turn)

  // Termina el coach de inmediato si la partida acaba mientras se enseña.
  useEffect(() => {
    if (match.winner) onFinish()
  }, [match.winner, onFinish])

  useEffect(() => {
    if (!step) return
    // Si el turno avanza en cualquier paso, el jugador ya completó el ciclo
    // básico por su cuenta: seguir señalando un turno que ya no existe
    // confundiría más de lo que ayuda.
    if (match.turn !== startedTurn.current) {
      onFinish()
      return
    }
    if (step.id === 'source' && player.resourcePlayedThisTurn && !startedResourcePlayed.current) {
      setIndex((current) => current + 1)
    } else if (step.id === 'unit') {
      const ownedNow = match.board.filter((piece) => piece.owner === 'player').length
      if (ownedNow > startedBoardCount.current) setIndex((current) => current + 1)
    } else if (step.id === 'act') {
      const acted = match.board.some(
        (piece) => piece.owner === 'player' && (piece.movedThisTurn || piece.attackedThisTurn) && !startedActedIds.current.has(piece.instanceId),
      )
      if (acted) setIndex((current) => current + 1)
    }
  }, [match, player.resourcePlayedThisTurn, step, onFinish])

  // La carta candidata de cada paso: primera fuente en mano, o primera unidad no-fuente en mano.
  const targetCardId = useMemo(() => {
    if (step?.id === 'source') {
      return player.hand.find((instance) => CARD_BY_ID[instance.cardId]?.type === 'mana')?.cardId
    }
    if (step?.id === 'unit') {
      return player.hand.find((instance) => CARD_BY_ID[instance.cardId]?.type === 'unit')?.cardId
    }
    return undefined
  }, [step?.id, player.hand])

  const targetsHand = step?.id === 'source' || step?.id === 'unit'
  const rect = useTrackedRect(
    () => {
      if (targetsHand && targetCardId) {
        return handBarRef.current?.querySelector<HTMLElement>(`[data-card-id="${targetCardId}"]`) ?? undefined
      }
      if (step?.id === 'endTurn') return endTurnRef.current ?? undefined
      return undefined
    },
    Boolean(step && (targetsHand || step.id === 'endTurn')),
  )

  if (!step) return null

  const calloutStyle = rect
    ? { top: rect.top, left: rect.left + rect.width / 2 }
    : undefined

  return (
    <div className={styles.layer} aria-live="polite">
      {rect && <div className={styles.ring} style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }} />}
      <div className={rect ? styles.calloutAnchored : styles.calloutFloating} style={calloutStyle}>
        <span className={styles.stepDot}>{index + 1}/{STEPS.length}</span>
        <h4>{step.title}</h4>
        <p>{step.body}</p>
        <button type="button" className={styles.skip} onClick={onFinish}>Saltar guía</button>
      </div>
    </div>
  )
}
