import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CARDS, CARD_BY_ID, MANDATORY_CARD_IDS, cardsForFaction } from './cards';
import { COMMANDERS, STARTER_DECKS, expandDeck } from './decks';
import { validateDeck } from './deck-validation';
import { FACTIONS, PLAYABLE_FACTIONS } from './factions';
import { CardDefinitionSchema, CommanderDefinitionSchema, DeckDefinitionSchema } from './schemas';
import type { DeckDefinition } from './types';

describe('catálogo del Nexo', () => {
  it('declara seis facciones y solo habilita Furia y Arcano', () => {
    expect(FACTIONS).toHaveLength(6);
    expect(PLAYABLE_FACTIONS.map((faction) => faction.id)).toEqual(['fury', 'arcane']);
    expect(FACTIONS.filter((faction) => !faction.unlocked).map((faction) => faction.id)).toEqual([
      'nature', 'order', 'shadow', 'void',
    ]);
  });

  it('contiene exactamente 24 diseños únicos, 12 por facción jugable', () => {
    expect(CARDS).toHaveLength(24);
    expect(new Set(CARDS.map((card) => card.id)).size).toBe(24);
    expect(cardsForFaction('fury')).toHaveLength(12);
    expect(cardsForFaction('arcane')).toHaveLength(12);
    expect(CARDS.every((card) => card.faction === 'fury' || card.faction === 'arcane')).toBe(true);
  });

  it('incluye las doce cartas obligatorias', () => {
    expect(MANDATORY_CARD_IDS).toHaveLength(12);
    for (const id of MANDATORY_CARD_IDS) expect(CARD_BY_ID[id], id).toBeDefined();
  });

  it('valida cada carta con Zod y conserva rutas WebP + SVG por id', () => {
    for (const card of CARDS) {
      expect(CardDefinitionSchema.safeParse(card).success, card.id).toBe(true);
      expect(card.art.webp).toBe(`/assets/cards/art/${card.id}.webp`);
      expect(card.art.fallback).toBe(`/assets/cards/art/${card.id}.svg`);
      expect(existsSync(join(process.cwd(), 'public', card.art.fallback))).toBe(true);
      // Arte final integrado: todo id del set debe tener su WebP real.
      expect(existsSync(join(process.cwd(), 'public', card.art.webp)), `${card.id}.webp`).toBe(true);
      expect(card.rules.length).toBeGreaterThan(10);
      expect(card.flavor.length).toBeGreaterThan(10);
      expect(Object.values(card.vfx).some(Boolean)).toBe(true);
    }
  });

  it('conserva las cifras y reglas esenciales de las cartas de ejemplo', () => {
    expect(CARD_BY_ID['sabueso-brasa']).toMatchObject({
      faction: 'fury', type: 'unit', attack: 2, health: 1, movement: 2,
      cost: { generic: 0, colored: { fury: 1 } },
    });
    expect(CARD_BY_ID['berserker-ignivoro']).toMatchObject({
      attack: 3, health: 3, cost: { generic: 1, colored: { fury: 2 } },
    });
    expect(CARD_BY_ID['dragon-caldera']).toMatchObject({ attack: 7, health: 6, unique: true });
    expect(CARD_BY_ID['tejedora-escarcha']).toMatchObject({ attack: 2, health: 3, range: 2 });
    expect(CARD_BY_ID['forja-carmesi']?.resistance).toBe(5);
    expect(CARD_BY_ID['torre-horizonte']?.resistance).toBe(5);
    expect(CARD_BY_ID['cometa-arcano']?.effects).toContainEqual({
      kind: 'damage', amount: 4, target: 'any-piece',
    });
  });

  it('define dos comandantes de 25 de vida con datos válidos', () => {
    expect(COMMANDERS).toHaveLength(2);
    expect(COMMANDERS.map((commander) => commander.nexusHealth)).toEqual([25, 25]);
    for (const commander of COMMANDERS) {
      expect(CommanderDefinitionSchema.safeParse(commander).success).toBe(true);
    }
  });
});

describe('mazos iniciales', () => {
  it.each(STARTER_DECKS)('$name tiene exactamente 50 cartas (20 fuentes + 30 no fuentes)', (deck) => {
    expect(DeckDefinitionSchema.safeParse(deck).success).toBe(true);
    expect(expandDeck(deck)).toHaveLength(50);
    expect(validateDeck(deck)).toEqual({
      valid: true,
      issues: [],
      totalCards: 50,
      manaCards: 20,
      nonManaCards: 30,
    });
  });

  it('incluye todas las cartas obligatorias de su facción', () => {
    for (const deck of STARTER_DECKS) {
      const ids = new Set(deck.cards.map((entry) => entry.cardId));
      const mandatory = MANDATORY_CARD_IDS.filter((id) => CARD_BY_ID[id]?.faction === deck.faction);
      for (const id of mandatory) expect(ids.has(id), `${deck.name}: ${id}`).toBe(true);
    }
  });

  it('explica tamaño, copias, carta única, facción y comandante inválidos', () => {
    const base = STARTER_DECKS[0]!;
    const invalid: DeckDefinition = {
      ...base,
      commanderId: 'oriel-custodio-septima-runa',
      cards: [
        { cardId: 'fuente-furia', count: 18 },
        { cardId: 'sabueso-brasa', count: 6 },
        { cardId: 'dragon-caldera', count: 2 },
        { cardId: 'centinela-cristal', count: 1 },
        { cardId: 'no-existe', count: 1 },
      ],
    };
    const result = validateDeck(invalid);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'wrong-size', 'wrong-mana-count', 'too-many-copies', 'too-many-unique',
      'wrong-faction', 'unknown-card', 'wrong-commander-faction',
    ]));
    expect(result.issues.every((issue) => issue.message.length > 5)).toBe(true);
  });
});
