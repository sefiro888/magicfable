import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CARD_BY_ID, COMMANDER_BY_ID, STARTER_DECKS } from '../game'
import { usePreferences } from '../store/preferences'
import { playSynthCue } from '../services/audio'
import { withBase } from '../utils/assets'
import styles from './PlayPage.module.css'

const showcase: Record<string, readonly string[]> = {
  fury: ['sabueso-brasa', 'dragon-caldera', 'lluvia-ceniza'],
  arcane: ['centinela-cristal', 'tejedora-escarcha', 'cometa-arcano'],
}

export function PlayPage() {
  const navigate = useNavigate()
  const preferences = usePreferences()
  const deck = useMemo(() => STARTER_DECKS.find((candidate) => candidate.id === preferences.selectedDeckId) ?? STARTER_DECKS[0], [preferences.selectedDeckId])

  const start = () => {
    if (!preferences.muted) playSynthCue('ui', preferences.masterVolume * preferences.effectsVolume)
    navigate('/battle')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div><small>Escaramuza contra la IA</small><h1>Selecciona tu mazo</h1></div>
        <p>Cada mazo contiene 50 cartas y un comandante. Tu rival utilizará la facción opuesta.</p>
      </header>
      <div className={styles.decks}>
        {STARTER_DECKS.map((candidate) => {
          const commander = COMMANDER_BY_ID[candidate.commanderId]
          const selected = candidate.id === deck?.id
          return (
            <button key={candidate.id} className={`${styles.deck} ${styles[candidate.faction]}`} data-selected={selected} onClick={() => preferences.setSelectedDeck(candidate.id)} aria-pressed={selected}>
              {selected && <span className={styles.selected}>Seleccionado</span>}
              <div className={styles.deckArt} aria-hidden="true">
                {showcase[candidate.faction]?.map((cardId) => {
                  const art = CARD_BY_ID[cardId]?.art.webp
                  return art ? <img key={cardId} src={withBase(art)} alt="" /> : null
                })}
              </div>
              <h2>{candidate.name}</h2>
              <div className={styles.commander}>{commander?.name} · {commander?.title}</div>
              <p className={styles.description}>{candidate.faction === 'fury' ? 'Ataca pronto, domina la primera línea y convierte cada intercambio en brasas.' : 'Frena el avance rival, congela sus piezas y gana ventaja con conocimiento.'}</p>
              <div className={styles.metrics}><span>Cartas<strong>50</strong></span><span>Fuentes<strong>20</strong></span><span>Identidad<strong>{candidate.faction === 'fury' ? 'Furia' : 'Arcano'}</strong></span></div>
            </button>
          )
        })}
      </div>
      <div className={styles.startRow}><button className={styles.start} onClick={start}>Entrar al tablero</button><span className={styles.note}>Nexo a 25 · tablero 8 × 8</span></div>
      <div className={styles.locked}><span>Próximas crónicas</span><div className={styles.lockedFactions}><span>◆ Naturaleza</span><span>☼ Orden</span><span>◐ Sombra</span><span>◎ Vacío</span></div></div>
    </div>
  )
}
