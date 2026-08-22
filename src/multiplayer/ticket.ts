import type { RoomRole } from './room'

/**
 * Billete de vuelta a una sala.
 *
 * El objeto `Room` envuelve un canal de Supabase Realtime y no se puede
 * serializar, así que al recargar la página la sala se perdía entera. Y eso no
 * dejaba al jugador simplemente fuera de la partida: como `room` quedaba
 * vacío, BattlePage daba la partida por individual y **la IA empezaba a jugar
 * el bando del rival humano**.
 *
 * Lo que sí se puede guardar es lo mínimo para volver a entrar: el código y el
 * papel que se tenía. Con eso la batalla se reengancha sola tras un F5, un
 * cierre accidental de la pestaña o un móvil que descarga la página al pasar a
 * segundo plano.
 */
export interface RoomTicket {
  readonly code: string
  readonly role: RoomRole
}

const KEY = 'cronicas-nexo-sala'

/**
 * Caducidad del billete. Sin ella, abrir el juego una semana después
 * intentaría volver a una sala que hace mucho que no existe, y el jugador
 * vería un error de conexión en vez de la portada.
 */
const TTL_MS = 15 * 60 * 1000

export const saveTicket = (ticket: RoomTicket): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...ticket, savedAtMs: Date.now() }))
  } catch {
    // Modo privado o almacenamiento lleno: sin billete se juega igual, solo
    // que una recarga corta la partida en red. No es motivo para reventar.
  }
}

export const readTicket = (): RoomTicket | undefined => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as Partial<RoomTicket> & { savedAtMs?: number }
    if (typeof parsed.code !== 'string' || (parsed.role !== 'host' && parsed.role !== 'guest')) return undefined
    if (typeof parsed.savedAtMs !== 'number' || Date.now() - parsed.savedAtMs > TTL_MS) {
      localStorage.removeItem(KEY)
      return undefined
    }
    return { code: parsed.code, role: parsed.role }
  } catch {
    return undefined
  }
}

export const clearTicket = (): void => {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Igual que al guardar: no poder limpiar no debe cortar la navegación.
  }
}
