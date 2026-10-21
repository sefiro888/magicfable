import { expect, test } from '@playwright/test'
import { CARD_BY_ID, STARTER_DECKS, createMatch, type MatchState } from '../src/game'

for (const [width, height] of [[1920, 1080], [1366, 768]] as const) {
  for (const [cardId, name, destination] of [
    ['resaca-subita', 'Resaca Súbita', 1],
    ['canto-de-la-sirena', 'Canto de la Sirena', 5],
  ] as const) {
    test(`${name} pide objetivo y desplaza la unidad a ${width} × ${height}`, async ({ page }) => {
      const deck = STARTER_DECKS.find((candidate) => candidate.faction === 'marea')!
      const base = createMatch(deck, STARTER_DECKS[0]!, 42)
      const match: MatchState = {
        ...base, turn: 5, phase: 'main', terrain: [], animations: [],
        board: [{
          instanceId: 'enemy', cardId: 'oso-forestal', owner: 'ai', position: { x: 3, y: 3 },
          currentHealth: CARD_BY_ID['oso-forestal']!.health!, attackModifier: 0,
          movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [],
        }],
        players: {
          ...base.players,
          player: {
            ...base.players.player, mulliganTaken: true,
            hand: [{ instanceId: 'spell', cardId }],
            resources: Array.from({ length: 3 }, (_, index) => ({
              instanceId: `r${index}`, cardId: 'fuente-marea', faction: 'marea' as const, exhausted: false,
            })),
          },
        },
      }
      await page.setViewportSize({ width, height })
      await page.addInitScript(({ saved, deckId }) => {
        localStorage.setItem('cronicas-nexo-match', JSON.stringify({
          state: { match: saved, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0 }, version: 2,
        }))
        localStorage.setItem('cronicas-nexo-howto-visto', '1')
        localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({
          state: { selectedDeckId: deckId, muted: true, graphicsQuality: 'low', reducedMotion: true, scenario: 'shore' }, version: 7,
        }))
      }, { saved: match, deckId: deck.id })
      await page.goto('/battle')
      await expect(page.getByTestId('battle-board')).toBeVisible({ timeout: 25_000 })
      await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 2000 }).catch(() => {})
      await page.getByRole('button', { name: new RegExp(name) }).first().click()
      await expect(page.getByText('Selecciona un objetivo resaltado en dorado.')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Resolver carta' })).toHaveCount(0)
      if (process.env.RUN_SHOTS) await page.screenshot({ path: `e2e/__shots__/${cardId}-${width}x${height}.png` })

      // El teclado usa el mismo manejador de objetivo que el clic 3D y evita
      // depender de píxeles distintos para cada resolución y cámara.
      for (let step = 0; step < 5; step += 1) await page.keyboard.press('ArrowUp')
      await expect(page.locator('[role="status"][aria-live="polite"]')).toContainText('D4')
      await page.keyboard.press('Enter')
      await expect.poll(() => page.evaluate(() => {
        const saved = JSON.parse(localStorage.getItem('cronicas-nexo-match')!) as { state: { match: MatchState } }
        return saved.state.match.board.find((unit) => unit.instanceId === 'enemy')?.position.y
      })).toBe(destination)
      await expect(page.locator('[class*="fanCard"]')).toHaveCount(0)
    })
  }
}
