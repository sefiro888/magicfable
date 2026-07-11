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
      <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
        <path className={styles.setting} d="m16 1 5 5 7 1 1 7-3 6 1 7-7 1-4 3-5-3-7-1 1-7-3-6 2-7 7-1 5-5Z" />
        <path className={styles.stone} d="m16 6 7 6-3 10-4 4-5-4-3-10 8-6Z" />
        <path className={styles.glint} d="m14 9-3 4 2 2 4-6h-3Z" />
      </svg>
    </span>
  );
}
