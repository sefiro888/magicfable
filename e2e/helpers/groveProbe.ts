import type { Page } from '@playwright/test'
import type { RootState } from '@react-three/fiber'
import type { InstancedMesh, SpotLight } from 'three'

export async function groveProbe(page: Page, moduleUrl: string) {
  return page.evaluate(async (url) => {
    const module = await import(url) as {
      _roots: ReadonlyMap<HTMLCanvasElement, { store: { getState: () => RootState } }>
    }
    const canvas = document.querySelector('[data-testid="battle-board"] canvas') as HTMLCanvasElement | null
    const state = canvas ? module._roots.get(canvas)?.store.getState() : undefined
    if (!state) throw new Error('No está lista la escena para comprobar el bosque')
    const ferns = state.scene.getObjectByName('grove-ferns') as InstancedMesh | undefined
    const sun = state.scene.getObjectByName('grove-filtered-sun') as SpotLight | undefined
    if (!ferns) throw new Error('No se encontró la vegetación del claro')
    const image = sun?.map?.image as { width?: number } | undefined
    return { matrix: Array.from(ferns.instanceMatrix.array.slice(0, 16)),
      filteredLight: image?.width ?? 0, count: ferns.count }
  }, moduleUrl)
}
