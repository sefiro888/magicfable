import type { Page } from '@playwright/test'
import type { RootState } from '@react-three/fiber'

/** Usar el módulo optimizado que cargó la página evita consultar otro mapa
 * de raíces tras una recarga de Vite. Registrar la espera antes de goto. */
export async function fiberModuleUrl(page: Page): Promise<string> {
  const response = await page.waitForResponse((entry) => {
    const path = new URL(entry.url()).pathname
    return path.includes('/node_modules/.vite/deps/') && path.endsWith('/@react-three_fiber.js')
  }, { timeout: 25000 })
  return response.url()
}

export async function cameraSnapshot(page: Page, moduleUrl: string) {
  return page.evaluate(async (url) => {
    const module = await import(url) as {
      _roots: ReadonlyMap<HTMLCanvasElement, { store: { getState: () => RootState } }>
    }
    const safe = document.querySelector('[data-testid="battle-board"]')
    const canvas = safe?.querySelector('canvas')
    if (!safe || !canvas) throw new Error('No hay un tablero listo para medir la cámara.')
    const state = module._roots.get(canvas)?.store.getState()
    if (!state) throw new Error('La raíz de Three no pertenece al módulo observado.')
    state.camera.updateMatrixWorld()
    const rect = (element: Element) => {
      const { x, y, width, height } = element.getBoundingClientRect()
      return { x, y, width, height }
    }
    return {
      canvas: rect(canvas), safe: rect(safe), position: state.camera.position.toArray(),
      matrixWorld: [...state.camera.matrixWorld.elements],
      projection: [...state.camera.projectionMatrix.elements],
      rendering: { calls: state.gl.info.render.calls, triangles: state.gl.info.render.triangles,
        geometries: state.gl.info.memory.geometries, textures: state.gl.info.memory.textures },
    }
  }, moduleUrl)
}
