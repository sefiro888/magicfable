import { expect, test } from '@playwright/test'
import { CARD_BY_ID, STARTER_DECKS, createMatch } from '../src/game'
import type { BoardPiece, MatchState, PlayerId, Position } from '../src/game'

/**
 * Ninguna pantalla puede desbordar a lo ancho en un móvil pequeño.
 *
 * Es una regresión que se cuela sola: al añadir «Torre» al menú, la barra de
 * navegación pasó a medir más que la pantalla y arrastraba TODA la página de
 * lado (se leía «CIO» en vez de «INICIO»). Nadie lo nota desde el escritorio.
 */
const PANTALLAS = ['/', '/play', '/tower', '/gallery', '/decks', '/multiplayer', '/settings'] as const

for (const ruta of PANTALLAS) {
  test(`sin desborde horizontal en móvil: ${ruta}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(ruta)
    await page.waitForTimeout(600)
    const desborde = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(desborde, `${ruta} se sale ${desborde}px a lo ancho`).toBeLessThanOrEqual(0)
  })
}

test('el menú se puede recorrer entero en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  // Todas las secciones siguen ahí aunque no quepan a la vez: la barra se
  // desplaza sola en vez de empujar la página.
  for (const nombre of ['Inicio', 'Jugar', 'Torre', 'Multijugador', 'Galería', 'Mazos']) {
    await expect(page.getByRole('link', { name: nombre, exact: true })).toBeAttached()
  }
  const nav = page.getByLabel('Navegación principal')
  const desplazable = await nav.evaluate((el) => el.scrollWidth > el.clientWidth)
  expect(desplazable).toBe(true)
})

/**
 * Nada que se pulse puede quedarse por debajo de la medida de un pulgar.
 *
 * Medido en un móvil de 390 px, el constructor de mazos tenía 35 objetivos por
 * debajo del umbral —los −/+ de ajustar copias salían a 28×28, y son los que
 * más se tocan de toda la pantalla— y los deslizadores de volumen respondían
 * solo en los 4 px de grosor del carril.
 *
 * El umbral es 32 px porque los interruptores de Ajustes conservan su dibujo
 * de 56×32 y amplían la zona sensible con un pseudo-elemento, que no aparece
 * en las medidas del elemento.
 */
const RUTAS_TACTILES = ['/play', '/tower', '/gallery', '/decks', '/multiplayer', '/settings'] as const

for (const ruta of RUTAS_TACTILES) {
  test(`objetivos táctiles suficientes en ${ruta}`, async ({ page }) => {
    test.setTimeout(60_000)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(ruta)
    await page.waitForTimeout(900)
    const pequenos = await page.evaluate(() => {
      const MIN = 32
      const salida: string[] = []
      for (const el of Array.from(document.querySelectorAll('button, select, input[type="range"], input[type="text"]'))) {
        const rect = el.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) continue
        if (rect.width < MIN || rect.height < MIN) {
          const texto = (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 30)
          salida.push(`${Math.round(rect.width)}x${Math.round(rect.height)} · ${texto}`)
        }
      }
      return salida
    })
    expect(pequenos, `objetivos demasiado pequeños en ${ruta}`).toEqual([])
  })
}

/**
 * Las chapas de las unidades no pueden pisarse en un móvil.
 *
 * Con media docena de unidades en juego a 390 px, los nombres se superponían
 * en la misma franja y no se leía ninguno. En pantalla estrecha la chapa
 * enseña solo Ataque y Vida, y el nombre aparece únicamente en la unidad
 * elegida — que es cuando de verdad hace falta.
 */
const piezaDePrueba = (instanceId: string, cardId: string, owner: PlayerId, position: Position): BoardPiece => {
  const card = CARD_BY_ID[cardId]!
  return {
    instanceId, cardId, owner, position,
    currentHealth: card.health ?? card.resistance ?? 1,
    attackModifier: 0, movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [],
  }
}

const partidaPoblada = (): MatchState => {
  const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 1311657807)
  return {
    ...base, turn: 8, phase: 'main', activePlayer: 'player',
    board: [
      piezaDePrueba('a1', 'ariete-volcanico', 'player', { x: 2, y: 5 }),
      piezaDePrueba('a2', 'sabueso-brasa', 'player', { x: 4, y: 4 }),
      piezaDePrueba('a3', 'lancera-magma', 'player', { x: 5, y: 6 }),
      piezaDePrueba('e1', 'centinela-cristal', 'ai', { x: 3, y: 3 }),
      piezaDePrueba('e2', 'golem-azur', 'ai', { x: 4, y: 2 }),
      piezaDePrueba('e3', 'tejedora-escarcha', 'ai', { x: 1, y: 2 }),
    ],
  }
}

test('las chapas de las unidades no se pisan en móvil', async ({ page }) => {
  test.setTimeout(120_000)
  await page.addInitScript((match) => {
    localStorage.setItem('cronicas-nexo-match', JSON.stringify({
      state: { match, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0 },
      version: 2,
    }))
    localStorage.setItem('cronicas-nexo-howto-visto', '1')
    localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({
      state: { muted: true, confirmEndTurn: false }, version: 7,
    }))
  }, partidaPoblada())
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/battle')
  await expect(page.getByTestId('battle-board')).toBeVisible({ timeout: 25_000 })
  await page.waitForTimeout(3000)

  const solapes = await page.evaluate(() => {
    const chapas = Array.from(document.querySelectorAll('[class*="cardLabel"]')).map((el) => el.getBoundingClientRect())
    const cruces: string[] = []
    for (let i = 0; i < chapas.length; i += 1) {
      for (let j = i + 1; j < chapas.length; j += 1) {
        const a = chapas[i]!
        const b = chapas[j]!
        const ancho = Math.min(a.right, b.right) - Math.max(a.left, b.left)
        const alto = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
        if (ancho > 6 && alto > 6) cruces.push(`${Math.round(ancho)}x${Math.round(alto)}`)
      }
    }
    return cruces
  })
  expect(solapes, 'chapas de unidad superpuestas en móvil').toEqual([])

  // En reposo no se enseña ningún nombre; al elegir una unidad, sí el suyo.
  const nombresVisibles = () => page.evaluate(() => Array.from(document.querySelectorAll('[class*="cardName"]'))
    .filter((el) => (el as HTMLElement).offsetParent !== null).length)
  expect(await nombresVisibles()).toBe(0)
  await page.keyboard.press('ArrowUp')
  await page.waitForTimeout(300)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(600)
  expect(await nombresVisibles()).toBeGreaterThan(0)
})
