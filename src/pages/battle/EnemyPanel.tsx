import { COMMANDER_BY_ID, summarizeMana, type PlayerState } from '../../game'
import { withBase } from '../../utils/assets'
import { ESSENCE_LABELS } from './labels'
import styles from '../BattlePage.module.css'

interface EnemyPanelProps {
  rival: PlayerState
  onClose: () => void
}

/** Panel desplegable con los datos del rival: vida, esencia, mazo y descarte. */
export function EnemyPanel({ rival, onClose }: EnemyPanelProps) {
  const commander = COMMANDER_BY_ID[rival.commanderId]
  const mana = summarizeMana(rival.resources)
  return (
    <aside className={styles.enemyPanel} role="dialog" aria-label="Datos del rival">
      <button className={styles.enemyPanelClose} onClick={onClose} aria-label="Cerrar">×</button>
      <div className={styles.commander}>
        <img className={styles.portrait} src={commander ? withBase(commander.art.webp) : undefined} alt="" />
        <div><strong>{commander?.name}</strong><small>{commander?.title}</small></div>
      </div>
      <div className={styles.lifeRow}>
        <span>Vida del Nexo</span>
        <span key={rival.nexusHealth} className={styles.life}>♥ {rival.nexusHealth}</span>
      </div>
      <div className={styles.deckCounters}>
        <div className={styles.counter}><strong key={rival.hand.length}>{rival.hand.length}</strong><span>Mano</span></div>
        <div className={styles.counter}><strong key={rival.deck.length}>{rival.deck.length}</strong><span>Mazo</span></div>
        <div className={styles.counter}><strong key={rival.discard.length}>{rival.discard.length}</strong><span>Descarte</span></div>
      </div>
      <p className={styles.essenceNote} title={ESSENCE_LABELS[commander?.faction ?? 'fury']}>
        Esencia: <strong>{mana.available} / {mana.total}</strong>{mana.exhausted > 0 ? ` · ${mana.exhausted} agotadas` : ''}
      </p>
    </aside>
  )
}
