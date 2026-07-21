import { CARD_BY_ID } from './cards';
import { COMMANDER_BY_ID } from './decks';
import type {
  CardDefinition,
  CommanderDefinition,
  DeckDefinition,
  DeckValidationIssue,
  DeckValidationResult,
} from './types';

export interface DeckValidationCatalog {
  readonly cards: Readonly<Record<string, CardDefinition>>;
  readonly commanders: Readonly<Record<string, CommanderDefinition>>;
}

const DEFAULT_CATALOG: DeckValidationCatalog = {
  cards: CARD_BY_ID,
  commanders: COMMANDER_BY_ID,
};

export const validateDeck = (
  deck: DeckDefinition,
  catalog: DeckValidationCatalog = DEFAULT_CATALOG,
): DeckValidationResult => {
  const issues: DeckValidationIssue[] = [];
  const counts = new Map<string, number>();
  let totalCards = 0;
  let manaCards = 0;

  for (const entry of deck.cards) {
    counts.set(entry.cardId, (counts.get(entry.cardId) ?? 0) + entry.count);
    totalCards += entry.count;
    const definition = catalog.cards[entry.cardId];
    if (!definition) {
      issues.push({
        code: 'unknown-card',
        cardId: entry.cardId,
        message: `La carta «${entry.cardId}» no existe en el catálogo.`,
      });
      continue;
    }
    if (definition.type === 'mana') manaCards += entry.count;
  }

  if (totalCards !== 50) {
    issues.push({ code: 'wrong-size', message: `El mazo contiene ${totalCards} cartas; debe contener exactamente 50.` });
  }
  if (manaCards !== 20) {
    issues.push({ code: 'wrong-mana-count', message: `El mazo contiene ${manaCards} fuentes; debe contener exactamente 20.` });
  }

  const commander = catalog.commanders[deck.commanderId];
  if (!commander) {
    issues.push({ code: 'unknown-commander', message: `El comandante «${deck.commanderId}» no existe.` });
  } else if (commander.faction !== deck.faction) {
    issues.push({
      code: 'wrong-commander-faction',
      message: `El comandante ${commander.name} no pertenece a la facción del mazo.`,
    });
  }

  for (const [cardId, count] of counts) {
    const definition = catalog.cards[cardId];
    if (!definition) continue;
    if (definition.faction !== deck.faction) {
      issues.push({
        code: 'wrong-faction',
        cardId,
        message: `${definition.name} no pertenece a ${deck.faction}.`,
      });
    }
    if (definition.type !== 'mana' && !definition.unique && count > 5) {
      issues.push({
        code: 'too-many-copies',
        cardId,
        message: `${definition.name} aparece ${count} veces; el máximo es 5.`,
      });
    }
    if (definition.unique && count > 1) {
      issues.push({
        code: 'too-many-unique',
        cardId,
        message: `${definition.name} es única y solo admite una copia.`,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    totalCards,
    manaCards,
    nonManaCards: totalCards - manaCards,
  };
};
