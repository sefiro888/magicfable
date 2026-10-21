import { useCallback, useState } from 'react'
import { useVisualTimers } from './useVisualTimers'

/** Los efectos se solapan aunque la cola cambie de evento. Sus temporizadores
 * pertenecen a cada entrada y al montaje, nunca al evento que viene después. */
export function useTransientEntries<T extends { readonly id: string }>(lifetimeMs: number) {
  const [entries, setEntries] = useState<readonly T[]>([])
  const schedule = useVisualTimers()
  const append = useCallback((entry: T) => {
    schedule(() => setEntries((current) => [...current, entry]), 0)
    schedule(() => setEntries((current) => current.filter((item) => item.id !== entry.id)), lifetimeMs)
  }, [lifetimeMs, schedule])
  return { entries, append } as const
}
