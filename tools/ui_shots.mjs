// Capturas de la pantalla de batalla en varias resoluciones.
// Uso: node shots.mjs <etiqueta>  → guarda PNG en ./captures/<etiqueta>/
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const label = process.argv[2] ?? 'before'
const base = process.env.SHOTS_BASE ?? 'http://localhost:4173'
const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, 'captures', label)
mkdirSync(outDir, { recursive: true })

const sizes = [
  [1920, 1080],
  [1440, 900],
  [1366, 768],
]

const prefs = JSON.stringify({
  state: {
    masterVolume: 0, musicVolume: 0, effectsVolume: 0, muted: true,
    reducedMotion: false, aiDelayMs: 520, selectedDeckId: 'furia-caldera',
    graphicsQuality: 'medium', scenario: 'aether-citadel', animationSpeed: 1,
  },
  version: 3,
})

const browser = await chromium.launch()
for (const [w, h] of sizes) {
  const context = await browser.newContext({ viewport: { width: w, height: h } })
  const page = await context.newPage()
  await page.addInitScript((value) => localStorage.setItem('cronicas-nexo-preferences', value), prefs)
  await page.goto(`${base}/battle`)
  // Mulligan
  await page.getByRole('heading', { name: 'Tu mano inicial' }).waitFor({ timeout: 30000 })
  await page.screenshot({ path: join(outDir, `mulligan-${w}x${h}.png`) })
  await page.getByRole('button', { name: 'Conservar las cinco' }).click()
  await page.waitForTimeout(2500)
  await page.screenshot({ path: join(outDir, `battle-${w}x${h}.png`) })
  // Jugar una fuente y seleccionar una carta de la mano para ver estados
  const fuente = page.getByRole('button', { name: /Fuente de Furia\. Esencia — Fuente\./ }).first()
  if (await fuente.count()) {
    await fuente.click()
    await page.waitForTimeout(1200)
  }
  const unidad = page.getByRole('button', { name: /Sabueso de Brasa|Lancera de Magma|Berserker/ }).first()
  if (await unidad.count()) {
    await unidad.click()
    await page.waitForTimeout(700)
  }
  await page.screenshot({ path: join(outDir, `selection-${w}x${h}.png`) })
  await context.close()
}
await browser.close()
console.log('CAPTURES_OK', outDir)
