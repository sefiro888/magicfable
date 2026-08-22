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
