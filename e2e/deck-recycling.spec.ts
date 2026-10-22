import { expect, test } from '@playwright/test'
import { STARTER_DECKS, createMatch, type MatchState } from '../src/game'
import { matchStoreUrl } from './helpers/matchStoreUrl'

for (const [width, height] of [[1920, 1080], [1366, 768]] as const) {
  test(`un robo real recicla el cementerio y persiste sin duplicar piezas a ${width} × ${height}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)
    const match: MatchState = { ...base, turn: 9, terrain: [],
      board: [{ instanceId: 'alive', cardId: 'sabueso-brasa', owner: 'player', position: { x: 3, y: 6 },
        currentHealth: 1, attackModifier: 0, movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 1, statuses: [] }],
      players: { ...base.players, player: { ...base.players.player, nexusHealth: 20, mulliganTaken: true,
        hand: [{ instanceId: 'heal', cardId: 'savia-restauradora' }], deck: [],
        discard: Array.from({ length: 3 }, (_, index) => ({ instanceId: `used-${index}`, cardId: 'fuente-naturaleza' })),
        resources: Array.from({ length: 3 }, (_, index) => ({ instanceId: `source-${index}`, cardId: 'fuente-naturaleza', faction: 'nature' as const, exhausted: false })),
      } },
    }
    await page.setViewportSize({ width, height })
    await page.addInitScript((saved) => {
      localStorage.setItem('cronicas-nexo-howto-visto', '1')
      localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: {
        scenario: 'sanctuary', graphicsQuality: 'high', muted: true, reducedMotion: true,
      }, version: 7 }))
      if (!localStorage.getItem('cronicas-nexo-match')) localStorage.setItem('cronicas-nexo-match', JSON.stringify({ state: {
        match: saved, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0,
      }, version: 2 }))
    }, match)
    const storeRequest = matchStoreUrl(page)
    await page.goto('/battle')
    const storeUrl = await storeRequest
    await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 2000 }).catch(() => {})
    await page.getByRole('button', { name: /Savia Restauradora/ }).first().click()
    await page.getByRole('button', { name: 'Resolver carta' }).click()
    const readMatch = (url: string) => page.evaluate(async (url) => {
      const module = await import(url) as { useMatchStore: { getState: () => { match: MatchState } } }
      return module.useMatchStore.getState().match
    }, url)
    await expect.poll(async () => (await readMatch(storeUrl)).players.player.hand.length).toBe(1)
    const after = await readMatch(storeUrl)
    expect(after.players.player.nexusHealth).toBe(25)
    expect(after.players.player.deck).toHaveLength(3)
    expect(after.players.player.discard).toEqual([])
    expect([...after.players.player.hand, ...after.players.player.deck].map((card) => card.instanceId).sort()).toEqual(['heal', 'used-0', 'used-1', 'used-2'])
    expect(after.board).toEqual(match.board)
    expect(after.players.player.resources.map((card) => card.instanceId)).toEqual(match.players.player.resources.map((card) => card.instanceId))
    const reloadedStore = matchStoreUrl(page)
    await page.reload()
    const restored = await readMatch(await reloadedStore)
    expect(restored.players.player).toEqual(after.players.player)
    expect(restored.board).toEqual(after.board)
    expect(errors).toEqual([])
  })
}
