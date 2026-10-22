import { expect, test } from '@playwright/test'
import { STARTER_DECKS, createMatch, type AnimationEvent } from '../src/game'
import type { useMatchStore as MatchStoreHook } from '../src/store/match'
import { matchStoreUrl } from './helpers/matchStoreUrl'

test.skip(!process.env.RUN_NEXUS_SHOTS, 'revisión visual de la ruptura bajo demanda')

for (const [width, height] of [[1920, 1080], [1366, 768]] as const) {
  test(`ruptura de ambos Nexos y vuelta de cámara a ${width} × ${height}`, async ({ page }) => {
    test.setTimeout(180000)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)
    const match = { ...base, turn: 5, terrain: [], board: [],
      players: { ...base.players, player: { ...base.players.player, mulliganTaken: true, hand: [] } } }
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
    await page.waitForTimeout(1800)
    for (const victim of ['ai', 'player'] as const) {
      await page.clock.resume()
      await page.evaluate(async ({ victim, storeUrl }) => {
        const module = await import(storeUrl) as { useMatchStore: typeof MatchStoreHook }
        const current = module.useMatchStore.getState().match!
        module.useMatchStore.setState({ currentEvent: undefined, pendingAnimations: [], match: {
          ...current, players: {
            player: { ...current.players.player, nexusHealth: victim === 'player' ? 1 : 35 },
            ai: { ...current.players.ai, nexusHealth: victim === 'ai' ? 1 : 35 },
          },
        } })
      }, { victim, storeUrl })
      await expect(page.locator('[data-collapsed]')).toHaveCount(0)
      const otherPortrait = page.locator('[class*="nexusCard"]').nth(victim === 'ai' ? 0 : 1)
      await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 10000))
      await page.clock.runFor(50)
      const before = (await otherPortrait.boundingBox())!
      const event: AnimationEvent = { id: `rupture-${victim}`, type: 'victory', actorId: victim === 'ai' ? 'player' : 'ai', targetId: `${victim}-nexus`, durationMs: 3000 }
      await page.evaluate(async ({ victim, event, storeUrl }) => {
        const module = await import(storeUrl) as { useMatchStore: typeof MatchStoreHook }
        const current = module.useMatchStore.getState().match!
        module.useMatchStore.setState({ currentEvent: event, pendingAnimations: [], match: {
          ...current, players: { ...current.players, [victim]: { ...current.players[victim], nexusHealth: 0 } },
        } })
      }, { victim, event, storeUrl })
      await page.waitForTimeout(100)
      await page.clock.runFor(100)
      await expect(page.locator('[data-collapsed]')).toHaveCount(1)
      await page.clock.fastForward(2100)
      await page.clock.runFor(17)
      await page.screenshot({ path: `e2e/__shots__/nexo-ruptura-${victim}-${width}x${height}.png`, animations: 'disabled' })
      await page.evaluate(async (storeUrl) => {
        const module = await import(storeUrl) as { useMatchStore: typeof MatchStoreHook }
        module.useMatchStore.getState().skipAnimations()
      }, storeUrl)
      await page.waitForTimeout(100)
      await page.clock.runFor(50)
      await page.clock.fastForward(1300)
      await page.clock.runFor(17)
      const after = (await otherPortrait.boundingBox())!
      expect(Math.abs(after.x - before.x)).toBeLessThan(2)
      expect(Math.abs(after.y - before.y)).toBeLessThan(2)
      expect(Math.abs(after.width - before.width)).toBeLessThan(2)
      await expect(page.locator('[data-fallen]')).toHaveCount(1)
      await page.screenshot({ path: `e2e/__shots__/nexo-ruina-${victim}-${width}x${height}.png`, animations: 'disabled' })
      expect(errors).toEqual([])
    }
  })
}
