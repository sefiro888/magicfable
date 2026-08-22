import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CARD_BY_ID, COMMANDER_BY_ID, COMMANDERS, FACTION_BY_ID, STARTER_DECKS, commanderForDeck } from '../game'
import { usePreferences, type AiDifficulty, type ScenarioId } from '../store/preferences'
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

/** Opciones del rival: el sorteo de siempre, o cualquiera de las otras cinco facciones. */
const DIFFICULTIES: readonly { value: AiDifficulty; label: string; hint: string }[] = [
  { value: 'easy', label: 'Fácil', hint: 'Pelea en el tablero pero no remata tu Nexo.' },
  { value: 'normal', label: 'Normal', hint: 'Ataca en cuanto tiene algo a tiro.' },
  { value: 'hard', label: 'Difícil', hint: 'Estudia el tablero entero antes de mover.' },
]

const SCENARIOS: readonly { value: ScenarioId; label: string; hint: string }[] = [
  { value: 'auto', label: 'Según tu facción', hint: 'Cada facción pelea en su casa: la Caldera arde, Duna abrasa, el Santuario es de noche.' },
  { value: 'aether-citadel', label: 'Aether Citadel', hint: 'Plaza de mármol al amanecer, sobre un mar de nubes.' },
  { value: 'sanctuary', label: 'Santuario de las Runas', hint: 'Círculo de monolitos en una isla, de noche.' },
  { value: 'caldera', label: 'Fragua de la Caldera', hint: 'Plataforma de hierro sobre un lago de lava.' },
  { value: 'duna', label: 'Necrópolis de Duna', hint: 'Patio de arenisca abierto al desierto, a mediodía.' },
]

export function PlayPage() {
  const navigate = useNavigate()
  const preferences = usePreferences()
  const records = useRecords((state) => state.records)
  const daily = useMemo(() => evaluateDailyChallenge(records), [records])
  const deck = useMemo(() => STARTER_DECKS.find((candidate) => candidate.id === preferences.selectedDeckId) ?? STARTER_DECKS[0], [preferences.selectedDeckId])

  const rival = useMemo(
    () => STARTER_DECKS.find((candidate) => candidate.id === preferences.opponentDeckId),
    [preferences.opponentDeckId],
  )
  const rivalHint = rival
    ? DECK_DESCRIPTIONS[rival.faction] ?? ''
    : 'Se sortea entre las otras cinco facciones al empezar.'

  const start = () => {
    if (!preferences.muted) playSynthCue('ui')
    navigate('/battle')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div><small>Escaramuza contra la IA</small><h1>Selecciona tu mazo</h1></div>
        <p>Cada mazo contiene 50 cartas y un comandante.<br /><span className={styles.note}>Nexo a 35 · tablero 8 × 8</span></p>
      </header>
      <div className={styles.daily} data-done={daily.done}>
        <span className={styles.dailyBadge}>{daily.done ? '✓' : '◆'}</span>
        <div className={styles.dailyBody}>
          <small>Reto de hoy{daily.done ? ' · completado' : ''}</small>
          <strong>{daily.title}</strong>
          <span>{daily.description}</span>
        </div>
      </div>
      {/* Preparativos de la escaramuza: hasta ahora el rival lo sorteaba la
          semilla sin que se pudiera elegir, y la dificultad y el escenario
          estaban escondidos en Ajustes — tres decisiones de partida que se
          toman justo aquí, antes de entrar. */}
      <section className={styles.setup} aria-label="Preparativos de la escaramuza">
        <div className={styles.setupField}>
          <label htmlFor="rival">Rival</label>
          <select
            id="rival"
            value={preferences.opponentDeckId}
            onChange={(event) => preferences.setOpponentDeck(event.target.value)}
          >
            <option value="random">Al azar</option>
            {STARTER_DECKS.filter((candidate) => candidate.id !== deck?.id).map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {COMMANDER_BY_ID[candidate.commanderId]?.name} · {candidate.name}
              </option>
            ))}
          </select>
          <small>{rivalHint}</small>
        </div>
        <div className={styles.setupField}>
          <label htmlFor="difficulty">Dificultad</label>
          <select
            id="difficulty"
            value={preferences.aiDifficulty}
            onChange={(event) => preferences.setAiDifficulty(event.target.value as AiDifficulty)}
          >
            {DIFFICULTIES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <small>{DIFFICULTIES.find((option) => option.value === preferences.aiDifficulty)?.hint}</small>
        </div>
        <div className={styles.setupField}>
          <label htmlFor="stage">Escenario</label>
          <select
            id="stage"
            value={preferences.scenario}
            onChange={(event) => preferences.setScenario(event.target.value as ScenarioId)}
          >
            {SCENARIOS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <small>{SCENARIOS.find((option) => option.value === preferences.scenario)?.hint}</small>
        </div>
      </section>
      <div className={styles.decks}>
        {STARTER_DECKS.map((candidate) => {
          const commander = commanderForDeck(candidate, preferences.commanderByDeck[candidate.id])
          const leaders = COMMANDERS.filter((option) => option.faction === candidate.faction)
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
              {/* El líder se elige FUERA del botón de seleccionar mazo: un botón
                  dentro de otro no es HTML válido y el lector de pantalla no
                  sabría cuál está anunciando. */}
              {selected && leaders.length > 1 && (
                <div className={styles.leaderPicker} role="group" aria-label={`Comandante de ${candidate.name}`}>
                  <span className={styles.leaderLabel}>Al mando</span>
                  <div className={styles.leaderOptions}>
                    {leaders.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={styles.leaderOption}
                        aria-pressed={option.id === commander.id}
                        data-selected={option.id === commander.id}
                        onClick={() => preferences.setCommander(candidate.id, option.id)}
                        title={option.rules}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                  <small className={styles.leaderRules}>{commander.rules}</small>
                </div>
              )}
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
