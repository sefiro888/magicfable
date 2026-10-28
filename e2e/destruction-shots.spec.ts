import { expect, test } from '@playwright/test'
import { CARDS, STARTER_DECKS, createMatch, type AnimationEvent, type BoardPiece, type FactionId } from '../src/game'
import type { useMatchStore as MatchStoreHook } from '../src/store/match'
import { matchStoreUrl } from './helpers/matchStoreUrl'
import { SCENARIO_OPTIONS } from '../src/battle/scenarioCatalog'

const scenario = SCENARIO_OPTIONS.find((option) => option.value !== 'auto' && option.value === process.env.DESTRUCTION_SCENERY)?.value ?? 'sanctuary'

test.skip(!process.env.RUN_DESTRUCTION_SHOTS, 'revisión visual de destrucciones bajo demanda')

for (const [width, height] of [[1920, 1080], [1366, 768]] as const) {
  test(`destrucciones por facción a ${width} × ${height}`, async ({ page }) => {
    test.setTimeout(180_000)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)
    const match = { ...base, turn: 5, terrain: [], board: [],
      players: { ...base.players, player: { ...base.players.player, mulliganTaken: true, hand: [] } } }
    await page.clock.install()
    await page.setViewportSize({ width, height })
    await page.addInitScript(({ saved, scenario }) => {
      localStorage.setItem('cronicas-nexo-howto-visto', '1')
      localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: {
        selectedDeckId: 'furia-caldera', scenario, muted: true,
        graphicsQuality: 'high', reducedMotion: false, animationSpeed: 1,
      }, version: 7 }))
      localStorage.setItem('cronicas-nexo-match', JSON.stringify({ state: {
        match: saved, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0,
      }, version: 2 }))
    }, { saved: match, scenario })
    const storeRequest = matchStoreUrl(page)
    await page.goto('/battle')
    const storeUrl = await storeRequest
    await expect(page.getByTestId('battle-board')).toBeVisible({ timeout: 25000 })
    await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 2000 }).catch(() => {})
    await page.waitForTimeout(1800)
    for (const faction of ['fury', 'arcane', 'nature', 'shadow', 'marea', 'forja'] satisfies FactionId[]) {
      const card = CARDS.find((candidate) => candidate.faction === faction && candidate.type === 'unit')!
      const piece: BoardPiece = { instanceId: 'probe', cardId: card.id, owner: 'ai', position: { x: 3, y: 3 },
        currentHealth: card.health ?? 1, attackModifier: 0, movedThisTurn: false,
        attackedThisTurn: false, enteredOnTurn: 0, statuses: [] }
      const event: AnimationEvent = { id: `destroy-${faction}`, type: 'destroy', targetId: 'probe',
        to: { x: 3, y: 3 }, cardId: card.id, faction, durationMs: 3000 }
      await page.clock.resume()
      await page.evaluate(async ({ piece, storeUrl }) => {
        const module = await import(storeUrl) as { useMatchStore: typeof MatchStoreHook }
        const match = module.useMatchStore.getState().match!
        module.useMatchStore.setState({ match: { ...match, board: [piece] }, currentEvent: undefined, pendingAnimations: [] })
      }, { piece, storeUrl })
      await expect(page.locator('[class*="cardName"]').filter({ hasText: card.name })).toBeVisible({ timeout: 15000 })
      await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 10000))
      await page.evaluate(async ({ event, storeUrl }) => {
        const module = await import(storeUrl) as { useMatchStore: typeof MatchStoreHook }
        module.useMatchStore.setState({ currentEvent: event })
      }, { event, storeUrl })
      await page.waitForTimeout(100)
      await page.clock.runFor(100)
      await page.clock.fastForward(250)
      await page.clock.runFor(17)
      await page.screenshot({ path: `e2e/__shots__/destruccion-inicio-${scenario}-${faction}-${width}x${height}.png` })
      await page.clock.fastForward(450)
      await page.clock.runFor(17)
      await page.screenshot({ path: `e2e/__shots__/destruccion-${scenario}-${faction}-${width}x${height}.png` })
      expect(errors, `render de ${faction}`).toEqual([])
    }
  })
}
