import { useMemo, useState } from 'react';
import type { CardDefinition } from '../game/types';
import { withBase } from '../utils/assets';

/** El original conserva la composición; las importaciones antiguas pueden
 * carecer de él y necesitan tanto el recorte como el respaldo vectorial. */
export function FullArtwork({ card, className }: {
  readonly card: CardDefinition;
  readonly className?: string;
}) {
  const sources = useMemo(() => [...new Set([
    card.art.webp.replace('/cards/art/', '/cards/art-full/'),
    card.art.webp,
    card.art.fallback,
  ].map(withBase))], [card.art.webp, card.art.fallback]);
  const [sourceIndex, setSourceIndex] = useState(0);
  return (
    <img
      className={className}
      src={sources[Math.min(sourceIndex, sources.length - 1)]}
      alt={card.art.alt}
      draggable={false}
      onError={() => setSourceIndex((current) => Math.min(current + 1, sources.length - 1))}
    />
  );
}
