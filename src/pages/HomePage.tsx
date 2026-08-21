import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PLAYABLE_FACTIONS } from '../game'
import { FactionSigil } from '../components/FactionSigil'
import { evaluateAchievements } from '../store/achievements'
import { evaluateDailyChallenge } from '../store/dailyChallenge'
import { useMatchStore } from '../store/match'
import { useRecords } from '../store/records'
import { withBase } from '../utils/assets'
import { gameFacts, resumableMatch, summarizeForHome } from './home/homeSummary'
import styles from './HomePage.module.css'

export function HomePage() {
  const records = useRecords((state) => state.records)
  const match = useMatchStore((state) => state.match)
  const resume = useMemo(() => resumableMatch(match), [match])
  const me = useMemo(() => summarizeForHome(records), [records])
  const daily = useMemo(() => evaluateDailyChallenge(records), [records])
  const achievements = useMemo(() => evaluateAchievements(records), [records])
  const unlocked = achievements.filter((achievement) => achievement.unlocked).length
  const facts = useMemo(() => gameFacts(), [])

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.runes} aria-hidden="true" />
        <motion.figure className={`${styles.cardFan} ${styles.cardLeft}`} initial={{ x: -80, opacity: 0, rotate: -20 }} animate={{ x: 0, opacity: .9, rotate: -13 }} transition={{ duration: .8 }} aria-hidden="true">
          <img src={withBase('/assets/cards/art/dragon-caldera.webp')} alt="" />
        </motion.figure>
        <motion.figure className={`${styles.cardFan} ${styles.cardRight}`} initial={{ x: 80, opacity: 0, rotate: 20 }} animate={{ x: 0, opacity: .9, rotate: 13 }} transition={{ duration: .8 }} aria-hidden="true">
          <img src={withBase('/assets/cards/art/tejedora-escarcha.webp')} alt="" />
        </motion.figure>
        <motion.div className={styles.heroContent} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .65 }}>
          <div className={styles.eyebrow}>Juego táctico de cartas</div>
          <h1 className={styles.title}>CRÓNICAS <span>DEL NEXO</span></h1>
          <p className={styles.lead}>Canaliza la Esencia, despliega tus cartas sobre un tablero vivo y quiebra el Nexo de tu rival.</p>
          <div className={styles.buttons}>
            {/* Continuar manda sobre empezar de cero: si dejaste una partida a
                medias, es lo que quieres hacer al abrir el juego. */}
            {resume && <Link className={styles.primary} to="/battle">Continuar partida</Link>}
            <Link className={resume ? styles.secondary : styles.primary} to="/play">
              {resume ? 'Nueva escaramuza' : 'Iniciar partida'}
            </Link>
            <Link className={styles.secondary} to="/gallery">Explorar cartas</Link>
          </div>
          {resume && (
            <p className={styles.resume}>
              Turno {resume.turn} contra {resume.rivalCommanderName} · tu Nexo {resume.myNexus} — el suyo {resume.rivalNexus}
              {resume.myTurn ? ' · te toca mover' : ' · mueve el rival'}
            </p>
          )}
        </motion.div>
      </section>

      {/* Cifras derivadas de los datos reales: escritas a mano se quedan
          viejas al primer cambio de equilibrio y nadie se entera. */}
      <div className={styles.featureStrip} aria-label="Características del prototipo">
        <div className={styles.feature}><strong>{facts.board}</strong><span>Tablero táctico</span></div>
        <div className={styles.feature}><strong>{facts.cards}</strong><span>Cartas originales</span></div>
        <div className={styles.feature}><strong>{facts.decks} × {facts.cardsPerDeck}</strong><span>Mazos completos</span></div>
        <div className={styles.feature}><strong>{facts.nexusHealth}</strong><span>Vida del Nexo</span></div>
      </div>

      {/* Tu crónica: la portada no sabía nada de ti por muchas partidas que
          llevaras. Solo aparece cuando hay algo que contar. */}
      {me.hasHistory && (
        <section className={styles.you} aria-label="Tu progreso">
          <div className={styles.youStats}>
            <span><strong>{me.played}</strong><small>Escaramuzas</small></span>
            <span><strong>{me.won}</strong><small>Victorias</small></span>
            <span><strong>{me.winRate}%</strong><small>Acierto</small></span>
            <span data-streak={me.streak > 0 ? 'win' : me.streak < 0 ? 'loss' : undefined}>
              <strong>{me.streak === 0 ? '—' : `${me.streak > 0 ? '+' : ''}${me.streak}`}</strong>
              <small>{me.streak >= 0 ? 'Racha' : 'Racha adversa'}</small>
            </span>
            <span><strong>{unlocked}/{achievements.length}</strong><small>Logros</small></span>
          </div>
          <div className={styles.youAside}>
            <div className={styles.dailyCard} data-done={daily.done}>
              <small>Reto de hoy{daily.done ? ' · completado' : ''}</small>
              <strong>{daily.title}</strong>
              <span>{daily.description}</span>
            </div>
            {me.lastDeckName && <p className={styles.lastDeck}>Última partida con <strong>{me.lastDeckName}</strong></p>}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <header className={styles.sectionHeader}><small>Elige tu vínculo</small><h2>Seis fuerzas despiertan</h2></header>
        <div className={styles.factions}>
          {PLAYABLE_FACTIONS.map((faction) => (
            <article key={faction.id} className={`${styles.faction} ${styles[faction.id]}`}>
              <span className={styles.sigil}><FactionSigil faction={faction.id} size="large" decorative /></span>
              <h3>{faction.name}</h3>
              <p>{faction.description}</p>
              <div className={styles.tags}>{faction.themes.map((theme) => <span key={theme}>{theme}</span>)}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
