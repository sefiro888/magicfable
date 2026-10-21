import { useCallback, useEffect, useRef } from 'react'

/** Cambiar de evento no cancela efectos que aún están desvaneciéndose;
 * abandonar la escena sí debe cancelar todas sus escrituras pendientes. */
export function useVisualTimers() {
  const timers = useRef(new Set<number>())
  const schedule = useCallback((callback: () => void, delayMs: number) => {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer)
      callback()
    }, delayMs)
    timers.current.add(timer)
  }, [])
  useEffect(() => {
    const active = timers.current
    return () => {
      active.forEach((timer) => window.clearTimeout(timer))
      active.clear()
    }
  }, [])
  return schedule
}
