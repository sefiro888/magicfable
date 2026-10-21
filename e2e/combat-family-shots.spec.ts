import { expect, test } from '@playwright/test'
import { CARDS, STARTER_DECKS, createMatch, type AnimationEvent, type BoardPiece } from '../src/game'
import type { useMatchStore as MatchStoreHook } from '../src/store/match'
import { matchStoreUrl } from './helpers/matchStoreUrl'

test.skip(!process.env.RUN_COMBAT_FAMILIES, 'revisión de familias de combate bajo demanda')

for (const [width, height] of [[1920, 1080], [1366, 768]] as const) {
  test(`revisión de familias de proyectil a ${width} × ${height}`, async ({ page }) => {
    test.setTimeout(240_000)
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
    const board = (await page.getByTestId('battle-board').boundingBox())!
    await page.mouse.move(board.x + board.width / 2, board.y + board.height * 0.65)
    await page.mouse.wheel(0, -750)
    for (const faction of ['fury', 'arcane', 'nature', 'order', 'shadow', 'duna', 'marea', 'forja'] as const) {
      if (process.env.COMBAT_FACTIONS && !process.env.COMBAT_FACTIONS.split(',').includes(faction)) continue
      const card = CARDS.find((candidate) => candidate.faction === faction && candidate.type === 'unit' && (candidate.range ?? 1) > 1)!
      expect(card, `unidad a distancia de ${faction}`).toBeDefined()
      const piece: BoardPiece = {
        instanceId: 'attacker', cardId: card.id, owner: 'player', position: { x: 3, y: 5 },
        currentHealth: card.health ?? 1, attackModifier: 0, movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [],
      }
      const targetCard = faction === 'forja' ? CARDS.find((candidate) => candidate.faction === 'forja' && candidate.type === 'unit' && candidate.subtype === 'Autómata')!
        : CARDS.find((candidate) => candidate.id === (faction === 'nature' ? 'oso-forestal' : faction === 'order' ? 'torre-horizonte' : 'centinela-cristal'))!
      const target: BoardPiece = { ...piece, instanceId: 'target', cardId: targetCard.id, currentHealth: targetCard.health ?? targetCard.resistance ?? 1, owner: 'ai', position: { x: 3, y: 3 } }
      const event: AnimationEvent = { id: `attack-${faction}`, type: 'attack', actorId: piece.instanceId,
        targetId: target.instanceId, from: piece.position, to: target.position,
        cardId: card.id, faction, durationMs: 3000 }
      await page.clock.resume()
      await page.evaluate(async ({ piece, target, storeUrl }) => {
        const module = await import(storeUrl) as { useMatchStore: typeof MatchStoreHook }
        const current = module.useMatchStore.getState().match!
        module.useMatchStore.setState({ match: { ...current, board: [piece, target] }, currentEvent: undefined, pendingAnimations: [] })
      }, { piece, target, storeUrl })
      await expect(page.locator('[class*="cardName"]').filter({ hasText: card.name })).toBeVisible({ timeout: 15000 })
      await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 10000))
      await page.evaluate(async ({ event, storeUrl }) => {
        const module = await import(storeUrl) as { useMatchStore: typeof MatchStoreHook }
        module.useMatchStore.setState({ currentEvent: event, pendingAnimations: [] })
      }, { event, storeUrl })
      await page.waitForTimeout(100)
      await page.clock.runFor(100)
      // Congelar el fotograma evita que el readback de WebGL por software
      // fotografíe el final del efecto aunque se pidiera a mitad del vuelo.
      await page.clock.fastForward(1100)
      await page.clock.runFor(17)
      await page.screenshot({ path: `e2e/__shots__/ataque-${faction}-${width}x${height}.png` })
      if (process.env.COMBAT_HITS && ['arcane', 'nature', 'order', 'forja'].includes(faction)) {
        const hit: AnimationEvent = { ...event, id: `hit-${faction}`, type: 'damage', targetCardId: targetCard.id, amount: 3 }
        await page.evaluate(async ({ hit, storeUrl }) => {
          const module = await import(storeUrl) as { useMatchStore: typeof MatchStoreHook }
          module.useMatchStore.setState({ currentEvent: hit, pendingAnimations: [] })
        }, { hit, storeUrl })
        await page.waitForTimeout(100)
        await page.clock.runFor(100)
        await page.clock.fastForward(500)
        await page.clock.runFor(17)
        await page.screenshot({ path: `e2e/__shots__/impacto-${faction}-${width}x${height}.png` })
      }
      expect(errors, `render de ${faction}`).toEqual([])
    }
  })
}
