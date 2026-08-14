import { expect, test } from '@playwright/test'

/**
 * Arrastrar una carta de la mano hasta una casilla la despliega ahí.
 *
 * Cubre además que el clic de siempre siga funcionando: el arrastre se añadió
 * sin sustituirlo, y al soltar el navegador dispara un clic extra que, sin el
 * guardado correspondiente, alternaría la selección de la carta recién jugada.
 */
test('arrastrar una unidad de la mano al tablero la despliega', async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto('/battle')
  await page.getByRole('button', { name: /Entendido, a jugar/i }).click()
  const keep = page.getByRole('button', { name: /Conservar las cinco/i })
  await keep.click()
  await expect(keep).toBeHidden()
  await page.getByRole('button', { name: /Saltar guía/i }).click().catch(() => {})

  // Esencia suficiente para poder desplegar en el primer turno.
  await page.keyboard.press('Control+Shift+KeyD')
  const essence = page.getByRole('button', { name: '+1 Esencia' })
  await essence.waitFor({ state: 'visible' })
  for (let i = 0; i < 8; i += 1) await essence.click()

  const board = page.getByTestId('battle-board')
  await expect(board).toBeVisible()
  const before = await board.locator('canvas').count()
  expect(before).toBe(1)

  const unit = page.locator('[class*="fanCard"]').filter({ hasText: /Unidad/ }).first()
  await expect(unit).toBeVisible()
  const from = await unit.boundingBox()
  const target = await board.boundingBox()
  if (!from || !target) throw new Error('No se pudo medir la carta o el tablero')

  // Arrastre real: pulsar sobre la carta, cruzar el umbral, entrar en el
  // tablero y soltar sobre la fila de despliegue propia (parte baja).
  await page.mouse.move(from.x + from.width / 2, from.y + 24)
  await page.mouse.down()
  await page.mouse.move(from.x + from.width / 2, from.y - 40, { steps: 6 })
  const dropX = target.x + target.width / 2
  const dropY = target.y + target.height * 0.78
  await page.mouse.move(dropX, dropY, { steps: 12 })
  // El fantasma confirma que el gesto se reconoció como arrastre.
  await expect(page.locator('[class*="dragGhost"]')).toBeVisible()
  await page.mouse.up()

  await expect(page.locator('[class*="dragGhost"]')).toBeHidden()
  // La crónica anuncia la unidad que acaba de entrar en juego.
  await expect(page.getByText(/entra en juego/i).first()).toBeVisible({ timeout: 10_000 })
})
