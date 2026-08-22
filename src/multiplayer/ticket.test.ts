import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearTicket, readTicket, saveTicket } from './ticket'

afterEach(() => {
  localStorage.clear()
  vi.useRealTimers()
})

describe('billete de vuelta a la sala', () => {
  it('devuelve el código y el papel que se guardaron', () => {
    saveTicket({ code: 'K7QMP', role: 'guest' })
    expect(readTicket()).toEqual({ code: 'K7QMP', role: 'guest' })
  })

  it('sin billete guardado no inventa ninguno', () => {
    expect(readTicket()).toBeUndefined()
  })

  it('un billete viejo caduca en vez de mandarte a una sala que ya no existe', () => {
    vi.useFakeTimers()
    saveTicket({ code: 'K7QMP', role: 'host' })
    vi.advanceTimersByTime(14 * 60 * 1000)
    expect(readTicket()).toEqual({ code: 'K7QMP', role: 'host' })
    vi.advanceTimersByTime(2 * 60 * 1000)
    expect(readTicket()).toBeUndefined()
    // Y además se borra, para no repetir la comprobación en cada arranque.
    expect(localStorage.getItem('cronicas-nexo-sala')).toBeNull()
  })

  it('un contenido corrupto se ignora sin reventar', () => {
    localStorage.setItem('cronicas-nexo-sala', '{esto no es json')
    expect(readTicket()).toBeUndefined()
    localStorage.setItem('cronicas-nexo-sala', JSON.stringify({ code: 'X', role: 'espectador', savedAtMs: Date.now() }))
    expect(readTicket()).toBeUndefined()
  })

  it('al salir de la partida el billete se borra', () => {
    saveTicket({ code: 'K7QMP', role: 'host' })
    clearTicket()
    expect(readTicket()).toBeUndefined()
  })
})
