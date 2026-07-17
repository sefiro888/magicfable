import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  summarizeMana,
  type AnimationEvent,
  type CardDefinition,
  type GameAction,
  type MatchState,
  type PlayerId,
  type Position,
} from '../game'
import { Board3D } from '../battle/Board3D'
import { Card } from '../components'
import { playSynthCue, type SoundCue } from '../services/audio'
import { useMatchStore } from '../store/match'
import { usePreferences } from '../store/preferences'
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

export function BattlePage() {
  const navigate = useNavigate()
  const preferences = usePreferences()
  const store = useMatchStore()
  const [mulliganIds, setMulliganIds] = useState<readonly string[]>([])
  const [scryAmount, setScryAmount] = useState(0)
  const [scryOrder, setScryOrder] = useState<readonly string[]>([])
  const [revealedCardId, setRevealedCardId] = useState<string>()
  const [banner, setBanner] = useState<string>()
  const [devOpen, setDevOpen] = useState(false)
  const aiSteps = useRef(0)
  const aiSkipped = useRef(new Set<string>())

  const match = store.match
  const currentEvent = store.currentEvent
  const pendingCount = store.pendingAnimations.length
  const queueBusy = Boolean(currentEvent) || pendingCount > 0
  const scryOpen = scryAmount > 0

  useEffect(() => {
    if (!store.match) {
      useMatchStore.getState().startMatch(preferences.selectedDeckId)
    }
  }, [preferences.selectedDeckId, store.match])

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
    const duration = preferences.reducedMotion
      ? 40
      : Math.max(80, currentEvent.durationMs / preferences.animationSpeed)
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
          : chooseNextAiAction(matchNow, aiSkipped.current)
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
    }, Math.max(160, preferences.aiDelayMs / 2))
    return () => window.clearTimeout(timer)
  }, [match?.activePlayer, match?.turn, match?.winner, queueBusy, scryOpen, preferences.aiDelayMs, pendingCount])

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
  const moves = match && selectedPiece ? getValidMoves(match, selectedPiece.instanceId) : []
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

  if (!match || !player || !ai) return <div className={styles.battle} />

  const doAction = (action: GameAction) => store.dispatch(action)
  const finishSelection = () => { store.selectHand(undefined); store.selectPiece(undefined) }

  const playSelectedWithoutTarget = () => {
    if (!selectedInstance || !selectedCard) return
    if (doAction({ type: 'play-card', playerId: 'player', cardInstanceId: selectedInstance.instanceId, target: { kind: 'none' } })) finishSelection()
  }

  const onHandSelect = (instanceId: string) => {
    if (match.activePlayer !== 'player' || match.winner || queueBusy) return
    const instance = player.hand.find((candidate) => candidate.instanceId === instanceId)
    const card = instance ? CARD_BY_ID[instance.cardId] : undefined
    if (!instance || !card) return
    if (card.type === 'mana') {
      if (doAction({ type: 'play-resource', playerId: 'player', cardInstanceId: instanceId })) finishSelection()
      return
    }
    store.selectHand(store.selectedHandId === instanceId ? undefined : instanceId)
  }

  const onCell = (position: Position) => {
    if (selectedInstance && selectedCard && isBoardCard(selectedCard)) {
      if (doAction({ type: 'play-card', playerId: 'player', cardInstanceId: selectedInstance.instanceId, position, target: { kind: 'none' } })) finishSelection()
      return
    }
    if (selectedPiece && moves.some((cell) => cell.x === position.x && cell.y === position.y)) {
      if (doAction({ type: 'move', playerId: 'player', pieceId: selectedPiece.instanceId, to: position })) finishSelection()
    }
  }

  const onPiece = (pieceId: string) => {
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
    if (piece.owner === 'player') store.selectPiece(store.selectedPieceId === pieceId ? undefined : pieceId)
    else store.inspect(piece.cardId)
  }

  const onNexus = (playerId: PlayerId) => {
    if (playerId === 'ai' && selectedPiece && attacks.canAttackNexus) {
      if (doAction({ type: 'attack-nexus', playerId: 'player', attackerId: selectedPiece.instanceId })) finishSelection()
    }
  }

  const endTurn = () => {
    if (doAction({ type: 'end-turn', playerId: 'player' })) finishSelection()
  }

  const repeat = () => {
    store.reset()
    setMulliganIds([])
    aiSteps.current = 0
    aiSkipped.current = new Set()
    store.startMatch(preferences.selectedDeckId)
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
  const handCount = player.hand.length
  const revealedCard = revealedCardId ? CARD_BY_ID[revealedCardId] : undefined
  const playerFactionEssence = ESSENCE_LABELS[commander?.faction ?? 'fury'] ?? 'Esencia'

  return (
    <div className={styles.battle}>
      <header className={styles.topbar}>
        <button className={styles.exit} onClick={() => navigate('/play')}>← Abandonar el Santuario</button>
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
            onCell={onCell}
            onPiece={onPiece}
            onNexus={onNexus}
            reducedMotion={preferences.reducedMotion}
            quality={preferences.graphicsQuality}
            scenario={preferences.scenario}
            activeEvent={currentEvent}
          />
          {banner && <div className={styles.turnBanner} role="status">{banner}</div>}
          {queueBusy && pendingCount > 2 && (
            <button className={styles.skipQueue} onClick={() => store.skipAnimations()}>
              Saltar animaciones ({pendingCount})
            </button>
          )}
          <div className={styles.essencePill} aria-label={`Esencia disponible: ${mana.available} de ${mana.total}`}>
            <span className={styles.essenceSigil} aria-hidden="true">◆</span>
            <strong>{mana.available} / {mana.total}</strong>
            <span className={styles.essencePips} aria-hidden="true">
              {player.resources.slice(0, 10).map((resource) => (
                <span key={resource.instanceId} data-faction={resource.faction} data-exhausted={resource.exhausted} />
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
            <div className={styles.lifeRow}><span>Vida del Nexo</span><span className={styles.life}>♥ {player.nexusHealth}</span></div>
            {player.unitDiscountPending && <p className={styles.commanderBoon}>Pasiva activa: tu siguiente unidad cuesta 1 menos.</p>}
          </section>
          <section className={styles.panelSection}>
            <span className={styles.panelLabel}>Reserva de Esencia</span>
            <div className={styles.manaHeader}>
              <strong>{mana.available} / {mana.total}</strong>
              <small>{mana.exhausted} agotadas</small>
            </div>
            <div className={styles.crystals}>
              {player.resources.map((resource) => (
                <span
                  key={resource.instanceId}
                  className={styles.crystal}
                  data-faction={resource.faction}
                  data-exhausted={resource.exhausted}
                  data-spend={payment?.resourceIds.includes(resource.instanceId)}
                  title={resource.exhausted ? `${ESSENCE_LABELS[resource.faction]} agotada` : `${ESSENCE_LABELS[resource.faction]} disponible`}
                />
              ))}
            </div>
          </section>
          <section className={styles.panelSection}>
            <div className={styles.deckCounters}>
              <div className={styles.counter}><strong>{player.deck.length}</strong><span>Mazo</span></div>
              <div className={styles.counter}><strong>{player.discard.length}</strong><span>Descarte</span></div>
            </div>
          </section>
        </aside>
        <aside className={styles.rightPanel}>
          <section className={`${styles.panelSection} ${styles.context}`}>
            <span className={styles.panelLabel}>Contexto</span>
            {activeInfo ? (
              <>
                <h3>{activeInfo.name}</h3>
                <p>{activeInfo.rules}</p>
                {selectedCard && !payment?.payable && <p className={styles.warning}>Falta Esencia para pagar esta carta.</p>}
                {canCastDirectly && <button className={styles.cast} onClick={playSelectedWithoutTarget}>Resolver carta</button>}
              </>
            ) : (
              <>
                <h3>Elige una carta</h3>
                <p>Selecciona una carta de tu mano o una unidad aliada. El Santuario iluminará los destinos válidos.</p>
              </>
            )}
          </section>
          <section className={styles.log}>
            <span className={styles.panelLabel}>Crónica de batalla</span>
            <ul>{store.history.slice().reverse().map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}</ul>
          </section>
          <button className={styles.endTurn} onClick={endTurn} disabled={match.activePlayer !== 'player' || Boolean(match.winner) || queueBusy}>
            Finalizar turno
          </button>
        </aside>
      </div>

      <footer className={styles.handBar}>
        <div className={styles.playerNexus}>
          <div className={styles.nexusOrb}>{player.nexusHealth}</div>
          <div><strong>{commander?.name}</strong><small>{playerFactionEssence}</small></div>
        </div>
        <div className={styles.hand} aria-label="Tu mano">
          {player.hand.map((instance, index) => {
            const card = CARD_BY_ID[instance.cardId]
            if (!card) return null
            const playable = match.activePlayer === 'player' && !match.winner && (
              card.type === 'mana'
                ? !player.resourcePlayedThisTurn
                : planManaPayment(player.resources, effectiveCost(match, 'player', card)).payable
            )
            const offset = index - (handCount - 1) / 2
            const style = {
              '--fan-rotation': `${offset * Math.min(4, 26 / Math.max(1, handCount))}deg`,
              '--fan-lift': `${Math.abs(offset) * Math.abs(offset) * Math.min(5, 26 / Math.max(1, handCount))}px`,
              zIndex: store.selectedHandId === instance.instanceId ? 30 : 10 + index,
            } as React.CSSProperties
            return (
              <div key={instance.instanceId} className={styles.fanCard} style={style} data-selected={store.selectedHandId === instance.instanceId}>
                <Card
                  card={card}
                  size="hand"
                  selected={store.selectedHandId === instance.instanceId}
                  playable={playable}
                  onSelect={() => onHandSelect(instance.instanceId)}
                  onInspect={() => store.inspect(card.id)}
                />
              </div>
            )
          })}
        </div>
        <div className={styles.hints}>
          Clic: seleccionar/jugar<br />Clic derecho o I: inspeccionar<br />Esc: cancelar
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

      {!player.mulliganTaken && match.turn === 1 && !match.winner && (
        <div className={styles.resultBackdrop}>
          <section className={styles.mulligan}>
            <small>Preparación de la crónica</small>
            <h2>Tu mano inicial</h2>
            <p>Marca las cartas que quieras devolver. Solo puedes hacerlo una vez.</p>
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
