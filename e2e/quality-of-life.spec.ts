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
