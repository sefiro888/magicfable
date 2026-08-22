import { useEffect, useMemo, useState } from 'react'
import { Card, CardInspector } from '../components'
import { CARDS, CARD_TYPES, FACTION_IDS, RARITIES, type CardDefinition, type CardType, type FactionId, type Rarity } from '../game'
import { RarityGem } from '../components/RarityGem'
import { FACTION_LABELS, KEYWORD_LABELS, RARITY_LABELS, TYPE_LABELS, totalCost } from '../utils/cardLabels'
import styles from './GalleryPage.module.css'

type FilterValue<T extends string> = 'all' | T

/**
 * Órdenes de la galería. Con 90 diseños, el orden de colección está bien para
 * hojear el archivo entero, pero para comparar cartas entre sí (¿qué hay
 * barato de Sombra? ¿cuáles son las míticas?) hace falta reordenar.
 */
type SortId = 'collection' | 'cost-asc' | 'cost-desc' | 'name' | 'rarity'

const SORTS: readonly { value: SortId; label: string }[] = [
  { value: 'collection', label: 'Orden de colección' },
  { value: 'cost-asc', label: 'Coste: de menor a mayor' },
  { value: 'cost-desc', label: 'Coste: de mayor a menor' },
  { value: 'name', label: 'Nombre (A–Z)' },
  { value: 'rarity', label: 'Rareza' },
]

/** De más común a más rara, para el orden por rareza. */
const RARITY_ORDER: Readonly<Record<Rarity, number>> = { common: 0, uncommon: 1, rare: 2, mythic: 3 }

const FACTION_TABS: readonly FilterValue<FactionId>[] = ['all', ...FACTION_IDS]

export function GalleryPage() {
  const [query, setQuery] = useState('')
  const [faction, setFaction] = useState<FilterValue<FactionId>>('all')
  const [type, setType] = useState<FilterValue<CardType>>('all')
  const [rarity, setRarity] = useState<FilterValue<Rarity>>('all')
  const [cost, setCost] = useState('all')
  const [keyword, setKeyword] = useState('all')
  const [sort, setSort] = useState<SortId>('collection')
  const [inspected, setInspected] = useState<CardDefinition>()
  // Ordenadas por su nombre en español, que es lo que se lee en el desplegable
  // (ordenarlas por el id interno dejaba un orden aparentemente arbitrario).
  const keywords = useMemo(
    () => [...new Set(CARDS.flatMap((card) => card.keywords))]
      .sort((a, b) => KEYWORD_LABELS[a].localeCompare(KEYWORD_LABELS[b], 'es')),
    [],
  )

  useEffect(() => {
    if (!inspected) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setInspected(undefined) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [inspected])

  const setCount = useMemo(() => new Set(CARDS.map((card) => card.set)).size, [])
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

  const ordered = useMemo(() => {
    const list = [...filtered]
    const byCost = (card: CardDefinition) => totalCost(card.cost.generic, card.cost.colored)
    switch (sort) {
      case 'cost-asc': return list.sort((a, b) => byCost(a) - byCost(b) || a.name.localeCompare(b.name, 'es'))
      case 'cost-desc': return list.sort((a, b) => byCost(b) - byCost(a) || a.name.localeCompare(b.name, 'es'))
      case 'name': return list.sort((a, b) => a.name.localeCompare(b.name, 'es'))
      case 'rarity': return list.sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity] || a.name.localeCompare(b.name, 'es'))
      default: return list
    }
  }, [filtered, sort])

  // Recuento por rareza sobre las cartas visibles: da a la galería aire de álbum.
  const rarityCounts = useMemo(() => {
    const counts = Object.fromEntries(RARITIES.map((value) => [value, 0])) as Record<Rarity, number>
    for (const card of filtered) counts[card.rarity] += 1
    return counts
  }, [filtered])

  return (
    <div className={styles.page}>
      {/* El rótulo se deriva de las cartas: decía «NEX-01 · Despertar» a mano y
          dejó de ser cierto en cuanto llegó la segunda oleada. */}
      <header className={styles.header}><div><small>Archivo del Nexo · {setCount} conjuntos</small><h1>Galería de cartas</h1></div><div className={styles.count}><strong>{filtered.length}</strong> de {CARDS.length} diseños</div></header>
      <div className={styles.filters}>
        <input className={styles.search} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, regla o historia…" aria-label="Buscar cartas" />
        <select className={styles.select} value={type} onChange={(event) => setType(event.target.value as FilterValue<CardType>)} aria-label="Filtrar por tipo"><option value="all">Todos los tipos</option>{CARD_TYPES.map((value) => <option key={value} value={value}>{TYPE_LABELS[value]}</option>)}</select>
        <select className={styles.select} value={rarity} onChange={(event) => setRarity(event.target.value as FilterValue<Rarity>)} aria-label="Filtrar por rareza"><option value="all">Toda rareza</option>{RARITIES.map((value) => <option key={value} value={value}>{RARITY_LABELS[value]}</option>)}</select>
        <select className={styles.select} value={cost} onChange={(event) => setCost(event.target.value)} aria-label="Filtrar por coste"><option value="all">Cualquier coste</option><option value="0-2">Coste 0–2</option><option value="3-4">Coste 3–4</option><option value="5+">Coste 5+</option></select>
        <select className={styles.select} value={keyword} onChange={(event) => setKeyword(event.target.value)} aria-label="Filtrar por palabra clave"><option value="all">Toda palabra clave</option>{keywords.map((value) => <option key={value} value={value}>{KEYWORD_LABELS[value]}</option>)}</select>
        <select className={styles.select} value={sort} onChange={(event) => setSort(event.target.value as SortId)} aria-label="Ordenar las cartas">{SORTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
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
      <section className={styles.grid} aria-live="polite">{ordered.map((card) => <Card key={card.id} card={card} size="gallery" onSelect={setInspected} onInspect={setInspected} />)}{filtered.length === 0 && <div className={styles.empty}>Ninguna carta coincide con estos filtros.</div>}</section>
      <CardInspector card={inspected ?? null} onClose={() => setInspected(undefined)} />
    </div>
  )
}
