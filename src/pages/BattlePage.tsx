import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  CARD_BY_ID,
  canTakeMulligan,
  COMMANDER_BY_ID,
  effectiveCost,
  getValidAttacks,
  getValidDeploymentPositions,
  getValidMoves,
  mulliganOpeningHand,
  planManaPayment,
  previewAttackNexus,
  previewAttackPiece,
  reorderTopCards,
  STARTER_DECKS,
  summarizeMana,
  validSpellTargets,
  type GameAction,
  type MatchState,
  type PlayerId,
  type Position,
} from '../game'
import { Board3D } from '../battle/Board3D'
import { useAiTurn } from '../battle/hooks/useAiTurn'
import { useCardDrag } from '../battle/hooks/useCardDrag'
import { useBoardCursor } from '../battle/hooks/useBoardCursor'
import { useEventDirector } from '../battle/hooks/useEventDirector'
import { useMatchRecorder } from '../battle/hooks/useMatchRecorder'
import { downloadMatchLog } from '../battle/matchLog'
import { HandFan } from '../battle/ui/HandFan'
import { HistoryLog } from '../battle/ui/HistoryLog'
import { HowToPlay, hasSeenHowTo, markHowToSeen } from '../battle/ui/HowToPlay'
import { GuidedTutorial } from '../battle/ui/GuidedTutorial'
import { GlossaryPanel } from '../battle/ui/GlossaryPanel'
import { actionHintFor, attackNexusPreviewLines, attackPiecePreviewLines, cardStatLine, isBoardCard, pieceStatLine, requiresPieceTarget } from '../battle/ui/battleHints'
import { describePendingActions, pendingTurnActions } from '../battle/ui/pendingTurnActions'
import { FactionSigil } from '../components'
import { useNetworkSync } from '../multiplayer/useNetworkSync'
import { useSoundtrack } from '../services/useAudioMix'
import { useMatchStore } from '../store/match'
import { useNetworkStore } from '../store/network'
import { rejoinRoom } from '../multiplayer/room'
import { clearTicket, readTicket } from '../multiplayer/ticket'
import { usePreferences } from '../store/preferences'
import { opponentForFloor, towerMaxHealth, useTower } from '../store/tower'
import { summarizeRecords, useRecords } from '../store/records'
import { evaluateDailyChallenge } from '../store/dailyChallenge'
import { withBase } from '../utils/assets'
import { FACTION_LABELS, RARITY_LABELS, TYPE_LABELS } from '../utils/cardLabels'
import { DevPanel } from './battle/DevPanel'
import { DragGhost } from './battle/DragGhost'
import { EnemyPanel } from './battle/EnemyPanel'
import { ESSENCE_LABELS, PHASE_LABELS } from './battle/labels'
import { MatchResultDialog } from './battle/MatchResultDialog'
import { MulliganDialog } from './battle/MulliganDialog'
import { ScryDialog } from './battle/ScryDialog'
import { SelectionPanel } from './battle/SelectionPanel'
import styles from './BattlePage.module.css'

export function BattlePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preferences = usePreferences()
  const store = useMatchStore()
  const room = useNetworkStore((state) => state.room)
  const role = useNetworkStore((state) => state.role)
  // En solitario y para el anfitrión, «yo» soy el bando 'player' del motor;
  // el invitado ocupa siempre el bando 'ai' (así el motor no cambia nada).
  const ME: PlayerId = role === 'guest' ? 'ai' : 'player'
  const RIVAL: PlayerId = ME === 'player' ? 'ai' : 'player'
  /**
   * Billete de vuelta leído UNA sola vez, antes del primer render.
   *
   * Tiene que ser síncrono: si esperásemos a un efecto, durante ese primer
   * render `room` valdría `undefined` y esta pantalla trataría la partida como
   * individual — arrancaría una partida nueva encima de la de red y pondría a
   * la IA a jugar el bando del rival humano.
   */
  const [ticket] = useState(() => (room ? undefined : readTicket()))
  /** Hay billete pero aún no hay sala: la partida es de red, solo que a medio volver. */
  const rejoining = Boolean(ticket) && !room

  useEffect(() => {
    // La sala se consulta al store, no a la variable del render: así el
    // segundo pase de StrictMode (y cualquier re-ejecución del efecto) no
    // abre un canal duplicado.
    if (!ticket || useNetworkStore.getState().room) return
    const back = rejoinRoom(ticket.code, ticket.role)
    useNetworkStore.getState().setRoom(back, back.role)
  }, [ticket])

  const { sendIntent, link, peerLeft, requestRematch, rematchSelf, rematchPeer } = useNetworkSync(room, role, preferences.selectedDeckId)
  // «?seed=N» reproduce una partida concreta; sin él cada escaramuza es distinta.
  /** «?tower=1»: esta partida es un piso de la Torre del Nexo. */
  const isTowerMatch = searchParams.get('tower') === '1'
  const forcedSeed = useMemo(() => {
    const raw = searchParams.get('seed')
    if (raw === null) return undefined
    const parsed = Number.parseInt(raw, 10)
    return Number.isFinite(parsed) ? parsed >>> 0 : undefined
  }, [searchParams])
  const [mulliganIds, setMulliganIds] = useState<readonly string[]>([])
  /** Modo foto: cámara libre para admirar el tablero, sin clics de juego mientras está activo. */
  const [photoMode, setPhotoMode] = useState(false)
  /** Cartas de la mano fijadas al principio del abanico: solo orden visual, no afecta a la partida. */
  const [favoriteHandIds, setFavoriteHandIds] = useState<ReadonlySet<string>>(new Set())
  const toggleFavoriteHand = useCallback((instanceId: string) => {
    setFavoriteHandIds((current) => {
      const next = new Set(current)
      if (next.has(instanceId)) next.delete(instanceId)
      else next.add(instanceId)
      return next
    })
  }, [])
  const [devOpen, setDevOpen] = useState(false)
  const [howToOpen, setHowToOpen] = useState(() => !hasSeenHowTo())
  /** Coach interactivo de la primera partida: arranca solo tras cerrar la guía la primerísima vez. */
  const [tutorialActive, setTutorialActive] = useState(false)
  const handBarRef = useRef<HTMLElement>(null)
  const endTurnRef = useRef<HTMLButtonElement>(null)
  /** Mano recogida: despeja el tablero; al soltar el botón vuelve a subir. */
  const [handTucked, setHandTucked] = useState(false)
  const [confirmAbandon, setConfirmAbandon] = useState(false)
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  /** Panel de datos del rival: vida, esencia, mazo y descarte — plegado por defecto para no robarle sitio al tablero. */
  const [enemyPanelOpen, setEnemyPanelOpen] = useState(false)
  /** Panel propio (comandante/mazo/descarte/reto) en móvil: su vida y esencia ya se ven
      en el tablero y en la píldora inferior, así que se oculta por defecto para dejar
      sitio al tablero. En PC siempre está visible, este estado no se usa ahí. */
  const [ownPanelOpenMobile, setOwnPanelOpenMobile] = useState(false)

  const match = store.match
  const currentEvent = store.currentEvent
  const pendingCount = store.pendingAnimations.length
  const queueBusy = Boolean(currentEvent) || pendingCount > 0

  // ── Arrastrar una carta de la mano hasta su casilla ───────────────────────
  // La casilla bajo el cursor se guarda además en un ref porque la consultan
  // manejadores de evento (soltar) que no deben depender de un render nuevo;
  // el estado solo se actualiza mientras se arrastra, para no re-renderizar la
  // pantalla entera cada vez que el ratón cruza una casilla.
  const hoveredCellRef = useRef<Position | undefined>(undefined)
  const draggingRef = useRef(false)
  const [hoveredCell, setHoveredCell] = useState<Position>()
  const playDraggedRef = useRef<((instanceId: string, position: Position) => void) | undefined>(undefined)
  const onCellHover = useCallback((position?: Position) => {
    hoveredCellRef.current = position
    if (draggingRef.current) setHoveredCell(position)
  }, [])
  const drag = useCardDrag({
    onDrop: useCallback((instanceId: string) => {
      const cell = hoveredCellRef.current
      if (cell) playDraggedRef.current?.(instanceId, cell)
    }, []),
    onDragStart: useCallback(() => { draggingRef.current = true }, []),
    onDragEnd: useCallback(() => { draggingRef.current = false; setHoveredCell(undefined) }, []),
  })

  // Reproducción de la cola de animaciones, avisos y canales laterales
  // (escrutinio, revelaciones): todo eso vive en su propio hook.
  const director = useEventDirector(ME, preferences)
  const scryOpen = director.scryAmount > 0

  // Capa ambiental generativa del escenario activo (se apaga sola al salir).
  useSoundtrack(preferences.scenario, Boolean(match))

  /**
   * Resultado del piso de Torre. Se apunta una sola vez por partida: el
   * `matchKey` es el estado en el que se detectó el ganador, así que una
   * revancha o una partida nueva vuelven a permitirlo.
   */
  const towerReported = useRef<MatchState | undefined>(undefined)
  useEffect(() => {
    if (!isTowerMatch || !match?.winner) return
    if (towerReported.current === match) return
    towerReported.current = match
    useTower.getState().finishFloor(match.winner === ME, match.players[ME].nexusHealth)
  }, [isTowerMatch, match, ME])

  const recorder = useMatchRecorder({
    me: ME,
    rival: RIVAL,
    fallbackDeckId: preferences.selectedDeckId,
    isPvp: Boolean(room),
    peerLeft,
    queueBusy,
  })

  const ai = useAiTurn({
    // En multijugador el bando 'ai' del motor es un humano de verdad (el
    // invitado): este bot nunca debe jugar por él.
    enabled: !room && !rejoining,
    difficulty: preferences.aiDifficulty,
    delayMs: preferences.aiDelayMs,
    blocked: queueBusy || scryOpen,
  })

  useEffect(() => {
    // En multijugador la partida la siembra el anfitrión vía useNetworkSync,
    // no este efecto: aquí no hay mazo de IA que elegir ni semilla que forzar.
    if (room || rejoining) return
    // Crea partida nueva si no hay ninguna o si la que persiste en el store no
    // corresponde al mazo elegido. Sin la segunda condición, la primera facción
    // con la que se juega quedaba fija al volver a entrar con otra distinta.
    const selectedDeck = STARTER_DECKS.find((deck) => deck.id === preferences.selectedDeckId)
    // La Torre manda sobre los ajustes normales: fija rival, Vida de entrada y
    // castigo del rival según la bendición elegida en el piso anterior.
    const towerRun = isTowerMatch ? useTower.getState().run : undefined
    const towerOpponentId = towerRun ? opponentForFloor(towerRun, towerRun.floor) : undefined
    // Además del mazo propio, cuenta el rival elegido: si se cambia de rival
    // en «Jugar» y la partida guardada era contra otro, hay que empezar una
    // nueva o el ajuste no tendría ningún efecto hasta terminar la anterior.
    const chosenOpponent = towerOpponentId
      ? STARTER_DECKS.find((deck) => deck.id === towerOpponentId)
      : preferences.opponentDeckId === 'random'
        ? undefined
        : STARTER_DECKS.find((deck) => deck.id === preferences.opponentDeckId)
    const matchesSelection = Boolean(
      store.match
      && selectedDeck
      && store.match.players.player.commanderId === selectedDeck.commanderId
      && (!chosenOpponent || store.match.players.ai.commanderId === chosenOpponent.commanderId),
    )
    if (!matchesSelection) {
      useMatchStore.getState().startMatch(
        towerRun?.deckId ?? preferences.selectedDeckId,
        forcedSeed,
        chosenOpponent?.id,
        towerRun
          ? {
              playerNexusHealth: towerRun.health,
              aiNexusHealth: Math.max(1, towerMaxHealth(towerRun.deckId) - towerRun.enemyPenalty),
            }
          : undefined,
      )
    }
  }, [preferences.selectedDeckId, preferences.opponentDeckId, store.match, forcedSeed, room, rejoining, isTowerMatch])

  // Los avisos de acción inválida se disuelven solos para no exigir un clic.
  useEffect(() => {
    if (!store.message) return
    const timer = window.setTimeout(() => useMatchStore.getState().setMessage(undefined), 3600)
    return () => window.clearTimeout(timer)
  }, [store.message])

  useEffect(() => {
    const cancel = (event: KeyboardEvent) => {
      if (import.meta.env.DEV && event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        setDevOpen((open) => !open)
        return
      }
      if (event.key === 'Escape') {
        store.selectHand(undefined)
        store.selectPiece(undefined)
        store.inspect(undefined)
      }
      if (event.key.toLowerCase() === 'i') {
        const current = store.match
        const hand = current?.players[ME].hand.find((card) => card.instanceId === store.selectedHandId)
        const piece = current?.board.find((card) => card.instanceId === store.selectedPieceId)
        store.inspect(hand?.cardId ?? piece?.cardId)
      }
    }
    window.addEventListener('keydown', cancel)
    return () => window.removeEventListener('keydown', cancel)
  }, [store, ME])

  // Captura errores de JS mientras dura la partida para el registro exportable
  // (botón "Descargar registro" en la pantalla de resultado): son la señal más
  // directa de un bug real, y sin esto solo quedarían en la consola del
  // navegador del jugador, invisibles para cualquiera que no sea él.
  useEffect(() => {
    const onError = (event: ErrorEvent) => useMatchStore.getState().logError(event.message)
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason)
      useMatchStore.getState().logError(reason)
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  const player = match?.players[ME]
  const rival = match?.players[RIVAL]
  // La carta «activa» es la que se está arrastrando o, si no hay ninguna en
  // vuelo, la seleccionada con un clic: así las casillas válidas se iluminan
  // igual con las dos formas de jugar.
  const activeHandId = drag.draggingId ?? store.selectedHandId
  const selectedInstance = player?.hand.find((instance) => instance.instanceId === activeHandId)
  const selectedCard = selectedInstance ? CARD_BY_ID[selectedInstance.cardId] : undefined
  const selectedPiece = match?.board.find((piece) => piece.instanceId === store.selectedPieceId)
  const selectedBoardCard = selectedPiece ? CARD_BY_ID[selectedPiece.cardId] : undefined
  // Ficha "consultada" con un clic normal, propia o rival: solo para verla,
  // no implica poder actuar con ella (eso sigue siendo selectedPiece).
  const viewedPiece = match?.board.find((piece) => piece.instanceId === store.viewedPieceId)
  const viewedBoardCard = viewedPiece ? CARD_BY_ID[viewedPiece.cardId] : undefined
  const moves = useMemo(
    () => (match && selectedPiece ? getValidMoves(match, selectedPiece.instanceId) : []),
    [match, selectedPiece],
  )
  const attacks = useMemo(
    () => (match && selectedPiece
      ? getValidAttacks(match, selectedPiece.instanceId)
      : { pieceIds: [] as readonly string[], canAttackNexus: false }),
    [match, selectedPiece],
  )
  const deployCells = useMemo<Position[]>(() => {
    if (!match || !selectedCard || !isBoardCard(selectedCard) || match.activePlayer !== ME) return []
    if (!planManaPayment(match.players[ME].resources, effectiveCost(match, ME, selectedCard)).payable) return []
    return [...getValidDeploymentPositions(match, ME)]
  }, [match, selectedCard, ME])
  const validCells = selectedCard ? deployCells : moves
  const mana = summarizeMana(player?.resources ?? [])
  const rivalMana = summarizeMana(rival?.resources ?? [])
  const payment = match && selectedCard
    ? planManaPayment(player?.resources ?? [], effectiveCost(match, ME, selectedCard))
    : undefined
  const commander = player ? COMMANDER_BY_ID[player.commanderId] : undefined
  const rivalCommander = rival ? COMMANDER_BY_ID[rival.commanderId] : undefined
  const inspected = store.inspectedCardId ? CARD_BY_ID[store.inspectedCardId] : undefined
  const storedRecords = useRecords((state) => state.records)
  const tally = useMemo(() => summarizeRecords(storedRecords), [storedRecords])
  const daily = useMemo(() => evaluateDailyChallenge(storedRecords), [storedRecords])
  // Antes esto reimplementaba a mano las reglas de objetivo (enemigo, propio,
  // solo unidades...) y se desincronizó del motor en dos cartas reales:
  // Maldición Sombra resaltaba también las fichas propias, y Juicio Divino
  // resaltaba cualquier enemigo en vez de solo los de 2 Vida o menos —
  // clicar una ficha "válida" así fallaba igual que una que no lo fuera, sin
  // explicación. `validSpellTargets` es la misma comprobación que usa el
  // motor para aceptar o rechazar la jugada, así que nunca puede
  // desincronizarse de ella.
  const spellTargets = useMemo(() => {
    if (!match || !selectedCard) return []
    return validSpellTargets(match, ME, selectedCard).map((piece) => piece.instanceId)
  }, [match, selectedCard, ME])

  const boardTargets = useMemo(() => {
    const base = selectedCard ? spellTargets : attacks.pieceIds
    return attacks.canAttackNexus && !selectedCard ? [...base, `${RIVAL}-nexus`] : base
  }, [selectedCard, spellTargets, attacks, RIVAL])

  // ── Vista previa de daño: qué pasaría si se confirma el ataque ────────────
  // Solo tiene sentido con una ficha propia seleccionada (modo ataque, no
  // despliegue) y el cursor sobre uno de sus objetivos válidos.
  const [hoveredTargetId, setHoveredTargetId] = useState<string>()
  const onHoverPiece = useCallback((pieceId?: string) => setHoveredTargetId(pieceId), [])
  const onHoverNexus = useCallback((playerId?: PlayerId) => setHoveredTargetId(playerId ? `${playerId}-nexus` : undefined), [])
  const attackPreview = useMemo(() => {
    if (!match || !selectedPiece || selectedCard || !hoveredTargetId) return undefined
    if (hoveredTargetId === `${RIVAL}-nexus` && attacks.canAttackNexus) {
      const preview = previewAttackNexus(match, selectedPiece.instanceId)
      return preview ? { targetId: hoveredTargetId, lines: attackNexusPreviewLines(preview) } : undefined
    }
    if (attacks.pieceIds.includes(hoveredTargetId)) {
      const preview = previewAttackPiece(match, selectedPiece.instanceId, hoveredTargetId)
      return preview ? { targetId: hoveredTargetId, lines: attackPiecePreviewLines(preview) } : undefined
    }
    return undefined
  }, [match, selectedPiece, selectedCard, hoveredTargetId, attacks, RIVAL])

  // Unidades propias que aún pueden mover o atacar: reciben un anillo de
  // disponibilidad en el tablero. Se recalcula solo cuando cambia la partida.
  const readyPieceIds = useMemo(() => {
    const ready = new Set<string>()
    if (!match || match.activePlayer !== ME || match.winner) return ready
    for (const piece of match.board) {
      if (piece.owner !== ME) continue
      if (CARD_BY_ID[piece.cardId]?.type !== 'unit') continue
      if (getValidMoves(match, piece.instanceId).length > 0) {
        ready.add(piece.instanceId)
        continue
      }
      const options = getValidAttacks(match, piece.instanceId)
      if (options.pieceIds.length > 0 || options.canAttackNexus) ready.add(piece.instanceId)
    }
    return ready
  }, [match, ME])

  // Handlers estables (useCallback): permiten memoizar las celdas y cartas del
  // tablero 3D para que la reproducción de eventos no re-renderice el canvas.
  // El invitado nunca es la autoridad de la partida: en vez de aplicar la
  // acción localmente, se la envía al anfitrión y confía en que la
  // retransmisión de estado (useNetworkSync) la refleje enseguida.
  /**
   * Deshacer: solo el último MOVIMIENTO, y solo mientras no se haya
   * confirmado nada más después. No ataques ni cartas jugadas —esas cambian
   * el estado del rival o consumen recursos de forma más difícil de
   * explicar al deshacerla— y no en multijugador: el invitado no tiene
   * autoridad sobre la partida, y para el anfitrión deshacer en local
   * dejaría su estado desincronizado del que ya vio el rival.
   */
  const [undoState, setUndoState] = useState<{ snapshot: MatchState; pieceId: string }>()
  const doAction = useCallback((action: GameAction) => {
    if (role === 'guest') {
      sendIntent({ kind: 'action', action })
      return true
    }
    const before = useMatchStore.getState().match
    const ok = useMatchStore.getState().dispatch(action)
    setUndoState(ok && action.type === 'move' && before ? { snapshot: before, pieceId: action.pieceId } : undefined)
    return ok
  }, [role, sendIntent])
  const undoLastMove = useCallback(() => {
    if (!undoState || room) return
    useMatchStore.getState().replaceMatch(undoState.snapshot, 'Deshaces tu último movimiento.')
    setUndoState(undefined)
  }, [undoState, room])
  const finishSelection = useCallback(() => {
    const state = useMatchStore.getState()
    state.selectHand(undefined)
    state.selectPiece(undefined)
  }, [])

  // Soltar una carta sobre una casilla la juega ahí directamente. Se mantiene
  // en un ref porque quien lo dispara es el hook de arrastre, montado antes de
  // que existan `doAction` y compañía.
  useEffect(() => {
    playDraggedRef.current = (instanceId, position) => {
      const instance = player?.hand.find((candidate) => candidate.instanceId === instanceId)
      const card = instance ? CARD_BY_ID[instance.cardId] : undefined
      if (!card || !match || match.activePlayer !== ME || match.winner) return
      // Las fuentes no ocupan casilla: soltarlas en cualquier punto del tablero
      // las juega, que es lo que espera quien las arrastra.
      if (card.type === 'mana') {
        if (doAction({ type: 'play-resource', playerId: ME, cardInstanceId: instanceId })) finishSelection()
        return
      }
      // Los hechizos con objetivo siguen pidiendo clic sobre la ficha: una
      // casilla vacía no les dice a quién apuntar.
      if (!isBoardCard(card)) return
      if (doAction({ type: 'play-card', playerId: ME, cardInstanceId: instanceId, position, target: { kind: 'none' } })) {
        finishSelection()
      }
    }
  }, [player, match, ME, doAction, finishSelection])

  const consumeDragged = drag.consumeDragged
  const onHandSelect = useCallback((instanceId: string) => {
    // Al soltar tras un arrastre el navegador dispara además un clic; sin esto
    // ese clic alternaría la selección de la carta recién jugada.
    if (consumeDragged()) return
    if (!match || !player) return
    if (match.activePlayer !== ME || match.winner || queueBusy) return
    const instance = player.hand.find((candidate) => candidate.instanceId === instanceId)
    const card = instance ? CARD_BY_ID[instance.cardId] : undefined
    if (!instance || !card) return
    if (card.type === 'mana') {
      if (doAction({ type: 'play-resource', playerId: ME, cardInstanceId: instanceId })) finishSelection()
      return
    }
    useMatchStore.getState().selectHand(store.selectedHandId === instanceId ? undefined : instanceId)
  }, [match, player, queueBusy, store.selectedHandId, doAction, finishSelection, ME, consumeDragged])

  const inspectCard = useCallback((cardId?: string) => useMatchStore.getState().inspect(cardId), [])

  /**
   * Poder del comandante. Los que piden objetivo entran en un modo de
   * señalamiento: el siguiente clic sobre una unidad enemiga lo lanza. Así no
   * hace falta una interfaz aparte para elegir, se reutiliza el tablero.
   */
  const [aimingPower, setAimingPower] = useState(false)
  const power = commander?.power
  const powerPayment = useMemo(
    () => (power && match ? planManaPayment(match.players[ME].resources, power.cost) : undefined),
    [power, match, ME],
  )
  const powerUsed = match?.players[ME].commanderPowerUsed ?? false
  const canUsePower = Boolean(
    power && !powerUsed && match && !match.winner && match.activePlayer === ME && !queueBusy && powerPayment?.payable,
  )
  // Sin memoizar a propósito: solo la usa el botón del panel, que se
  // re-renderiza con la partida de todas formas. El disparo con objetivo va
  // por `onPiece`, que sí está memoizado porque lo consume el tablero 3D.
  const castPower = (target?: { kind: 'piece'; pieceId: string }) => {
    if (!power) return
    if (power.needsEnemyTarget && !target) {
      setAimingPower(true)
      useMatchStore.getState().setMessage(`${power.name}: señala una unidad enemiga.`)
      return
    }
    setAimingPower(false)
    if (doAction({ type: 'commander-power', playerId: ME, target })) finishSelection()
  }

  const onCell = useCallback((position: Position) => {
    if (photoMode) return
    if (selectedInstance && selectedCard && isBoardCard(selectedCard)) {
      if (doAction({ type: 'play-card', playerId: ME, cardInstanceId: selectedInstance.instanceId, position, target: { kind: 'none' } })) finishSelection()
      return
    }
    if (selectedPiece && moves.some((cell) => cell.x === position.x && cell.y === position.y)) {
      if (doAction({ type: 'move', playerId: ME, pieceId: selectedPiece.instanceId, to: position })) finishSelection()
    }
  }, [photoMode, selectedInstance, selectedCard, selectedPiece, moves, doAction, finishSelection, ME])

  const onPiece = useCallback((pieceId: string) => {
    if (photoMode || !match) return
    const piece = match.board.find((candidate) => candidate.instanceId === pieceId)
    if (!piece) return
    if (match.activePlayer === ME) {
      if (selectedInstance && selectedCard && !isBoardCard(selectedCard)) {
        if (doAction({ type: 'play-card', playerId: ME, cardInstanceId: selectedInstance.instanceId, target: { kind: 'piece', pieceId } })) finishSelection()
        return
      }
      if (selectedPiece && attacks.pieceIds.includes(pieceId)) {
        if (doAction({ type: 'attack-piece', playerId: ME, attackerId: selectedPiece.instanceId, defenderId: pieceId })) finishSelection()
        return
      }
      if (piece.owner === ME) {
        useMatchStore.getState().selectPiece(store.selectedPieceId === pieceId ? undefined : pieceId)
        return
      }
    }
    // Consultar información completa de cualquier ficha (propia o rival) con
    // un clic normal, sin desencadenar ninguna acción — también fuera de tu
    // turno, para poder planear mientras observas la jugada del rival.
    const state = useMatchStore.getState()
    state.viewPiece(state.viewedPieceId === pieceId ? undefined : pieceId)
  }, [photoMode, match, selectedInstance, selectedCard, selectedPiece, attacks, doAction, finishSelection, ME, store.selectedPieceId])

  const onNexus = useCallback((playerId: PlayerId) => {
    if (photoMode) return
    if (playerId === RIVAL && selectedPiece && attacks.canAttackNexus) {
      if (doAction({ type: 'attack-nexus', playerId: ME, attackerId: selectedPiece.instanceId })) finishSelection()
    }
  }, [photoMode, selectedPiece, attacks, doAction, finishSelection, ME, RIVAL])

  // ── Cursor de teclado sobre el tablero ────────────────────────────────────
  // Se apaga solo mientras haya un modal por encima (mulligan, escrutinio,
  // guía) o en modo foto: ahí las flechas pertenecen a esa otra interfaz.
  const cursorEnabled = Boolean(match) && !match?.winner && !photoMode && !scryOpen && !howToOpen
    && !(match && canTakeMulligan(match, ME))
  const cursorHome = useMemo(() => {
    const own = match?.board.filter((piece) => piece.owner === ME) ?? []
    return own[0]?.position
  }, [match?.board, ME])
  const boardCursor = useBoardCursor({
    enabled: cursorEnabled,
    me: ME,
    board: match?.board ?? [],
    home: cursorHome,
    onCell,
    onPiece,
    onNexus,
  })

  /**
   * Aviso de acciones sin usar. Ceder el turno con una unidad parada, con
   * Esencia de sobra o sin haber jugado la fuente del turno es el despiste más
   * caro del juego (la fuente no se recupera: solo se puede jugar una por
   * turno). La primera pulsación avisa y la segunda cede igualmente; el aviso
   * se arma de nuevo en cuanto cambia la partida, para que no arrastre un
   * permiso concedido hace tres jugadas.
   */
  // El permiso se ata al ESTADO exacto de la partida en el que se avisó, en
  // vez de a un booleano que haya que reiniciar por efecto: cualquier jugada
  // posterior crea un estado nuevo y el aviso vuelve a armarse solo.
  const [warnedFor, setWarnedFor] = useState<MatchState>()
  const endTurn = useCallback(() => {
    if (preferences.confirmEndTurn && match && warnedFor !== match) {
      const pending = pendingTurnActions(match, ME)
      if (pending.anything) {
        setWarnedFor(match)
        useMatchStore.getState().setMessage(describePendingActions(pending))
        return
      }
    }
    if (doAction({ type: 'end-turn', playerId: ME })) finishSelection()
  }, [doAction, finishSelection, ME, match, preferences.confirmEndTurn, warnedFor])

  // Atajos de teclado adicionales a Esc/I (ver el otro efecto de teclado):
  // van aparte porque necesitan `endTurn`, definido después de aquel.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      const key = event.key.toLowerCase()
      if (key === 'e' && match?.activePlayer === ME && !match.winner && !queueBusy) {
        event.preventDefault()
        endTurn()
        return
      }
      if (key === 'h') {
        event.preventDefault()
        setHandTucked((current) => !current)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [match?.activePlayer, match?.winner, queueBusy, ME, endTurn])

  const closeHowTo = useCallback(() => {
    const firstTime = !hasSeenHowTo()
    markHowToSeen()
    setHowToOpen(false)
    // El coach interactivo solo arranca la primerísima vez, justo tras la
    // guía de bienvenida; reabrir la guía luego con el botón de ayuda no lo repite.
    if (firstTime) setTutorialActive(true)
  }, [])

  const leaveToHome = useCallback((to: string) => {
    room?.leave()
    clearTicket()
    useNetworkStore.getState().clear()
    useMatchStore.getState().reset()
    navigate(to)
  }, [room, navigate])

  if (!match || !player || !rival) {
    return (
      <div className={styles.battle} data-motion={preferences.reducedMotion ? 'reduced' : 'full'}>
        {(room || rejoining) && (
          <div className={styles.resultBackdrop}>
            <section className={styles.result}>
              <small>Multijugador</small>
              <h2>{rejoining ? 'Volviendo a la sala…' : 'Preparando la partida…'}</h2>
            </section>
          </div>
        )}
      </div>
    )
  }

  const playSelectedWithoutTarget = () => {
    if (!selectedInstance || !selectedCard) return
    if (doAction({ type: 'play-card', playerId: ME, cardInstanceId: selectedInstance.instanceId, target: { kind: 'none' } })) finishSelection()
  }

  const abandonMatch = () => {
    recorder.recordAbandon(match)
    setConfirmAbandon(false)
    leaveToHome('/play')
  }

  const repeat = () => {
    store.reset()
    setMulliganIds([])
    setFavoriteHandIds(new Set())
    setUndoState(undefined)
    setPhotoMode(false)
    ai.reset()
    recorder.reset()
    director.resetBanners()
    // La revancha respeta el rival elegido igual que la primera partida.
    store.startMatch(
      preferences.selectedDeckId,
      forcedSeed,
      preferences.opponentDeckId === 'random' ? undefined : preferences.opponentDeckId,
    )
  }

  const confirmMulligan = () => {
    // El invitado no tiene autoridad sobre la partida: pide el mulligan al
    // anfitrión y espera a que la retransmisión de estado lo refleje.
    if (role === 'guest') {
      sendIntent({ kind: 'mulligan', ids: mulliganIds })
      setMulliganIds([])
      return
    }
    const result = mulliganOpeningHand(match, ME, mulliganIds)
    if (!result.ok) {
      store.setMessage(result.error?.message ?? 'No se pudo completar el mulligan.')
      return
    }
    store.replaceMatch(result.state, mulliganIds.length > 0 ? `Cambias ${mulliganIds.length} cartas de la mano inicial.` : 'Conservas tu mano inicial.')
    setMulliganIds([])
  }

  const confirmScry = () => {
    if (role === 'guest') {
      sendIntent({ kind: 'scry', order: director.scryOrder })
      director.setScryAmount(0)
      director.setScryOrder([])
      return
    }
    const result = reorderTopCards(match, ME, director.scryOrder)
    if (result.ok) {
      store.replaceMatch(result.state, 'Ordenas la parte superior de tu mazo.')
    }
    director.setScryAmount(0)
    director.setScryOrder([])
  }

  const moveScryCard = (instanceId: string, direction: -1 | 1) => {
    director.setScryOrder((current) => {
      const index = current.indexOf(instanceId)
      const swap = index + direction
      if (index < 0 || swap < 0 || swap >= current.length) return current
      const next = [...current]
      next[index] = next[swap]!
      next[swap] = instanceId
      return next
    })
  }

  const devApply = (mutate: (current: MatchState) => MatchState) => {
    store.replaceMatch(mutate(match))
  }

  // La ficha "consultada" manda sobre la propia seleccionada: así se puede
  // asomarse a una pieza rival (o repasar la propia) sin perder la selección
  // de acción que ya tenías en marcha por debajo.
  const activeInfo = viewedBoardCard ?? selectedCard ?? selectedBoardCard
  const viewingForeign = Boolean(viewedPiece && viewedPiece.owner !== ME)
  const canCastDirectly = Boolean(!viewedBoardCard && selectedCard && !isBoardCard(selectedCard) && !requiresPieceTarget(selectedCard))
  const revealedCard = director.revealedCardId ? CARD_BY_ID[director.revealedCardId] : undefined

  /** Estado visual del botón de turno: listo, resolviendo, turno rival o fin. */
  const turnState = match.winner ? 'over' : match.activePlayer !== ME ? 'enemy' : queueBusy ? 'busy' : 'ready'

  const contextStats = viewedPiece && viewedBoardCard
    ? pieceStatLine(viewedPiece, viewedBoardCard)
    : selectedPiece && selectedBoardCard
      ? pieceStatLine(selectedPiece, selectedBoardCard)
      : selectedCard
        ? cardStatLine(selectedCard)
        : undefined

  const actionHint = actionHintFor({
    finished: Boolean(match.winner),
    isMyTurn: match.activePlayer === ME,
    viewedPiece,
    viewingForeign,
    selectedCard,
    canPaySelectedCard: payment?.payable !== false,
    selectedPiece,
    moveCount: moves.length,
    canAttackPiece: attacks.pieceIds.length > 0,
    canAttackNexus: attacks.canAttackNexus,
  })

  return (
    <div className={styles.battle} data-motion={preferences.reducedMotion ? 'reduced' : 'full'}>
      <header className={styles.topbar}>
        <button
          className={styles.exit}
          onClick={() => {
            if (!match.winner) { setConfirmAbandon(true); return }
            room?.leave()
            clearTicket()
            useNetworkStore.getState().clear()
            navigate('/play')
          }}
        >
          ← Abandonar el Santuario
        </button>
        <div className={styles.turn}>
          <strong>{match.activePlayer === ME ? 'Tu turno' : 'Turno rival'}</strong>
          <span>Turno {match.turn} · {PHASE_LABELS[match.phase] ?? match.phase}</span>
        </div>
        <button
          type="button"
          className={styles.enemySummary}
          onClick={() => setEnemyPanelOpen((open) => !open)}
          aria-expanded={enemyPanelOpen}
          title="Ver los datos del rival: vida, esencia, mazo y descarte"
        >
          <div className={styles.enemyStats}>
            <div className={styles.enemyName}>
              {rivalCommander && <FactionSigil faction={rivalCommander.faction} size="small" decorative />}
              <strong>{rivalCommander?.name}</strong>
            </div>
            <div className={styles.enemyChips}>
              <span className={styles.enemyChip} data-kind="mana" title="Esencia disponible del rival">
                ◆ {rivalMana.available}/{rivalMana.total}
              </span>
              <span className={styles.enemyChip} data-kind="hand" title="Cartas en la mano del rival">
                🂠 {rival.hand.length}
              </span>
              <span className={styles.enemyChip} data-kind="deck" title="Cartas en el mazo del rival">
                ▤ {rival.deck.length}
              </span>
            </div>
          </div>
          <div className={styles.nexusOrb} title="Vida del Nexo rival">♥{rival.nexusHealth}</div>
        </button>
      </header>

      {enemyPanelOpen && <EnemyPanel rival={rival} onClose={() => setEnemyPanelOpen(false)} />}

      <div className={styles.arena}>
        <div className={styles.boardFrame}>
          <Board3D
            state={match}
            localPlayerId={ME}
            selectedPieceId={store.selectedPieceId}
            validCells={validCells}
            cellIntent={selectedCard ? 'deploy' : 'move'}
            colorblindMode={preferences.colorblindMode}
            boardTextScale={preferences.boardTextScale}
            validTargets={boardTargets}
            readyPieceIds={readyPieceIds}
            onCell={onCell}
            onPiece={onPiece}
            onNexus={onNexus}
            onCellHover={onCellHover}
            dragging={Boolean(drag.draggingId)}
            onHoverPiece={onHoverPiece}
            onHoverNexus={onHoverNexus}
            attackPreview={attackPreview}
            photoMode={photoMode}
            reducedMotion={preferences.reducedMotion}
            quality={preferences.graphicsQuality}
            scenario={preferences.scenario}
            activeEvent={currentEvent}
            pendingEvents={store.pendingAnimations}
            cursorCell={boardCursor.cell}
          />
          {/* Voz del cursor de teclado para lectores de pantalla: el tablero 3D
              es un lienzo WebGL, así que su contenido no existe como texto. */}
          <p className={styles.srOnly} role="status" aria-live="polite">{boardCursor.announcement}</p>
          {director.banner && <div className={styles.turnBanner} role="status">{director.banner}</div>}
          {director.eventBanner && <div key={director.eventBanner} className={styles.eventBanner} role="status">{director.eventBanner}</div>}
          {queueBusy && pendingCount >= 2 && (
            <button className={styles.skipQueue} onClick={() => store.skipAnimations()}>
              Saltar animaciones ({pendingCount})
            </button>
          )}
          <div className={styles.essencePill} aria-label={`Esencia disponible: ${mana.available} de ${mana.total}`}>
            <span className={styles.essenceSigil} aria-hidden="true">◆</span>
            <strong key={`${mana.available}/${mana.total}`} className={styles.essenceCount}>{mana.available} / {mana.total}</strong>
            <span className={styles.essencePips} aria-hidden="true">
              {player.resources.slice(0, 12).map((resource) => (
                <span
                  key={resource.instanceId}
                  data-faction={resource.faction}
                  data-exhausted={resource.exhausted}
                  data-spend={(payment?.payable && payment.resourceIds.includes(resource.instanceId)) || undefined}
                />
              ))}
            </span>
          </div>
        </div>
        <aside className={styles.leftPanel} data-mobile-open={ownPanelOpenMobile || undefined}>
          <section className={styles.panelSection}>
            <span className={styles.panelLabel}>Comandante</span>
            <div className={styles.commander}>
              <img className={styles.portrait} src={commander ? withBase(commander.art.webp) : undefined} alt="" />
              <div><strong>{commander?.name}</strong><small>{commander?.title}</small></div>
            </div>
            {commander && <p className={styles.commanderRules}>{commander.rules}</p>}
            {player.unitDiscountPending && <p className={styles.commanderBoon}>Pasiva activa: tu siguiente unidad cuesta 1 menos.</p>}
            {/* Poder del comandante: una vez por partida, y la única jugada
                del juego que no sale de una carta. */}
            {power && (
              <button
                type="button"
                className={styles.commanderPower}
                data-aiming={aimingPower || undefined}
                data-used={powerUsed || undefined}
                onClick={() => (aimingPower ? setAimingPower(false) : castPower())}
                disabled={!canUsePower && !aimingPower}
                title={powerUsed ? 'Ya usado en esta partida' : power.description}
              >
                <span className={styles.powerHead}>
                  <strong>{power.name}</strong>
                  <span className={styles.powerCost}>
                    {power.cost.generic > 0 && <span>{power.cost.generic}</span>}
                    {Object.entries(power.cost.colored).map(([faction, amount]) => (
                      <span key={faction} data-faction={faction}>{amount}</span>
                    ))}
                  </span>
                </span>
                <small>
                  {powerUsed
                    ? 'Ya lo has usado en esta partida.'
                    : aimingPower
                      ? 'Elige el objetivo abajo · pulsa para cancelar'
                      : power.description}
                </small>
              </button>
            )}
            {/* Objetivos del poder: se eligen aquí en vez de interceptando el
                clic del tablero, que obligaría a leer estado dentro del
                manejador memoizado que consume la escena 3D. */}
            {aimingPower && power && (
              <div className={styles.powerTargets}>
                {match.board.filter((piece) => piece.owner === RIVAL).map((piece) => (
                  <button
                    key={piece.instanceId}
                    type="button"
                    onClick={() => castPower({ kind: 'piece', pieceId: piece.instanceId })}
                  >
                    {CARD_BY_ID[piece.cardId]?.name ?? 'Unidad'}
                  </button>
                ))}
                {match.board.every((piece) => piece.owner !== RIVAL) && (
                  <p>No hay unidades enemigas a las que apuntar.</p>
                )}
              </div>
            )}
          </section>
          <section className={styles.panelSection}>
            <div className={styles.lifeRow}>
              <span>Vida del Nexo</span>
              <span key={player.nexusHealth} className={styles.life}>♥ {player.nexusHealth}</span>
            </div>
            <div className={styles.deckCounters}>
              <div className={styles.counter}><strong key={player.deck.length}>{player.deck.length}</strong><span>Mazo</span></div>
              <div className={styles.counter}><strong key={player.discard.length}>{player.discard.length}</strong><span>Descarte</span></div>
            </div>
            <p className={styles.essenceNote} title={ESSENCE_LABELS[commander?.faction ?? 'fury']}>
              Esencia: <strong>{mana.available} / {mana.total}</strong>{mana.exhausted > 0 ? ` · ${mana.exhausted} agotadas` : ''}
            </p>
          </section>
          <section className={styles.panelSection}>
            <div className={styles.dailyBattleNote} data-done={daily.done}>
              <span className={styles.dailyBattleBadge}>{daily.done ? '✓' : '◆'}</span>
              <div>
                <small>Reto de hoy</small>
                <strong>{daily.title}</strong>
              </div>
            </div>
          </section>
        </aside>
        <aside className={styles.rightPanel}>
          <SelectionPanel
            card={activeInfo}
            heading={viewedBoardCard ? (viewingForeign ? 'Ficha rival' : 'Consulta') : activeInfo ? 'Selección' : 'Contexto'}
            stats={contextStats}
            hint={actionHint}
            canCast={canCastDirectly && payment?.payable === true}
            onCast={playSelectedWithoutTarget}
          />
          {/* En móvil se oculta: el aviso central de eventos ya anuncia cada
              acción, así que este registro es redundante ahí y solo le quita
              sitio al tablero. En PC se conserva, plegado por defecto. */}
          <div className={styles.historyLogWrap}>
            <HistoryLog entries={store.history} />
          </div>
          <div className={styles.turnDock}>
            {undoState && !room && turnState === 'ready' && (
              <button
                className={styles.undoMove}
                onClick={undoLastMove}
                title="Deshace tu último movimiento. Deja de estar disponible en cuanto haces cualquier otra cosa."
              >
                ↺ Deshacer movimiento
              </button>
            )}
            <button
              ref={endTurnRef}
              className={styles.endTurn}
              data-state={turnState}
              onClick={endTurn}
              disabled={turnState !== 'ready'}
              aria-label="Finalizar turno"
              title={
                turnState === 'enemy' ? 'Espera: la IA está jugando su turno.'
                  : turnState === 'busy' ? 'Espera a que terminen las animaciones en curso.'
                  : turnState === 'over' ? 'La partida ha terminado.'
                  : 'Cede el turno al rival (tecla E). Tus fuentes se recargan al empezar tu próximo turno.'
              }
            >
              {turnState === 'enemy' ? 'Turno rival…' : turnState === 'busy' ? 'Resolviendo…' : turnState === 'over' ? 'Crónica concluida' : 'Finalizar turno'}
            </button>
          </div>
        </aside>
      </div>

      <footer ref={handBarRef} className={styles.handBar} data-tucked={handTucked || undefined}>
        <button
          className={styles.handToggle}
          type="button"
          onClick={() => setHandTucked((current) => !current)}
          aria-pressed={handTucked}
          aria-label={handTucked ? 'Mostrar la mano' : 'Recoger la mano'}
          title={handTucked ? 'Mostrar la mano (tecla H)' : 'Recoger la mano para despejar el tablero (tecla H)'}
        >
          {handTucked ? '▲ Mano' : '▼ Recoger'}
        </button>
        <HandFan
          match={match}
          localPlayerId={ME}
          selectedHandId={store.selectedHandId}
          onSelect={onHandSelect}
          onInspect={inspectCard}
          onDragStart={drag.start}
          draggingId={drag.draggingId}
          favoriteIds={favoriteHandIds}
          onToggleFavorite={toggleFavoriteHand}
        />
        <div className={styles.hints} aria-hidden="true">
          Clic — jugar · Clic derecho o I — inspeccionar · Esc — cancelar · E — fin de turno · H — recoger mano
        </div>
      </footer>

      {drag.draggingId && drag.pointer && selectedCard && (
        <DragGhost
          card={selectedCard}
          pointer={drag.pointer}
          overValidCell={Boolean(hoveredCell && validCells.some((cell) => cell.x === hoveredCell.x && cell.y === hoveredCell.y))}
        />
      )}

      {store.message && <button className={styles.message} onClick={() => store.setMessage(undefined)}>{store.message}</button>}

      {revealedCard && (
        <div className={styles.revealToast} role="status">
          <small>Observas la primera carta de tu mazo</small>
          <strong>{revealedCard.name}</strong>
          <span>{TYPE_LABELS[revealedCard.type]}{revealedCard.subtype ? ` — ${revealedCard.subtype}` : ''}</span>
        </div>
      )}

      {scryOpen && (
        <ScryDialog
          order={director.scryOrder}
          deck={player.deck}
          onMove={moveScryCard}
          onConfirm={confirmScry}
        />
      )}

      {/* Solo visible en móvil (CSS): tu vida y esencia ya se ven en el tablero y
          la píldora inferior, así que el panel propio queda oculto por defecto. */}
      <button
        className={styles.ownPanelToggle}
        type="button"
        onClick={() => setOwnPanelOpenMobile((open) => !open)}
        aria-pressed={ownPanelOpenMobile}
        aria-label={ownPanelOpenMobile ? 'Ocultar tus datos' : 'Ver tus datos: comandante, mazo, descarte y reto de hoy'}
        title={ownPanelOpenMobile ? 'Ocultar tus datos' : 'Ver tus datos: comandante, mazo, descarte y reto de hoy'}
      >
        ⛨
      </button>

      <button
        className={styles.photoModeButton}
        type="button"
        data-active={photoMode || undefined}
        onClick={() => setPhotoMode((current) => !current)}
        aria-pressed={photoMode}
        aria-label={photoMode ? 'Salir del modo foto' : 'Modo foto: cámara libre para admirar el tablero'}
        title={photoMode ? 'Salir del modo foto' : 'Modo foto: cámara libre para admirar el tablero, sin poder jugar mientras está activo'}
      >
        📷
      </button>
      {photoMode && (
        <div className={styles.photoModeHint} role="status">
          Modo foto: mueve la cámara libremente. Pulsa 📷 para volver a jugar.
        </div>
      )}

      <button
        className={styles.helpButton}
        type="button"
        onClick={() => setHowToOpen(true)}
        aria-label="Cómo jugar"
        title="Cómo jugar"
      >
        ?
      </button>

      <button
        className={styles.glossaryButton}
        type="button"
        onClick={() => setGlossaryOpen(true)}
        aria-label="Glosario de términos"
        title="Glosario de términos"
      >
        §
      </button>

      {glossaryOpen && <GlossaryPanel onClose={() => setGlossaryOpen(false)} />}

      {howToOpen && <HowToPlay onClose={closeHowTo} />}

      {confirmAbandon && (
        <div className={styles.resultBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmAbandon(false) }}>
          <section className={styles.abandonDialog} role="alertdialog" aria-modal="true" aria-labelledby="abandon-title">
            <small>Antes de irte</small>
            <h2 id="abandon-title">¿Abandonar esta crónica?</h2>
            <p>Contará como una derrota en tu historial. La partida no se puede retomar después.</p>
            <div className={styles.abandonActions}>
              <button className={styles.abandonCancel} onClick={() => setConfirmAbandon(false)}>Seguir jugando</button>
              <button className={styles.abandonConfirm} onClick={abandonMatch}>Abandonar</button>
            </div>
          </section>
        </div>
      )}

      {/* Dos avisos, no uno: antes cualquier parpadeo de la conexión daba la
          partida por muerta sin margen para volver. Ahora primero se reintenta
          durante un minuto y solo después se ofrece la salida. */}
      {link === 'reconnecting' && (
        <div className={styles.resultBackdrop}>
          <section className={styles.result} role="status">
            <small>Multijugador</small>
            <h2>Reconectando…</h2>
            <p>Se ha perdido el contacto con tu rival. La partida sigue guardada: si vuelve en menos de un minuto, continuaréis donde lo dejasteis.</p>
            <div className={styles.resultActions}>
              <button onClick={() => leaveToHome('/')}>Volver al inicio</button>
            </div>
          </section>
        </div>
      )}

      {peerLeft && (
        <div className={styles.resultBackdrop}>
          <section className={styles.result}>
            <small>Multijugador</small>
            <h2>Tu rival se ha desconectado</h2>
            <p>Ha pasado más de un minuto sin señal suya. La partida no se puede continuar sin él.</p>
            <div className={styles.resultActions}>
              <button onClick={() => leaveToHome('/')}>Volver al inicio</button>
            </div>
          </section>
        </div>
      )}

      {!room && tutorialActive && player.mulliganTaken && !match.winner && (
        <GuidedTutorial
          match={match}
          handBarRef={handBarRef}
          endTurnRef={endTurnRef}
          onFinish={() => setTutorialActive(false)}
        />
      )}

      {canTakeMulligan(match, ME) && !match.winner && (
        <MulliganDialog
          hand={player.hand}
          selectedIds={mulliganIds}
          onToggle={(instanceId) => setMulliganIds((current) =>
            current.includes(instanceId) ? current.filter((id) => id !== instanceId) : [...current, instanceId],
          )}
          onConfirm={confirmMulligan}
        />
      )}

      {inspected && (
        <div className={styles.inspectBackdrop} role="dialog" aria-modal="true" aria-label={`Inspección de ${inspected.name}`} onClick={() => store.inspect(undefined)}>
          <article className={styles.inspect} onClick={(event) => event.stopPropagation()}>
            <img src={withBase(inspected.art.webp)} alt={inspected.art.alt} />
            <div>
              <small>{FACTION_LABELS[inspected.faction]} · {RARITY_LABELS[inspected.rarity]}</small>
              <h2>{inspected.name}</h2>
              <p>{TYPE_LABELS[inspected.type]}{inspected.subtype ? ` — ${inspected.subtype}` : ''}</p>
              <p className={styles.inspectText}>{inspected.rules}</p>
              <p className={styles.flavor}>«{inspected.flavor}»</p>
              <button className={styles.closeInspect} onClick={() => store.inspect(undefined)}>Cerrar · Esc</button>
            </div>
          </article>
        </div>
      )}

      {match.winner && !queueBusy && (
        <MatchResultDialog
          match={match}
          me={ME}
          stats={player.stats}
          elapsedSeconds={store.elapsedSeconds}
          tally={tally}
          daily={daily}
          achievements={recorder.achievements}
          healthHistory={store.healthHistory}
          bestPlay={store.bestPlay}
          isPvp={Boolean(room)}
          isTower={isTowerMatch}
          onTower={() => { store.reset(); navigate('/tower') }}
          rematchSelf={rematchSelf}
          rematchPeer={rematchPeer}
          onRematch={requestRematch}
          onRepeat={repeat}
          onHome={() => leaveToHome('/')}
          onDownloadLog={() => downloadMatchLog({
            match,
            me: ME,
            rival: RIVAL,
            preferences,
            isPvp: Boolean(room),
            dailyChallengeId: daily.done ? daily.id : undefined,
            elapsedSeconds: store.elapsedSeconds,
            log: store.matchLog,
          })}
        />
      )}

      {import.meta.env.DEV && devOpen && !room && (
        <DevPanel
          match={match}
          faction={commander?.faction ?? 'fury'}
          onApply={devApply}
          onForceEndTurn={() => doAction({ type: 'end-turn', playerId: match.activePlayer })}
          onRestart={repeat}
        />
      )}
    </div>
  )
}
