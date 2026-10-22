import type { CSSProperties } from 'react'
import type { CommanderDefinition } from '../../game'
import { FACTION_BY_ID } from '../../game/factions'
import { FactionSigil, FACTION_LABELS } from '../../components/FactionSigil'
import { GameIcon } from '../../components/GameIcon'
import { SCENARIO_PRESENTATION } from '../../battle/scenarioPresentation'
import type { ScenarioId } from '../../store/preferences'
import { withBase } from '../../utils/assets'
import styles from './CommanderDuel.module.css'

function CommanderWing({ commander, rival }: { readonly commander: CommanderDefinition; readonly rival?: boolean }) {
  return <div className={styles.wing} data-rival={rival || undefined}
    style={{ '--commander-accent': FACTION_BY_ID[commander.faction].accentColor } as CSSProperties}>
    <img className={styles.art} src={withBase(commander.art.webp)} alt="" draggable={false}
      onError={(event) => {
        const image = event.currentTarget
        if (image.dataset.fallback) return
        image.dataset.fallback = 'true'
        image.src = withBase(commander.art.fallback)
      }} />
    <div className={styles.engraving} aria-hidden="true" />
    <div className={styles.identity}>
      <span className={styles.side}>{rival ? 'Comandante rival' : 'Tu comandante'}</span>
      <FactionSigil faction={commander.faction} size="large" decorative className={styles.sigil} />
      <h3>{commander.name}</h3>
      <p>{commander.title}</p>
      <span className={styles.faction}>{FACTION_LABELS[commander.faction]}</span>
    </div>
  </div>
}

export function CommanderDuel({ own, opponent, scenario, reducedMotion }: {
  readonly own: CommanderDefinition
  readonly opponent: CommanderDefinition
  readonly scenario: Exclude<ScenarioId, 'auto'>
  readonly reducedMotion: boolean
}) {
  const place = SCENARIO_PRESENTATION[scenario]
  return <section className={styles.duel} aria-label="Comandantes y escenario" data-reduced-motion={reducedMotion || undefined}
    style={{ '--scene-accent': place.accent } as CSSProperties}>
    <header className={styles.place}>
      <span>Campo de batalla</span>
      <h3>{place.name}</h3>
      <small>{place.setting}</small>
    </header>
    <div className={styles.pair}>
      <CommanderWing commander={own} />
      <div className={styles.versus} aria-hidden="true"><GameIcon name="attack" /><span>Contra</span></div>
      <CommanderWing commander={opponent} rival />
    </div>
  </section>
}
