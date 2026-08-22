import { expect, test } from '@playwright/test'
import { STARTER_DECKS, createMatch } from '../src/game'
import type { MatchState } from '../src/game'

/**
 * Fotografía el terreno del tablero: ruinas (escombros que bloquean) y
 * cobertura (parapetos que restan daño a distancia).
 *
 *   RUN_SHOTS=1 npx playwright test e2e/terrain-shots.spec.ts
 *
 * Fuera del gate: es una comprobación visual, no una aserción.
 */
test.skip(!process.env.RUN_SHOTS, 'solo bajo demanda con RUN_SHOTS=1')

/** Terreno fijado a mano para que la captura no dependa del sorteo. */
const campo = (): MatchState => {
  const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 1311657807)
  return {
    ...base,
    turn: 4,
    phase: 'main',
    activePlayer: 'player',
    terrain: [
      { kind: 'rubble', position: { x: 1, y: 3 } },
      { kind: 'rubble', position: { x: 6, y: 4 } },
      { kind: 'cover', position: { x: 2, y: 2 } },
      { kind: 'cover', position: { x: 5, y: 5 } },
    ],
  }
}

test('capturas del terreno', async ({ page }) => {
  test.setTimeout(120_000)
  await page.addInitScript(([match, version]) => {
    localStorage.setItem('cronicas-nexo-match', JSON.stringify({
      state: { match, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0 },
      version,
    }))
    localStorage.setItem('cronicas-nexo-howto-visto', '1')
    localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({
      state: { muted: true, scenario: 'aether-citadel', graphicsQuality: 'high', confirmEndTurn: false },
      version: 6,
    }))
  }, [campo(), 2] as const)

  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/battle')
  const board = page.getByTestId('battle-board')
  await expect(board).toBeVisible({ timeout: 25_000 })
  // La partida sembrada arranca en el mulligan: lo despacho para ver el tablero.
  const mulligan = page.getByRole('button', { name: /conservar las cinco/i })
  await mulligan.click({ timeout: 20_000 })
  await expect(mulligan).toBeHidden()
  await page.waitForTimeout(3000)
  await page.screenshot({ path: 'e2e/__shots__/terreno-lejos.png' })

  const caja = (await board.boundingBox())!
  await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height * 0.45)
  for (let i = 0; i < 5; i += 1) { await page.mouse.wheel(0, -240); await page.waitForTimeout(120) }
  await page.waitForTimeout(1200)
  await page.screenshot({ path: 'e2e/__shots__/terreno-cerca.png' })
})
