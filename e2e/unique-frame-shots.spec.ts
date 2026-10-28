import { expect, test } from '@playwright/test'
import { CARDS, STARTER_DECKS, createMatch, type BoardPiece } from '../src/game'

test.skip(!process.env.RUN_UNIQUE_SHOTS, 'comparación visual de marcos bajo demanda')

for (const [width, height] of [[1920, 1080], [1366, 768]] as const) {
  test(`carta única y normal a ${width} × ${height}`, async ({ page }) => {
    test.setTimeout(90_000)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)
    const cards = [false, true].map((unique) => CARDS.find((card) => card.faction === 'fury' && card.type === 'unit' && Boolean(card.unique) === unique)!)
    expect(cards.every(Boolean)).toBe(true)
    const board: BoardPiece[] = cards.map((card, index) => ({ instanceId: `probe-${index}`, cardId: card.id,
      owner: 'player', position: { x: index === 0 ? 3 : 4, y: 4 }, currentHealth: card.health ?? 1,
      attackModifier: 0, movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [] }))
    const match = { ...base, turn: 5, terrain: [], board,
      players: { ...base.players, player: { ...base.players.player, mulliganTaken: true, hand: [] } } }
    await page.setViewportSize({ width, height })
    await page.addInitScript(({ saved, largeText }) => {
      localStorage.setItem('cronicas-nexo-howto-visto', '1')
      localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: {
        selectedDeckId: 'furia-caldera', scenario: 'aether-citadel', muted: true,
        graphicsQuality: 'high', reducedMotion: true, boardTextScale: largeText ? 1.4 : 1,
      }, version: 7 }))
      localStorage.setItem('cronicas-nexo-match', JSON.stringify({ state: {
        match: saved, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0,
      }, version: 2 }))
    }, { saved: match, largeText: Boolean(process.env.UNIQUE_LARGE_TEXT) })
    await page.goto('/battle')
    await expect(page.getByTestId('battle-board')).toBeVisible({ timeout: 25000 })
    await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 2000 }).catch(() => {})
    for (const card of cards) await expect(page.locator('[class*="cardName"]').filter({ hasText: card.name })).toBeAttached({ timeout: 15000 })
    const mark = page.getByRole('img', { name: 'Carta única' })
    await expect(mark).toHaveCount(1)
    const markBox = (await mark.boundingBox())!
    const normalStats = (await page.locator('[class*="labelInner"]').filter({ hasText: cards[0]!.name }).locator('[class*="cardStats"] > span').last().boundingBox())!
    expect(markBox.x).toBeGreaterThanOrEqual(normalStats.x + normalStats.width)
    await page.waitForTimeout(1800)
    await page.screenshot({ path: `e2e/__shots__/marco-unico${process.env.UNIQUE_LARGE_TEXT ? '-texto-grande' : ''}-${width}x${height}.png` })
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')
    await expect(mark).toBeVisible()
    await expect(mark.locator('xpath=../..')).toHaveAttribute('data-selected', 'true')
    expect(errors).toEqual([])
  })
}
