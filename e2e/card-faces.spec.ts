import { expect, test } from '@playwright/test'

/**
 * Despliega una unidad y la fotografía desde delante, desde detrás y desde un
 * lateral. Sirve para revisar de un vistazo que la ficha se lee desde
 * cualquier ángulo: fue un fallo real y reincidente (la cara de atrás salía
 * como un rectángulo dorado sin ilustración), así que conviene poder
 * comprobarlo sin montar la partida a mano.
 *
 *   RUN_SHOTS=1 npx playwright test e2e/card-faces.spec.ts
 *
 * Fuera del gate, igual que board-shot y scenario-shots.
 */
test.skip(!process.env.RUN_SHOTS, 'solo bajo demanda con RUN_SHOTS=1')

test('caras de la ficha', async ({ page }) => {
  test.setTimeout(180_000)
  await page.addInitScript(() => {
    localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({
      state: { scenario: 'sanctuary', graphicsQuality: 'high', muted: true }, version: 5,
    }))
    localStorage.setItem('cronicas-nexo-howto-visto', '1')
  })
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/battle?seed=1311657807')
  await page.getByRole('button', { name: /Conservar las cinco/i }).click()
  await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 4000 }).catch(() => {})
  await page.keyboard.press('Control+Shift+KeyD')
  const essence = page.getByRole('button', { name: '+1 Esencia' })
  await essence.waitFor({ state: 'visible' })
  for (let i = 0; i < 8; i += 1) await essence.click()
  await page.keyboard.press('Control+Shift+KeyD')

  const unit = page.locator('[class*="fanCard"]').filter({ hasText: /Unidad/ }).first()
  await unit.click()
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(2500)
  const board = page.getByTestId('battle-board')
  await expect(board).toBeVisible()
  const box0 = (await board.boundingBox())!
  // Acercar la cámara para que la ficha se lea bien en la captura.
  await page.mouse.move(box0.x + box0.width / 2, box0.y + box0.height * 0.75)
  for (let i = 0; i < 6; i += 1) { await page.mouse.wheel(0, -240); await page.waitForTimeout(120) }
  await page.waitForTimeout(1200)
  await page.screenshot({ path: 'e2e/__shots__/card-front.png', clip: { x: 380, y: 300, width: 520, height: 300 } })

  // Orbita la cámara hasta el lado opuesto arrastrando sobre el tablero.
  const box = (await board.boundingBox())!
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx + 620, cy, { steps: 30 })
  await page.mouse.up()
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'e2e/__shots__/card-back.png', clip: { x: 380, y: 300, width: 520, height: 300 } })

  // Y desde un lateral: la ficha debe seguir leyéndose, no desaparecer.
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx - 330, cy, { steps: 24 })
  await page.mouse.up()
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'e2e/__shots__/card-side.png' })
})
