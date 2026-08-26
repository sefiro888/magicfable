import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArtViewer, GlossaryPanel } from '../components'
import { FactionSigil } from '../components/FactionSigil'
import { COMMANDERS, PLAYABLE_FACTIONS, cardsForFaction, type CardDefinition, type FactionId } from '../game'
import { FACTION_LABELS } from '../utils/cardLabels'
import { withBase } from '../utils/assets'
import styles from './IllustrationsPage.module.css'

/**
 * Sección aparte de la Galería: aquí no se compara ni se filtra por coste,
 * solo se disfruta el arte. Por eso el flujo es en dos pasos —elige la
 * facción, lee su introducción, y SOLO ENTONCES aparecen sus ilustraciones—
 * en vez de volcar las 362 cartas de las 14 facciones juntas de golpe.
 */
export function IllustrationsPage() {
  const [params, setParams] = useSearchParams()
  const [inspected, setInspected] = useState<CardDefinition>()
  const [glossaryOpen, setGlossaryOpen] = useState(false)

  const factionParam = params.get('faccion') as FactionId | null
  const faction = factionParam && PLAYABLE_FACTIONS.some((candidate) => candidate.id === factionParam) ? factionParam : null
  const revealed = params.get('ver') === 'ilustraciones'

  const selectFaction = (id: FactionId) => setParams({ faccion: id })
  const reveal = () => setParams({ faccion: faction!, ver: 'ilustraciones' })
  const backToIntro = () => setParams({ faccion: faction! })
  const backToPicker = () => setParams({})

  const factionDef = faction ? PLAYABLE_FACTIONS.find((candidate) => candidate.id === faction)! : null
  const commander = useMemo(() => faction ? COMMANDERS.find((candidate) => candidate.faction === faction) : undefined, [faction])
  const cards = useMemo(() => faction ? cardsForFaction(faction) : [], [faction])

  // --- Paso 1: elegir facción ---
  if (!factionDef) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div><small>Archivo del Nexo</small><h1>Ilustraciones</h1></div>
          <button type="button" className={styles.headerButton} onClick={() => setGlossaryOpen(true)}>Glosario</button>
        </header>
        <p className={styles.intro}>Elige una facción para conocerla y ver su arte, sin marcos ni estadísticas de por medio.</p>
        <div className={styles.pickerGrid}>
          {PLAYABLE_FACTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={styles.pickerTile}
              data-faction={option.id}
              style={{ '--faction-color': option.color, '--faction-accent': option.accentColor } as CSSProperties}
              onClick={() => selectFaction(option.id)}
            >
              <FactionSigil faction={option.id} size="large" />
              <strong>{FACTION_LABELS[option.id]}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
        {glossaryOpen && <GlossaryPanel onClose={() => setGlossaryOpen(false)} />}
      </div>
    )
  }

  // --- Paso 2: introducción a la facción, sin arte todavía ---
  if (!revealed) {
    return (
      <div className={styles.page}>
        <button type="button" className={styles.back} onClick={backToPicker}>← Elegir otra facción</button>
        <section className={styles.introStage} data-faction={faction} style={{ '--faction-color': factionDef.color, '--faction-accent': factionDef.accentColor } as CSSProperties}>
          <FactionSigil faction={faction!} size="large" />
          <p className={styles.eyebrow}>Facción</p>
          <h1>{factionDef.name}</h1>
          <p className={styles.description}>{factionDef.description}</p>
          <div className={styles.themes}>{factionDef.themes.map((theme) => <span key={theme}>{theme}</span>)}</div>
          {commander && (
            <p className={styles.commanderLine}>Al mando: <strong>{commander.name}</strong>, {commander.title}</p>
          )}
          <p className={styles.cardCount}>{cards.length} diseños en esta facción</p>
          <button type="button" className={styles.reveal} onClick={reveal}>Ver ilustraciones →</button>
        </section>
      </div>
    )
  }

  // --- Paso 3: mosaico de ilustraciones limpias, solo de esta facción ---
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <button type="button" className={styles.back} onClick={backToIntro}>← Volver a {factionDef.name}</button>
          <h1 className={styles.galleryTitle}>{factionDef.name} · Ilustraciones</h1>
        </div>
        <button type="button" className={styles.headerButton} onClick={() => setGlossaryOpen(true)}>Glosario</button>
      </header>
      <section className={styles.artGrid} aria-live="polite">
        {cards.map((card) => (
          <button key={card.id} type="button" className={styles.artTile} onClick={() => setInspected(card)}>
            <img src={withBase(card.art.webp)} alt={card.art.alt} loading="lazy" decoding="async" draggable={false} />
            <span className={styles.artTileName}>{card.name}</span>
          </button>
        ))}
      </section>
      <ArtViewer card={inspected ?? null} onClose={() => setInspected(undefined)} />
      {glossaryOpen && <GlossaryPanel onClose={() => setGlossaryOpen(false)} />}
    </div>
  )
}
