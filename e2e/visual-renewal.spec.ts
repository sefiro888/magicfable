import { expect, test } from '@playwright/test'
import { CARD_BY_ID, STARTER_DECKS, createMatch, type BoardPiece, type MatchState } from '../src/game'

const piece = (instanceId: string, cardId: string, x: number, y: number, extra: Partial<BoardPiece> = {}): BoardPiece => ({
  instanceId, cardId, owner: 'player', position: { x, y },
  currentHealth: CARD_BY_ID[cardId]!.health ?? CARD_BY_ID[cardId]!.resistance ?? 1,
  attackModifier: 0, movedThisTurn: false, attackedThisTurn: false, enteredOnTurn: 0, statuses: [], ...extra,
})

const scenarios = process.env.RUN_MATERIAL_SHOTS ? ['aether-citadel', 'caldera', 'fimbul'] as const : ['aether-citadel'] as const
for (const scenario of scenarios) {
for (const [width, height] of [[1920, 1080], [1366, 768]] as const) {
  test(`acabados y estados de las piezas en ${scenario} a ${width} × ${height}`, async ({ page }) => {
    test.setTimeout(90_000)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)
    const match: MatchState = {
      ...base, turn: 9, phase: 'main', terrain: [], animations: [],
      players: { ...base.players, player: { ...base.players.player, mulliganTaken: true, hand: [] } },
      board: [
        piece('normal', 'sabueso-brasa', 1, 5),
        piece('frozen', 'oso-forestal', 3, 5, { statuses: [{ kind: 'frozen', expiresOnTurn: 12 }] }),
        piece('infected', 'ariete-volcanico', 5, 5, { currentHealth: 2, statuses: [{ kind: 'infected', infectorId: 'ai' }] }),
        piece('shield', 'centinela-cristal', 2, 3, { owner: 'ai', statuses: [{ kind: 'shielded', amount: 3 }] }),
        piece('damaged', 'leviatan-de-las-simas', 4, 3, { owner: 'ai', currentHealth: 3 }),
        piece('structure', 'torre-horizonte', 6, 3, { owner: 'ai' }),
      ],
    }
    await page.setViewportSize({ width, height })
    await page.addInitScript(({ saved, scenario }) => {
      localStorage.setItem('cronicas-nexo-match', JSON.stringify({ state: {
        match: saved, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0,
      }, version: 2 }))
      localStorage.setItem('cronicas-nexo-howto-visto', '1')
      localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: {
        selectedDeckId: 'furia-caldera', scenario, muted: true,
        graphicsQuality: 'high', reducedMotion: true,
      }, version: 7 }))
    }, { saved: match, scenario })
    await page.goto('/battle')
    await expect(page.getByTestId('battle-board')).toBeVisible({ timeout: 25_000 })
    await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 2000 }).catch(() => {})
    await expect(page.locator('[title^="Infectada:"]')).toBeAttached({ timeout: 25_000 })
    await expect(page.locator('[title^="Congelada:"]')).toBeAttached({ timeout: 25_000 })
    // El shader se compila al primer fotograma que usa la superficie; esperar
    // al tablero HTML no detectaba errores de GLSL que aparecían después.
    await page.waitForTimeout(1800)
    if (process.env.RUN_SHOTS) {
      await page.screenshot({ path: `e2e/__shots__/renovacion-piezas-${scenario}-${width}x${height}.png` })
      const board = (await page.getByTestId('battle-board').boundingBox())!
      await page.mouse.move(board.x + board.width / 2, board.y + board.height * 0.65)
      await page.mouse.wheel(0, -750)
      await page.waitForTimeout(700)
      await page.screenshot({ path: `e2e/__shots__/renovacion-detalle-${scenario}-${width}x${height}.png` })
    }
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-selected] [data-mine]').filter({ hasText: 'Sabueso de Brasa' })).toBeVisible()
    if (process.env.RUN_SHOTS) {
      await page.waitForTimeout(400)
      await page.screenshot({ path: `e2e/__shots__/renovacion-seleccion-${scenario}-${width}x${height}.png` })
    }
    expect(errors).toEqual([])
  })
}
}
