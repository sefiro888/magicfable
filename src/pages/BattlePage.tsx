import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CARD_BY_ID,
  COMMANDER_BY_ID,
  getValidDeploymentPositions,
  getValidAttacks,
  getValidMoves,
  mulliganOpeningHand,
  planManaPayment,
  runAiTurn,
  summarizeMana,
  type CardDefinition,
  type GameAction,
  type PlayerId,
  type Position,
} from '../game'
import { Board3D } from '../battle/Board3D'
import { playSynthCue } from '../services/audio'
import { useMatchStore } from '../store/match'
import { usePreferences } from '../store/preferences'
import { FACTION_LABELS, RARITY_LABELS, TYPE_LABELS, totalCost } from '../utils/cardLabels'
import styles from './BattlePage.module.css'

const requiresPieceTarget = (card: CardDefinition) => card.effects.some((effect) =>
  effect.kind === 'damage' ||
  effect.kind === 'freeze' ||
  effect.kind === 'scorch' ||
  (effect.kind === 'passive' && effect.id === 'target-attack-until-end'),
)
const isBoardCard = (card: CardDefinition) => card.type === 'unit' || card.type === 'structure'

export function BattlePage() {
  const navigate = useNavigate()
  const preferences = usePreferences()
  const store = useMatchStore()
  const [mulliganIds, setMulliganIds] = useState<readonly string[]>([])

  useEffect(() => {
    if (!store.match) {
      useMatchStore.getState().startMatch(preferences.selectedDeckId)
    }
  }, [preferences.selectedDeckId, store.match])

  useEffect(() => {
    const match = useMatchStore.getState().match
    if (!match || match.activePlayer !== 'ai' || match.winner) return
    const timer = window.setTimeout(() => {
      const current = useMatchStore.getState().match
      if (!current || current.activePlayer !== 'ai' || current.winner) return
      useMatchStore.getState().setAiThinking(true)
      const next = runAiTurn(current)
      useMatchStore.getState().replaceMatch(next, 'La IA completa sus decisiones.')
      useMatchStore.getState().selectHand(undefined)
      useMatchStore.getState().setAiThinking(false)
    }, preferences.aiDelayMs)
    return () => window.clearTimeout(timer)
  }, [preferences.aiDelayMs, store.match?.activePlayer, store.match?.turn, store.match?.winner])

  useEffect(() => {
    const cancel = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        store.selectHand(undefined)
        store.selectPiece(undefined)
        store.inspect(undefined)
      }
      if (event.key.toLowerCase() === 'i') {
        const match = store.match
        const hand = match?.players.player.hand.find((card) => card.instanceId === store.selectedHandId)
        const piece = match?.board.find((card) => card.instanceId === store.selectedPieceId)
        store.inspect(hand?.cardId ?? piece?.cardId)
      }
    }
    window.addEventListener('keydown', cancel)
    return () => window.removeEventListener('keydown', cancel)
  }, [store])

  const match = store.match
  const player = match?.players.player
  const ai = match?.players.ai
  const selectedInstance = player?.hand.find((instance) => instance.instanceId === store.selectedHandId)
  const selectedCard = selectedInstance ? CARD_BY_ID[selectedInstance.cardId] : undefined
  const selectedPiece = match?.board.find((piece) => piece.instanceId === store.selectedPieceId)
  const selectedBoardCard = selectedPiece ? CARD_BY_ID[selectedPiece.cardId] : undefined
  const moves = match && selectedPiece ? getValidMoves(match, selectedPiece.instanceId) : []
  const attacks = match && selectedPiece ? getValidAttacks(match, selectedPiece.instanceId) : { pieceIds: [], canAttackNexus: false }
  const deployCells = useMemo<Position[]>(() => {
    if (!match || !selectedCard || !isBoardCard(selectedCard) || match.activePlayer !== 'player') return []
    if (!planManaPayment(match.players.player.resources, selectedCard.cost).payable) return []
    return [...getValidDeploymentPositions(match, 'player')]
  }, [match, selectedCard])
  const validCells = selectedCard ? deployCells : moves
  const mana = summarizeMana(player?.resources ?? [])
  const payment = selectedCard ? planManaPayment(player?.resources ?? [], selectedCard.cost) : undefined
  const commander = player ? COMMANDER_BY_ID[player.commanderId] : undefined
  const aiCommander = ai ? COMMANDER_BY_ID[ai.commanderId] : undefined
  const inspected = store.inspectedCardId ? CARD_BY_ID[store.inspectedCardId] : undefined
  const spellTargets = useMemo(() => {
    if (!match || !selectedCard || !requiresPieceTarget(selectedCard)) return []
    const friendlyOnly = selectedCard.effects.some((effect) => effect.kind === 'passive' && effect.id === 'target-attack-until-end')
    const enemyOnly = selectedCard.effects.some((effect) => effect.kind === 'damage' && effect.target === 'enemy-piece')
    return match.board.filter((piece) => {
      if (friendlyOnly) return piece.owner === 'player'
      if (enemyOnly) return piece.owner === 'ai' && (selectedCard.id !== 'lluvia-ceniza' || CARD_BY_ID[piece.cardId]?.type === 'unit')
      return true
    }).map((piece) => piece.instanceId)
  }, [match, selectedCard])

  if (!match || !player || !ai) return <div className={styles.battle} />

  const cue = (name: Parameters<typeof playSynthCue>[0]) => {
    if (!preferences.muted) playSynthCue(name, preferences.masterVolume * preferences.effectsVolume)
  }
  const doAction = (action: GameAction, sound: Parameters<typeof playSynthCue>[0]) => {
    const ok = store.dispatch(action)
    if (ok) cue(sound)
    return ok
  }
  const finishSelection = () => { store.selectHand(undefined); store.selectPiece(undefined) }

  const playSelectedWithoutTarget = () => {
    if (!selectedInstance || !selectedCard) return
    if (doAction({ type: 'play-card', playerId: 'player', cardInstanceId: selectedInstance.instanceId, target: { kind: 'none' } }, selectedCard.type === 'instant' || selectedCard.type === 'persistent' ? 'spell' : 'summon')) finishSelection()
  }

  const onHand = (instanceId: string) => {
    if (match.activePlayer !== 'player' || match.winner) return
    const instance = player.hand.find((candidate) => candidate.instanceId === instanceId)
    const card = instance ? CARD_BY_ID[instance.cardId] : undefined
    if (!instance || !card) return
    if (card.type === 'mana') {
      if (doAction({ type: 'play-resource', playerId: 'player', cardInstanceId: instanceId }, 'resource')) finishSelection()
      return
    }
    store.selectHand(store.selectedHandId === instanceId ? undefined : instanceId)
  }

  const onCell = (position: Position) => {
    if (selectedInstance && selectedCard && isBoardCard(selectedCard)) {
      if (doAction({ type: 'play-card', playerId: 'player', cardInstanceId: selectedInstance.instanceId, position, target: { kind: 'none' } }, 'summon')) finishSelection()
      return
    }
    if (selectedPiece && moves.some((cell) => cell.x === position.x && cell.y === position.y)) {
      if (doAction({ type: 'move', playerId: 'player', pieceId: selectedPiece.instanceId, to: position }, 'move')) finishSelection()
    }
  }

  const onPiece = (pieceId: string) => {
    const piece = match.board.find((candidate) => candidate.instanceId === pieceId)
    if (!piece || match.activePlayer !== 'player') return
    if (selectedInstance && selectedCard && !isBoardCard(selectedCard)) {
      if (doAction({ type: 'play-card', playerId: 'player', cardInstanceId: selectedInstance.instanceId, target: { kind: 'piece', pieceId } }, 'spell')) finishSelection()
      return
    }
    if (selectedPiece && attacks.pieceIds.includes(pieceId)) {
      if (doAction({ type: 'attack-piece', playerId: 'player', attackerId: selectedPiece.instanceId, defenderId: pieceId }, 'attack')) finishSelection()
      return
    }
    if (piece.owner === 'player') store.selectPiece(store.selectedPieceId === pieceId ? undefined : pieceId)
    else store.inspect(piece.cardId)
  }

  const onNexus = (playerId: PlayerId) => {
    if (playerId === 'ai' && selectedPiece && attacks.canAttackNexus) {
      if (doAction({ type: 'attack-nexus', playerId: 'player', attackerId: selectedPiece.instanceId }, 'impact')) finishSelection()
    }
  }

  const endTurn = () => {
    if (doAction({ type: 'end-turn', playerId: 'player' }, 'ui')) finishSelection()
  }

  const repeat = () => {
    store.reset()
    setMulliganIds([])
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

  const activeInfo = selectedCard ?? selectedBoardCard
  const canCastDirectly = selectedCard && !isBoardCard(selectedCard) && !requiresPieceTarget(selectedCard)

  return (
    <div className={styles.battle}>
      <header className={styles.topbar}>
        <button className={styles.exit} onClick={() => navigate('/play')}>← Abandonar tablero</button>
        <div className={styles.turn}><strong>{match.activePlayer === 'player' ? 'Tu turno' : 'Turno rival'}</strong><span>Turno {match.turn} · fase {match.phase}</span></div>
        <div className={styles.enemySummary}><div><strong>{aiCommander?.name}</strong><span>{ai.hand.length} cartas · {ai.deck.length} en mazo</span></div><div className={styles.nexusOrb}>{ai.nexusHealth}</div></div>
      </header>

      <div className={styles.arena}>
        <div className={styles.boardFrame}><Board3D state={match} selectedPieceId={store.selectedPieceId} validCells={validCells} validTargets={selectedCard ? spellTargets : attacks.pieceIds} onCell={onCell} onPiece={onPiece} onNexus={onNexus} reducedMotion={preferences.reducedMotion} /></div>
        <aside className={styles.leftPanel}>
          <section className={styles.panelSection}><span className={styles.panelLabel}>Comandante</span><div className={styles.commander}><img className={styles.portrait} src={commander?.art.fallback} alt="" /><div><strong>{commander?.name}</strong><small>{commander?.title}</small></div></div><div className={styles.lifeRow}><span>Vida del Nexo</span><span className={styles.life}>♥ {player.nexusHealth}</span></div></section>
          <section className={styles.panelSection}><span className={styles.panelLabel}>Reserva de maná</span><div className={styles.manaHeader}><strong>{mana.available} / {mana.total}</strong><small>{mana.exhausted} agotadas</small></div><div className={styles.crystals}>{player.resources.map((resource) => <span key={resource.instanceId} className={styles.crystal} data-faction={resource.faction} data-exhausted={resource.exhausted} data-spend={payment?.resourceIds.includes(resource.instanceId)} title={resource.exhausted ? 'Fuente agotada' : 'Fuente disponible'} />)}</div></section>
          <section className={styles.panelSection}><div className={styles.deckCounters}><div className={styles.counter}><strong>{player.deck.length}</strong><span>Mazo</span></div><div className={styles.counter}><strong>{player.discard.length}</strong><span>Descarte</span></div></div></section>
        </aside>
        <aside className={styles.rightPanel}>
          <section className={`${styles.panelSection} ${styles.context}`}><span className={styles.panelLabel}>Contexto</span>{activeInfo ? <><h3>{activeInfo.name}</h3><p>{activeInfo.rules}</p>{selectedCard && !payment?.payable && <p style={{ color: 'var(--danger)', marginTop: 8 }}>Falta maná para pagar esta carta.</p>}{canCastDirectly && <button className={styles.cast} onClick={playSelectedWithoutTarget}>Resolver carta</button>}</> : <><h3>Elige una carta</h3><p>Selecciona una carta de tu mano o una unidad aliada. El tablero iluminará los destinos válidos.</p></>}</section>
          <section className={styles.log}><span className={styles.panelLabel}>Crónica de batalla</span><ul>{store.history.slice().reverse().map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}</ul></section>
          <button className={styles.endTurn} onClick={endTurn} disabled={match.activePlayer !== 'player' || Boolean(match.winner)}>Finalizar turno</button>
        </aside>
      </div>

      <footer className={styles.handBar}>
        <div className={styles.playerNexus}><div className={styles.nexusOrb}>{player.nexusHealth}</div><div><strong>{commander?.name}</strong><small>{FACTION_LABELS[commander?.faction ?? 'fury']}</small></div></div>
        <div className={styles.hand} aria-label="Tu mano">{player.hand.map((instance) => {
          const card = CARD_BY_ID[instance.cardId]
          if (!card) return null
          const playable = card.type === 'mana' ? !player.resourcePlayedThisTurn : planManaPayment(player.resources, card.cost).payable
          return <button key={instance.instanceId} className={styles.handCard} data-selected={store.selectedHandId === instance.instanceId} data-playable={playable} onClick={() => onHand(instance.instanceId)} onContextMenu={(event) => { event.preventDefault(); store.inspect(card.id) }} aria-label={`${card.name}. ${playable ? 'Jugable' : 'No jugable'}`}>
            <img src={card.art.fallback} alt="" /><span className={styles.handCost}>{totalCost(card.cost.generic, card.cost.colored)}</span><h4>{card.name}</h4><p>{card.rules}</p>{(card.attack !== undefined || card.health !== undefined) && <span className={styles.handStats}>⚔ {card.attack ?? 0} · ♥ {card.health ?? card.resistance ?? 0}</span>}
          </button>
        })}</div>
        <div className={styles.hints}>Clic: seleccionar/jugar<br />Clic derecho o I: inspeccionar<br />Esc: cancelar</div>
      </footer>

      {store.message && <button className={styles.message} onClick={() => store.setMessage(undefined)}>{store.message}</button>}
      {!player.mulliganTaken && match.turn === 1 && <div className={styles.resultBackdrop}><section className={styles.mulligan}><small>Preparación de la crónica</small><h2>Tu mano inicial</h2><p>Marca las cartas que quieras devolver. Solo puedes hacerlo una vez.</p><div className={styles.mulliganCards}>{player.hand.map((instance) => {
        const card = CARD_BY_ID[instance.cardId]
        if (!card) return null
        const selected = mulliganIds.includes(instance.instanceId)
        return <button key={instance.instanceId} className={styles.mulliganCard} data-selected={selected} aria-pressed={selected} onClick={() => setMulliganIds((current) => current.includes(instance.instanceId) ? current.filter((id) => id !== instance.instanceId) : [...current, instance.instanceId])}><img src={card.art.fallback} alt="" /><strong>{card.name}</strong><span>{selected ? 'Cambiar' : 'Conservar'}</span></button>
      })}</div><button className={styles.confirmMulligan} onClick={confirmMulligan}>{mulliganIds.length > 0 ? `Cambiar ${mulliganIds.length} cartas` : 'Conservar las cinco'}</button></section></div>}
      {inspected && <div className={styles.inspectBackdrop} role="dialog" aria-modal="true" aria-label={`Inspección de ${inspected.name}`} onClick={() => store.inspect(undefined)}><article className={styles.inspect} onClick={(event) => event.stopPropagation()}><img src={inspected.art.fallback} alt={inspected.art.alt} /><div><small>{FACTION_LABELS[inspected.faction]} · {RARITY_LABELS[inspected.rarity]}</small><h2>{inspected.name}</h2><p>{TYPE_LABELS[inspected.type]}{inspected.subtype ? ` — ${inspected.subtype}` : ''}</p><p className={styles.inspectText}>{inspected.rules}</p><p className={styles.flavor}>«{inspected.flavor}»</p><button className={styles.closeInspect} onClick={() => store.inspect(undefined)}>Cerrar · Esc</button></div></article></div>}
      {match.winner && <div className={styles.resultBackdrop}><section className={styles.result}><small>La crónica ha concluido</small><h2>{match.winner === 'player' ? 'Victoria' : 'Derrota'}</h2><p>{match.winner === 'player' ? 'El Nexo rival se quiebra bajo tu voluntad.' : 'Tu Nexo se desvanece. La siguiente crónica aún puede cambiar.'}</p><div className={styles.resultStats}><div><strong>{match.turn}</strong><span>Turnos</span></div><div><strong>{store.elapsedSeconds}s</strong><span>Duración</span></div><div><strong>{player.stats.damageDealt}</strong><span>Daño</span></div><div><strong>{player.stats.cardsPlayed}</strong><span>Jugadas</span></div></div><div className={styles.resultActions}><button onClick={repeat}>Repetir</button><Link to="/">Volver al inicio</Link></div></section></div>}
    </div>
  )
}
