import { expect, test } from '@playwright/test'

const FAST_PREFS = {
  masterVolume: 0, musicVolume: 0, effectsVolume: 0, muted: true,
  reducedMotion: true, aiDelayMs: 200, selectedDeckId: 'furia-caldera',
  graphicsQuality: 'low', scenario: 'aether-citadel', animationSpeed: 2,
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((prefs) => {
    localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: prefs, version: 3 }))
    // La guía "Cómo jugar" solo debe interceptar cuando el propio test la ejercita.
    localStorage.setItem('cronicas-nexo-howto-visto', '1')
  }, FAST_PREFS)
})

test('abandonar una partida cuenta como derrota en el historial', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/battle?seed=4242')
  await page.getByRole('button', { name: 'Conservar las cinco' }).click()
  await page.getByRole('button', { name: '← Abandonar el Santuario' }).click()
  await expect(page.getByRole('heading', { name: '¿Abandonar esta crónica?' })).toBeVisible()
  await page.getByRole('button', { name: 'Abandonar', exact: true }).click()
  await expect(page).toHaveURL(/\/play$/)

  await page.goto('/decks')
  await expect(page.getByRole('heading', { name: 'Historial de escaramuzas' })).toBeVisible()
  await expect(page.locator('li').filter({ hasText: 'Derrota' }).first()).toBeVisible()
})

test('repetir una partida desde el historial navega con la misma semilla', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/battle?seed=7777')
  await page.getByRole('button', { name: 'Conservar las cinco' }).click()
  await page.getByRole('button', { name: '← Abandonar el Santuario' }).click()
  await page.getByRole('button', { name: 'Abandonar', exact: true }).click()
  await expect(page).toHaveURL(/\/play$/)

  await page.goto('/decks')
  await page.getByRole('button', { name: '↻ Repetir' }).first().click()
  await expect(page).toHaveURL(/\/battle\?seed=7777$/)
  await expect(page.getByRole('heading', { name: 'Tu mano inicial' })).toBeVisible()
})

test('compartir el código de un mazo y volver a importarlo restaura los cambios', async ({ page }) => {
  await page.goto('/decks')
  const firstCounter = page.locator('[class*="_counter_"]').first()
  const firstAdd = firstCounter.getByRole('button', { name: /^Añadir/ })
  await firstAdd.click()
  await firstAdd.click()
  const countBefore = await firstCounter.locator('span').innerText()

  await page.getByRole('button', { name: 'Compartir código' }).click()
  const code = await page.locator('code').innerText()
  expect(code.length).toBeGreaterThan(10)

  await page.getByRole('button', { name: 'Restaurar' }).click()
  await expect(firstCounter.locator('span')).not.toHaveText(countBefore)

  await page.getByRole('button', { name: 'Importar código' }).click()
  await page.getByPlaceholder('Pega aquí el código de un mazo de esta misma facción…').fill(code)
  await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(firstCounter.locator('span')).toHaveText(countBefore)
})

test('importar el código de otra facción se rechaza con el nombre del mazo dueño', async ({ page }) => {
  await page.goto('/decks')
  await page.getByRole('button', { name: 'Compartir código' }).click()
  const furyCode = await page.locator('code').innerText()

  await page.getByRole('button', { name: 'Secretos del Arcano' }).click()
  await page.getByRole('button', { name: 'Importar código' }).click()
  await page.getByPlaceholder('Pega aquí el código de un mazo de esta misma facción…').fill(furyCode)
  await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(page.getByText(/Ese código es de «Furia de la Caldera»/)).toBeVisible()
})

test('el glosario se abre desde la batalla y se cierra con Escape', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/battle?seed=101')
  await page.getByRole('button', { name: 'Conservar las cinco' }).click()
  await page.getByRole('button', { name: 'Glosario de términos' }).click()
  await expect(page.getByRole('heading', { name: 'Glosario de términos' })).toBeVisible()
  await expect(page.getByText('Impulso').first()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('heading', { name: 'Glosario de términos' })).toBeHidden()
})

test('una victoria en el primer turno celebra los logros recién desbloqueados', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/battle?seed=555')
  await page.getByRole('button', { name: 'Conservar las cinco' }).click()
  await page.keyboard.press('Control+Shift+D')
  const nexusHit = page.getByRole('button', { name: '-5 al Nexo rival' })
  for (let i = 0; i < 5; i += 1) {
    await nexusHit.click()
  }
  await expect(page.getByRole('heading', { name: 'Victoria' })).toBeVisible()
  await expect(page.getByText('Logros desbloqueados')).toBeVisible()
  await expect(page.getByText('⚔️ Primera sangre')).toBeVisible()
  await expect(page.getByText('⚡ Victoria relámpago')).toBeVisible()
})

test('«Volver al inicio» no deja la partida terminada a medias para la siguiente', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/battle?seed=555')
  await page.getByRole('button', { name: 'Conservar las cinco' }).click()
  await page.keyboard.press('Control+Shift+D')
  const nexusHit = page.getByRole('button', { name: '-5 al Nexo rival' })
  for (let i = 0; i < 5; i += 1) {
    await nexusHit.click()
  }
  await expect(page.getByRole('heading', { name: 'Victoria' })).toBeVisible()
  // Sin el reset, volver a entrar con la misma facción reanudaba esta misma
  // partida ya ganada (mismo rival, turno y tablero) en vez de empezar otra.
  await page.getByRole('button', { name: 'Volver al inicio' }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.goto('/battle?seed=555')
  await expect(page.getByRole('heading', { name: 'Tu mano inicial' })).toBeVisible()
  await page.getByRole('button', { name: 'Conservar las cinco' }).click()
  await expect(page.getByText('Turno 1 · Principal')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Victoria' })).toBeHidden()
})
