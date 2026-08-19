import type { HealthSnapshot } from '../../store/match'
import styles from '../BattlePage.module.css'

interface HealthChartProps {
  readonly history: readonly HealthSnapshot[]
  /** Cuál de las dos líneas es "tú": la otra se dibuja como rival. */
  readonly me: 'player' | 'ai'
}

const WIDTH = 260
const HEIGHT = 72
const PADDING = 4

/**
 * Gráfica de la Vida de ambos Nexos turno a turno. SVG a mano, sin librería:
 * son dos polilíneas sobre un puñado de puntos, no hace falta más.
 */
export function HealthChart({ history, me }: HealthChartProps) {
  if (history.length < 2) return null
  const rival = me === 'player' ? 'ai' : 'player'
  const maxHealth = Math.max(1, ...history.map((point) => Math.max(point.player, point.ai)))
  const usableWidth = WIDTH - PADDING * 2
  const usableHeight = HEIGHT - PADDING * 2
  const x = (index: number) => PADDING + (index / (history.length - 1)) * usableWidth
  const y = (health: number) => PADDING + usableHeight - (Math.max(0, health) / maxHealth) * usableHeight
  const path = (key: 'player' | 'ai') => history.map((point, index) => `${x(index)},${y(point[key])}`).join(' ')

  return (
    <div className={styles.healthChart}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT} role="img" aria-label="Vida de ambos Nexos a lo largo de la partida">
        <polyline points={path(rival)} className={styles.healthChartRival} />
        <polyline points={path(me)} className={styles.healthChartMine} />
      </svg>
      <div className={styles.healthChartLegend}>
        <span className={styles.healthChartMine}>■ Tu Nexo</span>
        <span className={styles.healthChartRival}>■ Nexo rival</span>
      </div>
    </div>
  )
}
