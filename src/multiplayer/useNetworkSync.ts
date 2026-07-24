import { useEffect, useRef, useState } from 'react'
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
  const [peerLeft, setPeerLeft] = useState(false)
  /** Acuerdo de revancha: cada lado marca que la quiere; solo cuando ambos
      lo han pedido el anfitrión siembra una partida nueva. */
  const [rematchSelf, setRematchSelf] = useState(false)
  const [rematchPeer, setRematchPeer] = useState(false)

  // Detecta cuando el rival se desconecta a mitad de partida (cierra la
  // pestaña, pierde la red…): antes de esto, un corte dejaba la pantalla
  // congelada sin ninguna pista de qué había pasado.
  useEffect(() => {
    if (!room) return undefined
    // Diferido: evita anidar el setState de reinicio dentro del cuerpo
    // síncrono del efecto (mismo patrón que el resto de canales laterales).
    const reset = window.setTimeout(() => setPeerLeft(false), 0)
    const wasConnected = { current: room.getStatus() === 'connected' }
    const off = room.onStatusChange((status) => {
      if (status === 'connected') wasConnected.current = true
      else if (status === 'waiting' && wasConnected.current) setPeerLeft(true)
    })
    return () => {
      window.clearTimeout(reset)
      off()
    }
  }, [room])

  // En cuanto llega una partida nueva sin ganador tras una ya terminada
  // (justo lo que produce una revancha aceptada), el acuerdo local se
  // reinicia: si no, un tercer «Jugar otra vez» quedaría ya medio marcado.
  useEffect(() => {
    if (!room) return undefined
    return useMatchStore.subscribe((state, previous) => {
      if (state.match && state.match !== previous.match && !state.match.winner && previous.match?.winner) {
        setRematchSelf(false)
        setRematchPeer(false)
      }
    })
  }, [room])

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

    const offRematch = room.onMessage('rematch', () => setRematchPeer(true))

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
      offRematch()
      offIntent()
      offBroadcast?.()
    }
  }, [room, role, localDeckId])

  // Solo el anfitrión tiene autoridad para sembrar la partida: en cuanto
  // los dos lados han pedido revancha, crea un MatchState nuevo con los
  // mismos mazos; la retransmisión habitual (offBroadcast) se lo envía al invitado.
  useEffect(() => {
    if (!rematchSelf || !rematchPeer || role !== 'host') return
    const hostDeck = STARTER_DECKS.find((deck) => deck.id === localDeckId)
    const guestDeck = STARTER_DECKS.find((deck) => deck.id === peerDeckId.current)
    if (!hostDeck || !guestDeck) return
    const match = createMatch(hostDeck, guestDeck, Date.now() >>> 0)
    useMatchStore.getState().startFromMatch(match)
  }, [rematchSelf, rematchPeer, role, localDeckId])

  const sendIntent = (intent: NetworkIntent) => room?.send('intent', intent)
  const requestRematch = () => {
    room?.send('rematch', {})
    setRematchSelf(true)
  }
  return { sendIntent, peerLeft, requestRematch, rematchSelf, rematchPeer }
}
