import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CARD_BY_ID, COMMANDER_BY_ID, FACTION_BY_ID, STARTER_DECKS } from '../game'
import { usePreferences } from '../store/preferences'
import { useRecords } from '../store/records'
import { evaluateDailyChallenge } from '../store/dailyChallenge'
import { playSynthCue } from '../services/audio'
import { withBase } from '../utils/assets'
import styles from './PlayPage.module.css'

const showcase: Record<string, readonly string[]> = {
  fury:   ['sabueso-brasa', 'dragon-caldera', 'lluvia-ceniza'],
  arcane: ['centinela-cristal', 'tejedora-escarcha', 'cometa-arcano'],
  nature: ['ciervo-sagrado', 'oso-forestal', 'crecimiento-salvaje'],
  order:  ['angel-celestial', 'paladin-glorioso', 'juicio-divino'],
  shadow: ['murcielago-sombra', 'nigromante-oscuro', 'pesadilla-mortal'],
  void:   ['basilisco-caos', 'leviatan-abismal', 'aniquilacion-vacio'],
}

const DECK_DESCRIPTIONS: Readonly<Record<string, string>> = {
  fury:   'Ataca pronto, domina la primera línea y convierte cada intercambio en brasas.',
  arcane: 'Frena el avance rival, congela sus piezas y gana ventaja con conocimiento.',
  nature: 'Crece sin prisa, cura tus unidades y aplasta al rival con la fuerza del bosque.',
  order:  'Forma una línea defensiva infranqueable y castiga con la justicia del Orden.',
  shadow: 'Drena la vida enemiga, revive desde el cementerio y conquista con el miedo.',
  void:   'Distorsiona el espacio, aniquila estructuras y golpea antes de que te vean venir.',
}

export function PlayPage() {
  const navigate = useNavigate()
  const preferences = usePreferences()
  const records = useRecords((state) => state.records)
  const daily = useMemo(() => evaluateDailyChallenge(records), [records])
  const deck = useMemo(() => STARTER_DECKS.find((candidate) => candidate.id === preferences.selectedDeckId) ?? STARTER_DECKS[0], [preferences.selectedDeckId])

  const start = () => {
    if (!preferences.muted) playSynthCue('ui', preferences.masterVolume * preferences.effectsVolume)
    navigate('/battle')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div><small>Escaramuza contra la IA</small><h1>Selecciona tu mazo</h1></div>
        <p>Cada mazo contiene 50 cartas y un comandante. Tu rival utilizará la facción opuesta.<br /><span className={styles.note}>Nexo a 25 · tablero 8 × 8</span></p>
      </header>
      <div className={styles.daily} data-done={daily.done}>
        <span className={styles.dailyBadge}>{daily.done ? '✓' : '◆'}</span>
        <div className={styles.dailyBody}>
          <small>Reto de hoy{daily.done ? ' · completado' : ''}</small>
          <strong>{daily.title}</strong>
          <span>{daily.description}</span>
        </div>
      </div>
      <div className={styles.decks}>
        {STARTER_DECKS.map((candidate) => {
          const commander = COMMANDER_BY_ID[candidate.commanderId]
          const selected = candidate.id === deck?.id
          return (
            <div key={candidate.id} className={`${styles.deck} ${styles[candidate.faction]}`} data-selected={selected}>
              {/* display:contents: es el botón que selecciona el mazo (para que
                  el lector de pantalla lo anuncie como tal), pero sin envolver
                  en él la caja visual, así el botón «Entrar al tablero» de
                  abajo puede ser un elemento hermano en vez de ir anidado
                  dentro de otro botón. */}
              <button type="button" className={styles.deckSelect} aria-pressed={selected} onClick={() => preferences.setSelectedDeck(candidate.id)}>
                {selected && <span className={styles.selected}>Seleccionado</span>}
                <div className={styles.deckArt} aria-hidden="true">
                  {showcase[candidate.faction]?.map((cardId) => {
                    const art = CARD_BY_ID[cardId]?.art.webp
                    return art ? <img key={cardId} src={withBase(art)} alt="" /> : null
                  })}
                </div>
                <h2>{candidate.name}</h2>
                <div className={styles.commander}>{commander?.name} · {commander?.title}</div>
                <p className={styles.description}>{DECK_DESCRIPTIONS[candidate.faction]}</p>
                <div className={styles.metrics}><span>Cartas<strong>50</strong></span><span>Fuentes<strong>20</strong></span><span>Identidad<strong>{FACTION_BY_ID[candidate.faction].name}</strong></span></div>
              </button>
              {/* Solo en la tarjeta ya elegida: así el botón para empezar
                  aparece justo donde el jugador acaba de hacer clic, en vez
                  de obligarle a bajar hasta el final de la página. */}
              {selected && (
                <button className={styles.enterBoard} onClick={start}>Entrar al tablero →</button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
