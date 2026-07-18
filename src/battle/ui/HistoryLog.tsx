import { memo, useState } from 'react'
import styles from './HistoryLog.module.css'

interface HistoryLogProps {
  readonly entries: readonly string[]
}

/**
 * Crónica de batalla plegable: cerrada muestra solo la última línea para
 * ceder el espacio del panel al contexto de juego.
 */
export const HistoryLog = memo(function HistoryLog({ entries }: HistoryLogProps) {
  const [open, setOpen] = useState(false)
  const latest = entries[entries.length - 1]
  return (
    <section className={styles.log} data-open={open}>
      <button className={styles.toggle} onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span>Crónica de batalla</span>
        <span className={styles.chevron} aria-hidden="true">{open ? '▾' : '▸'}</span>
      </button>
      {open ? (
        <ul className={styles.list}>
          {entries.slice().reverse().map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}
        </ul>
      ) : (
        latest && <p className={styles.latest}>{latest}</p>
      )}
    </section>
  )
})
