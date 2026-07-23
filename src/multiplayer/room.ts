import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

export type RoomRole = 'host' | 'guest'
export type RoomStatus = 'waiting' | 'connected' | 'closed'

export interface Room {
  readonly code: string
  readonly role: RoomRole
  getStatus: () => RoomStatus
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

/** Crea la sala y el canal de tiempo real compartido, ya suscrito. */
const connect = (code: string, role: RoomRole): Room => {
  const selfId = randomPeerId()
  let status: RoomStatus = 'waiting'
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

  channel.subscribe((subscribeStatus) => {
    if (subscribeStatus === 'SUBSCRIBED') {
      channel.track({ role })
    }
  })

  return {
    code,
    role,
    getStatus: () => status,
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
      setStatus('closed')
      statusListeners.clear()
      messageListeners.clear()
      supabase.removeChannel(channel)
    },
  }
}

export const createRoom = (): Room => connect(randomCode(), 'host')

export const joinRoom = (code: string): Room => connect(code.trim().toUpperCase(), 'guest')
