import type { CSSProperties } from 'react'
import { CARD_BY_ID, COMMANDER_BY_ID, FACTION_BY_ID, type PlayerId } from '../../game'
import type { RecentPlay } from '../../battle/presentation'
import { withBase } from '../../utils/assets'
import styles from './RecentPlays.module.css'

interface RecentPlaysProps {
  readonly plays: readonly RecentPlay[]
  readonly me: PlayerId
  readonly onInspect: (cardId: string) => void
}

const KIND_ICON: Readonly<Record<RecentPlay['kind'], string>> = {
  spell: '✦', structure: '▲', power: '♛', summon: '⬇', attack: '⚔',
}

const KIND_LABEL: Readonly<Record<RecentPlay['kind'], string>> = {
  spell: 'Hechizo', structure: 'Estructura', power: 'Poder', summon: 'Invoca', attack: 'Ataca',
}

/**
 * Las últimas jugadas de ambos bandos en una tira lateral. Tras el turno de
 * la IA, que puede encadenar cinco o seis acciones, permite repasar qué ha
 * pasado sin abrir la crónica; con un clic se inspecciona la carta.
 */
export function RecentPlays({ plays, me, onInspect }: RecentPlaysProps) {
  if (plays.length === 0) return null
  return (
    <ol className={styles.strip} aria-label="Últimas jugadas">
      {plays.map((play) => {
        const card = play.cardId ? CARD_BY_ID[play.cardId] : undefined
        const commander = play.commanderId ? COMMANDER_BY_ID[play.commanderId] : undefined
        const art = card?.art ?? commander?.art
        const faction = card?.faction ?? commander?.faction
        const accent = faction ? FACTION_BY_ID[faction].accentColor : '#d8b46a'
        const name = card?.name ?? commander?.power.name ?? 'Jugada'
        const target = play.targetCardId ? CARD_BY_ID[play.targetCardId]?.name : play.targetLabel
        const description = `${play.owner === me ? 'Tú' : 'Rival'} · ${KIND_LABEL[play.kind]}: ${name}${target ? ` → ${target}` : ''}`
        return (
          <li key={play.id} data-owner={play.owner === me ? 'own' : 'rival'} style={{ '--accent': accent } as CSSProperties}>
            <button
              type="button"
              className={styles.chip}
              onClick={() => (card ? onInspect(card.id) : undefined)}
              aria-label={description}
              title={description}
            >
              {art && <img src={withBase(art.webp)} alt="" onError={(event) => { event.currentTarget.src = withBase(art.fallback) }} />}
              <span className={styles.kind} aria-hidden="true">{KIND_ICON[play.kind]}</span>
              <span className={styles.tip} aria-hidden="true">
                <small>{play.owner === me ? 'Tú' : 'Rival'} · {KIND_LABEL[play.kind]}</small>
                <strong>{name}</strong>
                {target && <em>→ {target}</em>}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
