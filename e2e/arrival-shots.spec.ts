import { expect, test } from '@playwright/test'
import { CARDS, STARTER_DECKS, createMatch, type AnimationEvent, type BoardPiece } from '../src/game'
import type { useMatchStore as MatchStoreHook } from '../src/store/match'

test.skip(!process.env.RUN_ARRIVAL_SHOTS, 'capturas de entrada bajo demanda')

for (const [width, height] of [[1920, 1080], [1366, 768]] as const) {
  test(`revisión de las cuatro familias de entrada y las estructuras a ${width} × ${height}`, async ({ page }) => {
    test.setTimeout(180_000)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)
    const match = { ...base, turn: 5, terrain: [], board: [],
      players: { ...base.players, player: { ...base.players.player, mulliganTaken: true, hand: [] } } }
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
    await page.goto('/battle')
    await expect(page.getByTestId('battle-board')).toBeVisible({ timeout: 25000 })
    await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 2000 }).catch(() => {})
    await page.waitForTimeout(1800)
    const board = (await page.getByTestId('battle-board').boundingBox())!
    await page.mouse.move(board.x + board.width / 2, board.y + board.height * 0.65)
    await page.mouse.wheel(0, -750)
    for (const faction of ['fury', 'nature', 'void', 'marea', 'forja'] as const) {
      const card = CARDS.find((candidate) => candidate.faction === faction && candidate.type === (faction === 'forja' ? 'structure' : 'unit'))!
      const piece: BoardPiece = {
        instanceId: 'arrival-probe', cardId: card.id, owner: 'player', position: { x: 3, y: 4 },
        currentHealth: card.health ?? card.resistance ?? 1, attackModifier: 0,
        movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 5, statuses: [],
      }
      const event: AnimationEvent = { id: `arrival-${faction}`, type: 'summon', actorId: 'player',
        targetId: piece.instanceId, to: piece.position, faction, durationMs: 12000 }
      await page.evaluate(async ({ piece, event }) => {
        const modulePath = '/src/store/match.ts'
        const module = await import(modulePath) as { useMatchStore: typeof MatchStoreHook }
        const current = module.useMatchStore.getState().match!
        module.useMatchStore.setState({ match: { ...current, board: [piece] }, currentEvent: event, pendingAnimations: [] })
      }, { piece, event })
      await page.waitForTimeout(3500)
      await page.screenshot({ path: `e2e/__shots__/entrada-${faction}-${width}x${height}.png` })
      expect(errors).toEqual([])
    }
  })
}
