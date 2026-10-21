import { expect, test } from '@playwright/test'
import { FACTION_IDS, STARTER_DECKS, createMatch, type AnimationEvent } from '../src/game'
import type { useMatchStore as MatchStoreHook } from '../src/store/match'
import { matchStoreUrl } from './helpers/matchStoreUrl'

test.skip(!process.env.RUN_RITUAL_SHOTS, 'revisión de invocaciones bajo demanda')

test('revisión de los sellos de las dieciséis facciones', async ({ page }) => {
  test.setTimeout(300_000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)
  const match = {
    ...base, turn: 5, terrain: [], board: [],
    players: { ...base.players, player: { ...base.players.player, mulliganTaken: true, hand: [] } },
  }
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.addInitScript((saved) => {
    localStorage.setItem('cronicas-nexo-howto-visto', '1')
    localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: {
      selectedDeckId: 'furia-caldera', muted: true, graphicsQuality: 'high',
      scenario: 'caldera', reducedMotion: false, animationSpeed: 1,
    }, version: 7 }))
    localStorage.setItem('cronicas-nexo-match', JSON.stringify({ state: {
      match: saved, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0,
    }, version: 2 }))
  }, match)
  const storeRequest = matchStoreUrl(page)
  await page.goto('/battle')
  const storeUrl = await storeRequest
  await expect(page.getByTestId('battle-board')).toBeVisible({ timeout: 25_000 })
  await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 2000 }).catch(() => {})
  await page.waitForTimeout(2500)
  for (const faction of FACTION_IDS) {
    const event: AnimationEvent = {
      id: `ritual-${faction}`, type: 'summon', actorId: 'player', targetId: 'probe',
      to: { x: 3, y: 4 }, faction, durationMs: 12000,
    }
    // La sonda usa el mismo store y director que la batalla. Alargar solo
    // este evento permite inspeccionar el trazado sin alterar el juego.
    await page.evaluate(async ({ visualEvent, storeUrl }) => {
      const module = await import(storeUrl) as { useMatchStore: typeof MatchStoreHook }
      module.useMatchStore.setState({ currentEvent: visualEvent, pendingAnimations: [] })
    }, { visualEvent: event, storeUrl })
    // La captura por software puede consumir varios segundos: con 5 s de
    // duración acababa fotografiando el fotograma posterior al efecto.
    await page.waitForTimeout(3000)
    await page.screenshot({ path: `e2e/__shots__/ritual-${faction}.png` })
    expect(errors, `render de ${faction}`).toEqual([])
  }
})
