import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, Object3D } from 'three'
import type { BufferGeometry, InstancedMesh } from 'three'
import type { GraphicsQuality } from '../../../store/preferences'
import { archStoneGeometry, flutedColumnGeometry, masonryBlockGeometry } from './stoneGeometry'
import { stoneMaps, type StoneFinish } from '../../materials/stoneMaterial'

type Vector3Tuple = readonly [number, number, number]

export interface StoneBlock {
  readonly position: Vector3Tuple
  readonly size: Vector3Tuple
  readonly rotation?: Vector3Tuple
  readonly shade?: number
}

interface StoneInstance {
  readonly position: Vector3Tuple
  readonly rotation?: Vector3Tuple
  readonly shade?: number
}

interface FinishProps {
  readonly finish?: StoneFinish
  readonly color?: string
  readonly quality: GraphicsQuality
}

function StoneInstances({ geometry, instances, finish = 'marble', color = '#e8e4d9', quality }: FinishProps & {
  readonly geometry: BufferGeometry
  readonly instances: readonly StoneInstance[]
}) {
  const mesh = useRef<InstancedMesh>(null)
  const maps = stoneMaps(finish)
  useLayoutEffect(() => {
    const target = mesh.current
    if (!target) return
    const transform = new Object3D()
    const tint = new Color()
    instances.forEach((instance, index) => {
      transform.position.set(...instance.position)
      transform.rotation.set(...(instance.rotation ?? [0, 0, 0]))
      transform.updateMatrix()
      target.setMatrixAt(index, transform.matrix)
      const shade = instance.shade ?? 0.94 + (Math.sin(index * 13.7) + 1) * 0.035
      tint.setRGB(shade, shade, shade)
      target.setColorAt(index, tint)
    })
    target.instanceMatrix.needsUpdate = true
    if (target.instanceColor) target.instanceColor.needsUpdate = true
    target.computeBoundingSphere()
  }, [instances])
  return <instancedMesh ref={mesh} args={[undefined, undefined, instances.length]}
    castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
    {/* Los bloques cacheados sobreviven al cambio de escenario. `primitive`
        evita destruir una geometría todavía compartida por otro arco. */}
    <primitive attach="geometry" object={geometry} />
    <meshStandardMaterial {...maps} color={color} vertexColors roughness={finish === 'marble' ? 0.79 : 1}
      bumpScale={finish === 'marble' ? 0.012 : 0.028} metalness={0.025} />
  </instancedMesh>
}

/** Una llamada de dibujo por tamaño de sillar, en vez de una por ladrillo.
 * Se conserva el bisel físico: no se deforma escalando cada instancia. */
export function StoneMasonry({ blocks, ...finish }: FinishProps & { readonly blocks: readonly StoneBlock[] }) {
  const batches = useMemo(() => {
    const groups = new Map<string, { size: Vector3Tuple; instances: StoneInstance[] }>()
    blocks.forEach((block) => {
      const key = block.size.join(':')
      let group = groups.get(key)
      if (!group) { group = { size: block.size, instances: [] }; groups.set(key, group) }
      group.instances.push(block)
    })
    return [...groups.entries()]
  }, [blocks])
  return <>{batches.map(([key, batch]) => <StoneInstances key={key} {...finish}
    geometry={masonryBlockGeometry(...batch.size, finish.quality === 'low' ? 1 : 2)} instances={batch.instances} />)}</>
}

export function StoneColumns({ radius, height, positions, broken = false, ...finish }: FinishProps & {
  readonly radius: number
  readonly height: number
  readonly positions: readonly Vector3Tuple[]
  readonly broken?: boolean
}) {
  const instances = useMemo(() => positions.map((position) => ({ position })), [positions])
  return <StoneInstances {...finish} geometry={flutedColumnGeometry(radius, height, broken)} instances={instances} />
}

/** El origen del arco es la línea de arranque: las dovelas forman la parte
 * superior del vano; los apoyos deben continuar hasta su cimentación real. */
export function StoneVault({ radius, thickness, depth, segments = 13, ...finish }: FinishProps & {
  readonly radius: number
  readonly thickness: number
  readonly depth: number
  readonly segments?: number
}) {
  const instances = useMemo<readonly StoneInstance[]>(() => Array.from({ length: segments }, (_, index) => ({
    position: [0, 0, 0], rotation: [0, 0, -Math.PI / 2 + Math.PI / segments * (index + 0.5)],
  })), [segments])
  return <StoneInstances {...finish} geometry={archStoneGeometry(radius, thickness, depth, segments)} instances={instances} />
}
