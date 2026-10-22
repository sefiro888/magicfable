import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { CanvasTexture, DoubleSide, PlaneGeometry, SRGBColorSpace } from 'three'
import type { Mesh } from 'three'
import { usePageVisibility } from '../../usePageVisibility'

const linens = new Map<number, CanvasTexture>()
function linenTexture(side: -1 | 1) {
  const stored = linens.get(side)
  if (stored) return stored
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 512
  const context = canvas.getContext('2d')!
  context.fillStyle = side < 0 ? '#315a73' : '#77384c'
  context.fillRect(0, 0, 256, 512)
  for (let y = 0; y < 512; y += 2) {
    context.fillStyle = y % 4 ? '#a99c7b25' : '#ffffff30'
    context.fillRect(0, y, 256, 1)
  }
  for (let x = 0; x < 256; x += 3) {
    context.fillStyle = '#71623f20'
    context.fillRect(x, 0, 1, 512)
  }
  context.strokeStyle = '#ddc48b'
  context.lineWidth = 7
  context.strokeRect(15, 15, 226, 481)
  context.lineWidth = 2
  context.strokeRect(25, 25, 206, 461)
  // Bordado original de la Ciudadela: sol de doce radios y ramas de laurel.
  // No contiene letras ni una marca ajena al juego.
  context.translate(128, 224)
  context.lineWidth = 5
  context.beginPath()
  context.arc(0, 0, 31, 0, Math.PI * 2)
  context.stroke()
  context.lineWidth = 3
  for (let index = 0; index < 12; index += 1) {
    const angle = index / 12 * Math.PI * 2
    context.beginPath()
    context.moveTo(Math.cos(angle) * 41, Math.sin(angle) * 41)
    context.lineTo(Math.cos(angle) * 61, Math.sin(angle) * 61)
    context.stroke()
  }
  context.fillStyle = '#ddc48b'
  for (const side of [-1, 1]) {
    for (let index = 0; index < 7; index += 1) {
      const angle = side * (0.35 + index * 0.2) + Math.PI / 2
      const x = Math.cos(angle) * 77
      const y = Math.sin(angle) * 77
      context.beginPath()
      context.ellipse(x, y, 4, 11, -angle, 0, Math.PI * 2)
      context.fill()
    }
  }
  const linen = new CanvasTexture(canvas)
  linen.colorSpace = SRGBColorSpace
  linen.anisotropy = 4
  linens.set(side, linen)
  return linen
}

export function CitadelBanner({ side, reducedMotion }: { readonly side: -1 | 1; readonly reducedMotion: boolean }) {
  const cloth = useRef<Mesh>(null)
  const visible = usePageVisibility()
  const geometry = useMemo(() => {
    const shape = new PlaneGeometry(0.82, 1.4, 24, 28)
    shape.translate(0, -0.7, 0)
    const vertices = shape.getAttribute('position')
    for (let index = 0; index < vertices.count; index += 1) {
      const x = vertices.getX(index)
      const y = vertices.getY(index)
      const fall = -y / 1.4
      const fold = Math.sin((x / 0.82 + 0.5) * Math.PI * 8) * 0.045 * Math.min(1, fall * 10)
      vertices.setZ(index, fold + fall * fall * 0.035)
    }
    shape.computeVertexNormals()
    return shape
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame(({ clock }) => {
    if (!cloth.current || reducedMotion || !visible.current) return
    const vertices = geometry.getAttribute('position')
    for (let index = 0; index < vertices.count; index += 1) {
      const x = vertices.getX(index)
      const fall = -vertices.getY(index) / 1.4
      const fold = Math.sin((x / 0.82 + 0.5) * Math.PI * 8) * 0.045 * Math.min(1, fall * 10)
      vertices.setZ(index, fold + fall * fall * (0.035 + Math.sin(clock.elapsedTime * 1.2 + fall * 4 + side) * 0.045))
    }
    vertices.needsUpdate = true
  })
  return <group position={[side * 5.22, 2.2, -1.72]}>
    <mesh position={[0, 0.02, -0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.025, 0.025, 1.03, 12]} />
      <meshStandardMaterial color="#997c46" roughness={0.5} metalness={0.7} />
    </mesh>
    <mesh ref={cloth} castShadow receiveShadow>
      <primitive attach="geometry" object={geometry} />
      <meshStandardMaterial map={linenTexture(side)} color="#ffffff"
        roughness={0.92} metalness={0} side={DoubleSide} />
    </mesh>
  </group>
}
