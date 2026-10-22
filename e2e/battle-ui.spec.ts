import { expect, test } from '@playwright/test'
import { STARTER_DECKS, createMatch } from '../src/game'

for (const [width, height] of [[1920, 1080], [1366, 768]] as const) {
  test(`la interfaz deja respirar al escenario y conserva los controles a ${width} × ${height}`, async ({ page }) => {
    test.setTimeout(90000)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)
    const match = { ...base, terrain: [], players: { ...base.players, player: { ...base.players.player,
      mulliganTaken: true, hand: ['fuente-furia', 'dragon-caldera', 'lluvia-ceniza', 'sabueso-brasa', 'berserker-ignivoro']
        .map((cardId, index) => ({ cardId, instanceId: `hand-${index}` })),
    } } }
    await page.setViewportSize({ width, height })
    await page.addInitScript((saved) => {
      localStorage.setItem('cronicas-nexo-howto-visto', '1')
      localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: {
        selectedDeckId: 'furia-caldera', scenario: 'aether-citadel', muted: true,
        graphicsQuality: 'medium', reducedMotion: true, confirmEndTurn: false,
      }, version: 7 }))
      localStorage.setItem('cronicas-nexo-match', JSON.stringify({ state: {
        match: saved, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0,
      }, version: 2 }))
    }, match)
    await page.goto('/battle')
    const board = page.getByTestId('battle-board')
    await expect(board).toBeVisible({ timeout: 25000 })
    await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 2000 }).catch(() => {})
    await expect(page.getByRole('button', { name: 'Finalizar turno', exact: true })).toBeInViewport()
    const canvas = (await board.locator('canvas').boundingBox())!
    expect(Math.abs(canvas.x)).toBeLessThan(2)
    expect(Math.abs(canvas.width - width)).toBeLessThan(2)
    expect((await page.locator('aside[data-context-empty]').boundingBox())!.height).toBeLessThan(300)
    const before = (await board.boundingBox())!
    await page.keyboard.press('h')
    await expect(page.getByRole('button', { name: 'Mostrar la mano', exact: true })).toBeVisible()
    await expect.poll(async () => (await board.boundingBox())!.height).toBeGreaterThan(before.height + 100)
    await page.keyboard.press('h')
    await expect.poll(async () => Math.abs((await board.boundingBox())!.height - before.height)).toBeLessThan(2)
    await page.locator('[class*="fanCard"]').filter({ hasText: 'Dragón de la Caldera' }).getByRole('button', { name: /Dragón de la Caldera\. Unidad/ }).click()
    await expect(page.locator('aside').getByRole('heading', { name: 'Dragón de la Caldera', exact: true })).toBeVisible()
    await expect(page.locator('header').first()).toBeInViewport({ ratio: 1 })
    expect(await page.locator('[data-motion]').first().evaluate((node) => node.scrollTop)).toBe(0)
    await expect(page.getByRole('button', { name: 'Finalizar turno', exact: true })).toBeInViewport()
    if (process.env.RUN_SHOTS) {
      await page.waitForTimeout(1000)
      await page.screenshot({ path: `e2e/__shots__/interfaz-batalla-${width}x${height}.png` })
    }
    expect(errors).toEqual([])
  })
}
