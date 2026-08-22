import { test } from '@playwright/test'

/**
 * Auditoría de móvil: fotografía cada pantalla a 375x812 (iPhone pequeño) para
 * poder mirarlas de verdad. Fuera del gate.
 *
 *   RUN_SHOTS=1 npx playwright test e2e/mobile-audit.spec.ts
 */
test.skip(!process.env.RUN_SHOTS, 'solo bajo demanda con RUN_SHOTS=1')

const PANTALLAS = [
  ['portada', '/'],
  ['jugar', '/play'],
  ['torre', '/tower'],
  ['galeria', '/gallery'],
  ['mazos', '/decks'],
  ['multijugador', '/multiplayer'],
  ['ajustes', '/settings'],
] as const

for (const [nombre, ruta] of PANTALLAS) {
  test(`móvil ${nombre}`, async ({ page }) => {
    test.setTimeout(90_000)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(ruta)
    await page.waitForTimeout(1400)
    await page.screenshot({ path: `e2e/__shots__/movil-${nombre}.png`, fullPage: true })
    // Desborde horizontal: el síntoma más común y más feo en móvil.
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    console.log(`DESBORDE ${nombre}: ${desborde}px`)
  })
}

test('móvil batalla', async ({ page }) => {
  test.setTimeout(120_000)
  await page.addInitScript(() => localStorage.setItem('cronicas-nexo-howto-visto', '1'))
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/battle?seed=1311657807')
  await page.getByRole('button', { name: /Conservar las cinco/i }).click()
  await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 4000 }).catch(() => {})
  await page.waitForTimeout(3000)
  await page.screenshot({ path: 'e2e/__shots__/movil-batalla.png' })
  const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  console.log(`DESBORDE batalla: ${desborde}px`)
})
