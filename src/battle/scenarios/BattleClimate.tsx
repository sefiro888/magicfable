import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

const StrainContext = createContext(0)
const clamp = (value: number) => Math.max(0, Math.min(1, value))

/** Lectura visual del estado ya resuelto. Promediar las dos vidas ocultaba
 * una crisis cuando el otro Nexo seguía intacto; se usa el más deteriorado.
 * Los turnos aportan solo un28% para que una partida larga sana no parezca
 * una derrota. Curar reduce la presión sin acumular otro estado de reglas. */
export function battleStrain(turn: number, nexuses: readonly { readonly health: number; readonly maxHealth: number }[]) {
  const age = clamp((turn - 6) / 24)
  const damage = Math.max(0, ...nexuses.map(({ health, maxHealth }) => clamp(1 - health / Math.max(1, maxHealth))))
  return clamp(age * 0.28 + damage * 0.72)
}

export function BattleClimateProvider({ strain, children }: { readonly strain: number; readonly children: ReactNode }) {
  return <StrainContext.Provider value={strain}>{children}</StrainContext.Provider>
}

export function useBattleStrain() {
  return useContext(StrainContext)
}
