import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PLAYABLE_FACTIONS } from '../game'
import { FactionSigil } from '../components/FactionSigil'
import { withBase } from '../utils/assets'
import styles from './HomePage.module.css'

export function HomePage() {
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
            <Link className={styles.primary} to="/play">Iniciar partida</Link>
            <Link className={styles.secondary} to="/gallery">Explorar cartas</Link>
          </div>
        </motion.div>
      </section>

      <div className={styles.featureStrip} aria-label="Características del prototipo">
        <div className={styles.feature}><strong>8 × 8</strong><span>Tablero táctico</span></div>
        <div className={styles.feature}><strong>90</strong><span>Cartas originales</span></div>
        <div className={styles.feature}><strong>6 × 50</strong><span>Mazos completos</span></div>
        <div className={styles.feature}><strong>25</strong><span>Vida del Nexo</span></div>
      </div>

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
