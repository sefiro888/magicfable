import { useEffect, useMemo } from 'react'
import { BufferGeometry, DoubleSide, Float32BufferAttribute } from 'three'
import type { GraphicsQuality } from '../../../store/preferences'
import { forestGroundHeight } from './ForestGround'

const hash = (seed: number) => {
  const raw = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return raw - Math.floor(raw)
}

/** Hojarasca con pliegue central, concentrada fuera del pavimento. La
 * geometría proyecta un canto fino y evita otro ruido plano sobre la tierra. */
export function LeafLitter({ quality }: { readonly quality: GraphicsQuality }) {
  const geometry = useMemo(() => {
    const count = quality === 'low' ? 90 : quality === 'medium' ? 180 : 280
    const positions: number[] = [], colors: number[] = [], indices: number[] = []
    for (let i = 0; i < count; i += 1) {
      const angle = hash(i * 7 + 1) * Math.PI * 2
      const radius = 4.8 + hash(i * 7 + 2) * 4.5
      const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius - 0.8
      if (Math.max(Math.abs(x), Math.abs(z)) < 4.3) continue
      const spin = hash(i * 7 + 3) * Math.PI * 2
      const size = 0.07 + hash(i * 7 + 4) * 0.11
      const y = forestGroundHeight(x, z) + 0.012
      const start = positions.length / 3
      const points = [[0, 0.018, 0], [-0.4, 0, -0.35], [0, 0.006, -1],
        [0.45, 0, -0.25], [0.38, 0.01, 0.5], [0, 0.01, 1], [-0.4, 0, 0.4]]
      for (const p of points) {
        positions.push(x + (p[0]! * Math.cos(spin) - p[2]! * Math.sin(spin)) * size,
          y + p[1]!, z + (p[0]! * Math.sin(spin) + p[2]! * Math.cos(spin)) * size)
        const age = hash(i * 7 + 5)
        colors.push(0.22 + age * 0.16, 0.12 + age * 0.09, 0.045 + age * 0.045)
      }
      for (let edge = 1; edge <= 6; edge += 1) indices.push(start, start + edge, start + edge % 6 + 1)
    }
    const result = new BufferGeometry()
    result.setAttribute('position', new Float32BufferAttribute(positions, 3))
    result.setAttribute('color', new Float32BufferAttribute(colors, 3))
    result.setIndex(indices)
    result.computeVertexNormals()
    return result
  }, [quality])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <mesh geometry={geometry} receiveShadow={quality !== 'low'}>
    <meshStandardMaterial vertexColors roughness={0.98} side={DoubleSide} />
  </mesh>
}
