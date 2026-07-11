import type { FactionId } from '../game/types';
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

const iconForFaction = (faction: FactionId) => {
  switch (faction) {
    case 'fury':
      return (
        <>
          <path d="M25 4c2 10-7 13-4 23 2-5 6-7 9-12 7 8 10 15 6 23-3 6-9 9-15 9C10 47 4 39 7 29c2-7 8-11 10-20 4 4 5 9 4 14 5-5 7-11 4-19Z" />
          <path className={styles.inner} d="M25 27c5 5 5 12 0 15-5 3-11-1-10-7 1-4 4-6 5-10 2 2 2 5 2 7 2-1 3-3 3-5Z" />
        </>
      );
    case 'arcane':
      return (
        <>
          <path d="m24 3 14 12-5 25-9 8-10-8-5-25L24 3Z" />
          <path className={styles.inner} d="m24 10 7 8-3 17-4 5-5-5-3-17 8-8Zm0 5-3 6 3 10 3-10-3-6Z" />
        </>
      );
    case 'nature':
      return (
        <>
          <path d="M42 6C24 7 10 15 8 28c-2 9 4 16 12 17 12 1 22-10 22-39Z" />
          <path className={styles.inner} d="M36 12C27 20 20 28 13 39m5-8c5-1 10 0 14 3M23 25c0-4 1-8 3-11" />
        </>
      );
    case 'order':
      return (
        <>
          <path d="M24 3 42 10v13c0 12-7 21-18 26C13 44 6 35 6 23V10l18-7Z" />
          <path className={styles.inner} d="M24 10v30m-11-18h22M24 13l4 8-4 4-4-4 4-8Z" />
        </>
      );
    case 'shadow':
      return (
        <>
          <path d="M39 8c-12 2-20 11-20 22 0 7 4 13 10 17C15 48 5 40 5 27 5 14 16 4 29 4c4 0 7 1 10 4Z" />
          <path className={styles.inner} d="M32 16c7 2 11 7 12 14-4-3-8-4-12-4s-8 1-12 4c1-7 5-12 12-14Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" />
        </>
      );
    case 'void':
      return (
        <>
          <path d="M24 4c12 0 21 8 21 19 0 13-11 22-26 22C9 45 3 38 3 30 3 19 12 12 25 12c8 0 14 5 14 12 0 8-7 14-16 14-7 0-12-4-12-9 0-6 5-10 12-10 5 0 9 3 9 7 0 3-3 6-7 6-3 0-5-2-5-4 0-2 2-4 5-4" />
        </>
      );
  }
};

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
      <svg viewBox="0 0 48 52" focusable="false" aria-hidden="true">
        {iconForFaction(faction)}
      </svg>
    </span>
  );
}
