import { expect, test } from '@playwright/test'
import { CARD_BY_ID, STARTER_DECKS, createMatch } from '../src/game'
import type { BoardPiece, MatchState, PlayerId, Position } from '../src/game'

/**
 * Fotografía un combate REAL fotograma a fotograma: la embestida del atacante,
 * el impacto, la muerte de la defensora y el golpe al Nexo.
 *
 *   RUN_SHOTS=1 npx playwright test e2e/combat-shots.spec.ts
 *
 * Fuera del gate. La partida se SIEMBRA en localStorage con las dos unidades
 * ya enfrentadas: esperar a que una partida normal llegue sola a un combate
 * concreto es lento y poco fiable.
 */
test.skip(!process.env.RUN_SHOTS, 'solo bajo demanda con RUN_SHOTS=1')

const pieza = (instanceId: string, cardId: string, owner: PlayerId, position: Position): BoardPiece => {
  const card = CARD_BY_ID[cardId]!
  return {
    instanceId, cardId, owner, position,
    currentHealth: card.health ?? card.resistance ?? 1,
    attackModifier: 0, movedThisTurn: false, attackedThisTurn: false,
    enteredOnTurn: 0, statuses: [],
  }
}

/** Partida preparada: mi unidad pegada a una rival débil, y otra a un paso del Nexo. */
const duelo = (): MatchState => {
  const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 1311657807)
  return {
    ...base,
    turn: 6,
    phase: 'main',
    activePlayer: 'player',
    board: [
      pieza('mio', 'ariete-volcanico', 'player', { x: 3, y: 4 }),
      pieza('presa', 'centinela-cristal', 'ai', { x: 3, y: 3 }),
      pieza('rematador', 'sabueso-brasa', 'player', { x: 3, y: 0 }),
    ],
  }
}

test('capturas del combate', async ({ page }) => {
  test.setTimeout(180_000)
  const estado = duelo()
  await page.addInitScript(([match, version]) => {
    localStorage.setItem('cronicas-nexo-match', JSON.stringify({
      state: { match, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0 },
      version,
    }))
    localStorage.setItem('cronicas-nexo-howto-visto', '1')
    localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({
      state: { muted: true, scenario: 'sanctuary', graphicsQuality: 'high', confirmEndTurn: false },
      version: 6,
    }))
  }, [estado, 2] as const)

  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/battle')
  const board = page.getByTestId('battle-board')
  await expect(board).toBeVisible({ timeout: 25_000 })
  await page.waitForTimeout(2500)
  // Acercar la cámara: de lejos la caída de una ficha no se aprecia.
  const caja = (await board.boundingBox())!
  await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height * 0.45)
  for (let i = 0; i < 5; i += 1) { await page.mouse.wheel(0, -240); await page.waitForTimeout(120) }
  await page.waitForTimeout(900)

  // Ataque cuerpo a cuerpo: selecciono mi unidad con el teclado y ataco.
  const cursor = page.locator('[role="status"][aria-live="polite"]')
  await page.keyboard.press('ArrowUp')
  await expect(cursor).toContainText('D5')
  await page.keyboard.press('Enter')   // selecciona mi Ariete
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'e2e/__shots__/combate-0-antes.png' })
  await page.keyboard.press('ArrowUp') // cursor a la casilla de la rival
  await page.keyboard.press('Enter')   // ¡ataque!
  // Ráfaga corta: la embestida dura unos 300 ms.
  for (let i = 1; i <= 6; i += 1) {
    await page.waitForTimeout(110)
    await page.screenshot({ path: `e2e/__shots__/combate-${i}.png` })
  }
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'e2e/__shots__/combate-7-despues.png' })

  // Y el golpe al Nexo rival con la otra unidad, que espera pegada a él.
  await page.keyboard.press('Escape')
  await page.keyboard.press('ArrowUp')          // enciende el cursor en la fila propia
  for (let i = 0; i < 8; i += 1) await page.keyboard.press('ArrowUp')
  await page.waitForTimeout(300)
  await page.screenshot({ path: 'e2e/__shots__/nexo-0-antes.png' })
  await page.keyboard.press('Enter')  // selecciona el Sabueso
  await page.waitForTimeout(300)
  await page.keyboard.press('n')      // ataca al Nexo
  for (let i = 1; i <= 5; i += 1) {
    await page.waitForTimeout(130)
    await page.screenshot({ path: `e2e/__shots__/nexo-${i}.png` })
  }
})
