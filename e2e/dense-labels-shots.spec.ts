import { expect, test } from '@playwright/test'
import { CARD_BY_ID, STARTER_DECKS, createMatch, type BoardPiece } from '../src/game'

test.skip(!process.env.RUN_DENSE_LABELS, 'revisión de etiquetas densas bajo demanda')

for (const [width, height] of [[1920, 1080], [1366, 768]] as const) {
  test(`cifras grandes en filas pobladas a ${width} × ${height}`, async ({ page }) => {
    test.setTimeout(90_000)
    const card = CARD_BY_ID['sabueso-brasa']!
    const board: BoardPiece[] = Array.from({ length: 8 }, (_, index) => ({
      instanceId: `probe-${index}`, cardId: card.id, owner: index < 4 ? 'player' : 'ai',
      position: { x: 2 + index % 4, y: index < 4 ? 4 : 3 }, currentHealth: 12,
      attackModifier: 10, movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [],
    }))
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)
    const match = { ...base, turn: 5, terrain: [], board,
      players: { ...base.players, player: { ...base.players.player, mulliganTaken: true, hand: [] } } }
    await page.setViewportSize({ width, height })
    await page.addInitScript((saved) => {
      localStorage.setItem('cronicas-nexo-howto-visto', '1')
      localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: {
        selectedDeckId: 'furia-caldera', scenario: 'aether-citadel', muted: true,
        graphicsQuality: 'high', reducedMotion: true, boardTextScale: 1.4,
      }, version: 7 }))
      localStorage.setItem('cronicas-nexo-match', JSON.stringify({ state: {
        match: saved, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0,
      }, version: 2 }))
    }, match)
    await page.goto('/battle')
    await expect(page.getByTestId('battle-board')).toBeVisible({ timeout: 25000 })
    await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 2000 }).catch(() => {})
    const labels = page.locator('[class*="labelInner"][data-crowded]')
    await expect(labels).toHaveCount(8)
    await expect(page.locator('[class*="labelInner"][data-wide]')).toHaveCount(0)
    await page.waitForTimeout(1800)
    const boxes = await labels.evaluateAll((elements) => elements.map((element) => {
      const stats = element.querySelector('[class*="cardStats"]')!
      return Array.from(stats.children).map((child) => {
        const rect = child.getBoundingClientRect()
        return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom }
      })
    }))
    await page.screenshot({ path: `e2e/__shots__/etiquetas-densas-${width}x${height}.png` })
    for (let a = 0; a < boxes.length; a += 1) for (let b = a + 1; b < boxes.length; b += 1) {
      for (const left of boxes[a]!) for (const right of boxes[b]!) {
        const overlap = left.x < right.right && right.x < left.right && left.y < right.bottom && right.y < left.bottom
        expect(overlap, `etiquetas ${a} y ${b}: ${JSON.stringify([left, right])}`).toBe(false)
      }
    }
  })
}
