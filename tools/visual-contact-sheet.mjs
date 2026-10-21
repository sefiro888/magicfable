// Revisión de capturas a escala real: recorta el foco mediante CSS para
// comparar facciones sin que una miniatura del tablero esconda los defectos.
import { chromium } from '@playwright/test'
import { readdirSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const prefix = process.argv[2] ?? 'ritual-'
const captureX = Number(process.argv[3] ?? 780)
const captureY = Number(process.argv[4] ?? 385)
const files = readdirSync('e2e/__shots__').filter((name) => name.startsWith(prefix) && name.endsWith('.png')).sort()
if (files.length === 0) throw new Error('No hay capturas para esa revisión.')
const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: Math.ceil(files.length / 4) * 224 + 55 }, deviceScaleFactor: 1 })
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#11151c;color:#dbc9a1;font:14px Georgia,serif}
    h1{font-size:20px;margin:16px}main{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px}
    figure{margin:0;border:1px solid #51452f}figcaption{padding:6px;background:#1a2029}
    .crop{height:184px;overflow:hidden;position:relative}.crop img{position:absolute;max-width:none;left:-${captureX}px;top:-${captureY}px}
    </style><h1>Revisión visual · ${escapeHtml(prefix)}</h1><main>${files.map((name) => `<figure><figcaption>${escapeHtml(name.replace('.png', ''))}</figcaption><div class="crop"><img src="http://127.0.0.1:4173/e2e/__shots__/${encodeURIComponent(name)}"></div></figure>`).join('')}</main>`)
  await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0))
  mkdirSync('tools/captures', { recursive: true })
  const output = resolve('tools/captures', `${prefix.replace(/[^a-z0-9-]/gi, '')}review.png`)
  await page.screenshot({ path: output, fullPage: true })
  console.log(output)
} finally {
  await browser.close()
}
