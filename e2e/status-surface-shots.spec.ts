import { expect, test } from '@playwright/test'
import { CARD_BY_ID, STARTER_DECKS, createMatch, type AnimationEvent, type BoardPiece } from '../src/game'
import type { useMatchStore as MatchStoreHook } from '../src/store/match'
import { matchStoreUrl } from './helpers/matchStoreUrl'

test.skip(!process.env.RUN_STATUS_SHOTS, 'revisión de superficie bajo demanda')

for (const [width, height] of [[1920, 1080], [1366, 768]] as const) {
  test(`hielo, contagio, maldición y huella ígnea a ${width} × ${height}`, async ({ page }) => {
    test.setTimeout(150000)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)
    const piece = (instanceId: string, cardId: string, x: number, statuses: BoardPiece['statuses'] = []): BoardPiece => ({
      instanceId, cardId, owner: 'player', position: { x, y: 5 },
      currentHealth: CARD_BY_ID[cardId]!.health! - 1, attackModifier: 0,
      movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses,
    })
    const match = { ...base, turn: 5, terrain: [], board: [
      piece('ice', 'oso-forestal', 0, [{ kind: 'frozen', expiresOnTurn: 12 }]),
      piece('plague', 'ariete-volcanico', 2, [{ kind: 'infected', infectorId: 'ai' }]),
      piece('fire', 'leviatan-de-las-simas', 4),
      piece('curse', 'centinela-cristal', 6, [{ kind: 'cursed', amount: 1 }]),
    ], players: { ...base.players, player: { ...base.players.player, mulliganTaken: true, hand: [] } } }
    await page.clock.install()
    await page.setViewportSize({ width, height })
    await page.addInitScript((saved) => {
      localStorage.setItem('cronicas-nexo-howto-visto', '1')
      localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: {
        selectedDeckId: 'furia-caldera', scenario: 'aether-citadel', muted: true,
        graphicsQuality: 'high', reducedMotion: false, animationSpeed: 1,
      }, version: 7 }))
      localStorage.setItem('cronicas-nexo-match', JSON.stringify({ state: {
        match: saved, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0,
      }, version: 2 }))
    }, match)
    const storeRequest = matchStoreUrl(page)
    await page.goto('/battle')
    const storeUrl = await storeRequest
    await expect(page.getByTestId('battle-board')).toBeVisible({ timeout: 25000 })
    await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 2000 }).catch(() => {})
    await expect(page.locator('[title^="Maldita:"]')).toBeAttached({ timeout: 25000 })
    const board = (await page.getByTestId('battle-board').boundingBox())!
    await page.mouse.move(board.x + board.width / 2, board.y + board.height * 0.55)
    await page.mouse.wheel(0, -650)
    await page.waitForTimeout(1000)
    await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 10000))
    const event: AnimationEvent = { id: 'fire-surface', type: 'damage', targetId: 'fire',
      to: { x: 4, y: 5 }, amount: 1, cardId: 'dragon-caldera', effectId: 'dragon-flame', durationMs: 12000 }
    await page.evaluate(async ({ storeUrl, event }) => {
      const module = await import(storeUrl) as { useMatchStore: typeof MatchStoreHook }
      module.useMatchStore.setState({ currentEvent: event, pendingAnimations: [] })
    }, { storeUrl, event })
    await page.waitForTimeout(100)
    await page.clock.runFor(100)
    await page.screenshot({ path: `e2e/__shots__/estados-brasas-${width}x${height}.png` })
    await page.clock.fastForward(1800)
    await page.clock.runFor(17)
    await page.screenshot({ path: `e2e/__shots__/estados-hollin-${width}x${height}.png` })
    await page.clock.fastForward(7000)
    await page.clock.runFor(17)
    await page.screenshot({ path: `e2e/__shots__/estados-extintos-${width}x${height}.png` })
    expect(errors).toEqual([])
  })
}
