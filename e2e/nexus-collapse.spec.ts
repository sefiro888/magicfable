import { expect, test } from '@playwright/test'
import { STARTER_DECKS, createMatch, type BoardPiece } from '../src/game'

for (const [width, height, reducedMotion] of [[1920, 1080, false], [1366, 768, false], [1366, 768, true]] as const) {
  test(`el Nexo cae y se restaura al repetir: ${width} × ${height}, movimiento reducido ${reducedMotion}`, async ({ page }) => {
    test.setTimeout(90000)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)
    const attacker: BoardPiece = {
      instanceId: 'finisher', cardId: 'dragon-caldera', owner: 'player', position: { x: 3, y: 0 },
      currentHealth: 7, attackModifier: 0, movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [],
    }
    const match = { ...base, turn: 5, terrain: [], board: [attacker],
      players: { player: { ...base.players.player, mulliganTaken: true, hand: [] }, ai: { ...base.players.ai, nexusHealth: 2 } } }
    await page.setViewportSize({ width, height })
    await page.addInitScript(({ saved, reducedMotion }) => {
      localStorage.setItem('cronicas-nexo-howto-visto', '1')
      localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: {
        selectedDeckId: 'furia-caldera', muted: true, scenario: 'aether-citadel',
        graphicsQuality: 'medium', reducedMotion, animationSpeed: 1,
      }, version: 7 }))
      localStorage.setItem('cronicas-nexo-match', JSON.stringify({ state: {
        match: saved, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0,
      }, version: 2 }))
    }, { saved: match, reducedMotion })
    await page.goto('/battle')
    await expect(page.getByTestId('battle-board')).toBeVisible({ timeout: 25000 })
    await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 2000 }).catch(() => {})
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Enter')
    await page.keyboard.press('n')
    const fallen = page.locator('[data-collapsed]')
    await expect(fallen).toHaveCount(1, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: 'Victoria', exact: true })).toBeVisible({ timeout: 15000 })
    await expect(fallen).toHaveCSS('opacity', '0')
    await expect(page.locator('[data-fallen]')).toContainText('NEXO RIVAL · CAÍDO')
    await page.getByRole('button', { name: 'Repetir', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Tu mano inicial' })).toBeVisible()
    await expect(fallen).toHaveCount(0)
    expect(errors).toEqual([])
  })
}
