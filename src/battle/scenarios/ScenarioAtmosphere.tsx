import type { ScenarioId } from '../../store/preferences'

interface Atmosphere {
  readonly background: string
  readonly fog: readonly [string, number, number]
}

const ATMOSPHERE: Readonly<Record<Exclude<ScenarioId, 'auto'>, Atmosphere>> = {
  'aether-citadel': { background: '#7c8da8', fog: ['#90a1b5', 16, 48] },
  caldera: { background: '#20242d', fog: ['#35343c', 18, 49] },
  sanctuary: { background: '#121e28', fog: ['#253742', 20, 52] },
  duna: { background: '#d8c5a8', fog: ['#d4bd97', 22, 60] },
  fimbul: { background: '#17232e', fog: ['#263b4a', 21, 57] },
  grove: { background: '#20291d', fog: ['#46513e', 20, 52] },
  shore: { background: '#34464f', fog: ['#7b9094', 22, 65] },
  foundry: { background: '#14100c', fog: ['#3a2b22', 14, 62] },
  'jade-court': { background: '#1d2436', fog: ['#8f9aa8', 18, 74] },
  'wheel-ghat': { background: '#2a2438', fog: ['#9aa4b8', 12, 58] },
}

/** Debe ser hijo directo de Scene, fuera del grupo que gira para el invitado.
 * Un attach dentro de ese grupo creaba Group.background/Group.fog: Three no
 * los lee, dejaba el fondo negro y no aplicaba ninguna niebla de escenario. */
export function ScenarioAtmosphere({ scenario }: { readonly scenario: ScenarioId }) {
  const profile = ATMOSPHERE[scenario === 'auto' ? 'sanctuary' : scenario]
  return <>
    <color attach="background" args={[profile.background]} />
    <fog attach="fog" args={[...profile.fog]} />
  </>
}
