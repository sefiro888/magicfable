import type { Page } from '@playwright/test'

/** Tras editar el store, Vite sirve su versión con ?t=… . Importar la ruta
 * desnuda creaba otro Zustand: la sonda modificaba una partida invisible. */
export async function matchStoreUrl(page: Page): Promise<string> {
  const response = await page.waitForResponse((entry) => new URL(entry.url()).pathname.endsWith('/src/store/match.ts'), { timeout: 25000 })
  return response.url()
}
