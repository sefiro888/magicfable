import { useEffect, useRef } from 'react'
import { CARD_GLOSSARY } from '../../components/GlossaryText'
import styles from './GlossaryPanel.module.css'

interface GlossaryPanelProps {
  readonly onClose: () => void
}

/**
 * Glosario completo, siempre a mano: los tooltips de GlossaryText solo
 * aparecen si el término figura en el texto de la carta seleccionada en ese
 * momento. Este panel lista los mismos términos sin depender de qué carta
 * tengas a la vista.
 */
export function GlossaryPanel({ onClose }: GlossaryPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const sorted = [...CARD_GLOSSARY].sort((a, b) => a.label.localeCompare(b.label, 'es'))

  return (
    <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="glossary-title">
        <header className={styles.head}>
          <small>Consulta rápida</small>
          <h2 id="glossary-title">Glosario de términos</h2>
          <button ref={closeRef} className={styles.close} type="button" onClick={onClose} aria-label="Cerrar glosario">×</button>
        </header>
        <dl className={styles.list}>
          {sorted.map((entry) => (
            <div key={entry.id} className={styles.entry}>
              <dt>{entry.label}</dt>
              <dd>{entry.definition}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
