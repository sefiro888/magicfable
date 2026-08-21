import { expect, test } from '@playwright/test'

/**
 * Capturas de los tres escenarios 3D, para poder compararlos de verdad
 * mientras se trabaja su aspecto. Igual que board-shot: fuera del gate.
 *
 *   RUN_SHOTS=1 npx playwright test e2e/scenario-shots.spec.ts
 */
test.skip(!process.env.RUN_SHOTS, 'solo bajo demanda con RUN_SHOTS=1')

const SCENARIOS = ['aether-citadel', 'sanctuary', 'caldera'] as const

for (const scenario of SCENARIOS) {
  test(`captura del escenario ${scenario}`, async ({ page }) => {
    test.setTimeout(120_000)
    await page.addInitScript((value) => {
      localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({
        state: { scenario: value, graphicsQuality: 'high', muted: true },
        version: 4,
      }))
      localStorage.setItem('cronicas-nexo-howto-visto', '1')
    }, scenario)
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/battle?seed=1311657807')
    const keep = page.getByRole('button', { name: /Conservar las cinco/i })
    await keep.waitFor({ state: 'visible', timeout: 20000 })
    await keep.click()
    await expect(page.getByTestId('battle-board')).toBeVisible()
    await page.waitForTimeout(7000)
    await page.screenshot({ path: `e2e/__shots__/scenario-${scenario}.png` })
  })
}
