import { expect, test } from '@playwright/test'

test('recorre la galería y comienza una partida contra la IA', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'CRÓNICAS DEL NEXO' })).toBeVisible()

  await page.getByRole('link', { name: 'Explorar cartas' }).click()
  await expect(page).toHaveURL(/\/gallery$/)
  await expect(page.locator('[data-card-id]')).toHaveCount(24)

  await page.getByRole('button', { name: /Sabueso de Brasa\. Unidad/ }).click()
  await expect(page.getByRole('dialog', { name: 'Sabueso de Brasa' })).toBeVisible()
  await expect(page.getByRole('tooltip', { name: /Impulso/ }).first()).toBeAttached()
  await page.getByRole('button', { name: 'Cerrar inspección' }).click()

  await page.getByRole('link', { name: 'Jugar' }).click()
  await expect(page.getByRole('heading', { name: 'Selecciona tu mazo' })).toBeVisible()
  await page.getByRole('button', { name: 'Entrar al tablero' }).click()

  await expect(page.getByTestId('battle-board')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Tu mano inicial' })).toBeVisible()
  await page.getByRole('button', { name: 'Conservar las cinco' }).click()
  await expect(page.getByText('Turno 1 · Principal')).toBeVisible()
  await page.getByRole('button', { name: /Fuente de Furia\. Esencia — Fuente\./ }).first().click()
  await expect(page.getByText('1 / 1')).toBeVisible()
  await expect(page.getByText('Fuente de Furia entra en la reserva.')).toBeVisible()

  await page.getByRole('button', { name: 'Finalizar turno' }).click()
  // La IA reproduce su turno paso a paso y devuelve el control (turno 3 = jugador).
  await expect(page.getByText('Turno 3 · Principal')).toBeVisible({ timeout: 25_000 })
  expect(consoleErrors).toEqual([])
})
