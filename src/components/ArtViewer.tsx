import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent } from 'react';

import type { CardDefinition } from '../game/types';
import { CARD_TYPE_LABELS, formatManaCost } from './Card';
import { FactionSigil, FACTION_LABELS } from './FactionSigil';
import { GlossaryText } from './GlossaryText';
import { RarityGem, RARITY_LABELS } from './RarityGem';
import { KEYWORD_LABELS } from '../utils/cardLabels';
import { withBase } from '../utils/assets';
import styles from './ArtViewer.module.css';

export interface ArtViewerProps {
  readonly card: CardDefinition | null;
  readonly onClose: () => void;
}

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Solo la ilustración, sin el marco de la carta encima: para quien quiere
 * disfrutar del arte en grande. Toda la info (coste, estadísticas, reglas)
 * va aparte, debajo de la imagen, como texto normal — nunca superpuesta.
 */
export function ArtViewer({ card, onClose }: ArtViewerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!card) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus());

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [card, onClose]);

  if (!card) return null;

  const typeLabel = card.subtype
    ? `${CARD_TYPE_LABELS[card.type]} — ${card.subtype}`
    : CARD_TYPE_LABELS[card.type];

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const elements = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector));
    if (elements.length === 0) {
      event.preventDefault();
      return;
    }
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  const closeFromBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className={styles.backdrop} onMouseDown={closeFromBackdrop}>
      <div
        className={styles.dialog}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={trapFocus}
      >
        <button className={styles.close} ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar ilustración">
          <span aria-hidden="true">×</span>
        </button>

        <div className={styles.artFrame}>
          <img className={styles.art} src={withBase(card.art.webp)} alt={card.art.alt} draggable={false} />
        </div>

        <section className={styles.info}>
          <header className={styles.heading}>
            <FactionSigil faction={card.faction} size="large" />
            <div>
              <p className={styles.eyebrow}>{FACTION_LABELS[card.faction]} · {typeLabel}</p>
              <h2 id={titleId}>{card.name}</h2>
            </div>
            <div className={styles.rarity}>
              <RarityGem rarity={card.rarity} />
              <span>{RARITY_LABELS[card.rarity]}</span>
            </div>
          </header>

          <p className={styles.rules}><GlossaryText text={card.rules} /></p>
          <blockquote className={styles.flavor}>«{card.flavor}»</blockquote>

          <dl className={styles.metadata}>
            <div><dt>Coste</dt><dd>{formatManaCost(card.cost)}</dd></div>
            {card.attack !== undefined && <div><dt>Ataque</dt><dd>{card.attack}</dd></div>}
            {card.health !== undefined && <div><dt>Vida</dt><dd>{card.health}</dd></div>}
            {card.resistance !== undefined && <div><dt>Resistencia</dt><dd>{card.resistance}</dd></div>}
            {card.range !== undefined && <div><dt>Alcance</dt><dd>{card.range}</dd></div>}
            {card.movement !== undefined && <div><dt>Movimiento</dt><dd>{card.movement}</dd></div>}
            <div><dt>Colección</dt><dd>{card.set} · {String(card.collectorNumber).padStart(3, '0')}</dd></div>
            <div><dt>Artista</dt><dd>{card.artist}</dd></div>
          </dl>

          {(card.unique || card.keywords.length > 0) && (
            <div className={styles.tags} aria-label="Palabras clave">
              {card.unique && <span className={styles.uniqueTag}>✦ Única</span>}
              {card.keywords.map((keyword) => <span key={keyword}>{KEYWORD_LABELS[keyword]}</span>)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
