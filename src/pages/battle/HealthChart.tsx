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

  // Sin una escala a la vista, dos líneas sueltas no dicen de cuánta Vida se
  // partía ni con cuánta se acabó: solo que una bajaba más deprisa que la
  // otra. Con el máximo arriba y el final de cada bando en la leyenda, la
  // misma gráfica ya cuenta la partida.
  const ultimo = history[history.length - 1]!

  return (
    <div className={styles.healthChart}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width={WIDTH}
        height={HEIGHT}
        role="img"
        aria-label={`Vida de ambos Nexos a lo largo de la partida: terminas con ${Math.max(0, Math.round(ultimo[me]))} y el rival con ${Math.max(0, Math.round(ultimo[rival]))}`}
      >
        {/* Suelo y techo de la escala, para que las líneas tengan contra qué leerse. */}
        <line x1={PADDING} y1={y(maxHealth)} x2={WIDTH - PADDING} y2={y(maxHealth)} className={styles.healthChartGrid} />
        <line x1={PADDING} y1={y(0)} x2={WIDTH - PADDING} y2={y(0)} className={styles.healthChartGrid} />
        {/* Las dos etiquetas van POR DENTRO de sus líneas: la de arriba se
            salía del viewBox y quedaba recortada. */}
        <text x={PADDING} y={y(maxHealth) + 8} className={styles.healthChartScale}>{Math.round(maxHealth)}</text>
        <text x={PADDING} y={y(0) - 3} className={styles.healthChartScale}>0</text>
        <polyline points={path(rival)} className={styles.healthChartRival} />
        <polyline points={path(me)} className={styles.healthChartMine} />
      </svg>
      <div className={styles.healthChartLegend}>
        <span className={styles.healthChartMine}>■ Tu Nexo · {Math.max(0, Math.round(ultimo[me]))}</span>
        <span className={styles.healthChartRival}>■ Nexo rival · {Math.max(0, Math.round(ultimo[rival]))}</span>
      </div>
    </div>
  )
}
