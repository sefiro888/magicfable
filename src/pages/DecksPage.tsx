import { useMemo, useState } from 'react'
import { CARD_BY_ID, COMMANDER_BY_ID, STARTER_DECKS, validateDeck } from '../game'
import type { DeckDefinition, DeckEntry } from '../game'
import { usePreferences } from '../store/preferences'
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

  const changeCount = (cardId: string, delta: number) => {
    setSaved(false)
    setEntries((current) => current.map((entry) => entry.cardId === cardId ? { ...entry, count: Math.max(0, entry.count + delta) } : entry))
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
          <div className={styles.factionMark}><span>{selected.faction === 'fury' ? '♨' : '◇'}</span></div>
          <h2>{selected.name}</h2><div className={styles.commander}>{commander?.name} · {commander?.title}</div>
          <p className={styles.commanderRule}>{commander?.rules}</p>
          <div className={styles.stats}><div className={styles.stat}><strong>{validation.totalCards}</strong><span>Total</span></div><div className={styles.stat}><strong>{validation.manaCards}</strong><span>Esencia</span></div><div className={styles.stat}><strong>{validation.nonManaCards}</strong><span>Acción</span></div></div>
          {validation.valid ? <div className={styles.valid}>✓ Mazo válido para jugar</div> : <div className={styles.invalid}>Mazo no válido<ul className={styles.issues}>{validation.issues.slice(0, 4).map((issue, index) => <li key={`${issue.code}-${index}`}>{issue.message}</li>)}</ul></div>}
          <div className={styles.saveRow}><button className={styles.save} onClick={save}>Guardar local</button><button className={styles.reset} onClick={reset}>Restaurar</button></div>
          {saved && <span className={styles.saved}>Borrador guardado en este dispositivo.</span>}
        </aside>
        <section className={styles.editor}>
          <header className={styles.editorHeader}><h3>Lista de cartas</h3><span>Usa +/− para probar la validación automática</span></header>
          <div className={styles.list}>{entries.map((entry) => {
            const card = CARD_BY_ID[entry.cardId]
            if (!card) return null
            const colorCost = Object.values(card.cost.colored).reduce((total, amount) => total + (amount ?? 0), 0)
            return <article className={styles.entry} key={entry.cardId}>
              <img className={styles.art} src={withBase(card.art.fallback)} alt="" />
              <div><h4>{card.name}</h4><p>{card.type} · {card.rarity}{card.unique ? ' · única' : ''}</p></div>
              <span className={styles.cost}>{card.type === 'mana' ? 'Fuente' : `Coste ${card.cost.generic + colorCost}`}</span>
              <div className={styles.counter}><button onClick={() => changeCount(entry.cardId, -1)} aria-label={`Quitar ${card.name}`}>−</button><span>{entry.count}</span><button onClick={() => changeCount(entry.cardId, 1)} aria-label={`Añadir ${card.name}`}>+</button></div>
            </article>
          })}</div>
        </section>
      </div>
    </div>
  )
}
