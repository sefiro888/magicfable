import type { ScenarioId } from '../store/preferences'
import { SCENARIO_PRESENTATION } from './scenarioPresentation'

/** Ajustes se había quedado con tres sitios mientras Jugar ofrecía diez.
 * Derivar ambos selectores de la presentación evita perder escenarios nuevos. */
export const SCENARIO_OPTIONS: readonly { value: ScenarioId; label: string; hint: string }[] = [
  { value: 'auto', label: 'Según tu facción', hint: 'El escenario acompaña a la facción de tu mazo.' },
  ...Object.entries(SCENARIO_PRESENTATION).map(([value, profile]) => ({
    value: value as Exclude<ScenarioId, 'auto'>, label: profile.name, hint: profile.setting,
  })),
]
