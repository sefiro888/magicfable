import type { Page } from '@playwright/test'
import type { RootState } from '@react-three/fiber'
import type { Mesh, MeshStandardMaterial } from 'three'

export async function foundryProbe(page: Page, moduleUrl: string) {
  return page.evaluate(async (url) => {
    const module = await import(url) as {
      _roots: ReadonlyMap<HTMLCanvasElement, { store: { getState: () => RootState } }>
    }
    const canvas = document.querySelector('[data-testid="battle-board"] canvas') as HTMLCanvasElement | null
    const state = canvas ? module._roots.get(canvas)?.store.getState() : undefined
    if (!state) throw new Error('No está listo el Gremio')
    const drive = state.scene.getObjectByName('foundry-drive-gear') as Mesh | undefined
    const driven = state.scene.getObjectByName('foundry-driven-gear') as Mesh | undefined
    const run = state.scene.getObjectByName('foundry-molten-run') as Mesh | undefined
    const material = run?.material as MeshStandardMaterial | undefined
    if (!drive || !driven || !material?.map) throw new Error('Falta la transmisión o la colada')
    return { drive: drive.rotation.z, driven: driven.rotation.z, flow: material.map.offset.y }
  }, moduleUrl)
}
