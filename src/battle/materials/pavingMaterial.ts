import { CanvasTexture, NoColorSpace, RepeatWrapping, SRGBColorSpace } from 'three'
import { stoneMaps, type StoneFinish } from './stoneMaterial'

type PavingMaps = ReturnType<typeof stoneMaps>
const cache = new Map<StoneFinish, PavingMaps>()

/** El patio arquitectónico necesita juntas entre
 * bloques a escala mundial; ampliar solo el grano mineral parecía gravilla. */
export function pavingMaps(finish: StoneFinish): PavingMaps {
  const stored = cache.get(finish)
  if (stored) return stored
  const source = stoneMaps(finish)
  const make = (input: CanvasTexture, kind: 'color' | 'height' | 'roughness') => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 512
    const context = canvas.getContext('2d')
    if (!context) return input
    context.drawImage(input.image as HTMLCanvasElement, 0, 0, 512, 512)
    for (let row = 0; row < 4; row += 1) for (let column = -1; column < 3; column += 1) {
      const x = column * 256 + row % 2 * 128, y = row * 128
      if (kind === 'color') {
        const shade = Math.sin((column + 3) * 19.1 + row * 37.7)
        context.fillStyle = shade > 0 ? `rgba(255,255,255,${shade * 0.045})` : `rgba(20,24,20,${-shade * 0.055})`
        context.fillRect(x + 2, y + 2, 252, 124)
        context.strokeStyle = 'rgba(32,36,32,0.24)'
        context.lineWidth = 2
      } else {
        context.strokeStyle = kind === 'height' ? 'rgb(74,74,74)' : 'rgb(246,246,246)'
        context.lineWidth = 2.5
      }
      context.strokeRect(x + 1, y + 1, 254, 126)
    }
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = kind === 'color' ? SRGBColorSpace : NoColorSpace
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.anisotropy = 8
    return texture
  }
  const maps = { map: make(source.map, 'color'), bumpMap: make(source.bumpMap, 'height'),
    roughnessMap: make(source.roughnessMap, 'roughness') }
  cache.set(finish, maps)
  return maps
}
