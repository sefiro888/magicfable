import { describe, expect, it } from 'vitest'
import { CARDS, KEYWORDS, RARITIES, CARD_TYPES, FACTION_IDS } from '../game'
import { FACTION_LABELS, KEYWORD_LABELS, RARITY_LABELS, TYPE_LABELS } from './cardLabels'

/**
 * Las etiquetas visibles se comprueban contra las listas del motor: si algún
 * día se añade una palabra clave, una rareza o un tipo, el test cae antes de
 * que la interfaz empiece a enseñar el identificador interno en inglés — que
 * es justo lo que pasaba en el filtro de la Galería.
 */
describe('etiquetas visibles de las cartas', () => {
  it('cada palabra clave del motor tiene nombre en español', () => {
    for (const keyword of KEYWORDS) {
      expect(KEYWORD_LABELS[keyword], keyword).toBeTruthy()
      expect(KEYWORD_LABELS[keyword], keyword).not.toBe(keyword)
    }
  })

  it('no sobra ninguna etiqueta de palabra clave', () => {
    expect(Object.keys(KEYWORD_LABELS).sort()).toEqual([...KEYWORDS].sort())
  })

  it('rarezas, tipos y facciones también están traducidos', () => {
    for (const rarity of RARITIES) expect(RARITY_LABELS[rarity], rarity).toBeTruthy()
    for (const type of CARD_TYPES) expect(TYPE_LABELS[type], type).toBeTruthy()
    for (const faction of FACTION_IDS) expect(FACTION_LABELS[faction], faction).toBeTruthy()
  })

  it('todas las palabras clave que usan las cartas están en la lista del motor', () => {
    const usadas = new Set(CARDS.flatMap((card) => card.keywords))
    for (const keyword of usadas) expect(KEYWORDS).toContain(keyword)
  })
})
