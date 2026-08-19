import { CARD_BY_ID, type MatchState, type PlayerId, type PlayerStats } from '../../game'
import type { Achievement } from '../../store/achievements'
import type { DailyChallenge } from '../../store/dailyChallenge'
import type { BestPlay, HealthSnapshot } from '../../store/match'
import type { RecordSummary } from '../../store/records'
import { HealthChart } from './HealthChart'
import styles from '../BattlePage.module.css'

interface MatchResultDialogProps {
  match: MatchState
  me: PlayerId
  stats: PlayerStats
  elapsedSeconds: number
  tally: RecordSummary
  daily: DailyChallenge
  achievements: readonly Achievement[]
  healthHistory: readonly HealthSnapshot[]
  bestPlay?: BestPlay
  isPvp: boolean
  /** En PvP: si este lado ya pidió la revancha y si la pidió el rival. */
  rematchSelf: boolean
  rematchPeer: boolean
  onRematch: () => void
  onRepeat: () => void
  onHome: () => void
  onDownloadLog: () => void
}

/** Pantalla final: resultado, estadísticas de la partida y qué hacer después. */
export function MatchResultDialog(props: MatchResultDialogProps) {
  const won = props.match.winner === props.me
  return (
    <div className={styles.resultBackdrop}>
      <section className={styles.result}>
        <small>La crónica ha concluido</small>
        <h2>{won ? 'Victoria' : 'Derrota'}</h2>
        <p>{won ? 'El Nexo rival se quiebra bajo tu voluntad.' : 'Tu Nexo se desvanece. La siguiente crónica aún puede cambiar.'}</p>
        <div className={styles.resultStats}>
          <div><strong>{props.match.turn}</strong><span>Turnos</span></div>
          <div><strong>{props.elapsedSeconds}s</strong><span>Duración</span></div>
          <div><strong>{props.stats.damageDealt}</strong><span>Daño</span></div>
          <div><strong>{props.stats.cardsPlayed}</strong><span>Jugadas</span></div>
        </div>
        <HealthChart history={props.healthHistory} me={props.me} />
        {props.bestPlay && (
          <p className={styles.bestPlay}>
            🏆 Mejor jugada: <strong>{CARD_BY_ID[props.bestPlay.cardId ?? '']?.name ?? 'Una unidad'}</strong>{' '}
            {props.bestPlay.by === props.me ? 'tuya' : 'del rival'} hizo <strong>{props.bestPlay.amount}</strong> de daño en el turno {props.bestPlay.turn}.
          </p>
        )}
        {props.tally.played > 1 && (
          <p className={styles.resultTally}>
            Llevas <strong>{props.tally.won}</strong> {props.tally.won === 1 ? 'victoria' : 'victorias'} de{' '}
            <strong>{props.tally.played}</strong> escaramuzas · {props.tally.winRate}%
          </p>
        )}
        {won && props.daily.done && (
          <p className={styles.dailyResultNote}>✓ Reto de hoy completado: {props.daily.title}</p>
        )}
        {props.achievements.length > 0 && (
          <div className={styles.resultAchievements}>
            <small>Logro{props.achievements.length > 1 ? 's' : ''} desbloqueado{props.achievements.length > 1 ? 's' : ''}</small>
            {props.achievements.map((achievement) => (
              <p key={achievement.id}>
                <span aria-hidden="true">{achievement.icon}</span> {achievement.name}
              </p>
            ))}
          </div>
        )}
        {/* En PvP la revancha exige que los dos lados la pidan: uno solo
            repitiendo no basta, sería jugar contra un rival que no lo sabe. */}
        {props.isPvp && props.rematchSelf && !props.rematchPeer && (
          <p className={styles.rematchWaiting}>Esperando a que tu rival acepte la revancha…</p>
        )}
        <div className={styles.resultActions}>
          {props.isPvp
            ? <button onClick={props.onRematch} disabled={props.rematchSelf}>{props.rematchPeer ? 'Aceptar revancha' : 'Jugar otra vez'}</button>
            : <button onClick={props.onRepeat}>Repetir</button>}
          {/* Sin el reset, la partida terminada quedaba persistida: si luego se
              elegía la misma facción, se reanudaba esta misma (mismo rival, ya
              con ganador) en vez de empezar una nueva. */}
          <button onClick={props.onHome}>Volver al inicio</button>
        </div>
        <button
          className={styles.downloadLog}
          onClick={props.onDownloadLog}
          title="Descarga un archivo con el registro de esta partida, útil para reportar un problema"
        >
          ⬇ Descargar registro de la partida
        </button>
      </section>
    </div>
  )
}
