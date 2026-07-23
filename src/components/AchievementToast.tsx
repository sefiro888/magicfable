import { useEffect, useRef, useState } from 'react'
import { useRecords } from '../store/records'
import { evaluateAchievements, type Achievement } from '../store/achievements'
import styles from './AchievementToast.module.css'

/**
 * Vigía global de logros: vive fuera del enrutado (en AppShell, que se
 * mantiene montado incluso en /battle) para avisar en el momento en que un
 * logro se desbloquea, en vez de que el jugador lo descubra días después al
 * visitar la página de Mazos.
 */
export function AchievementToast() {
  const records = useRecords((state) => state.records)
  const seen = useRef<Set<string> | undefined>(undefined)
  const [queue, setQueue] = useState<readonly Achievement[]>([])

  useEffect(() => {
    const achievements = evaluateAchievements(records)
    if (!seen.current) {
      // Primera vez que se evalúa en esta sesión: los ya conseguidos antes de
      // abrir la app no deben anunciarse de nuevo, solo los que se desbloqueen
      // a partir de ahora.
      seen.current = new Set(achievements.filter((achievement) => achievement.unlocked).map((achievement) => achievement.id))
      return
    }
    const newlyUnlocked = achievements.filter((achievement) => achievement.unlocked && !seen.current!.has(achievement.id))
    if (newlyUnlocked.length === 0) return
    for (const achievement of newlyUnlocked) seen.current.add(achievement.id)
    setQueue((current) => [...current, ...newlyUnlocked])
  }, [records])

  useEffect(() => {
    if (queue.length === 0) return
    const timer = window.setTimeout(() => setQueue((current) => current.slice(1)), 4200)
    return () => window.clearTimeout(timer)
  }, [queue])

  const current = queue[0]
  if (!current) return null

  return (
    <div className={styles.toast} role="status" key={current.id}>
      <span className={styles.icon} aria-hidden="true">{current.icon}</span>
      <div className={styles.body}>
        <small>Logro desbloqueado</small>
        <strong>{current.name}</strong>
      </div>
    </div>
  )
}
