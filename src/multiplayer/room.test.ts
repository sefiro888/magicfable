import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * Canal de Supabase de mentira: guarda el callback de `subscribe` para poder
 * simular desde el test lo que responde el servidor real.
 */
const channelState: {
  onSubscribe?: (status: string, error?: Error) => void
  tracked: unknown[]
  presence: Record<string, unknown>
  handlers: Record<string, (payload: unknown) => void>
} = { tracked: [], presence: {}, handlers: {} }

vi.mock('./supabaseClient', () => ({
  supabase: {
    channel: () => ({
      on: (kind: string, filter: { event: string }, handler: (payload: unknown) => void) => {
        channelState.handlers[`${kind}:${filter.event}`] = handler
      },
      subscribe: (callback: (status: string, error?: Error) => void) => {
        channelState.onSubscribe = callback
      },
      track: (payload: unknown) => channelState.tracked.push(payload),
      presenceState: () => channelState.presence,
      send: () => undefined,
    }),
    removeChannel: () => undefined,
  },
}))

const { createRoom, rejoinRoom } = await import('./room')

afterEach(() => {
  channelState.onSubscribe = undefined
  channelState.tracked = []
  channelState.presence = {}
  channelState.handlers = {}
  vi.useRealTimers()
})

describe('sala de multijugador', () => {
  it('empieza esperando y solo se anuncia presencia cuando el canal queda suscrito', () => {
    const room = createRoom()
    expect(room.getStatus()).toBe('waiting')
    expect(channelState.tracked).toHaveLength(0)
    channelState.onSubscribe?.('SUBSCRIBED')
    expect(channelState.tracked).toHaveLength(1)
    expect(room.getStatus()).toBe('waiting')
  })

  it('un error del canal deja de parecer «el rival aún no ha llegado»', () => {
    const room = createRoom()
    const seen: string[] = []
    room.onStatusChange((status) => seen.push(status))
    channelState.onSubscribe?.('CHANNEL_ERROR', new Error('no such host'))
    expect(room.getStatus()).toBe('error')
    expect(room.getError()).toContain('no such host')
    expect(seen).toContain('error')
  })

  it('si el servidor no contesta nunca, la espera acaba en error y no en el infinito', () => {
    vi.useFakeTimers()
    const room = createRoom()
    vi.advanceTimersByTime(11_000)
    expect(room.getStatus()).toBe('waiting')
    vi.advanceTimersByTime(2_000)
    expect(room.getStatus()).toBe('error')
    expect(room.getError()).toMatch(/no responde/i)
  })

  it('una suscripción correcta cancela el aviso de tiempo agotado', () => {
    vi.useFakeTimers()
    const room = createRoom()
    channelState.onSubscribe?.('SUBSCRIBED')
    vi.advanceTimersByTime(60_000)
    expect(room.getStatus()).toBe('waiting')
    expect(room.getError()).toBeUndefined()
  })

  it('cuando aparece el otro jugador, la sala pasa a conectada', () => {
    const room = createRoom()
    channelState.onSubscribe?.('SUBSCRIBED')
    channelState.presence = { otro: [{ role: 'guest' }] }
    channelState.handlers['presence:sync']?.(undefined)
    expect(room.getStatus()).toBe('connected')
  })

  it('al reenganchar se conserva el papel: el anfitrión no se convierte en invitado', () => {
    const room = rejoinRoom('  abc9k ', 'host')
    expect(room.role).toBe('host')
    // El código se normaliza igual que al unirse a mano, para que un billete
    // guardado con espacios o en minúsculas apunte al mismo canal.
    expect(room.code).toBe('ABC9K')
    channelState.onSubscribe?.('SUBSCRIBED')
    expect(channelState.tracked).toEqual([{ role: 'host' }])
  })

  it('salir de la sala no deja el aviso de tiempo agotado pendiente', () => {
    vi.useFakeTimers()
    const room = createRoom()
    room.leave()
    vi.advanceTimersByTime(60_000)
    expect(room.getStatus()).toBe('closed')
  })
})
