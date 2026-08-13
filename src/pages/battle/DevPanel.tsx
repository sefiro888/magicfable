import type { FactionId, MatchState } from '../../game'
import styles from '../BattlePage.module.css'

interface DevPanelProps {
  match: MatchState
  /** Facción del comandante propio: decide qué fuente crea el botón «+1 Esencia». */
  faction: FactionId
  onApply: (mutate: (current: MatchState) => MatchState) => void
  onForceEndTurn: () => void
  onRestart: () => void
}

/**
 * Atajos de desarrollo (Ctrl+Shift+D). Solo se monta en `import.meta.env.DEV`
 * y fuera de multijugador: manipular el estado a mano rompería la sincronía.
 */
export function DevPanel({ match, faction, onApply, onForceEndTurn, onRestart }: DevPanelProps) {
  return (
    <section className={styles.devPanel} aria-label="Modo desarrollador">
      <strong>Modo desarrollador</strong>
      <button onClick={() => onApply((current) => ({
        ...current,
        players: {
          ...current.players,
          player: {
            ...current.players.player,
            resources: [
              ...current.players.player.resources,
              {
                instanceId: `dev-essence-${Date.now()}`,
                cardId: faction === 'arcane' ? 'fuente-arcana' : 'fuente-furia',
                faction,
                exhausted: false,
              },
            ],
          },
        },
      }))}>+1 Esencia</button>
      <button onClick={() => onApply((current) => {
        const top = current.players.player.deck[0]
        if (!top) return current
        return {
          ...current,
          players: {
            ...current.players,
            player: {
              ...current.players.player,
              deck: current.players.player.deck.slice(1),
              hand: [...current.players.player.hand, top],
            },
          },
        }
      })}>Robar carta</button>
      <button onClick={() => onApply((current) => {
        const health = Math.max(0, current.players.ai.nexusHealth - 5)
        return {
          ...current,
          players: { ...current.players, ai: { ...current.players.ai, nexusHealth: health } },
          ...(health === 0 ? { winner: 'player' as const, phase: 'finished' as const } : {}),
        }
      })}>-5 al Nexo rival</button>
      <button onClick={onForceEndTurn}>Forzar fin de turno</button>
      <button onClick={onRestart}>Reiniciar partida</button>
      <button onClick={() => console.info('MatchState', match)}>Volcar estado</button>
    </section>
  )
}
