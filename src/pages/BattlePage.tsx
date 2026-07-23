import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  CARD_BY_ID,
  chooseNextAiAction,
  COMMANDER_BY_ID,
  effectiveCost,
  getValidAttacks,
  getValidDeploymentPositions,
  getValidMoves,
  mulliganOpeningHand,
  planManaPayment,
  reorderTopCards,
  STARTER_DECKS,
  summarizeMana,
  type AnimationEvent,
  type CardDefinition,
  type GameAction,
  type MatchState,
  type PlayerId,
  type Position,
} from '../game'
import { Board3D } from '../battle/Board3D'
import { HandFan } from '../battle/ui/HandFan'
import { HistoryLog } from '../battle/ui/HistoryLog'
import { HowToPlay, hasSeenHowTo, markHowToSeen } from '../battle/ui/HowToPlay'
import { GuidedTutorial } from '../battle/ui/GuidedTutorial'
import { Card, formatManaCost } from '../components'
import { playSynthCue, type SoundCue } from '../services/audio'
import { useMatchStore } from '../store/match'
import { usePreferences } from '../store/preferences'
import { summarizeRecords, useRecords } from '../store/records'
import { withBase } from '../utils/assets'
import { FACTION_LABELS, RARITY_LABELS, TYPE_LABELS } from '../utils/cardLabels'
import styles from './BattlePage.module.css'

const requiresPieceTarget = (card: CardDefinition) => card.effects.some((effect) =>
  effect.kind === 'damage' ||
  effect.kind === 'freeze' ||
  effect.kind === 'scorch' ||
  effect.kind === 'refresh-move' ||
  (effect.kind === 'passive' && effect.id === 'target-attack-until-end'),
)
const isBoardCard = (card: CardDefinition) => card.type === 'unit' || card.type === 'structure'

const PHASE_LABELS: Record<string, string> = {
  start: 'Preparación',
  draw: 'Robo',
  main: 'Principal',
  combat: 'Combate',
  end: 'Fin',
  finished: 'Terminada',
}

const BATTLE_KEYWORD_LABELS: Record<string, string> = {
  impulse: 'Impulso',
  'swift-strike': 'Golpe veloz',
  guard: 'Guardia',
  flying: 'Volador',
  channel: 'Canalizar',
  frozen: 'Congelación',
}

const ESSENCE_LABELS: Record<string, string> = {
  fury: 'Esencia Carmesí',
  arcane: 'Esencia Celeste',
  nature: 'Esencia Verde',
  order: 'Esencia Áurea',
  shadow: 'Esencia Umbría',
  void: 'Esencia del Vacío',
}

/** Traduce un evento del motor a su señal sonora. */
const cueForEvent = (event: AnimationEvent): SoundCue | undefined => {
  switch (event.type) {
    case 'draw': return 'draw'
    case 'resource': return 'resource'
    case 'mana-flow': return undefined
    case 'summon': return 'summon'
    case 'spell': return 'spell'
    case 'move': return 'move'
    case 'attack': return 'attack'
    case 'damage': return 'impact'
    case 'nexus-damage': return 'impact'
    case 'shield': return 'shield'
    case 'destroy': return 'destroy'
    case 'freeze': return 'freeze'
    case 'reveal': return 'reveal'
    case 'turn': return 'turn'
    case 'victory': return event.actorId === 'player' ? 'victory' : 'defeat'
    default: return undefined
  }
}

const MAX_AI_STEPS = 72

/**
 * Ritmo de reproducción por tipo de evento: la contabilidad (robos, fuentes,
 * flujo de maná) corre más deprisa que los golpes para que los turnos fluyan
 * sin perder la lectura de las acciones importantes.
 */
const EVENT_PACE: Readonly<Partial<Record<AnimationEvent['type'], number>>> = {
  draw: 0.6,
  resource: 0.6,
  'mana-flow': 0.5,
  reveal: 0.85,
  turn: 0.9,
}

export function BattlePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preferences = usePreferences()
  const store = useMatchStore()
  // «?seed=N» reproduce una partida concreta; sin él cada escaramuza es distinta.
  const forcedSeed = useMemo(() => {
    const raw = searchParams.get('seed')
    if (raw === null) return undefined
    const parsed = Number.parseInt(raw, 10)
    return Number.isFinite(parsed) ? parsed >>> 0 : undefined
  }, [searchParams])
  const [mulliganIds, setMulliganIds] = useState<readonly string[]>([])
  const [scryAmount, setScryAmount] = useState(0)
  const [scryOrder, setScryOrder] = useState<readonly string[]>([])
  const [revealedCardId, setRevealedCardId] = useState<string>()
  const [banner, setBanner] = useState<string>()
  const [devOpen, setDevOpen] = useState(false)
  const [howToOpen, setHowToOpen] = useState(() => !hasSeenHowTo())
  /** Coach interactivo de la primera partida: arranca solo tras cerrar la guía la primerísima vez. */
  const [tutorialActive, setTutorialActive] = useState(false)
  const handBarRef = useRef<HTMLElement>(null)
  const endTurnRef = useRef<HTMLButtonElement>(null)
  /** Mano recogida: despeja el tablero; al soltar el botón vuelve a subir. */
  const [handTucked, setHandTucked] = useState(false)
  const [confirmAbandon, setConfirmAbandon] = useState(false)
  const aiSteps = useRef(0)
  const aiSkipped = useRef(new Set<string>())
  /** Semilla de la última partida ya anotada, para no duplicar el registro entre renders. */
  const recordedSeed = useRef<number | undefined>(undefined)

  const match = store.match
  const currentEvent = store.currentEvent
  const pendingCount = store.pendingAnimations.length
  const queueBusy = Boolean(currentEvent) || pendingCount > 0
  const scryOpen = scryAmount > 0

  useEffect(() => {
    // Crea partida nueva si no hay ninguna o si la que persiste en el store no
    // corresponde al mazo elegido. Sin la segunda condición, la primera facción
    // con la que se juega quedaba fija al volver a entrar con otra distinta.
    const selectedDeck = STARTER_DECKS.find((deck) => deck.id === preferences.selectedDeckId)
    const matchesSelection = Boolean(
      store.match && selectedDeck && store.match.players.player.commanderId === selectedDeck.commanderId,
    )
    if (!matchesSelection) {
      useMatchStore.getState().startMatch(preferences.selectedDeckId, forcedSeed)
    }
  }, [preferences.selectedDeckId, store.match, forcedSeed])

  // ── Director de animaciones ────────────────────────────────────────────────
  // 1) Si no hay evento en reproducción, avanza la cola.
  useEffect(() => {
    if (!currentEvent && pendingCount > 0) {
      useMatchStore.getState().advanceEvent()
    }
  }, [currentEvent, pendingCount])

  // 2) Reproduce el evento actual: sonido, canales laterales y temporización.
  useEffect(() => {
    if (!currentEvent) return
    const state = useMatchStore.getState()
    const cue = cueForEvent(currentEvent)
    if (cue && !preferences.muted) {
      playSynthCue(cue, preferences.masterVolume * preferences.effectsVolume)
    }
    // Los canales laterales actualizan estado de React fuera del cuerpo del
    // efecto para no encadenar renders síncronos.
    const sideChannel = window.setTimeout(() => {
      if (currentEvent.type === 'turn') {
        setBanner(currentEvent.actorId === 'player' ? 'Tu turno' : 'Turno rival')
      }
      if (currentEvent.type === 'spell' && currentEvent.effectId === 'scry-top-cards' && currentEvent.actorId === 'player') {
        const amount = Math.min(currentEvent.amount ?? 1, state.match?.players.player.deck.length ?? 0)
        if (amount > 0) {
          setScryAmount(amount)
          setScryOrder(state.match?.players.player.deck.slice(0, amount).map((card) => card.instanceId) ?? [])
        }
      }
      if (currentEvent.type === 'reveal' && currentEvent.actorId === 'player') {
        const revealed = state.match?.players.player.deck.find((card) => card.instanceId === currentEvent.targetId)
        if (revealed) setRevealedCardId(revealed.cardId)
      }
    }, 0)
    const pace = EVENT_PACE[currentEvent.type] ?? 1
    const duration = preferences.reducedMotion
      ? 40
      : Math.max(70, (currentEvent.durationMs * pace) / preferences.animationSpeed)
    const timer = window.setTimeout(() => useMatchStore.getState().finishEvent(), duration)
    return () => {
      window.clearTimeout(sideChannel)
      window.clearTimeout(timer)
    }
  }, [currentEvent, preferences.animationSpeed, preferences.effectsVolume, preferences.masterVolume, preferences.muted, preferences.reducedMotion])

  useEffect(() => {
    if (!banner) return
    const timer = window.setTimeout(() => setBanner(undefined), 1400)
    return () => window.clearTimeout(timer)
  }, [banner])

  // ── Historial: anota la partida una sola vez, al terminar de reproducirse ──
  useEffect(() => {
    const finished = store.match
    if (!finished?.winner || queueBusy) return
    if (recordedSeed.current === finished.seed) return
    recordedSeed.current = finished.seed
    const playerState = finished.players.player
    const playerDeck = STARTER_DECKS.find((deck) => deck.commanderId === playerState.commanderId)
    const opponentDeck = STARTER_DECKS.find((deck) => deck.commanderId === finished.players.ai.commanderId)
    useRecords.getState().addRecord({
      finishedAt: Date.now(),
      deckId: playerDeck?.id ?? preferences.selectedDeckId,
      deckName: playerDeck?.name ?? 'Mazo desconocido',
      commanderName: COMMANDER_BY_ID[playerState.commanderId]?.name ?? '—',
      opponentDeckName: opponentDeck?.name ?? 'Rival desconocido',
      won: finished.winner === 'player',
      turns: finished.turn,
      seconds: store.elapsedSeconds,
      damageDealt: playerState.stats.damageDealt,
      seed: finished.seed,
    })
  }, [store.match, queueBusy, store.elapsedSeconds, preferences.selectedDeckId])

  useEffect(() => {
    if (!revealedCardId) return
    const timer = window.setTimeout(() => setRevealedCardId(undefined), 2600)
    return () => window.clearTimeout(timer)
  }, [revealedCardId])

  // ── Turno de la IA, paso a paso ───────────────────────────────────────────
  useEffect(() => {
    const current = useMatchStore.getState().match
    if (!current || current.activePlayer !== 'ai' || current.winner || queueBusy || scryOpen) return
    const timer = window.setTimeout(() => {
      const stateNow = useMatchStore.getState()
      const matchNow = stateNow.match
      if (!matchNow || matchNow.activePlayer !== 'ai' || matchNow.winner) return
      if (stateNow.currentEvent || stateNow.pendingAnimations.length > 0) return
      stateNow.setAiThinking(true)
      const action: GameAction =
        aiSteps.current >= MAX_AI_STEPS
          ? { type: 'end-turn', playerId: 'ai' }
          : chooseNextAiAction(matchNow, aiSkipped.current, preferences.aiDifficulty)
      const ok = stateNow.dispatch(action)
      if (!ok) {
        stateNow.setMessage(undefined)
        if (action.type === 'play-card' || action.type === 'play-resource') {
          aiSkipped.current.add(action.cardInstanceId)
        } else {
          const forced = stateNow.dispatch({ type: 'end-turn', playerId: 'ai' })
          if (!forced) stateNow.setMessage(undefined)
        }
      }
      aiSteps.current += 1
      if (action.type === 'end-turn') {
        aiSteps.current = 0
        aiSkipped.current = new Set()
      }
      stateNow.setAiThinking(false)
    }, Math.max(140, preferences.aiDelayMs / 3))
    return () => window.clearTimeout(timer)
  }, [match?.activePlayer, match?.turn, match?.winner, queueBusy, scryOpen, preferences.aiDelayMs, preferences.aiDifficulty, pendingCount])

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
        const hand = current?.players.player.hand.find((card) => card.instanceId === store.selectedHandId)
        const piece = current?.board.find((card) => card.instanceId === store.selectedPieceId)
        store.inspect(hand?.cardId ?? piece?.cardId)
      }
    }
    window.addEventListener('keydown', cancel)
    return () => window.removeEventListener('keydown', cancel)
  }, [store])

  const player = match?.players.player
  const ai = match?.players.ai
  const selectedInstance = player?.hand.find((instance) => instance.instanceId === store.selectedHandId)
  const selectedCard = selectedInstance ? CARD_BY_ID[selectedInstance.cardId] : undefined
  const selectedPiece = match?.board.find((piece) => piece.instanceId === store.selectedPieceId)
  const selectedBoardCard = selectedPiece ? CARD_BY_ID[selectedPiece.cardId] : undefined
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
    if (!match || !selectedCard || !isBoardCard(selectedCard) || match.activePlayer !== 'player') return []
    if (!planManaPayment(match.players.player.resources, effectiveCost(match, 'player', selectedCard)).payable) return []
    return [...getValidDeploymentPositions(match, 'player')]
  }, [match, selectedCard])
  const validCells = selectedCard ? deployCells : moves
  const mana = summarizeMana(player?.resources ?? [])
  const payment = match && selectedCard
    ? planManaPayment(player?.resources ?? [], effectiveCost(match, 'player', selectedCard))
    : undefined
  const commander = player ? COMMANDER_BY_ID[player.commanderId] : undefined
  const aiCommander = ai ? COMMANDER_BY_ID[ai.commanderId] : undefined
  const inspected = store.inspectedCardId ? CARD_BY_ID[store.inspectedCardId] : undefined
  const storedRecords = useRecords((state) => state.records)
  const tally = useMemo(() => summarizeRecords(storedRecords), [storedRecords])
  const spellTargets = useMemo(() => {
    if (!match || !selectedCard || !requiresPieceTarget(selectedCard)) return []
    const friendlyOnly = selectedCard.effects.some((effect) =>
      effect.kind === 'refresh-move' ||
      (effect.kind === 'passive' && effect.id === 'target-attack-until-end'))
    const enemyOnly = selectedCard.effects.some((effect) => effect.kind === 'damage' && effect.target === 'enemy-piece')
    const unitsOnly = selectedCard.effects.some((effect) => effect.kind === 'freeze' || effect.kind === 'refresh-move') || selectedCard.id === 'lluvia-ceniza'
    return match.board.filter((piece) => {
      const definition = CARD_BY_ID[piece.cardId]
      if (unitsOnly && definition?.type !== 'unit') return false
      if (friendlyOnly) return piece.owner === 'player'
      if (enemyOnly) return piece.owner === 'ai'
      return true
    }).map((piece) => piece.instanceId)
  }, [match, selectedCard])

  const boardTargets = useMemo(() => {
    const base = selectedCard ? spellTargets : attacks.pieceIds
    return attacks.canAttackNexus && !selectedCard ? [...base, 'ai-nexus'] : base
  }, [selectedCard, spellTargets, attacks])

  // Unidades propias que aún pueden mover o atacar: reciben un anillo de
  // disponibilidad en el tablero. Se recalcula solo cuando cambia la partida.
  const readyPieceIds = useMemo(() => {
    const ready = new Set<string>()
    if (!match || match.activePlayer !== 'player' || match.winner) return ready
    for (const piece of match.board) {
      if (piece.owner !== 'player') continue
      if (CARD_BY_ID[piece.cardId]?.type !== 'unit') continue
      if (getValidMoves(match, piece.instanceId).length > 0) {
        ready.add(piece.instanceId)
        continue
      }
      const options = getValidAttacks(match, piece.instanceId)
      if (options.pieceIds.length > 0 || options.canAttackNexus) ready.add(piece.instanceId)
    }
    return ready
  }, [match])

  // Handlers estables (useCallback): permiten memoizar las celdas y cartas del
  // tablero 3D para que la reproducción de eventos no re-renderice el canvas.
  const doAction = useCallback((action: GameAction) => useMatchStore.getState().dispatch(action), [])
  const finishSelection = useCallback(() => {
    const state = useMatchStore.getState()
    state.selectHand(undefined)
    state.selectPiece(undefined)
  }, [])

  const onHandSelect = useCallback((instanceId: string) => {
    if (!match || !player) return
    if (match.activePlayer !== 'player' || match.winner || queueBusy) return
    const instance = player.hand.find((candidate) => candidate.instanceId === instanceId)
    const card = instance ? CARD_BY_ID[instance.cardId] : undefined
    if (!instance || !card) return
    if (card.type === 'mana') {
      if (doAction({ type: 'play-resource', playerId: 'player', cardInstanceId: instanceId })) finishSelection()
      return
    }
    useMatchStore.getState().selectHand(store.selectedHandId === instanceId ? undefined : instanceId)
  }, [match, player, queueBusy, store.selectedHandId, doAction, finishSelection])

  const inspectCard = useCallback((cardId?: string) => useMatchStore.getState().inspect(cardId), [])

  const onCell = useCallback((position: Position) => {
    if (selectedInstance && selectedCard && isBoardCard(selectedCard)) {
      if (doAction({ type: 'play-card', playerId: 'player', cardInstanceId: selectedInstance.instanceId, position, target: { kind: 'none' } })) finishSelection()
      return
    }
    if (selectedPiece && moves.some((cell) => cell.x === position.x && cell.y === position.y)) {
      if (doAction({ type: 'move', playerId: 'player', pieceId: selectedPiece.instanceId, to: position })) finishSelection()
    }
  }, [selectedInstance, selectedCard, selectedPiece, moves, doAction, finishSelection])

  const onPiece = useCallback((pieceId: string) => {
    if (!match) return
    const piece = match.board.find((candidate) => candidate.instanceId === pieceId)
    if (!piece || match.activePlayer !== 'player') return
    if (selectedInstance && selectedCard && !isBoardCard(selectedCard)) {
      if (doAction({ type: 'play-card', playerId: 'player', cardInstanceId: selectedInstance.instanceId, target: { kind: 'piece', pieceId } })) finishSelection()
      return
    }
    if (selectedPiece && attacks.pieceIds.includes(pieceId)) {
      if (doAction({ type: 'attack-piece', playerId: 'player', attackerId: selectedPiece.instanceId, defenderId: pieceId })) finishSelection()
      return
    }
    const state = useMatchStore.getState()
    if (piece.owner === 'player') state.selectPiece(state.selectedPieceId === pieceId ? undefined : pieceId)
    else state.inspect(piece.cardId)
  }, [match, selectedInstance, selectedCard, selectedPiece, attacks, doAction, finishSelection])

  const onNexus = useCallback((playerId: PlayerId) => {
    if (playerId === 'ai' && selectedPiece && attacks.canAttackNexus) {
      if (doAction({ type: 'attack-nexus', playerId: 'player', attackerId: selectedPiece.instanceId })) finishSelection()
    }
  }, [selectedPiece, attacks, doAction, finishSelection])

  const endTurn = useCallback(() => {
    if (doAction({ type: 'end-turn', playerId: 'player' })) finishSelection()
  }, [doAction, finishSelection])

  const closeHowTo = useCallback(() => {
    const firstTime = !hasSeenHowTo()
    markHowToSeen()
    setHowToOpen(false)
    // El coach interactivo solo arranca la primerísima vez, justo tras la
    // guía de bienvenida; reabrir la guía luego con el botón de ayuda no lo repite.
    if (firstTime) setTutorialActive(true)
  }, [])

  if (!match || !player || !ai) return <div className={styles.battle} data-motion={preferences.reducedMotion ? 'reduced' : 'full'} />

  const playSelectedWithoutTarget = () => {
    if (!selectedInstance || !selectedCard) return
    if (doAction({ type: 'play-card', playerId: 'player', cardInstanceId: selectedInstance.instanceId, target: { kind: 'none' } })) finishSelection()
  }

  const abandonMatch = () => {
    // Abandonar cuenta como derrota: sin esto se podía esquivar una derrota
    // segura saliendo a mitad de partida, y el historial quedaba mintiendo.
    if (!match.winner) {
      const playerState = match.players.player
      const playerDeck = STARTER_DECKS.find((deck) => deck.commanderId === playerState.commanderId)
      const opponentDeck = STARTER_DECKS.find((deck) => deck.commanderId === match.players.ai.commanderId)
      useRecords.getState().addRecord({
        finishedAt: Date.now(),
        deckId: playerDeck?.id ?? preferences.selectedDeckId,
        deckName: playerDeck?.name ?? 'Mazo desconocido',
        commanderName: COMMANDER_BY_ID[playerState.commanderId]?.name ?? '—',
        opponentDeckName: opponentDeck?.name ?? 'Rival desconocido',
        won: false,
        turns: match.turn,
        seconds: Math.max(1, Math.round((Date.now() - store.startedAtMs) / 1000)),
        damageDealt: playerState.stats.damageDealt,
        seed: match.seed,
      })
    }
    store.reset()
    setConfirmAbandon(false)
    navigate('/play')
  }

  const repeat = () => {
    store.reset()
    setMulliganIds([])
    aiSteps.current = 0
    aiSkipped.current = new Set()
    // Con «?seed=N» la revancha repite semilla: sin esto la nueva partida no se anotaría.
    recordedSeed.current = undefined
    store.startMatch(preferences.selectedDeckId, forcedSeed)
  }

  const confirmMulligan = () => {
    const result = mulliganOpeningHand(match, 'player', mulliganIds)
    if (!result.ok) {
      store.setMessage(result.error?.message ?? 'No se pudo completar el mulligan.')
      return
    }
    store.replaceMatch(result.state, mulliganIds.length > 0 ? `Cambias ${mulliganIds.length} cartas de la mano inicial.` : 'Conservas tu mano inicial.')
    setMulliganIds([])
  }

  const confirmScry = () => {
    const result = reorderTopCards(match, 'player', scryOrder)
    if (result.ok) {
      store.replaceMatch(result.state, 'Ordenas la parte superior de tu mazo.')
    }
    setScryAmount(0)
    setScryOrder([])
  }

  const moveScryCard = (instanceId: string, direction: -1 | 1) => {
    setScryOrder((current) => {
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

  const activeInfo = selectedCard ?? selectedBoardCard
  const canCastDirectly = selectedCard && !isBoardCard(selectedCard) && !requiresPieceTarget(selectedCard)
  const revealedCard = revealedCardId ? CARD_BY_ID[revealedCardId] : undefined

  /** Estado visual del botón de turno: listo, resolviendo, turno rival o fin. */
  const turnState = match.winner ? 'over' : match.activePlayer !== 'player' ? 'enemy' : queueBusy ? 'busy' : 'ready'

  /** Línea compacta de estadísticas de la carta o unidad seleccionada. */
  const contextStats = (() => {
    const parts: string[] = []
    if (selectedPiece && selectedBoardCard) {
      if (selectedBoardCard.attack !== undefined) parts.push(`ATQ ${Math.max(0, selectedBoardCard.attack + selectedPiece.attackModifier)}`)
      parts.push(`VID ${selectedPiece.currentHealth}`)
      if (selectedBoardCard.range !== undefined) parts.push(`ALC ${selectedBoardCard.range}`)
      if (selectedBoardCard.movement !== undefined) parts.push(`MOV ${selectedBoardCard.movement}`)
    } else if (selectedCard) {
      if (selectedCard.attack !== undefined) parts.push(`ATQ ${selectedCard.attack}`)
      if (selectedCard.health !== undefined) parts.push(`VID ${selectedCard.health}`)
      if (selectedCard.resistance !== undefined) parts.push(`RES ${selectedCard.resistance}`)
      if (selectedCard.range !== undefined) parts.push(`ALC ${selectedCard.range}`)
      if (selectedCard.movement !== undefined) parts.push(`MOV ${selectedCard.movement}`)
    }
    return parts.length > 0 ? parts.join(' · ') : undefined
  })()

  /** Guía inmediata: qué puede hacer el jugador con la selección actual. */
  const actionHint = (() => {
    if (match.winner) return undefined
    if (match.activePlayer !== 'player') return 'Turno rival: observa sus movimientos.'
    if (selectedCard) {
      if (payment && !payment.payable) return 'No tienes Esencia suficiente para esta carta.'
      if (isBoardCard(selectedCard)) return 'Elige una casilla iluminada en azul para desplegar.'
      if (requiresPieceTarget(selectedCard)) return 'Selecciona un objetivo resaltado en dorado.'
      return 'Pulsa «Resolver carta» para lanzarla.'
    }
    if (selectedPiece) {
      const frozen = selectedPiece.statuses.some((status) => status.kind === 'frozen')
      if (frozen) return 'Unidad congelada: no puede actuar este turno.'
      const canMove = moves.length > 0
      const canAttack = attacks.pieceIds.length > 0 || attacks.canAttackNexus
      if (canMove && canAttack) return 'Casillas azules: mover · Objetivos dorados: atacar.'
      if (canMove) return 'Elige una casilla azul para mover.'
      if (canAttack) return 'Elige un objetivo dorado para atacar.'
      if (selectedPiece.movedThisTurn || selectedPiece.attackedThisTurn) return 'Esta unidad ya ha agotado sus acciones este turno.'
      return 'Esta unidad no tiene acciones disponibles ahora mismo.'
    }
    return 'Selecciona una carta de tu mano o una unidad aliada.'
  })()

  return (
    <div className={styles.battle} data-motion={preferences.reducedMotion ? 'reduced' : 'full'}>
      <header className={styles.topbar}>
        <button className={styles.exit} onClick={() => (match.winner ? navigate('/play') : setConfirmAbandon(true))}>← Abandonar el Santuario</button>
        <div className={styles.turn}>
          <strong>{match.activePlayer === 'player' ? 'Tu turno' : 'Turno rival'}</strong>
          <span>Turno {match.turn} · {PHASE_LABELS[match.phase] ?? match.phase}</span>
        </div>
        <div className={styles.enemySummary}>
          <div><strong>{aiCommander?.name}</strong><span>{ai.hand.length} cartas · {ai.deck.length} en mazo</span></div>
          <div className={styles.nexusOrb}>{ai.nexusHealth}</div>
        </div>
      </header>

      <div className={styles.arena}>
        <div className={styles.boardFrame}>
          <Board3D
            state={match}
            selectedPieceId={store.selectedPieceId}
            validCells={validCells}
            validTargets={boardTargets}
            readyPieceIds={readyPieceIds}
            onCell={onCell}
            onPiece={onPiece}
            onNexus={onNexus}
            reducedMotion={preferences.reducedMotion}
            quality={preferences.graphicsQuality}
            scenario={preferences.scenario}
            activeEvent={currentEvent}
          />
          {banner && <div className={styles.turnBanner} role="status">{banner}</div>}
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
        <aside className={styles.leftPanel}>
          <section className={styles.panelSection}>
            <span className={styles.panelLabel}>Comandante</span>
            <div className={styles.commander}>
              <img className={styles.portrait} src={commander ? withBase(commander.art.webp) : undefined} alt="" />
              <div><strong>{commander?.name}</strong><small>{commander?.title}</small></div>
            </div>
            {commander && <p className={styles.commanderRules}>{commander.rules}</p>}
            {player.unitDiscountPending && <p className={styles.commanderBoon}>Pasiva activa: tu siguiente unidad cuesta 1 menos.</p>}
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
        </aside>
        <aside className={styles.rightPanel}>
          <section className={`${styles.panelSection} ${styles.context}`}>
            <span className={styles.panelLabel}>{activeInfo ? 'Selección' : 'Contexto'}</span>
            {activeInfo ? (
              <>
                <div className={styles.contextArt}>
                  <img src={withBase(activeInfo.art.webp)} alt="" loading="lazy" />
                </div>
                <h3>{activeInfo.name}</h3>
                <p className={styles.contextType}>
                  {FACTION_LABELS[activeInfo.faction]} · {TYPE_LABELS[activeInfo.type]}{activeInfo.subtype ? ` — ${activeInfo.subtype}` : ''} · {RARITY_LABELS[activeInfo.rarity]}
                </p>
                <p className={styles.contextCost}>Coste: {formatManaCost(activeInfo.cost)}</p>
                {contextStats && <p className={styles.contextStats}>{contextStats}</p>}
                <p className={styles.contextRules}>{activeInfo.rules}</p>
                {activeInfo.keywords.length > 0 && (
                  <div className={styles.contextKeywords}>
                    {activeInfo.keywords.map((keyword) => (
                      <span key={keyword}>{BATTLE_KEYWORD_LABELS[keyword] ?? keyword}</span>
                    ))}
                  </div>
                )}
                <p className={styles.contextFlavor}>«{activeInfo.flavor}»</p>
              </>
            ) : (
              <h3>Sin selección</h3>
            )}
            {actionHint && (
              <p key={actionHint} className={styles.actionHint} data-warning={actionHint.startsWith('No tienes') || undefined} role="status">
                {actionHint}
              </p>
            )}
            {canCastDirectly && payment?.payable && (
              <button className={styles.cast} onClick={playSelectedWithoutTarget} title="Lanza este hechizo, que no necesita objetivo en el tablero.">Resolver carta</button>
            )}
          </section>
          <HistoryLog entries={store.history} />
          <div className={styles.turnDock}>
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
                  : 'Cede el turno al rival. Tus fuentes se recargan al empezar tu próximo turno.'
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
          title={handTucked ? 'Mostrar la mano' : 'Recoger la mano para despejar el tablero'}
        >
          {handTucked ? '▲ Mano' : '▼ Recoger'}
        </button>
        <HandFan match={match} selectedHandId={store.selectedHandId} onSelect={onHandSelect} onInspect={inspectCard} />
        <div className={styles.hints} aria-hidden="true">
          Clic — jugar · Clic derecho o I — inspeccionar · Esc — cancelar
        </div>
      </footer>

      {store.message && <button className={styles.message} onClick={() => store.setMessage(undefined)}>{store.message}</button>}

      {revealedCard && (
        <div className={styles.revealToast} role="status">
          <small>Observas la primera carta de tu mazo</small>
          <strong>{revealedCard.name}</strong>
          <span>{TYPE_LABELS[revealedCard.type]}{revealedCard.subtype ? ` — ${revealedCard.subtype}` : ''}</span>
        </div>
      )}

      {scryOpen && (
        <div className={styles.resultBackdrop}>
          <section className={styles.scry} role="dialog" aria-modal="true" aria-label="Observar el mazo">
            <small>Escrutinio</small>
            <h2>Ordena la parte superior de tu mazo</h2>
            <p>La primera carta de la lista será la próxima que robes.</p>
            <div className={styles.scryCards}>
              {scryOrder.map((instanceId, index) => {
                const instance = match.players.player.deck.find((card) => card.instanceId === instanceId)
                const card = instance ? CARD_BY_ID[instance.cardId] : undefined
                if (!card) return null
                return (
                  <div key={instanceId} className={styles.scryCard}>
                    <span className={styles.scryPosition}>{index + 1}ª</span>
                    <Card card={card} size="thumbnail" />
                    <div className={styles.scryControls}>
                      <button onClick={() => moveScryCard(instanceId, -1)} disabled={index === 0} aria-label="Subir">↑</button>
                      <button onClick={() => moveScryCard(instanceId, 1)} disabled={index === scryOrder.length - 1} aria-label="Bajar">↓</button>
                    </div>
                  </div>
                )
              })}
            </div>
            <button className={styles.confirmMulligan} onClick={confirmScry}>Confirmar orden</button>
          </section>
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

      {tutorialActive && player.mulliganTaken && !match.winner && (
        <GuidedTutorial
          match={match}
          handBarRef={handBarRef}
          endTurnRef={endTurnRef}
          onFinish={() => setTutorialActive(false)}
        />
      )}

      {!player.mulliganTaken && match.turn === 1 && !match.winner && (
        <div className={styles.resultBackdrop}>
          <section className={styles.mulligan}>
            <small>Preparación de la crónica</small>
            <h2>Tu mano inicial</h2>
            <p>
              El <strong>mulligan</strong> te deja cambiar cartas de tu mano de salida una sola vez:
              marca las que no te convenzan y roba otras tantas nuevas.
            </p>
            {(() => {
              const fuentes = player.hand.filter((instance) => CARD_BY_ID[instance.cardId]?.type === 'mana').length
              const equilibrada = fuentes >= 2 && fuentes <= 4
              return (
                <p className={styles.mulliganHint} data-ok={equilibrada}>
                  Tienes <strong>{fuentes}</strong> {fuentes === 1 ? 'fuente' : 'fuentes'} de Esencia en la mano.
                  {equilibrada
                    ? ' Es un buen arranque para desplegar cartas pronto.'
                    : fuentes < 2
                      ? ' Con menos de dos te costará pagar tus cartas: valora cambiar alguna.'
                      : ' Demasiadas fuentes y pocas jugadas: valora cambiar alguna.'}
                </p>
              )
            })()}
            <div className={styles.mulliganCards}>
              {player.hand.map((instance) => {
                const card = CARD_BY_ID[instance.cardId]
                if (!card) return null
                const selected = mulliganIds.includes(instance.instanceId)
                return (
                  <button
                    key={instance.instanceId}
                    className={styles.mulliganCard}
                    data-selected={selected}
                    aria-pressed={selected}
                    onClick={() => setMulliganIds((current) => current.includes(instance.instanceId) ? current.filter((id) => id !== instance.instanceId) : [...current, instance.instanceId])}
                  >
                    <img src={withBase(card.art.webp)} alt="" />
                    <strong>{card.name}</strong>
                    <span>{selected ? 'Cambiar' : 'Conservar'}</span>
                  </button>
                )
              })}
            </div>
            <button className={styles.confirmMulligan} onClick={confirmMulligan}>
              {mulliganIds.length > 0 ? `Cambiar ${mulliganIds.length} cartas` : 'Conservar las cinco'}
            </button>
          </section>
        </div>
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
        <div className={styles.resultBackdrop}>
          <section className={styles.result}>
            <small>La crónica ha concluido</small>
            <h2>{match.winner === 'player' ? 'Victoria' : 'Derrota'}</h2>
            <p>{match.winner === 'player' ? 'El Nexo rival se quiebra bajo tu voluntad.' : 'Tu Nexo se desvanece. La siguiente crónica aún puede cambiar.'}</p>
            <div className={styles.resultStats}>
              <div><strong>{match.turn}</strong><span>Turnos</span></div>
              <div><strong>{store.elapsedSeconds}s</strong><span>Duración</span></div>
              <div><strong>{player.stats.damageDealt}</strong><span>Daño</span></div>
              <div><strong>{player.stats.cardsPlayed}</strong><span>Jugadas</span></div>
            </div>
            {tally.played > 1 && (
              <p className={styles.resultTally}>
                Llevas <strong>{tally.won}</strong> {tally.won === 1 ? 'victoria' : 'victorias'} de <strong>{tally.played}</strong> escaramuzas · {tally.winRate}%
              </p>
            )}
            <div className={styles.resultActions}>
              <button onClick={repeat}>Repetir</button>
              <Link to="/">Volver al inicio</Link>
            </div>
          </section>
        </div>
      )}

      {import.meta.env.DEV && devOpen && (
        <section className={styles.devPanel} aria-label="Modo desarrollador">
          <strong>Modo desarrollador</strong>
          <button onClick={() => devApply((current) => ({
            ...current,
            players: {
              ...current.players,
              player: {
                ...current.players.player,
                resources: [
                  ...current.players.player.resources,
                  {
                    instanceId: `dev-essence-${Date.now()}`,
                    cardId: commander?.faction === 'arcane' ? 'fuente-arcana' : 'fuente-furia',
                    faction: commander?.faction ?? 'fury',
                    exhausted: false,
                  },
                ],
              },
            },
          }))}>+1 Esencia</button>
          <button onClick={() => devApply((current) => {
            const top = current.players.player.deck[0]
            if (!top) return current
            return {
              ...current,
              players: {
                ...current.players,
                player: {
                  ...current.players.player,
                  deck: current.players.player.deck.slice(1),
                  hand: [...current.players.player.hand, top],
                },
              },
            }
          })}>Robar carta</button>
          <button onClick={() => devApply((current) => {
            const health = Math.max(0, current.players.ai.nexusHealth - 5)
            return {
              ...current,
              players: { ...current.players, ai: { ...current.players.ai, nexusHealth: health } },
              ...(health === 0 ? { winner: 'player' as const, phase: 'finished' as const } : {}),
            }
          })}>-5 al Nexo rival</button>
          <button onClick={() => doAction({ type: 'end-turn', playerId: match.activePlayer })}>Forzar fin de turno</button>
          <button onClick={repeat}>Reiniciar partida</button>
          <button onClick={() => console.info('MatchState', match)}>Volcar estado</button>
        </section>
      )}
    </div>
  )
}
