import type { ReactElement } from 'react';
import type { Rarity } from '../game/types';
import styles from './RarityGem.module.css';

export const RARITY_LABELS: Readonly<Record<Rarity, string>> = {
  common: 'Común',
  uncommon: 'Infrecuente',
  rare: 'Rara',
  mythic: 'Mítica',
};

export interface RarityGemProps {
  readonly rarity: Rarity;
  readonly compact?: boolean;
  readonly decorative?: boolean;
  readonly className?: string;
}

/*
 * Cada rareza tiene su propia pieza, en escalada de material y ornamento:
 * común = canto pulido · infrecuente = diamante de plata · rara = gema de oro
 * engastada · mítica = prisma radiante con rayos giratorios.
 * Los ids de gradiente se repiten entre instancias a propósito: son idénticos,
 * y el navegador resuelve siempre la primera definición del documento.
 */
const GEM_ART: Readonly<Record<Rarity, ReactElement>> = {
  common: (
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <defs>
        <radialGradient id="rg-common-body" cx="38%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#cfc9b9" />
          <stop offset="55%" stopColor="#8d8677" />
          <stop offset="100%" stopColor="#4a453c" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16.5" r="9.6" fill="url(#rg-common-body)" stroke="#332f29" strokeWidth="1.2" />
      <path d="M10.6 12.2q2.2-3.1 6-3" fill="none" stroke="#fff" strokeOpacity="0.42" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  uncommon: (
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <defs>
        <linearGradient id="rg-uncommon-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4f8fa" />
          <stop offset="45%" stopColor="#aab6c0" />
          <stop offset="100%" stopColor="#57626d" />
        </linearGradient>
      </defs>
      <path d="M16 3.5 26.5 13 16 28.5 5.5 13Z" fill="url(#rg-uncommon-body)" stroke="#39424b" strokeWidth="1.1" />
      <path d="M5.5 13h21M16 3.5 11.2 13 16 28.5M16 3.5 20.8 13 16 28.5" fill="none" stroke="#2c333b" strokeOpacity="0.5" strokeWidth="0.9" />
      <path d="M12.4 6.6 9.8 10.9" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  rare: (
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <defs>
        <linearGradient id="rg-rare-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffedaa" />
          <stop offset="52%" stopColor="#efb83e" />
          <stop offset="100%" stopColor="#8d5a17" />
        </linearGradient>
      </defs>
      {/* Garras del engaste */}
      <path d="M8.2 8.2 5 5m18.8 3.2L27 5M8.2 23.8 5 27m18.8-3.2L27 27" stroke="#6e4c13" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M16 4.5 25.2 10v12L16 27.5 6.8 22V10Z" fill="url(#rg-rare-stone)" stroke="#5f420f" strokeWidth="1.2" />
      <path d="M16 4.5v23M6.8 10l18.4 12M25.2 10 6.8 22" fill="none" stroke="#7c5514" strokeOpacity="0.55" strokeWidth="0.9" />
      <path d="m23.4 6.6.7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7Z" fill="#fff" opacity="0.95" />
    </svg>
  ),
  mythic: (
    <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
      <defs>
        <linearGradient id="rg-mythic-stone" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd9ff" />
          <stop offset="45%" stopColor="#d86cff" />
          <stop offset="100%" stopColor="#5f24a8" />
        </linearGradient>
      </defs>
      <g className={styles.rays} stroke="#e9a4ff" strokeOpacity="0.75" strokeWidth="1.3" strokeLinecap="round">
        <path d="M16 1.2v4M16 26.8v4M1.2 16h4M26.8 16h4M5.6 5.6l2.8 2.8M23.6 23.6l2.8 2.8M26.4 5.6l-2.8 2.8M8.4 23.6l-2.8 2.8" />
      </g>
      <path d="M16 4.8 25.6 12l-3.7 13.4h-11.8L6.4 12Z" fill="url(#rg-mythic-stone)" stroke="#43187a" strokeWidth="1.2" />
      <path d="M16 4.8 16 25.4M6.4 12l19.2 0M25.6 12 10.1 25.4M6.4 12l15.5 13.4" fill="none" stroke="#fff" strokeOpacity="0.34" strokeWidth="0.8" />
      <path d="m10.3 8 .6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6Z" fill="#fff" opacity="0.9" />
      <path d="m22.6 18.4.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5Z" fill="#ffe6ff" opacity="0.85" />
    </svg>
  ),
};

export function RarityGem({
  rarity,
  compact = false,
  decorative = false,
  className,
}: RarityGemProps) {
  const label = `Rareza ${RARITY_LABELS[rarity]}`;
  return (
    <span
      className={[styles.gem, styles[rarity], compact && styles.compact, className]
        .filter(Boolean)
        .join(' ')}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      title={decorative ? undefined : label}
    >
      {GEM_ART[rarity]}
    </span>
  );
}
