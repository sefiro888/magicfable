import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

export type RoomRole = 'host' | 'guest'
/**
 * 'error' es el estado que faltaba: si el canal de tiempo real no llega a
 * suscribirse (proyecto de Supabase pausado o borrado, red caída, clave que ya
 * no vale), antes la sala se quedaba en 'waiting' PARA SIEMPRE y los dos
 * jugadores veían «Esperando al rival…» sin ninguna pista de que el problema
 * no era el otro, sino el servidor.
 */
export type RoomStatus = 'waiting' | 'connected' | 'closed' | 'error'

export interface Room {
  readonly code: string
  readonly role: RoomRole
  getStatus: () => RoomStatus
  /** Motivo del fallo cuando el estado es 'error', para poder explicarlo. */
  getError: () => string | undefined
  /** Se dispara cuando el otro jugador entra o sale de la sala. */
  onStatusChange: (listener: (status: RoomStatus) => void) => () => void
  /** Envía un mensaje arbitrario al otro jugador (para la sincronización de la partida). */
  send: (event: string, payload: unknown) => void
  /** Escucha mensajes de un tipo concreto enviados por el otro jugador. */
  onMessage: (event: string, listener: (payload: unknown) => void) => () => void
  leave: () => void
}

/** Alfabeto sin caracteres ambiguos (sin 0/O, 1/I/L) para códigos fáciles de dictar. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

const randomCode = (length = 5): string => {
  let code = ''
  for (let index = 0; index < length; index += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return code
}

const PEER_ID_LENGTH = 12
const randomPeerId = (): string => randomCode(PEER_ID_LENGTH)

/**
 * Cuánto se espera a que el canal quede suscrito antes de dar la conexión por
 * imposible. Supabase reintenta por su cuenta sin avisar, así que sin este
 * tope no hay ningún momento en el que se pueda decir «esto no va».
 */
const SUBSCRIBE_TIMEOUT_MS = 12_000

/** Crea la sala y el canal de tiempo real compartido, ya suscrito. */
const connect = (code: string, role: RoomRole): Room => {
  const selfId = randomPeerId()
  let status: RoomStatus = 'waiting'
  let errorReason: string | undefined
  const statusListeners = new Set<(status: RoomStatus) => void>()
  const setStatus = (next: RoomStatus) => {
    if (status === next) return
    status = next
    statusListeners.forEach((listener) => listener(status))
  }

  const channel: RealtimeChannel = supabase.channel(`room:${code}`, {
    config: { presence: { key: selfId } },
  })

  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    const peers = Object.keys(state).filter((key) => key !== selfId)
    setStatus(peers.length > 0 ? 'connected' : 'waiting')
  })

  // Un único registro de broadcast ('msg') para todos los eventos lógicos: el
  // tipo de librería solo permite añadir listeners, no quitar uno concreto,
  // así que la des-suscripción fina la gestionamos nosotros con este mapa.
  const messageListeners = new Map<string, Set<(payload: unknown) => void>>()
  channel.on('broadcast', { event: 'msg' }, ({ payload }) => {
    const { event, data } = payload as { event: string; data: unknown }
    messageListeners.get(event)?.forEach((listener) => listener(data))
  })

  let subscribed = false
  const failWith = (reason: string) => {
    if (subscribed || status === 'closed') return
    errorReason = reason
    setStatus('error')
  }
  const timeout = setTimeout(
    () => failWith('El servidor de partidas no responde. Puede que esté caído o sin conexión.'),
    SUBSCRIBE_TIMEOUT_MS,
  )
  channel.subscribe((subscribeStatus, error) => {
    if (subscribeStatus === 'SUBSCRIBED') {
      subscribed = true
      clearTimeout(timeout)
      errorReason = undefined
      channel.track({ role })
      return
    }
    if (subscribeStatus === 'CHANNEL_ERROR') {
      clearTimeout(timeout)
      failWith(error?.message ?? 'No se pudo abrir el canal de la partida.')
      return
    }
    if (subscribeStatus === 'TIMED_OUT') {
      clearTimeout(timeout)
      failWith('Se agotó el tiempo de conexión con el servidor de partidas.')
    }
  })

  return {
    code,
    role,
    getStatus: () => status,
    getError: () => (status === 'error' ? errorReason : undefined),
    onStatusChange: (listener) => {
      statusListeners.add(listener)
      return () => statusListeners.delete(listener)
    },
    send: (event, data) => {
      channel.send({ type: 'broadcast', event: 'msg', payload: { event, data } })
    },
    onMessage: (event, listener) => {
      let listeners = messageListeners.get(event)
      if (!listeners) {
        listeners = new Set()
        messageListeners.set(event, listeners)
      }
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    leave: () => {
      clearTimeout(timeout)
      setStatus('closed')
      statusListeners.clear()
      messageListeners.clear()
      supabase.removeChannel(channel)
    },
  }
}

export const createRoom = (): Room => connect(randomCode(), 'host')

export const joinRoom = (code: string): Room => connect(code.trim().toUpperCase(), 'guest')
