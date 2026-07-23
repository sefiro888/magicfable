import { createRef } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMatch, STARTER_DECKS } from '../../game'
import type { BoardPiece, MatchState, Position } from '../../game'
import { GuidedTutorial } from './GuidedTutorial'

afterEach(cleanup)

const baseMatch = (): MatchState => createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)

const makeRefs = () => ({
  handBarRef: createRef<HTMLElement>(),
  endTurnRef: createRef<HTMLButtonElement>(),
})

const makePiece = (owner: 'player' | 'ai', position: Position, overrides: Partial<BoardPiece> = {}): BoardPiece => ({
  instanceId: `${owner}-piece-1`,
  cardId: 'sabueso-brasa',
  owner,
  position,
  currentHealth: 1,
  attackModifier: 0,
  movedThisTurn: false,
  attackedThisTurn: false,
  enteredOnTurn: 1,
  statuses: [],
  ...overrides,
})

describe('GuidedTutorial', () => {
  it('empieza pidiendo jugar una fuente', () => {
    const { handBarRef, endTurnRef } = makeRefs()
    render(<GuidedTutorial match={baseMatch()} handBarRef={handBarRef} endTurnRef={endTurnRef} onFinish={vi.fn()} />)
    expect(screen.getByText('Juega una fuente')).toBeInTheDocument()
  })

  it('avanza a desplegar una unidad en cuanto se juega la fuente', () => {
    const { handBarRef, endTurnRef } = makeRefs()
    const match = baseMatch()
    const { rerender } = render(<GuidedTutorial match={match} handBarRef={handBarRef} endTurnRef={endTurnRef} onFinish={vi.fn()} />)
    const withResource: MatchState = {
      ...match,
      players: { ...match.players, player: { ...match.players.player, resourcePlayedThisTurn: true } },
    }
    rerender(<GuidedTutorial match={withResource} handBarRef={handBarRef} endTurnRef={endTurnRef} onFinish={vi.fn()} />)
    expect(screen.getByText('Despliega una unidad')).toBeInTheDocument()
  })

  it('avanza a mover/atacar en cuanto aparece una unidad propia en el tablero', () => {
    const { handBarRef, endTurnRef } = makeRefs()
    const match = baseMatch()
    const { rerender } = render(<GuidedTutorial match={match} handBarRef={handBarRef} endTurnRef={endTurnRef} onFinish={vi.fn()} />)
    // Primero hay que completar el paso «fuente» tal cual lo exige el coach:
    // sin esta transición, uno posterior (aparición de la unidad) no cuenta.
    const withResource: MatchState = {
      ...match,
      players: { ...match.players, player: { ...match.players.player, resourcePlayedThisTurn: true } },
    }
    rerender(<GuidedTutorial match={withResource} handBarRef={handBarRef} endTurnRef={endTurnRef} onFinish={vi.fn()} />)
    const withUnit: MatchState = { ...withResource, board: [makePiece('player', { x: 0, y: 7 })] }
    rerender(<GuidedTutorial match={withUnit} handBarRef={handBarRef} endTurnRef={endTurnRef} onFinish={vi.fn()} />)
    expect(screen.getByText('Muévela o atácala')).toBeInTheDocument()
  })

  it('avanza a terminar turno en cuanto la unidad se mueve o ataca', () => {
    const { handBarRef, endTurnRef } = makeRefs()
    const match = baseMatch()
    const { rerender } = render(<GuidedTutorial match={match} handBarRef={handBarRef} endTurnRef={endTurnRef} onFinish={vi.fn()} />)
    const withResource: MatchState = {
      ...match,
      players: { ...match.players, player: { ...match.players.player, resourcePlayedThisTurn: true } },
    }
    rerender(<GuidedTutorial match={withResource} handBarRef={handBarRef} endTurnRef={endTurnRef} onFinish={vi.fn()} />)
    const withUnit: MatchState = { ...withResource, board: [makePiece('player', { x: 0, y: 7 })] }
    rerender(<GuidedTutorial match={withUnit} handBarRef={handBarRef} endTurnRef={endTurnRef} onFinish={vi.fn()} />)
    const afterAction: MatchState = { ...withUnit, board: [makePiece('player', { x: 1, y: 7 }, { movedThisTurn: true })] }
    rerender(<GuidedTutorial match={afterAction} handBarRef={handBarRef} endTurnRef={endTurnRef} onFinish={vi.fn()} />)
    expect(screen.getByText('Termina tu turno')).toBeInTheDocument()
  })

  it('termina el coach en cuanto el turno avanza, sea cual sea el paso', () => {
    const { handBarRef, endTurnRef } = makeRefs()
    const match = baseMatch()
    const onFinish = vi.fn()
    const { rerender } = render(<GuidedTutorial match={match} handBarRef={handBarRef} endTurnRef={endTurnRef} onFinish={onFinish} />)
    rerender(<GuidedTutorial match={{ ...match, turn: match.turn + 1 }} handBarRef={handBarRef} endTurnRef={endTurnRef} onFinish={onFinish} />)
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('termina el coach si la partida se resuelve mientras se enseña', () => {
    const { handBarRef, endTurnRef } = makeRefs()
    const match = baseMatch()
    const onFinish = vi.fn()
    const { rerender } = render(<GuidedTutorial match={match} handBarRef={handBarRef} endTurnRef={endTurnRef} onFinish={onFinish} />)
    rerender(<GuidedTutorial match={{ ...match, winner: 'player', phase: 'finished' }} handBarRef={handBarRef} endTurnRef={endTurnRef} onFinish={onFinish} />)
    expect(onFinish).toHaveBeenCalledTimes(1)
  })
})
