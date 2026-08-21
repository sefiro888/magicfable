import { describe, expect, it } from 'vitest'
import { CARDS, STARTER_DECKS, createMatch, BOARD_SIZE, type MatchState } from '../../game'
import type { MatchRecord } from '../../store/records'
import { gameFacts, resumableMatch, summarizeForHome } from './homeSummary'

const partida = (): MatchState => createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 99)

const registro = (won: boolean, deckName = 'Furia de la Caldera'): Omit<MatchRecord, 'id'> & { id: string } => ({
  id: `${Math.random()}`,
  finishedAt: Date.now(),
  deckId: 'furia-caldera',
  deckName,
  commanderName: 'Kaela',
  opponentDeckName: 'Secretos del Arcano',
  won,
  turns: 12,
  seconds: 300,
  damageDealt: 20,
  seed: 1,
  mode: 'ai',
})

describe('partida retomable desde la portada', () => {
  it('no ofrece continuar si no hay partida', () => {
    expect(resumableMatch(undefined)).toBeUndefined()
  })

  it('no ofrece continuar una partida recién empezada y vacía', () => {
    expect(resumableMatch(partida())).toBeUndefined()
  })

  it('no ofrece continuar una partida ya ganada', () => {
    const terminada: MatchState = { ...partida(), turn: 9, winner: 'player' }
    expect(resumableMatch(terminada)).toBeUndefined()
  })

  it('resume la partida en curso con lo justo para decidir si entrar', () => {
    const base = partida()
    const enCurso: MatchState = { ...base, turn: 7, activePlayer: 'player' }
    const resumen = resumableMatch(enCurso)
    expect(resumen?.turn).toBe(7)
    expect(resumen?.myTurn).toBe(true)
    expect(resumen?.myNexus).toBe(base.players.player.nexusHealth)
    expect(resumen?.rivalCommanderName).toBeTruthy()
    expect(resumen?.rivalCommanderName).not.toBe(resumen?.commanderName)
  })

  it('para el invitado de una partida en línea, «lo mío» es el otro asiento', () => {
    const base = partida()
    const enCurso: MatchState = { ...base, turn: 5, activePlayer: 'ai' }
    expect(resumableMatch(enCurso, 'ai')?.myTurn).toBe(true)
  })
})

describe('resumen del jugador', () => {
  it('sin historial no hay nada que enseñar', () => {
    const resumen = summarizeForHome([])
    expect(resumen.hasHistory).toBe(false)
    expect(resumen.played).toBe(0)
  })

  it('cuenta partidas, victorias, acierto y racha', () => {
    const records = [registro(true), registro(true), registro(false)] as MatchRecord[]
    const resumen = summarizeForHome(records)
    expect(resumen.played).toBe(3)
    expect(resumen.won).toBe(2)
    expect(resumen.winRate).toBe(67)
    expect(resumen.hasHistory).toBe(true)
    expect(resumen.lastDeckName).toBe('Furia de la Caldera')
  })
})

describe('cifras del juego', () => {
  it('salen de los datos reales, no de texto escrito a mano', () => {
    const facts = gameFacts()
    expect(facts.cards).toBe(CARDS.length)
    expect(facts.decks).toBe(STARTER_DECKS.length)
    expect(facts.board).toBe(`${BOARD_SIZE} × ${BOARD_SIZE}`)
    // Un mazo inicial son 50 cartas y el Nexo empieza con la vida del comandante.
    expect(facts.cardsPerDeck).toBe(50)
    expect(facts.nexusHealth).toBeGreaterThan(0)
  })
})
