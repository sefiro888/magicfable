import type { AnimationEvent } from '../game'

/** La contabilidad pasa rápido; golpes e invocaciones conservan su recorrido. */
const EVENT_PACE: Readonly<Partial<Record<AnimationEvent['type'], number>>> = {
  draw: 0.6, resource: 0.6, 'mana-flow': 0.5, reveal: 0.85, turn: 0.9,
}

/**
 * Director y render comparten el reloj: antes la cola aceleraba pero el shader
 * mantenía la duración original y desaparecía a media trayectoria a velocidad 2.
 */
export const eventDuration = (
  event: AnimationEvent,
  preferences: { readonly animationSpeed: number; readonly reducedMotion: boolean },
): number => preferences.reducedMotion
  ? 40
  : Math.max(70, event.durationMs * (EVENT_PACE[event.type] ?? 1) / Math.max(0.25, preferences.animationSpeed))
