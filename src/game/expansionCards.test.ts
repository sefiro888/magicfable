import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXPANSION_DRAFTS, EXPANSION_PENDING_IDS } from './expansionCards';

describe('catálogo en integración', () => {
  it('conserva 31 cartas distintas por facción y los tres formatos de arte', () => {
    expect(EXPANSION_DRAFTS).toHaveLength(93);
    expect(new Set(EXPANSION_DRAFTS.map((card) => card.id)).size).toBe(93);
    for (const faction of ['goblins', 'tercios', 'kalevala']) {
      const cards = EXPANSION_DRAFTS.filter((card) => card.faction === faction);
      expect(cards).toHaveLength(31);
      expect(cards.filter((card) => card.type === 'mana')).toHaveLength(1);
    }
    for (const card of EXPANSION_DRAFTS) {
      for (const path of [card.art.webp, card.art.fallback, `/assets/cards/art-full/${card.id}.webp`]) {
        expect(existsSync(resolve('public', path.slice(1))), path).toBe(true);
      }
    }
  });

  it('impide presentar las cartas pendientes como desbloqueadas', () => {
    expect(EXPANSION_PENDING_IDS).toEqual([]);
    expect(EXPANSION_DRAFTS.every((card) => !card.unlocked)).toBe(true);
    expect(EXPANSION_PENDING_IDS.every((id) => EXPANSION_DRAFTS.some((card) => card.id === id))).toBe(true);
  });
});
