import type { Page } from '@playwright/test'
import type { RootState } from '@react-three/fiber'
import type { Mesh, MeshStandardMaterial, ShaderMaterial, Texture, WebGLRenderTarget } from 'three'

export async function waterConfiguration(page: Page, moduleUrl: string) {
  return page.evaluate(async (url) => {
    const module = await import(url) as {
      _roots: ReadonlyMap<HTMLCanvasElement, { store: { getState: () => RootState } }>
    }
    const canvas = document.querySelector('[data-testid="battle-board"] canvas') as HTMLCanvasElement
    const state = module._roots.get(canvas)?.store.getState()
    if (!state) throw new Error('No hay agua para comprobar su calidad.')
    let result: { enabled: number; size: number; time: number } | undefined
    state.scene.traverse((object) => {
      const material = (object as Mesh).material as ShaderMaterial | undefined
      if (!material?.uniforms?.uHasReflection) return
      const texture = material.uniforms.uReflection?.value as Texture | undefined
      result = { enabled: Number(material.uniforms.uHasReflection.value), size: texture?.renderTarget?.width ?? 0,
        time: Number(material.uniforms.uTime?.value) }
    })
    if (!result) throw new Error('No se encontró el material de agua.')
    return result
  }, moduleUrl)
}

/** Cambiar una piedra real debe cambiar los píxeles del reflejo. Esta sonda
 * evita aceptar como reflejo una textura fija o una captura vacía. */
export async function reflectionProbe(page: Page, moduleUrl: string) {
  return page.evaluate(async (url) => {
    const module = await import(url) as {
      _roots: ReadonlyMap<HTMLCanvasElement, { store: { getState: () => RootState } }>
    }
    const canvas = document.querySelector('[data-testid="battle-board"] canvas') as HTMLCanvasElement
    const state = module._roots.get(canvas)?.store.getState()
    if (!state) throw new Error('No hay escenario para comprobar el reflejo.')
    let target: WebGLRenderTarget | undefined
    state.scene.traverse((object) => {
      const candidate = object as Mesh
      const material = candidate.material as ShaderMaterial | undefined
      const texture = material?.uniforms?.uReflection?.value as Texture | undefined
      if (texture?.renderTarget) target = texture.renderTarget as WebGLRenderTarget
    })
    if (!target) throw new Error('No se ha creado la captura planar del lago.')
    const stone = state.scene.getObjectByName('sanctuary-stone-11') as Mesh | undefined
    if (!stone) throw new Error('No se encontró la piedra que debe reflejarse.')
    const original = stone.material as MeshStandardMaterial
    const magenta = original.clone()
    const pixels = new Uint8Array(target.width * target.height * 4)
    const count = () => {
      state.gl.readRenderTargetPixels(target!, 0, 0, target!.width, target!.height, pixels)
      let matches = 0
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index]! > 90 && pixels[index + 2]! > 90 && pixels[index + 1]! < pixels[index]! * 0.4) matches += 1
      }
      return matches
    }
    const frames = async () => {
      for (let index = 0; index < 5; index += 1) {
        state.invalidate()
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      }
    }
    await frames()
    const before = count()
    let after: number
    try {
      magenta.color.set('#ff00ff')
      magenta.emissive.set('#ff00ff')
      magenta.emissiveIntensity = 5
      stone.material = magenta
      await frames()
      after = count()
    } finally {
      stone.material = original
      magenta.dispose()
      await frames()
    }
    return { before, after, restored: count(), width: target.width, height: target.height }
  }, moduleUrl)
}
