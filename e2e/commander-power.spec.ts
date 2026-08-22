import { expect, test } from '@playwright/test'

/**
 * El poder del comandante: una vez por partida, se paga con Esencia y es la
 * única jugada que no sale de una carta.
 */
test('el poder del comandante se lanza una vez y se agota', async ({ page }) => {
  test.setTimeout(120_000)
  await page.addInitScript(() => {
    localStorage.setItem('cronicas-nexo-howto-visto', '1')
    localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({
      state: { muted: true, selectedDeckId: 'furia-caldera', confirmEndTurn: false }, version: 7,
    }))
  })
  await page.goto('/battle?seed=1311657807')
  await page.getByRole('button', { name: /Conservar las cinco/i }).click()
  await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 4000 }).catch(() => {})

  const poder = page.getByRole('button', { name: /Erupción de la Caldera/i })
  await expect(poder).toBeVisible()
  // Sin Esencia no se puede usar.
  await expect(poder).toBeDisabled()

  // Con Esencia, sí.
  await page.keyboard.press('Control+Shift+KeyD')
  const essence = page.getByRole('button', { name: '+1 Esencia' })
  await essence.waitFor({ state: 'visible' })
  for (let i = 0; i < 6; i += 1) await essence.click()
  await page.keyboard.press('Control+Shift+KeyD')
  await expect(poder).toBeEnabled()
  await poder.click()

  // Ya gastado: queda deshabilitado y lo dice.
  await expect(poder).toBeDisabled()
  await expect(poder).toContainText(/Ya lo has usado/i)
})
