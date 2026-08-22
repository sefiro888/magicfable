import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { COMMANDER_BY_ID, STARTER_DECKS } from '../game'
import { FactionSigil } from '../components'
import { playSynthCue } from '../services/audio'
import { usePreferences } from '../store/preferences'
import {
  BLESSINGS,
  TOWER_FLOORS,
  commanderOfDeck,
  opponentForFloor,
  towerMaxHealth,
  useTower,
  type BlessingId,
} from '../store/tower'
import { withBase } from '../utils/assets'
import styles from './TowerPage.module.css'

export function TowerPage() {
  const navigate = useNavigate()
  const preferences = usePreferences()
  const run = useTower((state) => state.run)
  const best = useTower((state) => state.best)
  const start = useTower((state) => state.start)
  const chooseBlessing = useTower((state) => state.chooseBlessing)
  const abandon = useTower((state) => state.abandon)

  const deckId = run?.deckId ?? preferences.selectedDeckId
  const deck = STARTER_DECKS.find((candidate) => candidate.id === deckId) ?? STARTER_DECKS[0]!
  const maxHealth = towerMaxHealth(deckId)

  /** Los seis pisos con su rival, para dibujar la escalera. */
  const floors = useMemo(() => {
    if (!run) return []
    return Array.from({ length: TOWER_FLOORS }, (_, index) => {
      const floor = index + 1
      const opponentId = opponentForFloor(run, floor)
      return {
        floor,
        opponentId,
        name: commanderOfDeck(opponentId),
        done: floor < run.floor || (floor === run.floor && run.awaitingBlessing),
        current: floor === run.floor && !run.awaitingBlessing,
      }
    })
  }, [run])

  const enterFloor = () => {
    if (!preferences.muted) playSynthCue('ui')
    navigate('/battle?tower=1')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <small>Modo desafío</small>
          <h1>Torre del Nexo</h1>
        </div>
        <p>
          Un combate contra cada facción, {TOWER_FLOORS} en total. Tu Nexo <strong>no se cura solo</strong>:
          la Vida que te quede es la que llevas al piso siguiente.
          <br />
          <span className={styles.note}>
            {best > 0 ? `Mejor marca: piso ${best} de ${TOWER_FLOORS}` : 'Aún sin marca'}
          </span>
        </p>
      </header>

      {!run && (
        <section className={styles.start}>
          <h2>Elige con qué mazo subes</h2>
          <p>No se puede cambiar a mitad de Torre. El último piso es un duelo contra tu propio comandante.</p>
          <div className={styles.deckPicker}>
            {STARTER_DECKS.map((candidate) => {
              const commander = COMMANDER_BY_ID[candidate.commanderId]
              const selected = candidate.id === preferences.selectedDeckId
              return (
                <button
                  key={candidate.id}
                  type="button"
                  className={styles.deckOption}
                  data-selected={selected}
                  aria-pressed={selected}
                  onClick={() => preferences.setSelectedDeck(candidate.id)}
                >
                  <FactionSigil faction={candidate.faction} size="large" decorative />
                  <strong>{candidate.name}</strong>
                  <small>{commander?.name}</small>
                </button>
              )
            })}
          </div>
          <button className={styles.primary} onClick={() => start(preferences.selectedDeckId)}>
            Comenzar la subida
          </button>
        </section>
      )}

      {run && (
        <section className={styles.run}>
          <div className={styles.status}>
            <div className={styles.statusHead}>
              <img src={withBase(COMMANDER_BY_ID[deck.commanderId]?.art.webp ?? '')} alt="" />
              <div>
                <strong>{commanderOfDeck(run.deckId)}</strong>
                <small>{deck.name}</small>
              </div>
            </div>
            <div className={styles.health} aria-label={`Vida del Nexo: ${run.health} de ${maxHealth}`}>
              <span className={styles.healthBar}>
                <span style={{ width: `${Math.round((run.health / maxHealth) * 100)}%` }} />
              </span>
              <strong>♥ {run.health}</strong>
              <small>de {maxHealth}</small>
            </div>
            {run.enemyPenalty > 0 && (
              <p className={styles.penalty}>El rival de este piso empieza con {run.enemyPenalty} de Vida menos.</p>
            )}
          </div>

          <ol className={styles.floors}>
            {floors.map((item) => (
              <li key={item.floor} className={styles.floor} data-done={item.done} data-current={item.current}>
                <span className={styles.floorNumber}>{item.done ? '✓' : item.floor}</span>
                <span className={styles.floorName}>{item.name}</span>
                {item.floor === TOWER_FLOORS && <span className={styles.mirror}>Duelo espejo</span>}
              </li>
            ))}
          </ol>

          {run.awaitingBlessing ? (
            <div className={styles.blessings}>
              <h2>Piso superado. Elige una bendición</h2>
              <div className={styles.blessingRow}>
                {(Object.keys(BLESSINGS) as BlessingId[]).map((id) => (
                  <button key={id} type="button" className={styles.blessing} onClick={() => chooseBlessing(id)}>
                    <strong>{BLESSINGS[id].name}</strong>
                    <span>{BLESSINGS[id].description}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.actions}>
              <button className={styles.primary} onClick={enterFloor}>
                Entrar al piso {run.floor} · {commanderOfDeck(opponentForFloor(run, run.floor))}
              </button>
              <button className={styles.abandonButton} onClick={abandon}>Abandonar la Torre</button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
