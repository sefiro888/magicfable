import { useEffect, useRef } from 'react'
import { createMatch, mulliganOpeningHand, reorderTopCards, STARTER_DECKS, type GameAction, type MatchState } from '../game'
import { useMatchStore } from '../store/match'
import type { Room, RoomRole } from './room'

type NetworkIntent =
  | { kind: 'action'; action: GameAction }
  | { kind: 'mulligan'; ids: readonly string[] }
  | { kind: 'scry'; order: readonly string[] }

interface StatePayload {
  match: MatchState
  message?: string
}

/**
 * El anfitrión (engine seat 'player') es la única autoridad: crea la partida,
 * aplica cualquier jugada —propia o del invitado— con el motor de siempre y
 * retransmite el MatchState resultante. El invitado (engine seat 'ai') nunca
 * muta su copia local: solo la reemplaza con lo que llega del anfitrión, y
 * envía sus jugadas como "intenciones" para que el anfitrión las aplique.
 */
export const useNetworkSync = (room: Room | undefined, role: RoomRole | undefined, localDeckId: string) => {
  const peerDeckId = useRef<string>(undefined)

  useEffect(() => {
    if (!room || !role) return undefined

    room.send('deck', localDeckId)

    const offDeck = room.onMessage('deck', (payload) => {
      const deckId = payload as string
      peerDeckId.current = deckId
      if (role !== 'host') return
      if (useMatchStore.getState().match) return
      const hostDeck = STARTER_DECKS.find((deck) => deck.id === localDeckId)
      const guestDeck = STARTER_DECKS.find((deck) => deck.id === deckId)
      if (!hostDeck || !guestDeck) return
      const match = createMatch(hostDeck, guestDeck, Date.now() >>> 0)
      useMatchStore.getState().startFromMatch(match)
    })

    const offState = room.onMessage('state', (payload) => {
      if (role !== 'guest') return
      const { match, message } = payload as StatePayload
      const store = useMatchStore.getState()
      if (!store.match) store.startFromMatch(match)
      else store.replaceMatch(match, message)
    })

    const offIntent = room.onMessage('intent', (payload) => {
      if (role !== 'host') return
      const store = useMatchStore.getState()
      const match = store.match
      if (!match) return
      const intent = payload as NetworkIntent
      if (intent.kind === 'action') {
        store.dispatch(intent.action)
        return
      }
      if (intent.kind === 'mulligan') {
        const result = mulliganOpeningHand(match, 'ai', intent.ids)
        if (result.ok) {
          store.replaceMatch(result.state, intent.ids.length > 0 ? 'Se ajusta la mano inicial.' : 'Se conserva la mano inicial.')
        }
        return
      }
      if (intent.kind === 'scry') {
        const result = reorderTopCards(match, 'ai', intent.order)
        if (result.ok) store.replaceMatch(result.state, 'Se resuelve el escrutinio del mazo.')
      }
    })

    // Solo el anfitrión retransmite: cada cambio de `match` (propio o ya
    // aplicado a partir de una intención del invitado) se reenvía tal cual.
    const offBroadcast = role === 'host'
      ? useMatchStore.subscribe((state, previous) => {
          if (state.match && state.match !== previous.match) {
            room.send('state', { match: state.match, message: state.history[state.history.length - 1] })
          }
        })
      : undefined

    return () => {
      offDeck()
      offState()
      offIntent()
      offBroadcast?.()
    }
  }, [room, role, localDeckId])

  const sendIntent = (intent: NetworkIntent) => room?.send('intent', intent)
  return { sendIntent }
}
