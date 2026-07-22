// Verificación móvil: mide el desborde horizontal real y captura cada página a 375x812.
// Uso: node tools/mobile_check.mjs  (requiere el dev server en marcha)
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = process.env.SHOTS_BASE ?? 'http://localhost:4173'
const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, 'captures', 'mobile')
mkdirSync(outDir, { recursive: true })

const prefs = JSON.stringify({
  state: {
    masterVolume: 0, musicVolume: 0, effectsVolume: 0, muted: true,
    reducedMotion: false, aiDelayMs: 520, aiDifficulty: 'normal', selectedDeckId: 'furia-caldera',
    graphicsQuality: 'low', scenario: 'aether-citadel', animationSpeed: 1,
  },
  version: 4,
})

const routes = ['/', '/play', '/gallery', '/decks', '/battle']

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true })
const page = await context.newPage()
await page.addInitScript((value) => {
  localStorage.setItem('cronicas-nexo-preferences', value)
  localStorage.setItem('cronicas-nexo-howto-visto', '1')
}, prefs)

let failures = 0
for (const route of routes) {
  await page.goto(`${base}${route}`)
  if (route === '/battle') {
    await page.getByRole('heading', { name: 'Tu mano inicial' }).waitFor({ timeout: 30000 })
    await page.getByRole('button', { name: 'Conservar las cinco' }).click()
    await page.waitForTimeout(2500)
  } else {
    await page.waitForTimeout(1200)
  }
  const { overflow, viewport } = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    viewport: document.documentElement.clientWidth,
  }))
  const name = route === '/' ? 'home' : route.slice(1)
  await page.screenshot({ path: join(outDir, `${name}-375.png`) })
  const status = overflow > 4 ? 'DESBORDE' : 'OK'
  if (overflow > 4) failures += 1
  console.log(`${status.padEnd(9)} ${route.padEnd(10)} viewport=${viewport} desborde=${overflow}px`)
}

await browser.close()
console.log(failures === 0 ? 'MOBILE_OK todas las páginas sin desborde' : `MOBILE_FAIL ${failures} página(s) con desborde`)
process.exit(failures === 0 ? 0 : 1)
