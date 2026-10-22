import type { Page } from '@playwright/test'
import type { RootState } from '@react-three/fiber'

/** Se gira el grupo táctico real
 * como hace la vista del invitado, sin simular otra cámara o fondo aislado. */
export async function setPanoramaGuest(page: Page, moduleUrl: string, guest: boolean) {
  await page.evaluate(async ({ url, guest }) => {
    const module = await import(url) as {
      _roots: ReadonlyMap<HTMLCanvasElement, { store: { getState: () => RootState } }>
    }
    const canvas = document.querySelector('[data-testid="battle-board"] canvas') as HTMLCanvasElement | null
    const state = canvas ? module._roots.get(canvas)?.store.getState() : undefined
    const panorama = state?.scene.getObjectByName('scenario-distant-vista')
    const view = state?.scene.getObjectByName('battle-view')
    if (!state || !panorama || !view) throw new Error('Falta el paisaje o el grupo táctico')
    view.rotation.y = guest ? Math.PI : 0
    view.updateMatrixWorld(true)
    state.invalidate()
  }, { url: moduleUrl, guest })
  await page.waitForTimeout(150)
  return panoramaOffset(page, moduleUrl)
}

export async function panoramaOffset(page: Page, moduleUrl: string) {
  return page.evaluate(async (url) => {
    const module = await import(url) as {
      _roots: ReadonlyMap<HTMLCanvasElement, { store: { getState: () => RootState } }>
    }
    const canvas = document.querySelector('[data-testid="battle-board"] canvas') as HTMLCanvasElement | null
    const state = canvas ? module._roots.get(canvas)?.store.getState() : undefined
    const panorama = state?.scene.getObjectByName('scenario-distant-vista')
    if (!state || !panorama) throw new Error('No está listo el paisaje')
    const center = panorama.getWorldPosition(panorama.position.clone())
    const camera = state.camera.getWorldPosition(panorama.position.clone())
    const stage = state.scene.getObjectByName('scenario-stage')
    const view = state.scene.getObjectByName('battle-view')
    if (!stage || !view) throw new Error('Faltan los grupos de escenario y contenido táctico')
    return { distance: center.distanceTo(camera), center: center.toArray(), camera: camera.toArray(),
      stagePoint: stage.localToWorld(panorama.position.clone().set(3, 0, 2)).toArray(),
      boardPoint: view.localToWorld(panorama.position.clone().set(3, 0, 2)).toArray() }
  }, moduleUrl)
}
