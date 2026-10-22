import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { DataTexture, LinearFilter, RepeatWrapping, RGBAFormat, SRGBColorSpace } from 'three'
import type { MeshStandardMaterial } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { GraphicsQuality } from '../../../store/preferences'
import { forgedMetalMaps } from '../../materials/forgedMetal'
import { usePageVisibility } from '../../usePageVisibility'

const rim = new RoundedBoxGeometry(0.11, 0.29, 10, 2, 0.025)
const tie = new RoundedBoxGeometry(0.78, 0.09, 0.18, 2, 0.02)
let pattern: DataTexture | undefined
function hotMetal() {
  if (pattern) return pattern
  const width = 64, height = 256, data = new Uint8Array(width * height * 4)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width * Math.PI * 2, v = y / height * Math.PI * 2
      const flow = Math.sin(v * 7 + Math.sin(u * 2) * 0.5) * 0.5 + 0.5
      const crust = Math.pow(0.5 + 0.5 * Math.sin(v * 13 - Math.cos(u * 3)), 12) * 0.24
      const i = (y * width + x) * 4
      data[i] = 235 + flow * 18 - crust * 45
      data[i + 1] = 113 + flow * 55 - crust * 55
      data[i + 2] = 29 + flow * 21 - crust * 22
      data[i + 3] = 255
    }
  }
  pattern = new DataTexture(data, width, height, RGBAFormat)
  pattern.colorSpace = SRGBColorSpace
  pattern.wrapS = pattern.wrapT = RepeatWrapping
  pattern.magFilter = pattern.minFilter = LinearFilter
  pattern.needsUpdate = true
  return pattern
}

/** Colada estrecha contenida por acero y travesaños:
 * la precisión del canal distingue este calor de la lava de la Caldera. */
export function MoltenRun({ quality, reducedMotion }: {
  readonly quality: GraphicsQuality; readonly reducedMotion: boolean
}) {
  const material = useRef<MeshStandardMaterial>(null)
  const visible = usePageVisibility()
  const texture = useMemo(() => {
    const result = hotMetal().clone()
    result.repeat.set(1, 3)
    result.needsUpdate = true
    return result
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  useFrame(({ clock }) => {
    if (!visible.current || !material.current?.map) return
    material.current.map.offset.y = reducedMotion ? 0 : clock.elapsedTime * 0.035
  })
  const iron = forgedMetalMaps('iron')
  return <group position={[5.65, -0.37, -0.5]}>
    {[-1, 1].map((side) => <mesh key={side} position={[side * 0.34, 0, 0]}
      castShadow={quality === 'high'} receiveShadow={quality !== 'low'}>
      <primitive object={rim} attach="geometry" />
      <meshStandardMaterial {...iron} color="#78796f" metalness={0.6} roughness={0.8} bumpScale={0.02} />
    </mesh>)}
    <mesh name="foundry-molten-run" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
      <planeGeometry args={[0.57, 9.8]} />
      <meshStandardMaterial ref={material} map={texture} emissiveMap={texture}
        color="#bda68b" emissive="#ffbc71" emissiveIntensity={0.8} metalness={0.1} roughness={0.6} />
    </mesh>
    {[-4.6, -2.3, 0, 2.3, 4.6].map((z) => <mesh key={z} position={[0, 0.12, z]} castShadow={quality !== 'low'}>
      <primitive object={tie} attach="geometry" />
      <meshStandardMaterial {...iron} color="#888a82" metalness={0.65} roughness={0.8} />
    </mesh>)}
    {quality !== 'low' && [-3, 0, 3].map((z) => <pointLight key={z} position={[0, 0.25, z]}
      color="#ffa349" intensity={0.75} distance={2.6} decay={2} />)}
  </group>
}
