import { CARD_BY_ID, type CardInstance } from '../../game'
import { withBase } from '../../utils/assets'
import styles from '../BattlePage.module.css'

interface MulliganDialogProps {
  hand: readonly CardInstance[]
  /** Cartas marcadas para cambiar. */
  selectedIds: readonly string[]
  onToggle: (instanceId: string) => void
  onConfirm: () => void
}

/**
 * Mano de salida: deja cambiar cartas una sola vez antes de empezar.
 *
 * La pista de fuentes es el consejo más útil del juego para quien empieza:
 * casi todas las manos malas lo son por tener demasiadas o muy pocas.
 */
export function MulliganDialog({ hand, selectedIds, onToggle, onConfirm }: MulliganDialogProps) {
  const sources = hand.filter((instance) => CARD_BY_ID[instance.cardId]?.type === 'mana').length
  const balanced = sources >= 2 && sources <= 4

  return (
    <div className={styles.resultBackdrop}>
      <section className={styles.mulligan}>
        <small>Preparación de la crónica</small>
        <h2>Tu mano inicial</h2>
        <p>
          El <strong>mulligan</strong> te deja cambiar cartas de tu mano de salida una sola vez:
          marca las que no te convenzan y roba otras tantas nuevas.
        </p>
        <p className={styles.mulliganHint} data-ok={balanced}>
          Tienes <strong>{sources}</strong> {sources === 1 ? 'fuente' : 'fuentes'} de Esencia en la mano.
          {balanced
            ? ' Es un buen arranque para desplegar cartas pronto.'
            : sources < 2
              ? ' Con menos de dos te costará pagar tus cartas: valora cambiar alguna.'
              : ' Demasiadas fuentes y pocas jugadas: valora cambiar alguna.'}
        </p>
        <div className={styles.mulliganCards}>
          {hand.map((instance) => {
            const card = CARD_BY_ID[instance.cardId]
            if (!card) return null
            const selected = selectedIds.includes(instance.instanceId)
            return (
              <button
                key={instance.instanceId}
                className={styles.mulliganCard}
                data-selected={selected}
                aria-pressed={selected}
                onClick={() => onToggle(instance.instanceId)}
              >
                <img src={withBase(card.art.webp)} alt="" />
                <strong>{card.name}</strong>
                <span>{selected ? 'Cambiar' : 'Conservar'}</span>
              </button>
            )
          })}
        </div>
        <button className={styles.confirmMulligan} onClick={onConfirm}>
          {selectedIds.length > 0 ? `Cambiar ${selectedIds.length} cartas` : 'Conservar las cinco'}
        </button>
      </section>
    </div>
  )
}
