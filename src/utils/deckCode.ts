import type { DeckEntry } from '../game'

export interface DecodedDeckCode {
  readonly deckId: string
  readonly cards: readonly DeckEntry[]
}

/**
 * Codifica un mazo en un código de texto compacto para compartir por chat o
 * foro. Los ids de carta y de mazo son siempre kebab-case ascii (impuesto por
 * el esquema de Zod), así que btoa/atob planos bastan sin envolturas Unicode.
 */
export function encodeDeckCode(deckId: string, cards: readonly DeckEntry[]): string {
  const compact = cards.map((entry): [string, number] => [entry.cardId, entry.count])
  return btoa(JSON.stringify([deckId, compact]))
}

/** Decodifica un código de mazo. Devuelve undefined si el texto no es un código válido. */
export function decodeDeckCode(code: string): DecodedDeckCode | undefined {
  try {
    const parsed: unknown = JSON.parse(atob(code.trim()))
    if (!Array.isArray(parsed) || parsed.length !== 2) return undefined
    const [deckId, compact] = parsed as [unknown, unknown]
    if (typeof deckId !== 'string' || !Array.isArray(compact)) return undefined
    const cards: DeckEntry[] = []
    for (const item of compact as readonly unknown[]) {
      if (!Array.isArray(item) || item.length !== 2) return undefined
      const [cardId, count] = item as [unknown, unknown]
      if (typeof cardId !== 'string' || typeof count !== 'number' || !Number.isInteger(count) || count < 1) return undefined
      cards.push({ cardId, count })
    }
    return { deckId, cards }
  } catch {
    return undefined
  }
}
