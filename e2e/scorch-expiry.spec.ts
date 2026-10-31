import { expect, test } from '@playwright/test'
import type { RootState } from '@react-three/fiber'
import { CARD_BY_ID, STARTER_DECKS, createMatch, type AnimationEvent, type BoardPiece } from '../src/game'
import type { useMatchStore as MatchStoreHook } from '../src/store/match'
import { fiberModuleUrl } from './helpers/cameraSnapshot'
import { matchStoreUrl } from './helpers/matchStoreUrl'

test('el hollín desaparece con movimiento reducido sin necesitar otro gesto', async ({ page }) => {
  test.setTimeout(90000)
  const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)
  const piece: BoardPiece = {
    instanceId: 'scorch-target', cardId: 'leviatan-de-las-simas', owner: 'player', position: { x: 4, y: 5 },
    currentHealth: CARD_BY_ID['leviatan-de-las-simas']!.health! - 1, attackModifier: 0,
    movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [],
  }
  const match = { ...base, turn: 5, terrain: [], board: [piece],
    players: { ...base.players, player: { ...base.players.player, mulliganTaken: true, hand: [] } } }
  await page.clock.install()
  await page.addInitScript((saved) => {
    localStorage.setItem('cronicas-nexo-howto-visto', '1')
    localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: {
      selectedDeckId: 'furia-caldera', scenario: 'aether-citadel', muted: true,
      graphicsQuality: 'high', reducedMotion: true, animationSpeed: 1,
    }, version: 7 }))
    localStorage.setItem('cronicas-nexo-match', JSON.stringify({ state: {
      match: saved, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0,
    }, version: 2 }))
  }, match)
  const storeRequest = matchStoreUrl(page)
  const fiberRequest = fiberModuleUrl(page)
  await page.goto('/battle')
  const [storeUrl, fiberUrl] = await Promise.all([storeRequest, fiberRequest])
  await expect(page.getByTestId('battle-board')).toBeVisible({ timeout: 25000 })
  await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 2000 }).catch(() => {})
  await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 10000))
  const event: AnimationEvent = { id: 'fire-demand', type: 'damage', targetId: 'scorch-target',
    to: { x: 4, y: 5 }, amount: 1, cardId: 'dragon-caldera', effectId: 'dragon-flame', durationMs: 12000 }
  await page.evaluate(async ({ url, impact }) => {
    const module = await import(url) as { useMatchStore: typeof MatchStoreHook }
    module.useMatchStore.setState({ currentEvent: impact, pendingAnimations: [] })
  }, { url: storeUrl, impact: event })
  const char = () => page.evaluate(async (url) => {
    const module = await import(url) as { _roots: ReadonlyMap<HTMLCanvasElement, { store: { getState: () => RootState } }> }
    const canvas = document.querySelector('[data-testid="battle-board"] canvas') as HTMLCanvasElement
    const state = module._roots.get(canvas)?.store.getState()
    if (!state) throw new Error('No se encontró el campo de batalla')
    let max = 0
    state.scene.traverse((object) => {
      const mesh = object as typeof object & { material?: { uniforms?: { uChar?: { value: number } } } }
      max = Math.max(max, mesh.material?.uniforms?.uChar?.value ?? 0)
    })
    return { char: max, frameloop: state.frameloop }
  }, fiberUrl)
  await page.clock.runFor(100)
  expect((await char()).frameloop).toBe('demand')
  expect((await char()).char).toBeGreaterThan(0.9)
  await page.clock.fastForward(8500)
  await page.clock.runFor(50)
  expect((await char()).char).toBe(0)
})
