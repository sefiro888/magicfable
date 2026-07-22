import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { usePreferences } from '../store/preferences'
import { playSynthCue } from '../services/audio'
import styles from './AppShell.module.css'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/play', label: 'Jugar' },
  { to: '/gallery', label: 'Galería' },
  { to: '/decks', label: 'Mazos' },
]

export function AppShell() {
  const location = useLocation()
  const { muted, effectsVolume, masterVolume, setMuted } = usePreferences()
  const isBattle = location.pathname === '/battle'

  const toggleSound = () => {
    if (muted) playSynthCue('ui', effectsVolume * masterVolume)
    setMuted(!muted)
  }

  if (isBattle) return <Outlet />

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.brand} aria-label="Crónicas del Nexo, inicio">
          <span className={styles.brandMark} aria-hidden="true"><span>✦</span></span>
          <span className={styles.brandText}>
            <strong>CRÓNICAS DEL NEXO</strong>
            <small>El destino está en tus cartas</small>
          </span>
        </NavLink>
        <nav className={styles.nav} aria-label="Navegación principal">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={styles.navLink}
              data-active={location.pathname === link.to}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.actions}>
          <button className={styles.iconButton} onClick={toggleSound} aria-label={muted ? 'Activar sonido' : 'Silenciar'} title={muted ? 'Activar sonido' : 'Silenciar'}>
            {muted ? '◌' : '♪'}
          </button>
          <NavLink className={styles.iconButton} to="/settings" aria-label="Ajustes" title="Ajustes">⚙</NavLink>
        </div>
      </header>
      <main className={styles.main}><Outlet /></main>
      <footer className={styles.footer}>
        <span>PROTOTIPO VERTICAL · PARTIDAS LOCALES</span>
        <span>6 FACCIONES · NEXO 25</span>
      </footer>
    </div>
  )
}
