import { expect, test } from '@playwright/test'
import { CARD_BY_ID, STARTER_DECKS, createMatch, type BoardPiece } from '../src/game'

test('los números de daño caducan aunque el director ya haya terminado el evento', async ({ page }) => {
  const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)
  const piece = (instanceId: string, cardId: string, y: number, owner: 'player' | 'ai'): BoardPiece => ({
    instanceId, cardId, position: { x: 3, y }, owner, currentHealth: CARD_BY_ID[cardId]!.health!,
    attackModifier: 0, movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [],
  })
  const match = { ...base, turn: 5, terrain: [], board: [piece('attacker', 'gigante-magma', 4, 'player'), piece('target', 'sabueso-brasa', 3, 'ai')],
    players: { ...base.players, player: { ...base.players.player, mulliganTaken: true, hand: [] } } }
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  await page.addInitScript((saved) => {
    localStorage.setItem('cronicas-nexo-howto-visto', '1')
    localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: {
      selectedDeckId: 'furia-caldera', muted: true, scenario: 'aether-citadel',
      graphicsQuality: 'medium', reducedMotion: false, animationSpeed: 0.5,
    }, version: 7 }))
    localStorage.setItem('cronicas-nexo-match', JSON.stringify({ state: {
      match: saved, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0,
    }, version: 2 }))
  }, match)
  await page.goto('/battle')
  await expect(page.getByTestId('battle-board')).toBeVisible({ timeout: 25000 })
  await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 2000 }).catch(() => {})
  // El número vive 1,2 s. Bajo rasterizado por software, Enter puede tardar
  // más en devolver el control: observar DESDE ANTES del golpe conserva la
  // prueba de aparición aunque la siguiente orden llegue tras su extinción.
  await page.evaluate(() => {
    const observer = new MutationObserver(() => {
      if (!document.querySelector('[data-color="damage"]')) return
      document.documentElement.dataset.damageSeen = 'true'
      observer.disconnect()
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Enter')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Enter')
  await expect(page.locator('html')).toHaveAttribute('data-damage-seen', 'true', { timeout: 12000 })
  await expect(page.locator('[data-color="damage"]')).toHaveCount(0, { timeout: 10000 })
  expect(errors).toEqual([])
})
