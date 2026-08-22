import { expect, test } from '@playwright/test'

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
