import { useEffect, useMemo, useState } from 'react'
import { Card, CardInspector } from '../components'
import { CARDS, CARD_TYPES, FACTION_IDS, RARITIES, type CardDefinition, type CardType, type FactionId, type Rarity } from '../game'
import { RarityGem } from '../components/RarityGem'
import { FACTION_LABELS, RARITY_LABELS, TYPE_LABELS, totalCost } from '../utils/cardLabels'
import styles from './GalleryPage.module.css'

type FilterValue<T extends string> = 'all' | T

const FACTION_TABS: readonly FilterValue<FactionId>[] = ['all', ...FACTION_IDS]

export function GalleryPage() {
  const [query, setQuery] = useState('')
  const [faction, setFaction] = useState<FilterValue<FactionId>>('all')
  const [type, setType] = useState<FilterValue<CardType>>('all')
  const [rarity, setRarity] = useState<FilterValue<Rarity>>('all')
  const [cost, setCost] = useState('all')
  const [keyword, setKeyword] = useState('all')
  const [inspected, setInspected] = useState<CardDefinition>()
  const keywords = useMemo(() => [...new Set(CARDS.flatMap((card) => card.keywords))].sort(), [])

  useEffect(() => {
    if (!inspected) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setInspected(undefined) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [inspected])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es')
    return CARDS.filter((card) => {
      if (faction !== 'all' && card.faction !== faction) return false
      if (type !== 'all' && card.type !== type) return false
      if (rarity !== 'all' && card.rarity !== rarity) return false
      const value = totalCost(card.cost.generic, card.cost.colored)
      if (cost === '0-2' && value > 2) return false
      if (cost === '3-4' && (value < 3 || value > 4)) return false
      if (cost === '5+' && value < 5) return false
      if (keyword !== 'all' && !card.keywords.includes(keyword as never)) return false
      if (normalized && !`${card.name} ${card.subtype ?? ''} ${card.rules} ${card.flavor}`.toLocaleLowerCase('es').includes(normalized)) return false
      return true
    })
  }, [cost, faction, keyword, query, rarity, type])

  // Recuento por rareza sobre las cartas visibles: da a la galería aire de álbum.
  const rarityCounts = useMemo(() => {
    const counts = Object.fromEntries(RARITIES.map((value) => [value, 0])) as Record<Rarity, number>
    for (const card of filtered) counts[card.rarity] += 1
    return counts
  }, [filtered])

  return (
    <div className={styles.page}>
      <header className={styles.header}><div><small>Archivo NEX-01 · Despertar</small><h1>Galería de cartas</h1></div><div className={styles.count}><strong>{filtered.length}</strong> de {CARDS.length} diseños</div></header>
      <div className={styles.filters}>
        <input className={styles.search} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, regla o historia…" aria-label="Buscar cartas" />
        <select className={styles.select} value={type} onChange={(event) => setType(event.target.value as FilterValue<CardType>)} aria-label="Filtrar por tipo"><option value="all">Todos los tipos</option>{CARD_TYPES.map((value) => <option key={value} value={value}>{TYPE_LABELS[value]}</option>)}</select>
        <select className={styles.select} value={rarity} onChange={(event) => setRarity(event.target.value as FilterValue<Rarity>)} aria-label="Filtrar por rareza"><option value="all">Toda rareza</option>{RARITIES.map((value) => <option key={value} value={value}>{RARITY_LABELS[value]}</option>)}</select>
        <select className={styles.select} value={cost} onChange={(event) => setCost(event.target.value)} aria-label="Filtrar por coste"><option value="all">Cualquier coste</option><option value="0-2">Coste 0–2</option><option value="3-4">Coste 3–4</option><option value="5+">Coste 5+</option></select>
        <select className={styles.select} value={keyword} onChange={(event) => setKeyword(event.target.value)} aria-label="Filtrar por palabra clave"><option value="all">Toda palabra clave</option>{keywords.map((value) => <option key={value} value={value}>{value}</option>)}</select>
      </div>
      <div className={styles.factionTabs}>{FACTION_TABS.map((value) => <button key={value} className={styles.factionTab} data-active={faction === value} onClick={() => setFaction(value)}>{value === 'all' ? 'Todas las facciones' : FACTION_LABELS[value]}</button>)}</div>
      <div className={styles.collectionBar} aria-label="Recuento por rareza">
        {RARITIES.map((value) => (
          <span key={value} className={styles.collectionStat} data-rarity={value}>
            <RarityGem rarity={value} compact />
            <strong>{rarityCounts[value]}</strong>
            <small>{RARITY_LABELS[value]}</small>
          </span>
        ))}
      </div>
      <section className={styles.grid} aria-live="polite">{filtered.map((card) => <Card key={card.id} card={card} size="gallery" onSelect={setInspected} onInspect={setInspected} />)}{filtered.length === 0 && <div className={styles.empty}>Ninguna carta coincide con estos filtros.</div>}</section>
      <CardInspector card={inspected ?? null} onClose={() => setInspected(undefined)} />
    </div>
  )
}
