import { useEffect, useMemo } from 'react'
import { CanvasTexture, NoColorSpace, PlaneGeometry } from 'three'

const cache = new Map<number, { mask: CanvasTexture; height: CanvasTexture }>()
function reliefMaps(seed: number) {
  const cached = cache.get(seed)
  if (cached) return cached
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo tallar el relieve del Tribunal.')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 256, 512)
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 3
  ctx.strokeRect(13, 12, 230, 488)
  ctx.lineWidth = 1.5
  ctx.strokeRect(20, 20, 216, 472)
  // Motivos originales del Tribunal: sol, balanza y papiro. No son una
  // inscripción tomada de un monumento ni una cadena de caracteres legibles.
  for (let row = 0; row < 6; row += 1) {
    const y = 45 + row * 75
    const motif = (row + seed) % 3
    ctx.beginPath()
    if (motif === 0) {
      ctx.arc(128, y + 20, 17, 0, Math.PI * 2)
      for (let ray = 0; ray < 8; ray += 1) {
        const a = ray / 8 * Math.PI * 2
        ctx.moveTo(128 + Math.cos(a) * 23, y + 20 + Math.sin(a) * 23)
        ctx.lineTo(128 + Math.cos(a) * 32, y + 20 + Math.sin(a) * 32)
      }
    } else if (motif === 1) {
      ctx.moveTo(128, y - 4); ctx.lineTo(128, y + 45)
      ctx.moveTo(78, y + 7); ctx.lineTo(178, y + 7)
      for (const x of [85, 171]) {
        ctx.moveTo(x, y + 7); ctx.lineTo(x - 17, y + 30)
        ctx.quadraticCurveTo(x, y + 49, x + 17, y + 30); ctx.lineTo(x, y + 7)
      }
      ctx.moveTo(111, y + 46); ctx.lineTo(145, y + 46)
    } else {
      for (const offset of [-23, 0, 23]) {
        ctx.moveTo(128, y + 47)
        ctx.quadraticCurveTo(128 + offset, y + 20, 128 + offset, y - 3)
        ctx.quadraticCurveTo(111 + offset, y + 4, 128 + offset, y + 17)
        ctx.quadraticCurveTo(145 + offset, y + 4, 128 + offset, y - 3)
      }
    }
    ctx.stroke()
  }
  const height = document.createElement('canvas')
  height.width = 256
  height.height = 512
  const relief = height.getContext('2d')
  if (!relief) throw new Error('No se pudo crear el surco de arenisca.')
  relief.fillStyle = '#fff'
  relief.fillRect(0, 0, 256, 512)
  relief.globalCompositeOperation = 'difference'
  relief.drawImage(canvas, 0, 0)
  const mask = new CanvasTexture(canvas)
  const bump = new CanvasTexture(height)
  mask.colorSpace = bump.colorSpace = NoColorSpace
  mask.anisotropy = bump.anisotropy = 4
  const result = { mask, height: bump }
  cache.set(seed, result)
  return result
}

/** El relieve sigue el talud del pilono; un cartel plano lo atravesaba al
 * subir y quedaba separado de la base. Todo el color lo aporta la luz. */
export function DunaRelief({ bodyHeight, depth, width = 1.65, height = 2.65, seed = 0 }: {
  readonly bodyHeight: number; readonly depth: number; readonly width?: number;
  readonly height?: number; readonly seed?: number
}) {
  const maps = reliefMaps(seed)
  const geometry = useMemo(() => {
    const panel = new PlaneGeometry(width, height, 1, 24)
    const vertices = panel.getAttribute('position')
    for (let index = 0; index < vertices.count; index += 1) {
      const y = vertices.getY(index) + height / 2 + 0.3
      const taper = 1 - y / bodyHeight * 0.18
      vertices.setXYZ(index, vertices.getX(index) * taper, y, depth / 2 * taper + 0.004)
    }
    panel.computeVertexNormals()
    return panel
  }, [bodyHeight, depth, width, height])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <mesh>
    <primitive object={geometry} attach="geometry" />
    <meshStandardMaterial alphaMap={maps.mask} bumpMap={maps.height} bumpScale={0.022}
      color="#987442" roughness={0.94} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
  </mesh>
}
