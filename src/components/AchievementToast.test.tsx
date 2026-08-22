import { act } from 'react'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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

/**
 * El aviso consulta la ruta actual —en la batalla no se muestra—, así que
 * necesita un router alrededor para montarse.
 */
const renderEn = (ruta = '/') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <AchievementToast />
    </MemoryRouter>,
  )

describe('AchievementToast', () => {
  it('no muestra nada al montar sin logros nuevos', () => {
    renderEn()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('anuncia un logro que se desbloquea después de montar', async () => {
    renderEn()
    act(() => {
      useRecords.getState().addRecord(win())
    })
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Primera sangre'))
  })

  it('no reanuncia un logro que ya estaba desbloqueado antes de montar', () => {
    // Simula abrir la app con una victoria previa ya registrada.
    useRecords.getState().addRecord(win())
    renderEn()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('en la batalla se calla: el resumen final ya lista los logros', async () => {
    // Aparecían los dos a la vez, el aviso flotando encima del resumen que ya
    // los enumeraba, y en un móvil eso le roba al modal setenta píxeles de una
    // pantalla que va justa.
    renderEn('/battle')
    act(() => {
      useRecords.getState().addRecord(win())
    })
    await waitFor(() => expect(useRecords.getState().records).toHaveLength(1))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('encola dos logros desbloqueados a la vez y muestra el primero', async () => {
    renderEn()
    act(() => {
      // Turno 7 desbloquea a la vez «Primera sangre» y «Victoria relámpago».
      useRecords.getState().addRecord(win({ turns: 7 }))
    })
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())
    expect(screen.getByRole('status').textContent).toMatch(/Primera sangre|Victoria relámpago/)
  })
})
