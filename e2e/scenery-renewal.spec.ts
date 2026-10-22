import { expect, test } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { Matrix4, Vector3 } from 'three'
import { CARD_BY_ID, STARTER_DECKS, createMatch, type BoardPiece, type MatchState } from '../src/game'
import { cameraSnapshot, fiberModuleUrl } from './helpers/cameraSnapshot'

test.skip(!process.env.RUN_SCENERY_SHOTS, 'revisión de escenarios bajo demanda')

for (const [width, height] of [[1920, 1080], [1366, 768]] as const) {
  for (const quality of ['high', 'low'] as const) {
    test(`arquitectura de Ciudadela a ${width} × ${height}, calidad ${quality}`, async ({ page }) => {
      test.setTimeout(120000)
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
      const base = createMatch(STARTER_DECKS[0]!, STARTER_DECKS[1]!, 42)
      const piece = (id: string, cardId: string, x: number, y: number, rival = false): BoardPiece => ({
        instanceId: id, cardId, owner: rival ? 'ai' : 'player', position: { x, y },
        currentHealth: CARD_BY_ID[cardId]!.health ?? 1, attackModifier: 0, movedThisTurn: false,
        attackedThisTurn: false, enteredOnTurn: 0, statuses: [],
      })
      const match: MatchState = { ...base, turn: 9, phase: 'main', animations: [], terrain: [],
        players: { ...base.players, player: { ...base.players.player, mulliganTaken: true } },
        board: [piece('own-west', 'sabueso-brasa', 1, 5), piece('own-east', 'oso-forestal', 6, 5),
          piece('rival-west', 'centinela-cristal', 1, 2, true), piece('rival-east', 'leviatan-de-las-simas', 6, 2, true)],
      }
      await page.setViewportSize({ width, height })
      await page.addInitScript(({ saved, quality }) => {
        localStorage.setItem('cronicas-nexo-howto-visto', '1')
        localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: {
          scenario: 'aether-citadel', graphicsQuality: quality, muted: true, reducedMotion: quality === 'low',
        }, version: 7 }))
        localStorage.setItem('cronicas-nexo-match', JSON.stringify({ state: {
          match: saved, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0,
        }, version: 2 }))
      }, { saved: match, quality })
      const fiber = fiberModuleUrl(page)
      await page.goto('/battle')
      const url = await fiber
      await expect(page.getByTestId('battle-board')).toBeVisible({ timeout: 25000 })
      await expect(page.locator('[data-mine]').filter({ hasText: 'Sabueso de Brasa' })).toBeVisible({ timeout: 25000 })
      await page.waitForTimeout(2000)
      const camera = await cameraSnapshot(page, url)
      const viewProjection = new Matrix4().fromArray(camera.projection)
        .multiply(new Matrix4().fromArray(camera.matrixWorld).invert())
      // Se verifica el remate del edificio y ambos pórticos contra la cámara
      // real, además de mirar las imágenes: no volver a aceptar un hito invisible.
      for (const point of [[0, 2.01, -7.35], [-5.22, 2.61, -2.65], [5.22, 2.61, -2.65]]) {
        const projected = new Vector3(...point).applyMatrix4(viewProjection)
        const x = camera.canvas.x + (projected.x + 1) / 2 * camera.canvas.width
        const y = camera.canvas.y + (1 - projected.y) / 2 * camera.canvas.height
        expect(x).toBeGreaterThan(camera.safe.x)
        expect(x).toBeLessThan(camera.safe.x + camera.safe.width)
        expect(y).toBeGreaterThanOrEqual(camera.safe.y)
        expect(y).toBeLessThan(camera.safe.y + camera.safe.height)
      }
      writeFileSync(`tools/captures/ciudadela-camera-${width}x${height}-${quality}.json`, JSON.stringify(camera, null, 2))
      await page.screenshot({ path: `e2e/__shots__/ciudadela-${width}x${height}-${quality}.png` })
      await page.keyboard.press('h')
      await page.waitForTimeout(700)
      await page.screenshot({ path: `e2e/__shots__/ciudadela-${width}x${height}-${quality}-mano-oculta.png` })
      expect(errors).toEqual([])
    })
  }
}
