import { useMemo, useState } from 'react'
import { CARD_BY_ID, COMMANDER_BY_ID, STARTER_DECKS, cardsForFaction, validateDeck } from '../game'
import type { DeckDefinition, DeckEntry } from '../game'
import { FactionSigil } from '../components/FactionSigil'
import { usePreferences } from '../store/preferences'
import { currentStreak, summarizeByDeck, summarizeRecords, useRecords } from '../store/records'
import { evaluateAchievements } from '../store/achievements'
import { withBase } from '../utils/assets'
import styles from './DecksPage.module.css'

function loadEntries(deck: DeckDefinition): DeckEntry[] {
  const raw = localStorage.getItem(`cronicas-nexo-deck-${deck.id}`)
  if (!raw) return deck.cards.map((entry) => ({ ...entry }))
  try {
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return deck.cards.map((entry) => ({ ...entry }))
    return value.filter((entry): entry is DeckEntry => typeof entry === 'object' && entry !== null && 'cardId' in entry && 'count' in entry)
  } catch {
    return deck.cards.map((entry) => ({ ...entry }))
  }
}

export function DecksPage() {
  const preferences = usePreferences()
  const selected = STARTER_DECKS.find((deck) => deck.id === preferences.selectedDeckId) ?? STARTER_DECKS[0]
  if (!selected) return null
  return <DeckEditor key={selected.id} selected={selected} selectDeck={preferences.setSelectedDeck} />
}

function DeckEditor({ selected, selectDeck }: { selected: DeckDefinition; selectDeck: (deckId: string) => void }) {
  const [entries, setEntries] = useState<DeckEntry[]>(() => loadEntries(selected))
  const [saved, setSaved] = useState(false)

  const draft = useMemo<DeckDefinition>(() => ({ ...selected, cards: entries }), [selected, entries])
  const validation = useMemo(() => validateDeck(draft), [draft])
  const commander = COMMANDER_BY_ID[selected.commanderId]

  // Catálogo de la facción que aún no está en el mazo: permite construir desde cero.
  const availablePool = useMemo(() => {
    const inDeck = new Set(entries.map((entry) => entry.cardId))
    return cardsForFaction(selected.faction).filter((card) => !inDeck.has(card.id))
  }, [entries, selected.faction])

  const changeCount = (cardId: string, delta: number) => {
    setSaved(false)
    setEntries((current) =>
      current
        .map((entry) => (entry.cardId === cardId ? { ...entry, count: Math.max(0, entry.count + delta) } : entry))
        // Al bajar a 0 la carta sale del mazo y vuelve al catálogo.
        .filter((entry) => entry.count > 0),
    )
  }
  const addCard = (cardId: string) => {
    setSaved(false)
    setEntries((current) => (current.some((entry) => entry.cardId === cardId) ? current : [...current, { cardId, count: 1 }]))
  }
  const save = () => {
    localStorage.setItem(`cronicas-nexo-deck-${selected.id}`, JSON.stringify(entries))
    setSaved(true)
  }
  const reset = () => {
    localStorage.removeItem(`cronicas-nexo-deck-${selected.id}`)
    setEntries(selected.cards.map((entry) => ({ ...entry })))
    setSaved(false)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div><small>Arsenal del Nexo</small><h1>Mazos iniciales</h1></div>
        <div className={styles.tabs}>{STARTER_DECKS.map((deck) => <button key={deck.id} className={styles.tab} data-active={deck.id === selected.id} onClick={() => selectDeck(deck.id)}>{deck.name}</button>)}</div>
      </header>
      <div className={styles.layout}>
        <aside className={styles.summary}>
          <div className={styles.factionMark}><FactionSigil faction={selected.faction} size="large" decorative /></div>
          <h2>{selected.name}</h2><div className={styles.commander}>{commander?.name} · {commander?.title}</div>
          <p className={styles.commanderRule}>{commander?.rules}</p>
          <div className={styles.stats}><div className={styles.stat}><strong>{validation.totalCards}</strong><span>Total</span></div><div className={styles.stat}><strong>{validation.manaCards}</strong><span>Esencia</span></div><div className={styles.stat}><strong>{validation.nonManaCards}</strong><span>Acción</span></div></div>
          {validation.valid ? <div className={styles.valid}>✓ Mazo válido para jugar</div> : <div className={styles.invalid}>Mazo no válido<ul className={styles.issues}>{validation.issues.slice(0, 4).map((issue, index) => <li key={`${issue.code}-${index}`}>{issue.message}</li>)}</ul></div>}
          <div className={styles.saveRow}><button className={styles.save} onClick={save}>Guardar local</button><button className={styles.reset} onClick={reset}>Restaurar</button></div>
          {saved && <span className={styles.saved}>Borrador guardado en este dispositivo.</span>}
        </aside>
        <section className={styles.editor}>
          <header className={styles.editorHeader}><h3>Lista de cartas</h3><span>Usa +/− para ajustar copias. Al llegar a 0, la carta vuelve al catálogo.</span></header>
          <div className={styles.list}>{entries.map((entry) => {
            const card = CARD_BY_ID[entry.cardId]
            if (!card) return null
            const colorCost = Object.values(card.cost.colored).reduce((total, amount) => total + (amount ?? 0), 0)
            return <article className={styles.entry} key={entry.cardId}>
              <img className={styles.art} src={withBase(card.art.webp)} alt="" />
              <div><h4>{card.name}</h4><p>{card.type} · {card.rarity}{card.unique ? ' · única' : ''}</p></div>
              <span className={styles.cost}>{card.type === 'mana' ? 'Fuente' : `Coste ${card.cost.generic + colorCost}`}</span>
              <div className={styles.counter}><button onClick={() => changeCount(entry.cardId, -1)} aria-label={`Quitar ${card.name}`}>−</button><span>{entry.count}</span><button onClick={() => changeCount(entry.cardId, 1)} aria-label={`Añadir ${card.name}`}>+</button></div>
            </article>
          })}</div>
          {availablePool.length > 0 && (
            <>
              <header className={styles.editorHeader}><h3>Catálogo de {selected.faction === 'fury' ? 'Furia' : selected.name}</h3><span>Añade cartas de la facción para construir tu propio mazo</span></header>
              <div className={styles.pool}>{availablePool.map((card) => {
                const colorCost = Object.values(card.cost.colored).reduce((total, amount) => total + (amount ?? 0), 0)
                return (
                  <button className={styles.poolCard} key={card.id} onClick={() => addCard(card.id)} title={`Añadir ${card.name} al mazo`}>
                    <img className={styles.art} src={withBase(card.art.webp)} alt="" />
                    <div><h4>{card.name}</h4><p>{card.type} · {card.rarity}</p></div>
                    <span className={styles.cost}>{card.type === 'mana' ? 'Fuente' : `Coste ${card.cost.generic + colorCost}`}</span>
                    <span className={styles.addMark} aria-hidden="true">+</span>
                  </button>
                )
              })}</div>
            </>
          )}
        </section>
      </div>
      <AchievementsPanel />
      <MatchHistory />
    </div>
  )
}

function AchievementsPanel() {
  const records = useRecords((state) => state.records)
  const achievements = useMemo(() => evaluateAchievements(records), [records])
  const unlocked = achievements.filter((achievement) => achievement.unlocked).length

  return (
    <section className={styles.history}>
      <header className={styles.historyHeader}>
        <h3>Logros</h3>
        <span className={styles.achieveCount}>{unlocked} / {achievements.length}</span>
      </header>
      <div className={styles.achievements}>
        {achievements.map((achievement) => (
          <article key={achievement.id} className={styles.achievement} data-unlocked={achievement.unlocked}>
            <span className={styles.achieveIcon} aria-hidden="true">{achievement.icon}</span>
            <div className={styles.achieveBody}>
              <h4>{achievement.name}</h4>
              <p>{achievement.description}</p>
              {!achievement.unlocked && achievement.progress > 0 && (
                <div className={styles.achieveBar}><span style={{ width: `${Math.round(achievement.progress * 100)}%` }} /></div>
              )}
            </div>
            {achievement.unlocked && <span className={styles.achieveCheck} aria-label="Conseguido">✓</span>}
          </article>
        ))}
      </div>
    </section>
  )
}

const relativeDay = (timestamp: number): string => {
  const days = Math.floor((Date.now() - timestamp) / 86_400_000)
  if (days <= 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  return `Hace ${days} días`
}

function MatchHistory() {
  const records = useRecords((state) => state.records)
  const clear = useRecords((state) => state.clear)
  const tally = useMemo(() => summarizeRecords(records), [records])
  const byDeck = useMemo(() => summarizeByDeck(records), [records])
  const streak = useMemo(() => currentStreak(records), [records])
  const streakLabel = streak > 0 ? `${streak} victoria${streak === 1 ? '' : 's'}` : streak < 0 ? `${-streak} derrota${streak === -1 ? '' : 's'}` : '—'

  if (records.length === 0) {
    return (
      <section className={styles.history}>
        <header className={styles.historyHeader}><h3>Historial de escaramuzas</h3></header>
        <p className={styles.historyEmpty}>Aún no has terminado ninguna partida. Al concluir una escaramuza aparecerá aquí.</p>
      </section>
    )
  }

  return (
    <section className={styles.history}>
      <header className={styles.historyHeader}>
        <h3>Historial de escaramuzas</h3>
        <button className={styles.historyClear} onClick={clear}>Borrar historial</button>
      </header>
      <div className={styles.historyTally}>
        <div className={styles.stat}><strong>{tally.played}</strong><span>Jugadas</span></div>
        <div className={styles.stat}><strong>{tally.won}</strong><span>Victorias</span></div>
        <div className={styles.stat}><strong>{tally.lost}</strong><span>Derrotas</span></div>
        <div className={styles.stat}><strong>{tally.winRate}%</strong><span>Ratio</span></div>
        <div className={styles.stat} data-streak={streak > 0 ? 'win' : streak < 0 ? 'loss' : undefined}><strong>{streakLabel}</strong><span>Racha actual</span></div>
      </div>
      {byDeck.length > 1 && (
        <ul className={styles.byDeck}>
          {byDeck.map((entry) => (
            <li key={entry.deckId}>
              <span>{entry.deckName}</span>
              <strong>{entry.won}/{entry.played}</strong>
            </li>
          ))}
        </ul>
      )}
      <ol className={styles.historyList}>
        {records.slice(0, 12).map((record) => (
          <li key={record.id} className={styles.historyRow} data-won={record.won}>
            <span className={styles.historyResult}>{record.won ? 'Victoria' : 'Derrota'}</span>
            <span className={styles.historyDeck}>{record.deckName} <small>vs {record.opponentDeckName}</small></span>
            <span className={styles.historyMeta}>{record.turns} turnos · {record.seconds}s · {relativeDay(record.finishedAt)}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
