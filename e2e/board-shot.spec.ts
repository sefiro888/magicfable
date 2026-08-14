import { expect, test } from '@playwright/test'

/**
 * Captura de referencia del tablero. No es una prueba de regresión: existe
 * para poder MIRAR el tablero renderizado de verdad (WebGL) mientras se
 * trabaja en el aspecto visual — el panel del navegador integrado no llega a
 * pintar el canvas, pero el Chromium de Playwright sí.
 *
 *   RUN_SHOTS=1 npx playwright test e2e/board-shot.spec.ts
 *
 * Fuera del gate (tarda ~40s y juega turnos con el panel de desarrollo). Deja
 * las imágenes en `e2e/__shots__/`, ignorado por git.
 */
test.skip(!process.env.RUN_SHOTS, 'solo bajo demanda con RUN_SHOTS=1')

test('captura el tablero para revisión visual', async ({ page }) => {
  // Espera a que entren texturas y escenario 3D, y juega varios turnos: no cabe
  // en el tiempo por defecto de una prueba normal.
  test.setTimeout(240_000)
  await page.goto('/battle')
  // Cierra la guía de bienvenida y resuelve el mulligan para llegar al tablero.
  const howTo = page.getByRole('button', { name: /Entendido, a jugar/i })
  await howTo.waitFor({ state: 'visible', timeout: 15000 })
  await howTo.click()
  const keep = page.getByRole('button', { name: /Conservar las cinco/i })
  await keep.waitFor({ state: 'visible', timeout: 15000 })
  await keep.click()
  await expect(keep).toBeHidden()
  await expect(page.getByTestId('battle-board')).toBeVisible()
  // Margen para que el escenario 3D y las texturas terminen de entrar.
  await page.waitForTimeout(6000)
  await page.screenshot({ path: 'e2e/__shots__/board-desktop.png' })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: 'e2e/__shots__/board-mobile.png' })

  // ── Mitad de partida: es donde de verdad importa leer el tablero ──
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.getByRole('button', { name: /Saltar guía/i }).click().catch(() => {})
  // Panel de desarrollo (solo en dev): da Esencia para poder desplegar ya.
  await page.keyboard.press('Control+Shift+KeyD')
  const essence = page.getByRole('button', { name: '+1 Esencia' })
  await essence.waitFor({ state: 'visible', timeout: 10000 })
  for (let i = 0; i < 8; i += 1) await essence.click()
  // Despliega unidades de ambos bandos alternando turnos con la IA.
  for (let round = 0; round < 3; round += 1) {
    const unit = page.locator('[class*="fanCard"]').filter({ hasText: /Unidad|Estructura/ }).first()
    if (await unit.count()) {
      await unit.click()
      await page.waitForTimeout(400)
      await page.getByTestId('battle-board').click({ position: { x: 640, y: 400 } })
      await page.waitForTimeout(600)
    }
    await page.getByRole('button', { name: /Forzar fin de turno/i }).click().catch(() => {})
    await page.waitForTimeout(2500)
  }
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'e2e/__shots__/board-midgame.png' })
})
