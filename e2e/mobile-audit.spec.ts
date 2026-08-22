import { test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Auditoría de móvil: fotografía cada pantalla en los DOS tamaños que se usan
 * para revisarla (375x812, el iPhone pequeño, y 390x844, el tamaño más común)
 * y mide de paso lo que no se ve en una captura: desbordes horizontales y
 * objetivos táctiles por debajo del pulgar.
 *
 *   RUN_SHOTS=1 npx playwright test e2e/mobile-audit.spec.ts
 *
 * Fuera del gate: informa, no falla. Lo que se encuentre aquí se convierte en
 * una prueba de verdad en `mobile.spec.ts`.
 */
test.skip(!process.env.RUN_SHOTS, 'solo bajo demanda con RUN_SHOTS=1')

/**
 * Táctil de verdad, no solo una ventana estrecha.
 *
 * `setViewportSize` cambia el tamaño pero deja el puntero fino, así que todas
 * las reglas `@media (hover: none) and (pointer: coarse)` del proyecto —que
 * son unas cuantas— quedaban sin comprobar: la auditoría medía una pantalla
 * pequeña con ratón, que no es lo que usa nadie.
 */
test.use({ hasTouch: true, isMobile: true })

const TAMANOS = [
  { nombre: '375', width: 375, height: 812 },
  { nombre: '390', width: 390, height: 844 },
] as const

const PANTALLAS = [
  ['portada', '/'],
  ['jugar', '/play'],
  ['torre', '/tower'],
  ['galeria', '/gallery'],
  ['mazos', '/decks'],
  ['multijugador', '/multiplayer'],
  ['ajustes', '/settings'],
] as const

/** Lo que hay que poder pulsar cómodamente con el pulgar. */
const OBJETIVO_MINIMO = 40

/**
 * Mide desborde horizontal y controles demasiado pequeños.
 *
 * Ojo al leer la lista: se mide la caja del elemento, y varios controles
 * amplían su zona táctil con un `::before` de `inset` negativo que aquí no se
 * ve. Antes de tocar nada hay que mirar el CSS del candidato.
 */
const medir = async (page: Page, etiqueta: string) => {
  const informe = await page.evaluate((minimo) => {
    const desborde = document.documentElement.scrollWidth - document.documentElement.clientWidth
    const pequenos: string[] = []
    for (const nodo of document.querySelectorAll('button, a, select, input, [role="button"]')) {
      const caja = nodo.getBoundingClientRect()
      if (caja.width === 0 || caja.height === 0) continue
      if (caja.width >= minimo && caja.height >= minimo) continue
      const texto = (nodo.textContent ?? '').trim().slice(0, 24) || nodo.getAttribute('aria-label') || nodo.tagName
      pequenos.push(`${texto} ${Math.round(caja.width)}x${Math.round(caja.height)}`)
    }
    return { desborde, pequenos }
  }, OBJETIVO_MINIMO)
  console.log(`AUDIT ${etiqueta} desborde=${informe.desborde}px pequenos=${informe.pequenos.length}`)
  for (const item of informe.pequenos.slice(0, 12)) console.log(`   · ${item}`)
}

for (const tamano of TAMANOS) {
  for (const [nombre, ruta] of PANTALLAS) {
    test(`móvil ${tamano.nombre} ${nombre}`, async ({ page }) => {
      test.setTimeout(90_000)
      await page.setViewportSize({ width: tamano.width, height: tamano.height })
      await page.goto(ruta)
      await page.waitForTimeout(1400)
      await page.screenshot({ path: `e2e/__shots__/movil${tamano.nombre}-${nombre}.png`, fullPage: true })
      await medir(page, `${tamano.nombre} ${nombre}`)
    })
  }

  test(`móvil ${tamano.nombre} batalla`, async ({ page }) => {
    test.setTimeout(120_000)
    await page.addInitScript(() => localStorage.setItem('cronicas-nexo-howto-visto', '1'))
    await page.setViewportSize({ width: tamano.width, height: tamano.height })
    await page.goto('/battle?seed=1311657807')
    await page.getByRole('button', { name: /Conservar las cinco/i }).click()
    await page.getByRole('button', { name: /Saltar guía/i }).click({ timeout: 4000 }).catch(() => {})
    await page.waitForTimeout(3000)
    await page.screenshot({ path: `e2e/__shots__/movil${tamano.nombre}-batalla.png` })
    await medir(page, `${tamano.nombre} batalla`)
  })
}
