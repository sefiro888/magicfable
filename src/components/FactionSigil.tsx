import { useState, type ReactNode } from 'react';
import { FACTION_BY_ID } from '../game/factions';
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
  duna: 'Duna',
  fimbul: 'Fimbul',
  samsara: 'Samsara',
  jade: 'Jade',
  olimpo: 'Olimpo',
  sol: 'Quinto Sol',
};

/**
 * Glifos vectoriales propios para facciones que todavía no tienen su
 * ilustración de sigilo (`sigil-<facción>.webp`) encargada. Es el respaldo
 * cuando esa imagen no existe o falla al cargar — antes caía en un simple
 * monograma con la inicial, muy pobre al lado de los sigilos ilustrados de
 * las facciones originales. Cada uno es una figura simple y reconocible del
 * tema de su facción, en el mismo espíritu que un escudo o un anillo.
 */
const CUSTOM_GLYPHS: Partial<Record<FactionId, (color: string) => ReactNode>> = {
  // Fimbul: el hacha del Desafío.
  fimbul: (color) => (
    <>
      <line x1="24" y1="9" x2="24" y2="55" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M24 11 C41 6 56 15 51 28 C46 39 31 37 24 27 Z" fill={color} />
    </>
  ),
  // Samsara: la rueda que gira, ocho radios.
  samsara: (color) => (
    <>
      <circle cx="32" cy="32" r="22" fill="none" stroke={color} strokeWidth="4" />
      <circle cx="32" cy="32" r="6" fill={color} />
      <g stroke={color} strokeWidth="3" strokeLinecap="round">
        <line x1="32" y1="6" x2="32" y2="18" />
        <line x1="32" y1="46" x2="32" y2="58" />
        <line x1="6" y1="32" x2="18" y2="32" />
        <line x1="46" y1="32" x2="58" y2="32" />
        <line x1="14.3" y1="14.3" x2="22.4" y2="22.4" />
        <line x1="41.6" y1="41.6" x2="49.7" y2="49.7" />
        <line x1="49.7" y1="14.3" x2="41.6" y2="22.4" />
        <line x1="22.4" y1="41.6" x2="14.3" y2="49.7" />
      </g>
    </>
  ),
  // Jade: el disco bi, jade tallado con un vacío circular en el centro.
  jade: (color) => (
    <circle cx="32" cy="32" r="21" fill="none" stroke={color} strokeWidth="11" />
  ),
  // Olimpo: el rayo.
  olimpo: (color) => <path d="M35 4 L14 36 H28 L23 60 L52 26 H36 Z" fill={color} />,
  // Quinto Sol: el disco solar con sus rayos.
  sol: (color) => (
    <>
      <circle cx="32" cy="32" r="14" fill={color} />
      <g stroke={color} strokeWidth="4" strokeLinecap="round">
        <line x1="32" y1="4" x2="32" y2="14" />
        <line x1="32" y1="50" x2="32" y2="60" />
        <line x1="4" y1="32" x2="14" y2="32" />
        <line x1="50" y1="32" x2="60" y2="32" />
        <line x1="11.5" y1="11.5" x2="18.6" y2="18.6" />
        <line x1="45.4" y1="45.4" x2="52.5" y2="52.5" />
        <line x1="52.5" y1="11.5" x2="45.4" y2="18.6" />
        <line x1="18.6" y1="45.4" x2="11.5" y2="52.5" />
      </g>
    </>
  ),
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
  const [imageFailed, setImageFailed] = useState(false);
  const label = title ?? `Símbolo de ${FACTION_LABELS[faction]}`;
  const classes = [styles.sigil, styles[size], styles[faction], className].filter(Boolean).join(' ');
  const glyph = CUSTOM_GLYPHS[faction];
  return (
    <span
      className={classes}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      title={decorative ? undefined : label}
    >
      {imageFailed && glyph ? (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          {glyph(FACTION_BY_ID[faction].accentColor)}
        </svg>
      ) : (
        <img
          src={withBase(`/assets/factions/sigil-${faction}.webp`)}
          alt=""
          aria-hidden="true"
          onError={() => setImageFailed(true)}
        />
      )}
    </span>
  );
}
