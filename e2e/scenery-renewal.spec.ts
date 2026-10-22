import { expect, test } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { Matrix4, Vector3 } from 'three'
import { CARD_BY_ID, STARTER_DECKS, createMatch, type BoardPiece, type MatchState } from '../src/game'
import { cameraSnapshot, fiberModuleUrl, poseCamera } from './helpers/cameraSnapshot'
import { reflectionProbe, waterConfiguration } from './helpers/reflectionProbe'
import type { GraphicsQuality } from '../src/store/preferences'
import { glacierBankPoint } from '../src/battle/scenarios/architecture/glacierBankGeometry'
import { groveProbe } from './helpers/groveProbe'
import { foundryProbe } from './helpers/foundryProbe'

test.skip(!process.env.RUN_SCENERY_SHOTS, 'revisión de escenarios bajo demanda')
const scenarios = ['aether-citadel', 'sanctuary', 'caldera', 'duna', 'fimbul', 'grove', 'shore', 'foundry', 'jade-court', 'wheel-ghat'] as const
const scenario = scenarios.find((id) => id === process.env.SCENERY) ?? 'aether-citadel'
const names = { 'aether-citadel': 'ciudadela', sanctuary: 'santuario', caldera: 'caldera', duna: 'duna',
  fimbul: 'fiordo', grove: 'claro', shore: 'rompiente', foundry: 'gremio', 'jade-court': 'jade', 'wheel-ghat': 'escalinata' } as const
const prefix = names[scenario] + (process.env.SCENERY_REDUCED ? '-quieto' : '')
const qualities: readonly GraphicsQuality[] = process.env.SCENERY_QUALITY === 'medium' ? ['medium']
  : process.env.SCENERY_QUALITY === 'high' ? ['high'] : process.env.SCENERY_QUALITY === 'low' ? ['low'] : ['high', 'low']
const landmarks: Partial<Record<typeof scenario, readonly (readonly [number, number, number])[]>> = {
  'jade-court': [[0, 2.32, -6.3], [-6.25, 2.3, -3.9], [6.15, 1, -3.5]],
  foundry: [[0, 2.05, -6], [-6.2, 1.55, -3.4]],
  shore: [[5.9, 2.48, -5.6], [-7.1, 2, -5.5]],
  grove: [[0, 1.65, -7.6], [-5.3, 0.15, -2.6], [5.3, 0.15, -2.6]],
  fimbul: [[-3.57, 1.61, -8.2], glacierBankPoint(-1, 0.46, 0.12), glacierBankPoint(1, 0.46, 0.12)],
  duna: [[-2.15, 1.59, -8.15], [-6.08, 2.05, -3.3], [6.08, 2.05, -3.3]],
  sanctuary: [[0, 1.47, -7.5], [-5.5, 1.8, -3.8], [5.55, 2.05, -3.5]],
  caldera: [[-5.4, 0.8, -5.3], [-6.5, 0.8, -2.8], [6.5, 0.8, -2.8]],
  'aether-citadel': [[0, 2.01, -7.35], [-5.22, 2.61, -2.65], [5.22, 2.61, -2.65]],
}

for (const [width, height] of [[1920, 1080], [1366, 768]] as const) {
  for (const quality of qualities) {
    test(`${prefix} a ${width} × ${height}, calidad ${quality}`, async ({ page }) => {
      test.setTimeout(120000)
      const reduced = quality === 'low' || process.env.SCENERY_REDUCED === '1'
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
      await page.addInitScript(({ saved, quality, scenario, reduced }) => {
        localStorage.setItem('cronicas-nexo-howto-visto', '1')
        localStorage.setItem('cronicas-nexo-preferences', JSON.stringify({ state: {
          scenario, graphicsQuality: quality, muted: true, reducedMotion: reduced,
        }, version: 7 }))
        localStorage.setItem('cronicas-nexo-match', JSON.stringify({ state: {
          match: saved, history: [], matchLog: [], healthHistory: [], startedAtMs: Date.now(), elapsedSeconds: 0,
        }, version: 2 }))
      }, { saved: match, quality, scenario, reduced })
      const fiber = fiberModuleUrl(page)
      await page.goto('/battle')
      const url = await fiber
      await expect(page.getByTestId('battle-board')).toBeVisible({ timeout: 25000 })
      await expect(page.locator('[data-mine]').filter({ hasText: 'Sabueso de Brasa' })).toBeVisible({ timeout: 25000 })
      await page.waitForTimeout(2000)
      const camera = await cameraSnapshot(page, url)
      expect(camera.background).not.toBeNull()
      expect(camera.fog).not.toBeNull()
      if (scenario === 'foundry') {
        const before = await foundryProbe(page, url)
        await page.waitForTimeout(350)
        const after = await foundryProbe(page, url)
        if (reduced) expect(after).toEqual(before)
        else {
          expect(after.drive).toBeGreaterThan(before.drive)
          expect(after.driven - before.driven).toBeCloseTo(-2 * (after.drive - before.drive), 5)
          expect(after.flow).toBeGreaterThan(before.flow)
        }
      }
      if (scenario === 'grove') {
        const before = await groveProbe(page, url)
        await page.waitForTimeout(350)
        const after = await groveProbe(page, url)
        expect(before.count).toBeGreaterThan(0)
        expect(before.filteredLight).toBe(quality === 'low' ? 0 : 512)
        if (reduced) expect(after.matrix).toEqual(before.matrix)
        else expect(after.matrix).not.toEqual(before.matrix)
      }
      if (scenario === 'sanctuary' || scenario === 'fimbul' || scenario === 'shore') {
        const water = await waterConfiguration(page, url)
        expect(water.enabled).toBe(quality === 'low' ? 0 : 1)
        expect(water.size).toBe(quality === 'high' ? 512 : quality === 'medium' ? 256 : 0)
        expect(water.captures).toBe(quality === 'low' ? 0 : 1)
        if (reduced || scenario === 'fimbul') expect(water.time).toBe(0)
      }
      const viewProjection = new Matrix4().fromArray(camera.projection)
        .multiply(new Matrix4().fromArray(camera.matrixWorld).invert())
      // Se verifica el remate del edificio y ambos pórticos contra la cámara
      // real, además de mirar las imágenes: no volver a aceptar un hito invisible.
      for (const point of landmarks[scenario] ?? []) {
        const projected = new Vector3(...point).applyMatrix4(viewProjection)
        const x = camera.canvas.x + (projected.x + 1) / 2 * camera.canvas.width
        const y = camera.canvas.y + (1 - projected.y) / 2 * camera.canvas.height
        expect(x).toBeGreaterThan(camera.safe.x)
        expect(x).toBeLessThan(camera.safe.x + camera.safe.width)
        expect(y).toBeGreaterThanOrEqual(camera.safe.y)
        expect(y).toBeLessThan(camera.safe.y + camera.safe.height)
      }
      writeFileSync(`tools/captures/${prefix}-camera-${width}x${height}-${quality}.json`, JSON.stringify(camera, null, 2))
      await page.screenshot({ path: `e2e/__shots__/${prefix}-${width}x${height}-${quality}.png` })
      await page.keyboard.press('h')
      await page.waitForTimeout(700)
      await page.screenshot({ path: `e2e/__shots__/${prefix}-${width}x${height}-${quality}-mano-oculta.png` })
      if (width === 1920 && quality === 'high') {
        await page.getByRole('button', { name: /Modo foto/i }).click()
        const distant = await poseCamera(page, url, [0, 16, 20])
        expect(distant.position[2]).toBeCloseTo(20, 1)
        expect(distant.background).toBe(camera.background)
        await page.waitForTimeout(500)
        await page.screenshot({ path: `e2e/__shots__/${prefix}-foto-lejana.png` })
        const rotated = await poseCamera(page, url, [20, 12, 8])
        expect(rotated.position[0]).toBeCloseTo(20, 1)
        expect(rotated.background).toBe(camera.background)
        await page.waitForTimeout(500)
        await page.screenshot({ path: `e2e/__shots__/${prefix}-foto-orbita.png` })
      }
      if ((scenario === 'sanctuary' || scenario === 'fimbul' || scenario === 'shore') && width === 1920 && quality === 'high') {
        const reflection = await reflectionProbe(page, url, scenario === 'fimbul' ? 'fimbul-bank--1' : scenario === 'shore' ? 'shore-sea-arch' : 'sanctuary-stone-11')
        writeFileSync(`tools/captures/${prefix}-reflection.json`, JSON.stringify(reflection, null, 2))
        expect(reflection.width).toBe(512)
        expect(reflection.after - reflection.before).toBeGreaterThan(4)
        expect(reflection.restored).toBeLessThanOrEqual(reflection.before + 2)
      }
      expect(errors).toEqual([])
    })
  }
}
