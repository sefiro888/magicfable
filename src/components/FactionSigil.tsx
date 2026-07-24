import type { FactionId } from '../game/types';
import { withBase } from '../utils/assets';
import styles from './FactionSigil.module.css';

export const FACTION_LABELS: Readonly<Record<FactionId, string>> = {
  fury: 'Furia',
  arcane: 'Arcano',
  nature: 'Naturaleza',
  order: 'Orden',
  shadow: 'Sombra',
  void: 'Vacío',
};

export interface FactionSigilProps {
  readonly faction: FactionId;
  readonly size?: 'small' | 'medium' | 'large';
  readonly decorative?: boolean;
  readonly className?: string;
  readonly title?: string;
}

export function FactionSigil({
  faction,
  size = 'medium',
  decorative = false,
  className,
  title,
}: FactionSigilProps) {
  const label = title ?? `Símbolo de ${FACTION_LABELS[faction]}`;
  const classes = [styles.sigil, styles[size], styles[faction], className].filter(Boolean).join(' ');
  return (
    <span
      className={classes}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      title={decorative ? undefined : label}
    >
      <img src={withBase(`/assets/factions/sigil-${faction}.webp`)} alt="" aria-hidden="true" />
    </span>
  );
}
