import { usePreferences, type AiDifficulty, type GraphicsQuality, type ScenarioId } from '../store/preferences'
import styles from './SettingsPage.module.css'

const DIFFICULTY_OPTIONS: readonly { value: AiDifficulty; label: string; hint: string }[] = [
  { value: 'easy', label: 'Fácil', hint: 'El rival pelea en el tablero pero no remata tu Nexo. Ideal para aprender.' },
  { value: 'normal', label: 'Normal', hint: 'El rival juega a por la victoria con su táctica completa.' },
  { value: 'hard', label: 'Difícil', hint: 'El rival aprovecha cada apertura para golpear tu Nexo.' },
]

const SCENARIO_OPTIONS: readonly { value: ScenarioId; label: string; hint: string }[] = [
  { value: 'aether-citadel', label: 'Aether Citadel', hint: 'Ciudadela flotante al amanecer (Blender + GLB).' },
  { value: 'sanctuary', label: 'Santuario de las Runas', hint: 'Arena nocturna procedural original.' },
  { value: 'caldera', label: 'Fragua de la Caldera', hint: 'Las runas quebradas envueltas en brasa y fuego.' },
]

const QUALITY_OPTIONS: readonly { value: GraphicsQuality; label: string; hint: string }[] = [
  { value: 'low', label: 'Bajo', hint: 'Sin sombras ni partículas; máxima fluidez.' },
  { value: 'medium', label: 'Medio', hint: 'Equilibrio recomendado para equipos de gama media.' },
  { value: 'high', label: 'Alto', hint: 'Sombras, partículas y resolución completas.' },
]

const SPEED_OPTIONS = [
  { value: 1, label: 'Normal' },
  { value: 1.5, label: 'Rápida' },
  { value: 2, label: 'Muy rápida' },
] as const

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
          <h2>Gráficos</h2><p>El campo de batalla se adapta a tu equipo sin perder legibilidad.</p>
          <div className={styles.control}>
            <label htmlFor="scenario">Escenario de batalla</label>
            <select
              id="scenario"
              className={styles.select}
              value={settings.scenario}
              onChange={(event) => settings.setScenario(event.target.value as ScenarioId)}
            >
              {SCENARIO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <output>{SCENARIO_OPTIONS.find((option) => option.value === settings.scenario)?.hint}</output>
          </div>
          <div className={styles.control}>
            <label htmlFor="quality">Calidad visual</label>
            <select
              id="quality"
              className={styles.select}
              value={settings.graphicsQuality}
              onChange={(event) => settings.setGraphicsQuality(event.target.value as GraphicsQuality)}
            >
              {QUALITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <output>{QUALITY_OPTIONS.find((option) => option.value === settings.graphicsQuality)?.hint}</output>
          </div>
          <div className={styles.control}>
            <label htmlFor="animationSpeed">Velocidad de animaciones</label>
            <select
              id="animationSpeed"
              className={styles.select}
              value={settings.animationSpeed}
              onChange={(event) => settings.setAnimationSpeed(Number(event.target.value) as 1 | 1.5 | 2)}
            >
              {SPEED_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <output>×{settings.animationSpeed}</output>
          </div>
        </section>
        <section className={styles.section}>
          <h2>Accesibilidad y ritmo</h2><p>Ajusta la presentación sin alterar las reglas.</p>
          <div className={styles.toggleRow}><span><strong>Reducir movimiento</strong><small>Acorta transiciones, golpes de cámara y partículas.</small></span><button className={styles.toggle} data-on={settings.reducedMotion} onClick={() => settings.setReducedMotion(!settings.reducedMotion)} aria-label="Reducir movimiento" aria-pressed={settings.reducedMotion} /></div>
          <div className={styles.control}>
            <label htmlFor="aiDifficulty">Dificultad del rival</label>
            <select
              id="aiDifficulty"
              className={styles.select}
              value={settings.aiDifficulty}
              onChange={(event) => settings.setAiDifficulty(event.target.value as AiDifficulty)}
            >
              {DIFFICULTY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <output>{DIFFICULTY_OPTIONS.find((option) => option.value === settings.aiDifficulty)?.hint}</output>
          </div>
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
