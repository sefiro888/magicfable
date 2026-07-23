import { act } from 'react'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useRecords, type MatchRecord } from '../store/records'
import { AchievementToast } from './AchievementToast'

const win = (overrides: Partial<MatchRecord> = {}): Omit<MatchRecord, 'id'> => ({
  finishedAt: Date.now(),
  deckId: 'furia-caldera',
  deckName: 'Furia',
  commanderName: 'Kaela',
  opponentDeckName: 'X',
  won: true,
  turns: 12,
  seconds: 100,
  damageDealt: 10,
  seed: Math.floor(Math.random() * 1_000_000),
  ...overrides,
})

beforeEach(() => {
  useRecords.getState().clear()
})

afterEach(() => {
  cleanup()
  useRecords.getState().clear()
})

describe('AchievementToast', () => {
  it('no muestra nada al montar sin logros nuevos', () => {
    render(<AchievementToast />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('anuncia un logro que se desbloquea después de montar', async () => {
    render(<AchievementToast />)
    act(() => {
      useRecords.getState().addRecord(win())
    })
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Primera sangre'))
  })

  it('no reanuncia un logro que ya estaba desbloqueado antes de montar', () => {
    // Simula abrir la app con una victoria previa ya registrada.
    useRecords.getState().addRecord(win())
    render(<AchievementToast />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('encola dos logros desbloqueados a la vez y muestra el primero', async () => {
    render(<AchievementToast />)
    act(() => {
      // Turno 7 desbloquea a la vez «Primera sangre» y «Victoria relámpago».
      useRecords.getState().addRecord(win({ turns: 7 }))
    })
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())
    expect(screen.getByRole('status').textContent).toMatch(/Primera sangre|Victoria relámpago/)
  })
})
