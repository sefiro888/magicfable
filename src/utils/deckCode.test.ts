import { describe, expect, it } from 'vitest'
import { decodeDeckCode, encodeDeckCode } from './deckCode'

describe('código de mazo compartible', () => {
  it('codifica y decodifica el mismo mazo sin pérdida', () => {
    const cards = [
      { cardId: 'fuente-furia', count: 20 },
      { cardId: 'sabueso-brasa', count: 4 },
      { cardId: 'dragon-caldera', count: 1 },
    ]
    const code = encodeDeckCode('furia-caldera', cards)
    const decoded = decodeDeckCode(code)
    expect(decoded).toEqual({ deckId: 'furia-caldera', cards })
  })

  it('produce texto distinto para mazos distintos', () => {
    const a = encodeDeckCode('furia-caldera', [{ cardId: 'fuente-furia', count: 20 }])
    const b = encodeDeckCode('orden-celestial', [{ cardId: 'fuente-orden', count: 20 }])
    expect(a).not.toBe(b)
  })

  it('devuelve undefined ante texto que no es un código válido', () => {
    expect(decodeDeckCode('esto no es base64 válido ni de lejos §§§')).toBeUndefined()
    expect(decodeDeckCode('')).toBeUndefined()
    expect(decodeDeckCode(btoa('"solo una cadena"'))).toBeUndefined()
    expect(decodeDeckCode(btoa(JSON.stringify(['deck-id', 'no-es-un-array'])))).toBeUndefined()
  })

  it('rechaza entradas con recuento no entero o negativo', () => {
    const malformed = btoa(JSON.stringify(['furia-caldera', [['fuente-furia', -2]]]))
    expect(decodeDeckCode(malformed)).toBeUndefined()
    const malformed2 = btoa(JSON.stringify(['furia-caldera', [['fuente-furia', 2.5]]]))
    expect(decodeDeckCode(malformed2)).toBeUndefined()
  })

  it('tolera espacios en blanco al pegar el código', () => {
    const code = encodeDeckCode('furia-caldera', [{ cardId: 'fuente-furia', count: 20 }])
    expect(decodeDeckCode(`  ${code}  \n`)).toEqual({ deckId: 'furia-caldera', cards: [{ cardId: 'fuente-furia', count: 20 }] })
  })
})
