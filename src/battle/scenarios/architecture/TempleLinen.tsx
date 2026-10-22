import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { CanvasTexture, DoubleSide, PlaneGeometry, SRGBColorSpace } from 'three'
import type { Mesh } from 'three'
import type { GraphicsQuality } from '../../../store/preferences'
import { usePageVisibility } from '../../usePageVisibility'

let linen: CanvasTexture | undefined
function wovenLinen() {
  if (linen) return linen
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo tejer el lino del Tribunal.')
  ctx.fillStyle = '#ddd0ac'
  ctx.fillRect(0, 0, 128, 512)
  for (let y = 0; y < 512; y += 2) {
    ctx.fillStyle = y % 4 ? '#ffffff23' : '#6e5d3920'
    ctx.fillRect(0, y, 128, 1)
  }
  for (let x = 0; x < 128; x += 3) {
    ctx.fillStyle = '#82724822'
    ctx.fillRect(x, 0, 1, 512)
  }
  ctx.strokeStyle = '#345a78'
  ctx.lineWidth = 5
  ctx.strokeRect(7, 9, 114, 493)
  ctx.strokeStyle = '#b89a5d'
  ctx.lineWidth = 2
  ctx.strokeRect(15, 17, 98, 477)
  linen = new CanvasTexture(canvas)
  linen.colorSpace = SRGBColorSpace
  linen.anisotropy = 4
  return linen
}

export function TempleLinen({ quality, reducedMotion, phase = 0 }: {
  readonly quality: GraphicsQuality; readonly reducedMotion: boolean; readonly phase?: number
}) {
  const cloth = useRef<Mesh>(null)
  const visible = usePageVisibility()
  const lastWind = useRef(-Infinity)
  const geometry = useMemo(() => {
    const panel = new PlaneGeometry(0.52, 1.65, quality === 'low' ? 4 : 12, quality === 'low' ? 12 : 28)
    panel.translate(0, -0.825, 0)
    const vertices = panel.getAttribute('position')
    for (let index = 0; index < vertices.count; index += 1) {
      const fall = -vertices.getY(index) / 1.65
      vertices.setZ(index, Math.sin(vertices.getX(index) * 35) * 0.025 * Math.min(1, fall * 10) + fall * fall * 0.04)
    }
    panel.computeVertexNormals()
    return panel
  }, [quality])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame(() => {
    // El reloj de Fiber se reinicia al salir de un modal opaco. Un tiempo
    // monotónico impide que el lino espere a recuperar el valor anterior.
    const time = performance.now() / 1000
    if (!cloth.current || reducedMotion || !visible.current || time - lastWind.current < 1 / 12) return
    lastWind.current = time
    const vertices = geometry.getAttribute('position')
    for (let index = 0; index < vertices.count; index += 1) {
      const fall = -vertices.getY(index) / 1.65
      const fold = Math.sin(vertices.getX(index) * 35) * 0.025 * Math.min(1, fall * 10)
      vertices.setZ(index, fold + fall * fall * (0.04 + Math.sin(time * 0.9 + fall * 3 + phase) * 0.045))
    }
    vertices.needsUpdate = true
    geometry.computeVertexNormals()
  })
  return <mesh ref={cloth} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
    <primitive object={geometry} attach="geometry" />
    <meshStandardMaterial map={wovenLinen()} color="#fff7e3" side={DoubleSide} roughness={0.96} />
  </mesh>
}
