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
  it('declara ocho facciones, todas habilitadas', () => {
    expect(FACTIONS).toHaveLength(8);
    expect(PLAYABLE_FACTIONS.map((faction) => faction.id)).toEqual([
      'fury', 'arcane', 'nature', 'order', 'shadow', 'void', 'duna', 'fimbul',
    ]);
    expect(FACTIONS.filter((faction) => !faction.unlocked)).toHaveLength(0);
  });

  it('contiene 176 diseños únicos: NEX-01, NEX-02, Duna y Fimbul', () => {
    expect(CARDS).toHaveLength(176);
    expect(new Set(CARDS.map((card) => card.id)).size).toBe(176);
    // La segunda oleada reparte exactamente 4 cartas por facción, así que
    // ninguna se queda atrás respecto a las demás.
    expect(cardsForFaction('fury')).toHaveLength(21);
    expect(cardsForFaction('arcane')).toHaveLength(21);
    expect(cardsForFaction('nature')).toHaveLength(18);
    expect(cardsForFaction('order')).toHaveLength(18);
    expect(cardsForFaction('shadow')).toHaveLength(18);
    expect(cardsForFaction('void')).toHaveLength(18);
    const secondWave = CARDS.filter((card) => card.set.startsWith('NEX-02'));
    expect(secondWave).toHaveLength(24);
    expect(new Set(secondWave.map((card) => card.collectorNumber)).size).toBe(24);
    // Duna y Fimbul llegan enteras de una vez: son facciones, no expansiones repartidas.
    const duna = CARDS.filter((card) => card.set.startsWith('NEX-03'));
    expect(duna).toHaveLength(31);
    expect(duna.every((card) => card.faction === 'duna')).toBe(true);
    const fimbul = CARDS.filter((card) => card.set.startsWith('NEX-04'));
    expect(fimbul).toHaveLength(31);
    expect(fimbul.every((card) => card.faction === 'fimbul')).toBe(true);
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

  it('define comandantes de 35 de vida con datos válidos', () => {
    expect(COMMANDERS).toHaveLength(14);
    expect(COMMANDERS.every((commander) => commander.nexusHealth === 35)).toBe(true);
    for (const commander of COMMANDERS) {
      expect(CommanderDefinitionSchema.safeParse(commander).success).toBe(true);
    }
  });

  it('da a cada facción comandantes únicos que no colisionan con ninguna carta', () => {
    // Las seis originales tienen líder de siempre y alternativo de NEX-02.
    // Duna y Fimbul son facciones nuevas y de momento solo traen el suyo.
    for (const faction of PLAYABLE_FACTIONS) {
      const owners = COMMANDERS.filter((commander) => commander.faction === faction.id);
      expect(owners, faction.id).toHaveLength(faction.id === 'duna' || faction.id === 'fimbul' ? 1 : 2);
    }
    // Ids de comandante únicos entre sí.
    expect(new Set(COMMANDERS.map((commander) => commander.id)).size).toBe(COMMANDERS.length);
    // Ningún comandante comparte id ni archivo de arte con una carta del catálogo.
    const cardIds = new Set(CARDS.map((card) => card.id));
    const cardArt = new Set(CARDS.map((card) => card.art.webp));
    for (const commander of COMMANDERS) {
      expect(cardIds.has(commander.id), `${commander.id} choca con una carta`).toBe(false);
      expect(cardArt.has(commander.art.webp), `${commander.id} reutiliza arte de una carta`).toBe(false);
    }
    // El arte de los comandantes tampoco se repite entre ellos.
    expect(new Set(COMMANDERS.map((commander) => commander.art.webp)).size).toBe(COMMANDERS.length);
  });

  it('da a cada facción una única fuente de maná exclusiva', () => {
    const manaCards = CARDS.filter((card) => card.type === 'mana');
    for (const faction of PLAYABLE_FACTIONS) {
      const sources = manaCards.filter((card) => card.faction === faction.id);
      expect(sources, faction.id).toHaveLength(1);
    }
    // Sin fuentes huérfanas de una facción que no exista, y una por facción en total.
    expect(manaCards).toHaveLength(PLAYABLE_FACTIONS.length);
    expect(new Set(manaCards.map((card) => card.id)).size).toBe(manaCards.length);
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
