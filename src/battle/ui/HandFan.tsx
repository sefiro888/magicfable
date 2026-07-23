import { memo } from 'react'
import type { CSSProperties } from 'react'
import { Card } from '../../components'
import { CARD_BY_ID, effectiveCost, planManaPayment, type MatchState, type PlayerId } from '../../game'
import styles from './HandFan.module.css'

interface HandFanProps {
  readonly match: MatchState
  /** Bando de la partida que controla este navegador: 'player' en solitario y para el anfitrión, 'ai' para el invitado. */
  readonly localPlayerId: PlayerId
  readonly selectedHandId?: string
  readonly onSelect: (instanceId: string) => void
  readonly onInspect: (cardId: string) => void
}

/**
 * Mano en abanico del jugador. Memoizada: solo se vuelve a renderizar cuando
 * cambia la partida o la selección, no en cada evento visual de la cola.
 */
export const HandFan = memo(function HandFan({ match, localPlayerId, selectedHandId, onSelect, onInspect }: HandFanProps) {
  const player = match.players[localPlayerId]
  const count = player.hand.length
  // El solape y la rotación se comprimen con la mano llena para que el abanico
  // no invada el tablero ni se salga del carril inferior.
  const overlap = count <= 4 ? 20 : count <= 6 ? 32 : count <= 8 ? 42 : 50
  const maxRotation = Math.min(3.4, 20 / Math.max(1, count))
  const liftStep = Math.min(3.6, 20 / Math.max(1, count))
  return (
    <div className={styles.hand} aria-label="Tu mano">
      {player.hand.map((instance, index) => {
        const card = CARD_BY_ID[instance.cardId]
        if (!card) return null
        const playable = match.activePlayer === localPlayerId && !match.winner && (
          card.type === 'mana'
            ? !player.resourcePlayedThisTurn
            : planManaPayment(player.resources, effectiveCost(match, localPlayerId, card)).payable
        )
        const selected = selectedHandId === instance.instanceId
        const offset = index - (count - 1) / 2
        const style = {
          '--fan-rotation': `${offset * maxRotation}deg`,
          '--fan-lift': `${offset * offset * liftStep}px`,
          '--fan-overlap': `${-overlap}px`,
          zIndex: selected ? 40 : 10 + index,
        } as CSSProperties
        return (
          <div key={instance.instanceId} className={styles.fanCard} style={style} data-selected={selected}>
            <Card
              card={card}
              size="hand"
              selected={selected}
              playable={playable}
              onSelect={() => onSelect(instance.instanceId)}
              onInspect={() => onInspect(card.id)}
            />
          </div>
        )
      })}
    </div>
  )
})
