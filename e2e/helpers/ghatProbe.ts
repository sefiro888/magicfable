import type { Page } from '@playwright/test'
import type { RootState } from '@react-three/fiber'

export async function ghatProbe(page: Page, moduleUrl: string) {
  return page.evaluate(async (url) => {
    const module = await import(url) as {
      _roots: ReadonlyMap<HTMLCanvasElement, { store: { getState: () => RootState } }>
    }
    const canvas = document.querySelector('[data-testid="battle-board"] canvas') as HTMLCanvasElement | null
    const state = canvas ? module._roots.get(canvas)?.store.getState() : undefined
    const lamps = state?.scene.getObjectByName('ghat-floating-lamps')
    if (!lamps?.children.length) throw new Error('Faltan las lámparas de la corriente')
    return lamps.children.map((lamp) => [...lamp.position.toArray(), lamp.rotation.y,
      lamp.getObjectByName('ghat-lamp-flame')?.scale.x ?? 0])
  }, moduleUrl)
}
