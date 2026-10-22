import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, DoubleSide, Object3D } from 'three'
import type { InstancedMesh } from 'three'
import type { GraphicsQuality } from '../../../store/preferences'
import { usePageVisibility } from '../../usePageVisibility'
import { fernGeometry } from './fernGeometry'
import { forestGroundHeight } from './ForestGround'

/** Los macizos comparten una malla: cientos de
 * foliolos no deben convertirse en cientos de objetos React ni draw calls. */
export function FernUnderstory({ quality, reducedMotion }: {
  readonly quality: GraphicsQuality; readonly reducedMotion: boolean
}) {
  const mesh = useRef<InstancedMesh>(null)
  const visible = usePageVisibility()
  const lastWind = useRef(-Infinity)
  const transform = useMemo(() => new Object3D(), [])
  const plants = useMemo(() => {
    const count = quality === 'low' ? 9 : quality === 'medium' ? 17 : 25
    return Array.from({ length: count }, (_, index) => {
      const side = index % 2 ? 1 : -1
      const step = Math.floor(index / 2)
      return { x: side * (4.8 + (Math.sin(index * 7.3) + 1) * 1.1),
        z: -5.5 + step / (count / 2) * 9 + Math.sin(index * 4.1) * 0.9,
        scale: 0.35 + (Math.sin(index * 13.7) + 1) * 0.23, rotation: index * 2.39996 }
    })
  }, [quality])
  useLayoutEffect(() => {
    const target = mesh.current
    if (!target) return
    const tint = new Color()
    plants.forEach((plant, index) => {
      transform.position.set(plant.x, forestGroundHeight(plant.x, plant.z) + 0.015, plant.z)
      transform.rotation.set(0, plant.rotation, 0)
      transform.scale.setScalar(plant.scale)
      transform.updateMatrix()
      target.setMatrixAt(index, transform.matrix)
      const shade = 0.87 + (Math.sin(index * 5.3) + 1) * 0.075
      tint.setRGB(shade, shade, shade * 0.94)
      target.setColorAt(index, tint)
    })
    target.instanceMatrix.needsUpdate = true
    if (target.instanceColor) target.instanceColor.needsUpdate = true
    target.computeBoundingSphere()
  }, [plants, transform])
  useFrame(() => {
    const now = performance.now() / 1000
    if (quality === 'low' || reducedMotion || !visible.current || !mesh.current || now - lastWind.current < 1 / 12) return
    lastWind.current = now
    plants.forEach((plant, index) => {
      transform.position.set(plant.x, forestGroundHeight(plant.x, plant.z) + 0.015, plant.z)
      transform.rotation.set(Math.sin(now * 0.8 + index * 1.7) * 0.018, plant.rotation,
        Math.sin(now * 0.63 + index) * 0.026)
      transform.scale.setScalar(plant.scale)
      transform.updateMatrix()
      mesh.current!.setMatrixAt(index, transform.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh name="grove-ferns" ref={mesh} args={[undefined, undefined, plants.length]}
    castShadow={quality === 'high'} receiveShadow={quality !== 'low'}>
    <primitive object={fernGeometry(quality === 'low')} attach="geometry" />
    <meshStandardMaterial color="#a5b295" vertexColors roughness={0.94} side={DoubleSide} />
  </instancedMesh>
}
