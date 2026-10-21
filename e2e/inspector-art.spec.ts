import { expect, test } from '@playwright/test'

for (const viewport of [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }, { width: 375, height: 812 }]) {
  test(`la inspección conserva el arte completo y sus controles a ${viewport.width} × ${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/gallery')
    await page.getByRole('searchbox', { name: 'Buscar cartas' }).fill('Fuente de Forja')
    // El atajo abre la misma inspección desde mano, galería y tablero.
    const card = page.locator('article[tabindex="0"]').first()
    await card.focus()
    await card.press('i')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    const art = dialog.getByRole('img').first()
    await expect(art).toBeVisible()
    await expect.poll(() => art.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    await expect(art).toHaveAttribute('src', /art-full\/fuente-forja.webp/)
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true)
    const bounds = await dialog.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width)
    if (process.env.RUN_SHOTS === '1') {
      await page.screenshot({ path: `e2e/__shots__/inspector-arte-${viewport.width}x${viewport.height}.png` })
    }
    await dialog.getByRole('button', { name: 'Carta completa' }).click()
    await expect(dialog.locator('article')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(card).toBeFocused()
  })
}
