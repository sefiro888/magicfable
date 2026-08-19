import { expect, test, type Locator, type Page } from '@playwright/test'

/** Enters a fresh battle past the welcome guide and mulligan. */
const enterBattle = async (page: Page) => {
  await page.goto('/battle')
  await page.getByRole('button', { name: /Entendido, a jugar/i }).click()
  const keep = page.getByRole('button', { name: /Conservar las cinco/i })
  await keep.click()
  await expect(keep).toBeHidden()
  await page.getByRole('button', { name: /Saltar guía/i }).click().catch(() => {})
}

test('la tecla E finaliza el turno como el botón', async ({ page }) => {
  await enterBattle(page)
  const banner = page.locator('header > div:nth-child(2) > strong')
  await expect(banner).toHaveText('Tu turno')
  await page.keyboard.press('e')
  await expect(banner).toHaveText('Turno rival', { timeout: 10_000 })
})

test('la tecla H recoge y muestra la mano como el botón', async ({ page }) => {
  await enterBattle(page)
  const footer = page.locator('footer')
  await expect(footer).not.toHaveAttribute('data-tucked', 'true')
  await page.keyboard.press('h')
  await expect(footer).toHaveAttribute('data-tucked', 'true')
  await page.keyboard.press('h')
  await expect(footer).not.toHaveAttribute('data-tucked', 'true')
})

test('fijar una carta la mueve al principio del abanico', async ({ page }) => {
  test.setTimeout(60_000)
  await enterBattle(page)
  const cards = page.locator('[class*="fanCard"]')
  const count = await cards.count()
  expect(count).toBeGreaterThan(1)
  // Fija la ÚLTIMA carta del abanico: debe pasar a ser la primera. Se compara
  // el nombre de la carta (primera línea), no el icono de la estrella, que
  // cambia de ☆ a ★ al fijarla.
  const cardName = (locator: Locator) => locator.locator('h3, strong').first().innerText()
  const lastName = await cardName(cards.nth(count - 1))
  await cards.nth(count - 1).locator('[class*="favoriteToggle"]').click()
  await expect(cards.nth(0).locator('[class*="favoriteToggle"]')).toHaveAttribute('data-favorite', 'true')
  expect(await cardName(cards.nth(0))).toBe(lastName)
})

test('modo foto muestra el aviso y bloquea el despliegue en el tablero', async ({ page }) => {
  test.setTimeout(60_000)
  await enterBattle(page)
  await page.keyboard.press('Control+Shift+KeyD')
  const essence = page.getByRole('button', { name: '+1 Esencia' })
  await essence.waitFor({ state: 'visible' })
  for (let i = 0; i < 8; i += 1) await essence.click()

  const toggle = page.getByRole('button', { name: /Modo foto/i })
  await toggle.click()
  await expect(page.getByRole('status').filter({ hasText: 'Modo foto' })).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')

  // Con el modo foto activo, un clic en el tablero no debe desplegar nada.
  const unit = page.locator('[class*="fanCard"]').filter({ hasText: /Unidad/ }).first()
  await unit.click()
  const board = page.getByTestId('battle-board')
  await board.click({ position: { x: 640, y: 380 } })
  await page.waitForTimeout(400)
  await expect(page.getByText(/entra en juego/i)).toHaveCount(0)

  // Al salir, el mismo clic sí despliega la unidad seleccionada.
  await page.getByRole('button', { name: /Salir del modo foto/i }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Modo foto' })).toBeHidden()
  await board.click({ position: { x: 640, y: 380 } })
  await expect(page.getByText(/entra en juego/i).first()).toBeVisible({ timeout: 10_000 })
})
