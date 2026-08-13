import { COMMANDER_BY_ID, STARTER_DECKS, type MatchState, type PlayerId } from '../game'
import type { PreferencesState } from '../store/preferences'

export interface MatchLogExportOptions {
  match: MatchState
  me: PlayerId
  rival: PlayerId
  preferences: PreferencesState
  isPvp: boolean
  /** Id del reto diario si se completó en esta partida. */
  dailyChallengeId?: string
  elapsedSeconds: number
  /** Registro de acciones y errores acumulado por el store durante la partida. */
  log: unknown
}

/**
 * Arma el registro exportable de una partida terminada.
 *
 * Deliberadamente compacto (IDs y códigos cortos en vez de texto repetido, sin
 * snapshots del tablero turno a turno): con la semilla más el registro de
 * acciones se puede reconstruir casi cualquier situación sin inflar el
 * archivo, que está pensado para que el jugador lo adjunte como feedback.
 */
export const buildMatchLogExport = (options: MatchLogExportOptions) => {
  const { match, me, rival, preferences, isPvp } = options
  const player = match.players[me]
  const opponent = match.players[rival]
  const playerDeck = STARTER_DECKS.find((deck) => deck.commanderId === player.commanderId)
  const rivalDeck = STARTER_DECKS.find((deck) => deck.commanderId === opponent.commanderId)
  return {
    meta: {
      generatedAt: new Date().toISOString(),
      device: {
        userAgent: navigator.userAgent,
        screen: `${window.screen.width}x${window.screen.height}`,
        pixelRatio: window.devicePixelRatio,
      },
      settings: {
        graphicsQuality: preferences.graphicsQuality,
        scenario: preferences.scenario,
        reducedMotion: preferences.reducedMotion,
      },
    },
    setup: {
      seed: match.seed,
      mode: isPvp ? 'pvp' : 'ai',
      player: {
        faction: COMMANDER_BY_ID[player.commanderId]?.faction,
        commander: player.commanderId,
        deck: playerDeck?.id,
      },
      rival: {
        faction: COMMANDER_BY_ID[opponent.commanderId]?.faction,
        commander: opponent.commanderId,
        deck: rivalDeck?.id,
      },
      dailyChallenge: options.dailyChallengeId,
    },
    result: {
      winner: match.winner,
      turns: match.turn,
      durationSeconds: options.elapsedSeconds,
      playerNexusHealth: player.nexusHealth,
      rivalNexusHealth: opponent.nexusHealth,
      playerStats: player.stats,
    },
    log: options.log,
  }
}

/** Genera y descarga el registro de la partida como archivo JSON. */
export const downloadMatchLog = (options: MatchLogExportOptions): void => {
  const blob = new Blob([JSON.stringify(buildMatchLogExport(options))], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cronicas-partida-${new Date().toISOString().slice(0, 10)}-${options.match.seed}.json`
  link.click()
  URL.revokeObjectURL(url)
}
