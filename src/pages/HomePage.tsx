import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.runes} aria-hidden="true" />
        <motion.figure className={`${styles.cardFan} ${styles.cardLeft}`} initial={{ x: -80, opacity: 0, rotate: -20 }} animate={{ x: 0, opacity: .9, rotate: -13 }} transition={{ duration: .8 }} aria-hidden="true">
          <img src="/assets/cards/art/dragon-caldera.svg" alt="" />
        </motion.figure>
        <motion.figure className={`${styles.cardFan} ${styles.cardRight}`} initial={{ x: 80, opacity: 0, rotate: 20 }} animate={{ x: 0, opacity: .9, rotate: 13 }} transition={{ duration: .8 }} aria-hidden="true">
          <img src="/assets/cards/art/tejedora-escarcha.svg" alt="" />
        </motion.figure>
        <motion.div className={styles.heroContent} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .65 }}>
          <div className={styles.eyebrow}>Juego táctico de cartas</div>
          <h1 className={styles.title}>CRÓNICAS <span>DEL NEXO</span></h1>
          <p className={styles.lead}>Domina el maná, despliega tus cartas sobre un tablero vivo y quiebra el Nexo de tu rival.</p>
          <div className={styles.buttons}>
            <Link className={styles.primary} to="/play">Iniciar partida</Link>
            <Link className={styles.secondary} to="/gallery">Explorar cartas</Link>
          </div>
        </motion.div>
      </section>

      <div className={styles.featureStrip} aria-label="Características del prototipo">
        <div className={styles.feature}><strong>5 × 5</strong><span>Tablero táctico</span></div>
        <div className={styles.feature}><strong>24</strong><span>Cartas originales</span></div>
        <div className={styles.feature}><strong>2 × 50</strong><span>Mazos completos</span></div>
        <div className={styles.feature}><strong>25</strong><span>Vida del Nexo</span></div>
      </div>

      <section className={styles.section}>
        <header className={styles.sectionHeader}><small>Elige tu vínculo</small><h2>Dos fuerzas despiertan</h2></header>
        <div className={styles.factions}>
          <article className={`${styles.faction} ${styles.fury}`}>
            <span className={styles.sigil}>♨</span><h3>Furia</h3>
            <p>Presión volcánica, criaturas veloces y golpes que dejan el campo ardiendo.</p>
            <div className={styles.tags}><span>Agresión</span><span>Fuego</span><span>Impulso</span></div>
          </article>
          <article className={`${styles.faction} ${styles.arcane}`}>
            <span className={styles.sigil}>◇</span><h3>Arcano</h3>
            <p>Controla el ritmo de la batalla con hielo, conocimiento y magia encadenada.</p>
            <div className={styles.tags}><span>Control</span><span>Hielo</span><span>Robo</span></div>
          </article>
        </div>
      </section>
    </div>
  )
}
