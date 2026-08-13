import { CARD_BY_ID, type CardInstance } from '../../game'
import { Card } from '../../components'
import styles from '../BattlePage.module.css'

interface ScryDialogProps {
  /** Instancias de la parte superior del mazo, en el orden elegido hasta ahora. */
  order: readonly string[]
  deck: readonly CardInstance[]
  onMove: (instanceId: string, direction: -1 | 1) => void
  onConfirm: () => void
}

/** Escrutinio: reordena las cartas de arriba del mazo antes de robarlas. */
export function ScryDialog({ order, deck, onMove, onConfirm }: ScryDialogProps) {
  return (
    <div className={styles.resultBackdrop}>
      <section className={styles.scry} role="dialog" aria-modal="true" aria-label="Observar el mazo">
        <small>Escrutinio</small>
        <h2>Ordena la parte superior de tu mazo</h2>
        <p>La primera carta de la lista será la próxima que robes.</p>
        <div className={styles.scryCards}>
          {order.map((instanceId, index) => {
            const instance = deck.find((card) => card.instanceId === instanceId)
            const card = instance ? CARD_BY_ID[instance.cardId] : undefined
            if (!card) return null
            return (
              <div key={instanceId} className={styles.scryCard}>
                <span className={styles.scryPosition}>{index + 1}ª</span>
                <Card card={card} size="thumbnail" />
                <div className={styles.scryControls}>
                  <button onClick={() => onMove(instanceId, -1)} disabled={index === 0} aria-label="Subir">↑</button>
                  <button onClick={() => onMove(instanceId, 1)} disabled={index === order.length - 1} aria-label="Bajar">↓</button>
                </div>
              </div>
            )
          })}
        </div>
        <button className={styles.confirmMulligan} onClick={onConfirm}>Confirmar orden</button>
      </section>
    </div>
  )
}
