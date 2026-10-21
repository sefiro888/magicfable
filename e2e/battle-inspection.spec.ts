import { expect, test } from '@playwright/test'
import { STARTER_DECKS, createMatch, type BoardPiece } from '../src/game'

for (const [width, height] of [[1920, 1080], [1366, 768]] as const) {
  test(`la inspección distingue dos copias y retiene el foco a ${width} × ${height}`, async ({ page }) => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)
    const cold: BoardPiece = {
      instanceId: 'cold', cardId: 'sabueso-brasa', owner: 'player', position: { x: 3, y: 5 },
      currentHealth: 1, attackModifier: 0, movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0,
      statuses: [{ kind: 'frozen', expiresOnTurn: 10 }, { kind: 'shielded', amount: 2 }],
    }
    const match = { ...base, turn: 5, terrain: [], board: [cold, { ...cold, instanceId: 'plain', position: { x: 4, y: 5 }, statuses: [] }],
      players: { ...base.players, player: { ...base.players.player, mulliganTaken: true, hand: [] } } }
    await page.setViewportSize({ width, height })
    await page.addInitScript((saved) => {
      localStorage.setItem('cronicas-nexo-howto-visto', '1')
      localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: {
        selectedDeckId: 'furia-caldera', muted: true, scenario: 'aether-citadel',
        graphicsQuality: 'medium', reducedMotion: true, confirmEndTurn: false,
      }, version: 7 }))
      localStorage.setItem('cronicas-nexo-match', JSON.stringify({ state: {
        match: saved, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0,
      }, version: 2 }))
    }, match)
    await page.goto('/battle')
    await expect(page.getByTestId('battle-board')).toBeVisible({ timeout: 25000 })
    await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 2000 }).catch(() => {})
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Enter')
    await page.keyboard.press('i')
    const dialog = page.getByRole('dialog', { name: 'Sabueso de Brasa' })
    await expect(dialog).toBeVisible()
    const view = dialog.getByRole('button', { name: 'Carta completa' })
    await view.click()
    await expect(dialog.getByLabel('Estados activos')).toHaveText(/Congelada.*Escudo 2/)
    await page.waitForTimeout(1100)
    await expect(view).toBeFocused()
    await page.keyboard.press('e')
    await expect(page.locator('header').first()).toContainText('Turno 5')
    if (process.env.RUN_SHOTS) await page.screenshot({ path: `e2e/__shots__/inspeccion-batalla-${width}x${height}.png` })
    await page.keyboard.press('Escape')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')
    await page.keyboard.press('i')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Carta completa' }).click()
    await expect(dialog.getByLabel('Estados activos')).toHaveCount(0)
  })
}
