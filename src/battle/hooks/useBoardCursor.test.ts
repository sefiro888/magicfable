import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { cellName, describeCell, useBoardCursor } from './useBoardCursor'
import type { BoardPiece, PlayerId } from '../../game'

const piece = (overrides: Partial<BoardPiece> & { instanceId: string }): BoardPiece => ({
  cardId: 'furia-guerrero-caldera',
  owner: 'player',
  position: { x: 3, y: 3 },
  currentHealth: 4,
  attackModifier: 0,
  movedThisTurn: false,
  attackedThisTurn: false,
  enteredOnTurn: 1,
  statuses: [],
  ...overrides,
})

const press = (key: string) => {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  })
}

const setup = (options: { me?: PlayerId; board?: readonly BoardPiece[]; enabled?: boolean } = {}) => {
  const onCell = vi.fn()
  const onPiece = vi.fn()
  const onNexus = vi.fn()
  const view = renderHook(() =>
    useBoardCursor({
      enabled: options.enabled ?? true,
      me: options.me ?? 'player',
      board: options.board ?? [],
      home: { x: 3, y: 7 },
      onCell,
      onPiece,
      onNexus,
    }),
  )
  return { ...view, onCell, onPiece, onNexus }
}

describe('nombres de casilla', () => {
  it('usa notación de ajedrez', () => {
    expect(cellName({ x: 0, y: 0 })).toBe('A1')
    expect(cellName({ x: 7, y: 7 })).toBe('H8')
    expect(cellName({ x: 3, y: 4 })).toBe('D5')
  })

  it('describe lo que hay en la casilla para el lector de pantalla', () => {
    const board = [piece({ instanceId: 'p1', position: { x: 2, y: 2 } })]
    expect(describeCell({ x: 0, y: 0 }, board, 'player')).toContain('casilla vacía')
    const said = describeCell({ x: 2, y: 2 }, board, 'player')
    expect(said).toContain('C3')
    expect(said).toContain('tuya')
    expect(said).toContain('4 de vida')
    expect(describeCell({ x: 2, y: 2 }, board, 'ai')).toContain('rival')
  })
})

describe('cursor de teclado', () => {
  it('empieza apagado y la primera flecha lo enciende en la casilla de inicio', () => {
    const view = setup()
    expect(view.result.current.cell).toBeUndefined()
    press('ArrowUp')
    expect(view.result.current.cell).toEqual({ x: 3, y: 7 })
  })

  it('subir aleja del propio Nexo: para el anfitrión, la fila 7 está abajo', () => {
    const view = setup()
    press('ArrowUp')
    press('ArrowUp')
    press('ArrowRight')
    expect(view.result.current.cell).toEqual({ x: 4, y: 6 })
    for (let i = 0; i < 12; i += 1) press('ArrowDown')
    expect(view.result.current.cell).toEqual({ x: 4, y: 7 })
    for (let i = 0; i < 12; i += 1) press('ArrowLeft')
    expect(view.result.current.cell).toEqual({ x: 0, y: 7 })
  })

  it('invierte los dos ejes para el invitado, que ve el tablero girado 180°', () => {
    const view = setup({ me: 'ai' })
    press('ArrowUp')
    expect(view.result.current.cell).toEqual({ x: 3, y: 7 })
    press('ArrowUp')
    // Su «arriba» también se aleja de su propio Nexo, en el sentido contrario.
    expect(view.result.current.cell).toEqual({ x: 3, y: 7 })
    press('ArrowDown')
    expect(view.result.current.cell).toEqual({ x: 3, y: 6 })
    press('ArrowRight')
    expect(view.result.current.cell).toEqual({ x: 2, y: 6 })
  })

  it('Enter actúa sobre la ficha de la casilla, o sobre la casilla si está vacía', () => {
    const board = [piece({ instanceId: 'p1', position: { x: 3, y: 6 } })]
    const view = setup({ board })
    press('ArrowUp')
    press('Enter')
    expect(view.onCell).toHaveBeenCalledWith({ x: 3, y: 7 })
    expect(view.onPiece).not.toHaveBeenCalled()
    press('ArrowUp')
    press('Enter')
    expect(view.onPiece).toHaveBeenCalledWith('p1')
  })

  it('la primera pulsación de Enter solo enciende el cursor, no juega a ciegas', () => {
    const view = setup()
    press('Enter')
    expect(view.result.current.cell).toEqual({ x: 3, y: 7 })
    expect(view.onCell).not.toHaveBeenCalled()
  })

  it('N ataca al Nexo rival, y solo con el cursor encendido', () => {
    const view = setup()
    press('n')
    expect(view.onNexus).not.toHaveBeenCalled()
    press('ArrowUp')
    press('n')
    expect(view.onNexus).toHaveBeenCalledWith('ai')
  })

  it('Escape apaga el cursor', () => {
    const view = setup()
    press('ArrowUp')
    press('Escape')
    expect(view.result.current.cell).toBeUndefined()
    expect(view.result.current.announcement).toBe('')
  })

  it('desactivado no responde a nada', () => {
    const view = setup({ enabled: false })
    press('ArrowUp')
    press('Enter')
    expect(view.result.current.cell).toBeUndefined()
    expect(view.onCell).not.toHaveBeenCalled()
  })

  it('anuncia la casilla enfocada', () => {
    const board = [piece({ instanceId: 'p1', position: { x: 3, y: 7 } })]
    const view = setup({ board })
    press('ArrowUp')
    expect(view.result.current.announcement).toContain('D8')
  })
})
