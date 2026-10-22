import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import type { InstancedMesh, MeshStandardMaterial, PointLight } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { AnimationEvent } from '../../../game'
import type { GraphicsQuality } from '../../../store/preferences'
import { forgedMetalMaps } from '../../materials/forgedMetal'
import { kilnBrickMaps } from '../../materials/kilnBrick'
import { usePageVisibility } from '../../usePageVisibility'
import { useBattleStrain } from '../BattleClimate'
import { furnaceArchStone, furnaceBodyGeometry } from './foundryGeometry'

const clamp = new RoundedBoxGeometry(4.95, 0.15, 0.15, 2, 0.025)
const chimneyWall = new RoundedBoxGeometry(0.75, 1.05, 0.16, 2, 0.025)

function CoalBed({ quality }: { readonly quality: GraphicsQuality }) {
  const coal = useRef<InstancedMesh>(null)
  const transform = useMemo(() => new Object3D(), [])
  const count = quality === 'low' ? 28 : 56
  useLayoutEffect(() => {
    if (!coal.current) return
    for (let i = 0; i < count; i += 1) {
      const x = Math.sin(i * 127.1) * 0.74
      const z = Math.cos(i * 43.7) * 0.57
      transform.position.set(x, 0.03 + (1 - Math.abs(x)) * 0.08 + Math.sin(i * 3.7) * 0.025, z)
      transform.rotation.set(i * 1.7, i * 2.39996, i * 0.7)
      transform.scale.set(0.08 + (i % 3) * 0.025, 0.06 + (i % 4) * 0.016, 0.08 + (i % 5) * 0.018)
      transform.updateMatrix()
      coal.current.setMatrixAt(i, transform.matrix)
    }
    coal.current.instanceMatrix.needsUpdate = true
    coal.current.computeBoundingSphere()
  }, [count, transform])
  return <instancedMesh ref={coal} args={[undefined, undefined, count]} receiveShadow={quality !== 'low'}>
    <icosahedronGeometry args={[1, 1]} />
    <meshStandardMaterial color="#2f241d" emissive="#7c2608" emissiveIntensity={0.3} roughness={0.96} />
  </instancedMesh>
}

/** Dovelas, mortero y abrazaderas sostienen un hogar
 * profundo de carbón: el calor está construido y contenido, no es una grieta
 * volcánica. La chimenea conserva su boca hueca desde el modo foto. */
export function GuildFurnace({ quality, reducedMotion, event }: {
  readonly quality: GraphicsQuality; readonly reducedMotion: boolean; readonly event?: AnimationEvent
}) {
  const strain = useBattleStrain()
  const baseLight = 5.5 + strain * 2.5, baseFire = 1.2 + strain * 0.45
  const visible = usePageVisibility()
  const light = useRef<PointLight>(null), fire = useRef<MeshStandardMaterial>(null)
  const surge = useRef(0)
  const brick = kilnBrickMaps(), iron = forgedMetalMaps('iron')
  useEffect(() => {
    if (event?.type === 'nexus-damage' || event?.type === 'victory') surge.current = 1
  }, [event])
  useFrame(({ clock }, delta) => {
    if (!visible.current) return
    surge.current = Math.max(0, surge.current - delta * 0.65)
    const breath = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.9) * 0.25 + surge.current * 1.5
    if (light.current) light.current.intensity = baseLight + breath
    if (fire.current) fire.current.emissiveIntensity = baseFire + breath * 0.15
  })
  return <group position={[0, -0.3, -6.9]}>
    <mesh name="foundry-furnace-body" castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
      <primitive object={furnaceBodyGeometry()} attach="geometry" />
      <meshStandardMaterial {...brick} color="#b6b2a6" bumpScale={0.04} roughness={0.96} />
    </mesh>
    {Array.from({ length: 11 }, (_, i) => <mesh key={i} castShadow={quality !== 'low'} receiveShadow={quality !== 'low'}>
      <primitive object={furnaceArchStone(i)} attach="geometry" />
      <meshStandardMaterial {...brick} color={i % 3 ? '#beb5a2' : '#aaa18f'} bumpScale={0.025} roughness={0.94} />
    </mesh>)}
    {[0.2, 2.6].map((y) => <group key={y} position={[0, y, 0.97]}>
      <mesh castShadow={quality !== 'low'}>
        <primitive object={clamp} attach="geometry" />
        <meshStandardMaterial {...iron} color="#8c8e87" metalness={0.65} roughness={0.84} bumpScale={0.02} />
      </mesh>
      {[-2.24, -1.7, -1.18, 1.18, 1.7, 2.24].map((x) => <mesh key={x} position={[x, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.045, 6]} />
        <meshStandardMaterial {...iron} color="#ada99c" metalness={0.7} roughness={0.73} />
      </mesh>)}
    </group>)}
    <mesh position={[0, 0.91, -0.78]}>
      <planeGeometry args={[1.9, 2.03]} />
      <meshBasicMaterial color="#18110c" />
    </mesh>
    <mesh name="foundry-fire-bed" position={[0, -0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.66, 1.4]} />
      <meshStandardMaterial ref={fire} color="#a94610" emissive="#ff6b18" emissiveIntensity={baseFire} roughness={1} />
    </mesh>
    <CoalBed quality={quality} />
    <pointLight name="foundry-fire-light" ref={light} position={[0, 0.7, 0.65]} intensity={baseLight} distance={5} color="#ffac59" decay={2} />
    <group position={[1.25, 3.05, -0.25]}>
      {[-1, 1].map((side) => <mesh key={side} position={[0, 0.3, side * 0.31]} castShadow={quality !== 'low'}>
        <primitive object={chimneyWall} attach="geometry" />
        <meshStandardMaterial {...brick} color="#858178" bumpScale={0.025} roughness={0.98} />
      </mesh>)}
      {[-1, 1].map((side) => <mesh key={side} position={[side * 0.31, 0.3, 0]} rotation={[0, Math.PI / 2, 0]} castShadow={quality !== 'low'}>
        <primitive object={chimneyWall} attach="geometry" />
        <meshStandardMaterial {...brick} color="#858178" bumpScale={0.025} roughness={0.98} />
      </mesh>)}
    </group>
  </group>
}
