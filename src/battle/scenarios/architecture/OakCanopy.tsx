import { useLayoutEffect, useMemo, useRef } from 'react'
import { BufferGeometry, Color, DoubleSide, Float32BufferAttribute, Object3D } from 'three'
import type { InstancedMesh } from 'three'
import type { GraphicsQuality } from '../../../store/preferences'

let leaf: BufferGeometry | undefined
function oakLeaf() {
  if (leaf) return leaf
  const positions: number[] = [0, 0.025, 0]
  const outline = [[0, -0.26], [0.045, -0.15], [0.085, -0.17], [0.065, -0.07], [0.12, -0.04],
    [0.08, 0.035], [0.115, 0.09], [0.05, 0.16], [0, 0.25], [-0.05, 0.16],
    [-0.115, 0.09], [-0.08, 0.035], [-0.12, -0.04], [-0.065, -0.07], [-0.085, -0.17], [-0.045, -0.15]]
  outline.forEach(([x, z]) => positions.push(x!, -Math.abs(x!) * 0.12, z!))
  const indices = outline.flatMap((_, index) => [0, index + 1, (index + 1) % outline.length + 1])
  leaf = new BufferGeometry()
  leaf.setAttribute('position', new Float32BufferAttribute(positions, 3))
  leaf.setIndex(indices)
  leaf.computeVertexNormals()
  return leaf
}

const noise = (seed: number) => {
  const raw = Math.sin(seed * 127.1 + 13.7) * 43758.5453
  return raw - Math.floor(raw)
}

/** Hojas lobuladas individuales en una sola llamada. El follaje sigue las
 * tres ramas de copa; sustituirlo por esferas daba un árbol de juguete. */
export function OakCanopy({ quality }: { readonly quality: GraphicsQuality }) {
  const mesh = useRef<InstancedMesh>(null)
  const count = quality === 'low' ? 700 : quality === 'medium' ? 1400 : 2400
  const transform = useMemo(() => new Object3D(), [])
  useLayoutEffect(() => {
    const target = mesh.current
    if (!target) return
    const tint = new Color()
    for (let i = 0; i < count; i += 1) {
      const cluster = i % 3
      const cx = cluster === 0 ? -2.2 : cluster === 1 ? 2.3 : 0
      const cy = cluster === 0 ? 6.5 : cluster === 1 ? 7.2 : 8
      const angle = noise(i * 5 + 1) * Math.PI * 2
      const radius = Math.sqrt(noise(i * 5 + 2))
      transform.position.set(cx + Math.cos(angle) * radius * 2.3,
        cy + (noise(i * 5 + 3) - 0.5) * 1.7 + (1 - radius) * 0.6,
        Math.sin(angle) * radius * 2.3 - 7.6)
      transform.rotation.set((noise(i * 5 + 4) - 0.5) * 1.7, angle, (noise(i * 5 + 5) - 0.5) * 0.7)
      transform.scale.setScalar(0.8 + noise(i * 7) * 0.7)
      transform.updateMatrix()
      target.setMatrixAt(i, transform.matrix)
      tint.setHSL(0.2 + noise(i * 9) * 0.05, 0.27 + noise(i * 11) * 0.12, 0.22 + noise(i * 13) * 0.12)
      target.setColorAt(i, tint)
    }
    target.instanceMatrix.needsUpdate = true
    if (target.instanceColor) target.instanceColor.needsUpdate = true
    target.computeBoundingSphere()
  }, [count, transform])
  return <instancedMesh ref={mesh} args={[undefined, undefined, count]}
    castShadow={quality === 'high'} receiveShadow={quality !== 'low'}>
    <primitive object={oakLeaf()} attach="geometry" />
    <meshStandardMaterial color="#e5e2cb" roughness={0.94} side={DoubleSide} />
  </instancedMesh>
}
