import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { CanvasTexture, NoColorSpace, PlaneGeometry } from 'three'
import type { MeshStandardMaterial } from 'three'
import { usePageVisibility } from '../../usePageVisibility'
import { megalithFaceProfile } from './megalithGeometry'

const cache = new Map<number, { mask: CanvasTexture; relief: CanvasTexture }>()
function inscriptionMaps(seed: number) {
  const stored = cache.get(seed)
  if (stored) return stored
  const mask = document.createElement('canvas')
  mask.width = 128
  mask.height = 512
  const context = mask.getContext('2d')
  if (!context) throw new Error('No se pudo grabar la piedra del Santuario.')
  context.fillStyle = '#000'
  context.fillRect(0, 0, 128, 512)
  context.strokeStyle = '#d7e9df'
  context.lineWidth = 2.6
  context.lineJoin = 'round'
  for (let row = 0; row < 4; row += 1) {
    const y = 40 + row * 116
    const side = (row + seed) % 2 === 0 ? 1 : -1
    context.beginPath()
    context.moveTo(64, y)
    context.lineTo(64, y + 65)
    context.moveTo(64, y + 12)
    context.lineTo(64 + side * 26, y + 30)
    context.lineTo(64 + side * 14, y + 43)
    context.moveTo(64, y + 40)
    context.lineTo(64 - side * 23, y + 25)
    if ((seed + row) % 3 === 0) {
      context.moveTo(46, y + 70)
      context.lineTo(64, y + 87)
      context.lineTo(82, y + 70)
    }
    context.stroke()
  }
  const height = document.createElement('canvas')
  height.width = 128
  height.height = 512
  const carving = height.getContext('2d')
  if (!carving) throw new Error('No se pudo generar el relieve de las runas.')
  carving.fillStyle = '#fff'
  carving.fillRect(0, 0, 128, 512)
  carving.globalCompositeOperation = 'difference'
  carving.drawImage(mask, 0, 0)
  const maskTexture = new CanvasTexture(mask)
  maskTexture.colorSpace = NoColorSpace
  const relief = new CanvasTexture(height)
  relief.colorSpace = NoColorSpace
  const result = { mask: maskTexture, relief }
  cache.set(seed, result)
  return result
}

/** Incrustación fina que sigue la cara de granito, con surco independiente.
 * El antiguo emisivo aplicado al bloque entero iluminaba incluso su espalda. */
export function RuneInscription({ width, height, depth, seed, pulse, reducedMotion }: {
  readonly width: number
  readonly height: number
  readonly depth: number
  readonly seed: number
  readonly pulse: { readonly current: number }
  readonly reducedMotion: boolean
}) {
  const material = useRef<MeshStandardMaterial>(null)
  const visible = usePageVisibility()
  const maps = inscriptionMaps(seed)
  const geometry = useMemo(() => {
    const face = new PlaneGeometry(width * 0.76, height * 0.68, 1, 24)
    const positions = face.getAttribute('position')
    for (let index = 0; index < positions.count; index += 1) {
      const y = positions.getY(index) + height / 2
      const t = y / height
      const { taper, driftX, driftZ } = megalithFaceProfile(t, width, depth, seed)
      positions.setXYZ(index, positions.getX(index) * taper + driftX, y, depth / 2 * taper + driftZ + 0.003)
    }
    face.computeVertexNormals()
    return face
  }, [width, height, depth, seed])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame(({ clock }) => {
    if (!visible.current || !material.current) return
    material.current.emissiveIntensity = 0.72 + (reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.5 + seed) * 0.07 + pulse.current * 0.5)
  })
  return <mesh>
    <primitive object={geometry} attach="geometry" />
    <meshStandardMaterial ref={material} alphaMap={maps.mask} emissiveMap={maps.mask}
      bumpMap={maps.relief} bumpScale={0.012} transparent depthWrite={false}
      color="#50665d" emissive="#73c3ad" emissiveIntensity={0.72} roughness={0.85}
      polygonOffset polygonOffsetFactor={-1} />
  </mesh>
}
