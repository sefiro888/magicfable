import { expect, test } from '@playwright/test'

/** Historial de ejemplo: dos victorias y una derrota, la última la primera de la lista. */
const sembrarHistorial = `(() => {
  const base = {
    finishedAt: Date.now(), deckId: 'furia-caldera', deckName: 'Furia de la Caldera',
    commanderName: 'Kaela', opponentDeckName: 'Secretos del Arcano',
    turns: 12, seconds: 300, damageDealt: 22, seed: 1, mode: 'ai',
  }
  localStorage.setItem('cronicas-nexo-records', JSON.stringify({
    state: { records: [
      { ...base, id: 'a', won: true },
      { ...base, id: 'b', won: true },
      { ...base, id: 'c', won: false },
    ] },
    version: 1,
  }))
})()`

test('un jugador nuevo no ve paneles de progreso vacíos', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Iniciar partida' })).toBeVisible()
  await expect(page.locator('[aria-label="Tu progreso"]')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Continuar partida/i })).toHaveCount(0)
})

test('con historial, la portada resume tus partidas', async ({ page }) => {
  await page.addInitScript(sembrarHistorial)
  await page.goto('/')
  const panel = page.locator('[aria-label="Tu progreso"]')
  await expect(panel).toBeVisible()
  await expect(panel).toContainText('3')
  await expect(panel).toContainText('67%')
  await expect(panel).toContainText('Furia de la Caldera')
})

test('una partida a medias se puede continuar desde la portada', async ({ page }) => {
  test.setTimeout(120_000)
  await page.addInitScript(() => localStorage.setItem('cronicas-nexo-howto-visto', '1'))
  await page.goto('/battle?seed=1311657807')
  await page.getByRole('button', { name: /Conservar las cinco/i }).click()
  await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 4000 }).catch(() => {})
  // Despliega algo: una partida en el turno 1 y sin nada en el tablero no
  // cuenta como «a medias», para no ofrecer continuar lo que no ha empezado.
  await page.keyboard.press('Control+Shift+KeyD')
  const essence = page.getByRole('button', { name: '+1 Esencia' })
  await essence.waitFor({ state: 'visible' })
  for (let i = 0; i < 6; i += 1) await essence.click()
  await page.keyboard.press('Control+Shift+KeyD')
  const unit = page.locator('[class*="fanCard"]').filter({ hasText: /Unidad/ }).first()
  await unit.click()
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(2000)

  await page.goto('/')
  const continuar = page.getByRole('link', { name: /Continuar partida/i })
  await expect(continuar).toBeVisible()
  // Y dice cómo va la cosa sin tener que entrar.
  await expect(page.getByText(/tu Nexo \d+ — el suyo \d+/)).toBeVisible()
  await continuar.click()
  await expect(page.getByTestId('battle-board')).toBeVisible({ timeout: 25_000 })
})
