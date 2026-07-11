import { usePreferences } from '../store/preferences'
import styles from './SettingsPage.module.css'

export function SettingsPage() {
  const settings = usePreferences()
  const volumes = [
    ['masterVolume', 'Volumen general'],
    ['musicVolume', 'Música'],
    ['effectsVolume', 'Efectos'],
  ] as const

  return (
    <div className={styles.page}>
      <header className={styles.header}><small>Preferencias locales</small><h1>Ajustes</h1><p>Los cambios se guardan automáticamente en este dispositivo.</p></header>
      <div className={styles.panel}>
        <section className={styles.section}>
          <h2>Sonido</h2><p>Mezcla los avisos sintetizados del prototipo.</p>
          {volumes.map(([key, label]) => (
            <div className={styles.control} key={key}>
              <label htmlFor={key}>{label}</label>
              <input id={key} type="range" min="0" max="1" step="0.05" value={settings[key]} onChange={(event) => settings.setVolume(key, Number(event.target.value))} />
              <output>{Math.round(settings[key] * 100)}%</output>
            </div>
          ))}
          <div className={styles.toggleRow}><span><strong>Silenciar todo</strong><small>Conserva tus niveles de mezcla.</small></span><button className={styles.toggle} data-on={settings.muted} onClick={() => settings.setMuted(!settings.muted)} aria-label="Silenciar todo" aria-pressed={settings.muted} /></div>
        </section>
        <section className={styles.section}>
          <h2>Accesibilidad y ritmo</h2><p>Ajusta la presentación sin alterar las reglas.</p>
          <div className={styles.toggleRow}><span><strong>Reducir movimiento</strong><small>Acorta transiciones, golpes de cámara y partículas.</small></span><button className={styles.toggle} data-on={settings.reducedMotion} onClick={() => settings.setReducedMotion(!settings.reducedMotion)} aria-label="Reducir movimiento" aria-pressed={settings.reducedMotion} /></div>
          <div className={styles.control}>
            <label htmlFor="aiDelay">Pausa de la IA</label>
            <input id="aiDelay" type="range" min="150" max="1200" step="50" value={settings.aiDelayMs} onChange={(event) => settings.setAiDelay(Number(event.target.value))} />
            <output>{settings.aiDelayMs}ms</output>
          </div>
          <button className={styles.reset} onClick={settings.reset}>Restaurar valores</button>
        </section>
      </div>
    </div>
  )
}
