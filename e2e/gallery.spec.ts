import { expect, test } from '@playwright/test'

/**
 * La galería enseñaba los identificadores internos de las palabras clave
 * ('swift-strike') en su filtro, porque el diccionario de nombres vivía dentro
 * del inspector de cartas. Esta prueba fija que lo que se lee es español.
 */
test('el filtro de palabras clave está en español', async ({ page }) => {
  await page.goto('/gallery')
  const keywords = page.getByLabel('Filtrar por palabra clave')
  await expect(keywords).toContainText('Golpe veloz')
  await expect(keywords).toContainText('Vínculo vital')
  await expect(keywords).not.toContainText('swift-strike')
  await expect(keywords).not.toContainText('lifelink')
})

test('ordenar por coste reordena las cartas de verdad', async ({ page }) => {
  await page.goto('/gallery')
  const primera = page.locator('[class*="galleryCard"], article').first()
  await page.getByLabel('Ordenar las cartas').selectOption('cost-desc')
  await expect(primera).toBeVisible()
  const caras = await primera.textContent()
  await page.getByLabel('Ordenar las cartas').selectOption('cost-asc')
  await expect(primera).toBeVisible()
  const baratas = await primera.textContent()
  expect(caras).not.toBe(baratas)
})
