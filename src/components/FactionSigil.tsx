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
      <img
        src={withBase(`/assets/factions/sigil-${faction}.webp`)}
        alt=""
        aria-hidden="true"
        // Facciones sin ilustración de sigilo propia todavía (o cuyo archivo
        // falte por lo que sea) caen en un monograma generado en el momento,
        // en vez de en el icono roto del navegador.
        onError={(event) => {
          const img = event.currentTarget;
          if (img.dataset.fallback) return;
          img.dataset.fallback = '1';
          const color = FACTION_BY_ID[faction].accentColor;
          const initial = FACTION_LABELS[faction].charAt(0);
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">`
            + `<circle cx="32" cy="32" r="32" fill="${color}"/>`
            + `<text x="32" y="44" font-size="34" font-family="Georgia, serif" text-anchor="middle" fill="#141210">${initial}</text>`
            + `</svg>`;
          img.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
        }}
      />
    </span>
  );
}
