import { expect, test } from '@playwright/test'

test('recorre la galería y comienza una partida contra la IA', async ({ page }) => {
  test.setTimeout(90_000)
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  // El e2e valida el flujo de juego, no los gráficos: calidad baja y
  // movimiento reducido para que el WebGL por software no agote el tiempo.
  await page.addInitScript(() => {
    localStorage.setItem(
      'cronicas-nexo-preferences',
      JSON.stringify({
        state: {
          masterVolume: 0, musicVolume: 0, effectsVolume: 0, muted: true,
          reducedMotion: true, aiDelayMs: 200, selectedDeckId: 'furia-caldera',
          graphicsQuality: 'low', scenario: 'aether-citadel', animationSpeed: 2,
        },
        version: 3,
      }),
    )
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'CRÓNICAS DEL NEXO' })).toBeVisible()

  await page.getByRole('link', { name: 'Explorar cartas' }).click()
  await expect(page).toHaveURL(/\/gallery$/)
  await expect(page.locator('[data-card-id]')).toHaveCount(66)

  await page.getByRole('button', { name: /Sabueso de Brasa\. Unidad/ }).click()
  await expect(page.getByRole('dialog', { name: 'Sabueso de Brasa' })).toBeVisible()
  await expect(page.getByRole('tooltip', { name: /Impulso/ }).first()).toBeAttached()
  await page.getByRole('button', { name: 'Cerrar inspección' }).click()

  await page.getByRole('link', { name: 'Jugar' }).click()
  await expect(page.getByRole('heading', { name: 'Selecciona tu mazo' })).toBeVisible()
  await page.getByRole('button', { name: 'Entrar al tablero' }).click()

  // Semilla fija: la mano inicial debe contener una fuente para el paso siguiente.
  await page.goto('/battle?seed=1311657807')
  await expect(page.getByTestId('battle-board')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Tu mano inicial' })).toBeVisible()
  await page.getByRole('button', { name: 'Conservar las cinco' }).click()
  await expect(page.getByText('Turno 1 · Principal')).toBeVisible()
  await page.getByRole('button', { name: /Fuente de Furia\. Esencia — Fuente\./ }).first().click()
  await expect(page.getByText('1 / 1').first()).toBeVisible()
  await expect(page.getByText('Fuente de Furia entra en la reserva.')).toBeVisible()

  await page.getByRole('button', { name: 'Finalizar turno' }).click()
  // La IA reproduce su turno paso a paso y devuelve el control (turno 3 = jugador).
  await expect(page.getByText('Turno 3 · Principal')).toBeVisible({ timeout: 25_000 })
  expect(consoleErrors).toEqual([])
})
