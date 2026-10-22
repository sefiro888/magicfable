import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Bone, Color, Object3D, OctahedronGeometry, Quaternion, Skeleton } from 'three'
import type { InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight, SkinnedMesh } from 'three'
import { rubbleGrainTexture } from './textures'
import { createNexusRubble } from './nexusRubble'

const RUBBLE = createNexusRubble()
const crystalGeometry = new OctahedronGeometry(0.07).scale(1, 1.8, 1)
const IDENTITY = new Quaternion()

/** La rotura conserva volumen. Los cortes claros dejan ver el interior de la
 * piedra y los bloques apoyan sobre su cara más baja, incluso al tumbarse. */
export function NexusRupture({ durationMs, tone, stoneColors, reducedMotion }: {
  readonly durationMs: number
  readonly tone: string
  readonly stoneColors: readonly [string, string, string]
  readonly reducedMotion: boolean
}) {
  const rubble = useRef<SkinnedMesh>(null)
  const cuts = useRef<MeshStandardMaterial>(null)
  const crystals = useRef<InstancedMesh>(null)
  const crystalMaterial = useRef<MeshStandardMaterial>(null)
  const ring = useRef<Mesh>(null)
  const light = useRef<PointLight>(null)
  const startedAt = useRef<number | null>(null)
  const settled = useRef(false)
  const transform = useMemo(() => new Object3D(), [])
  const rig = useMemo(() => {
    const root = new Bone()
    const bones = RUBBLE.chunks.map((chunk) => {
      const bone = new Bone()
      bone.position.copy(chunk.centre)
      root.add(bone)
      return bone
    })
    return { root, bones, skeleton: new Skeleton([root, ...bones]) }
  }, [])
  const stoneMap = rubbleGrainTexture()
  const dustedColors = stoneColors.map((color) => new Color(color).lerp(new Color('#aaa69e'), 0.5))
  useLayoutEffect(() => {
    const mesh = rubble.current
    if (!mesh) return
    mesh.add(rig.root)
    mesh.updateMatrixWorld(true)
    mesh.bind(rig.skeleton)
    return () => { mesh.remove(rig.root); rig.skeleton.dispose() }
  }, [rig])
  useFrame(() => {
    if (settled.current) return
    if (startedAt.current === null) startedAt.current = performance.now()
    const progress = reducedMotion ? 1 : Math.min(1, (performance.now() - startedAt.current) / Math.max(1, durationMs))
    const burst = 1 - Math.pow(1 - Math.max(0, (progress - 0.08) / 0.92), 3)
    const pulse = Math.sin(Math.PI * Math.min(1, progress * 2))
    for (const [index, chunk] of RUBBLE.chunks.entries()) {
      const bone = rig.bones[index]!
      bone.position.lerpVectors(chunk.centre, chunk.destination, burst)
      bone.position.setY(bone.position.y + Math.sin(progress * Math.PI) * chunk.kick)
      bone.quaternion.slerpQuaternions(IDENTITY, chunk.rotation, burst)
    }
    if (cuts.current) cuts.current.emissiveIntensity = pulse * 0.65
    if (crystals.current) {
      for (let index = 0; index < 8; index += 1) {
        const angle = index * Math.PI / 4
        const reach = 0.66 + burst * (0.35 + index % 3 * 0.06)
        transform.position.set(Math.cos(angle) * reach, Math.max(0.09, 0.56 + progress * 0.8 - progress * progress * 1.15), Math.sin(angle) * reach)
        transform.rotation.set(progress * (index % 2 ? 2 : -2), angle, burst * 0.9)
        transform.scale.setScalar(1 - burst * 0.45)
        transform.updateMatrix()
        crystals.current.setMatrixAt(index, transform.matrix)
      }
      crystals.current.instanceMatrix.needsUpdate = true
    }
    if (crystalMaterial.current) crystalMaterial.current.emissiveIntensity = pulse * 2 + 0.025
    if (light.current) light.current.intensity = pulse * 10
    if (ring.current) {
      ring.current.visible = progress < 1
      ring.current.scale.setScalar(0.4 + progress * 2.8)
      ;(ring.current.material as MeshBasicMaterial).opacity = (1 - progress) * pulse * 0.7
    }
    settled.current = progress >= 1
  })
  return <group>
    <skinnedMesh ref={rubble} frustumCulled={false} castShadow receiveShadow>
      <primitive object={RUBBLE.geometry} attach="geometry" />
      {dustedColors.map((color, index) => <meshStandardMaterial key={index} attach={`material-${index}`}
        map={stoneMap} bumpMap={stoneMap} bumpScale={0.018} color={color} roughness={0.95} metalness={0} />)}
      <meshStandardMaterial attach="material-3" ref={cuts} map={stoneMap} bumpMap={stoneMap} bumpScale={0.025}
        color="#b3ada2" roughness={0.98} emissive={tone} emissiveIntensity={0} />
    </skinnedMesh>
    <instancedMesh ref={crystals} args={[undefined, undefined, 8]} frustumCulled={false} castShadow>
      <primitive object={crystalGeometry} attach="geometry" />
      <meshStandardMaterial ref={crystalMaterial} color={tone} roughness={0.32} metalness={0.15} emissive={tone} emissiveIntensity={0} />
    </instancedMesh>
    <mesh ref={ring} position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.56, 0.59, 48]} />
      <meshBasicMaterial color={tone} transparent opacity={0} depthWrite={false} />
    </mesh>
    <pointLight ref={light} position={[0, 0.5, 0]} color={tone} intensity={0} distance={4} decay={2} />
  </group>
}
