import { CARDS, COMMANDER_BY_ID, STARTER_DECKS, BOARD_SIZE, type MatchState, type PlayerId } from '../../game'
import { currentStreak, summarizeRecords, type MatchRecord } from '../../store/records'

/** Partida a medias que se puede retomar desde la portada. */
export interface ResumableMatch {
  readonly turn: number
  /** Vida de los dos Nexos, para enseñar cómo va la cosa sin entrar. */
  readonly myNexus: number
  readonly rivalNexus: number
  readonly commanderName: string
  readonly rivalCommanderName: string
  /** A quién le toca mover. */
  readonly myTurn: boolean
}

/**
 * ¿Hay una partida guardada que merezca la pena retomar?
 *
 * La persistencia de partida existe desde hace tiempo (recargar la página no
 * te echa del tablero), pero desde la portada no había ni rastro de ella: si
 * cerrabas el navegador a media escaramuza, al volver la única pista era
 * entrar a «Jugar» y descubrir que seguía ahí. Aquí se resume para poder
 * ofrecer «Continuar» en cuanto abres el juego.
 */
export const resumableMatch = (
  match: MatchState | undefined,
  me: PlayerId = 'player',
): ResumableMatch | undefined => {
  if (!match || match.winner) return undefined
  // Una partida en el turno 1 sin nada desplegado no es «una partida a medias»:
  // ofrecerla como algo que continuar solo sería ruido.
  if (match.turn <= 1 && match.board.length === 0) return undefined
  const rival: PlayerId = me === 'player' ? 'ai' : 'player'
  return {
    turn: match.turn,
    myNexus: match.players[me].nexusHealth,
    rivalNexus: match.players[rival].nexusHealth,
    commanderName: COMMANDER_BY_ID[match.players[me].commanderId]?.name ?? 'Tu comandante',
    rivalCommanderName: COMMANDER_BY_ID[match.players[rival].commanderId]?.name ?? 'El rival',
    myTurn: match.activePlayer === me,
  }
}

/** Lo que la portada cuenta de ti: solo tiene sentido cuando ya has jugado. */
export interface PlayerSummary {
  readonly played: number
  readonly won: number
  readonly winRate: number
  /** Racha actual: positiva si son victorias, negativa si son derrotas. */
  readonly streak: number
  readonly lastDeckName?: string
  readonly hasHistory: boolean
}

export const summarizeForHome = (records: readonly MatchRecord[]): PlayerSummary => {
  const summary = summarizeRecords(records)
  return {
    played: summary.played,
    won: summary.won,
    winRate: summary.winRate,
    streak: currentStreak(records),
    lastDeckName: records[0]?.deckName,
    hasHistory: summary.played > 0,
  }
}

/**
 * Las cifras del juego, calculadas a partir de los datos reales en vez de
 * escritas a mano.
 *
 * La portada anunciaba «90 cartas» y «35 de Vida» como texto fijo. Ya pasó una
 * vez que un número de esos se quedó viejo tras un cambio de equilibrio (el
 * «NEXO 25» del pie de página) y nadie se dio cuenta en semanas: derivándolos,
 * el problema no puede repetirse.
 */
export const gameFacts = () => {
  const decks = STARTER_DECKS.length
  const cardsPerDeck = STARTER_DECKS[0]?.cards.reduce((total, entry) => total + entry.count, 0) ?? 0
  const nexusHealth = COMMANDER_BY_ID[STARTER_DECKS[0]?.commanderId ?? '']?.nexusHealth ?? 0
  return {
    board: `${BOARD_SIZE} × ${BOARD_SIZE}`,
    cards: CARDS.length,
    decks,
    cardsPerDeck,
    nexusHealth,
  }
}
