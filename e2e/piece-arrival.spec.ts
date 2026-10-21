import { expect, test } from '@playwright/test'
import { CARD_BY_ID, STARTER_DECKS, createMatch, type AnimationEvent, type BoardPiece } from '../src/game'
import type { useMatchStore as MatchStoreHook } from '../src/store/match'

for (const reducedMotion of [false, true]) {
  test(`la entrada respeta la cola y omite movimiento cuando se solicita: ${reducedMotion}`, async ({ page }) => {
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)
    const card = CARD_BY_ID['sabueso-brasa']!
    const piece: BoardPiece = {
      instanceId: 'arrival-probe', cardId: card.id, owner: 'player', position: { x: 3, y: 5 },
      currentHealth: card.health!, attackModifier: 0, movedThisTurn: false,
      attackedThisTurn: false, enteredOnTurn: 5, statuses: [],
    }
    const match = { ...base, turn: 5, terrain: [], board: [piece],
      players: { ...base.players, player: { ...base.players.player, mulliganTaken: true, hand: [] } } }
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.addInitScript(({ saved, reducedMotion }) => {
      localStorage.setItem('cronicas-nexo-howto-visto', '1')
      localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: {
        selectedDeckId: 'furia-caldera', scenario: 'aether-citadel', muted: true,
        graphicsQuality: 'medium', reducedMotion, animationSpeed: 1,
      }, version: 7 }))
      localStorage.setItem('cronicas-nexo-match', JSON.stringify({ state: {
        match: saved, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0,
      }, version: 2 }))
    }, { saved: match, reducedMotion })
    await page.goto('/battle')
    const label = page.locator('[class*="cardName"]').filter({ hasText: card.name })
    await expect(label).toBeVisible({ timeout: 25000 })
    const summon: AnimationEvent = { id: 'arrival', type: 'summon', actorId: 'player',
      targetId: piece.instanceId, to: piece.position, faction: card.faction, durationMs: 4000 }
    // Un evento previo mantiene la invocación en espera como en una jugada
    // resuelta con varios efectos; no se simulan reglas dentro del render.
    await page.evaluate(async (summon) => {
      const modulePath = '/src/store/match.ts'
      const module = await import(modulePath) as { useMatchStore: typeof MatchStoreHook }
      module.useMatchStore.setState({ currentEvent: { id: 'hold', type: 'reveal', durationMs: 12000 }, pendingAnimations: [summon] })
    }, summon)
    if (reducedMotion) await expect(label).toBeVisible()
    else await expect(label).toBeHidden()
    await page.evaluate(async (summon) => {
      const modulePath = '/src/store/match.ts'
      const module = await import(modulePath) as { useMatchStore: typeof MatchStoreHook }
      module.useMatchStore.setState({ currentEvent: summon, pendingAnimations: [] })
    }, summon)
    await expect(label).toBeVisible({ timeout: 8000 })
    // Saltar la reproducción debe restaurar también la transformación física.
    await page.evaluate(async () => {
      const modulePath = '/src/store/match.ts'
      const module = await import(modulePath) as { useMatchStore: typeof MatchStoreHook }
      module.useMatchStore.getState().skipAnimations()
    })
    await expect(label).toBeVisible()
  })
}
