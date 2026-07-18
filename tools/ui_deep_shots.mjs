// Validación profunda de la pantalla de batalla: despliegue, selección,
// movimiento, inspector, movimiento reducido y calidades gráficas.
// Uso: node tools/ui_deep_shots.mjs  → PNG en tools/captures/deep/
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = process.env.SHOTS_BASE ?? 'http://localhost:4173'
const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, 'captures', 'deep')
mkdirSync(outDir, { recursive: true })

const prefs = (quality, reducedMotion) => JSON.stringify({
  state: {
    masterVolume: 0, musicVolume: 0, effectsVolume: 0, muted: true,
    reducedMotion, aiDelayMs: 300, selectedDeckId: 'furia-caldera',
    graphicsQuality: quality, scenario: 'aether-citadel', animationSpeed: 2,
  },
  version: 3,
})

const browser = await chromium.launch()

const newBattle = async (quality, reducedMotion) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.addInitScript((value) => localStorage.setItem('cronicas-nexo-preferences', value), prefs(quality, reducedMotion))
  await page.goto(`${base}/battle`)
  await page.getByRole('heading', { name: 'Tu mano inicial' }).waitFor({ timeout: 30000 })
  await page.getByRole('button', { name: 'Conservar las cinco' }).click()
  await page.waitForTimeout(1500)
  return { context, page }
}

const topScroll = (page) => page.evaluate(() => window.scrollTo(0, 0))

// ── Partida principal: despliegue, selección, movimiento, inspector ─────────
{
  const { context, page } = await newBattle('medium', false)

  // Localiza la etiqueta 3D de una pieza en el tablero y devuelve un punto
  // clicable sobre su carta (la etiqueta flota unos 44 px por encima).
  const boardLabelPoint = async (name) => {
    for (const label of await page.getByText(name, { exact: true }).all()) {
      const box = await label.boundingBox()
      if (box && box.y < 520) return { x: box.x + box.width / 2, y: box.y + box.height / 2 + 28 }
    }
    return undefined
  }

  // Jugar una fuente y desplegar el Sabueso (fila azul inferior del tablero).
  await page.getByRole('button', { name: /Fuente de Furia\. Esencia — Fuente\./ }).first().click()
  await page.waitForTimeout(900)
  const unit = page.getByRole('button', { name: /Sabueso de Brasa\. Unidad/ }).first()
  await unit.click()
  await topScroll(page)
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(outDir, 'deploy-targets.png') })
  const historyHas = (text) => page.locator('section', { hasText: 'Crónica de batalla' }).getByText(text).count()
  for (const [x, y] of [[720, 428], [652, 430], [788, 430], [858, 432]]) {
    await page.mouse.click(x, y)
    await page.waitForTimeout(700)
    if (await historyHas('entra en juego.')) break
  }
  const deployed = await historyHas('entra en juego.')
  console.log(deployed ? 'DEPLOY_OK' : 'DEPLOY_MISS (clics fuera de casilla válida)')
  await page.screenshot({ path: join(outDir, 'deployed.png') })

  // Impulso: el Sabueso puede moverse el turno en que entra. Selección + movimiento.
  if (deployed) {
    await topScroll(page)
    const point = await boardLabelPoint('Sabueso de Brasa')
    if (point) {
      await page.mouse.click(point.x, point.y)
      await page.waitForTimeout(500)
      await page.screenshot({ path: join(outDir, 'unit-selected.png') })
      const hinted = await page.getByText(/casilla azul|Casillas azules/i).count()
      console.log(hinted ? 'SELECT_OK' : 'SELECT_MISS')
      // Mover una fila hacia delante (≈34 px más arriba en pantalla).
      for (const dx of [0, -66, 66]) {
        await page.mouse.click(point.x + dx, point.y - 76)
        await page.waitForTimeout(800)
        if (await historyHas('cambia de posición.')) break
      }
      console.log((await historyHas('cambia de posición.')) ? 'MOVE_OK' : 'MOVE_MISS')
      await page.screenshot({ path: join(outDir, 'moved.png') })
    } else {
      console.log('SELECT_MISS (etiqueta 3D no encontrada)')
    }
  }

  // Turno rival: estados del botón y regreso del control en el turno 3.
  await page.getByRole('button', { name: 'Finalizar turno' }).click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: join(outDir, 'enemy-turn.png') })
  await page.getByText('Turno 3 · Principal').waitFor({ timeout: 30000 })
  await page.waitForTimeout(900)
  await topScroll(page)
  await page.screenshot({ path: join(outDir, 'turn3-ready.png') })
  console.log('TURN3_OK')

  // Inspector con clic derecho sobre una carta de la mano.
  await page.getByRole('button', { name: /\. (Esencia|Unidad|Hechizo)/ }).first().click({ button: 'right' })
  await page.waitForTimeout(500)
  if (await page.getByRole('dialog').count()) {
    console.log('INSPECT_OK')
    await page.screenshot({ path: join(outDir, 'inspector.png') })
    await page.keyboard.press('Escape')
  } else {
    console.log('INSPECT_MISS')
  }

  await context.close()
}

// ── Variantes: calidad baja + movimiento reducido, y calidad alta ───────────
{
  const { context, page } = await newBattle('low', true)
  await page.screenshot({ path: join(outDir, 'low-reduced.png') })
  await context.close()
  console.log('LOW_REDUCED_OK')
}
{
  const { context, page } = await newBattle('high', false)
  await page.screenshot({ path: join(outDir, 'high.png') })
  await context.close()
  console.log('HIGH_OK')
}

await browser.close()
console.log('DEEP_OK', outDir)
