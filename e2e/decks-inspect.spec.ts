import { expect, test } from '@playwright/test'

/**
 * En «Mazos», pulsar una carta abre su ficha en vez de meterla en el mazo:
 * para añadirla está el «+». Antes no había forma de leer una carta del
 * catálogo sin metértela antes en la lista.
 */
test('en Mazos, pulsar una carta muestra su información y solo el + la añade', async ({ page }) => {
  await page.goto('/decks')

  const catalogo = page.locator('[class*="poolCard"]').first()
  await expect(catalogo).toBeVisible({ timeout: 15_000 })
  const listaAntes = await page.locator("article[class*=\"entry\"]").count()

  // Clic en la carta: se abre la ficha, la lista del mazo no cambia.
  await catalogo.getByRole('button', { name: /^Ver la ficha de/ }).click()
  const ficha = page.getByRole('dialog')
  await expect(ficha).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(ficha).toBeHidden()
  expect(await page.locator("article[class*=\"entry\"]").count()).toBe(listaAntes)

  // El «+» sí la añade.
  await catalogo.getByRole('button', { name: /^Añadir/ }).click()
  await expect(page.locator("article[class*=\"entry\"]")).toHaveCount(listaAntes + 1)
})

test('en Jugar se puede cambiar de comandante sin cambiar de mazo', async ({ page }) => {
  await page.goto('/play')
  const grupo = page.getByRole('group', { name: /Comandante de/ }).first()
  await expect(grupo).toBeVisible({ timeout: 15_000 })
  const lideres = grupo.getByRole('button')
  await expect(lideres).toHaveCount(2)
  // El segundo líder no está elegido de salida; al pulsarlo pasa a estarlo.
  await expect(lideres.nth(1)).toHaveAttribute('aria-pressed', 'false')
  await lideres.nth(1).click()
  await expect(lideres.nth(1)).toHaveAttribute('aria-pressed', 'true')
  await expect(lideres.nth(0)).toHaveAttribute('aria-pressed', 'false')
})
