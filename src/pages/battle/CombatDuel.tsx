import { useEffect, type CSSProperties } from 'react'
import { Card } from '../../components'
import { CARD_BY_ID, COMMANDER_BY_ID, FACTION_BY_ID, type PlayerId } from '../../game'
import { inspectionStatuses } from '../../battle/inspectionStatuses'
import { combatTraits, type CombatExchange, type CombatSide } from '../../battle/presentation'
import { withBase } from '../../utils/assets'
import styles from './CombatDuel.module.css'

interface CombatDuelProps {
  readonly exchange: CombatExchange
  readonly me: PlayerId
  /** Comandante de cada bando, para poner cara al Nexo cuando es el objetivo. */
  readonly commanderIds: Readonly<Record<PlayerId, string>>
  /** Vida actual de cada Nexo: si el objetivo es un Nexo, cuánto le queda importa más que su nombre. */
  readonly nexusHealth: Readonly<Record<PlayerId, number>>
  /** El golpe aún no ha caído: se puede adelantar con un clic. */
  readonly holding: boolean
  readonly onSkip: () => void
}

function Fighter({ side, role, me, commanderIds, nexusHealth, phase, holding }: {
  side: CombatSide
  role: 'attacker' | 'defender'
  me: PlayerId
  commanderIds: CombatDuelProps['commanderIds']
  nexusHealth: CombatDuelProps['nexusHealth']
  phase: CombatExchange['phase']
  holding: boolean
}) {
  const card = side.cardId ? CARD_BY_ID[side.cardId] : undefined
  const owner = side.owner === me ? 'own' : 'rival'
  const commander = COMMANDER_BY_ID[commanderIds[side.owner]]
  const accent = card ? FACTION_BY_ID[card.faction].accentColor : commander ? FACTION_BY_ID[commander.faction].accentColor : '#d8b46a'
  const traits = combatTraits(side, role)
  return (
    <div
      className={styles.fighter}
      data-role={role}
      data-owner={owner}
      data-phase={phase}
      data-destroyed={side.destroyed || undefined}
      data-hit={side.damage > 0 || undefined}
      style={{ '--accent': accent } as CSSProperties}
    >
      <div className={styles.tag}>
        <span className={styles.role}>{role === 'attacker' ? <><span className={styles.swords}>⚔</span> Ataca</> : 'Defiende'}</span>
        <span className={styles.owner}>{owner === 'own' ? 'Tu bando' : 'Rival'}</span>
      </div>
      <div className={styles.cardWrap}>
        <span className={styles.glow} />
        {card
          ? <Card card={card} size="hand" reducedMotion statusEffects={inspectionStatuses(side.piece)} />
          : (
            <div className={styles.nexusPlate}>
              {commander && <img src={withBase(commander.art.webp)} alt="" />}
              <strong>Nexo</strong>
              <small>{commander?.name}</small>
              <span className={styles.nexusLife}>♥ {nexusHealth[side.owner]}</span>
            </div>
          )}
        {side.damage > 0 && <span key={side.damage} className={styles.damage}>−{side.damage}</span>}
        {side.absorbed > 0 && <span key={`a${side.absorbed}`} className={styles.absorbed}>⬡ {side.absorbed}</span>}
        {side.destroyed && <span className={styles.stamp}>{side.nexus ? 'Herido' : 'Destruida'}</span>}
      </div>
      {traits.length > 0 && (
        <ul className={styles.traits}>
          {traits.map((trait) => (
            <li key={trait.id} data-active={trait.active || undefined}>
              <strong>{trait.label}</strong>
              <small>{trait.active ? `¡Actúa! ${trait.detail}` : trait.detail}</small>
            </li>
          ))}
        </ul>
      )}
      {role === 'attacker' && holding && <span className={styles.skip}>Clic para golpear ya</span>}
    </div>
  )
}

/**
 * Duelo de combate: las dos cartas que chocan, grandes y a los lados del
 * tablero para no tapar la embestida. Sustituye a un rótulo de retratos
 * diminutos donde los nombres salían cortados y no se veía qué carta era ni
 * qué habilidades entraban en juego.
 */
export function CombatDuel({ exchange, me, commanderIds, nexusHealth, holding, onSkip }: CombatDuelProps) {
  const { attacker, defender } = exchange

  useEffect(() => {
    if (!holding) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter' && event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      onSkip()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [holding, onSkip])

  const summary = `${attacker.name} ataca a ${defender.name}${defender.damage ? `, ${defender.damage} de daño` : ''}${defender.destroyed ? ', cae' : ''}${attacker.damage ? `; recibe ${attacker.damage}` : ''}${attacker.destroyed ? ' y cae' : ''}.`
  return (
    <div
      key={exchange.key}
      className={styles.duel}
      data-phase={exchange.phase}
      data-holding={holding || undefined}
      onClick={holding ? onSkip : undefined}
      data-testid="combat-duel"
    >
      <p className={styles.srOnly} role="status" aria-live="polite">{summary}</p>
      {/* Sin emblema central: arriba en el centro está el Nexo rival, que es
          justo lo que hay que ver cuando es el objetivo. */}
      <Fighter side={attacker} role="attacker" me={me} commanderIds={commanderIds} nexusHealth={nexusHealth} phase={exchange.phase} holding={holding} />
      <Fighter side={defender} role="defender" me={me} commanderIds={commanderIds} nexusHealth={nexusHealth} phase={exchange.phase} holding={holding} />
    </div>
  )
}
