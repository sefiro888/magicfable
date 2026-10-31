import { useEffect, type CSSProperties } from 'react'
import { Card } from '../../components'
import { CARD_BY_ID, FACTION_BY_ID, type PlayerId } from '../../game'
import { spotlightHeading, type Spotlight } from '../../battle/presentation'
import styles from './CastSpotlight.module.css'

interface CastSpotlightProps {
  readonly spotlight: Spotlight
  readonly me: PlayerId
  readonly reducedMotion: boolean
  readonly onDismiss: () => void
}

/** Chispas fijas por índice: aleatorias cambiarían en cada render y temblarían. */
const SPARKS = Array.from({ length: 16 }, (_, index) => ({
  x: ((index * 37) % 100) - 50,
  delay: (index * 0.23) % 2.4,
  size: 3 + (index % 4),
}))

/**
 * La carta lanzada, en grande y en el centro, antes de que su efecto llegue
 * al tablero. Existe porque el rival jugaba hechizos que solo se notaban por
 * sus consecuencias: una unidad propia moría y no había forma de saber qué la
 * había matado ni de leer la carta.
 *
 * El resultado no se cuenta aquí: se anuncia cuando el efecto ya se ha visto
 * en el tablero, para no adelantar el final mientras la carta aún se lee.
 */
export function CastSpotlight({ spotlight, me, reducedMotion, onDismiss }: CastSpotlightProps) {
  const mine = spotlight.caster === me
  const accent = FACTION_BY_ID[spotlight.card.faction].accentColor
  const targetCard = spotlight.target?.cardId ? CARD_BY_ID[spotlight.target.cardId] : undefined

  // Se puede cerrar con el teclado sin buscar el ratón; se captura antes que
  // los atajos de la partida para que Espacio no dispare otra acción debajo.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter' && event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      onDismiss()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onDismiss])

  const heading = spotlightHeading(spotlight, me)
  const announcement = `${heading}: ${spotlight.card.name}${spotlight.target ? `, sobre ${spotlight.target.label}` : ''}.`

  return (
    <div
      className={styles.overlay}
      data-side={mine ? 'own' : 'rival'}
      data-kind={spotlight.kind}
      data-rarity={spotlight.card.rarity}
      data-reduced-motion={reducedMotion || undefined}
      style={{ '--accent': accent, '--spotlight-ms': `${spotlight.durationMs}ms` } as CSSProperties}
      onClick={onDismiss}
      data-testid="cast-spotlight"
    >
      <p className={styles.srOnly} role="status" aria-live="assertive">{announcement}</p>
      {spotlight.kind === 'power' && <><span className={styles.barTop} aria-hidden="true" /><span className={styles.barBottom} aria-hidden="true" /></>}
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.kicker}>
          <span className={styles.rule} />
          <span>{heading}</span>
          <span className={styles.rule} />
        </div>
        {spotlight.commanderName && <p className={styles.commander}>{spotlight.commanderName}</p>}
        <div className={styles.body}>
          <div className={styles.cardSlot}>
            <span className={styles.halo} />
            <span className={styles.rays} />
            {!reducedMotion && (spotlight.card.rarity === 'mythic' || spotlight.kind === 'power') && (
              <span className={styles.sparks}>
                {SPARKS.map((spark, index) => (
                  <i key={index} style={{ '--x': `${spark.x}%`, '--d': `${spark.delay}s`, '--s': `${spark.size}px` } as CSSProperties} />
                ))}
              </span>
            )}
            <Card card={spotlight.card} size="inspect" reducedMotion />
            <span className={styles.sheen} />
          </div>
          {spotlight.target && (
            <div className={styles.targetColumn}>
              <span className={styles.beam} />
              <div className={styles.target}>
                <span className={styles.targetLabel}>Objetivo</span>
                {targetCard
                  ? <Card card={targetCard} size="thumbnail" reducedMotion className={styles.targetCard} />
                  : <span className={styles.targetNexus}>◆</span>}
                <strong>{spotlight.target.label}</strong>
              </div>
            </div>
          )}
        </div>
        <div className={styles.footer}>
          <span className={styles.progress}><span /></span>
          <span className={styles.hint}>Clic o Espacio para continuar</span>
        </div>
      </div>
    </div>
  )
}
